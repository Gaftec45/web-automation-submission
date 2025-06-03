const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // manual login
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/login/');

  console.log('🔐 Please log in manually in the browser window...');
  await page.waitForTimeout(45000); // Wait up to 45s for manual login

  // Save session
  const storage = await context.storageState();
  fs.writeFileSync('storageState/pinterest.json', JSON.stringify(storage));

  console.log('✅ Session saved to pinterest.json');
  await browser.close();
})();
