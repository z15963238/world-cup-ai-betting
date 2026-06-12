import Link from "next/link";

export function Navigation() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="container-page flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="min-w-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">World Cup AI</p>
          <h1 className="truncate text-lg font-bold text-slate-950">{"\u4e16\u754c\u76c3 AI \u8cfd\u524d\u5efa\u8b70"}</h1>
        </Link>
      </div>
    </header>
  );
}
