import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const updates = [
    { t: 'Solo Leveling', i: 'https://cdn.myanimelist.net/images/anime/1448/147351l.jpg', tr: 'https://www.youtube.com/embed/GDMXGzjJzS4' },
    { t: 'Chainsaw Man', i: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', tr: 'https://www.youtube.com/embed/jk7QSGwupPA' },
    { t: 'One Punch Man', i: 'https://cdn.myanimelist.net/images/anime/12/76049l.jpg', tr: 'https://www.youtube.com/embed/ExUMiF1L0HA' },
    { t: 'Bleach', i: 'https://cdn.myanimelist.net/images/anime/1541/147774l.jpg', tr: 'https://www.youtube.com/embed/0yk5H6vvfG4' },
    { t: 'Jujutsu Kaisen', i: 'https://cdn.myanimelist.net/images/anime/1792/138022l.jpg', tr: 'https://www.youtube.com/embed/PKHQuQF1S8k' }
  ];

  for (const u of updates) {
    const res = await sql`UPDATE anime_custom SET image = ${u.i}, trailer_url = ${u.tr} WHERE title ILIKE ${'%' + u.t + '%'}`;
    console.log(`Updated ${u.t}:`, res);
  }

  const all = await sql`SELECT id, title, image, trailer_url FROM anime_custom`;
  console.log("Current anime_custom in DB:", JSON.stringify(all, null, 2));
}

main().catch(console.error);
