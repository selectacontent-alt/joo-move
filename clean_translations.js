const fs = require('fs');
const path = './src/contexts/translations.js';

let content = fs.readFileSync(path, 'utf8');

// Replacements
content = content.replace(/high-quality clothing/g, "high-quality crops and feeds");
content = content.replace(/clothing manufacturing/g, "agricultural production");
content = content.replace(/clothing and online retail industry/g, "agricultural and feed supply industry");
content = content.replace(/diverse range of clothing/g, "diverse range of crops and feeds");
content = content.replace(/children's clothing/g, "agricultural products");
content = content.replace(/elegant and beautiful clothing/g, "fresh and high-quality crops");

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned clothing translations');
