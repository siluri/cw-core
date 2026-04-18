# @cw/core

Gemeinsame Astro-Komponenten, Layouts und Styles für Blitzsicht-Kundenseiten.

## Konzept

`cw-core` ist eine rein datengetriebene Komponentenbibliothek. Jede Kundensite bringt nur drei Dinge mit:

1. `src/data/site-data.ts` — alle Inhalte (Single Source of Truth)
2. `src/styles/tokens.css` — Markenfarben als CSS Custom Properties
3. `src/pages/*.astro` — Seitenassemblierung (meistens nur Block-Stacking)

Alles andere (Header, Footer, SEO, Schema.org, Blocks, ContactForm, Layouts) kommt unverändert aus diesem Paket.

## Voraussetzungen

```
astro >= 5.0.0
tailwindcss >= 4.0.0
```

## Installation (in Kundensites)

```jsonc
// package.json
{
  "dependencies": {
    "@cw/core": "github:siluri/cw-core#v1.0.5"
  }
}
```

```
pnpm install
```

## Struktur

```
cw-core/
  components/
    blocks/          # Seitenabschnitte (Hero, USPs, Leistungen, Pakete …)
    forms/           # ContactForm (Kontakt / Audit / Bewerbung)
    layout/          # Header, Footer
    seo/             # SchemaOrg JSON-LD
  layouts/
    BaseLayout.astro       # HTML-Shell: SEO, OG, Schema, Plausible, Favicons
    LandingPage.astro      # BaseLayout + Header + <main> + Footer
    ContentPage.astro      # BaseLayout + Header + Prose-Container + Footer
  styles/
    tokens-base.css        # Shared Utility-Klassen (.btn-accent, .container …)
  templates/
    site-data.template.ts  # Annotiertes Template für neue Kunden
    tokens.template.css    # CSS-Token-Template mit WCAG-Hinweisen
    vercel.template.json   # Security-Header-Basis für Vercel
```

## Layouts

| Layout | Verwendung |
|--------|-----------|
| `LandingPage` | Alle Marketing-Seiten (Homepage, Pakete, Kontakt …) |
| `ContentPage` | Impressum, Datenschutz (styled prose container) |

```astro
---
import { LandingPage } from '@cw/core/layouts/LandingPage.astro';
---
<LandingPage title="Startseite">
  <slot />
</LandingPage>
```

## Block-Komponenten

Alle Blocks sind **prop-driven** — die Seite liest `siteData` und reicht die passenden Felder als Props durch. So bleibt `@cw/core` frei von Import-Abhängigkeiten auf Kunden-Datenmodule.

| Komponente | Typische Props (aus `siteData`) |
|-----------|---------------------------------|
| `Hero` | `headline`, `subtext`, `ctaPrimary`, `usps={siteData.usps}` |
| `USPSection` | `items={siteData.usps}` |
| `LeistungenSection` | `items={siteData.leistungen}` |
| `ProcessSteps` | `steps={siteData.processSteps}` |
| `PaketeSection` | `items={siteData.packages}` |
| `Testimonials` | `items={siteData.testimonials}` |
| `FAQ` | `items={siteData.faqs}` |
| `CTABlock` | `headline`, `cta={siteData.cta}` |
| `KarriereHero` | `karriere={siteData.karriere}` |
| `ArbeitgeberVorteile` | `benefits={siteData.karriere.vorteile}` |
| `StellenListe` | `stellen={siteData.karriere.stellen}` |
| `BewerbungsForm` | `karriere={siteData.karriere}` |

## Motion-System (ab v0.5.0-alpha)

Opt-in Motion-Primitives für „Flashy Landing-Page"-Look. Alle Komponenten
respektieren `prefers-reduced-motion: reduce` und schalten sich dort komplett ab.
Desktop-only Features (Custom Cursor, Lenis Smooth-Scroll) sind auf Touch-Geräten
automatisch deaktiviert.

### Optionale Peer-Dependencies

```
gsap  >= 3.12   (optional — nur nötig wenn SmoothScroll mit ScrollTrigger-Sync genutzt wird)
lenis >= 1.1    (optional — nur nötig für SmoothScroll)
```

Installiert in der Kundensite mit `pnpm add gsap lenis`.

### Komponenten

| Komponente | Zweck |
|-----------|-------|
| `motion/ScrollReveal` | Fadet/slidet Slot-Inhalt beim Scrollen ein (up/down/left/right/zoom/fade). |
| `motion/StaggerGroup` | Reveal für Kindelemente mit konfigurierbarem Stagger. |
| `motion/ParallaxImage` | Y-Parallax auf Bilder beim Scrollen (rAF-basiert, kein GSAP nötig). |
| `motion/TextReveal` | Splittet Text in Wörter/Zeichen und blendet sie gestaffelt ein. |
| `motion/CountUp` | Zahlen-Counter der beim Scroll in den Viewport eased. |
| `motion/AnimatedBlob` | Organischer Mesh-Gradient-Hintergrund (CSS+SVG, kein WebGL). |
| `motion/SmoothScroll` | Lenis-Init (Desktop-only, touch-/reduced-motion-sicher). |
| `motion/ScrollProgress` | Fixe Accent-Progress-Bar am oberen Viewport-Rand. |
| `motion/CustomCursor` | Ersetzt den System-Cursor durch einen Follow-Circle (Desktop). |

### Hero mit Motion

