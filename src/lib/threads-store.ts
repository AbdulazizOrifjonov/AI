import type { UIMessage } from "ai";

const STORAGE_KEY = "oshpaz-ai-threads-v1";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

function newId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function createThread(): Thread {
  return {
    id: newId(),
    title: "Yangi suhbat",
    updatedAt: Date.now(),
    messages: [],
  };
}

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    /* ignore */
  }
}

export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Yangi suhbat";
  const text = firstUser.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "Yangi suhbat";
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}
