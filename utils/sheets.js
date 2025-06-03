const { google } = require('googleapis');
const credentials = require('../credentials.json'); // Make sure this path is correct

const sheets = google.sheets('v4');

/**
 * Extract Spreadsheet ID from a full Google Sheets URL or return if already an ID.
 */
function extractSpreadsheetId(urlOrId) {
  if (/^[a-zA-Z0-9-_]+$/.test(urlOrId)) {
    // Looks like an ID only
    return urlOrId;
  }
  try {
    const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      throw new Error();
    }
    return match[1];
  } catch {
    throw new Error('Invalid Google Sheets URL. Please use the full URL like: https://docs.google.com/spreadsheets/d/your_id/edit');
  }
}

/**
 * Fetch business list data from a Google Sheet.
 * @param {string} sheetsUrl - The full URL or ID of the Google Sheet.
 * @returns {Promise<Array<Object>>} - List of business objects.
 */
async function getBusinessList(sheetsUrl) {
  const spreadsheetId = extractSpreadsheetId(sheetsUrl);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Missing Google service account credentials in credentials.json.');
  }

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );

  const request = {
    spreadsheetId,
    range: 'Sheet1!A2:F', // Adjust sheet name and range as needed
    auth,
  };

  try {
    const response = await sheets.spreadsheets.values.get(request);
    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in the sheet.');
      return [];
    }

    return rows.map(row => ({
      name: row[0] || '',
      description: row[1] || '',
      phone: row[2] || '',
      email: row[3] || '',
      website: row[4] || '',
      address: row[5] || '',
    }));
  } catch (err) {
    console.error('Google Sheets API error:', err.response?.data || err.message);
    throw new Error('Failed to retrieve business list from Google Sheets.');
  }
}

module.exports = { getBusinessList };