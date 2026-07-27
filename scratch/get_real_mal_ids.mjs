import fs from 'fs';

const targets = [
  "Chainsaw Man Reze",
  "One Punch Man Season 3",
  "Thousand-Year Blood War - The Conflict",
  "Jujutsu Kaisen Culling Game"
];

async function run() {
  for (const q of targets) {
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const data = await res.json();
      const a = data.data?.[0];
      if (a) {
        console.log(`[${q}] -> MAL ID: ${a.mal_id} -> ${a.images?.jpg?.large_image_url || a.images?.jpg?.image_url}`);
      } else {
        console.log(`[${q}] -> NOT FOUND`);
      }
    } catch (err) {
      console.log(`[${q}] -> ERROR: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1200));
  }
}

run();
