import logoSrc from "@/assets/oshpaz-logo.png";
import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logoSrc}
            alt="OSHPAZ AI"
            width={44}
            height={44}
            className="drop-shadow-sm"
          />
          <span className="text-base font-semibold tracking-tight">OSHPAZ AI</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/pantry"
            className="rounded-md px-3 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-foreground"
            activeProps={{ className: "bg-accent text-foreground" }}
          >
            Mahsulotlardan
          </Link>
          <Link
            to="/dishes"
            className="rounded-md px-3 py-1.5 text-foreground/80 transition hover:bg-accent hover:text-foreground"
            activeProps={{ className: "bg-accent text-foreground" }}
          >
            Taomlar
          </Link>
          <Link
            to="/chat"
            className="ml-1 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            AI Oshpaz
          </Link>
        </nav>
      </div>
    </header>
  );
}
