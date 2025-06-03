const express = require('express');
const router = express.Router();
const { getBusinessList } = require('../utils/sheets');
const { submitToPinterest } = require('../bots/pinterestBot');

router.get('/bot/pinterest', (req, res) => {
  res.render("pinterest")
})

// Handle form POST submission
router.post('/bot/pinterest', async (req, res) => {
  const { sheetUrl, driveUrl, email, password } = req.body;

  try {
    // Extract IDs from URLs
    const sheetId = new URL(sheetUrl).pathname.split('/')[3];
    const folderId = new URL(driveUrl).pathname.split('/')[3];

    // Parse businesses array from Google Sheet
    const businesses = await getBusinessList(sheetId);

    // Submit to Pinterest for each business with index logging
    for (let i = 0; i < businesses.length; i++) {
      const biz = businesses[i];
      console.log(`🚀 Submitting pin for business: ${biz.name}, index: ${i}`);
      await submitToPinterest(biz, folderId, email, password, i);
    }

    res.render('result', { message: '✅ Pinterest Bot completed successfully!' });
  } catch (err) {
    console.error('Error in Pinterest bot:', err);
    res.render('result', { message: '❌ Bot failed: ' + err.message });
  }
});

module.exports = router;