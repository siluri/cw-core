# [CUSTOMER_NAME] — Claude Code Regeln

Dieses Template in `cw-core/templates/customer-CLAUDE.md` wird in jedes neue Customer-Repo kopiert.
`[CUSTOMER_NAME]`, `[DOMAIN]`, `[PRIMARY_COLOR]`, `[ACCENT_COLOR]` durch echte Werte ersetzen.

---

## Brand

- **Name:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN]
- **Primary:** `[PRIMARY_COLOR]`
- **Accent:** `[ACCENT_COLOR]`

---

## Mobile-First (Pflicht)

Jede neue Component und jede `<style>`-Sektion startet mit Mobile-Defaults.
Größere Viewports sind Enhancements, keine Overrides.

### Richtig (Mobile-First)
```css
.card { padding: 1rem; font-size: 0.9rem; }
@media (min-width: 768px) {
  .card { padding: 2rem; font-size: 1rem; }
}
```

### Falsch (Desktop-First) — wird von Stylelint geblockt
```css
/* stylelint-disable-next-line plugin/no-max-width-media */
.card { padding: 2rem; }
@media (max-width: 768px) { .card { padding: 1rem; } }
```

### Reference-Components nutzen statt eigene Media Queries
- Tabellen → `<ResponsiveTable>` aus `@cw/core/components/primitives/`
- Grids → `<ResponsiveGrid min="280px">` (auto-fit, braucht keine Media Queries)
- Stack-Layouts → `<Stack from="md">` (vertikal mobile, horizontal ab md)

### Verifikation vor Commit
`pnpm lint:css` läuft via pre-commit-Hook. Ein neues `@media (max-width: ...)` ohne
`/* stylelint-disable-next-line plugin/no-max-width-media -- Begründung */` blockt den Commit.

---

## Imports in cw-core-Komponenten

Immer relative Pfade — kein `@/`-Alias (bricht Customer-Builds):
```astro
// Richtig
import Hero from '../../components/blocks/Hero.astro';
// Falsch
import Hero from '@/components/blocks/Hero.astro';
```

---

## Bilder

- NIEMALS raw JPG/PNG committen
- IMMER `pnpm optimize:images` (aus cw-core scripts) → WebP konvertieren
- srcset/sizes für Hero-Bilder setzen (mobile 375px, tablet 768px, desktop 1280px)

---

## Commits

Format: `type(scope): kurze Nachricht` — z. B. `feat(hero): add srcset`, `fix(a11y): contrast token`

Nach `pnpm build` ohne Fehler sofort committen oder User fragen.
