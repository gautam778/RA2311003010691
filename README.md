# Campus Notifications

This repository contains the solution for the Campus Hiring Evaluation. 
The repository consists of:

- `logging-middleware`: A reusable NPM package providing structured logging to the evaluation server.
- `notification_app_be`: A backend script written in TypeScript. It computes the priority inbox of notifications by assigning scores based on type and recency. Run using `npm start` (requires ts-node).
- `notification_app_fe`: A React (Vite, TypeScript, Material UI) frontend displaying "All Notifications" and "Priority Inbox" views. It tracks viewed notifications locally and supports responsive views. Run using `npm run dev`.

## Instructions

1. **Logging Middleware**: Ensure you run `npm install` and `npm run build` within `logging-middleware`.
2. **Backend**: Navigate to `notification_app_be`, run `npm install`, and then `npm start`.
3. **Frontend**: Navigate to `notification_app_fe`, run `npm install`, and then `npm run dev` to serve the application on port 3000.
