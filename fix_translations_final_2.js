const fs = require('fs');
let content = fs.readFileSync('src/contexts/translations.js', 'utf8');

content = content.replace(/export\s+default\s+translations\s*;/g, '');
content = content.replace(/export\s+default\s+translations/g, '');
content = content.replace('const translations =', 'global.translations =');
eval(content);
const translations = global.translations;

const missingKeys = {
  loading: { ar: 'جاري تحضير المتجر...', en: 'Loading store...' },
  storeBadge: { ar: 'متجر قصاقيص', en: 'Kasakis Store' },
  storeEmpty: { ar: 'المتجر فارغ', en: 'Store is empty' },
  noProducts: { ar: 'لم يتم إضافة منتجات بعد', en: 'No products added yet' },
  addFromAdmin: { ar: 'يرجى إضافة بعض الأقسام والمنتجات من لوحة التحكم.', en: 'Please add categories and products from the admin panel.' }
};

translations.products = { ...translations.products, ...missingKeys };

const newContent = 'const translations = ' + JSON.stringify(translations, null, 2) + ';\n\nexport default translations;\n';
fs.writeFileSync('src/contexts/translations.js', newContent);
console.log('Fixed translations.js completely 2');
