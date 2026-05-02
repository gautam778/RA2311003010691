
const API_BASE = typeof window !== 'undefined' 
  ? "/evaluation-service" 
  : "http://20.207.122.201/evaluation-service";

let CREDENTIALS = {
  clientID:     "",
  clientSecret: "",
  email:        "",
  name:         "",
  rollNo:       "",
  accessCode:   "",
};

export function setLoggerCredentials(creds: typeof CREDENTIALS) {
  CREDENTIALS = creds;
}

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type Package =
  | "cache" | "controller" | "cron_job" | "db" | "domain"
  | "handler" | "repository" | "route" | "service"
  | "api" | "component" | "hook" | "page" | "state" | "style"
  | "auth" | "config" | "middleware" | "utils";

let _token = "";

async function refreshToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(CREDENTIALS),
  });
  if (!res.ok) throw new Error(`[Logger] Auth failed: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  _token = data.access_token;
  return _token;
}

async function postLog(
  token: string, stack: Stack, level: Level, pkg: Package, message: string,
): Promise<Response> {
  return fetch(`${API_BASE}/logs`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${token}`,
    },
    body: JSON.stringify({ stack, level, package: pkg, message }),
  });
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg:   Package,
  message: string,
): Promise<void> {
  try {
    if (!_token) await refreshToken();
    let res = await postLog(_token, stack, level, pkg, message);
    if (res.status === 401) {
      await refreshToken();
      res = await postLog(_token, stack, level, pkg, message);
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`[Logger] API error ${res.status} — [${level}] ${message}. Body: ${body}`);
    }
  } catch (err: unknown) {
    console.error(`[Logger] ${err instanceof Error ? err.message : String(err)}`);
  }
}
