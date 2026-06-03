    (function () {
      'use strict';

      /* ---- Smooth Scroll (Lenis) ---- */
      let lenis;
      try {
        if (typeof Lenis !== 'undefined') {
          lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
          });
          window.lenis = lenis;

          function raf(time) {
            if (lenis) {
              lenis.raf(time);
              requestAnimationFrame(raf);
            }
          }
          requestAnimationFrame(raf);
        }
      } catch (e) {
        console.error("Lenis smooth scroll failed to initialize:", e);
        lenis = null;
      }

      /* ---- Scrollytelling Animation Engine ---- */
      function tickScrollAnimations(scrolled) {
        if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
          // If reduced motion is preferred, clear styling so everything remains visible and layout-correct
          const heroContent = document.querySelector('.hero .container');
          if (heroContent) {
            heroContent.style.opacity = '';
            heroContent.style.transform = '';
          }
          document.querySelectorAll('.companies-grid .company-card').forEach(function (card) {
            card.style.opacity = '';
            card.style.transform = '';
          });
          const visionLeft = document.querySelector('.vision-left');
          if (visionLeft) {
            visionLeft.style.transform = '';
            visionLeft.style.opacity = '';
          }
          document.querySelectorAll('.vision-list .vision-item').forEach(function (item) {
            item.style.transform = '';
            item.style.opacity = '';
          });
          return;
        }

        // 1. Hero Parallax & Fade
        const heroContent = document.querySelector('.hero .container');
        if (heroContent) {
          const heroHeight = heroContent.offsetHeight || 600;
          const progress = Math.min(scrolled / heroHeight, 1);
          heroContent.style.opacity = (1 - progress * 1.3).toFixed(3);
          heroContent.style.transform = 'translateY(' + (scrolled * 0.35).toFixed(1) + 'px) scale(' + (1 - progress * 0.04).toFixed(3) + ')';
        }

        // 2. Companies Cards Tilt & Slide
        const cards = document.querySelectorAll('.companies-grid .company-card');
        const triggerPoint = window.innerHeight * 0.9;
        cards.forEach(function (card) {
          if (card.matches(':hover')) {
            card.style.transform = '';
            card.style.opacity = '';
            return;
          }
          const rect = card.getBoundingClientRect();
          const distance = triggerPoint - rect.top;
          const range = window.innerHeight * 0.45;
          const progress = Math.max(0, Math.min(distance / range, 1));
          const eased = progress * progress * (3 - 2 * progress); // cubic ease-in-out

          card.style.opacity = eased.toFixed(3);
          const translateY = (45 * (1 - eased)).toFixed(1);
          const scale = (0.93 + eased * 0.07).toFixed(3);
          const rotateX = (12 * (1 - eased)).toFixed(1);
          card.style.transform = 'translateY(' + translateY + 'px) scale(' + scale + ') rotateX(' + rotateX + 'deg)';
          card.style.transformOrigin = 'center bottom';
        });

        // 3. Vision Items Parallax
        const visionLeft = document.querySelector('.vision-left');
        const visionItems = document.querySelectorAll('.vision-list .vision-item');

        if (visionLeft) {
          const rect = visionLeft.getBoundingClientRect();
          const distance = window.innerHeight * 0.95 - rect.top;
          const progress = Math.max(0, Math.min(distance / (window.innerHeight * 0.45), 1));
          const eased = progress * progress;
          visionLeft.style.transform = 'translateX(' + (-40 * (1 - eased)).toFixed(1) + 'px)';
          visionLeft.style.opacity = eased.toFixed(3);
        }

        visionItems.forEach(function (item) {
          const rect = item.getBoundingClientRect();
          const distance = window.innerHeight * 0.95 - rect.top;
          const progress = Math.max(0, Math.min(distance / (window.innerHeight * 0.45), 1));
          const eased = progress * progress * (3 - 2 * progress);
          item.style.transform = 'translateX(' + (40 * (1 - eased)).toFixed(1) + 'px)';
          item.style.opacity = eased.toFixed(3);
        });
      }

      // Bind scrollytelling listeners
      if (lenis) {
        lenis.on('scroll', function (e) {
          tickScrollAnimations(e.scroll);
        });
      } else {
        window.addEventListener('scroll', function () {
          tickScrollAnimations(window.scrollY);
        }, { passive: true });
      }

      // Initialize positions immediately on load
      requestAnimationFrame(function () {
        tickScrollAnimations(window.scrollY);
      });

      /* ---- Real-Time Rendering Canvas Animation ---- */
      const canvas = document.getElementById('heroCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let nodes = [];
        let packets = [];
        let mouse = { x: -1000, y: -1000, active: false };
        let scrollSpeed = 0;
        let lastScrollY = window.scrollY;

        // Resize Canvas to fit the hero container perfectly
        function resizeCanvas() {
          const hero = document.querySelector('.hero');
          if (hero) {
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
            initNodes();
          }
        }

        // Track Mouse relative to the hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
          heroSection.addEventListener('mousemove', function (e) {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
          });
          heroSection.addEventListener('mouseleave', function () {
            mouse.active = false;
          });
        }

        // Initialize Nodes representing the 6 platforms (coordinated around the center)
        const companyColors = [
          '45, 52%, 54%',   // Gold (SS Marketing)
          '172, 45%, 32%',  // Blue-Green (Migrova)
          '115, 27%, 23%',  // Green (TrustHire)
          '180, 60%, 31%',  // Teal (Sehat)
          '45, 52%, 54%',   // Gold (Rozgar)
          '264, 52%, 46%'   // Purple (Studio)
        ];
        
        const companyNames = ['SS Marketing', 'Migrova', 'TrustHire', 'Sehat', 'Rozgar', 'Grevoo Studio'];

        function initNodes() {
          if (width === 0 || height === 0) return;
          nodes = [];
          const count = 6;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            // Distribute in an ellipse
            const radiusX = Math.min(width * 0.32, 380);
            const radiusY = Math.min(height * 0.25, 180);
            nodes.push({
              id: i,
              name: companyNames[i],
              baseX: width / 2 + Math.cos(angle) * radiusX,
              baseY: height * 0.45 + Math.sin(angle) * radiusY,
              x: width / 2 + Math.cos(angle) * radiusX,
              y: height * 0.45 + Math.sin(angle) * radiusY,
              color: companyColors[i],
              size: 4 + Math.random() * 3,
              pulse: 0,
              angle: Math.random() * Math.PI * 2,
              speed: 0.006 + Math.random() * 0.008
            });
          }
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Spawn a packet moving between nodes
        function spawnPacket(fromNode, toNode) {
          packets.push({
            from: fromNode,
            to: toNode,
            progress: 0,
            speed: 0.006 + Math.random() * 0.01,
            color: fromNode.color
          });
        }

        let lastSpawn = 0;

        function animateCanvas(time) {
          if (!width || !height) {
            requestAnimationFrame(animateCanvas);
            return;
          }

          ctx.clearRect(0, 0, width, height);

          // Calculate scroll velocity
          const currentScrollY = window.scrollY;
          const deltaY = Math.abs(currentScrollY - lastScrollY);
          scrollSpeed += (deltaY - scrollSpeed) * 0.15;
          lastScrollY = currentScrollY;
          scrollSpeed *= 0.94; // Decelerate

          // Spawn new packet
          if (time - lastSpawn > Math.max(350 - scrollSpeed * 12, 60)) {
            if (nodes.length > 1) {
              const fromIdx = Math.floor(Math.random() * nodes.length);
              let toIdx = Math.floor(Math.random() * nodes.length);
              while (toIdx === fromIdx) {
                toIdx = Math.floor(Math.random() * nodes.length);
              }
              spawnPacket(nodes[fromIdx], nodes[toIdx]);
            }
            lastSpawn = time;
          }

          // Update & Draw Nodes
          nodes.forEach(function (node) {
            node.angle += node.speed;
            const floatX = Math.cos(node.angle) * 10;
            const floatY = Math.sin(node.angle * 1.3) * 6;

            let targetX = node.baseX + floatX;
            let targetY = node.baseY + floatY;

            // Apply gravity pull towards cursor
            if (mouse.active) {
              const dx = mouse.x - targetX;
              const dy = mouse.y - targetY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 220) {
                const force = (220 - dist) / 220;
                targetX += dx * force * 0.12;
                targetY += dy * force * 0.12;
              }
            }

            node.x += (targetX - node.x) * 0.08;
            node.y += (targetY - node.y) * 0.08;

            node.pulse = Math.max(0, node.pulse - 0.04);

            // Connect nearby nodes
            nodes.forEach(function (other) {
              if (node.id >= other.id) return;
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < width * 0.5) {
                const alpha = (1 - dist / (width * 0.5)) * 0.12 * (1 + scrollSpeed * 0.04);
                ctx.strokeStyle = 'hsla(45, 15%, 50%, ' + alpha.toFixed(3) + ')';
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            });

            // Radial gradient glow around node
            const glowSize = node.size * (4 + node.pulse * 2.5);
            const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
            glowGrad.addColorStop(0, 'hsla(' + node.color + ', 0.18)');
            glowGrad.addColorStop(0.4, 'hsla(' + node.color + ', 0.05)');
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Core dot
            ctx.fillStyle = 'hsla(' + node.color + ', 0.8)';
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();

            // Core center point
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Update & Draw Packets
          for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            const currentSpeed = p.speed * (1 + scrollSpeed * 0.05);
            p.progress += currentSpeed;

            if (p.progress >= 1) {
              p.to.pulse = 1.0; // Trigger pulse on completion
              packets.splice(i, 1);
              continue;
            }

            const fromX = p.from.x;
            const fromY = p.from.y;
            const toX = p.to.x;
            const toY = p.to.y;

            // Curved trajectory
            const dx = toX - fromX;
            const dy = toY - fromY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / dist;
            const perpY = dx / dist;
            const curve = Math.sin(p.progress * Math.PI) * (dist * 0.07);

            const px = fromX + dx * p.progress + perpX * curve;
            const py = fromY + dy * p.progress + perpY * curve;

            // Render fading trailing tail particles
            const tailLength = 6;
            for (let j = 0; j < tailLength; j++) {
              const tailProgress = Math.max(0, p.progress - j * 0.025);
              const tpx = fromX + dx * tailProgress + perpX * Math.sin(tailProgress * Math.PI) * (dist * 0.07);
              const tpy = fromY + dy * tailProgress + perpY * Math.sin(tailProgress * Math.PI) * (dist * 0.07);
              const size = (1 - j / tailLength) * 1.8;
              const alpha = (1 - j / tailLength) * 0.5;
              ctx.fillStyle = 'hsla(' + p.color + ', ' + alpha.toFixed(3) + ')';
              ctx.beginPath();
              ctx.arc(tpx, tpy, size, 0, Math.PI * 2);
              ctx.fill();
            }

            // Packet glowing head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }

          requestAnimationFrame(animateCanvas);
        }

        // Delay starting the canvas slightly for clean initialization
        setTimeout(function () {
          requestAnimationFrame(animateCanvas);
        }, 150);
      }



      /* ---- Nav Scroll Shrink ---- */
      const nav = document.getElementById('nav');
      window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });

      /* ---- Mobile Nav Toggle ---- */
      const navToggle = document.getElementById('navToggle');
      const navLinks = document.getElementById('navLinks');
      navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navToggle.classList.remove('active');
          navLinks.classList.remove('open');
        });
      });

      /* ---- Scroll Reveal ---- */
      const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });

      /* Trigger above-fold hero reveals with stagger */
      requestAnimationFrame(function () {
        document.querySelectorAll('.hero .reveal').forEach(function (el, i) {
          setTimeout(function () { el.classList.add('visible'); }, 80 + i * 100);
        });
      });

      /* ---- WhatsApp Float ---- */
      const whatsappFloat = document.getElementById('whatsappFloat');
      setTimeout(function () { whatsappFloat.classList.add('visible'); }, 1200);
      window.addEventListener('scroll', function () {
        whatsappFloat.style.opacity = window.scrollY > 300 ? '1' : '';
      }, { passive: true });

      /* ---- Subtle Hero Parallax ---- */
      const heroGlow = document.querySelector('.hero-glow');
      if (heroGlow && window.matchMedia('(pointer: fine)').matches) {
        if (lenis) {
          lenis.on('scroll', function (e) {
            const y = e.scroll * 0.15;
            heroGlow.style.transform = 'translateY(' + y + 'px)';
          });
        } else {
          window.addEventListener('scroll', function () {
            const y = window.scrollY * 0.15;
            heroGlow.style.transform = 'translateY(' + y + 'px)';
          }, { passive: true });
        }
      }

      /* ---- Active Nav Link ---- */
      const sections = document.querySelectorAll('section[id]');
      const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
      window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(function (section) {
          if (window.scrollY >= section.offsetTop - 120) {
            current = section.getAttribute('id');
          }
        });
        navAnchors.forEach(function (a) {
          a.style.color = a.getAttribute('href') === '#' + current ? 'var(--color-primary)' : '';
        });
      }, { passive: true });

      /* ---- Counter Animation ---- */
      function animateCounter(el, target, duration) {
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        }
        requestAnimationFrame(update);
      }

      const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('[data-count]');
            counters.forEach(function (counter, i) {
              const target = parseInt(counter.getAttribute('data-count'), 10);
              setTimeout(function () {
                animateCounter(counter, target, 2000);
              }, i * 150);
            });
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      document.querySelectorAll('.hero-stats, .numbers-grid').forEach(function (section) {
        counterObserver.observe(section);
      });

            /* ---- Project Modal ---- */
      const projects = {
        ssmarketing: {
          icon: String.fromCodePoint(0x1F4F8),
          iconClass: 'gold',
          iconBg: 'rgba(201,168,76,0.15)',
          title: 'SS Marketing Agency',
          tagline: 'AI-powered digital marketing for Gujarat businesses',
          desc: 'SS Marketing Agency helps local businesses grow their online presence without hiring a full marketing team. From content creation to social media management - everything runs through one AI-powered platform.',
          features: [
            'AI-generated posts, reels, and ad copy tailored to your brand',
            'Social media scheduling across Instagram, Facebook, and WhatsApp',
            'Professional photo and video content production',
            'Monthly performance reports and growth analytics',
            'Dedicated strategy for Gujarat SMEs and local brands'
          ],
          audience: '<strong>Ideal for:</strong> Shop owners, clinics, restaurants, startups, and local brands in Gujarat who want professional marketing without agency costs.',
          url: 'https://ss-marketing-agency.vercel.app/'
        },
        migrova: {
          icon: String.fromCodePoint(0x2708, 0xFE0F),
          iconClass: 'blue-green',
          iconBg: 'rgba(45,120,110,0.15)',
          title: 'Migrova',
          tagline: "India's AI-powered visa and immigration platform",
          desc: 'Migrova simplifies the entire immigration journey - from checking visa eligibility to tracking your application. Connect with verified consultants and stay informed at every step.',
          features: [
            'AI visa eligibility checker for multiple countries',
            'Verified immigration consultants on one platform',
            'Real-time application and document tracking',
            'Personalized document checklist and deadline reminders',
            'Transparent pricing with no hidden agent fees'
          ],
          audience: '<strong>Ideal for:</strong> Students, professionals, and families planning to study, work, or settle abroad.',
          url: 'https://migrova-pi.vercel.app/'
        },
        trusthire: {
          icon: String.fromCodePoint(0x2705),
          iconClass: 'green',
          iconBg: 'rgba(45,74,42,0.12)',
          title: 'TrustHire',
          tagline: 'Background verification at Rs. 99 per check',
          desc: 'TrustHire makes employee verification affordable and fast for Indian small businesses. Hire with confidence knowing every worker has been properly verified.',
          features: [
            'Identity, address, and criminal record verification',
            'Flat Rs. 99 pricing per background check',
            'Digital reports delivered within 48 hours',
            'Bulk verification for teams and seasonal hiring',
            'Simple dashboard to manage all employee records'
          ],
          audience: '<strong>Ideal for:</strong> SMEs, factories, retail shops, security firms, and any business hiring domestic or contract workers.',
          url: 'https://trust-hire-plum.vercel.app/'
        },
        sehat: {
          icon: String.fromCodePoint(0x1F3E5),
          iconClass: 'teal',
          iconBg: 'rgba(32,128,128,0.12)',
          title: 'Sehat',
          tagline: 'Digital health records for every Indian family',
          desc: 'Sehat gives every family a secure, lifelong health record - prescriptions, lab reports, vaccination history, and doctor visits stored in one place, accessible anytime.',
          features: [
            'Unified health profile for every family member',
            'Upload and store prescriptions, reports, and scans',
            'Share records with doctors via secure link',
            'Emergency medical history accessible offline',
            'Appointment and medication reminders'
          ],
          audience: '<strong>Ideal for:</strong> Families, elderly parents, chronic patients, and anyone who wants their medical history organized and accessible.',
          url: 'https://sehat-rho.vercel.app'
        },
        rozgar: {
          icon: String.fromCodePoint(0x1F4BC),
          iconClass: 'gold',
          iconBg: 'rgba(201,168,76,0.15)',
          title: 'Rozgar',
          tagline: "India's hiring operating system",
          desc: 'Rozgar connects skilled workers with employers across India - from village to city. Verified profiles, local language support, and a hiring process built for Bharat.',
          features: [
            'Worker profiles with verified skills and experience',
            'Employer job posting and candidate matching',
            'Covers blue-collar, gig, and semi-skilled roles',
            'Local language interface for wider reach',
            'Integration with TrustHire for verified hiring'
          ],
          audience: '<strong>Ideal for:</strong> Workers seeking jobs, contractors, factories, shops, and businesses hiring across tier-2 and tier-3 cities.',
          url: 'https://rozgar.grevoo.co.in'
        },
        studio: {
          icon: String.fromCodePoint(0x1F4BB),
          iconClass: 'purple',
          iconBg: 'rgba(106, 57, 179, 0.15)',
          title: 'Grevoo Studio',
          tagline: 'Premium design and development studio',
          desc: 'Grevoo Studio designs and builds premium, high-performance websites, custom web applications, and e-commerce platforms that help brands scale and stand out.',
          features: [
            'Premium UI/UX design tailored to your brand identity',
            'Lightning-fast, SEO-optimized web development',
            'Full-stack custom web applications and SaaS products',
            'Secure and scalable e-commerce store integration',
            'Dedicated technical support and maintenance'
          ],
          audience: '<strong>Ideal for:</strong> Startups, brands, and businesses looking to build a high-converting, professional, and unique online presence.',
          url: 'https://grevoo-studio.vercel.app/'
        }
      };
      const modal = document.getElementById('projectModal');
      const modalClose = document.getElementById('modalClose');
      const modalCloseBtn = document.getElementById('modalCloseBtn');

      function openModal(id) {
        const p = projects[id];
        if (!p) return;
        document.getElementById('modalIcon').textContent = p.icon;
        document.getElementById('modalIcon').style.background = p.iconBg;
        document.getElementById('modalTitle').textContent = p.title;
        document.getElementById('modalTagline').textContent = p.tagline;
        document.getElementById('modalDesc').textContent = p.desc;
        document.getElementById('modalAudience').innerHTML = p.audience;
        document.getElementById('modalVisit').href = p.url;
        const featuresEl = document.getElementById('modalFeatures');
        featuresEl.innerHTML = '';
        p.features.forEach(function (f) {
          const li = document.createElement('li');
          li.textContent = f;
          featuresEl.appendChild(li);
        });
        modal.classList.add('open');
        document.documentElement.classList.add('modal-active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-active');
      }

      function closeModal() {
        modal.classList.remove('open');
        document.documentElement.classList.remove('modal-active');
        document.body.style.overflow = '';
        document.body.classList.remove('modal-active');
      }

      document.querySelectorAll('.company-card[data-company]').forEach(function (card) {
        card.addEventListener('click', function () {
          openModal(card.getAttribute('data-company'));
        });
      });

      document.querySelectorAll('.vision-item').forEach(function (item, i) {
        const ids = ['migrova', 'trusthire', 'sehat', 'rozgar', 'ssmarketing', 'studio'];
        item.style.cursor = 'pointer';
        item.addEventListener('click', function () { openModal(ids[i]); });
      });

      modalClose.addEventListener('click', closeModal);
      modalCloseBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
      });

      /* ---- Language Switcher (UI only) ---- */
      document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.lang-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        });
      });

      /* ---- Smooth scroll offset for fixed nav ---- */
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (href === '#') return;
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 88;
            try {
              if (lenis) {
                lenis.scrollTo(target, { offset: -offset, duration: 1.2 });
              } else {
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
              }
            } catch (err) {
              console.warn("Lenis scrollTo failed, falling back to native scroll:", err);
              const top = target.getBoundingClientRect().top + window.scrollY - offset;
              window.scrollTo({ top: top, behavior: 'smooth' });
            }
          }
        });
      });
    })();
