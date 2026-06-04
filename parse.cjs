const fs = require('fs');
const html = fs.readFileSync('fs.html', 'utf8');
const lines = html.split('\n');
const aaronLines = lines.filter(l => l.includes('aaron') && (l.includes('img') || l.includes('svg')));
console.log(aaronLines);
