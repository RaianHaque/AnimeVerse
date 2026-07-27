# AnimeVerse — Features, Components & Backend Architecture Analysis

This document provides an in-depth architectural scan and analysis of the **AnimeVerse** full-stack web application. It details every core feature of the platform, the specific frontend and backend components powering them, the architectural rationale behind their usage, their technical limitations, and a precise volumetric breakdown of backend versus frontend code.

---

## Table of Contents
1. [Codebase Volume & Backend Architecture Analysis](#1-codebase-volume--backend-architecture-analysis)
   - [Where is the Backend Code Located?](#where-is-the-backend-code-located)
   - [Frontend vs. Backend Code Breakdown](#frontend-vs-backend-code-breakdown)
2. [Comprehensive Feature Analysis](#2-comprehensive-feature-analysis)
   - [2.1 Authentication & Role-Based Access Control (RBAC)](#21-authentication--role-based-access-control-rbac)
   - [2.2 Anime Discovery, Catalog & Multi-Modal Search](#22-anime-discovery-catalog--multi-modal-search)
   - [2.3 Anime Detail & Multimedia Experience](#23-anime-detail--multimedia-experience)
   - [2.4 Community Review & Hybrid Scoring System](#24-community-review--hybrid-scoring-system)
   - [2.5 Personalized Watchlist & Journey Tracking](#25-personalized-watchlist--journey-tracking)
   - [2.6 User Profiles & Identity Management](#26-user-profiles--identity-management)
   - [2.7 Governance & Administration Dashboard](#27-governance--administration-dashboard)
   - [2.8 Support Inquiry & Contact Management](#28-support-inquiry--contact-management)
3. [Summary of Architectural Trade-offs](#3-summary-of-architectural-trade-offs)

---

## 1. Codebase Volume & Backend Architecture Analysis

### Where is the Backend Code Located?
In AnimeVerse, the backend is **not** a traditional monolithic server (such as a standalone Express or Django server running continuously on a VM). Instead, it is built using **Vercel Serverless Functions**. 

All backend code is located exclusively inside the **`/api/`** directory at the root of the project:
```
FinalTermProject/
├── api/                          ← ALL BACKEND CODE LIVES HERE
│   ├── _auth.js                  # JWT token verification, role helpers, CORS middleware
│   ├── _db.js                    # Neon PostgreSQL database connection pool
│   ├── admin.js                  # Controller for all admin governance actions
│   ├── contact.js                # Handler for support contact form submissions
│   ├── profile.js                # Handler for user profile & bio updates
│   ├── reviews.js                # Handler for review CRUD and average score calculation
│   ├── setup.js                  # Automated database migration and table initialization
│   ├── watchlist.js              # Handler for user watchlist persistence
│   └── auth/
│       ├── login.js              # User authentication & auto super-admin upgrade
│       ├── register.js           # User sign-up & duplicate detection
│       └── me.js                 # Session restoration endpoint
```

Each file in `/api/` exports an asynchronous Node.js HTTP handler function (`export default async function handler(req, res)`). When deployed to Vercel, each file automatically becomes an isolated, scalable API endpoint (e.g., `/api/reviews` maps directly to `api/reviews.js`).

---

### Frontend vs. Backend Code Breakdown
A volumetric scan of the **30 custom source files** across the project reveals the exact distribution between frontend UI logic and backend business logic:

| Codebase Layer | Directory / Scope | File Count | Total Size (Bytes) | Size (KB) | Percentage of Codebase |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Backend Code** | `/api/` (Serverless Functions) | **11 files** | **38,568 B** | **~38.6 KB** | **18.1%** |
| **Frontend Code** | `/src/` (Components, Pages, Services, Context) | **19 files** | **174,423 B** | **~174.4 KB** | **81.9%** |
| **TOTAL PROJECT** | Entire Application Source | **30 files** | **212,991 B** | **~213.0 KB** | **100.0%** |

#### Commentary on Code Volume:
- **Backend (~18.1%)**: The backend is highly streamlined and efficient. By utilizing Vercel's serverless architecture and `@vercel/postgres` SQL tagged templates, boilerplate middleware is minimized. The largest backend module is `api/admin.js` (~16.2 KB), which centralizes all governance logic (user promotion, soft/hard deletion, analytics, and permissions).
- **Frontend (~81.9%)**: The frontend constitutes the vast majority of the codebase due to rich UI implementations, responsive layouts, glassmorphism CSS styling, tabbed navigation, inline moderation controls, and client-side filtering/sorting logic. The largest frontend modules are `AdminDashboard.jsx` (~29.1 KB) and `AnimeDetail.jsx` (~26.4 KB).

---

## 2. Comprehensive Feature Analysis

### 2.1 Authentication & Role-Based Access Control (RBAC)

* **Components & Files Used:**
  * **Frontend:** `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/context/AuthContext.jsx`, `src/components/Navbar.jsx`.
  * **Backend:** `api/auth/register.js`, `api/auth/login.js`, `api/auth/me.js`, `api/_auth.js`.

* **Why They Were Used (Rationale):**
  * **Stateless JWT (`_auth.js`):** JSON Web Tokens (JWT) signed with `bcryptjs` password hashing were chosen to allow stateless, scalable authentication without requiring server-side session memory.
  * **3-Tier Hierarchy:** Implements a strict hierarchy (`user` → `admin` → `super_admin`). The Super Admin identity is dynamically verified against a secure environment variable (`SUPER_ADMIN_EMAIL`) during registration and login, ensuring the primary site owner can never be locked out or demoted.
  * **Context-Driven View Toggle (`AuthContext.jsx`):** Allows administrators to toggle between "👑 Admin View" and "👤 User View" in real-time, enabling admins to preview the platform exactly as a normal user sees it without needing a secondary testing account.

* **Technical Limitations:**
  * **LocalStorage Vulnerability:** JWT tokens are stored in `localStorage`. While convenient and resilient to CSRF attacks, `localStorage` is accessible via JavaScript, making it potentially vulnerable to XSS (Cross-Site Scripting) if malicious third-party scripts were ever executed on the page.
  * **Token Revocation Delay:** Because JWTs are stateless, if an admin bans or demotes a user, that user's existing token remains valid until it expires (7 days) unless they refresh their session. A server-side token blacklist or database verification on every single read request would be required to enforce immediate revocation.

---

### 2.2 Anime Discovery, Catalog & Multi-Modal Search

* **Components & Files Used:**
  * **Frontend:** `src/pages/Home.jsx`, `src/pages/AnimeList.jsx`, `src/pages/TopRated.jsx`, `src/components/AnimeCard.jsx`, `src/components/HeroBanner.jsx`, `src/components/Sidebar.jsx`.
  * **Data Layer:** `src/services/api.js`, `src/data/animeDatabase.json`.

* **Why They Were Used (Rationale):**
  * **Local JSON Data Engine (`animeDatabase.json`):** Instead of relying on external third-party APIs (like Jikan or AniList) which suffer from rate-limiting, downtime, and CORS issues, a curated dataset of 75+ popular anime was bundled locally.
  * **Client-Side Query Engine (`api.js`):** Search by title/synopsis, multi-genre filtering, status filtering (Airing/Completed), and sorting (Popularity, Score, Year) are executed entirely in client memory. This provides instantaneous, zero-latency search results and pagination without server round-trips.
  * **Visual Hierarchy (`TopRated.jsx` & `Home.jsx`):** Utilizes custom metallic gradients (Gold/Silver/Bronze) for top-ranked podiums and responsive 2-column mosaics to create an engaging visual discovery experience.

* **Technical Limitations:**
  * **Static Catalog Bound:** Because the primary dataset lives in a static JSON file (`animeDatabase.json`), new anime seasons, weekly airing episode counts, and live score updates do not synchronize automatically with global databases.
  * **Memory Scaling Limit:** Client-side filtering is blazing fast for 75–500 items, but if the catalog grew to 10,000+ anime titles, loading the entire JSON payload into browser memory would degrade initial page load performance. It would eventually require transitioning to server-side SQL pagination and text indexing.

---

### 2.3 Anime Detail & Multimedia Experience

* **Components & Files Used:**
  * **Frontend:** `src/pages/AnimeDetail.jsx`.
  * **Data & Utilities:** `src/services/api.js`, `clean-trailers.js` (maintenance utility).

* **Why They Were Used (Rationale):**
  * **Tabbed Architecture (`AnimeDetail.jsx`):** Organizes extensive metadata (Synopsis, Broadcast info, Episode lists, Character voice actors, and Reviews) into clean, digestible tabs to prevent endless page scrolling.
  * **Embedded YouTube Player:** Integrates an interactive video preview directly into the hero poster area. Users can watch promotional trailers with a single click (`autoplay=1`) inside a responsive 16:9 glassmorphism container.

* **Technical Limitations:**
  * **External Video Link Rot:** YouTube trailer IDs can become invalid over time if uploaders delete videos, make them private, or enforce copyright restrictions (causing "Video unavailable" errors). 
  * *Mitigation implemented:* A fallback mechanism was built into `AnimeDetail.jsx` that gracefully hides the video player section entirely if `trailer_url` is empty or cleared, preventing broken iframes from ruining the UX.

---

### 2.4 Community Review & Hybrid Scoring System

* **Components & Files Used:**
  * **Frontend:** `src/pages/AnimeDetail.jsx` (Reviews Tab & Score Badge).
  * **Backend:** `api/reviews.js`.
  * **Database Table:** `reviews` (PostgreSQL).

* **Why They Were Used (Rationale):**
  * **Hybrid Weighted Scoring:** To prevent a single user review from artificially skewing an anime's rating from 9.0 to 1.0, a weighted blending formula was implemented in `AnimeDetail.jsx`:
    $$\text{Combined Score} = \frac{(\text{Base Score} \times 1) + (\text{User Avg Rating} \times W)}{1 + W} \quad \text{where } W = \min\left(\frac{\text{Review Count}}{10}, 1.0\right)$$
    This ensures community reviews gradually gain influence as more users participate.
  * **Database Upsert Logic (`api/reviews.js`):** Enforces a strict "one review per user per anime" rule. If a user submits a second review for the same anime, the backend automatically updates their existing rating and text rather than creating duplicate entries.

* **Technical Limitations:**
  * **Lack of Automated Spam Detection:** There is no automated sentiment analysis, profanity filter, or rate-limiting on review submissions. Content quality relies entirely on human moderation (Admins hiding or deleting reviews).
  * **No Review Upvoting/Helpful Votes:** Users cannot currently upvote or reply to other users' reviews, limiting peer-to-peer community interaction within the comment section.

---

### 2.5 Personalized Watchlist & Journey Tracking

* **Components & Files Used:**
  * **Frontend:** `src/pages/Watchlist.jsx`, `src/components/AnimeCard.jsx` (quick bookmarking).
  * **Backend:** `api/watchlist.js`.
  * **Database Table:** `watchlist` (PostgreSQL).

* **Why They Were Used (Rationale):**
  * **Persistent Database Storage:** Unlike guest bookmarks that vanish when browser cache is cleared, watchlists are bound to the user's JWT identity and stored securely in PostgreSQL, making them accessible across devices.
  * **4-Pillar Categorization:** Mirrors industry standards (MyAnimeList/AniList) by dividing saved titles into *Watching*, *Completed*, *Plan to Watch*, and *Dropped*, complete with interactive status dropdowns and progress tracking bars.

* **Technical Limitations:**
  * **Coarse Progress Tracking:** Currently tracks status and percentage progress, but lacks granular episode-by-episode increment buttons (e.g., clicking "+1" to move from Episode 12 to 13 of 24).
  * **No Custom User Folders:** Users cannot create custom playlists or arbitrary tag folders (e.g., "Best 90s Mecha" or "Comfort Shows") outside of the 4 predefined broadcast statuses.

---

### 2.6 User Profiles & Identity Management

* **Components & Files Used:**
  * **Frontend:** `src/pages/Profile.jsx`.
  * **Backend:** `api/profile.js`.
  * **Database Table:** `users` (PostgreSQL).

* **Why They Were Used (Rationale):**
  * **Centralized Identity Hub:** Gives users a personal dashboard displaying their join date, email, custom biography, avatar initial badge, and a real-time feed of their recently published reviews.
  * **Instant Bio & Avatar Customization:** Allows users to update their bio and external avatar URL dynamically via authenticated PUT requests to `/api/profile`.

* **Technical Limitations:**
  * **No Direct Image Uploads:** To keep hosting costs zero and avoid requiring external S3/Cloudinary object storage buckets, avatar customization relies on pasting external image URLs rather than uploading raw image files directly from the user's device.
  * **Private Profiles Only:** Profiles are currently private dashboards for the logged-in user. There are no public user profile URLs (e.g., `/user/raian`) for sharing watchlists with friends.

---

### 2.7 Governance & Administration Dashboard

* **Components & Files Used:**
  * **Frontend:** `src/pages/AdminDashboard.jsx`, `src/components/Navbar.jsx`, inline moderation controls in `src/pages/AnimeDetail.jsx`.
  * **Backend:** `api/admin.js`.
  * **Database Tables:** `users`, `reviews`, `contact_messages`, `anime_custom`.

* **Why They Were Used (Rationale):**
  * **Granular Permission Flags (`admin_permissions` JSONB):** Rather than giving all admins identical power, Super Admins can assign specific checkboxes (`manage_anime`, `moderate_reviews`, `view_messages`, `view_users`, `manage_anime_delete`) to sub-admins.
  * **Inline Moderation Tools:** Admins do not need to hunt through database tables to moderate content. When viewing any anime page, Admins see inline "Delete Anime" buttons in the header and "Hide / Delete Review" buttons directly next to user comments.
  * **Safe Soft-Deletion:** When a normal Admin deletes an anime or review, the backend sets an `is_hidden = true` flag (soft delete). Only the Super Admin possesses the architectural authorization to execute irreversible `DELETE FROM` SQL queries (hard delete).

* **Technical Limitations:**
  * **Serverless Read-Only Filesystem:** When Admins add a custom anime via the dashboard, it is stored in the PostgreSQL `anime_custom` table and merged with the catalog at runtime. Because serverless environments (like Vercel) have read-only filesystems in production, admin edits cannot write directly back to the physical `animeDatabase.json` file on GitHub.

---

### 2.8 Support Inquiry & Contact Management

* **Components & Files Used:**
  * **Frontend:** `src/pages/Contact.jsx`.
  * **Backend:** `api/contact.js`, `api/admin.js` (messages tab).
  * **Database Table:** `contact_messages` (PostgreSQL).

* **Why They Were Used (Rationale):**
  * **Direct Database Logging (`api/contact.js`):** Provides a clean, accessible channel for users and guests to submit bug reports, partnership inquiries, or feature requests without needing an external email client.
  * **Admin Workflow Management:** Messages appear directly in the Admin Dashboard with interactive "Mark as Read / Unread" status toggles and visual unread highlight borders.

* **Technical Limitations:**
  * **No Automated Email Alerts:** Submitting a contact form logs the inquiry into PostgreSQL but does not dispatch an automated email notification (via SendGrid, AWS SES, or SMTP) to the Super Admin's personal inbox. Admins must actively check the dashboard tab to discover new messages.

---

## 3. Summary of Architectural Trade-offs

| Architectural Decision | Chosen Implementation | Primary Advantage | Trade-off / Limitation |
| :--- | :--- | :--- | :--- |
| **Backend Hosting** | Vercel Serverless Functions (`/api/`) | Zero server maintenance, automatic scaling, free tier optimization. | Cold start latency on initial API calls; read-only server filesystem. |
| **Primary Catalog** | Local JSON File (`animeDatabase.json`) | Instant client-side search, zero API rate limits, 100% uptime resilience. | Catalog is static; requires code deployment or DB injection to add new shows. |
| **Auth Storage** | Client-Side `localStorage` JWT | Stateless backend, survives browser restarts without server session state. | Sensitive to XSS attacks; token revocation requires expiration or blacklisting. |
| **Content Deletion** | Soft-Delete (`is_hidden`) for Admins | Prevents accidental data loss or rogue admin vandalism; fully reversible. | Slightly increases database table size over time as hidden rows remain in storage. |
| **Score Math** | Weighted Blending Formula | Prevents review bombing; smoothly balances official MAL scores with user opinions. | Requires sufficient user review volume (~10+ reviews) to reach 50/50 weighting. |

---
*Document generated by AnimeVerse System Architecture Analysis — 2026*
