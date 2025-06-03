const express = require('express');
const router = express.Router();
const { getBusinessList } = require('../utils/sheets');
const medium = require('../bots/mediumBot');


router.get('/bot/medium', (req, res) => {
  res.render('medium'); 
});


function extractDriveFolderId(driveUrl) {
  try {
    const url = new URL(driveUrl);
    if (url.searchParams.has('id')) {
      return url.searchParams.get('id');
    }
    // Otherwise, folder ID is last part of path
    const parts = url.pathname.split('/');
    return parts[parts.length - 1];
  } catch {
    // Fallback to just returning the input if URL parsing fails
    return driveUrl;
  }
}

router.post('/bot/medium', async (req, res) => {

  const { sheetUrl, driveUrl } = req.body || {};

  if (!sheetUrl || !driveUrl) {
    return res.status(400).send('❌ Error: Both sheetUrl and driveUrl are required in the request body.');
  }

  try {
    // Pass full sheetUrl to getBusinessList (it extracts the ID internally)
    const businesses = await getBusinessList(sheetUrl);

    // Extract drive folder ID here
    const driveFolderId = extractDriveFolderId(driveUrl);

    await Promise.all(
      businesses.map(async (biz) => {
        console.log(`🚀 Submitting ${biz.name} to Medium...`);
        try {
          await medium.submit(biz, driveFolderId);
        } catch (err) {
          console.error(`❌ Failed for ${biz.name}:`, err.message);
        }
      })
    );

    res.send('✅ Bot completed successfully!');
  } catch (err) {
    res.status(400).send('❌ Error: ' + err.message);
  }
});


module.exports = router;