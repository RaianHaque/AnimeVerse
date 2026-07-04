import { neon } from "@neondatabase/serverless";

// Create a reusable SQL tagged template function
// Files prefixed with _ are not exposed as API routes by Vercel
export function getDb() {
  return neon(process.env.DATABASE_URL);
}
