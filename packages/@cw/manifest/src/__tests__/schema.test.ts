// Tier 1 test: manifest schema validation.
//
// Phase 2 scope lock requires invalid manifests to fail with clear errors.
// Every failure-mode test asserts a specific issue path so error messages
// remain stable for customer-facing tooling (cw CLI, build pipeline).

import { describe, it, expect } from 'vitest';
import { manifestSchema } from '../schema';
import { validManifest } from './fixtures';

describe('manifestSchema', () => {
  // ── Happy path ─────────────────────────────────────────────────────────────
  it('validates a complete valid manifest', () => {
    const result = manifestSchema.safeParse(validManifest);
    if (!result.success) {
      // Surface the issue list so failures are actionable.
      // eslint-disable-next-line no-console
      console.error(result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  // ── Required fields ────────────────────────────────────────────────────────
  it('rejects manifest missing required field "name"', () => {
    const { name: _n, ...invalid } = validManifest;
    const result = manifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'name')).toBe(true);
    }
  });

  it('rejects manifest missing nested required field "legal.owner"', () => {
    const invalid = {
      ...validManifest,
      legal: { ...validManifest.legal, owner: '' },
    };
    const result = manifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  // ── Format validators ──────────────────────────────────────────────────────
  it('rejects invalid email format on legal.email', () => {
    const invalid = {
      ...validManifest,
      legal: { ...validManifest.legal, email: 'not-an-email' },
    };
    const result = manifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('legal.email');
    }
  });

  it('rejects invalid URL format on top-level url', () => {
    const invalid = { ...validManifest, url: 'not-a-url' };
    const result = manifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('url');
    }
  });

  it('rejects empty leistungen array (min 1 required)', () => {
    const invalid = { ...validManifest, leistungen: [] };
    const result = manifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects testimonial with stars > 5', () => {
    const invalid = {
      ...validManifest,
      testimonials: [{ name: 'A', role: 'B', text: 'C', stars: 6 }],
    };
    const result = manifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  // ── Extensions escape hatch ────────────────────────────────────────────────
  it('accepts manifest.extensions with arbitrary fields', () => {
    const withExtensions = {
      ...validManifest,
      extensions: {
        oneOffLandingPage: { slug: 'xmas', title: 'Holiday special' },
        experimentalFlag: true,
        numericField: 42,
      },
    };
    const result = manifestSchema.safeParse(withExtensions);
    expect(result.success).toBe(true);
  });

  // ── Passthrough ────────────────────────────────────────────────────────────
  it('allows unknown top-level fields via passthrough', () => {
    const withQuirk = {
      ...validManifest,
      customerQuirkField: 'quirky',
    };
    const result = manifestSchema.safeParse(withQuirk);
    expect(result.success).toBe(true);
  });
});
