# Security Policy

## Reporting a Vulnerability

Email **samansunsara.39@gmail.com** with details. Do not open public issues for security bugs.

## Protections in Place

| Control | Implementation |
|---|---|
| Content Security Policy | Strict CSP — no inline scripts or styles |
| Subresource Integrity | SHA-384 hashes on `styles.css` and `app.js` |
| HTTPS | Forced via `.htaccess` and HSTS headers |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| XSS | CSP + external assets only |
| Path traversal | Apache rewrite rules block `../` and injection patterns |
| Hidden files | `.git`, `.env`, configs blocked from web access |
| Tabnabbing | `rel="noopener noreferrer"` on all external links |

## Production Checklist (grevoo.co.in)

1. **Cloudflare** (free) — enable WAF, Bot Fight Mode, Always Use HTTPS, SSL Full (strict)
2. **HSTS preload** — submit domain after HTTPS is stable
3. **GitHub Pages** — use custom domain with Cloudflare proxy (headers from `_headers` apply on Netlify/Cloudflare Pages; use Cloudflare for GitHub Pages)
4. After updating `assets/css/styles.css` or `assets/js/app.js`, regenerate SRI hashes and update `index.html`

### Regenerate SRI hashes (PowerShell)

```powershell
$js = [Convert]::ToBase64String([SHA384]::Create().ComputeHash([IO.File]::ReadAllBytes("assets\js\app.js")))
$css = [Convert]::ToBase64String([SHA384]::Create().ComputeHash([IO.File]::ReadAllBytes("assets\css\styles.css")))
Write-Host "js: sha384-$js"
Write-Host "css: sha384-$css"
```

## License

Proprietary. See [LICENSE](LICENSE).
