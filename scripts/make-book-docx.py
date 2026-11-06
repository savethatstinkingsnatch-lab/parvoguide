import json
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

with open("/tmp/eleven-dogs.json", encoding="utf-8") as handle:
    book = json.load(handle)

chapters = book["chapters"]
paths = book["paths"]
take = book["take"]
edition = book["edition"]

INK = RGBColor(0x22, 0x1C, 0x16)
CLAY = RGBColor(0x8C, 0x3D, 0x2E)
MUTED = RGBColor(0x5C, 0x53, 0x4A)

doc = Document()
section = doc.sections[0]
section.page_width = Inches(5.5)
section.page_height = Inches(8.5)
section.left_margin = Inches(0.55)
section.right_margin = Inches(0.55)
section.top_margin = Inches(0.55)
section.bottom_margin = Inches(0.55)

normal = doc.styles["Normal"]
normal.font.name = "Georgia"
normal.font.size = Pt(11)
normal.font.color.rgb = INK
normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Georgia")
normal.paragraph_format.space_after = Pt(8)
normal.paragraph_format.space_before = Pt(0)
normal.paragraph_format.line_spacing = 1.08


def set_run(run, size, bold=False, italic=False, color=INK):
    run.font.name = "Georgia"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Georgia")
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color


def add_p(text, size=11, bold=False, italic=False, color=INK, after=8, before=0, center=False):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.space_before = Pt(before)
    if center:
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run(text)
    set_run(run, size, bold, italic, color)
    return paragraph


add_p("HOW TO PRINT THIS AS A SMALL BOOK", 10, bold=True, color=CLAY, after=4)
add_p(
    "This file is already a small page, 5.5 inches wide by 8.5 inches tall. Delete this note before you print copies for the neighbors.",
    10,
    color=MUTED,
    after=4,
)
add_p(
    "To use less paper: File, Print, Pages per sheet, 2. Two of these small pages then sit on one sheet of letter paper. You can also change Layout, Size, if you want the page even smaller. The words will reflow. You do not have to print one giant page per sheet.",
    10,
    color=MUTED,
    after=12,
)

add_p("THE EDUCATION REVOLUTION POCKET GUIDE, VOLUME 14", 9, bold=True, color=CLAY, center=True, after=6, before=18)
add_p("Eleven Dogs", 26, bold=True, center=True, after=6)
add_p("by Blue and the Awesome Dudes", 11, italic=True, center=True, after=8)
add_p(
    "Canine parvovirus, from a yard that lost three. The keeper believes late fluids mattered more than a missing drug.",
    12,
    italic=True,
    center=True,
    after=8,
)
add_p(
    "Eleven dogs, born April 13, six months old when Villager #1 tested positive on October 13. Dust, drought, coyotes, a small yard. Eight saved for about $10,000, not $55,000.",
    11,
    color=MUTED,
    center=True,
    after=8,
)
add_p("Dedicated to Villager #2, Lily, and Mrs Sassy Fancy Boots.", 12, italic=True, color=CLAY, center=True, after=8)
add_p(f"{edition['holder']}. Copyright {edition['year']}. All rights reserved.", 10, color=MUTED, center=True, after=14)


def render(block):
    kind = block["kind"]
    if kind == "p":
        add_p(block["text"])
    elif kind == "h":
        add_p(block["text"], 14, bold=True, before=12, after=4)
    elif kind == "quote":
        add_p(block["text"], 12, italic=True, color=CLAY, before=6, after=8)
    elif kind == "note":
        add_p(block["title"], 12, bold=True, before=8, after=2)
        add_p(block["text"], after=8)
    elif kind == "list":
        for item in block["items"]:
            add_p("•  " + item, after=3)
    elif kind == "tally":
        add_p("3 died while fluids were late. The keeper believes the delay mattered.", 12, bold=True, before=6, after=2)
        add_p("8 lived. In the keeper’s view, they were not allowed to dehydrate.", 12, bold=True, after=8)
    elif kind == "paths":
        for path in paths:
            add_p(f"{path['who']} · {path['where']}", 10, bold=True, color=CLAY, before=8, after=1)
            add_p(path["title"], 12, bold=True, after=2)
            add_p(path["detail"])
    elif kind == "take":
        for index, item in enumerate(take, start=1):
            add_p(f"{index}.  {item['text']}", after=4)
    elif kind == "edition":
        add_p(f"Copyright {edition['year']}", 12, bold=True, before=6, after=2)
        add_p(
            f"{edition['holder']}. All rights reserved."
        )


for chapter in chapters:
    doc.add_page_break()
    add_p(f"{chapter['numeral']}  ·  {chapter['kicker']}", 9, bold=True, color=CLAY, after=2)
    add_p(chapter["title"], 18, bold=True, after=8)
    for block in chapter["blocks"]:
        render(block)

add_p(
    "Privacy: This guide does not collect your name, email, or any personal information. Checklist marks are saved only on your own device.",
    10,
    color=MUTED,
    before=12,
)

out = "/workspace/artifacts/Eleven-Dogs.docx"
doc.save(out)
print(out)
