const fs = require('fs');
const path = require('path');
const vm = require('vm');

const translationPath = path.join(process.cwd(), 'src/contexts/translations.js');
const source = fs
  .readFileSync(translationPath, 'utf8')
  .replace(/export\s+default\s+translations\s*;?/, '')
  .replace('const translations =', 'translations =');
const context = {};
vm.createContext(context);
vm.runInContext(source, context);

function flattenTranslations(value, prefix = '', result = {}) {
  for (const [key, item] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && 'ar' in item && 'en' in item) {
      result[fullKey] = item;
    } else if (item && typeof item === 'object' && !Array.isArray(item)) {
      flattenTranslations(item, fullKey, result);
    }
  }
  return result;
}

function collectSourceFiles(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceFiles(filePath, result);
    else if (/\.(js|jsx)$/.test(entry.name)) result.push(filePath);
  }
  return result;
}

const translations = flattenTranslations(context.translations);
const usage = new Map();
const translationFunctionIssues = [];

for (const filePath of collectSourceFiles(path.join(process.cwd(), 'src'))) {
  const fileSource = fs.readFileSync(filePath, 'utf8');
  if (/\bt\(\s*['"]/.test(fileSource) && !/const\s*\{[^}]*\bt\b[^}]*\}\s*=\s*useLanguage\(\)/s.test(fileSource)) {
    translationFunctionIssues.push(path.relative(process.cwd(), filePath));
  }
  for (const match of fileSource.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) {
    if (!usage.has(match[1])) usage.set(match[1], new Set());
    usage.get(match[1]).add(path.relative(process.cwd(), filePath));
  }
}

const missing = [...usage.keys()]
  .filter((key) => !key.endsWith('.') && !translations[key])
  .map((key) => ({ key, files: [...usage.get(key)] }));
const empty = Object.entries(translations)
  .filter(([, value]) => !String(value.ar || '').trim() || !String(value.en || '').trim())
  .map(([key]) => key);

console.log(JSON.stringify({
  translationCount: Object.keys(translations).length,
  usedKeyCount: usage.size,
  missingCount: missing.length,
  missing,
  emptyCount: empty.length,
  empty,
  translationFunctionIssueCount: translationFunctionIssues.length,
  translationFunctionIssues,
}, null, 2));

process.exitCode = missing.length || empty.length || translationFunctionIssues.length ? 1 : 0;
