import html
import json

with open("/tmp/eleven-dogs.json", encoding="utf-8") as handle:
    book = json.load(handle)

chapters = book["chapters"]
paths = book["paths"]
take = book["take"]
edition = book["edition"]


def rtf_text(value):
    out = []
    for ch in value:
        if ch == "\\":
            out.append("\\\\")
        elif ch == "{":
            out.append("\\{")
        elif ch == "}":
            out.append("\\}")
        elif ord(ch) < 128:
            out.append(ch)
        else:
            code = ord(ch)
            if code > 32767:
                code -= 65536
            out.append(f"\\u{code}?")
    return "".join(out)


def blocks_html(blocks):
    parts = []
    for block in blocks:
        kind = block["kind"]
        if kind == "p":
            parts.append(f"<p>{html.escape(block['text'])}</p>")
        elif kind == "h":
            parts.append(f"<h2>{html.escape(block['text'])}</h2>")
        elif kind == "quote":
            parts.append(f"<p class='quote'>{html.escape(block['text'])}</p>")
        elif kind == "note":
            parts.append(f"<p class='note'><b>{html.escape(block['title'])}</b><br>{html.escape(block['text'])}</p>")
        elif kind == "list":
            items = "".join(f"<li>{html.escape(item)}</li>" for item in block["items"])
            parts.append(f"<ul>{items}</ul>")
        elif kind == "tally":
            parts.append("<p><b>3</b> died while the next fluids were still away.<br><b>8</b> lived. They were not allowed to dehydrate.</p>")
        elif kind == "paths":
            for path in paths:
                parts.append(
                    f"<p><span class='kicker'>{html.escape(path['who'])} · {html.escape(path['where'])}</span><br>"
                    f"<b>{html.escape(path['title'])}</b><br>{html.escape(path['detail'])}</p>"
                )
        elif kind == "take":
            items = "".join(f"<li>{html.escape(item['text'])}</li>" for item in take)
            parts.append(f"<ol>{items}</ol>")
        elif kind == "edition":
            parts.append(
                f"<p><b>Copyright {html.escape(str(edition['year']))}</b><br>{html.escape(edition['holder'])}. All rights reserved.</p>"
            )
    return "\n".join(parts)


def blocks_rtf(blocks):
    parts = []
    for block in blocks:
        kind = block["kind"]
        if kind == "p":
            parts.append(rf"\pard\sa160\fs22 {rtf_text(block['text'])}\par")
        elif kind == "h":
            parts.append(rf"\pard\sb200\sa80\b\fs28 {rtf_text(block['text'])}\b0\fs22\par")
        elif kind == "quote":
            parts.append(rf"\pard\li200\sb120\sa160\i\fs24 {rtf_text(block['text'])}\i0\fs22\par")
        elif kind == "note":
            parts.append(rf"\pard\sb160\sa40\b\fs24 {rtf_text(block['title'])}\b0\par")
            parts.append(rf"\pard\sa160\fs22 {rtf_text(block['text'])}\par")
        elif kind == "list":
            for item in block["items"]:
                parts.append(rf"\pard\li280\sa60\fs22 \bullet  {rtf_text(item)}\par")
        elif kind == "tally":
            parts.append(r"\pard\sb120\sa40\b\fs24 3 died while the next fluids were still away.\par")
            parts.append(r"\pard\sa160\b\fs24 8 lived. They were not allowed to dehydrate.\b0\fs22\par")
        elif kind == "paths":
            for path in paths:
                parts.append(rf"\pard\sb160\sa20\b\fs20 {rtf_text(path['who'] + ' · ' + path['where'])}\b0\par")
                parts.append(rf"\pard\sa40\b\fs24 {rtf_text(path['title'])}\b0\par")
                parts.append(rf"\pard\sa160\fs22 {rtf_text(path['detail'])}\par")
        elif kind == "take":
            for index, item in enumerate(take, start=1):
                parts.append(rf"\pard\li200\sa80\fs22 {index}.  {rtf_text(item['text'])}\par")
        elif kind == "edition":
            parts.append(rf"\pard\sb120\sa40\b\fs24 Copyright {edition['year']}\b0\par")
            parts.append(
                rf"\pard\sa160\fs22 {rtf_text(edition['holder'])}. All rights reserved.\par"
            )
    return "\n".join(parts)


