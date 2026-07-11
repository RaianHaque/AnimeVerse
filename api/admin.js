import { getDb } from "./_db.js";
import { getUserFromRequest, requireAdmin, requireSuperAdmin, hasPermission, json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const sql = getDb();
  const { action } = req.query;

  // ─── STATS ────────────────────────────────────────────────
  if (action === "stats" && req.method === "GET") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);

    try {
      const [users] = await sql`SELECT COUNT(*)::int as count FROM users`;
      const [reviews] = await sql`SELECT COUNT(*)::int as count FROM reviews WHERE is_hidden = FALSE`;
      const [watchlist] = await sql`SELECT COUNT(*)::int as count FROM watchlist`;
      const [messages] = await sql`SELECT COUNT(*)::int as count FROM contact_messages`;
      const [admins] = await sql`SELECT COUNT(*)::int as count FROM users WHERE role IN ('admin', 'super_admin')`;
      const [customAnime] = await sql`SELECT COUNT(*)::int as count FROM anime_custom WHERE is_hidden = FALSE`;

      return json(res, {
        stats: {
          total_users: users.count,
          total_reviews: reviews.count,
          total_watchlist: watchlist.count,
          total_messages: messages.count,
          total_admins: admins.count,
          total_custom_anime: customAnime.count,
        },
      });
    } catch (err) {
      console.error("Admin stats error:", err);
      return error(res, "Failed to fetch stats", 500);
    }
  }

  // ─── USERS ────────────────────────────────────────────────
  if (action === "users" && req.method === "GET") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "view_users")) return error(res, "Permission denied", 403);

    try {
      const users = await sql`
        SELECT id, username, email, role, admin_permissions, bio, avatar_url, created_at
        FROM users ORDER BY created_at DESC LIMIT 200
      `;
      return json(res, { users });
    } catch (err) {
      console.error("Admin users error:", err);
      return error(res, "Failed to fetch users", 500);
    }
  }

  if (action === "users" && req.method === "DELETE") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { user_id } = req.body;
    if (!user_id) return error(res, "user_id required");

    // Prevent deleting self
    if (user_id === admin.id) return error(res, "Cannot delete yourself");

    try {
      await sql`DELETE FROM users WHERE id = ${user_id} AND role != 'super_admin'`;
      return json(res, { message: "User deleted" });
    } catch (err) {
      console.error("Admin delete user error:", err);
      return error(res, "Failed to delete user", 500);
    }
  }

  // ─── ADMIN MANAGEMENT (Super Admin Only) ──────────────────
  if (action === "manage-admins" && req.method === "GET") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    try {
      const admins = await sql`
        SELECT id, username, email, role, admin_permissions, created_at
        FROM users WHERE role IN ('admin', 'super_admin')
        ORDER BY role DESC, created_at ASC
      `;
      return json(res, { admins });
    } catch (err) {
      return error(res, "Failed to fetch admins", 500);
    }
  }

  if (action === "promote" && req.method === "POST") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { user_id, permissions } = req.body;
    if (!user_id) return error(res, "user_id required");

    const defaultPerms = {
      manage_anime: true,
      moderate_reviews: true,
      view_messages: true,
      view_users: true,
      manage_anime_delete: false,
    };

    try {
      const result = await sql`
        UPDATE users
        SET role = 'admin', admin_permissions = ${JSON.stringify(permissions || defaultPerms)}
        WHERE id = ${user_id} AND role = 'user'
        RETURNING id, username, email, role, admin_permissions
      `;
      if (result.length === 0) return error(res, "User not found or already admin");
      return json(res, { message: "User promoted to admin", user: result[0] });
    } catch (err) {
      console.error("Promote error:", err);
      return error(res, "Failed to promote user", 500);
    }
  }

  if (action === "demote" && req.method === "POST") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { user_id } = req.body;
    if (!user_id) return error(res, "user_id required");

    try {
      await sql`
        UPDATE users SET role = 'user', admin_permissions = NULL
        WHERE id = ${user_id} AND role = 'admin'
      `;
      return json(res, { message: "Admin demoted to user" });
    } catch (err) {
      return error(res, "Failed to demote admin", 500);
    }
  }

  if (action === "update-permissions" && req.method === "POST") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { user_id, permissions } = req.body;
    if (!user_id || !permissions) return error(res, "user_id and permissions required");

    try {
      await sql`
        UPDATE users SET admin_permissions = ${JSON.stringify(permissions)}
        WHERE id = ${user_id} AND role = 'admin'
      `;
      return json(res, { message: "Permissions updated" });
    } catch (err) {
      return error(res, "Failed to update permissions", 500);
    }
  }

  // ─── REVIEWS ──────────────────────────────────────────────
  if (action === "reviews" && req.method === "GET") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "moderate_reviews")) return error(res, "Permission denied", 403);

    try {
      const reviews = await sql`
        SELECT r.*, u.username FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC LIMIT 200
      `;
      return json(res, { reviews });
    } catch (err) {
      return error(res, "Failed to fetch reviews", 500);
    }
  }

  if (action === "reviews" && req.method === "POST") {
    // Toggle hide/unhide review (admin)
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "moderate_reviews")) return error(res, "Permission denied", 403);

    const { review_id, is_hidden } = req.body;
    if (review_id === undefined) return error(res, "review_id required");

    try {
      await sql`UPDATE reviews SET is_hidden = ${!!is_hidden} WHERE id = ${review_id}`;
      return json(res, { message: is_hidden ? "Review hidden" : "Review restored" });
    } catch (err) {
      return error(res, "Failed to update review", 500);
    }
  }

  if (action === "reviews" && req.method === "DELETE") {
    // Hard delete review (super admin only)
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { review_id } = req.body;
    if (!review_id) return error(res, "review_id required");

    try {
      await sql`DELETE FROM reviews WHERE id = ${review_id}`;
      return json(res, { message: "Review permanently deleted" });
    } catch (err) {
      return error(res, "Failed to delete review", 500);
    }
  }

  // ─── CONTACT MESSAGES ─────────────────────────────────────
  if (action === "messages" && req.method === "GET") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "view_messages")) return error(res, "Permission denied", 403);

    try {
      const messages = await sql`
        SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200
      `;
      return json(res, { messages });
    } catch (err) {
      return error(res, "Failed to fetch messages", 500);
    }
  }

  if (action === "messages" && req.method === "POST") {
    // Mark as read
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);

    const { message_id, is_read } = req.body;
    if (message_id === undefined) return error(res, "message_id required");

    try {
      await sql`UPDATE contact_messages SET is_read = ${!!is_read} WHERE id = ${message_id}`;
      return json(res, { message: "Message updated" });
    } catch (err) {
      return error(res, "Failed to update message", 500);
    }
  }

  if (action === "messages" && req.method === "DELETE") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { message_id } = req.body;
    if (!message_id) return error(res, "message_id required");

    try {
      await sql`DELETE FROM contact_messages WHERE id = ${message_id}`;
      return json(res, { message: "Message deleted" });
    } catch (err) {
      return error(res, "Failed to delete message", 500);
    }
  }

  // ─── ANIME MANAGEMENT ─────────────────────────────────────
  if (action === "anime" && req.method === "GET") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "manage_anime")) return error(res, "Permission denied", 403);

    try {
      const anime = await sql`
        SELECT ac.*, u.username as added_by_name
        FROM anime_custom ac
        LEFT JOIN users u ON ac.added_by = u.id
        ORDER BY ac.created_at DESC
      `;
      return json(res, { anime });
    } catch (err) {
      return error(res, "Failed to fetch custom anime", 500);
    }
  }

  if (action === "anime" && req.method === "POST") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "manage_anime")) return error(res, "Permission denied", 403);

    const { title, title_english, title_japanese, synopsis, score, episodes, status, type, source, duration, rating, aired_string, season, year, genres, themes, demographics, studios, image, trailer_url, trending, top_rated } = req.body;

    if (!title) return error(res, "Title is required");

    try {
      // Generate a unique mal_id for custom anime (starting from 900000)
      const [maxId] = await sql`SELECT COALESCE(MAX(mal_id), 899999) + 1 as next_id FROM anime_custom`;

      const result = await sql`
        INSERT INTO anime_custom (mal_id, title, title_english, title_japanese, synopsis, score, episodes, status, type, source, duration, rating, aired_string, season, year, genres, themes, demographics, studios, image, trailer_url, trending, top_rated, added_by)
        VALUES (${maxId.next_id}, ${title}, ${title_english || ''}, ${title_japanese || ''}, ${synopsis || ''}, ${score || 0}, ${episodes || 0}, ${status || 'Finished Airing'}, ${type || 'TV'}, ${source || ''}, ${duration || ''}, ${rating || ''}, ${aired_string || ''}, ${season || ''}, ${year || new Date().getFullYear()}, ${JSON.stringify(genres || [])}, ${JSON.stringify(themes || [])}, ${JSON.stringify(demographics || [])}, ${JSON.stringify(studios || [])}, ${image || ''}, ${trailer_url || ''}, ${trending || false}, ${top_rated || false}, ${admin.id})
        RETURNING *
      `;
      return json(res, { message: "Anime added!", anime: result[0] }, 201);
    } catch (err) {
      console.error("Add anime error:", err);
      return error(res, "Failed to add anime", 500);
    }
  }

  if (action === "anime" && req.method === "PUT") {
    const admin = requireAdmin(req);
    if (!admin) return error(res, "Admin access required", 403);
    if (!hasPermission(admin, "manage_anime")) return error(res, "Permission denied", 403);

    const { id, ...updates } = req.body;
    if (!id) return error(res, "Anime id required");

    try {
      // Build update dynamically for allowed fields
      const anime = await sql`SELECT * FROM anime_custom WHERE id = ${id}`;
      if (anime.length === 0) return error(res, "Anime not found");

      await sql`
        UPDATE anime_custom SET
          title = ${updates.title || anime[0].title},
          title_english = ${updates.title_english ?? anime[0].title_english},
          title_japanese = ${updates.title_japanese ?? anime[0].title_japanese},
          synopsis = ${updates.synopsis ?? anime[0].synopsis},
          score = ${updates.score ?? anime[0].score},
          episodes = ${updates.episodes ?? anime[0].episodes},
          status = ${updates.status ?? anime[0].status},
          type = ${updates.type ?? anime[0].type},
          source = ${updates.source ?? anime[0].source},
          duration = ${updates.duration ?? anime[0].duration},
          rating = ${updates.rating ?? anime[0].rating},
          aired_string = ${updates.aired_string ?? anime[0].aired_string},
          season = ${updates.season ?? anime[0].season},
          year = ${updates.year ?? anime[0].year},
          genres = ${updates.genres ? JSON.stringify(updates.genres) : anime[0].genres},
          themes = ${updates.themes ? JSON.stringify(updates.themes) : anime[0].themes},
          studios = ${updates.studios ? JSON.stringify(updates.studios) : anime[0].studios},
          image = ${updates.image ?? anime[0].image},
          trailer_url = ${updates.trailer_url ?? anime[0].trailer_url},
          trending = ${updates.trending ?? anime[0].trending},
          top_rated = ${updates.top_rated ?? anime[0].top_rated},
          updated_at = NOW()
        WHERE id = ${id}
      `;
      return json(res, { message: "Anime updated!" });
    } catch (err) {
      console.error("Update anime error:", err);
      return error(res, "Failed to update anime", 500);
    }
  }

  if (action === "anime" && req.method === "DELETE") {
    const user = getUserFromRequest(req);
    if (!user) return error(res, "Not authenticated", 401);

    const { anime_id } = req.body;
    if (!anime_id) return error(res, "anime_id required");

    // Super admin = hard delete, regular admin = soft delete (hide)
    if (user.role === "super_admin") {
      try {
        await sql`DELETE FROM anime_custom WHERE id = ${anime_id}`;
        return json(res, { message: "Anime permanently deleted" });
      } catch (err) {
        return error(res, "Failed to delete anime", 500);
      }
    } else if (user.role === "admin" && hasPermission(user, "manage_anime_delete")) {
      try {
        await sql`UPDATE anime_custom SET is_hidden = TRUE WHERE id = ${anime_id}`;
        return json(res, { message: "Anime hidden" });
      } catch (err) {
        return error(res, "Failed to hide anime", 500);
      }
    } else {
      return error(res, "Permission denied", 403);
    }
  }

  // ─── SEARCH USERS (for promoting) ─────────────────────────
  if (action === "search-users" && req.method === "GET") {
    const admin = requireSuperAdmin(req);
    if (!admin) return error(res, "Super admin access required", 403);

    const { q } = req.query;
    if (!q || q.length < 2) return json(res, { users: [] });

    try {
      const users = await sql`
        SELECT id, username, email, role, created_at
        FROM users
        WHERE (username ILIKE ${'%' + q + '%'} OR email ILIKE ${'%' + q + '%'})
        AND role = 'user'
        LIMIT 10
      `;
      return json(res, { users });
    } catch (err) {
      return error(res, "Search failed", 500);
    }
  }

  return error(res, "Invalid admin action", 400);
}
