const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const YTDLP = `C:\\Users\\Admin\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe`;

const app = express();
app.use(cors());
app.use(express.json());


const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    // ✅ Clean Instagram URL (remove ?params)
    const cleanUrl = url.split('?')[0];

    // 🎯 Dynamic filename
    const filenameBase = `insta_${Date.now()}`;
    const outputTemplate = path.join(DOWNLOAD_DIR, `${filenameBase}.%(ext)s`);

    // ✅ FINAL WORKING COMMAND (IMPORTANT)
    const cmd = `"${YTDLP}" -f best --recode-video mp4 -o "${outputTemplate}" "${cleanUrl}"`;

    console.log('🚀 Running:', cmd);

    // ▶️ Run yt-dlp
    await execPromise(cmd);

    // 🧠 Find actual file
    const files = fs.readdirSync(DOWNLOAD_DIR);
    console.log('📂 Files:', files);

    const matchedFile = files.find(f => f.startsWith(filenameBase));

    if (!matchedFile) {
      return res.status(404).json({ error: 'File not found after download' });
    }

    const finalPath = path.join(DOWNLOAD_DIR, matchedFile);

    console.log('✅ Sending file:', finalPath);

    // 📤 Send file
    res.download(finalPath, matchedFile, (err) => {
      if (err) {
        console.error('❌ Send error:', err);
      }

      // 🧹 Delete after sending
      try {
        fs.unlinkSync(finalPath);
        console.log('🗑 Deleted:', matchedFile);
      } catch (e) {
        console.log('⚠ Already removed');
      }
    });

  } catch (err) {
    console.error('❌ Download error:', err.message);

    res.status(500).json({
      error: 'Download failed. Make sure the URL is public.'
    });
  }
});

// 🚀 Start server
app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});