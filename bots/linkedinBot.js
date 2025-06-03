const { chromium } = require('playwright');
const { getBusinessList } = require('../utils/googleApiUtils');
const fs = require('fs');
const path = require('path');

async function submitToLinkedIn(sheetUrl) {
  console.log('📥 Fetching business list from Google Sheets...');
  const businesses = await getBusinessList(sheetUrl);
  console.log(`📊 Found ${businesses.length} businesses to process.\n`);

  const imageFolder = path.join(__dirname, '../bots/images');
  const imageFiles = fs.readdirSync(imageFolder).filter(file =>
    file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')
  );

  if (imageFiles.length === 0) {
    console.warn('🚫 No image files found in images folder. Proceeding without images.\n');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: 'auths/storageState/linkedin.json'
  });
  const page = await context.newPage();

  for (const biz of businesses) {
    const { name, description, website, email, phone, address } = biz;

    const postText = `📢 ${name}\n\n${description}\n\n🌐 ${website}\n📧 ${email}\n📞 ${phone}\n📍 ${address}`;
    console.log(`🔄 Starting post for: ${name}`);

    try {
      console.log('🌐 Navigating to LinkedIn feed...');
      await page.goto('https://www.linkedin.com/feed/');
      await page.waitForLoadState('domcontentloaded');

      console.log('📝 Clicking "Start a post"...');
      await page.locator('button:has-text("Start a post")').first().click();
      await page.waitForSelector('div[role="dialog"] div[role="textbox"]', { timeout: 10000 });

      if (imageFiles.length > 0) {
  const imagePath = path.join(imageFolder, imageFiles[0]);
  console.log(`🖼️ Uploading image: ${imagePath}`);

  try {
    // Wait for the file chooser event to be triggered
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button:has(svg[data-test-icon="image-medium"])')
    ]);

    await fileChooser.setFiles(imagePath);
    console.log('📸 Image uploaded successfully.');

    // Wait for the "Next" button and click it
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.waitFor({ timeout: 10000 });
    await nextBtn.click();
    console.log('➡️ Clicked "Next" after image upload.');
  } catch (error) {
    console.warn(`⚠️ Image upload failed: ${error.message}`);
  }
}

      console.log('✏️ Filling in post text...');
      await page.fill('div[role="dialog"] div[role="textbox"]', postText);


      console.log('🚀 Clicking "Post" button...');
      const postBtn = page.locator('div.share-box_actions button.share-actions__primary-action:not([disabled])');
      await postBtn.waitFor({ timeout: 10000 });
      await postBtn.click();

      console.log(`✅ Successfully posted for: ${name}\n`);
      await page.waitForTimeout(5000);
    } catch (err) {
      console.error(`❌ Failed posting for ${name}: ${err.message}\n`);
    }
  }

  await browser.close();
  console.log('🧹 Browser closed. All tasks completed.\n');
}

module.exports = { submitToLinkedIn };