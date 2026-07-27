import fs from 'fs';
import path from 'path';

const bannersDir = path.resolve('public/banners');
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}

const targets = [
  {
    name: 'solo-leveling-s2.jpg',
    urls: [
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx175206-mO2S6bXp0O2V.jpg',
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gX3jwR88g2.jpg',
      'https://media.kitsu.io/anime/48028/poster_image/large-81498b584d4b179374092b3a1a6b0c2a.jpeg',
      'https://image.tmdb.org/t/p/w600_and_h900_bestv2/tN1511AAsz5D6H90zRGEqjAGr4q.jpg'
    ]
  },
  {
    name: 'chainsaw-man-reze.jpg',
    urls: [
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171698-cKpQYQp1T5u1.jpg',
      'https://media.kitsu.io/anime/48293/poster_image/large-2dc62bbd512a382c40c11516eef218dd.jpeg',
      'https://image.tmdb.org/t/p/w600_and_h900_bestv2/100K0d8WJ56qgK90Z1uA2b34720.jpg'
    ]
  },
  {
    name: 'one-punch-man-s3.jpg',
    urls: [
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153682-9t1FSt1WftLz.png',
      'https://media.kitsu.io/anime/46366/poster_image/large-db57b280bfbc0ffea9cfecbfb64379e4.jpeg',
      'https://image.tmdb.org/t/p/w600_and_h900_bestv2/iE3s0lG5QlH8N6Q80pXpT09XW9e.jpg'
    ]
  },
  {
    name: 'bleach-tybw-3.jpg',
    urls: [
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171624-9bV0Qf3uQ95F.jpg',
      'https://media.kitsu.io/anime/48281/poster_image/large-a0bc7c3e5a596009ecdb4806a13d6a27.jpeg',
      'https://image.tmdb.org/t/p/w600_and_h900_bestv2/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg'
    ]
  },
  {
    name: 'jujutsu-kaisen-s3.jpg',
    urls: [
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171625-v0k2x1j4F6P1.jpg',
      'https://media.kitsu.io/anime/48282/poster_image/large-b48e364e5e4d2938a7c2b5e7d4469279.jpeg',
      'https://image.tmdb.org/t/p/w600_and_h900_bestv2/f4Yq7A42E351U220u2E98U4G8A5.jpg'
    ]
  }
];

async function downloadFile(url, dest) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) throw new Error(`File too small (${buffer.length} bytes)`);
    fs.writeFileSync(dest, buffer);
    return true;
  } catch (err) {
    clearTimeout(id);
    console.log(`Failed ${url}: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const t of targets) {
    const dest = path.join(bannersDir, t.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`Already exists: ${t.name}`);
      continue;
    }
    let success = false;
    for (const url of t.urls) {
      console.log(`Trying ${url} -> ${t.name}...`);
      if (await downloadFile(url, dest)) {
        console.log(`SUCCESS: Downloaded ${t.name} (${fs.statSync(dest).size} bytes)`);
        success = true;
        break;
      }
    }
    if (!success) {
      console.error(`FAILED all URLs for ${t.name}`);
    }
  }
}

run();
