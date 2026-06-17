import logoSrc from "@/assets/oshpaz-logo.png";
import { Button } from "@/components/ui/button";
import type { Thread } from "@/lib/threads-store";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  threads: Thread[];
  activeId?: string;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function ThreadSidebar({ threads, activeId, onNew, onDelete }: Props) {
  const navigate = useNavigate();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const remaining = threads.filter((t) => t.id !== id);
    onDelete(id);
    if (id === activeId) {
      if (remaining.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
      } else {
        navigate({ to: "/chat" });
      }
    }
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoSrc} alt="" width={32} height={32} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-sidebar-foreground">OSHPAZ AI</span>
            <span className="text-xs text-muted-foreground">Bosh sahifa</span>
          </div>
        </Link>
      </div>

      <div className="px-3">
        <Button onClick={onNew} className="w-full justify-start gap-2" variant="default">
          <Plus className="h-4 w-4" />
          Yangi suhbat
        </Button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
        {threads.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Hali suhbatlar yo'q
          </p>
        ) : (
          <ul className="space-y-1">
            {threads.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id} className="group relative">
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                    )}
                  >
                    <span className="truncate pr-6">{t.title}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(t.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-muted-foreground">
        Suhbatlar shu brauzerda saqlanadi.
      </div>
    </aside>
  );
}
