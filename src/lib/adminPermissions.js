export const JOO_ADMIN_PAGE_IDS = [
  'dashboard', 'requests', 'schedule', 'services', 'areas', 'customers',
  'work', 'reviews', 'messages', 'content', 'whatsapp', 'about_agency', 'settings'
];

export function parseAdminPermissions(value) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map((item) => String(item || '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function normalizeAdminPermissions(value) {
  const allowed = new Set(JOO_ADMIN_PAGE_IDS);
  const normalized = parseAdminPermissions(value).filter((item) => allowed.has(item));
  return [...new Set(['dashboard', ...normalized])];
}
