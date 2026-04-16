// Derives common layout prop objects from siteData. Pages use
// `{...landingBaseProps}` to pass a consistent header/footer/SEO shape into
// every @cw/core LandingPage or ContentPage.
//
// Build time only — no runtime side effects.
import { siteData } from './site-data';

/** Footer config, mirrors @cw/core/layouts/LandingPage#FooterConfig. */
export const footerConfig = {
  siteName: siteData.name,
  tagline: siteData.tagline,
  description: siteData.description,
  email: siteData.contact.email,
  phone: siteData.contact.phone || undefined,
  owner: siteData.legal.owner,
  legalForm: siteData.legal.form,
  city: siteData.legal.city,
  leistungenLinks: siteData.nav.footer.leistungen,
  rechtlichesLinks: siteData.nav.footer.rechtliches,
  showKarriereLink: false,
  logoSrc: '/logo.svg',
  logoSrcDark: '/logo-dark.svg',
} as const;

/** Header config, mirrors @cw/core/layouts/LandingPage#HeaderConfig. */
export const headerConfig = {
  navItems: siteData.nav.main,
  showKarriereLink: false,
  logoSrc: '/logo.svg',
  logoSrcDark: '/logo-dark.svg',
} as const;

/** Schema.org props forwarded into <BaseLayout schema={...}/>. */
export const schemaConfig = {
  name: siteData.name,
  description: siteData.description,
  url: siteData.url,
  ogImage: siteData.seo.ogImage,
  street: siteData.legal.street,
  zip: siteData.legal.zip,
  city: siteData.legal.city,
  country: siteData.legal.country,
  email: siteData.contact.email,
  phone: siteData.contact.phone || undefined,
} as const;

/** Common layout props for LandingPage / ContentPage. */
export const landingBaseProps = {
  siteName: siteData.name,
  siteUrl: siteData.url,
  defaultTitle: siteData.seo.defaultTitle,
  defaultDescription: siteData.seo.defaultDescription,
  defaultOgImage: siteData.seo.ogImage,
  titleTemplate: siteData.seo.titleTemplate,
  plausibleScript: siteData.analytics?.plausibleScript,
  logoSrc: '/logo.svg',
  logoSrcDark: '/logo-dark.svg',
  header: headerConfig,
  footer: footerConfig,
  schema: schemaConfig,
} as const;
