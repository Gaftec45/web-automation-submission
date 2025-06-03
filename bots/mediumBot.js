const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const IMAGE_DIR = path.join(__dirname, 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR);
}

// Authenticate Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // <- Your Google service account key file
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Search Google Drive for a file by name within the specified folder.
 */
async function getDriveFileIdByName(folderId, fileName) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name contains '${fileName}'`,
    fields: 'files(id, name)',
  });
  const file = res.data.files[0];
  return file ? file.id : null;
}

/**
 * Download a Google Drive file stream and save it to a local path.
 */
async function downloadDriveImage(fileId, savePath) {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(savePath);
    res.data.pipe(dest);
    dest.on('finish', resolve);
    dest.on('error', reject);
  });
}

/**
 * Prepare an image for upload: download from Drive if not cached locally.
 */
async function prepareImage(businessName, driveFolderId) {
  // Clean business name for safe filename
  const cleanName = businessName.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
  const localImagePath = path.join(IMAGE_DIR, `${cleanName}.jpg`);

  if (fs.existsSync(localImagePath)) {
    return localImagePath;
  }

  console.log('🔎 Searching Drive for image:', cleanName);
  const fileId = await getDriveFileIdByName(driveFolderId, cleanName);
  if (!fileId) {
    throw new Error(`Image for "${businessName}" not found in Drive`);
  }

  console.log('📥 Downloading image from Drive...');
  await downloadDriveImage(fileId, localImagePath);
  return localImagePath;
}

/**
 * Submit a story to Medium with title, image, and description.
 */
async function submit(business, driveFolderId) {
  let browser;
  let imagePath;

  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ storageState: 'auths/storageState/auth.json' }); // Pre-auth session
    const page = await context.newPage();

    await page.goto('https://medium.com/new-story');
    const titleSelector = 'h3[data-testid="editorTitleParagraph"]';

    console.log('⏳ Waiting for title field...');
    await page.waitForSelector(titleSelector, { timeout: 45000 });

    console.log('⌨️ Typing title...');
    await page.click(titleSelector);
    await page.keyboard.type(business.name, { delay: 50 });

    try {
      imagePath = await prepareImage(business.name, driveFolderId);
      console.log('🖼 Preparing to upload image to Medium...');

      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      const plusIconSelector = 'span.svgIcon--addMediaPlus';
      await page.waitForSelector(plusIconSelector, { timeout: 10000 });
      await page.click(plusIconSelector);
      await page.waitForTimeout(1000);

      const addImageButtonSelector = 'button[data-action="inline-menu-image"]';
      await page.waitForSelector(addImageButtonSelector, { timeout: 10000 });
      await page.click(addImageButtonSelector);
      await page.waitForTimeout(1000);

      const fileInputSelector = 'input[type="file"]';
      await page.waitForSelector(fileInputSelector, { timeout: 10000 });
      await page.setInputFiles(fileInputSelector, imagePath);
      await page.waitForTimeout(4000);

      console.log('✅ Image uploaded successfully.');

      // Move cursor below image and add new paragraph
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

    } catch (e) {
      console.error('⚠️ Image upload skipped:', e.message);
    }

    console.log('⌨️ Adding story content below the image...');
    await page.keyboard.type(business.description || 'This is a placeholder description.', { delay: 50 });

    await page.waitForTimeout(1000);

    const publishButtonSelector = 'button[data-testid="publish-menu-button"]';
    await page.waitForSelector(publishButtonSelector, { timeout: 10000 });
    await page.click(publishButtonSelector);

    console.log('⌛ Waiting for publish modal...');
    const finalPublishButtonSelector = 'button[data-testid="publish-button"]';
    await page.waitForSelector(finalPublishButtonSelector, { timeout: 10000 });
    await page.click(finalPublishButtonSelector);

    console.log(`🚀 Submitted "${business.name}" to Medium`);
  } catch (error) {
    console.error(`❌ Failed to submit "${business.name}":`, error.message);
  } finally {
    if (browser) await browser.close();
  }
}


module.exports = { submit };