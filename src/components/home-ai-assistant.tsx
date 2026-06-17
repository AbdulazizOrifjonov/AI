import logoSrc from "@/assets/oshpaz-logo.png";
import { MessageResponse } from "@/components/ai-elements/message";
import { loadActiveRecipe, type ActiveRecipe } from "@/lib/active-recipe";
import { getDishBySlug } from "@/lib/dishes-data";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useRouterState } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
  ArrowUp,
  ChefHat,
  GripVertical,
  ImagePlus,
  Loader2,
  Maximize2,
  MessageCircle,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const QUICK_PROMPTS = [
  "Muzlatkichdagi mahsulotlardan taom",
  "Tez nonushta tavsiya qil",
  "Bu rasmdagi taomni tahlil qil",
];

// Dish context prefix — stripped from UI display but sent to AI
const DISH_CTX_PREFIX = "«";
const DISH_CTX_SUFFIX = "»\n\n";
const DISH_CTX_RE = /^«[^»]+»\n\n/;

function getDisplayText(text: string): string {
  return text.replace(DISH_CTX_RE, "");
}

const DISH_ROUTE_RE = /^\/dishes\/([^/]+)$/;

const DOCKED_ROUTES: string[] = [];

const MIN_DOCK_WIDTH = 300;
const MAX_DOCK_PCT = 0.7;
const DEFAULT_DOCK_PCT = 0.5;

const POPUP_DEFAULT_WIDTH = 384;
const POPUP_DEFAULT_HEIGHT = 560;
const POPUP_MIN_WIDTH = 320;
const POPUP_MAX_WIDTH = 560;
const POPUP_MIN_HEIGHT = 380;
const POPUP_MAX_HEIGHT = 780;

type PendingImage = {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
};

