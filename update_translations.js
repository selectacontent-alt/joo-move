const fs = require('fs');
const path = './src/contexts/translations.js';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(/"cart": \{/g, '"cart": {');
content = content.replace(/"title": \{\s*"ar": "عربة التسوق"/, '"title": { "ar": "طلب التسعير والتوريد"');
content = content.replace(/"emptyTitle": \{\s*"ar": "العربة فارغة"/, '"emptyTitle": { "ar": "قائمة الطلبات فارغة"');
content = content.replace(/"checkout": \{\s*"ar": "المتابعة للدفع"/, '"checkout": { "ar": "إرسال طلب التوريد"');
content = content.replace(/"shopping": \{\s*"ar": "الشحن"/, '"shopping": { "ar": "التوريد"');

content = content.replace(/"addToCartText": \{\s*"ar": "إضافة للسلة"/, '"addToCartText": { "ar": "أضف للقائمة"');
content = content.replace(/"goToCart": \{\s*"ar": "الذهاب للسلة"/, '"goToCart": { "ar": "قائمة الطلبات"');

fs.writeFileSync(path, content, 'utf8');
console.log('Translations updated for agriculture terminology');
