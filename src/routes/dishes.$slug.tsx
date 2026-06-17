import { DishImage } from "@/components/dish-image";
import { SiteHeader } from "@/components/site-header";
import { getDishBySlug, type Dish } from "@/lib/dishes-data";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Check, ChefHat, Clock, Flame, Minus, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dishes/$slug")({
  loader: ({ params }) => {
    const dish = getDishBySlug(params.slug);
    if (!dish) throw notFound();
    return { dish };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.dish.name} — OSHPAZ AI retsepti` },
          { name: "description", content: loaderData.dish.description },
          { property: "og:title", content: `${loaderData.dish.name} retsepti` },
          { property: "og:description", content: loaderData.dish.description },
        ]
      : [{ title: "Taom topilmadi" }],
  }),
  component: DishPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Taom topilmadi</h1>
        <Link to="/dishes" className="mt-4 inline-block text-primary hover:underline">
          ← Taomlar ro'yxatiga
        </Link>
      </div>
    </div>
  ),
});

function DishPage() {
  const { dish } = Route.useLoaderData() as { dish: Dish };
  const [servings, setServings] = useState(dish.baseServings);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());

  const ratio = servings / dish.baseServings;
  const ingredients = useMemo(
    () =>
      dish.ingredients.map((i) => ({
        ...i,
        amount: Math.round(i.amount * ratio * 100) / 100,
      })),
    [dish.ingredients, ratio]
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Link to="/dishes" className="text-sm text-muted-foreground hover:text-foreground">
          ← Taomlarga qaytish
        </Link>

        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
          <DishImage
            dish={dish}
            className="h-44 w-full shrink-0 sm:h-40 sm:w-56"
            rounded
            width={500}
            height={350}
          />
          <div>
            <h1 className="text-3xl font-bold">{dish.name}</h1>
            <p className="mt-2 text-muted-foreground">{dish.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Pill icon={<Clock className="h-4 w-4" />}>{dish.timeMinutes} daqiqa</Pill>
              <Pill icon={<ChefHat className="h-4 w-4" />}>{dish.difficulty}</Pill>
              <Pill icon={<Flame className="h-4 w-4" />}>
                {Math.round(dish.caloriesPerServing)} kkal/kishi
              </Pill>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Necha kishi uchun?</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-accent"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{servings}</span>
                <button
                  onClick={() => setServings((s) => Math.min(20, s + 1))}
                  className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <h2 className="mt-5 text-sm font-semibold uppercase text-muted-foreground">
              Masalliqlar
            </h2>
            <ul className="mt-3 space-y-2">
              {ingredients.map((i) => (
                <li
                  key={i.name}
                  className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0"
                >
                  <span>{i.name}</span>
                  <span className="font-medium text-foreground">
                    {i.amount} {i.unit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Jami kaloriya: ~{Math.round(dish.caloriesPerServing * servings)} kkal
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Bosqichma-bosqich tayyorlash</h2>
            <ol className="mt-4 space-y-3">
              {dish.steps.map((s, i) => {
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

            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">Pishirish jarayonida AI yordami</p>
              <p className="mt-1 text-sm text-muted-foreground">
                AI Oshpazga rasm yuboring — taomning holatini tahlil qiladi va maslahat beradi.
              </p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                AI Oshpaz bilan suhbat
              </button>
            </div>
          </div>
        </div>
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
