import { getDb } from "./_db.js";
import { json, error, setCors } from "./_auth.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return error(res, "Method not allowed", 405);

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return error(res, "Name, email, and message are required");
  }

  const sql = getDb();

  try {
    await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject || 'General'}, ${message})
    `;
    json(res, { message: "Message sent successfully! We'll get back to you soon." }, 201);
  } catch (err) {
    console.error("Contact error:", err);
    error(res, "Failed to send message. Please try again.", 500);
  }
}
