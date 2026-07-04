import { getDb } from "./_db.js";
import { getUserFromRequest, json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return error(res, "Not authenticated", 401);

  const sql = getDb();

  // GET — Fetch user's watchlist
  if (req.method === "GET") {
    try {
      const items = await sql`
        SELECT * FROM watchlist
        WHERE user_id = ${user.id}
        ORDER BY added_at DESC
      `;
      return json(res, { watchlist: items });
    } catch (err) {
      console.error("Watchlist GET error:", err);
      return error(res, "Failed to fetch watchlist", 500);
    }
  }

  // POST — Add anime to watchlist
  if (req.method === "POST") {
    const { anime_mal_id, title, image, genres, rating, episodes, watch_status } = req.body;

    if (!anime_mal_id || !title) {
      return error(res, "anime_mal_id and title are required");
    }

    try {
      const genresJson = JSON.stringify(genres || []);
      const result = await sql`
        INSERT INTO watchlist (user_id, anime_mal_id, title, image, genres, rating, episodes, watch_status)
        VALUES (${user.id}, ${anime_mal_id}, ${title}, ${image || ''}, ${genresJson}, ${rating || 0}, ${episodes || 0}, ${watch_status || 'Plan to Watch'})
        ON CONFLICT (user_id, anime_mal_id) DO UPDATE SET
          watch_status = ${watch_status || 'Plan to Watch'},
          image = ${image || ''},
          genres = ${genresJson},
          rating = ${rating || 0},
          episodes = ${episodes || 0}
        RETURNING *
      `;
      return json(res, { message: "Added to watchlist!", item: result[0] }, 201);
    } catch (err) {
      console.error("Watchlist POST error:", err);
      return error(res, "Failed to add to watchlist", 500);
    }
  }

  // PUT — Update watchlist item (status/progress)
  if (req.method === "PUT") {
    const { anime_mal_id, watch_status, progress } = req.body;

    if (!anime_mal_id) {
      return error(res, "anime_mal_id is required");
    }

    try {
      const result = await sql`
        UPDATE watchlist
        SET watch_status = COALESCE(${watch_status}, watch_status),
            progress = COALESCE(${progress}, progress)
        WHERE user_id = ${user.id} AND anime_mal_id = ${anime_mal_id}
        RETURNING *
      `;
      if (result.length === 0) {
        return error(res, "Item not found in watchlist", 404);
      }
      return json(res, { message: "Watchlist updated!", item: result[0] });
    } catch (err) {
      console.error("Watchlist PUT error:", err);
      return error(res, "Failed to update watchlist", 500);
    }
  }

  // DELETE — Remove from watchlist
  if (req.method === "DELETE") {
    const anime_mal_id = req.query.anime_mal_id || req.body?.anime_mal_id;

    if (!anime_mal_id) {
      return error(res, "anime_mal_id is required");
    }

    try {
      await sql`
        DELETE FROM watchlist
        WHERE user_id = ${user.id} AND anime_mal_id = ${parseInt(anime_mal_id)}
      `;
      return json(res, { message: "Removed from watchlist" });
    } catch (err) {
      console.error("Watchlist DELETE error:", err);
      return error(res, "Failed to remove from watchlist", 500);
    }
  }

  return error(res, "Method not allowed", 405);
}
