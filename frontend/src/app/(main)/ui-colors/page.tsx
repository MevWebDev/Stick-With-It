"use client";

import { useTheme } from "next-themes";

type ColorSample = {
  name: string;
  tokenClass: string;
  textClass?: string;
  tokenLabel: string;
};

const swatches: ColorSample[] = [
  {
    name: "background",
    tokenClass: "bg-background",
    textClass: "text-foreground",
    tokenLabel: "background",
  },
  {
    name: "foreground",
    tokenClass: "bg-foreground",
    textClass: "text-background",
    tokenLabel: "foreground",
  },
  {
    name: "primary",
    tokenClass: "bg-primary",
    textClass: "text-white",
    tokenLabel: "primary",
  },
  {
    name: "primary-dark",
    tokenClass: "bg-primary-dark",
    textClass: "text-white",
    tokenLabel: "primary-dark",
  },
  {
    name: "secondary",
    tokenClass: "bg-secondary",
    textClass: "text-black",
    tokenLabel: "secondary",
  },
  {
    name: "secondary-light",
    tokenClass: "bg-secondary-light",
    textClass: "text-black",
    tokenLabel: "secondary-light",
  },
];

export default function ColorHelper() {
  const { theme, setTheme } = useTheme();

  const isActive = (value: "light" | "dark" | "system") => theme === value;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-secondary/40 bg-background p-6 shadow-sm">
          <h1 className="text-3xl font-bold">UI Colors Preview</h1>
          <p className="mt-2 text-sm opacity-80">
            Color helper might be usefull to check colors.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`rounded-lg border px-4 py-2 transition ${
                isActive("light")
                  ? "border-primary bg-primary text-white"
                  : "border-secondary bg-transparent"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`rounded-lg border px-4 py-2 transition ${
                isActive("dark")
                  ? "border-primary bg-primary text-white"
                  : "border-secondary bg-transparent"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`rounded-lg border px-4 py-2 transition ${
                isActive("system")
                  ? "border-primary bg-primary text-white"
                  : "border-secondary bg-transparent"
              }`}
            >
              System
            </button>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Color Tokens</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map((ColorSample) => (
              <div
                key={ColorSample.name}
                className={`rounded-xl border border-black/10 p-4 ${ColorSample.tokenClass}`}
              >
                <div
                  className={`text-sm font-semibold ${ColorSample.textClass ?? ""}`}
                >
                  {ColorSample.name}
                </div>
                <div
                  className={`mt-1 text-xs opacity-90 ${ColorSample.textClass ?? ""}`}
                >
                  {ColorSample.tokenLabel}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Text Contrast</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-5 text-foreground">
              <h3 className="text-xl font-bold">On background</h3>
              <p className="mt-2 text-sm opacity-80">
                Body text on default background for readability checks.
              </p>
            </div>
            <div className="rounded-xl border bg-primary p-5 text-white">
              <h3 className="text-xl font-bold">On primary</h3>
              <p className="mt-2 text-sm text-white/90">
                Check if white text on primary is still readable in both themes.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-primary px-4 py-2 text-white hover:opacity-90">
              Primary
            </button>
            <button className="rounded-lg bg-secondary px-4 py-2 text-black hover:opacity-90">
              Secondary
            </button>
            <button className="rounded-lg border border-primary px-4 py-2 text-primary hover:bg-primary hover:text-white">
              Outline
            </button>
            <button
              disabled
              className="cursor-not-allowed rounded-lg bg-primary/40 px-4 py-2 text-white"
            >
              Disabled
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Controls</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              placeholder="Type something..."
              className="w-full rounded-lg border border-secondary bg-background px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            <select className="w-full rounded-lg border border-secondary bg-background px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary">
              <option>Option one</option>
              <option>Option two</option>
              <option>Option three</option>
            </select>
          </div>
        </section>

        <section className="space-y-4 pb-8">
          <h2 className="text-2xl font-semibold">Sample Card</h2>
          <article className="rounded-2xl border border-secondary/40 bg-background p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Settings Card Example</h3>
            <p className="mt-2 opacity-80">
              This gives you a realistic block, not just color chips.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="rounded-lg bg-primary px-4 py-2 text-white">
                Save
              </button>
              <button className="rounded-lg border border-secondary px-4 py-2">
                Cancel
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
