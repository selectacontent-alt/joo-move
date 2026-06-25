export function isVideoUrl(url) {
  return /\.(mp4|webm|mov|m4v)(?=$|[?#])/i.test(String(url || ''));
}

export function normalizeMediaUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const withoutLeadingSlash = value.replace(/^\/+/, '');
  if (withoutLeadingSlash.startsWith('uploads/')) {
    return `/api/static/${withoutLeadingSlash.slice('uploads/'.length)}`;
  }

  return value.startsWith('/') ? value : `/${value}`;
}
