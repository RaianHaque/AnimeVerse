import 'dotenv/config';
import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`SELECT id, title, image FROM custom_anime`;
  fs.writeFileSync('d:/Class/4th Sem Winter 2026/Frontend/Project Proposal/FinalTermProject/scratch/db_dump.json', JSON.stringify(rows, null, 2), 'utf8');
}

main().catch(err => {
  fs.writeFileSync('d:/Class/4th Sem Winter 2026/Frontend/Project Proposal/FinalTermProject/scratch/db_dump.json', JSON.stringify({ error: err.message }), 'utf8');
  process.exit(1);
});
