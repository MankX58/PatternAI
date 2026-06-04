const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept requests to make it faster (don't load fonts/css)
  await page.setRequestInterception(true);
  page.on('request', req => {
    if(['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto('https://freesewing.eu/designs', { waitUntil: 'networkidle2' });

  // Click the "Show Line Drawings" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Line Drawings'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000)); // wait for react to render svgs

  const designs = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[href^="/designs/"]');
    const result = {};
    for (const card of cards) {
      const href = card.getAttribute('href');
      const name = href.split('/')[2];
      const svgs = Array.from(card.querySelectorAll('svg')).map(s => s.outerHTML);
      if (svgs.length > 0) {
        // usually the largest SVG or the one with specific classes
        // Let's just grab the last SVG, as the first might be the difficult circles
        result[name] = svgs;
      }
    }
    return result;
  });

  fs.writeFileSync('linedrawings.json', JSON.stringify(designs, null, 2));
  console.log(`Extracted ${Object.keys(designs).length} designs`);

  await browser.close();
})();
