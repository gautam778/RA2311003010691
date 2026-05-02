import { Log } from "logging-middleware";


type NotifType = "Placement" | "Result" | "Event";

interface Notification {
  ID:        string;
  Type:      NotifType;
  Message:   string;
  Timestamp: string;
}

interface ScoredNotification extends Notification {
  score: number;
  rank:  number;
}

interface ApiResponse {
  notifications: Notification[];
}


import * as dotenv from 'dotenv';
dotenv.config();

const API_BASE = "http://20.207.122.201/evaluation-service";

const CREDENTIALS = {
  clientID:     process.env.CLIENT_ID || "",
  clientSecret: process.env.CLIENT_SECRET || "",
  email:        process.env.EMAIL || "",
  name:         process.env.NAME || "",
  rollNo:       process.env.ROLL_NO || "",
  accessCode:   process.env.ACCESS_CODE || "",
};

import { setLoggerCredentials } from "logging-middleware";
setLoggerCredentials(CREDENTIALS);

const TYPE_WEIGHT: Record<NotifType, number> = {
  Placement: 3,
  Result:    2,
  Event:     1,
};


function computeScore(n: Notification): number {
  const tw = TYPE_WEIGHT[n.Type] ?? 0;
  const ts = new Date(n.Timestamp).getTime();
  return tw * 1_000_000_000_000 + ts;
}


class MinHeap {
  private heap: ScoredNotification[] = [];
  readonly maxSize: number;

  constructor(maxSize: number) { this.maxSize = maxSize; }

  get size():     number { return this.heap.length; }
  get minScore(): number { return this.heap.length ? this.heap[0].score : -Infinity; }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private up(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[i].score < this.heap[p].score) { this.swap(i, p); i = p; }
      else break;
    }
  }

  private down(i: number) {
    const n = this.heap.length;
    while (true) {
      let s = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].score < this.heap[s].score) s = l;
      if (r < n && this.heap[r].score < this.heap[s].score) s = r;
      if (s === i) break;
      this.swap(i, s); i = s;
    }
  }

  insert(item: ScoredNotification): "inserted" | "replaced" | "skipped" {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.up(this.heap.length - 1);
      return "inserted";
    }
    if (item.score > this.heap[0].score) {
      this.heap[0] = item;
      this.down(0);
      return "replaced";
    }
    return "skipped";
  }

  getSortedDesc(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}


let currentToken = "";

async function getToken(): Promise<string> {
  await Log("backend", "info", "auth", "Requesting Bearer token");
  const res = await fetch(`${API_BASE}/auth`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(CREDENTIALS),
  });
  if (!res.ok) throw new Error(`Auth failed: HTTP ${res.status}`);
  const data = await res.json() as { access_token: string };
  await Log("backend", "info", "auth", "Bearer token obtained");
  return data.access_token;
}

async function fetchNotifications(page = 1, limit = 100): Promise<Notification[]> {
  const url = `${API_BASE}/notifications?page=${page}&limit=${limit}`;
  await Log("backend", "info", "service", `Fetching notifications: page=${page}`);

  const tryFetch = (token: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  let res = await tryFetch(currentToken);

  if (res.status === 401) {
    await Log("backend", "warn", "service", "401 Unauthorized - refreshing token");
    currentToken = await getToken();
    res = await tryFetch(currentToken);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }

  const data = await res.json() as ApiResponse;
  await Log("backend", "info", "service",
    `Fetched count=${data.notifications.length} page=${page}`);
  return data.notifications;
}


async function main() {
  await Log("backend", "info", "service", "Stage 1: Priority Inbox Alg START");

  currentToken = await getToken();

  let notifications: Notification[];
  try {
    notifications = await fetchNotifications(1, 10);
  } catch (err: unknown) {
    await Log("backend", "error", "service",
      `Fetch error`);
    process.exit(1);
  }

  if (notifications.length === 0) {
    await Log("backend", "warn", "service", "API returned 0 notifications");
    return;
  }

  await Log("backend", "info", "service",
    `Scoring ${notifications.length} notifications`);

  const heap = new MinHeap(10);

  for (const n of notifications) {
    const scored: ScoredNotification = { ...n, score: computeScore(n), rank: 0 };
    await Log("backend", "debug", "service",
      `Scored: ${n.ID.substring(0,8)} type=${n.Type}`);
    const action = heap.insert(scored);
    await Log("backend", "debug", "service",
      `Heap decision: ${action} size=${heap.size}`);
  }

  const top10 = heap.getSortedDesc().map((n, i) => ({ ...n, rank: i + 1 }));
  await Log("backend", "info", "service", `Selected top ${heap.maxSize} priority`);

  const W      = 90;
  const border = "═".repeat(W - 2);

  process.stdout.write(`╔${border}╗\n`);
  process.stdout.write(`║  ${"TOP 10 PRIORITY NOTIFICATIONS".padEnd(W - 5)}║\n`);
  process.stdout.write(`╠${border}╣\n`);
  process.stdout.write(
    `║  ${"Rank".padEnd(5)} ${"Type".padEnd(10)} ${"Timestamp".padEnd(22)} ${"Score".padEnd(16)} Message`.padEnd(W - 1) + `║\n`,
  );
  process.stdout.write(`╠${border}╣\n`);

  for (const n of top10) {
    const rank  = `#${n.rank}`.padEnd(5);
    const type  = n.Type.padEnd(10);
    const ts    = n.Timestamp.padEnd(22);
    const score = String(n.score).padEnd(16);
    const msg   = n.Message.length > 28 ? n.Message.slice(0, 25) + "..." : n.Message;
    const row   = `  ${rank} ${type} ${ts} ${score} ${msg}`;
    process.stdout.write(`║${row.padEnd(W - 1)}║\n`);
    process.stdout.write(`║${" ".repeat(W - 2)}║\n`);
  }

  process.stdout.write(`╚${border}╝\n`);

  await Log("backend", "info", "service",
    `Stage 1 done: topN=${top10.length}`);
}

main().catch(async (err: unknown) => {
  await Log("backend", "error", "service",
    `Unhandled err in main`);
  process.exit(1);
});
