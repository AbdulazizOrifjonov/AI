import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { clearActiveRecipe, loadActiveRecipe, type ActiveRecipe } from "@/lib/active-recipe";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clipboard,
  ClipboardCheck,
  Clock,
  Flame,
  Pause,
  Play,
  Printer,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cook")({
  head: () => ({
    meta: [
      { title: "Tayyorlash — OSHPAZ AI" },
      {
        name: "description",
        content: "AI tavsiya etgan retseptni bosqichma-bosqich tayyorlang.",
      },
    ],
  }),
  component: CookPage,
});

function CookPage() {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<ActiveRecipe | null>(null);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = loadActiveRecipe();
    if (!r) {
      navigate({ to: "/pantry" });
      return;
    }
    setRecipe(r);
  }, [navigate]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
          Retsept yuklanmoqda...
        </div>
      </div>
    );
  }

  const progress = recipe.steps.length
    ? Math.round((doneSteps.size / recipe.steps.length) * 100)
    : 0;

  const copyShoppingList = async () => {
    const list = recipe.missingIngredients.join("\n");
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      toast.success("Xarid ro'yxati nusxalandi");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nusxalashda xato");
    }
  };

  const printRecipe = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <button
            onClick={() => {
              clearActiveRecipe();
              navigate({ to: "/pantry" });
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tavsiyalarga qaytish
          </button>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{recipe.name}</h1>
              <p className="mt-2 text-muted-foreground">{recipe.description}</p>
            </div>
            <button
              type="button"
              onClick={printRecipe}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground print:hidden"
              title="Retseptni chop etish"
            >
              <Printer className="h-3.5 w-3.5" />
              Chop etish
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Pill icon={<Clock className="h-4 w-4" />}>{recipe.timeMinutes} daqiqa</Pill>
            <Pill icon={<ChefHat className="h-4 w-4" />}>{recipe.difficulty}</Pill>
            <Pill icon={<Flame className="h-4 w-4" />}>{recipe.calories} kkal</Pill>
            <Pill icon={<Users className="h-4 w-4" />}>{recipe.servings} kishi</Pill>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Bajarildi
                </p>
                <span className="text-sm font-semibold text-primary">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {doneSteps.size} / {recipe.steps.length} bosqich
              </p>
            </div>

            <CookTimer defaultMinutes={Math.min(15, recipe.timeMinutes)} />
          </div>

          {recipe.usedIngredients.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Uyingizdagi mahsulotlardan ishlatiladi
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recipe.usedIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.missingIngredients.length > 0 && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <ShoppingBasket className="h-4 w-4" />
                    Yetishmayotgan mahsulotlar
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    {recipe.missingIngredients.join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyShoppingList}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs transition hover:bg-accent print:hidden"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
                      Nusxalandi
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3.5 w-3.5" />
                      Xarid ro'yxati
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bosqichma-bosqich</h2>
            {doneSteps.size > 0 && (
              <button
                onClick={() => setDoneSteps(new Set())}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground print:hidden"
              >
                <RotateCcw className="h-3 w-3" />
                Tozalash
              </button>
            )}
          </div>

          <ol className="mt-4 space-y-3">
            {recipe.steps.map((s, i) => {
              const done = doneSteps.has(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => {
                      const n = new Set(doneSteps);
                      if (n.has(i)) n.delete(i);
                      else n.add(i);
                      setDoneSteps(n);
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      done
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={done ? "text-muted-foreground line-through" : ""}>{s}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {progress === 100 && (
            <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 font-medium">Tabriklaymiz, taom tayyor!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Yoqimli ishtaha. Yangi taom tanlamoqchimisiz?
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
                <Button
                  onClick={() => {
                    clearActiveRecipe();
                    navigate({ to: "/pantry" });
                  }}
                >
                  Yangi tavsiya
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dishes">Milliy taomlar</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="mt-10 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground print:hidden">
            <p className="font-medium text-foreground">Pishirayotganda yordam kerakmi?</p>
            <p className="mt-1">
              Pastdagi AI tugmasini bosing: bosqichni tushuntirishi, taomni rasmdan tahlil
              qilishi yoki muqobil masalliq taklif qilishi mumkin.
            </p>
          </div>
        </div>
    </div>
  );
}

function CookTimer({ defaultMinutes }: { defaultMinutes: number }) {
  const presets = useMemo(
    () => Array.from(new Set([5, 10, defaultMinutes, 20, 30].filter((m) => m > 0))).sort((a, b) => a - b),
    [defaultMinutes],
  );
  const [target, setTarget] = useState<number>(defaultMinutes * 60);
  const [remaining, setRemaining] = useState<number>(defaultMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          toast.success("Vaqt tugadi! Taomingizni tekshiring 🍳");
          if (typeof window !== "undefined" && "Audio" in window) {
            try {
              new Audio(
                "data:audio/mp3;base64,SUQzAwAAAAAAJlRZRVIAAAAFAAAAMjAyNAAAAAA=",
              ).play();
            } catch {
              // ignore
            }
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const setPreset = (mins: number) => {
    setTarget(mins * 60);
    setRemaining(mins * 60);
    setRunning(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <Timer className="h-4 w-4" />
          Taymer
        </p>
        <span className="font-mono text-base font-semibold tabular-nums">
          {mm}:{ss}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {presets.map((m) => (
          <button
            key={m}
            onClick={() => setPreset(m)}
            className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
              target === m * 60
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent"
            }`}
          >
            {m} daq
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {running ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              To'xtatish
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Boshlash
            </>
          )}
        </button>
        <button
          onClick={() => {
            setRemaining(target);
            setRunning(false);
          }}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-accent"
          title="Qayta tiklash"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}
