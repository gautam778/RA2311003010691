
import type { Notification } from "./api";

type NotifType = "Placement" | "Result" | "Event";

const TYPE_WEIGHT: Record<NotifType, number> = {
  Placement: 3,
  Result:    2,
  Event:     1,
};

export interface ScoredNotification extends Notification {
  score: number;
  rank:  number;
}

function computeScore(n: Notification): number {
  const tw = TYPE_WEIGHT[n.Type] ?? 0;
  const ts = new Date(n.Timestamp).getTime();
  return tw * 1_000_000_000_000 + ts;
}

class MinHeap {
  private heap: ScoredNotification[] = [];
  readonly maxSize: number;

  constructor(maxSize: number) { this.maxSize = maxSize; }

  get size(): number { return this.heap.length; }

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

  insert(item: ScoredNotification) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.up(this.heap.length - 1);
    } else if (item.score > this.heap[0].score) {
      this.heap[0] = item;
      this.down(0);
    }
  }

  getSortedDesc(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

export function getTopN(
  notifications: Notification[],
  n: number,
): ScoredNotification[] {
  const heap = new MinHeap(n);
  for (const notif of notifications) {
    heap.insert({ ...notif, score: computeScore(notif), rank: 0 });
  }
  return heap.getSortedDesc().map((item, i) => ({ ...item, rank: i + 1 }));
}
