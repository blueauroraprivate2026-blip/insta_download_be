const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const youtubedl = require('yt-dlp-exec');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Render temp directory
const DOWNLOAD_DIR = '/tmp';

app.post('/download', async (req, res) => {
  const { url, quality, audio } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const cleanUrl = url.split('?')[0];

    const filename = `insta_${Date.now()}.mp4`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    console.log('🚀 Downloading:', cleanUrl);

    // ✅ Build format dynamically
    let format = 'bestvideo+bestaudio/best';

    if (!audio) {
      format = 'bestvideo';
    }

    if (quality === '480p') {
      format = 'bestvideo[height<=480]+bestaudio/best';
    } else if (quality === '720p') {
      format = 'bestvideo[height<=720]+bestaudio/best';
    } else if (quality === '1080p') {
      format = 'bestvideo[height<=1080]+bestaudio/best';
    }

    // ✅ Run yt-dlp (no exec, no apt-get)
    await youtubedl(cleanUrl, {
      output: outputPath,
      format: format,
      mergeOutputFormat: 'mp4',
      noCheckCertificates: true,
      noWarnings: true
    });

    console.log('✅ File ready:', outputPath);

    // ✅ Send file to frontend
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
    console.error('❌ FULL ERROR:', err);

    res.status(500).json({
      error: 'Download failed. Instagram may be blocking the request.'
    });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🚀 Insta Downloader API is running');
});

// ✅ Port (Render compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});