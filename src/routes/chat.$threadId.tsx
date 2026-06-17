import { ChatWindow } from "@/components/chat-window";
import { ThreadSidebar } from "@/components/thread-sidebar";
import { useThreads } from "@/hooks/use-threads";
import { createThread } from "@/lib/threads-store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Suhbat — OSHPAZ AI" },
      { name: "description", content: "OSHPAZ AI bilan oshxonadagi suhbatingiz." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const { threads, hydrated, upsertThread, deleteThread } = useThreads();

  const activeThread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId]
  );

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Yuklanmoqda...
      </div>
    );
  }

  const thread = activeThread ?? {
    id: threadId,
    title: "Yangi suhbat",
    updatedAt: Date.now(),
    messages: [],
  };

  const handleNew = () => {
    const t = createThread();
    upsertThread(t);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <ThreadSidebar
        threads={threads}
        activeId={threadId}
        onNew={handleNew}
        onDelete={deleteThread}
      />
      <main className="flex-1 overflow-hidden">
        <ChatWindow key={thread.id} thread={thread} onPersist={upsertThread} />
      </main>
    </div>
  );
}
