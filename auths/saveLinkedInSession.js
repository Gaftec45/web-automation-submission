const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Go to LinkedIn and log in manually.');
  await page.goto('https://www.linkedin.com/login');

  // Wait until you're logged in manually
  await page.waitForTimeout(60000); // 60 seconds for manual login

  await context.storageState({ path: 'storageState/linkedin.json' });
  console.log('✅ LinkedIn session saved to storageState/linkedin.json');

  await browser.close();
})();
