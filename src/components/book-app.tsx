import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, List, Minus, Moon, Plus, Sun, X } from "lucide-react";
import { CARE_PATHS, EDITION, TAKE, chapters, type Block } from "@/lib/book";

const THEME_KEY = "eleven-theme";
const SIZE_KEY = "eleven-size";
const PLACE_KEY = "eleven-place";
const CHECK_KEY = "eleven-checks";

type Theme = "day" | "night";
type Size = "sm" | "md" | "lg";

function Note({ tone, title, text }: { tone: "stop" | "fact" | "care"; title: string; text: string }) {
  const frame =
    tone === "stop"
      ? "border-clay bg-clay-soft"
      : tone === "care"
        ? "border-ink bg-paper-2"
        : "border-line bg-paper-2";
  return (
    <aside className={`my-8 border-l-4 px-5 py-4 ${frame}`}>
      <p className="font-display text-lg leading-snug text-clay">{title}</p>
      <p className="mt-2 text-ink">{text}</p>
    </aside>
  );
}

function Tally() {
  return (
    <div className="my-10 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line">
      <div className="bg-clay px-5 py-6 text-paper">
        <p className="font-display text-5xl leading-none">3</p>
        <p className="mt-3 text-sm leading-snug">died of dehydration. Fluids were late.</p>
      </div>
      <div className="bg-paper px-5 py-6 text-ink">
        <p className="font-display text-5xl leading-none">8</p>
        <p className="mt-3 text-sm leading-snug text-muted">lived. They were not allowed to dehydrate.</p>
      </div>
    </div>
  );
}

