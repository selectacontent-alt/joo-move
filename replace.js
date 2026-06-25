const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/Kasakis/gi, 'Al Rehab')
    .replace(/kasakis/gi, 'alrehab')
    .replace(/قصاقيص/g, 'الرحاب')
    .replace(/kasakis\.com/g, 'alrehab-agri.com')
    .replace(/text-gold/g, 'text-green'); // Since gold was changed to green visually
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done replacement.');
