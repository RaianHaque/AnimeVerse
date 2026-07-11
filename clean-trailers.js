const fs = require('fs');
const path = require('path');
const https = require('https');

const dbPath = path.join(__dirname, 'src', 'data', 'animeDatabase.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

function extractVideoId(url) {
  if (!url) return null;
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function checkVideo(videoId) {
  return new Promise((resolve) => {
    // Check if the maxresdefault thumbnail exists (YouTube returns 404 for deleted/private videos)
    const req = https.get(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
  });
}

async function run() {
  let fixedCount = 0;
  for (const anime of db) {
    if (anime.trailer_url) {
      const vid = extractVideoId(anime.trailer_url);
      if (vid) {
        const isAlive = await checkVideo(vid);
        if (!isAlive) {
          console.log(`[DEAD] ${anime.title} - ${anime.trailer_url}`);
          anime.trailer_url = ""; // Clear broken trailer
          fixedCount++;
        } else {
          console.log(`[OK] ${anime.title} - ${vid}`);
        }
      }
    }
  }
  
  if (fixedCount > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Fixed ${fixedCount} broken trailers by removing them.`);
  } else {
    console.log('No broken trailers found!');
  }
}

run();
