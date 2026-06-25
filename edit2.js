const fs = require('fs');
let content = fs.readFileSync('c:/Users/Elmotkhasess/Desktop/select/kasakis/kasakis store/next-app/src/contexts/translations.js', 'utf8');
content = content.replace("policy: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },", "policy: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },\n    track: { ar: 'تتبع الطلب', en: 'Track Order' },");
fs.writeFileSync('c:/Users/Elmotkhasess/Desktop/select/kasakis/kasakis store/next-app/src/contexts/translations.js', content);
console.log('done');
