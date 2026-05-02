# Notification System Design

## Stage 1

### Problem Statement
The campus notification platform delivers a high volume of notifications across three categories: **Placements**, **Results**, and **Events**. Users lose track of important notifications due to volume. The goal is to compute a **Priority Inbox** — the top N most important unread notifications — efficiently, even as new notifications keep arriving.

### Priority Criteria
Priority is determined by two factors combined into a single score:

1. **Type Weight** (dominates) — importance of notification category:
   | Type      | Weight |
   |-----------|--------|
   | Placement | 3      |
   | Result    | 2      |
   | Event     | 1      |

2. **Recency** (tiebreaker within same type) — newer notifications rank higher.

### Score Formula
```
score = typeWeight × 1_000_000_000_000 + unixTimestampMs
```
Multiplying by 10¹² ensures type weight always dominates recency. Within the same type, a higher Unix timestamp (more recent) wins.

### Algorithm — Fixed-Size Min-Heap (Top-K)

**Data Structure:** A Min-Heap of fixed capacity K (default: 10).
The heap root always holds the *minimum* score among the current top-K.

**Insert Logic (O(log K) per notification):**
- If heap size < K → insert unconditionally.
- If heap size == K and new score > root score → replace root, sift down.
- Otherwise → skip (notification cannot be in top-K).

**Why Min-Heap?**
A Min-Heap lets us maintain exactly the top-K elements without sorting the full dataset. Each new notification is evaluated against the weakest element in the top-K (the root). This gives:
- **Time complexity:** O(N log K) for N notifications, K slots.
- **Space complexity:** O(K) — only K items in memory at any time.

**Why this is efficient for streaming notifications:**
When a new notification arrives, we only need one comparison (against the heap root) and at most one O(log K) heapify operation. Since K is small (10–20), this is effectively O(1) amortised.

### Sequence Diagram
```
main()
  └─▶ getToken() → POST /auth → Bearer token
  └─▶ fetchNotifications(page=1, limit=100)
        └─▶ GET /evaluation-service/notifications
              ├─ [401] → getToken() → retry
              └─ [200] → return notifications[]
  └─▶ for each notification:
        └─▶ computeScore(n) → score
        └─▶ heap.insert(scoredNotification)
              ├─ size < K  → push + sift-up
              ├─ score > min → replace root + sift-down
              └─ else → skip
  └─▶ heap.getSortedDesc() → top10[]
  └─▶ print formatted table
```

---

## Stage 2

### Architecture
A **React.js (Vite + TypeScript + Material UI)** single-page application with two main views:

| Route | Page | Description |
|-------|------|-------------|
| `/notifications` | All Notifications | Paginated list, filterable by type |
| `/priority` | Priority Inbox | Top-N priority notifications, filterable |

### Key Design Decisions

1. **Token Management:** Auth credentials are stored in the API service module. The token is fetched once on startup and auto-refreshed on 401 responses. No user login is required (users are pre-authorised).

2. **New vs Viewed:** Viewed notification IDs are persisted in `localStorage`. Notifications not in the viewed set show a **NEW** badge. IDs are added to the set when a card is clicked/expanded.

3. **Priority Inbox (Client-Side):** The same Min-Heap algorithm from Stage 1 runs client-side on fetched notifications to determine the top-N. Users can adjust N (5, 10, 15, 20) dynamically.

4. **Filtering & Pagination:** The All Notifications page uses the API's `notification_type`, `page`, and `limit` query parameters. Priority Inbox fetches a larger batch and computes priority client-side.

5. **Styling:** Material UI components with a custom dark theme for premium feel. Fully responsive for desktop and mobile.

### Component Tree
```
App
├── Navbar
├── /notifications → AllNotificationsPage
│     ├── FilterBar (type chips, limit selector)
│     ├── NotificationCard[] (NEW badge if unread)
│     └── Pagination
└── /priority → PriorityInboxPage
      ├── TopNSelector (10/15/20 options)
      ├── FilterBar (type chips)
      └── NotificationCard[] (ranked #1–N, NEW badge if unread)
```
