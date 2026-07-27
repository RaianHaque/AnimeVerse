import fs from 'fs';
import path from 'path';

const bannersDir = path.resolve('public/banners');
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}

const queries = [
  { name: 'solo-leveling-s2.jpg', search: 'Solo Leveling Season 2' },
  { name: 'chainsaw-man-reze.jpg', search: 'Chainsaw Man Reze' },
  { name: 'one-punch-man-s3.jpg', search: 'One Punch Man 3' },
  { name: 'bleach-tybw-3.jpg', search: 'Bleach Thousand-Year Blood War Part 3' },
  { name: 'jujutsu-kaisen-s3.jpg', search: 'Jujutsu Kaisen Culling Game' }
];

const graphqlQuery = `
query ($search: String) {
  Media (search: $search, type: ANIME) {
    id
    title {
      romaji
      english
    }
    coverImage {
      extraLarge
      large
    }
  }
}
`;

async function fetchFromAniList(search) {
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ query: graphqlQuery, variables: { search } })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const media = data.data?.Media;
    if (!media) throw new Error('No media found');
    console.log(`Found "${media.title.romaji || media.title.english}": ${media.coverImage.extraLarge || media.coverImage.large}`);
    return media.coverImage.extraLarge || media.coverImage.large;
  } catch (err) {
    console.log(`AniList search failed for "${search}": ${err.message}`);
    return null;
  }
}

async function fetchFromJikan(search) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const media = data.data?.[0];
    if (!media) throw new Error('No media found');
    const url = media.images?.webp?.large_image_url || media.images?.jpg?.large_image_url || media.images?.jpg?.image_url;
    console.log(`Found Jikan "${media.title}": ${url}`);
    return url;
  } catch (err) {
    console.log(`Jikan search failed for "${search}": ${err.message}`);
    return null;
  }
}

async function downloadImage(url, dest) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://anilist.co/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) throw new Error(`File too small (${buffer.length} bytes)`);
    fs.writeFileSync(dest, buffer);
    console.log(`SUCCESS: Saved ${path.basename(dest)} (${buffer.length} bytes)`);
    return true;
  } catch (err) {
    console.log(`Download failed from ${url}: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const q of queries) {
    const dest = path.join(bannersDir, q.name);
    console.log(`\n--- Processing ${q.name} ---`);
    let url = await fetchFromAniList(q.search);
    if (!url) url = await fetchFromJikan(q.search);
    
    if (url) {
      const ok = await downloadImage(url, dest);
      if (!ok && url.includes('anilist')) {
        console.log('Trying Jikan fallback...');
        const url2 = await fetchFromJikan(q.search);
        if (url2) await downloadImage(url2, dest);
      }
    } else {
      console.log(`Could not find any URL for ${q.search}`);
    }
  }
}

run();
