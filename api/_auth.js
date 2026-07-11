import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "";

// Generate a JWT token for a user (includes role + permissions)
export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "user",
      admin_permissions: user.admin_permissions || null,
    },
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

// Check if user is any admin (admin or super_admin)
export function requireAdmin(req) {
  const user = getUserFromRequest(req);
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "super_admin") return null;
  return user;
}

// Check if user is the super admin
export function requireSuperAdmin(req) {
  const user = getUserFromRequest(req);
  if (!user) return null;
  if (user.role !== "super_admin") return null;
  return user;
}

// Check if an email is the super admin email
export function isSuperAdminEmail(email) {
  if (!SUPER_ADMIN_EMAIL) return false;
  return email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();
}

// Check if admin has a specific permission
export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === "super_admin") return true; // Super admin can do everything
  if (user.role !== "admin") return false;
  const perms = user.admin_permissions;
  if (!perms) return false;
  return perms[permission] === true;
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
