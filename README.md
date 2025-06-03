# 🤖 Automation Bot Suite

Automate content posting across **Medium**, **Pinterest**, and **LinkedIn** using Playwright, Google Sheets, and Google Drive.

## 🛠️ Requirements

- Node.js 18+
- A Google Service Account
- A Google Sheet with business data
- A Google Drive folder containing images
- LinkedIn, Medium, and Pinterest accounts (authenticated manually once)
- Playwright browser automation

---

## 📦 Installation

```bash
git clone https://github.com/Gaftec45/web-automation-submission.git
npm install
npx playwright install
```

---

## 🔑 Google API Setup

1. Create a [Google Cloud Project](https://console.cloud.google.com/).
2. Enable:
   - Google Sheets API
   - Google Drive API
3. Create a **Service Account** and download the JSON key.
4. Share the Google Sheet and Google Drive folder with the service account email.

---

## 📝 Google Sheet Format

| name | description | website | email | phone | address |
|------|-------------|---------|-------|-------|---------|
| Business A | We offer... | https://... | support@... | 123-456-7890 | 123 Street, City |

---

## 📂 Google Drive Setup

- Upload your images to a folder.
- Each image can either:
  - Be named after the business (e.g. `Business_A.jpg`)
  - Or be randomly picked if there's no matching name.

---

## 🧪 First-Time Authentication

You need to manually log in once for each platform to save session cookies:

```bash
node auth/linkedinAuth.js      # Logs in and saves session
node auth/mediumAuth.js
node auth/pinterestAuth.js
```

> Session data is saved under: `auths/storageState/<platform>.json`

---

## 🚀 Running the Server

```bash
node app.js
```

Visit the dashboard in your browser at:  
**http://localhost:3000**

---

## 🖥️ Bot Dashboard

From the dashboard, click to launch:
- 📘 Medium Bot
- 📌 Pinterest Bot
- 🔗 LinkedIn Bot

Each bot will:
- Read your business list from Google Sheets
- Find and upload an image from Google Drive
- Post the business info automatically

---

## 📸 Image Handling

- **Primary Source:** Google Drive folder
- **Fallback:** `/utils/images/` local folder
- Logs any image that couldn't be found

---

## 🧼 Maintenance Tips

- Reuse the same Google Sheet and Drive folder
- Refresh login sessions every 30–60 days if needed
- Remove unused images from `/utils/images/` if not needed

---

## 👨‍💻 Contributing

Feel free to fork and improve this project. Pull Requests are welcome!

---

## 🛡️ Disclaimer

This tool uses automated browser actions via Playwright. Make sure your usage complies with the terms of each platform (Medium, Pinterest, LinkedIn). Abuse may lead to bans or restrictions.

---
