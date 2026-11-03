import { createFileRoute, Link } from "@tanstack/react-router";
import { CARE_PATHS, EDITION, TAKE, chapters, type Block } from "@/lib/book";

export const Route = createFileRoute("/print")({
  component: PrintBook,
});

function PrintBook() {
  return (
    <div className="print-book bg-white text-ink">
      <div className="no-print sticky top-0 z-20 border-b border-line bg-paper px-5 py-4">
        <p className="font-display text-2xl">Print this book</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          Open in Word is the file your computer’s Word app can open. It is already a small page, 5.5 by 8.5 inches. In Word choose File, Print, Pages per sheet, 2. Two small pages fit on one sheet.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href="/eleven-dogs.doc"
            className="inline-flex h-12 items-center justify-center bg-clay px-6 text-paper"
          >
            Open in Word
          </a>
          <a
            href="/eleven-dogs.rtf"
            className="inline-flex h-12 items-center justify-center border border-line px-6 text-ink"
          >
            Open the other Word file
          </a>
          <a
            href="/eleven-dogs.pdf"
            className="inline-flex h-12 items-center justify-center border border-line px-6 text-ink"
          >
            Open the printer file
          </a>
          <Link to="/" className="inline-flex h-12 items-center justify-center px-2 text-muted">
            Back to the book
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-prose px-5 py-10">
        <header className="print-cover">
          <p className="text-xs tracking-widest text-clay">A FIELD BOOK</p>
          <h1 className="mt-4 font-display text-6xl leading-none">Eleven Dogs</h1>
          <div className="mt-6 h-px w-24 bg-clay" />
          <p className="mt-6 font-display text-2xl leading-snug">
            Canine parvovirus, from a yard that lost three — and why the three died of dehydration, not of a missing drug.
          </p>
          <p className="mt-6 leading-relaxed text-muted">
            Eleven dogs, six and a half months old. Dust, drought, coyotes, a small yard. Eight saved for about $10,000, not $55,000, because they were not allowed to dehydrate.
          </p>
          <p className="mt-8 font-display text-xl italic text-clay">
            For Villager #2, for Lily, and for Mrs Sassy Fancy Boots.
          </p>
          <p className="mt-6 text-sm text-muted">Jessica McIntosh. Copyright {EDITION.year}. All rights reserved.</p>
        </header>

        {chapters.map((chapter) => (
          <section key={chapter.id} className="print-chapter">
            <p className="text-sm text-clay">
              {chapter.numeral}
              <span className="text-muted"> · {chapter.kicker}</span>
            </p>
            <h2 className="mt-2 font-display text-4xl leading-tight">{chapter.title}</h2>
            <div className="mb-6 mt-4 h-px w-16 bg-clay" />
            <PrintBlocks blocks={chapter.blocks} />
          </section>
        ))}
      </article>
    </div>
  );
}

function PrintBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="read">
      {blocks.map((block, index) => {
        if (block.kind === "p") return <p key={index} className="mb-5">{block.text}</p>;
        if (block.kind === "h") return <h3 key={index} className="mb-3 mt-8 font-display text-2xl">{block.text}</h3>;
        if (block.kind === "quote") {
          return (
            <blockquote key={index} className="my-6 border-l-4 border-clay pl-4 font-display text-xl italic">
              {block.text}
            </blockquote>
          );
        }
        if (block.kind === "note") {
          return (
            <aside key={index} className="my-6 border border-line bg-paper-2 px-4 py-4">
              <p className="font-display text-lg">{block.title}</p>
              <p className="mt-2">{block.text}</p>
            </aside>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="my-5 list-disc space-y-2 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "tally") {
          return (
            <div key={index} className="my-6 grid grid-cols-2 gap-6">
              <p><span className="block font-display text-5xl">3</span>died while the next fluids were still away</p>
              <p><span className="block font-display text-5xl">8</span>lived. They were not allowed to dehydrate.</p>
            </div>
          );
        }
        if (block.kind === "paths") {
          return (
            <div key={index}>
              {CARE_PATHS.map((path) => (
                <div key={path.who} className="my-4">
                  <p className="text-sm text-clay">{path.who} · {path.where}</p>
                  <p className="font-display text-xl">{path.title}</p>
                  <p className="mt-1">{path.detail}</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.kind === "take") {
          return (
            <ol key={index} className="my-5 list-decimal space-y-3 pl-5">
              {TAKE.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ol>
          );
        }
        if (block.kind === "scale") {
          return (
            <aside key={index} className="my-6 border border-line px-4 py-4">
              <p className="font-display text-lg">The yard’s proportion</p>
              <p className="mt-2">
                About 500 mL in the morning and about 500 mL at night for a dog of about 60 pounds, into the tent at the scruff, until the dog feels better. Half the weight, half the amount. If the last pocket is still there, give less or skip it.
              </p>
            </aside>
          );
        }
        if (block.kind === "edition") {
          return (
            <aside key={index} className="my-6 border border-line px-4 py-4">
              <p className="font-display text-lg">Copyright {EDITION.year}</p>
              <p className="mt-2">
                {EDITION.holder}. All rights reserved.
              </p>
            </aside>
          );
        }
        return null;
      })}
    </div>
  );
}
