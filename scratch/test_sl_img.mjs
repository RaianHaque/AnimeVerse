import fs from 'fs';

async function checkUrls() {
  const urls = [
    "https://cdn.myanimelist.net/images/anime/1090/141019l.jpg",
    "https://cdn.myanimelist.net/images/anime/1090/141019.jpg",
    "https://cdn.myanimelist.net/images/anime/1799/140461l.jpg",
    "https://cdn.myanimelist.net/images/anime/1799/140461.jpg",
    "https://cdn.myanimelist.net/images/anime/1162/140901l.jpg",
    "https://cdn.myanimelist.net/images/anime/1208/140645l.jpg",
    "https://cdn.myanimelist.net/images/anime/1484/140960l.jpg",
    "https://cdn.myanimelist.net/images/anime/1912/141378l.jpg",
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx175206-mO2S6bXp0O2V.jpg",
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gX3niBLLhL.png",
    "https://img.flawlessfiles.com/_r/300x400/100/ec/e2/ece21b2d354b3bf07abcb8e1824bba74/ece21b2d354b3bf07abcb8e1824bba74.jpg"
  ];

  const results = [];
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      results.push(`${u} -> ${res.status} (${res.headers.get('content-type')})`);
    } catch (e) {
      results.push(`${u} -> ERROR: ${e.message}`);
    }
  }
  fs.writeFileSync('./scratch/sl_img_res.txt', results.join('\n'), 'utf8');
}
checkUrls();
