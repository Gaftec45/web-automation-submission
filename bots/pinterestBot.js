const { chromium } = require('playwright');
const { prepareImage } = require('../utils/googleApiUtils');

async function loginPinterest(page, email, password) {
  await page.goto('https://www.pinterest.com/login/');
  await page.fill('input[name="id"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await Promise.race([
    page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }),
    page.waitForSelector('div[data-test-id="header-profile"]', { timeout: 30000 }),
  ]);
}

async function submitToPinterest(business, folderId, email, password, index = 0) {
  console.log(`\n--- 📌 Starting Pinterest submission for: ${business.name} ---`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await loginPinterest(page, email, password);
    await page.waitForTimeout(2000);
    await page.goto('https://www.pinterest.com/pin-creation-tool/');
    await page.waitForTimeout(3000);

    const imagePath = await prepareImage(folderId, index);
    await page.setInputFiles('input[type="file"]', imagePath);
    await page.waitForTimeout(4000);

    await page.fill('input#storyboard-selector-title', business.name || '');
    await page.waitForTimeout(1500);

    const descSelector = 'div[contenteditable="true"][aria-label="Add a detailed description"]';
    const descBox = page.locator(descSelector);
    await descBox.waitFor({ timeout: 30000 });
    await descBox.click({ force: true });
    await descBox.evaluate(el => el.innerHTML = '');
    await page.keyboard.type(business.description || 'Default description', { delay: 50 });
    await page.waitForTimeout(1500);

    const linkSelector = '#WebsiteField';
    await page.waitForSelector(linkSelector, { timeout: 30000 });
    await page.fill(linkSelector, business.website || 'https://example.com');
    await page.waitForTimeout(1000);

    await page.click('[data-test-id="board-dropdown-placeholder"]');
    await page.waitForSelector('div[title="Create board"]', { timeout: 10000 });
    await page.click('div[title="Create board"]');
    await page.fill('input[name="boardName"]', business.name || 'AutoBoard');
    await page.click('[data-test-id="board-form-submit-button"]');
    await page.waitForTimeout(3000);

    await page.click('button:has-text("Publish")');
    await page.waitForTimeout(5000);

    console.log(`✅ Pin created for ${business.name}`);
  } catch (err) {
    console.error(`❌ Failed for ${business.name}:`, err.message);
  } finally {
    await browser.close();
  }
}

module.exports = {
  submitToPinterest,
};