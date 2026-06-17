import { useThreads } from "@/hooks/use-threads";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "AI Oshpaz — OSHPAZ AI suhbati" },
      { name: "description", content: "OSHPAZ AI bilan oshxonadagi suhbat." },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const { hydrated, ensureThread } = useThreads();

  useEffect(() => {
    if (!hydrated) return;
    const t = ensureThread();
    navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
  }, [hydrated, ensureThread, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">OSHPAZ AI yuklanmoqda...</p>
    </div>
  );
}
