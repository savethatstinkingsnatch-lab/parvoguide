import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { CARE_PATHS, EDITION, TAKE, chapters } from "../src/lib/book.ts";

const esc = (value) =>
  String(value)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">");

function blocks(list) {
  return list
    .map((block) => {
      if (block.kind === "p") return `<p>${esc(block.text)}</p>`;
      if (block.kind === "h") return `<h2>${esc(block.text)}</h2>`;
      if (block.kind === "quote") return `<blockquote>${esc(block.text)}</blockquote>`;
      if (block.kind === "note") {
        return `<aside><strong>${esc(block.title)}</strong><p>${esc(block.text)}</p></aside>`;
      }
      if (block.kind === "list") {
        return `<ul>${block.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
      }
      if (block.kind === "tally") {
        return `<div class="tally"><div><b>3</b><span>died while the next fluids were still away</span></div><div><b>8</b><span>lived. They were not allowed to dehydrate.</span></div></div>`;
      }
      if (block.kind === "paths") {
        return CARE_PATHS.map(
          (path) =>
            `<div class="path"><p class="who">${esc(path.who)} · ${esc(path.where)}</p><h3>${esc(path.title)}</h3><p>${esc(path.detail)}</p></div>`,
        ).join("");
      }
      if (block.kind === "take") {
        return `<ol class="take">${TAKE.map((item) => `<li>${esc(item.text)}</li>`).join("")}</ol>`;
      }
      if (block.kind === "edition") {
        return `<aside><strong>Copyright ${EDITION.year}</strong><p>${esc(EDITION.holder)}. All rights reserved.</p></aside>`;
      }
      return "";
    })
    .join("\n");
}

const toc = chapters
  .map((chapter) => `<li><span>${esc(chapter.numeral)}</span> ${esc(chapter.title)}</li>`)
  .join("");

const body = chapters
  .map(
    (chapter) => `<section>
      <p class="kicker">${esc(chapter.numeral)} · ${esc(chapter.kicker)}</p>
      <h1>${esc(chapter.title)}</h1>
      ${blocks(chapter.blocks)}
    </section>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Eleven Dogs</title>
<style>
  @font-face { font-family: "Book"; src: url("file:///usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"); }
  @font-face { font-family: "Book"; src: url("file:///usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"); font-weight: 700; }
  @font-face { font-family: "Book"; src: url("file:///usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"); font-style: italic; }
  @font-face { font-family: "Book"; src: url("file:///usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf"); font-weight: 700; font-style: italic; }
  @page { size: letter; margin: 0.72in 0.82in 0.78in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Book", "Liberation Serif", serif; color: #221c16; background: #fff; font-size: 12.5pt; line-height: 1.45; }
  .cover { page-break-after: always; min-height: 9.2in; padding-top: 1.6in; }
  .eyebrow { letter-spacing: 0.18em; text-transform: uppercase; color: #8c3d2e; font-size: 10pt; }
  .cover h1 { font-size: 54pt; line-height: 0.9; font-weight: 700; margin: 0.35in 0 0.2in; }
  .rule { width: 1.3in; height: 2px; background: #8c3d2e; border: 0; margin: 0; }
  .deck { font-size: 16pt; line-height: 1.35; margin: 0.28in 0; }
  .muted { color: #6e6256; }
  .ded { font-style: italic; color: #8c3d2e; font-size: 14pt; }
  .by { margin-top: 0.45in; }
  .contents { page-break-after: always; }
  .contents ol { list-style: none; padding: 0; }
  .contents li { padding: 0.08in 0; border-bottom: 1px solid #d8ccba; }
  .contents li span { color: #8c3d2e; display: inline-block; width: 0.55in; }
  section { page-break-before: always; }
  .kicker { color: #8c3d2e; font-size: 10pt; margin: 0; }
  h1 { font-size: 26pt; line-height: 1.05; margin: 0.08in 0 0.22in; }
  h2 { font-size: 15pt; margin: 0.28in 0 0.08in; }
  h3 { font-size: 13pt; margin: 0.04in 0; }
  p { margin: 0 0 0.14in; }
  blockquote { margin: 0.2in 0; padding-left: 0.18in; border-left: 2px solid #8c3d2e; font-style: italic; font-size: 14pt; }
  aside { break-inside: avoid; border: 1px solid #d8ccba; background: #f3ecdf; padding: 0.14in 0.16in; margin: 0.16in 0; }
  aside strong { display: block; margin-bottom: 0.06in; }
  aside p { margin: 0; }
  ul, ol { margin: 0.08in 0 0.16in; padding-left: 0.28in; }
  li { margin: 0.06in 0; }
  .tally { display: flex; gap: 0.3in; margin: 0.16in 0; }
  .tally div { flex: 1; border-top: 2px solid #8c3d2e; padding-top: 0.08in; }
  .tally b { display: block; font-size: 28pt; line-height: 1; }
  .tally span { color: #6e6256; }
  .path { break-inside: avoid; margin: 0.14in 0; }
  .who { color: #8c3d2e; font-size: 10pt; margin: 0; }
</style>
</head>
<body>
  <div class="cover">
    <p class="eyebrow">The Education Revolution Pocket Guide, Volume 14</p>
    <h1>Eleven Dogs</h1>
    <hr class="rule" />
    <p class="deck">Canine parvovirus, from a yard that lost three — and why the three died of dehydration, not of a missing drug.</p>
    <p class="muted">Eleven dogs, six and a half months old. Dust, drought, coyotes, a small yard. Eight saved for about $10,000, not $55,000, because they were not allowed to dehydrate.</p>
    <p class="ded">Dedicated to Villager #2, Lily, and Mrs Sassy Fancy Boots.</p>
    <p class="by">by ${EDITION.holder}<br />Copyright ${EDITION.year}. All rights reserved.</p>
  </div>
  <div class="contents">
    <p class="eyebrow">Contents</p>
    <h1>The chapters</h1>
    <ol>${toc}</ol>
  </div>
  ${body}
  <p class="muted">Privacy: This guide does not collect your name, email, or any personal information. Checklist marks are saved only on your own device.</p>
</body>
</html>`;

const htmlPath = "/workspace/.grok/eleven-dogs-print.html";
const pdfPath = "/workspace/artifacts/Eleven-Dogs.pdf";
writeFileSync(htmlPath, html);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
await page.pdf({
  path: pdfPath,
  format: "Letter",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate:
    '<div style="width:100%; font-size:9px; text-align:center; color:#6e6256; font-family: Liberation Serif, serif;">Eleven Dogs · <span class="pageNumber"></span></div>',
  margin: { top: "0.55in", bottom: "0.62in", left: "0.78in", right: "0.78in" },
});
await browser.close();
console.log(pdfPath);
