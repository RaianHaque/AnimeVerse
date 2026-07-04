import { getDb } from "./_db.js";
import { json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return error(res, "Method not allowed", 405);

  const sql = getDb();

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create watchlist table
    await sql`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        anime_mal_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        image TEXT DEFAULT '',
        genres TEXT DEFAULT '[]',
        rating DECIMAL(3,1) DEFAULT 0,
        episodes INTEGER DEFAULT 0,
        watch_status VARCHAR(30) DEFAULT 'Plan to Watch',
        progress INTEGER DEFAULT 0,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, anime_mal_id)
      )
    `;

    // Create contact_messages table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(100) DEFAULT 'General',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        anime_mal_id INTEGER NOT NULL,
        anime_title VARCHAR(255) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        review_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, anime_mal_id)
      )
    `;

    json(res, { message: "All tables created successfully!", tables: ["users", "watchlist", "contact_messages", "reviews"] });
  } catch (err) {
    console.error("Setup error:", err);
    error(res, "Failed to create tables: " + err.message, 500);
  }
}
