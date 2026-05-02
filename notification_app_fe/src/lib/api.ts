
const API_BASE = "/evaluation-service";

const CREDENTIALS = {
  clientID:     import.meta.env.VITE_CLIENT_ID || "",
  clientSecret: import.meta.env.VITE_CLIENT_SECRET || "",
  email:        import.meta.env.VITE_EMAIL || "",
  name:         import.meta.env.VITE_NAME || "",
  rollNo:       import.meta.env.VITE_ROLL_NO || "",
  accessCode:   import.meta.env.VITE_ACCESS_CODE || "",
};

export interface Notification {
  ID:        string;
  Type:      "Placement" | "Result" | "Event";
  Message:   string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export type NotificationType = "Placement" | "Result" | "Event";

let _token = "";

async function refreshToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(CREDENTIALS),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  _token = data.access_token;
  return _token;
}

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!_token) await refreshToken();

  let res = await fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${_token}` },
  });

  if (res.status === 401) {
    await refreshToken();
    res = await fetch(url, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${_token}` },
    });
  }

  return res;
}

export interface FetchNotificationsParams {
  page?:             number;
  limit?:            number;
  notification_type?: NotificationType;
}

export async function fetchNotifications(
  params: FetchNotificationsParams = {},
): Promise<Notification[]> {
  const { page = 1, limit = 20, notification_type } = params;

  const qs = new URLSearchParams({
    page:  String(page),
    limit: String(limit),
    ...(notification_type ? { notification_type } : {}),
  });

  const res = await authFetch(`${API_BASE}/notifications?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as NotificationsResponse;
  return data.notifications ?? [];
}
