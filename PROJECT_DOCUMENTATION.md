# AnimeVerse — Project Documentation

> **A full-stack anime discovery, tracking, and community platform built with React, Vite, TailwindCSS, and Vercel Serverless Functions.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Features Index](#4-features-index)
   - 4.1 [Homepage & Hero Section](#41-homepage--hero-section)
   - 4.2 [Anime Browsing & Search](#42-anime-browsing--search)
   - 4.3 [Anime Detail Page](#43-anime-detail-page)
   - 4.4 [Top Rated Rankings](#44-top-rated-rankings)
   - 4.5 [User Authentication](#45-user-authentication)
   - 4.6 [Watchlist Management](#46-watchlist-management)
   - 4.7 [Review & Rating System](#47-review--rating-system)
   - 4.8 [Combined AnimeVerse Score](#48-combined-animeverse-score)
   - 4.9 [YouTube Trailer Embedding](#49-youtube-trailer-embedding)
   - 4.10 [Guest Browsing & Login Gates](#410-guest-browsing--login-gates)
   - 4.11 [Admin Dashboard](#411-admin-dashboard)
   - 4.12 [3-Tier Role System](#412-3-tier-role-system)
   - 4.13 [Admin Permission Management](#413-admin-permission-management)
   - 4.14 [Anime Management (Admin)](#414-anime-management-admin)
   - 4.15 [Review Moderation (Admin)](#415-review-moderation-admin)
   - 4.16 [Contact Messages (Admin)](#416-contact-messages-admin)
   - 4.17 [User Profile & Settings](#417-user-profile--settings)
   - 4.18 [Contact Form](#418-contact-form)
   - 4.19 [Responsive Navigation](#419-responsive-navigation)
   - 4.20 [Local JSON Anime Database](#420-local-json-anime-database)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Database Schema](#6-database-schema)
7. [Environment Variables](#7-environment-variables)
8. [Setup & Deployment](#8-setup--deployment)

---

## 1. Project Overview

**AnimeVerse** is a feature-rich anime platform where users can browse a curated library of 75+ anime titles, track their watchlist, write reviews, and watch trailers — all wrapped in a premium cyberpunk-themed UI with glassmorphism, neon accents, and smooth animations.

The platform uses a **local JSON database** for anime data (no external API dependency) and **Neon PostgreSQL** via Vercel serverless functions for user data, reviews, watchlists, and admin operations. A **3-tier role-based access control** system (Super Admin → Admin → User) provides full site management without editing code.

---

## 2. Tech Stack

| Layer        | Technology                       | Purpose                               |
|--------------|----------------------------------|---------------------------------------|
| **Frontend** | React 19 + Vite 8               | SPA framework & build tool            |
| **Styling**  | TailwindCSS 3 + Custom CSS      | Utility-first styling + cyberpunk theme |
| **Routing**  | React Router DOM 7               | Client-side navigation                |
| **Backend**  | Vercel Serverless Functions      | API routes (Node.js)                  |
| **Database** | Neon PostgreSQL                  | User data, reviews, watchlists        |
| **Auth**     | JWT (jsonwebtoken) + bcryptjs    | Token-based authentication            |
| **Data**     | Local JSON                       | 75 anime entries with full metadata   |
| **Hosting**  | Vercel                           | Auto-deploy from GitHub               |

---

## 3. Project Structure

```
FinalTermProject/
├── api/                          # Vercel Serverless Functions (Backend)
│   ├── _auth.js                  # JWT helpers, role checks, CORS
│   ├── _db.js                    # Neon PostgreSQL connection
│   ├── admin.js                  # Admin API (all admin operations)
│   ├── contact.js                # Contact form submission
│   ├── profile.js                # User profile update
│   ├── reviews.js                # Review CRUD + average calculation
│   ├── setup.js                  # Database table creation/migration
│   ├── watchlist.js              # Watchlist CRUD
│   └── auth/
│       ├── login.js              # Login + auto super-admin upgrade
│       ├── register.js           # Registration + auto super-admin detect
│       └── me.js                 # Session restore (GET current user)
│
├── src/                          # Frontend Source
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component + routes
│   ├── index.css                 # Global styles + cyberpunk theme
│   ├── App.css                   # Additional app styles
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state, role helpers, view toggle
│   │
│   ├── data/
│   │   └── animeDatabase.json    # 75 anime entries (local JSON database)
│   │
│   ├── services/
│   │   ├── api.js                # Anime data service (reads local JSON)
│   │   └── db.js                 # HTTP client (apiGet/Post/Put/Delete + JWT)
│   │
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation bar + admin menu + view toggle
│   │   ├── AnimeCard.jsx         # Reusable anime card component
│   │   ├── Footer.jsx            # Site footer with links
│   │   ├── Header.jsx            # Header component
│   │   ├── HeroBanner.jsx        # Hero banner component
│   │   ├── Sidebar.jsx           # Sidebar component
│   │   └── TrendingGrid.jsx      # Trending grid (legacy, unused)
│   │
│   └── pages/
│       ├── Home.jsx              # Landing page (hero + trending + featured)
│       ├── AnimeList.jsx         # Browse all anime with filters
│       ├── AnimeDetail.jsx       # Detail page (trailer + reviews + info)
│       ├── TopRated.jsx          # Top rated rankings with podium
│       ├── Watchlist.jsx         # User's watchlist management
│       ├── Login.jsx             # Login form
│       ├── Register.jsx          # Registration form
│       ├── Profile.jsx           # User profile page
│       ├── Contact.jsx           # Contact form
│       └── AdminDashboard.jsx    # Admin control panel (6 tabs)
│
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── PROJECT_DOCUMENTATION.md      # ← This file
```

---

## 4. Features Index

---

### 4.1 Homepage & Hero Section

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/Home.jsx` |
| **Components Used** | `AnimeCard.jsx`, `Footer.jsx`, `Navbar.jsx` |
| **Data Source** | `src/services/api.js` → `getSeasonNow()`, `getTopAnime()` |

**Description:**  
Full-screen animated hero section with gradient text, floating blur orbs, grid overlay, and a 2×2 anime poster mosaic. Below the hero: **Trending Now** carousel (10 anime), **Featured Anime** spotlight card, **Browse by Genre** grid (8 genres with hover effects), site statistics row, and **Top Rated** preview (4 anime).

**Key Features:**
- Particle background with animated gradient orbs
- Responsive 2-column hero layout (text + poster grid)
- Genre cards with gradient hover overlays
- Stats row with glassmorphism cards

---

### 4.2 Anime Browsing & Search

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AnimeList.jsx` |
| **Components Used** | `AnimeCard.jsx` |
| **Data Source** | `src/services/api.js` → `searchAnime()`, `getGenres()` |

**Description:**  
Full anime library with real-time search, multi-filter system, and grid/list view toggle.

**Key Features:**
- **Text search** across title, English title, Japanese title, and synopsis
- **Genre filter** — dynamically loaded genre buttons with count badges
- **Status filter** — All / Airing / Completed / Upcoming
- **Sort options** — Rating, Year, Title, Episodes, Popularity, Favorites
- **View modes** — Grid (card view) and List (row view)
- **Pagination** — Client-side with 25 items per page
- All filtering, sorting, and pagination happens locally (no API calls)

---

### 4.3 Anime Detail Page

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AnimeDetail.jsx` |
| **Components Used** | `AnimeCard.jsx` (recommendations) |
| **Data Source** | `src/services/api.js` → `getAnimeById()`, `getAnimeCharacters()`, `getAnimeEpisodes()`, `getAnimeRecommendations()` |
| **API Endpoints** | `GET /api/reviews?anime_id=`, `POST /api/reviews`, `POST /api/watchlist` |

**Description:**  
Comprehensive anime detail view with a cinematic hero banner, tabbed content, and interactive features.

**Key Features:**
- Blurred background hero with poster overlay
- Genre badges, status indicators, and star ratings
- **4 tabs**: Overview (info table), Episodes (grid), Characters (avatar grid), Reviews
- Combined AnimeVerse Score display (see [4.8](#48-combined-animeverse-score))
- YouTube trailer player (see [4.9](#49-youtube-trailer-embedding))
- Review submission form with 1-10 rating selector
- "Add to Watchlist" button with login gate
- Related anime recommendations (same-genre matching)

---

### 4.4 Top Rated Rankings

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/TopRated.jsx` |
| **Data Source** | `src/services/api.js` → `getTopAnime()` |

**Description:**  
Ranked leaderboard with a gold/silver/bronze podium for the top 3 and a numbered list for the rest.

**Key Features:**
- **Podium layout** — #1 elevated center, #2 left, #3 right with metallic gradients
- Filter tabs: All / Airing / Upcoming / Popular / Favorites
- Score progress bars for each ranked entry
- Paginated list view below the podium

---

### 4.5 User Authentication

| Attribute   | Detail |
|-------------|--------|
| **Pages**   | `src/pages/Login.jsx`, `src/pages/Register.jsx` |
| **Context** | `src/context/AuthContext.jsx` |
| **API Endpoints** | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| **Backend** | `api/auth/login.js`, `api/auth/register.js`, `api/auth/me.js`, `api/_auth.js` |

**Description:**  
JWT-based authentication with split-screen design (visual left panel + form right panel).

**Key Features:**
- **Registration** with password strength indicator (Weak → Strong)
- **Login** with remember-me checkbox
- **JWT tokens** stored in `localStorage`, auto-attached to all API requests via `services/db.js`
- **Session restore** — on page load, `AuthContext` calls `/api/auth/me` to restore user session
- **Password hashing** — bcryptjs with 10 salt rounds
- **Auto super-admin detection** — if the registering email matches `SUPER_ADMIN_EMAIL` env var, role is set to `super_admin`
- **Auto super-admin upgrade on login** — if a user's email matches env var but their role isn't `super_admin` yet, they're auto-upgraded

---

### 4.6 Watchlist Management

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/Watchlist.jsx` |
| **API Endpoints** | `GET /api/watchlist`, `POST /api/watchlist`, `PUT /api/watchlist`, `DELETE /api/watchlist` |
| **Backend** | `api/watchlist.js` |

**Description:**  
Personal anime tracking with status management, progress bars, and filter tabs.

**Key Features:**
- **Status tracking** — Watching (green), Completed (cyan), Plan to Watch (purple), Dropped (red)
- Status dropdown to change watch status inline
- Progress bar per anime
- Filter tabs: All / Watching / Completed / Plan to Watch / Dropped
- Stats row showing counts per category
- Genre badges per entry
- Remove button with instant UI update
- **Login gate** — redirects to login if not authenticated

---

### 4.7 Review & Rating System

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AnimeDetail.jsx` (Reviews tab) |
| **API Endpoints** | `GET /api/reviews?anime_id=`, `POST /api/reviews` |
| **Backend** | `api/reviews.js` |

**Description:**  
Users can rate anime on a 1-10 scale and write text reviews. One review per user per anime (upsert on conflict).

**Key Features:**
- **Visual rating selector** — 10 clickable number buttons
- **Review form** with textarea and submit button
- **Review list** showing username, avatar initial, date, rating, and text
- **Login gate** — shows login/register prompt for guests
- **Upsert** — submitting again updates the existing review
- **Hidden reviews** — admins can hide reviews without deleting them
- Returns `avg_rating` and `review_count` for combined score calculation

---

### 4.8 Combined AnimeVerse Score

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AnimeDetail.jsx` |
| **Backend** | `api/reviews.js` (returns `avg_rating`, `review_count`) |

**Description:**  
A blended score that combines the anime's base score from the database with user reviews submitted on the site.

**Calculation Formula:**
```
baseWeight = 1
userWeight = min(userReviewCount / 10, 1)
combinedScore = (baseScore × baseWeight + avgUserRating × userWeight) / (baseWeight + userWeight)
```

**Key Features:**
- Glassmorphism score badge showing "AnimeVerse Score"
- Side-by-side display of base score vs user average
- User review count shown inline
- Weight scales with number of reviews (more reviews = more influence, capped at equal weight)

---

### 4.9 YouTube Trailer Embedding

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AnimeDetail.jsx` |
| **Data Source** | `animeDatabase.json` → `trailer_url` field per anime |

**Description:**  
Each anime entry includes a YouTube embed URL. The detail page shows a cinematic play button over the anime poster that expands into a full iframe player.

**Key Features:**
- **Poster thumbnail** with gradient overlay and centered play button
- **Hover effects** — button scales up, glows purple
- **Click to play** — replaces poster with YouTube iframe (`autoplay=1`)
- 16:9 aspect ratio container, max-width 800px
- `allowFullScreen` and picture-in-picture enabled

---

### 4.10 Guest Browsing & Login Gates

| Attribute   | Detail |
|-------------|--------|
| **Pages**   | `AnimeDetail.jsx`, `Watchlist.jsx`, `Profile.jsx` |
| **Context** | `AuthContext.jsx` → `user` state |

**Description:**  
All anime content (browsing, searching, detail pages) is fully accessible without logging in. Interactive features (reviews, watchlist, profile) require authentication.

**Login Gate Locations:**
| Feature | Gate Type | Location |
|---------|-----------|----------|
| Browse anime | ✅ Open to all | `Home.jsx`, `AnimeList.jsx`, `TopRated.jsx` |
| View anime details | ✅ Open to all | `AnimeDetail.jsx` |
| Watch trailers | ✅ Open to all | `AnimeDetail.jsx` |
| Read reviews | ✅ Open to all | `AnimeDetail.jsx` |
| **Write reviews** | 🔒 Login required | `AnimeDetail.jsx` → modal prompt |
| **Add to watchlist** | 🔒 Login required | `AnimeDetail.jsx` → modal prompt |
| **View watchlist** | 🔒 Login required | `Watchlist.jsx` → redirect |
| **View profile** | 🔒 Login required | `Profile.jsx` → redirect |

---

### 4.11 Admin Dashboard

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AdminDashboard.jsx` |
| **API Endpoints** | `GET/POST/PUT/DELETE /api/admin?action=*` |
| **Backend** | `api/admin.js` |
| **Access**  | Visible only to users with `admin` or `super_admin` role |
| **Navigation** | Hamburger menu (mobile) + navbar badge (desktop) |

**Description:**  
Full-featured admin control panel with 6 tabbed sections. Accessible only through the hamburger menu link (admin-only visibility). Admins can toggle between admin and user view modes.

**Dashboard Tabs:**

| Tab | Icon | Purpose | Permissions Required |
|-----|------|---------|---------------------|
| Stats | 📊 | Overview cards (users, reviews, watchlist, messages, admins, custom anime) | Any admin |
| Anime | 🎬 | Add/Edit/Delete custom anime | `manage_anime` |
| Users | 👥 | View all users, promote, delete | `view_users` |
| Reviews | ⭐ | Hide/restore/delete reviews | `moderate_reviews` |
| Messages | 📩 | Read/manage contact submissions | `view_messages` |
| Admins | 👑 | Search users, promote/demote admins, edit permissions | Super Admin only |

---

### 4.12 3-Tier Role System

| Attribute   | Detail |
|-------------|--------|
| **Context** | `src/context/AuthContext.jsx` |
| **Backend** | `api/_auth.js`, `api/auth/login.js`, `api/auth/register.js` |
| **Database** | `users.role` column (`user` / `admin` / `super_admin`) |

**Description:**  
Three-level hierarchy ensuring secure, tiered access to site management.

**Role Hierarchy:**

```
┌─────────────────────────────────────────────────┐
│                 SUPER ADMIN (You)                │
│  • Full unrestricted access                      │
│  • Hard delete (permanent) anything              │
│  • Promote/demote admins                         │
│  • Set admin permissions                         │
│  • Manage all site features                      │
│  • Cannot be deleted or demoted                  │
│  • Email secured via SUPER_ADMIN_EMAIL env var   │
├─────────────────────────────────────────────────┤
│                    ADMIN                         │
│  • Permissions set by Super Admin                │
│  • Can manage anime (add/edit)                   │
│  • Can moderate reviews (hide only, not delete)  │
│  • Can view messages and users                   │
│  • Can soft-delete (hide) anime if permitted     │
│  • Cannot hard-delete anything from database     │
│  • Cannot promote/demote other admins            │
├─────────────────────────────────────────────────┤
│                     USER                         │
│  • Browse all anime                              │
│  • Write reviews and ratings                     │
│  • Manage personal watchlist                     │
│  • Update profile                                │
│  • Submit contact messages                       │
└─────────────────────────────────────────────────┘
```

**Key Implementation Details:**
- Super admin email is **never exposed** in client-side code — stored only as a Vercel environment variable
- Role is embedded in the JWT token and verified server-side on every admin API call
- `AuthContext.jsx` exposes `isAdmin`, `isSuperAdmin`, `hasPermission()` helpers
- Admin view toggle lets admins browse the site as a regular user

---

### 4.13 Admin Permission Management

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AdminDashboard.jsx` (Admins tab) |
| **API Endpoints** | `POST /api/admin?action=promote`, `POST /api/admin?action=demote`, `POST /api/admin?action=update-permissions` |
| **Database** | `users.admin_permissions` JSONB column |

**Description:**  
Super Admin can invite users as admins with granular permissions, and modify or revoke access at any time.

**Available Permissions:**

| Permission Key | Label | What It Controls |
|---------------|-------|-----------------|
| `manage_anime` | Manage Anime (Add/Edit) | Create and edit custom anime entries |
| `moderate_reviews` | Moderate Reviews (Hide) | Hide/restore user reviews |
| `view_messages` | View Contact Messages | Read contact form submissions |
| `view_users` | View User List | See registered users table |
| `manage_anime_delete` | Soft-Delete Anime (Hide) | Soft-delete (hide) custom anime |

**Key Features:**
- **Search & invite** — Super admin searches users by username/email to promote
- **Permission modal** — Checkbox UI to toggle individual permissions
- **Permission badges** — Visual green/red tags showing each admin's permissions
- **Demote** — Strips admin role and clears all permissions
- Super admin always bypasses permission checks (`hasPermission()` returns `true`)

---

### 4.14 Anime Management (Admin)

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AdminDashboard.jsx` (Anime tab) |
| **API Endpoints** | `GET/POST/PUT/DELETE /api/admin?action=anime` |
| **Database** | `anime_custom` table |

**Description:**  
Admins can add, edit, and remove custom anime entries through the dashboard without touching code.

**Form Fields:**
- Title, English Title, Synopsis
- Score (0-10), Episodes, Status (Finished/Airing/Not yet aired), Type (TV/Movie/OVA/Special/ONA)
- Year, Genres (comma-separated), Studios (comma-separated)
- Image URL, YouTube Trailer URL
- Trending toggle, Top Rated toggle

**Delete Behavior:**
- **Super Admin** → Permanent hard delete from database
- **Regular Admin** → Soft delete (sets `is_hidden = true`, anime still in DB)

---

### 4.15 Review Moderation (Admin)

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AdminDashboard.jsx` (Reviews tab) |
| **API Endpoints** | `GET /api/admin?action=reviews`, `POST /api/admin?action=reviews` (hide/restore), `DELETE /api/admin?action=reviews` |

**Description:**  
Admins can moderate user reviews. Hidden reviews are excluded from public display and average calculations.

**Key Features:**
- View all reviews (including hidden ones, shown with reduced opacity)
- **Hide** — Soft-hides a review (available to admins with `moderate_reviews` permission)
- **Restore** — Un-hides a hidden review
- **Delete** — Permanently deletes a review (Super Admin only)

---

### 4.16 Contact Messages (Admin)

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/AdminDashboard.jsx` (Messages tab) |
| **API Endpoints** | `GET/POST/DELETE /api/admin?action=messages` |

**Description:**  
View and manage contact form submissions from the admin dashboard.

**Key Features:**
- **Mark as Read/Unread** — Toggle read status, unread messages have accent border
- **Delete** — Permanently delete messages (Super Admin only)
- Shows sender name, email, subject, message, and date

---

### 4.17 User Profile & Settings

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/Profile.jsx` |
| **API Endpoints** | `PUT /api/profile` |
| **Backend** | `api/profile.js` |

**Description:**  
User profile page with editable bio, avatar, and account information.

**Key Features:**
- Avatar display (gradient initial or custom URL)
- Editable username, bio, and avatar URL
- Account info display (email, join date)
- Recent reviews section
- Login-gated access

---

### 4.18 Contact Form

| Attribute   | Detail |
|-------------|--------|
| **Page**    | `src/pages/Contact.jsx` |
| **API Endpoints** | `POST /api/contact` |
| **Backend** | `api/contact.js` |

**Description:**  
Contact form with name, email, subject selector, and message textarea. Submissions are stored in the database and viewable through the admin dashboard.

---

### 4.19 Responsive Navigation

| Attribute   | Detail |
|-------------|--------|
| **Component** | `src/components/Navbar.jsx` |
| **Context** | `AuthContext.jsx` → `isAdmin`, `viewMode`, `toggleViewMode` |

**Description:**  
Fixed top navigation with glassmorphism styling, search bar, and responsive hamburger menu.

**Key Features:**
- **Desktop** — Horizontal nav links + search + user avatar + logout
- **Mobile** — Hamburger menu with slide-down animation
- **Admin badge** — Golden "👑 Admin View" / "👤 User View" toggle button
- **Admin Dashboard link** — Visible only in hamburger menu for admin/super_admin users
- **View toggle** — Both desktop (badge button) and mobile (menu item)
- Active route highlighting with purple glow

---

### 4.20 Local JSON Anime Database

| Attribute   | Detail |
|-------------|--------|
| **Data File** | `src/data/animeDatabase.json` |
| **Service** | `src/services/api.js` |

**Description:**  
A curated collection of 75 anime entries stored as a local JSON file, eliminating external API dependency for complete data control and offline capability.

**Data Fields Per Anime:**
| Field | Type | Example |
|-------|------|---------|
| `mal_id` | Number | `1` |
| `title` | String | `"Cowboy Bebop"` |
| `title_english` | String | `"Cowboy Bebop"` |
| `title_japanese` | String | `"カウボーイビバップ"` |
| `synopsis` | String | Full description text |
| `score` | Number | `8.75` |
| `scored_by` | Number | `932451` |
| `rank` | Number | `28` |
| `popularity` | Number | `39` |
| `episodes` | Number | `26` |
| `status` | String | `"Finished Airing"` |
| `type` | String | `"TV"` / `"Movie"` |
| `source` | String | `"Original"` / `"Manga"` |
| `duration` | String | `"24 min per ep"` |
| `rating` | String | `"R - 17+"` |
| `aired` | Object | `{ "string": "Apr 3, 1998 to Apr 24, 1999" }` |
| `season` | String | `"spring"` |
| `year` | Number | `1998` |
| `genres` | Array | `["Action", "Sci-Fi"]` |
| `themes` | Array | `["Space"]` |
| `demographics` | Array | `[]` |
| `studios` | Array | `["Sunrise"]` |
| `image` | String | CDN image URL |
| `trailer_url` | String | YouTube embed URL |
| `characters` | Array | `[{ "name": "...", "role": "Main", "image": "..." }]` |
| `trending` | Boolean | `true` / `false` |
| `topRated` | Boolean | `true` / `false` |

**API Service Functions (`src/services/api.js`):**
| Function | Purpose |
|----------|---------|
| `normalizeAnime(a)` | Normalizes raw/normalized data into component-compatible shape |
| `getTopAnime(page, limit, filter)` | Top anime sorted by score, with filter options |
| `searchAnime(query, page, params)` | Full-text search with genre/status/type/sort filters |
| `getAnimeById(id)` | Single anime by MAL ID |
| `getAnimeCharacters(id)` | Character list for an anime |
| `getAnimeEpisodes(id, page)` | Generated episode list |
| `getAnimeReviews(id)` | Returns empty (user reviews come from DB) |
| `getSeasonNow(page)` | Trending/airing anime |
| `getAnimeRecommendations(id)` | Same-genre recommendations |
| `getGenres()` | All genres with anime counts |
| `getAllAnimeRaw()` | Raw data export for admin use |

---

## 5. API Endpoints Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account (auto-detects super admin) |
| `POST` | `/api/auth/login` | ❌ | Login (auto-upgrades super admin) |
| `GET` | `/api/auth/me` | 🔒 JWT | Restore session |

### User Data

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/api/profile` | 🔒 JWT | Update bio, username, avatar |
| `POST` | `/api/contact` | ❌ | Submit contact message |

### Watchlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/watchlist` | 🔒 JWT | Get user's watchlist |
| `POST` | `/api/watchlist` | 🔒 JWT | Add anime to watchlist |
| `PUT` | `/api/watchlist` | 🔒 JWT | Update watch status |
| `DELETE` | `/api/watchlist` | 🔒 JWT | Remove from watchlist |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reviews?anime_id=` | ❌ | Get reviews + avg_rating |
| `POST` | `/api/reviews` | 🔒 JWT | Submit/update review |

### Admin (all require admin/super_admin role)

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/admin?action=stats` | Any Admin | Dashboard statistics |
| `GET` | `/api/admin?action=users` | `view_users` | List all users |
| `DELETE` | `/api/admin?action=users` | Super Admin | Delete a user |
| `GET` | `/api/admin?action=manage-admins` | Super Admin | List all admins |
| `POST` | `/api/admin?action=promote` | Super Admin | Promote user to admin |
| `POST` | `/api/admin?action=demote` | Super Admin | Demote admin to user |
| `POST` | `/api/admin?action=update-permissions` | Super Admin | Update admin permissions |
| `GET` | `/api/admin?action=reviews` | `moderate_reviews` | List all reviews |
| `POST` | `/api/admin?action=reviews` | `moderate_reviews` | Hide/restore review |
| `DELETE` | `/api/admin?action=reviews` | Super Admin | Hard delete review |
| `GET` | `/api/admin?action=messages` | `view_messages` | List contact messages |
| `POST` | `/api/admin?action=messages` | Any Admin | Mark message read/unread |
| `DELETE` | `/api/admin?action=messages` | Super Admin | Delete message |
| `GET` | `/api/admin?action=anime` | `manage_anime` | List custom anime |
| `POST` | `/api/admin?action=anime` | `manage_anime` | Add custom anime |
| `PUT` | `/api/admin?action=anime` | `manage_anime` | Edit custom anime |
| `DELETE` | `/api/admin?action=anime` | Varies | Super Admin: hard delete, Admin: soft delete |
| `GET` | `/api/admin?action=search-users&q=` | Super Admin | Search users to promote |

### Setup

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/setup` | Create/migrate all database tables |

---

## 6. Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PK | Auto-incrementing ID |
| `username` | VARCHAR(50) UNIQUE | Display name |
| `email` | VARCHAR(255) UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | bcrypt hashed password |
| `bio` | TEXT | User bio |
| `avatar_url` | TEXT | Profile picture URL |
| `role` | VARCHAR(20) | `user` / `admin` / `super_admin` |
| `admin_permissions` | JSONB | Permission flags for admins |
| `created_at` | TIMESTAMP | Registration date |

### `watchlist`
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PK | Auto-incrementing ID |
| `user_id` | INTEGER FK | References `users.id` |
| `anime_mal_id` | INTEGER | MAL ID of the anime |
| `title` | VARCHAR(255) | Anime title |
| `image` | TEXT | Cover image URL |
| `genres` | TEXT | JSON-encoded genre array |
| `rating` | DECIMAL(3,1) | Anime score |
| `episodes` | INTEGER | Total episodes |
| `watch_status` | VARCHAR(30) | Watching/Completed/Plan to Watch/Dropped |
| `progress` | INTEGER | Watch progress percentage |
| `added_at` | TIMESTAMP | Date added |

### `reviews`
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PK | Auto-incrementing ID |
| `user_id` | INTEGER FK | References `users.id` |
| `anime_mal_id` | INTEGER | MAL ID of the anime |
| `anime_title` | VARCHAR(255) | Anime title |
| `rating` | INTEGER | 1-10 rating |
| `review_text` | TEXT | Review content |
| `is_hidden` | BOOLEAN | Soft-delete flag (admin moderation) |
| `created_at` | TIMESTAMP | Submission date |

### `contact_messages`
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PK | Auto-incrementing ID |
| `name` | VARCHAR(100) | Sender name |
| `email` | VARCHAR(255) | Sender email |
| `subject` | VARCHAR(100) | Message subject |
| `message` | TEXT | Message body |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMP | Submission date |

### `anime_custom`
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PK | Auto-incrementing ID |
| `mal_id` | INTEGER UNIQUE | Generated unique ID (900000+) |
| `title` | VARCHAR(255) | Anime title |
| `title_english` | VARCHAR(255) | English title |
| `synopsis` | TEXT | Description |
| `score` | DECIMAL(4,2) | Rating score |
| `episodes` | INTEGER | Episode count |
| `status` | VARCHAR(50) | Airing status |
| `type` | VARCHAR(20) | TV/Movie/OVA/etc. |
| `genres` | TEXT | JSON-encoded array |
| `studios` | TEXT | JSON-encoded array |
| `image` | TEXT | Cover image URL |
| `trailer_url` | TEXT | YouTube embed URL |
| `is_hidden` | BOOLEAN | Soft-delete flag |
| `added_by` | INTEGER FK | Admin who added it |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last edit date |

---

## 7. Environment Variables

Set these in **Vercel → Project Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `SUPER_ADMIN_EMAIL` | ✅ | Email of the super admin (your email) |

> ⚠️ `SUPER_ADMIN_EMAIL` is **never exposed** to the client. It is read only by server-side functions (`api/_auth.js`) and compared against during registration/login.

---

## 8. Setup & Deployment

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/RaianHaque/AnimeVerse.git
cd AnimeVerse

# Install dependencies
npm install

# Run locally
npm run dev
```

### Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Set the 3 environment variables (see [Section 7](#7-environment-variables))
3. Deploy — Vercel auto-detects Vite + serverless functions in `/api/`
4. Visit `https://your-site.vercel.app/api/setup` to initialize the database
5. Register with your super admin email to get full access

### Post-Deployment Checklist

- [ ] Set `DATABASE_URL` in Vercel env vars
- [ ] Set `JWT_SECRET` in Vercel env vars
- [ ] Set `SUPER_ADMIN_EMAIL` in Vercel env vars
- [ ] Visit `/api/setup` to create database tables
- [ ] Register an account using your super admin email
- [ ] Verify admin dashboard appears in hamburger menu

---

> **Built with 💜 by AnimeVerse Team — 2026**
