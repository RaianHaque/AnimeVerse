import { getDb } from "./_db.js";
import { getUserFromRequest, json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const sql = getDb();

  // GET — Fetch reviews for an anime (public)
  if (req.method === "GET") {
    const { anime_id } = req.query;
    try {
      let reviews;
      if (anime_id) {
        reviews = await sql`
          SELECT r.*, u.username FROM reviews r
          JOIN users u ON r.user_id = u.id
          WHERE r.anime_mal_id = ${parseInt(anime_id)}
          ORDER BY r.created_at DESC
        `;
      } else {
        reviews = await sql`
          SELECT r.*, u.username FROM reviews r
          JOIN users u ON r.user_id = u.id
          ORDER BY r.created_at DESC
          LIMIT 50
        `;
      }
      return json(res, { reviews });
    } catch (err) {
      console.error("Reviews GET error:", err);
      return error(res, "Failed to fetch reviews", 500);
    }
  }

  // POST — Submit a review (auth required)
  if (req.method === "POST") {
    const user = getUserFromRequest(req);
    if (!user) return error(res, "Not authenticated", 401);

    const { anime_mal_id, anime_title, rating, review_text } = req.body;

    if (!anime_mal_id || !anime_title || !rating || !review_text) {
      return error(res, "All fields are required");
    }

    if (rating < 1 || rating > 10) {
      return error(res, "Rating must be between 1 and 10");
    }

    try {
      const result = await sql`
        INSERT INTO reviews (user_id, anime_mal_id, anime_title, rating, review_text)
        VALUES (${user.id}, ${anime_mal_id}, ${anime_title}, ${rating}, ${review_text})
        ON CONFLICT (user_id, anime_mal_id) DO UPDATE SET
          rating = ${rating},
          review_text = ${review_text},
          created_at = NOW()
        RETURNING *
      `;
      return json(res, { message: "Review submitted!", review: result[0] }, 201);
    } catch (err) {
      console.error("Reviews POST error:", err);
      return error(res, "Failed to submit review", 500);
    }
  }

  return error(res, "Method not allowed", 405);
}
