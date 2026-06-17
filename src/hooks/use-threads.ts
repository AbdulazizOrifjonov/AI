import { useCallback, useEffect, useState } from "react";
import {
  createThread,
  loadThreads,
  saveThreads,
  type Thread,
} from "@/lib/threads-store";

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveThreads(threads);
  }, [threads, hydrated]);

  const upsertThread = useCallback((thread: Thread) => {
    setThreads((prev) => {
      const idx = prev.findIndex((t) => t.id === thread.id);
      const next = idx >= 0 ? [...prev] : [thread, ...prev];
      if (idx >= 0) next[idx] = thread;
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      return next;
    });
  }, []);

  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ensureThread = useCallback((): Thread => {
    const existing = loadThreads();
    if (existing.length > 0) return existing[0];
    const t = createThread();
    saveThreads([t]);
    setThreads([t]);
    return t;
  }, []);

  return { threads, hydrated, upsertThread, deleteThread, ensureThread };
}
