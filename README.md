# 📥 Universal Media Fetcher

A modern, full-stack web application that allows users to fetch and securely download media (video/audio) from platforms like YouTube and Instagram. Built with React, Node.js, and yt-dlp.

## ✨ Features
* **Platform Support:** Automatically detects and processes YouTube and public Instagram links.
* **Smart Downloads:** Direct, high-speed streaming downloads that bypass platform throttling.
* **Audio Guarantee:** Automatically filters and provides only those formats that contain both video and audio.
* **Modern UI:** Built with React, Vite, and Tailwind CSS.
* **Dark/Light Mode:** Seamless theme switching with local storage memory.
* **History Tracking:** Keeps track of your 5 most recently fetched links.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Node.js, Express.js, ES6 Modules
* **Core Engine:** `youtube-dl-exec` (Node wrapper for yt-dlp)
* **Security:** `express-rate-limit`, `cors`

## 🚀 How to Run Locally

### Prerequisites
* Node.js installed
* **Python 3** and **FFmpeg** installed (Required for yt-dlp to process media)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/universal-media-fetcher.git
cd universal-media-fetcher
\`\`\`

### 2. Setup Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
*(Backend will start on http://localhost:5000)*

### 3. Setup Frontend
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*(Frontend will start on http://localhost:5173)*

## ⚠️ Disclaimer
**For Educational Purposes Only.** This tool is created to demonstrate full-stack development, API integration, and media stream handling. Users must ensure they have the explicit right, permission, or ownership of the content they are downloading. Respect copyright laws and platform Terms of Service.
