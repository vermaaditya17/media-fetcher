import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import youtubedl from 'youtube-dl-exec';
const { exec } = youtubedl;
import dotenv from 'dotenv';
import fs from 'fs'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// YEH NAYA JAADUI CODE: Read-Only ko bypass karne ke liye
let cookiePath = 'cookies.txt'; // Default: Local PC ke liye

try {
    // Check karega ki kya yeh Render par chal raha hai
    if (fs.existsSync('/etc/secrets/cookies.txt')) {
        // Read-Only file ko Writable folder (/tmp/) mein copy kar dega
        fs.copyFileSync('/etc/secrets/cookies.txt', '/tmp/cookies.txt');
        cookiePath = '/tmp/cookies.txt'; // Ab yt-dlp is nai writable file ko use karega
        console.log('✅ Cookies file successfully copied to writable temp folder!');
    }
} catch (err) {
    console.error('Cookie copy karne mein error aayi:', err);
}

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: { error: 'Too many requests, please try again later.' }
});

const validateUrl = (url) => {
    const ytRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    const igRegex = /^(https?\:\/\/)?(www\.instagram\.com)\/(p|reel|tv)\/.+$/;
    if (ytRegex.test(url)) return 'YouTube';
    if (igRegex.test(url)) return 'Instagram';
    return null;
};

// Fetch Metadata with Sound Guarantee
app.post('/api/media', limiter, async (req, res) => {
    const { url } = req.body;
    const platform = validateUrl(url);

    if (!platform) return res.status(400).json({ error: 'Valid YouTube/Instagram link de bhai!' });

    try {
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            cookies: cookiePath ,
            extractorArgs: 'youtube:player_client=android'
        });

        const formats = output.formats
            .filter(f => f.ext !== 'mhtml' && ((f.vcodec !== 'none' && f.acodec !== 'none') || (f.vcodec === 'none' && f.acodec !== 'none')))
            .map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution || (f.vcodec === 'none' ? 'Audio Only' : 'Unknown'),
                filesize: f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
            }))
            .reverse();

        res.json({
            platform,
            title: output.title || 'Media File',
            thumbnail: output.thumbnail,
            duration: output.duration_string || 'N/A',
            formats
        });
    } catch (error) {
        console.error("YTDLP ASLI ERROR ----> :", error.message || error);
        res.status(500).json({ error: 'Private ya Invalid content hai.' });
    }
});

// Fast Download Streaming
app.get('/api/download', (req, res) => {
    const { url, format_id, ext, title } = req.query;
    if (!url || !format_id) return res.status(400).send('URL or Format missing');

    const safeTitle = (title || 'download').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext || 'mp4'}"`);

    const subprocess = exec(url, {
        format: format_id,
        output: '-',
        noCheckCertificates: true,
        cookies: cookiePath, // Update kiya hua path
        extractorArgs: 'youtube:player_client=android'
    });

    subprocess.stdout.pipe(res);
    subprocess.on('error', () => !res.headersSent && res.status(500).send('Error'));
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));