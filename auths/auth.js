// auth.js
const { chromium } = require('playwright');
require('dotenv').config();
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://medium.com/m/signin');
  await page.click('text=Sign in with email');

  const email = process.env.MEDIUM_LOGIN_EMAIL; // <-- Replace with your Medium account
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Continue")');

  console.log('💬 Please check your email and complete login in the browser manually...');
  await page.waitForTimeout(60000); // give 60s for manual login

  // Save authentication state
  await context.storageState({ path: 'auth.json' });

  console.log('✅ Auth session saved to auth.json');
  await browser.close();
})();