export function HomeAiAssistant() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const shouldDock = DOCKED_ROUTES.some((p) => pathname.startsWith(p));

  const isCookRoute = pathname.startsWith("/cook");

  const currentDish = useMemo(() => {
    const match = pathname.match(DISH_ROUTE_RE);
    if (!match) return null;
    return getDishBySlug(match[1]) ?? null;
  }, [pathname]);

  const [cookRecipe, setCookRecipe] = useState<ActiveRecipe | null>(null);
  useEffect(() => {
    if (isCookRoute) {
      setCookRecipe(loadActiveRecipe());
    } else {
      setCookRecipe(null);
    }
  }, [isCookRoute]);

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  // Start with MIN_DOCK_WIDTH to avoid SSR/client hydration mismatch;
  // the effect below sets the correct route-aware width after mount.
  const [dockWidth, setDockWidth] = useState<number>(MIN_DOCK_WIDTH);

  const [popupWidth, setPopupWidth] = useState(POPUP_DEFAULT_WIDTH);
  const [popupHeight, setPopupHeight] = useState(POPUP_DEFAULT_HEIGHT);

  // Set correct dock width on mount when docked
  useEffect(() => {
    if (!shouldDock) return;
    const w = Math.max(MIN_DOCK_WIDTH, Math.min(window.innerWidth * DEFAULT_DOCK_PCT, window.innerWidth * MAX_DOCK_PCT));
    setDockWidth(w);
    document.documentElement.style.setProperty("--ai-dock-width", `${w}px`);
  }, [shouldDock]);

  useEffect(() => {
    if (shouldDock) {
      setOpen(true);
      document.documentElement.style.setProperty("--ai-dock-width", `${dockWidth}px`);
    } else {
      document.documentElement.style.setProperty("--ai-dock-width", "0px");
    }
    return () => {
      document.documentElement.style.setProperty("--ai-dock-width", "0px");
    };
  }, [shouldDock, dockWidth]);

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = dockWidth;
      const onMove = (e: PointerEvent) => {
        const delta = startX - e.clientX;
        const maxW = window.innerWidth * MAX_DOCK_PCT;
        const next = Math.max(MIN_DOCK_WIDTH, Math.min(maxW, startWidth + delta));
        setDockWidth(next);
        document.documentElement.style.setProperty("--ai-dock-width", `${next}px`);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [dockWidth],
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    id: "home-ai-assistant",
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("AI bilan bog'lanishda xato yuz berdi.");
    },
  });

  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  const startPopupResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = popupWidth;
      const startHeight = popupHeight;
      const onMove = (e: PointerEvent) => {
        const deltaX = startX - e.clientX;
        const deltaY = startY - e.clientY;
        setPopupWidth(Math.max(POPUP_MIN_WIDTH, Math.min(POPUP_MAX_WIDTH, startWidth + deltaX)));
        setPopupHeight(Math.max(POPUP_MIN_HEIGHT, Math.min(POPUP_MAX_HEIGHT, startHeight + deltaY)));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "nwse-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [popupWidth, popupHeight],
  );

  // Bitta taom/retsept konteksti boshqasiga (yoki bo'sh holatga) almashganda —
  // AI yordamchi kichik (yopiq) holatga qaytadi va suhbat tozalanadi.
  const contextKey = isCookRoute && cookRecipe
    ? `cook:${cookRecipe.name}`
    : currentDish
      ? `dish:${currentDish.slug}`
      : null;
  const prevContextKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevContextKeyRef.current;
    if (prev !== null && prev !== contextKey) {
      setOpen(false);
      setMessages([]);
      setInput("");
      setPendingImages([]);
      setUnread(false);
    }
    prevContextKeyRef.current = contextKey;
  }, [contextKey, setMessages]);

  // Open from dish detail page "AI Oshpaz bilan suhbat" button
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setUnread(false);
    };
    window.addEventListener("open-ai-assistant", handler);
    return () => window.removeEventListener("open-ai-assistant", handler);
  }, []);

  useEffect(() => {
    if (open || shouldDock) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setUnread(false);
    }
  }, [messages.length, status, open, shouldDock]);

  useEffect(() => {
    if (!open && !shouldDock && status === "ready" && messages.at(-1)?.role === "assistant") {
      setUnread(true);
    }
  }, [messages, status, open, shouldDock]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const files = Array.from(fileList).slice(0, 3);
    const nextImages: PendingImage[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} rasm fayli emas.`);
        continue;
      }

      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} 8MB dan katta.`);
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      nextImages.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        dataUrl,
      });
    }

    setPendingImages((current) => [...current, ...nextImages].slice(0, 3));
  };

  const submitMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if ((!text && pendingImages.length === 0) || isBusy) return;

    const userText = text || "Ushbu rasmni oshpaz sifatida tahlil qilib ber.";

    // Inject context into the first message so AI knows what's being cooked/viewed
    let apiText = userText;
    if (messages.length === 0) {
      if (isCookRoute && cookRecipe) {
        apiText =
          `${DISH_CTX_PREFIX}Foydalanuvchi hozir "${cookRecipe.name}" taomini pishirayapti. ` +
          `Tavsif: ${cookRecipe.description}. ` +
          `Foydalanilayotgan masalliqlar: ${cookRecipe.usedIngredients.join(", ")}.${DISH_CTX_SUFFIX}` +
          userText;
      } else if (currentDish) {
        apiText =
          `${DISH_CTX_PREFIX}Foydalanuvchi hozir "${currentDish.name}" retsepti sahifasida. ` +
          `Tavsif: ${currentDish.description}${DISH_CTX_SUFFIX}` +
          userText;
      }
    }

    await sendMessage({
      text: apiText,
      files: pendingImages.map((image) => ({
        type: "file" as const,
        mediaType: image.type,
        url: image.dataUrl,
        filename: image.name,
      })),
    });

    setInput("");
    setPendingImages([]);
  };

  const resetDockWidth = () => {
    const w = Math.max(MIN_DOCK_WIDTH, Math.min(window.innerWidth * DEFAULT_DOCK_PCT, window.innerWidth * MAX_DOCK_PCT));
    setDockWidth(w);
    document.documentElement.style.setProperty("--ai-dock-width", `${w}px`);
  };

  const Header = (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background shadow-sm">
          <img src={logoSrc} alt="OSHPAZ AI" className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">
            OSHPAZ AI yordamchi
          </h2>
          <p className="truncate text-[11px] text-muted-foreground">
            Online · Gemini bilan ulangan
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {shouldDock ? (
          <button
            type="button"
            onClick={resetDockWidth}
            aria-label="Eni asliga qaytarish"
            title="Enini asliga qaytarish"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Yopish"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  const Conversation = (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,var(--color-background),var(--color-card))] px-3 py-4"
    >
      {messages.length === 0 ? (
        <div className="flex h-full flex-col justify-center gap-3">
          {isCookRoute && cookRecipe ? (
            <>
              <div className="flex items-start gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ChefHat className="h-4 w-4" />
                </div>
                <div className="max-w-[90%] rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground shadow-sm">
                  <strong>{cookRecipe.name}</strong> pishirayapsiz!
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Pishirish jarayonida savol bering yoki rasm yuboring.
                  </span>
                </div>
              </div>
              <div className="grid gap-1.5">
                {[
                  `${cookRecipe.name}ning biror bosqichini tushuntir`,
                  `Qovurish darajasini qanday bilaman?`,
                  `Rasm yuborib tahlil qildirish`,
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition hover:border-primary/50 hover:bg-accent"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </>
          ) : currentDish ? (
            <>
              <div className="flex items-start gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div className="max-w-[85%] rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground shadow-sm">
                  <span className="mr-1">{currentDish.emoji}</span>
                  <strong>{currentDish.name}</strong> retseptini ko'ryapsiz.
                  <br />
                  Bu taom haqida savol bering yoki pishirish jarayonida yordam so'rang!
                </div>
              </div>
              <div className="grid gap-1.5">
                {[
                  `${currentDish.name} pishirishda qanday sir-asrorlar bor?`,
                  `${currentDish.name} uchun masalliqlarni qanday tanlash kerak?`,
                  `${currentDish.name}ni tezroq pishirish usuli bormi?`,
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition hover:border-primary/50 hover:bg-accent"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ChefHat className="h-4 w-4" />
                </div>
                <div className="max-w-[85%] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                  Salom! Men OSHPAZ AI yordamchi. Taom rasmini yuboring yoki
                  mahsulotlaringizni yozing.
                </div>
              </div>
              <div className="grid gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition hover:border-primary/50 hover:bg-accent"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-background shadow-sm">
                  <img src={logoSrc} alt="OSHPAZ AI" className="h-5 w-5" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground"
                )}
              >
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return message.role === "assistant" ? (
                      <MessageResponse key={index}>{part.text}</MessageResponse>
                    ) : (
                      <p key={index} className="whitespace-pre-wrap">
                        {getDisplayText(part.text)}
                      </p>
                    );
                  }

                  if (part.type === "file" && part.mediaType?.startsWith("image/")) {
                    return (
                      <img
                        key={index}
                        src={part.url}
                        alt={part.filename ?? "Yuklangan rasm"}
                        className="mt-2 max-h-40 rounded-md border border-border object-cover"
                      />
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
          {status === "submitted" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-background shadow-sm">
                <img src={logoSrc} alt="OSHPAZ AI" className="h-5 w-5" />
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Javob tayyorlanmoqda...
            </div>
          )}
        </div>
      )}
    </div>
  );

  const Composer = (
    <form
      className="border-t border-border bg-background p-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        submitMessage();
      }}
    >
      {pendingImages.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {pendingImages.map((image) => (
            <div
              key={image.id}
              className="relative h-12 w-12 overflow-hidden rounded-md border border-border"
            >
              <img
                src={image.dataUrl}
                alt={image.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label="Rasmni olib tashlash"
                onClick={() =>
                  setPendingImages((images) =>
                    images.filter((item) => item.id !== image.id)
                  )
                }
                className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <button
          type="button"
          aria-label="Rasm yuklash"
          onClick={() => fileInputRef.current?.click()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submitMessage();
            }
          }}
          placeholder="Xabar yozing..."
          className="min-h-9 max-h-28 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
          rows={1}
        />
        <button
          type="submit"
          aria-label="Yuborish"
          disabled={isBusy || (!input.trim() && pendingImages.length === 0)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );

  if (shouldDock) {
    return (
      <aside
        style={{ width: dockWidth }}
        suppressHydrationWarning
        className="fixed right-0 top-0 z-40 hidden h-screen flex-col border-l border-border bg-card shadow-xl md:flex"
      >
        <div
          onPointerDown={startResize}
          role="separator"
          aria-orientation="vertical"
          aria-label="AI yordamchi enini o'zgartirish"
          className="group absolute left-0 top-0 h-full w-1.5 -translate-x-1/2 cursor-col-resize select-none"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition group-hover:bg-primary" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-background p-0.5 opacity-0 shadow transition group-hover:opacity-100">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {Header}
        {Conversation}
        {Composer}
      </aside>
    );
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="AI yordamchini ochish"
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
          {unread && (
            <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </button>
      )}

      {open && (
        <div
          style={{
            width: `min(${popupWidth}px, calc(100vw - 2.5rem))`,
            height: `min(${popupHeight}px, calc(100vh - 5.5rem))`,
          }}
          suppressHydrationWarning
          className="fixed bottom-5 right-5 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div
            onPointerDown={startPopupResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="AI yordamchi o'lchamini o'zgartirish"
            className="group absolute left-0 top-0 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize touch-none select-none"
          >
            <div className="absolute inset-0 grid place-items-center rounded-full border border-border bg-background opacity-60 shadow transition group-hover:opacity-100">
              <GripVertical className="h-3 w-3 rotate-45 text-muted-foreground" />
            </div>
          </div>
          {Header}
          {Conversation}
          {Composer}
        </div>
      )}
    </>
  );
}
