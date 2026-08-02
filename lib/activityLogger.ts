export type ActivityLog = {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
};

const STORAGE_KEY = "activityLogs";

export function logActivity(
  action: string,
  user: string,
  target: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  const savedLogs = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]",
  ) as ActivityLog[];

  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    action,
    user,
    target,
    timestamp: new Date().toLocaleString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newLog, ...savedLogs]),
  );
}

export function getActivityLogs() {
  if (typeof window === "undefined") {
    return [];
  }

  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]",
  ) as ActivityLog[];
}
