import { getDb } from "./_db.js";
import { getUserFromRequest, json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return error(res, "Not authenticated", 401);

  const sql = getDb();

  // GET — Fetch profile data + stats
  if (req.method === "GET") {
    try {
      const users = await sql`
        SELECT id, username, email, bio, avatar_url, created_at
        FROM users WHERE id = ${user.id} LIMIT 1
      `;

      if (users.length === 0) return error(res, "User not found", 404);

      // Fetch stats
      const watchlistCount = await sql`
        SELECT COUNT(*) as count FROM watchlist WHERE user_id = ${user.id}
      `;
      const completedCount = await sql`
        SELECT COUNT(*) as count FROM watchlist
        WHERE user_id = ${user.id} AND watch_status = 'Completed'
      `;
      const reviewCount = await sql`
        SELECT COUNT(*) as count FROM reviews WHERE user_id = ${user.id}
      `;

      // Fetch recent activity (latest watchlist changes)
      const recentWatchlist = await sql`
        SELECT title, watch_status, added_at FROM watchlist
        WHERE user_id = ${user.id}
        ORDER BY added_at DESC
        LIMIT 5
      `;

      // Fetch user reviews
      const userReviews = await sql`
        SELECT anime_title, rating, review_text, created_at FROM reviews
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      return json(res, {
        user: users[0],
        stats: {
          watchlist_total: parseInt(watchlistCount[0].count),
          completed: parseInt(completedCount[0].count),
          reviews: parseInt(reviewCount[0].count),
        },
        recent_watchlist: recentWatchlist,
        user_reviews: userReviews,
      });
    } catch (err) {
      console.error("Profile GET error:", err);
      return error(res, "Failed to fetch profile", 500);
    }
  }

  // PUT — Update profile
  if (req.method === "PUT") {
    const { username, bio, email: newEmail } = req.body;

    try {
      const result = await sql`
        UPDATE users
        SET username = COALESCE(${username}, username),
            bio = COALESCE(${bio}, bio),
            email = COALESCE(${newEmail}, email)
        WHERE id = ${user.id}
        RETURNING id, username, email, bio, avatar_url, created_at
      `;

      if (result.length === 0) return error(res, "User not found", 404);

      return json(res, { message: "Profile updated!", user: result[0] });
    } catch (err) {
      console.error("Profile PUT error:", err);
      if (err.message?.includes("unique")) {
        return error(res, "Username or email already taken", 409);
      }
      return error(res, "Failed to update profile", 500);
    }
  }

  return error(res, "Method not allowed", 405);
}
