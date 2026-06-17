import { SiteHeader } from "@/components/site-header";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChefHat, MessageCircle, Sparkles, UtensilsCrossed } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OSHPAZ AI — Shaxsiy aqlli oshpazingiz" },
      {
        name: "description",
        content:
          "Uyingizdagi mahsulotlardan tayyorlanadigan eng mos taomlarni AI yordamida toping. O'zbek milliy taomlari kutubxonasi va shaxsiy AI Oshpaz.",
      },
      { property: "og:title", content: "OSHPAZ AI — Shaxsiy aqlli oshpazingiz" },
      {
        property: "og:description",
        content: "AI yordamida 'Bugun nima ovqat qilamiz?' degan savolga aniq javob.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto w-full max-w-5xl px-4 pt-16 pb-10 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Google Gemini bilan ishlaydi
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Shaxsiy aqlli oshpazingiz
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Mahsulotlaringizdan taom toping, milliy retseptlarni o'rganing yoki o'ng
          pastdagi yordamchidan istalgan savolingizni so'rang.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-4 pb-12 sm:grid-cols-2">
        <FeatureCard
          to="/pantry"
          icon={<ChefHat className="h-6 w-6" />}
          title="Mavjud mahsulotlardan ovqat"
          description="Uyingizdagi mahsulotlarni tanlang — AI sizga tayyorlash mumkin bo'lgan taomlarni tavsiya qiladi."
          cta="Mahsulotlarni tanlash"
        />
        <FeatureCard
          to="/dishes"
          icon={<UtensilsCrossed className="h-6 w-6" />}
          title="O'zbek milliy taomlari"
          description="Palov, lag'mon, manti, somsa va boshqa milliy taomlarning to'liq retseptlari."
          cta="Taomlar kutubxonasi"
        />
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-20">
        <Link
          to="/chat"
          className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Oshpaz suhbati</h3>
              <p className="text-sm text-muted-foreground">
                Istalgan savol bering, rasm yuboring — AI sizga maslahat beradi.
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition group-hover:bg-primary/90">
            Suhbatni boshlash →
          </span>
        </Link>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} OSHPAZ AI — Shaxsiy aqlli oshpazingiz
      </footer>
    </div>
  );
}

function FeatureCard({
  to,
  icon,
  title,
  description,
  cta,
}: {
  to: "/pantry" | "/dishes";
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="mt-auto text-sm font-medium text-primary transition group-hover:underline">
        {cta} →
      </span>
    </Link>
  );
}
