const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'contexts', 'translations.js');
let content = fs.readFileSync(targetFile, 'utf8');

const replacements = [
  { search: /عن ماذا تبحث\؟ \(فساتين، بناطيل، قمصان\.\.\.\)/g, replace: 'عن ماذا تبحث؟ (علف أخضر، سيلاج، برسيم...)' },
  { search: /What are you looking for \(Dresses, Pants, Shirts\.\.\.\)/gi, replace: 'What are you looking for? (Green Fodder, Silage, Clover...)' },
  { search: /ملابس الأطفال/g, replace: 'الأعلاف' },
  { search: /ملابس/g, replace: 'محاصيل زراعية' },
  { search: /أزياء/g, replace: 'منتجات زراعية' }
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

// Add the hero section missing keys to translations if they don't exist
if (!content.includes('"hero": {')) {
  const heroTranslations = `
  "hero": {
    "statParentsTrust": {
      "ar": "عملاء يثقون بنا",
      "en": "Trusted Clients"
    },
    "statCotton": {
      "ar": "جودة طبيعية",
      "en": "Natural Quality"
    },
    "statExclusiveDesign": {
      "ar": "منتجات مميزة",
      "en": "Exclusive Products"
    },
    "cardMaterialsTitle": {
      "ar": "جودة من الأرض",
      "en": "Quality from Land"
    },
    "cardMaterialsSub": {
      "ar": "محاصيل مختارة بعناية",
      "en": "Carefully selected crops"
    },
    "cardDesignsTitle": {
      "ar": "توريد للمزارع",
      "en": "Farm Supply"
    },
    "cardDesignsSub": {
      "ar": "كميات تناسب احتياجك",
      "en": "Quantities to suit your needs"
    },
    "tickerDelivery": {
      "ar": "توصيل سريع للمزارع",
      "en": "Fast delivery to farms"
    },
    "tickerCotton": {
      "ar": "محاصيل خالية من الإضافات",
      "en": "Additive-free crops"
    },
    "tickerOffers": {
      "ar": "عروض خاصة على الكميات",
      "en": "Special offers on bulk"
    }
  },`;
  content = content.replace('"nav": {', heroTranslations + '\n  "nav": {');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Final translations updated.');
