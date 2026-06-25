import iconv from 'iconv-lite';

const ARABIC_MOJIBAKE_HINT = /[طظ]/;

const repairString = (value) => {
  if (typeof value !== 'string' || !ARABIC_MOJIBAKE_HINT.test(value)) {
    return value;
  }

  const decoded = iconv.decode(iconv.encode(value, 'windows-1256'), 'utf8');
  if (!decoded || decoded.includes('\uFFFD')) {
    return value;
  }

  const originalArabicHints = (value.match(/[طظ]/g) || []).length;
  const decodedArabicLetters = (decoded.match(/[\u0600-\u06FF]/g) || []).length;

  return originalArabicHints >= 2 && decodedArabicLetters > originalArabicHints
    ? decoded
    : value;
};

export const repairArabicMojibake = (value) => {
  if (typeof value === 'string') {
    return repairString(value);
  }

  if (Array.isArray(value)) {
    return value.map(repairArabicMojibake);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, repairArabicMojibake(entry)])
    );
  }

  return value;
};