chapter_html = []
chapter_rtf = []
for chapter in chapters:
    chapter_html.append(
        "<br clear='all' style='page-break-before:always'>"
        f"<p class='kicker'>{html.escape(chapter['numeral'])} · {html.escape(chapter['kicker'])}</p>"
        f"<h1>{html.escape(chapter['title'])}</h1>"
        f"{blocks_html(chapter['blocks'])}"
    )
    chapter_rtf.append(
        "\\page\n"
        rf"\pard\sa40\b\fs18 {rtf_text(chapter['numeral'] + '  ·  ' + chapter['kicker'])}\b0\par"
        rf"\pard\sa160\b\fs36 {rtf_text(chapter['title'])}\b0\fs22\par"
        f"{blocks_rtf(chapter['blocks'])}"
    )

doc = f"""<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="Word.Document">
<title>Eleven Dogs</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {{
  size: 5.5in 8.5in;
  margin: 0.55in;
}}
div.Section1 {{ page: Section1; }}
body {{ font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #221c16; }}
h1 {{ font-size: 18pt; margin: 0 0 8pt; }}
h2 {{ font-size: 14pt; margin: 12pt 0 4pt; }}
p {{ margin: 0 0 8pt; }}
.kicker {{ color: #8c3d2e; font-size: 9pt; font-weight: bold; }}
.quote {{ font-style: italic; color: #8c3d2e; font-size: 12pt; }}
.note {{ border: 1px solid #d8ccba; padding: 6pt; }}
</style>
</head>
<body>
<div class="Section1">
<p class="kicker">HOW TO PRINT THIS AS A SMALL BOOK</p>
<p>This file is already a small page, 5.5 inches wide by 8.5 inches tall. Delete this note before you print copies for the neighbors.</p>
<p>To use less paper: File, Print, Pages per sheet, 2. Two of these small pages then sit on one sheet of letter paper. You can also change Layout, Size, if you want the page even smaller.</p>
<p class="kicker" style="text-align:center">THE EDUCATION REVOLUTION POCKET GUIDE, VOLUME 14</p>
<h1 style="text-align:center;font-size:26pt">Eleven Dogs</h1>
<p style="text-align:center">by Blue and the Awesome Dudes</p>
<p style="text-align:center;font-style:italic">Canine parvovirus, from a yard that lost three — and why the three died of dehydration, not of a missing drug.</p>
<p style="text-align:center">Eleven dogs, six and a half months old. Dust, drought, coyotes, a small yard. Eight saved for about $10,000, not $55,000, because they were not allowed to dehydrate.</p>
<p class="quote" style="text-align:center">Dedicated to Villager #2, Lily, and Mrs Sassy Fancy Boots.</p>
<p style="text-align:center">{html.escape(edition['holder'])}. Copyright {html.escape(str(edition['year']))}. All rights reserved.</p>
{''.join(chapter_html)}
<p>Privacy: This guide does not collect your name, email, or any personal information. Checklist marks are saved only on your own device.</p>
</div>
</body>
</html>
"""

rtf = (
    r"{\rtf1\ansi\ansicpg1252\deff0"
    r"{\fonttbl{\f0\froman Times New Roman;}}"
    r"\paperw7920\paperh12240\margl792\margr792\margt792\margb792"
    r"\fs22\f0 "
    r"\pard\sa80\b\fs20 HOW TO PRINT THIS AS A SMALL BOOK\b0\par"
    r"\pard\sa80\fs20 This file is already a small page, 5.5 inches wide by 8.5 inches tall. Delete this note before you print copies for the neighbors.\par"
    r"\pard\sa200\fs20 To use less paper: File, Print, Pages per sheet, 2. Two of these small pages then sit on one sheet of letter paper.\par"
    r"\pard\sb360\sa80\qc\b\fs18 THE EDUCATION REVOLUTION POCKET GUIDE, VOLUME 14\b0\par"
    r"\pard\qc\b\fs52 Eleven Dogs\b0\par"
    r"\pard\qc\sa80 by Blue and the Awesome Dudes\par"
    r"\pard\qc\sa160\i\fs24 Canine parvovirus, from a yard that lost three \u8212? and why the three died of dehydration, not of a missing drug.\i0\fs22\par"
    r"\pard\qc\sa160 Dedicated to Villager #2, Lily, and Mrs Sassy Fancy Boots.\par"
    rf"\pard\qc\sa200 {rtf_text(edition['holder'])}. Copyright {edition['year']}. All rights reserved.\par"
    + "\n".join(chapter_rtf)
    + r"\pard\sa160 Privacy: This guide does not collect your name, email, or any personal information. Checklist marks are saved only on your own device.\par"
    + "}"
)

doc_path = "/workspace/artifacts/Eleven-Dogs.doc"
rtf_path = "/workspace/artifacts/Eleven-Dogs.rtf"
with open(doc_path, "w", encoding="utf-8") as handle:
    handle.write(doc)
with open(rtf_path, "w", encoding="utf-8") as handle:
    handle.write(rtf)
print(doc_path)
print(rtf_path)
