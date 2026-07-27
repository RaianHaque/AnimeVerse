import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const updates = [
    { t: 'Solo Leveling', i: 'https://cdn.myanimelist.net/images/anime/1090/141019l.jpg' },
    { t: 'Chainsaw Man', i: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg' },
    { t: 'One Punch Man', i: 'https://cdn.myanimelist.net/images/anime/12/76049l.jpg' },
    { t: 'Bleach', i: 'https://cdn.myanimelist.net/images/anime/1764/126627l.jpg' },
    { t: 'Jujutsu Kaisen', i: 'https://cdn.myanimelist.net/images/anime/1792/138022l.jpg' }
  ];

  for (const u of updates) {
    const res = await sql`UPDATE anime_custom SET image = ${u.i} WHERE title ILIKE ${'%' + u.t + '%'}`;
    console.log(`Updated ${u.t}:`, res);
  }

  const all = await sql`SELECT id, title, image FROM anime_custom`;
  console.log("Current anime_custom in DB:", JSON.stringify(all, null, 2));
}

main().catch(console.error);
