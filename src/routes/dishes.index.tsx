import { SiteHeader } from "@/components/site-header";
import { DishImage } from "@/components/dish-image";
import { DISHES } from "@/lib/dishes-data";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChefHat, Clock, Flame } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dishes/")({
  head: () => ({
    meta: [
      { title: "O'zbek milliy taomlari — OSHPAZ AI" },
      {
        name: "description",
        content:
          "Palov, lag'mon, manti, somsa va boshqa o'zbek milliy taomlarining to'liq retseptlari.",
      },
    ],
  }),
  component: DishesPage,
});

const CATEGORIES = ["Hammasi", "Palov", "Sho'rva", "Xamir taomi", "Go'sht taomi"] as const;

function DishesPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Hammasi");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return DISHES.filter((d) => {
      if (cat !== "Hammasi" && d.category !== cat) return false;
      if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, q]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">O'zbek milliy taomlari</h1>
        <p className="mt-2 text-muted-foreground">
          An'anaviy o'zbek oshxonasining eng sevimli retseptlari.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Taom qidirish..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Link
              key={d.slug}
              to="/dishes/$slug"
              params={{ slug: d.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
            >
              <DishImage
                dish={d}
                className="h-44 w-full"
                width={600}
                height={400}
              />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-primary">{d.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
                    <Clock className="h-3 w-3" /> {d.timeMinutes} daq
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
                    <ChefHat className="h-3 w-3" /> {d.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
                    <Flame className="h-3 w-3" /> {d.caloriesPerServing} kkal
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Bu bo'yicha taomlar topilmadi.
          </p>
        )}
      </div>
    </div>
  );
}
