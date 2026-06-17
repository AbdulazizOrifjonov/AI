import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { saveActiveRecipe } from "@/lib/active-recipe";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChefHat, Clock, Flame, Loader2, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/pantry")({
  head: () => ({
    meta: [
      { title: "Mahsulotlardan ovqat — OSHPAZ AI" },
      {
        name: "description",
        content:
          "Uyingizdagi mahsulotlarni tanlang — AI tayyorlash mumkin bo'lgan taomlarni tavsiya qiladi.",
      },
    ],
  }),
  component: PantryPage,
});

const COMMON_INGREDIENTS = [
  "Tuxum", "Kartoshka", "Piyoz", "Sabzi", "Pomidor", "Bodring",
  "Mol go'shti", "Tovuq go'shti", "Qo'y go'shti", "Qiyma",
  "Guruch", "Makaron", "Un", "Mosh", "No'xat",
  "Karam", "Bolgar qalampir", "Sarimsoq", "Ko'kat",
  "Sut", "Qaymoq", "Pishloq", "Qatiq", "Sariyog'",
  "Tuz", "Qalampir", "Zira", "Paxta moyi", "Sirka",
];

type Recipe = {
  name: string;
  description: string;
  timeMinutes: number;
  difficulty: string;
  calories: number;
  servings: number;
  usedIngredients: string[];
  missingIngredients: string[];
  steps: string[];
};

function PantryPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const toggle = (i: string) =>
    setSelected((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (!selected.includes(v)) setSelected((p) => [...p, v]);
    setCustom("");
  };

  const suggest = async () => {
    if (selected.length === 0) {
      toast.error("Kamida bitta mahsulot tanlang");
      return;
    }
    setLoading(true);
    setRecipes([]);
    try {
      const res = await fetch("/api/suggest-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string })?.error ?? "Tavsiya olishda xatolik");
        return;
      }
      setRecipes((data as { recipes?: Recipe[] }).recipes ?? []);
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const openRecipe = (r: Recipe) => {
    saveActiveRecipe(r);
    navigate({ to: "/cook" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold">Mahsulotlardan ovqat</h1>
        <p className="mt-2 text-muted-foreground">
          Uyingizda bor mahsulotlarni tanlang — AI sizga taomlar tavsiya qiladi.
        </p>

        {selected.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Tanlangan ({selected.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {s}
                  <button onClick={() => toggle(s)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <h2 className="mt-8 text-sm font-medium uppercase text-muted-foreground">
          Mashhur mahsulotlar
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMMON_INGREDIENTS.map((i) => {
            const on = selected.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {i}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Boshqa mahsulot qo'shish..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <Button onClick={addCustom} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6">
          <Button onClick={suggest} disabled={loading || selected.length === 0} size="lg" className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI o'ylayapti...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-4 w-4" />
                Taomlarni tavsiya qil
              </>
            )}
          </Button>
        </div>

        {recipes.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Tavsiya etilgan taomlar</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {recipes.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => openRecipe(r)}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold group-hover:text-primary">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Pill icon={<Clock className="h-3 w-3" />}>{r.timeMinutes} daq</Pill>
                    <Pill icon={<ChefHat className="h-3 w-3" />}>{r.difficulty}</Pill>
                    <Pill icon={<Flame className="h-3 w-3" />}>{r.calories} kkal</Pill>
                    <Pill icon={<Users className="h-3 w-3" />}>{r.servings} kishi</Pill>
                  </div>
                  {r.missingIngredients.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-destructive">Yetishmaydi:</span>{" "}
                      {r.missingIngredients.join(", ")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
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
