import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";

// Generate a JWT token for a user
export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    SECRET,
    { expiresIn: "7d" }
  );
}

// Verify and decode a JWT token from the Authorization header
export function getUserFromRequest(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), SECRET);
  } catch {
    return null;
  }
}

// Helper to send JSON responses
export function json(res, data, status = 200) {
  res.status(status).json(data);
}

// Helper to send error responses
export function error(res, message, status = 400) {
  res.status(status).json({ error: message });
}

// CORS headers helper for Vercel serverless functions
export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}
