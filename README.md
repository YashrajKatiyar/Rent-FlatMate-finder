# Rent & Flatmate Finder

An AI-assisted platform connecting room owners with tenants. Owners post room listings; tenants
build a preference profile. An LLM (Claude) scores compatibility between each tenant-listing pair,
listings are ranked by that score, and once a tenant expresses interest and the owner accepts,
both parties get a real-time chat room. Email notifications fire on key events.

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT auth
- **Frontend:** React (Vite), React Router, Axios, Socket.IO client
- **LLM:** Anthropic Claude API (`@anthropic-ai/sdk`), with a deterministic rule-based fallback
- **Email:** Nodemailer (Gmail SMTP by default, any free-tier SMTP works)

---

## 1. Setup Guide

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod` or a free MongoDB Atlas cluster)
- An Anthropic API key (optional — the app falls back to rule-based scoring without one)
- An email account with SMTP access (Gmail App Password recommended for the free tier)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY, EMAIL_USER, EMAIL_PASS
npm run dev              # starts on http://localhost:5000
npm run seed:admin       # optional: creates an admin user (see .env for ADMIN_EMAIL/ADMIN_PASSWORD)
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on localhost:5000
npm run dev               # starts on http://localhost:5173
```

### Environment Variables (`backend/.env.example`)
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/rent-flatmate-finder

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-haiku-20241022

EMAIL_SERVICE=gmail
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM="Rent & Flatmate Finder <youraddress@gmail.com>"

HIGH_MATCH_THRESHOLD=80
```

### Frontend `.env.example`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 2. Database Schema (MongoDB / Mongoose)

| Collection | Key Fields | Notes |
|---|---|---|
| **User** | name, email (unique), password (hashed), role (`tenant`\|`owner`\|`admin`), isActive | bcrypt-hashed password, never returned by default |
| **TenantProfile** | user (ref, unique), preferredLocation, budgetMin, budgetMax, moveInDate, notes | One profile per tenant |
| **Listing** | owner (ref), location, rent, availableFrom, roomType, furnishingStatus, photos[], status (`active`\|`filled`) | Indexed on location+rent+status for filtering |
| **CompatibilityScore** | tenant (ref), listing (ref), score (0-100), explanation, source (`llm`\|`rule-based`) | Unique compound index on (tenant, listing) — computed once, reused, invalidated on profile edit |
| **InterestRequest** | tenant (ref), listing (ref), owner (ref), status (`pending`\|`accepted`\|`declined`), compatibilityScore (ref) | Unique compound index on (tenant, listing); gates chat access |
| **Message** | interestRequest (ref), sender (ref), text, readAt | Persisted chat history, indexed on (interestRequest, createdAt) |

**Relationships:** `User` 1—1 `TenantProfile` (tenants only) · `User` 1—N `Listing` (owners) ·
`(User, Listing)` 1—1 `CompatibilityScore` · `(User, Listing)` 1—1 `InterestRequest` ·
`InterestRequest` 1—N `Message`.

---

## 3. LLM Compatibility Scoring

**Prompt template** (`backend/src/services/llmService.js`):
```
Given this room listing: <listing JSON> and this tenant profile: <profile JSON>,
compute a compatibility score from 0 to 100 based on budget and location match.
Return ONLY valid JSON in this exact shape, no other text:
{ "score": number, "explanation": string }
```

**Example input:**
```json
// listing
{ "location": "Koramangala, Bangalore", "rent": 18000, "roomType": "single", "furnishingStatus": "furnished", "availableFrom": "2026-08-01" }
// tenant profile
{ "preferredLocation": "Koramangala", "budgetMin": 12000, "budgetMax": 20000, "moveInDate": "2026-08-15" }
```

**Example LLM output:**
```json
{ "score": 92, "explanation": "Location matches exactly and rent (₹18,000) comfortably fits within the tenant's ₹12,000–20,000 budget. Move-in dates are compatible." }
```

**Fallback behavior:** If the Anthropic API key is missing, the request times out/errors, or the
response isn't valid JSON in the expected shape, `computeCompatibilityScore()` falls back to
`ruleBasedScore()` — a deterministic function that scores 100 minus penalties for rent above the
tenant's max budget (scaled by % over) and for location mismatches (exact / partial / no match).
The `source` field on `CompatibilityScore` records which path was used, so this is visible in the
UI and the database.

Scores are computed once per (tenant, listing) pair and cached in `CompatibilityScore`. They're
only recomputed if the tenant edits their profile (which deletes their existing scores so they
regenerate lazily on next browse) — listings are never rescored on every request.

---

## 4. API Documentation

Base URL: `/api`. Authenticated routes require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ name, email, password, role: 'tenant'\|'owner' }` |
| POST | `/auth/login` | Public | `{ email, password }` |
| GET | `/auth/me` | Authenticated | — |

### Tenant Profile
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/tenant/profile` | Tenant | `{ preferredLocation, budgetMin, budgetMax, moveInDate, notes? }` (upsert) |
| GET | `/tenant/profile` | Tenant | — |

### Listings
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/listings` | Owner | multipart/form-data, `photos` field (up to 6 images) |
| GET | `/listings/mine` | Owner | Owner's own listings |
| PATCH | `/listings/:id/fill` | Owner | Marks listing filled, hides from search |
| GET | `/listings?location=&minRent=&maxRent=` | Authenticated | Ranked by compatibility for tenants |
| GET | `/listings/:id` | Authenticated | Single listing detail |

### Interest Requests
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/interests` | Tenant | `{ listingId }` — triggers owner email if score ≥ `HIGH_MATCH_THRESHOLD` |
| PATCH | `/interests/:id` | Owner | `{ decision: 'accepted'\|'declined' }` — triggers tenant email |
| GET | `/interests/sent` | Tenant | — |
| GET | `/interests/received` | Owner | — |

### Chat
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/chat/threads` | Authenticated | Accepted interest requests as chat threads |
| GET | `/chat/:interestId/messages` | Authenticated | Full message history for a thread |

**Socket.IO events** (auth via `socket.handshake.auth.token`):
- `join_room { interestId }` → joins room `interest:<id>` (only if accepted + participant)
- `send_message { interestId, text }` → persists + broadcasts `new_message`
- `typing { interestId }` → broadcasts `user_typing`

### Admin
| Method | Route |
|---|---|
| GET | `/admin/users` |
| PATCH | `/admin/users/:id/deactivate` \| `/reactivate` |
| GET | `/admin/listings` |
| DELETE | `/admin/listings/:id` |
| GET | `/admin/activity` |

---

## 5. Project Structure
```
backend/src/
  config/db.js          # MongoDB connection
  models/                # Mongoose schemas
  middleware/            # auth, role guard, upload, error handler
  controllers/            # route handlers
  routes/
  services/               # llmService (Claude + fallback), emailService (Nodemailer)
  sockets/chatSocket.js   # Socket.IO real-time chat
  app.js / server.js

frontend/src/
  pages/                  # Login, Register, Tenant*, Owner*, Chat, AdminDashboard
  components/             # NavBar, ProtectedRoute
  context/AuthContext.jsx
  services/               # api.js (axios), socket.js
```
