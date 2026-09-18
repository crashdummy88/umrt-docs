/**
 * Allowlisted docs return paths for portal ?next=.
 * Only SOP / ESTIMATE trees. Open-redirect shapes fail closed.
 */

export const DOCS_ORIGIN = 'https://docs.unitedmobilerv.com';
export const PORTAL_ACCOUNT = 'https://portal.unitedmobilerv.com/account/';

const ALLOWED_PREFIXES = ['/sop', '/estimates', '/estimate'];

export function isAllowedDocsPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false;
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;
  if (pathname.includes('\\') || pathname.includes('..') || /[\r\n\0]/.test(pathname)) return false;
  const path = pathname.split('?')[0].split('#')[0];
  if (!path || path.includes('://')) return false;
  return ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export function safeDocsNextPath(pathname) {
  if (!isAllowedDocsPath(pathname)) return '/sop/';
  let path = pathname.split('?')[0].split('#')[0];
  if (!path.endsWith('/') && !/\.[a-zA-Z0-9]+$/.test(path)) path += '/';
  return path;
}

export function docsNextUrl(pathname) {
  return `${DOCS_ORIGIN}${safeDocsNextPath(pathname)}`;
}

/**
 * Portal-side (and tests): accept only https://docs.unitedmobilerv.com
 * SOP/ESTIMATE URLs. Relative paths that are allowlisted are expanded
 * to that origin. Everything else is dropped.
 */
export function safePortalNext(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || /[\r\n\0]/.test(trimmed)) return '';

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (!isAllowedDocsPath(trimmed)) return '';
    return docsNextUrl(trimmed);
  }

  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:') return '';
    if (u.hostname !== 'docs.unitedmobilerv.com') return '';
    if (u.username || u.password) return '';
    if (!isAllowedDocsPath(u.pathname)) return '';
    return docsNextUrl(u.pathname);
  } catch {
    return '';
  }
}

export function portalAccountRedirect(request) {
  const url = new URL(request.url);
  const next = docsNextUrl(url.pathname);
  const dest = new URL(PORTAL_ACCOUNT);
  dest.searchParams.set('next', next);
  return new Response(null, {
    status: 302,
    headers: {
      Location: dest.toString(),
      'Cache-Control': 'no-store',
    },
  });
}
