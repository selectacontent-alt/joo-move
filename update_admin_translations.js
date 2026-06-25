const fs = require('fs');
const path = './src/contexts/translations.js';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(/"ar": "الألوان والمقاسات"/, '"ar": "خصائص المنتج (الأنواع والأوزان)"');
content = content.replace(/"en": "Colors & Sizes"/, '"en": "Types & Weights"');

fs.writeFileSync(path, content, 'utf8');
console.log('Translations updated for admin options terminology');
