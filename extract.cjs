const fs = require('fs');
const html = fs.readFileSync('fs.html', 'utf8');
const regex = /<a href="\/designs\/([^/]+)\/".*?(<svg.*?>.*?<\/svg>)/gi;
let match;
const svgs = {};
while ((match = regex.exec(html)) !== null) {
  svgs[match[1]] = match[2];
}
console.log(Object.keys(svgs).length);
fs.writeFileSync('src/svgs.json', JSON.stringify(svgs, null, 2));
