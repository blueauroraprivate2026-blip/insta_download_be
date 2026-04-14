const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Render temp directory
const DOWNLOAD_DIR = '/tmp';

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const cleanUrl = url.split('?')[0];

    const filename = `insta_${Date.now()}.mp4`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    // ✅ Use yt-dlp binary (no python needed)
    const cmd = `yt-dlp -f best --recode-video mp4 -o "${outputPath}" "${cleanUrl}"`;

    console.log('🚀 Running:', cmd);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Exec error:', error);
        return res.status(500).json({ error: 'Download failed' });
      }

      console.log('✅ Download complete');

      res.download(outputPath, filename, (err) => {
        if (err) console.error('❌ Send error:', err);

        // cleanup
        try {
          fs.unlinkSync(outputPath);
        } catch {}
      });
    });

  } catch (err) {
    console.error('❌ Error:', err.message);

    res.status(500).json({
      error: 'Download failed. Make sure the URL is public.'
    });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🚀 Backend running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));