import { getDb } from "./_db.js";
import { json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return error(res, "Method not allowed", 405);

  const sql = getDb();
  try {
    const anime = await sql`
      SELECT * FROM anime_custom
      WHERE is_hidden = FALSE
      ORDER BY id DESC
    `;
    return json(res, { anime });
  } catch (err) {
    console.error("Fetch custom anime error:", err);
    return error(res, "Failed to fetch custom anime", 500);
  }
}
