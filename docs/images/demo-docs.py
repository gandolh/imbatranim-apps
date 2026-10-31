"""Make the demo documents the README images show. Every name and number is made up.

    python3 docs/images/demo-docs.py /tmp/office-demo

Needs python-docx, python-pptx and openpyxl, and LibreOffice for the PDF. Writes outside the repo.
The CAD image opens `apps/cad/fixtures/apartment.dxf` from this repo instead.
"""
import subprocess
import sys
from pathlib import Path

from docx import Document
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from pptx import Presentation
from pptx.util import Inches

out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/office-demo')
out.mkdir(parents=True, exist_ok=True)

beds = [('A1', 'Tomatoes', 'Week 12'), ('A2', 'Beans', 'Week 14'), ('B1', 'Lettuce', 'Week 10'), ('B2', 'Herbs', 'Week 11')]

d = Document()
d.add_heading('Community garden plan', 0)
d.add_paragraph('A short plan for the spring season at the Sample City community garden. '
                'Every name and number here is made up for the demo.')
d.add_heading('Beds and crops', level=1)
t = d.add_table(rows=1, cols=3)
t.style = 'Light Grid Accent 1'
for cell, text in zip(t.rows[0].cells, ('Bed', 'Crop', 'Sowing week')):
    cell.text = text
for row in beds:
    for cell, text in zip(t.add_row().cells, row):
        cell.text = text
d.add_heading('Tasks', level=1)
for task in ['Turn the compost before the first sowing.', 'Fix the gate latch by the tool shed.',
             'Put up the watering rota on the notice board.']:
    d.add_paragraph(task, style='List Bullet')
d.add_paragraph('Next meeting: the first Saturday of the month, at the garden.')
d.save(out / 'garden-plan.docx')
subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', str(out), str(out / 'garden-plan.docx')],
               check=True, capture_output=True)

p = Presentation()
p.slide_width, p.slide_height = Inches(13.333), Inches(7.5)
s = p.slides.add_slide(p.slide_layouts[0])
s.shapes.title.text = 'Spring at the garden'
s.placeholders[1].text = 'Sample City community garden, season plan'
s = p.slides.add_slide(p.slide_layouts[1])
s.shapes.title.text = 'What we grow this year'
tf = s.placeholders[1].text_frame
tf.text = 'Tomatoes and beans in the A beds'
for line in ['Lettuce and herbs in the B beds', 'A new compost bay by the shed', 'Watering rota on the notice board']:
    tf.add_paragraph().text = line
s = p.slides.add_slide(p.slide_layouts[5])
s.shapes.title.text = 'Sowing weeks'
table = s.shapes.add_table(5, 3, Inches(2), Inches(2), Inches(9), Inches(3.5)).table
for r, row in enumerate([('Bed', 'Crop', 'Week')] + [(b, c, w.split()[1]) for b, c, w in beds]):
    for c, value in enumerate(row):
        table.cell(r, c).text = value
p.save(out / 'garden-season.pptx')

wb = Workbook()
ws = wb.active
ws.title = 'Harvest'
ws.append(['Bed', 'Crop', 'May (kg)', 'June (kg)', 'July (kg)', 'Total (kg)'])
for i, (bed, crop, may, june, july) in enumerate(
        [('A1', 'Tomatoes', 0, 4.5, 12), ('A2', 'Beans', 0, 3.2, 6.8), ('B1', 'Lettuce', 2.4, 3.1, 1.5), ('B2', 'Herbs', 0.6, 0.9, 1.1)], start=2):
    ws.append([bed, crop, may, june, july, f'=SUM(C{i}:E{i})'])
ws.append(['', 'Total', '=SUM(C2:C5)', '=SUM(D2:D5)', '=SUM(E2:E5)', '=SUM(F2:F5)'])
for cell in ws[1]:
    cell.font = Font(bold=True, color='FFFFFF')
    cell.fill = PatternFill('solid', fgColor='2F5597')
for cell in ws[6]:
    cell.font = Font(bold=True)
for col, width in zip('ABCDEF', [8, 14, 12, 12, 12, 12]):
    ws.column_dimensions[col].width = width
wb.save(out / 'garden-harvest.xlsx')
print('wrote', *sorted(f.name for f in out.iterdir()))
