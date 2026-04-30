# CSP `unsafe-inline` — Rationale & Risk-Acceptance

**Status:** Akzeptiertes Risiko (Stand 2026-04-30)
**Geltungsbereich:** alle Customer-Sites auf cw-core (siluri.de, blitzsicht.com, gottl-richter-gomeier.de, …)
**Review-Frequenz:** jährlich, oder bei Astro Major-Bump

## Kontext

Die Content-Security-Policy in `templates/vercel.template.json` und allen abgeleiteten `vercel.json`-Dateien enthält:

```
script-src 'self' 'unsafe-inline' …
style-src  'self' 'unsafe-inline'
```

Audit-Tools (cw-audit, Mozilla Observatory, securityheaders.com) markieren `unsafe-inline` üblicherweise als Schwachstelle, weil ein erfolgreicher XSS-Vektor damit nicht durch CSP abgefangen wird.

## Warum `unsafe-inline` aktuell bleibt

1. **Astro 4 + Tailwind v4 generieren inline `<style>`-Blöcke pro Page** — aus den scoped `<style>` der Components und aus dem critical CSS für das above-the-fold Rendering. Ohne `unsafe-inline` müssten alle diese Hashes oder Nonces in der CSP stehen, was statisch nicht möglich ist.
2. **Dynamische `style={…}`-Attribute** auf Components wie `BentoGrid` setzen CSS Custom Properties zur Render-Zeit. Diese sind weder hashable noch nonce-fähig ohne SSR.
3. **Static-Output-Mode**: cw-core-Sites werden als statische HTML-Bundles auf Vercel deployt. Eine Nonce-basierte CSP würde SSR oder Edge-Middleware erzwingen, was Hosting-Kosten und Komplexität erhöht.

## Realer Bedrohungsvektor

XSS via `unsafe-inline` ist nur dann ausnutzbar, wenn eine andere Schwachstelle bereits Markup einschleust (Stored-XSS, Reflected-XSS). cw-core-Sites haben:

- **Keine User-Generated-Content** auf den ausgelieferten Pages (keine Kommentare, Forum, Profile)
- **Keine Server-Side-Rendering von User-Eingaben** (alle Inputs gehen ausschliesslich an validierte Form-Handler `cw-core/utils/forms`)
- **Keine Third-Party-Embeds** ausser Plausible Analytics, Cal.com Booking, Tally Forms (alle in `connect-src`/`frame-src` whitelisted)

Damit ist `unsafe-inline` aktuell ein theoretischer „Defense-in-Depth"-Verlust, kein realer Angriffsvektor.

## Geprüfte Alternativen + Aufwand

| Option | Aufwand | Bewertung |
|---|---|---|
| Hash-basierte CSP (build-time SHA-256 pro inline-Block) | 16–20h | overengineered für Mittelstand-Site, fragil bei Astro-Updates |
| Nonce-basierte CSP (Edge-Middleware + SSR-Switch) | 8–12h | bricht static-output, erhöht Vercel-Function-Kosten |
| Astro `experimental.csp` (Astro 5+) | 4–6h | abhängig von Astro-Major-Bump, derzeit nicht in Roadmap |
| **Akzeptieren + dokumentieren (dieser Beschluss)** | 1h | aktuell empfohlen |

## Trigger für Re-Evaluation

Wir bewerten diese Entscheidung neu, sobald:

- **User-Generated-Content** (Kommentare, Profile) auf einer Site eingeführt wird
- **Third-Party-Scripts** mit dynamischen Tags hinzukommen (Tag-Manager, Heatmaps)
- **Astro 5+** auf cw-core mit stabiler `experimental.csp`-Integration verfügbar wird
- **Compliance-Anforderung** eines Kunden eine strikte CSP fordert (B2B-Banken, Versicherungen)

## Defense-in-Depth-Massnahmen, die bestehen bleiben

Auch ohne strikte CSP sind aktiv:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'none'` (CSP)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Eingabe-Validierung in allen Form-Handlern (`cw-core/utils/forms/handle-submission`)
- Cloudflare WAF + Bot-Fight-Mode + Turnstile (siehe `project_spam_defense_stack.md`)

## Audit-Tool-Wertung

`cw-audit` (intern) wertet `security.headers.csp` und `security.csp-effective` nicht mehr als `warn`, sondern als `info`, sofern **alle** anderen Pflicht-Header (HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options) sauber gesetzt sind. Begründung: das Risiko ist akzeptiert und dokumentiert.

Externe Audit-Tools (Mozilla Observatory, securityheaders.com) bleiben bei „strict CSP" als Bewertung. Das ist erwartetes Verhalten; bei Kunden-Reviews kann auf dieses Dokument verwiesen werden.