```astro
<Hero
  headline={siteData.hero.headline}
  ...
  motion={{ blob: true, textReveal: true, stagger: true, parallax: true }}
/>
{/* oder abkürzend: motion={true} aktiviert alle vier Effekte */}
```

### Global Motion-Layer via LandingPage

```astro
<LandingPage
  {...landingBaseProps}
  motion={{ smoothScroll: true, progress: true, cursor: true }}
>
  <Hero ... motion={true} />
  <ScrollReveal direction="up"><LeistungenSection ... /></ScrollReveal>
  <ScrollReveal direction="up"><USPSection ... /></ScrollReveal>
  ...
</LandingPage>
```

### Sektion-Reveals

```astro
---
import ScrollReveal from '@cw/core/components/motion/ScrollReveal.astro';
import StaggerGroup from '@cw/core/components/motion/StaggerGroup.astro';
---
<ScrollReveal direction="up" delay={0.1}>
  <h2>Headline</h2>
</ScrollReveal>

<StaggerGroup direction="up" gap={0.1}>
  <Card />
  <Card />
  <Card />
</StaggerGroup>
```

### Brand-weit deaktivieren

Einfach `motion={...}` / `motion={true}` weglassen — alle Heros / LandingPages
rendern dann wie bisher (statisch). Kein Code-Change in `@cw/core` nötig.

## Usage

### Komponenten und Layouts importieren

```astro
---
import BaseLayout   from '@cw/core/layouts/BaseLayout.astro';
import LandingPage  from '@cw/core/layouts/LandingPage.astro';
import Hero         from '@cw/core/components/blocks/Hero.astro';
import USPSection   from '@cw/core/components/blocks/USPSection.astro';
import Footer       from '@cw/core/components/layout/Footer.astro';
import { siteData } from '@/data/site-data';
---
<LandingPage title={siteData.seo.title}>
  <Hero
    headline={siteData.hero.headline}
    subtext={siteData.hero.subtext}
    ctaPrimary={siteData.hero.ctaPrimary}
    usps={siteData.usps}
    siteName={siteData.name}
  />
  <USPSection items={siteData.usps} />
</LandingPage>
```

### Typen importieren (IDE-Autocomplete)

Alle öffentlichen Props-Typen werden vom Paket-Root re-exportiert:

```ts
import type {
  HeroCTA, HeroUSP,
  USPItem, LeistungItem, PaketeItem,
  FAQItem, Testimonial, ProcessStep,
  BenefitItem, StelleItem, StelleTyp,
  FooterLink, NavItem,
  SchemaProps,
  SubmitOptions, SubmitResult,
  SiteData,
} from '@cw/core';

const cta: HeroCTA = { label: 'Beratung anfragen', href: '/kontakt' };
```

### Form-Submission-Helper importieren

```ts
import { submitForm } from '@cw/core/utils/forms/submit';
import type { SubmitResult } from '@cw/core';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const result: SubmitResult = await submitForm(form, { actionUrl: '/api/contact' });
  if (result.ok) showSuccess(); else showError(result.error);
});
```

## ContactForm

Drei Varianten über `formType`:

```astro
<!-- Kontaktformular -->
<ContactForm formType="contact" />

<!-- Audit-Formular (URL + E-Mail) mit JSON-POST an eigenes Backend -->
<ContactForm formType="audit" actionUrl="/api/audit-hook" />

<!-- Bewerbungsformular -->
<ContactForm formType="bewerbung" />
```

Submission-Varianten:
- **Web3Forms** (Default): kein Backend nötig, Schlüssel in `siteData.contact.web3formsKey`
- **Custom actionUrl**: sendet JSON via Fetch, ideal für eigene Vercel Functions

Features: Loading-Spinner, Honeypot-Spamschutz, Inline-Erfolg/Fehler-Zustand, No-JS-Fallback (mailto).

## Neue Kundensite aufsetzen

1. Neues Repo von der Blitzsicht-Template klonen
2. `templates/site-data.template.ts` → `src/data/site-data.ts` kopieren und alle `// TODO`-Felder ausfüllen
3. `templates/tokens.template.css` → `src/styles/tokens.css` kopieren und Markenfarben eintragen
4. `pnpm install` → `pnpm dev`

## SEO & Schema.org

`BaseLayout` generiert automatisch:
- `<title>`, Meta-Description, Canonical
- Open Graph + Twitter Card
- `LocalBusiness + ProfessionalService` JSON-LD (Adresse, Kontakt, sameAs)
- `WebSite` JSON-LD
- Plausible-Analytics-Script (nur wenn `siteData.analytics.plausibleScript` gesetzt)

## Styling-Konventionen

- Tailwind v4 via `@tailwindcss/vite` Plugin (kein `tailwind.config.js`)
- Brand-Farben als CSS Custom Properties in der Kunden-`tokens.css` (z. B. `--color-primary`, `--color-accent`)
- `tokens-base.css` stellt Utility-Klassen bereit, setzt aber kein `@import "tailwindcss"` — das macht die Kunden-`tokens.css`
- Keine Google Fonts (DSGVO) — ausschließlich System-UI Stack

## Versions-Tagging

```bash
git tag v1.0.6
git push origin v1.0.6
```

Kundensites referenzieren das Paket via GitHub-Tag:
```json
"@cw/core": "github:siluri/cw-core#v1.0.6"
```
