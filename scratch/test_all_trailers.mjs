import fs from 'fs';

async function run() {
  const data = JSON.parse(fs.readFileSync('./src/data/animeDatabase.json', 'utf8'));
  const results = [];
  results.push(`Total anime in database: ${data.length}`);

  for (const a of data) {
    if (a.trailer_url) {
      const match = a.trailer_url.match(/embed\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const vid = match[1];
        const thumbUrl = `https://img.youtube.com/vi/${vid}/0.jpg`;
        try {
          const res = await fetch(thumbUrl);
          if (!res.ok || res.status === 404) {
            results.push(`[DEAD] ID ${a.id} (${a.title}): ${a.trailer_url} -> status ${res.status}`);
          }
        } catch (e) {
          results.push(`[ERROR] ID ${a.id} (${a.title}): ${e.message}`);
        }
      } else {
        results.push(`[BAD FORMAT] ID ${a.id} (${a.title}): ${a.trailer_url}`);
      }
    } else {
      results.push(`[MISSING] ID ${a.id} (${a.title})`);
    }
  }
  fs.writeFileSync('./scratch/out.txt', results.join('\n'), 'utf8');
}
run();
