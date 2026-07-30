
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => { if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text()); });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
  await page.goto('http://localhost:5173/manage-posts', { waitUntil: 'networkidle2' });
  await page.goto('http://localhost:5173/edit-post/21', { waitUntil: 'networkidle2' });
  
  await browser.close();
  console.log('Test completed successfully');
})();
