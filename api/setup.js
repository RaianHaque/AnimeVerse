import { getDb } from "./_db.js";
import { json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return error(res, "Method not allowed", 405);

  const sql = getDb();

  try {
    // Create users table with role support
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        role VARCHAR(20) DEFAULT 'user',
        admin_permissions JSONB DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add role column if table exists but column doesn't
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='admin_permissions') THEN
          ALTER TABLE users ADD COLUMN admin_permissions JSONB DEFAULT NULL;
        END IF;
      END $$;
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
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add is_read column if missing
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='is_read') THEN
          ALTER TABLE contact_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
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
        is_hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, anime_mal_id)
      )
    `;

    // Add is_hidden column if missing
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='is_hidden') THEN
          ALTER TABLE reviews ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `;

    // Create custom anime table (for admin-added anime)
    await sql`
      CREATE TABLE IF NOT EXISTS anime_custom (
        id SERIAL PRIMARY KEY,
        mal_id INTEGER UNIQUE,
        title VARCHAR(255) NOT NULL,
        title_english VARCHAR(255),
        title_japanese VARCHAR(255),
        synopsis TEXT,
        score DECIMAL(4,2) DEFAULT 0,
        scored_by INTEGER DEFAULT 0,
        rank_num INTEGER,
        popularity INTEGER,
        episodes INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Finished Airing',
        type VARCHAR(20) DEFAULT 'TV',
        source VARCHAR(50),
        duration VARCHAR(50),
        rating VARCHAR(50),
        aired_string TEXT,
        season VARCHAR(20),
        year INTEGER,
        genres TEXT DEFAULT '[]',
        themes TEXT DEFAULT '[]',
        demographics TEXT DEFAULT '[]',
        studios TEXT DEFAULT '[]',
        image TEXT DEFAULT '',
        trailer_url TEXT DEFAULT '',
        characters TEXT DEFAULT '[]',
        trending BOOLEAN DEFAULT FALSE,
        top_rated BOOLEAN DEFAULT FALSE,
        is_hidden BOOLEAN DEFAULT FALSE,
        added_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    json(res, {
      message: "All tables created successfully!",
      tables: ["users", "watchlist", "contact_messages", "reviews", "anime_custom"],
    });
  } catch (err) {
    console.error("Setup error:", err);
    error(res, "Failed to create tables: " + err.message, 500);
  }
}
