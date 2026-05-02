# Project Overview

Campus environments generate a massive amount of information daily. Students often miss critical updates amidst the noise. This project solves that problem by providing a centralized platform where students receive real-time updates regarding **Placements, Events, and Results**.

The **Campus Notifications Platform** is a full-stack system that intelligently filters and prioritizes notifications. Instead of a chronological feed, it uses an algorithmic approach to ensure the most important and urgent messages are seen first.

1. **All Notifications** — A complete feed of every campus update.
2. **Priority Inbox** — An intelligently sorted inbox powered by a custom scoring algorithm based on notification recency and type.

## Core Features

| Feature | Component | Description |
| :--- | :--- | :--- |
| Priority Scoring | Backend | Dynamically assigns scores to notifications (Urgent, Info) with time-decay. |
| Read/Unread Tracking | Frontend | Locally tracks viewed notifications to keep the UI clean and updated. |
| Responsive UI | Frontend | Adapts seamlessly to both desktop and mobile views. |
| Structured Logging | Middleware | Custom NPM package intercepting and formatting server logs. |

## Project Structure

```text
RA2311003010691/
├── logging-middleware/
│   ├── index.js               ← Middleware logic
│   └── package.json           ← NPM dependencies
│
├── notification_app_be/
│   ├── src/
│   │   └── index.ts           ← Express API server & scoring logic
│   ├── tsconfig.json
│   └── package.json           ← Backend dependencies
│
└── notification_app_fe/
    ├── src/
    │   ├── components/        ← React components (Navbar, NotificationCard)
    │   ├── lib/               ← API utilities and priority logic
    │   ├── App.tsx            ← Main React UI
    │   └── main.tsx           ← Entry point
    ├── index.html
    ├── vite.config.ts         ← Vite configuration
    └── package.json           ← Frontend dependencies
```

## Data Flow & Logic

| Component | Responsibility | Technologies |
| :--- | :--- | :--- |
| **Frontend** | Renders UI, handles state, tracks read notifications | React, Vite, TS, Material UI |
| **Backend** | Serves mock data, calculates priority scores | Node.js, Express, TS |
| **Middleware** | Intercepts API requests for structured logging | Node.js |

## Priority Inbox Pipeline

**Output — Priority Score Calculation**
- `Notification Data` → `Time Decay Factor` + `Type Weight (Urgent vs Info)` → `Final Score` → `Sorted Priority Inbox`

### Notification Types

| Type | Base Weight | Action |
| :--- | :--- | :--- |
| **Urgent** | High | Needs immediate attention (e.g., Placement Deadlines) |
| **Info** | Medium | General awareness (e.g., Campus Events) |
| **Result** | High | Important academic updates |

## How to Run

### Prerequisites
- Node.js 18+
- npm 9+

### Step 1 — Setup Logging Middleware

```bash
cd logging-middleware
npm install
npm run build
cd ..
```

### Step 2 — Start Backend

```bash
cd notification_app_be

# Install dependencies
npm install

# Start Express server
npm start
```
*Backend will run on its configured port and output structured logs via the middleware.*

### Step 3 — Start Frontend

```bash
cd notification_app_fe

# Install npm packages
npm install

# Start React dev server
npm run dev
```
*Frontend runs at: `http://localhost:5173` or `http://localhost:8080`*

## How to Use

### Viewing Notifications
1. Open your browser to the frontend URL.
2. The **"All Notifications"** tab shows the chronological feed.
3. The **"Priority Inbox"** tab shows items sorted by the custom scoring algorithm.
4. Click on a notification to mark it as read; the UI will update dynamically.

*(Add your UI Screenshots here)*
- `[Screenshot 1: Desktop View - Priority Inbox]`
- `[Screenshot 2: Mobile View - Priority Inbox]`

## API Reference (Internal)

### Fetch Notifications
`GET /api/notifications`
**Response:**
```json
[
  {
    "id": "1",
    "title": "TCS Placement Drive",
    "type": "Urgent",
    "timestamp": "2026-05-02T10:00:00Z",
    "priority_score": 95.5
  }
]
```

*(Add your Postman/Insomnia Screenshots here showing request, response, and response time)*
- `[Screenshot 1: Postman API Response]`

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript |
| **Styling** | Material UI (MUI) |
| **Backend API** | Node.js, Express, TypeScript |
| **Middleware** | Custom Node.js NPM Package |
| **Algorithms** | Native TypeScript (No external libraries) |
