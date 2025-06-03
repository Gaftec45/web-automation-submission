const express = require('express');
const router = express.Router();
const { getBusinessList } = require('../utils/googleApiUtils');
const { submitToLinkedIn } = require('../bots/linkedinBot');

router.get('/bot/linkedin', (req, res) => {
  res.render('linkedin');
});

function extractSheetId(sheetUrl) {
  try {
    const url = new URL(sheetUrl);
    if (!url.hostname.includes('docs.google.com')) throw new Error();
    const id = url.pathname.split('/')[3];
    if (!id) throw new Error();
    return id;
  } catch {
    throw new Error('Invalid Google Sheets URL. Please use the full URL like: https://docs.google.com/spreadsheets/d/your_id/edit');
  }
}

function extractFolderId(driveUrl) {
  try {
    const url = new URL(driveUrl);
    if (!url.hostname.includes('drive.google.com')) throw new Error();
    const id = url.pathname.split('/')[3];
    if (!id) throw new Error();
    return id;
  } catch {
    throw new Error('Invalid Google Drive folder URL. Please use the full URL like: https://drive.google.com/drive/folders/your_id');
  }
}

router.post('/bot/linkedin', async (req, res) => {
  const { sheetUrl, folderUrl } = req.body;

  try {
    const sheetId = extractSheetId(sheetUrl); // You can log it for debug
    const folderId = extractFolderId(folderUrl);
    
    await submitToLinkedIn(sheetUrl, folderId); // This calls your bot
    res.send('✅ LinkedIn bot executed successfully!');
  } catch (err) {
    console.error('❌ Error running LinkedIn bot:', err.message);
    res.status(400).send(`❌ ${err.message}`);
  }
});

module.exports = router;