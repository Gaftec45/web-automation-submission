const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../images');
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR);

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

async function getSheetRows(sheetId, range = 'Sheet1!A2:G') {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  return res.data.values || [];
}

async function getBusinessList(sheetUrl) {
  const sheetId = new URL(sheetUrl).pathname.split('/')[3];
  const rows = await getSheetRows(sheetId);
  const [header, ...data] = [['name', 'description', 'website', 'email', 'phone', 'address'], ...rows];
  return data.map(row => Object.fromEntries(header.map((key, i) => [key, row[i] || ''])));
}

async function getDriveFiles(folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/'`,
    fields: 'files(id, name)',
  });
  return res.data.files || [];
}

async function downloadDriveImage(fileId, savePath) {
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(savePath);
    res.data.pipe(dest);
    dest.on('finish', resolve);
    dest.on('error', reject);
  });
}

async function prepareImage(folderId, index = 0) {
  const files = await getDriveFiles(folderId);
  if (!files.length) throw new Error('No images found in Drive folder');
  const file = files[index % files.length];
  const localPath = path.join(IMAGE_DIR, file.name);
  if (!fs.existsSync(localPath)) {
    console.log(`Downloading image ${file.name}...`);
    await downloadDriveImage(file.id, localPath);
  } else {
    console.log(`Image ${file.name} already exists locally.`);
  }
  return localPath;
}

async function getImageBufferForBusiness(folderId, businessName) {
  const files = await getDriveFiles(folderId);
  const match = files.find(f => f.name.toLowerCase().includes(businessName.toLowerCase()));
  const file = match || files[0];
  if (!file) return null;

  const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}

module.exports = {
  getBusinessList,
  prepareImage,
  getImageBufferForBusiness,
};