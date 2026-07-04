import { getDb } from "../_db.js";
import { getUserFromRequest, json, error, setCors } from "../_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return error(res, "Method not allowed", 405);

  const tokenUser = getUserFromRequest(req);
  if (!tokenUser) return error(res, "Not authenticated", 401);

  const sql = getDb();

  try {
    const users = await sql`
      SELECT id, username, email, bio, avatar_url, created_at
      FROM users WHERE id = ${tokenUser.id} LIMIT 1
    `;

    if (users.length === 0) {
      return error(res, "User not found", 404);
    }

    json(res, { user: users[0] });
  } catch (err) {
    console.error("Me error:", err);
    error(res, "Failed to fetch user", 500);
  }
}