function Paths() {
  return (
    <div className="my-10 divide-y divide-line border-y border-line">
      {CARE_PATHS.map((path) => (
        <article key={path.where} className="grid gap-2 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
          <div>
            <p className="font-display text-sm tracking-wide text-clay">{path.where}</p>
            <p className="text-sm text-muted">{path.who}</p>
          </div>
          <div>
            <h3 className="font-display text-xl leading-snug text-ink">{path.title}</h3>
            <p className="mt-2 text-ink">{path.detail}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Edition() {
  return (
    <div className="my-8 border border-line bg-paper-2 px-5 py-5">
      <p className="font-display text-xl text-ink">Copyright {EDITION.year}</p>
      <p className="mt-2 text-ink">{EDITION.holder}. All rights reserved.</p>
    </div>
  );
}
function TakeList() {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECK_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) setChecked(parsed.filter((item) => typeof item === "string"));
    } catch {
      /* ignore broken storage */
    }
  }, []);

  function toggle(id: string) {
    setChecked((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(CHECK_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <ul className="my-8 divide-y divide-line border-y border-line">
      {TAKE.map((item) => {
        const on = checked.includes(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(item.id)}
              className="flex w-full items-start gap-4 py-4 text-left"
            >
              <span
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center border ${on ? "border-clay bg-clay text-paper" : "border-line bg-paper text-transparent"}`}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className={on ? "text-muted" : "text-ink"}>{item.text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  let leadUsed = false;
  return (
    <div className="chapter-body read">
      {blocks.map((block, index) => {
        if (block.kind === "p") {
          const lead = Boolean(block.lead) && !leadUsed;
          if (lead) leadUsed = true;
          return (
            <p key={index} className={`mb-5 text-ink ${lead ? "lead" : ""}`}>
              {block.text}
            </p>
          );
        }
        if (block.kind === "h") {
          return (
            <h2 key={index} className="mb-4 mt-10 font-display text-2xl leading-tight text-ink">
              {block.text}
            </h2>
          );
        }
        if (block.kind === "quote") {
          return (
            <blockquote key={index} className="my-8 border-l-4 border-clay pl-5">
              <p className="font-display text-2xl leading-snug text-ink italic">{block.text}</p>
            </blockquote>
          );
        }
        if (block.kind === "note") {
          return <Note key={index} tone={block.tone} title={block.title} text={block.text} />;
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="my-6 list-disc space-y-2 pl-5 text-ink">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "tally") return <Tally key={index} />;
        if (block.kind === "paths") return <Paths key={index} />;
        if (block.kind === "edition") return <Edition key={index} />;
        if (block.kind === "take") return <TakeList key={index} />;
        return null;
      })}
    </div>
  );
}

export function BookApp() {
  const [place, setPlace] = useState(0);
  const [toc, setToc] = useState(false);
  const [theme, setTheme] = useState<Theme>("day");
  const [size, setSize] = useState<Size>("md");
  const [ready, setReady] = useState(false);

  const total = chapters.length;
  const chapter = place > 0 ? chapters[place - 1] : null;
  const progress = place === 0 ? 0 : Math.round((place / total) * 100);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      const storedSize = localStorage.getItem(SIZE_KEY);
      const storedPlace = Number(localStorage.getItem(PLACE_KEY));
      if (storedTheme === "night" || storedTheme === "day") setTheme(storedTheme);
      if (storedSize === "sm" || storedSize === "md" || storedSize === "lg") setSize(storedSize);
      if (Number.isFinite(storedPlace) && storedPlace >= 0 && storedPlace <= total) setPlace(storedPlace);
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, [total]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.size = size;
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(SIZE_KEY, size);
  }, [ready, theme, size]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PLACE_KEY, String(place));
    document.title = chapter ? `${chapter.title} — Parvo: Eleven Dogs` : "Parvo: Eleven Dogs";
    window.scrollTo(0, 0);
  }, [ready, place, chapter]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight") {
        setPlace((current) => Math.min(total, current + 1));
      } else if (event.key === "Escape") {
        setToc(false);
      } else if (event.key === "ArrowLeft") {
        setPlace((current) => Math.max(0, current - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  useEffect(() => {
    document.body.style.overflow = toc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [toc]);

  function bumpSize(direction: -1 | 1) {
    const order: Size[] = ["sm", "md", "lg"];
    setSize((current) => {
      const next = order.indexOf(current) + direction;
      return order[Math.max(0, Math.min(order.length - 1, next))] ?? current;
    });
  }

  const rail = (
    <nav aria-label="Chapters" className="flex flex-col gap-1">
      <button type="button" onClick={() => { setPlace(0); setToc(false); }} className="px-3 py-2 text-left">
        <span className="block font-display text-lg leading-tight text-ink">Parvo: Eleven Dogs</span>
        <span className="text-sm text-muted">Cover</span>
      </button>
      {chapters.map((item, index) => {
        const active = place === index + 1;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setPlace(index + 1);
              setToc(false);
            }}
            className={`border-l-2 px-3 py-2 text-left ${active ? "border-clay bg-clay-soft" : "border-transparent"}`}
          >
            <span className="block text-sm text-clay">{item.numeral}</span>
            <span className="block leading-snug text-ink">{item.title}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="lg:flex">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-line px-4 py-8 lg:block">
          <p className="px-3 text-xs tracking-widest text-muted">A FIELD BOOK</p>
          <div className="mt-4">{rail}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-line bg-paper">
            <div className="flex items-center gap-2 px-4 py-3 lg:px-10">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-line lg:hidden"
                aria-label="Open contents"
                onClick={() => setToc(true)}
              >
                <List className="h-5 w-5" />
              </button>
              <p className="min-w-0 flex-1 truncate text-sm text-muted">
                {chapter ? `${chapter.numeral}  ${chapter.title}` : "Parvo: Eleven Dogs"}
              </p>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-line"
                aria-label={theme === "day" ? "Night reading" : "Day reading"}
                onClick={() => setTheme((current) => (current === "day" ? "night" : "day"))}
              >
                {theme === "day" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-line"
                aria-label="Smaller text"
                onClick={() => bumpSize(-1)}
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-line"
                aria-label="Larger text"
                onClick={() => bumpSize(1)}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="h-0.5 bg-line" aria-hidden="true">
              <div className="h-full bg-clay" style={{ width: `${progress}%` }} />
            </div>
          </header>

          <p className="border-b border-line px-5 py-3 text-sm text-muted lg:px-10">
            Not a prescription. A sick dog needs a veterinarian, and fluids before the debate.
          </p>

          {place === 0 ? (
            <main className="page-in px-5 pb-24 pt-12 lg:px-10 lg:pt-20">
              <div className="mx-auto max-w-prose">
                <p className="text-xs tracking-widest text-clay">THE EDUCATION REVOLUTION POCKET GUIDE, VOLUME 14</p>
                <h1 className="mt-4 font-display text-6xl leading-none text-ink sm:text-7xl">Eleven Dogs</h1>
                <p className="mt-4 text-sm text-muted">by Blue and the Awesome Dudes</p>
                <div className="mt-6 h-px w-24 bg-clay" />
                <p className="mt-6 font-display text-2xl leading-snug text-ink">
                  Canine parvovirus, from a yard that lost three — and why the three died of dehydration, not of a missing drug.
                </p>
                <p className="mt-6 text-lg leading-relaxed text-muted">
                  Eleven dogs, six and a half months old. Dust, drought, coyotes, a small yard. Eight saved for about $10,000, not $55,000, because they were not allowed to dehydrate. Fluid in a tent of skin at the scruff. Not in the muscle.
                </p>
                <p className="mt-8 font-display text-xl italic text-clay">Dedicated to Villager #2, Lily, and Mrs Sassy Fancy Boots.</p>
                <p className="mt-4 text-sm text-muted">The rights belong to Blue and the Awesome Dudes.</p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setPlace(1)}
                    className="inline-flex h-12 items-center justify-center bg-clay px-6 text-paper"
                  >
                    Begin reading
                  </button>
                  <Link
                    to="/print"
                    className="inline-flex h-12 items-center justify-center border border-line px-6 text-ink"
                  >
                    Print a copy
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToc(true)}
                    className="inline-flex h-12 items-center justify-center border border-line px-6 text-ink"
                  >
                    Contents
                  </button>
                </div>
                <p className="mt-10 text-sm leading-relaxed text-muted">
                  {chapters.length} short chapters. Written so a person in a parking lot can use it, and so a person after a burial is not lied to. The amount the yard used is in the book. A veterinarian still has to see the dog.
                </p>
              </div>
            </main>
          ) : chapter ? (
            <main className="page-in px-5 pb-32 pt-8 lg:px-10 lg:pb-24 lg:pt-12">
              <article className="mx-auto max-w-prose">
                <p className="text-sm text-clay">
                  {chapter.numeral}
                  <span className="text-muted"> · {chapter.kicker} · {chapter.minutes} min</span>
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{chapter.title}</h1>
                <div className="mb-8 mt-6 h-px w-16 bg-clay" />
                <Blocks blocks={chapter.blocks} />
                <nav aria-label="Chapter" className="mt-14 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPlace((current) => Math.max(0, current - 1))}
                    className="flex min-h-12 items-start gap-2 py-2 text-left"
                  >
                    <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-clay" />
                    <span>
                      <span className="block text-sm text-muted">Previous</span>
                      <span className="font-display text-xl leading-snug text-ink">
                        {place === 1 ? "Cover" : chapters[place - 2]?.title}
                      </span>
                    </span>
                  </button>
                  {place < total ? (
                    <button
                      type="button"
                      onClick={() => setPlace((current) => Math.min(total, current + 1))}
                      className="flex min-h-12 items-start justify-end gap-2 py-2 text-right"
                    >
                      <span>
                        <span className="block text-sm text-muted">Next</span>
                        <span className="font-display text-xl leading-snug text-ink">{chapters[place]?.title}</span>
                      </span>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-clay" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlace(0)}
                      className="flex min-h-12 items-start justify-end gap-2 py-2 text-right"
                    >
                      <span>
                        <span className="block text-sm text-muted">Close the book</span>
                        <span className="font-display text-xl leading-snug text-ink">Back to the cover</span>
                      </span>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-clay" />
                    </button>
                  )}
                </nav>
              </article>
            </main>
          ) : null}

          <footer className="mx-auto max-w-prose px-5 pb-24 pt-2 text-sm leading-relaxed text-muted lg:px-10 lg:pb-10">
            Privacy: This guide does not collect your name, email, or any personal information. Checklist marks are saved only on your own device.
          </footer>

          {place > 0 ? (
            <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-paper lg:hidden" aria-label="Turn page">
              <button
                type="button"
                className="inline-flex h-14 flex-1 items-center justify-center gap-1 text-sm"
                onClick={() => setPlace((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
              <button
                type="button"
                className="inline-flex h-14 flex-1 items-center justify-center border-x border-line text-sm"
                onClick={() => setToc(true)}
              >
                Contents
              </button>
              <button
                type="button"
                className="inline-flex h-14 flex-1 items-center justify-center gap-1 text-sm"
                onClick={() => setPlace((current) => (current >= total ? 0 : current + 1))}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          ) : null}
        </div>
      </div>

      {toc ? (
        <div className="fixed inset-0 z-40 flex bg-paper lg:hidden">
          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-display text-xl text-ink">Contents</p>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-line"
                aria-label="Close contents"
                onClick={() => setToc(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-2 py-4">{rail}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
