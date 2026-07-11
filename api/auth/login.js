import { getDb } from "../_db.js";
import { signToken, isSuperAdminEmail, json, error, setCors } from "../_auth.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return error(res, "Method not allowed", 405);

  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, "Email and password are required");
  }

  const sql = getDb();

  try {
    // Find user by email — include role and permissions
    const users = await sql`
      SELECT id, username, email, password_hash, bio, avatar_url, role, admin_permissions, created_at
      FROM users WHERE email = ${email} LIMIT 1
    `;

    if (users.length === 0) {
      return error(res, "Invalid email or password", 401);
    }

    const user = users[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return error(res, "Invalid email or password", 401);
    }

    // Auto-upgrade to super_admin if email matches env var (in case they registered before setting it up)
    if (isSuperAdminEmail(email) && user.role !== "super_admin") {
      await sql`UPDATE users SET role = 'super_admin' WHERE id = ${user.id}`;
      user.role = "super_admin";
    }

    const token = signToken(user);

    json(res, {
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
        role: user.role,
        admin_permissions: user.admin_permissions,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    error(res, "Login failed. Please try again.", 500);
  }
}
