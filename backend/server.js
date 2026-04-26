import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import youtubedl from 'youtube-dl-exec';
import dotenv from 'dotenv';

dotenv.config();

const { exec } = youtubedl;
const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15,
    message: { error: 'Too many requests, please try again later.' }
});

// URL Validation
const validateUrl = (url) => {
    const ytRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    const igRegex = /^(https?\:\/\/)?(www\.instagram\.com)\/(p|reel|tv)\/.+$/;
    
    if (ytRegex.test(url)) return 'YouTube';
    if (igRegex.test(url)) return 'Instagram';
    return null;
};

// API Endpoint to fetch formats (FIXED FOR SOUND)
app.post('/api/media', limiter, async (req, res) => {
    const { url } = req.body;
    const platform = validateUrl(url);

    if (!platform) {
        return res.status(400).json({ error: 'Please provide a valid YouTube or public Instagram URL.' });
    }

    try {
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true
        });

        // 🚨 THE FIX: Filter formats to ensure SOUND is present
        const formats = output.formats
            .filter(f => f.ext !== 'mhtml')
            .filter(f => {
                const hasVideo = f.vcodec !== 'none';
                const hasAudio = f.acodec !== 'none';
                
                // Keep formats that have BOTH Video and Audio together, OR are pure Audio.
                // This removes the mute video-only formats!
                return (hasVideo && hasAudio) || (!hasVideo && hasAudio);
            })
            .map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution || (f.vcodec === 'none' ? 'Audio Only' : 'Unknown'),
                filesize: f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
            }))
            .reverse();

        res.json({
            platform,
            title: output.title || output.description?.substring(0, 50) || 'Media Content',
            thumbnail: output.thumbnail,
            duration: output.duration_string || (output.duration ? `${output.duration}s` : 'N/A'),
            formats
        });

    } catch (error) {
        console.error("Extraction Error:", error.message);
        res.status(500).json({ 
            error: 'Invalid or Private Content. Ensure the link is public and accessible.' 
        });
    }
});

// High-Speed Download Stream Endpoint
app.get('/api/download', (req, res) => {
    const { url, format_id, ext, title } = req.query;

    if (!url || !format_id) {
        return res.status(400).send('Missing URL or Format ID');
    }

    const safeTitle = (title || 'media_download').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeTitle}.${ext || 'mp4'}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const subprocess = exec(url, {
        format: format_id,
        output: '-', 
        noCheckCertificates: true,
        noWarnings: true,
    });

    subprocess.stdout.pipe(res);

    subprocess.on('error', (error) => {
        console.error('Streaming error:', error);
        if (!res.headersSent) {
            res.status(500).send('Download failed');
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});