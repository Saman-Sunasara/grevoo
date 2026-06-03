    (function () {
      'use strict';

      /* ---- Smooth Scroll (Lenis) ---- */
      let lenis;
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
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      /* ---- Custom Cursor ---- */
      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      let mouseX = 0, mouseY = 0;
      let ringX = 0, ringY = 0;

      if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', function (e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
          dot.style.left = mouseX + 'px';
          dot.style.top = mouseY + 'px';
        });

        function animateRing() {
          ringX += (mouseX - ringX) * 0.15;
          ringY += (mouseY - ringY) * 0.15;
          ring.style.left = ringX + 'px';
          ring.style.top = ringY + 'px';
          requestAnimationFrame(animateRing);
        }
        animateRing();

        const hoverTargets = document.querySelectorAll('a, button, .company-card, .btn');
        hoverTargets.forEach(function (el) {
          el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
          el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
        });
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
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-active');
      }

      function closeModal() {
        modal.classList.remove('open');
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
            if (lenis) {
              lenis.scrollTo(target, { offset: -offset, duration: 1.2 });
            } else {
              const top = target.getBoundingClientRect().top + window.scrollY - offset;
              window.scrollTo({ top: top, behavior: 'smooth' });
            }
          }
        });
      });
    })();
