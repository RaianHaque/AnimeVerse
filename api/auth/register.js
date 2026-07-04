import { getDb } from "../_db.js";
import { signToken, json, error, setCors } from "../_auth.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return error(res, "Method not allowed", 405);

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return error(res, "Username, email, and password are required");
  }

  if (password.length < 6) {
    return error(res, "Password must be at least 6 characters");
  }

  const sql = getDb();

  try {
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1
    `;
    if (existing.length > 0) {
      return error(res, "A user with that email or username already exists", 409);
    }

    // Hash password and create user
    const password_hash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${password_hash})
      RETURNING id, username, email, bio, avatar_url, created_at
    `;

    const user = result[0];
    const token = signToken(user);

    json(res, {
      message: "Account created successfully!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
    }, 201);
  } catch (err) {
    console.error("Register error:", err);
    error(res, "Registration failed. Please try again.", 500);
  }
}
