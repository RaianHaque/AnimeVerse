import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const updates = [
    { t: 'Solo Leveling', i: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/tN1511AAsz5D6H90zRGEqjAGr4q.jpg' },
    { t: 'Chainsaw Man', i: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/100K0d8WJ56qgK90Z1uA2b34720.jpg' },
    { t: 'One Punch Man', i: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/iE3s0lG5QlH8N6Q80pXpT09XW9e.jpg' },
    { t: 'Bleach', i: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg' },
    { t: 'Jujutsu Kaisen', i: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/f4Yq7A42E351U220u2E98U4G8A5.jpg' }
  ];

  console.log("Updating database with reliable TMDB image URLs...");
  for (const u of updates) {
    await sql`UPDATE custom_anime SET image = ${u.i} WHERE title ILIKE ${'%' + u.t + '%'}`;
    console.log(`Updated DB image for ${u.t} -> ${u.i}`);
  }
  console.log("Database update complete!");
}

main().catch(err => {
  console.error("DB Update Error:", err);
  process.exit(1);
});
