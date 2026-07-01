# System Design Write-Up

## Compatibility Scoring Design

Each tenant carries a single `TenantProfile` (preferred location, budget range, move-in date).
Each `Listing` carries location, rent, availability, and physical attributes. Rather than scoring
every listing against every tenant on every page load, the system computes a score **once per
(tenant, listing) pair** and persists it in a `CompatibilityScore` collection with a unique
compound index on `(tenant, listing)`. When a tenant browses listings, the API checks for an
existing score first; only unseen pairs trigger a new LLM call. This keeps read paths fast and
keeps LLM spend proportional to genuinely new pairings, not to traffic.

Scores go stale when the tenant edits their profile (new budget or location changes what "good
fit" means). Rather than trying to selectively patch scores, the profile-update handler deletes
all of that tenant's cached scores; the next browse call lazily regenerates them. This trades a
slightly slower next request for a much simpler invalidation model — no background jobs, no partial
recompute logic, no risk of serving a score computed against stale preferences. Listings themselves
don't currently trigger recompute on edit, since the assignment only asks for scoring based on
tenant preferences and listing details at time of posting; if listings became mutable in a real
deployment, marking a listing dirty on edit would follow the same delete-and-lazy-regenerate
pattern.

## LLM Integration and Fallback

The scoring service (`llmService.js`) exposes one function, `computeCompatibilityScore(profile,
listing)`, that the rest of the app calls without needing to know whether the score came from an
LLM or a fallback. Internally it sends a single-turn prompt to Claude asking for strict JSON
(`{ score, explanation }`), then validates the response: it must parse as JSON, `score` must be a
number in [0, 100], and `explanation` must be a non-empty string. Any failure at any step — missing
API key, network error, timeout, malformed JSON, an out-of-range score — is caught and routed to
`ruleBasedScore()`, a pure deterministic function with no external dependencies.

The rule-based fallback starts at 100 and subtracts penalties: a scaled penalty when rent exceeds
the tenant's `budgetMax` (proportional to how far over, capped at 60 points), and a location
penalty using case-insensitive exact/substring/no-match tiers (0 / 10 / 35 points). This isn't
meant to be as nuanced as the LLM's judgment, but it guarantees the platform never blocks on a
third-party outage — every listing still gets a usable, explainable score. The `source` field
(`llm` or `rule-based`) is stored alongside every score so it's auditable which path produced it,
and it's surfaced in the admin/owner views for transparency during grading or debugging.

## Chat Implementation

Chat is deliberately gated: a Socket.IO room only exists conceptually once an `InterestRequest` has
`status: 'accepted'`. There's no open messaging between arbitrary users — every socket event
(`join_room`, `send_message`) re-checks the InterestRequest's status and confirms the connecting
user is either the `tenant` or `owner` on that record before allowing access. This means the access
control lives in one place (the InterestRequest document) rather than being duplicated between the
REST message-history endpoint and the socket layer.

Authentication on the socket happens once, at handshake, via `io.use()` middleware that verifies
the JWT and attaches `socket.user` — the same JWT the REST API uses, so there's a single source of
truth for identity. Messages are persisted to MongoDB *before* being broadcast (`Message.create()`
then `io.to(room).emit()`), so a message is never "lost" if a client disconnects mid-broadcast, and
REST-fetched history and live socket messages always agree. Rooms are named `interest:<id>`,
scoping broadcast traffic to exactly the two participants in that conversation.

## Notification Flow

Two email triggers, both fire-and-forget relative to the API response (the HTTP request doesn't
block waiting on SMTP round-trip success/failure beyond an awaited call, but a slow mail server
won't corrupt any state since email failure is caught and logged, never thrown):

1. **Tenant → Owner, high match:** When a tenant sends an interest request, the handler looks up
   the already-cached `CompatibilityScore` for that pair. If `score >= HIGH_MATCH_THRESHOLD`
   (default 80, configurable via env), the owner gets an email naming the tenant and the score.
   This uses the cached score — no extra LLM call is triggered by the act of expressing interest.
2. **Owner → Tenant, decision:** When an owner accepts or declines, the tenant is emailed the
   outcome immediately, with a note to check the platform for chat access if accepted.

Both use a single `emailService.js` wrapper around Nodemailer. If SMTP credentials aren't
configured (e.g., local dev without a mail account), the service logs the intended email to the
console instead of throwing, so the rest of the request pipeline (interest creation, status change)
never fails purely because email delivery isn't configured.
