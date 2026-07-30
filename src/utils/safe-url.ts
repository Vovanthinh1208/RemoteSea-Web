/**
 * Guards an outbound href built from user-supplied data (talent portfolio /
 * github / linkedin links, employer website). Zod's `.url()` on the backend
 * accepts any valid URL *including* `javascript:` and `data:` schemes, so a
 * value that passed validation can still be an XSS payload the moment it lands
 * in an <a href>. This allows only http(s) and mailto; anything else (or an
 * unparseable string) returns null so the caller can drop the link.
 */
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export const safeExternalUrl = (
  raw: string | null | undefined
): string | null => {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return SAFE_PROTOCOLS.has(url.protocol) ? raw : null;
  } catch {
    return null;
  }
};
