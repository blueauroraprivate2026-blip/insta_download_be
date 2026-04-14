const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const youtubedl = require('yt-dlp-exec');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Use /tmp for Render (important)
const DOWNLOAD_DIR = '/tmp';

// ✅ API Route
app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    // ✅ Clean URL
    const cleanUrl = url.split('?')[0];

    const filename = `insta_${Date.now()}.mp4`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    console.log('🚀 Downloading:', cleanUrl);

    // ✅ Download using yt-dlp
    await youtubedl(cleanUrl, {
      output: outputPath,
      format: 'best',
      recodeVideo: 'mp4'
    });

    console.log('✅ File ready:', outputPath);

    // ✅ Send file
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('❌ Send error:', err);
      }

      // 🧹 Cleanup
      try {
        fs.unlinkSync(outputPath);
        console.log('🗑 Deleted:', filename);
      } catch (e) {
        console.log('⚠ Cleanup skipped');
      }
    });

  } catch (err) {
    console.error('❌ Error:', err.message);

    res.status(500).json({
      error: 'Download failed. Make sure the URL is public.'
    });
  }
});

// ✅ Health check (IMPORTANT for testing)
app.get('/', (req, res) => {
  res.send('🚀 Insta Downloader API is running');
});

// ✅ Dynamic port (Render requirement)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});