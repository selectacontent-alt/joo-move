const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'contexts', 'translations.js');
let content = fs.readFileSync(targetFile, 'utf8');

const replacements = [
  { search: /Kids Fashion/gi, replace: 'Agricultural Supplies' },
  { search: /ملابس أطفال/g, replace: 'محاصيل زراعية وأعلاف' },
  { search: /أزياء الأطفال/g, replace: 'المحاصيل الزراعية' },
  { search: /أناقة طفلك/g, replace: 'إنتاجية مزرعتك' },
  { search: /عالم طفلك/g, replace: 'عالم الزراعة' },
  { search: /ملابس عالية الجودة/g, replace: 'محاصيل زراعية عالية الجودة' },
  { search: /الملابس/g, replace: 'الأعلاف والمحاصيل' },
  { search: /القطنية/g, replace: 'الطازجة' },
  { search: /بشرة الأطفال/g, replace: 'تغذية المواشي' },
  { search: /تصنيع وتسويق الملابس/g, replace: 'الاستصلاح الزراعي وتوريد الأعلاف' },
  { search: /مصنع متخصص في تصنيع/g, replace: 'شركة متخصصة في زراعة وتوريد' },
  { search: /أحدث القصات والألوان/g, replace: 'أفضل المحاصيل الطازجة' },
  { search: /بشرة طفلك/g, replace: 'مواشيك' },
  { search: /غسيل المتكرر/g, replace: 'التخزين' },
  { search: /خامات طبيعية/g, replace: 'محاصيل طبيعية' },
  { search: /أقطان طبيعية/g, replace: 'محاصيل طبيعية' },
  { search: /أمهات وآباء/g, replace: 'أصحاب المزارع' },
  { search: /لأطفالهم/g, replace: 'لمزارعهم' },
  { search: /مقاسات والألوان الخاصة بالموديل/g, replace: 'الكميات وجودة المحصول' },
  { search: /المنطقة، وتكاليف النقل/g, replace: 'المنطقة وتكاليف النقل' }, // just a check
  { search: /تصاميم عصرية/g, replace: 'أعلاف خضراء' },
  { search: /تشكيلة حصرية من ملابس/g, replace: 'أفضل الأعلاف و' },
  { search: /الملابس والبيع عبر الإنترنت/g, replace: 'توريد الأعلاف الزراعية' }
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Translations updated for agriculture identity.');
