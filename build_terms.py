import re
import json

with open('extracted_terms.txt', 'r', encoding='utf-8') as f:
    raw = f.read()

# Locate main document start after TOC
start_marker = 'LINEUP TERMS & CONDITIONS \nA Market Rulebook and User Agreement'
body_idx = raw.find(start_marker)
if body_idx == -1:
    body_idx = raw.find('A Market Rulebook and User Agreement')

body = raw[body_idx:]

# Remove page header/footer noise
body = re.sub(r'Page \d+ of \d+', '', body)
body = re.sub(r'LINEUP TERMS & CONDITIONS v1\.2', '', body)

# Split into parts
part_titles = [
    ('Preamble', 'PREAMBLE AND STRUCTURE OF THIS DOCUMENT'),
    ('Part 1', 'PART I: INTRODUCTION'),
    ('Part 2', 'PART II: ELIGIBILITY'),
    ('Part 3', 'PART III: ACCOUNT'),
    ('Part 4', 'PART IV: PLATFORM'),
    ('Part 5', 'PART V: TRADING'),
    ('Part 6', 'PART VI: PAYMENTS'),
    ('Part 7', 'PART VII: USER RESPONSIBILITIES'),
    ('Part 8', 'PART VIII: RISK'),
    ('Part 9', 'PART IX: INTELLECTUAL PROPERTY'),
    ('Part 10', 'PART X: LIABILITY'),
    ('Part 11', 'PART XI: PRIVACY'),
    ('Part 12', 'PART XII: MISCELLANEOUS'),
    ('Schedules', 'SCHEDULES')
]

positions = []
for pid, ptitle in part_titles:
    pos = body.find(ptitle)
    if pos != -1:
        positions.append((pos, pid, ptitle))

positions.sort()

parts_data = []

for i in range(len(positions)):
    pos, pid, ptitle = positions[i]
    next_pos = positions[i+1][0] if i+1 < len(positions) else len(body)
    part_text = body[pos + len(ptitle):next_pos].strip()

    if pid == 'Schedules':
        sched_matches = list(re.finditer(r'(Schedule \d+:[^\n]+)', part_text))
        sections = []
        for sj in range(len(sched_matches)):
            spos = sched_matches[sj].start()
            snext = sched_matches[sj+1].start() if sj+1 < len(sched_matches) else len(part_text)
            stitle = sched_matches[sj].group(1).strip()
            scontent = part_text[sched_matches[sj].end():snext].strip()
            sections.append({
                'title': stitle,
                'content': scontent
            })
        parts_data.append({
            'id': pid,
            'title': ptitle,
            'sections': sections
        })
    elif pid == 'Preamble':
        parts_data.append({
            'id': pid,
            'title': ptitle,
            'sections': [{'title': 'Preamble & Master Overview', 'content': part_text}]
        })
    else:
        sec_matches = list(re.finditer(r'(\n\d+\.\s+[^\n]+)', part_text))
        sections = []
        for sj in range(len(sec_matches)):
            spos = sec_matches[sj].start()
            snext = sec_matches[sj+1].start() if sj+1 < len(sec_matches) else len(part_text)
            stitle = sec_matches[sj].group(1).strip()
            scontent = part_text[sec_matches[sj].end():snext].strip()
            
            subsections = [sub.strip() for sub in re.split(r'\n(?=\d+\.\d+\.)', scontent) if sub.strip()]
            sections.append({
                'title': stitle,
                'content': scontent,
                'subsections': subsections
            })
        parts_data.append({
            'id': pid,
            'title': ptitle,
            'sections': sections
        })

print('Parts parsed:', len(parts_data))
for p in parts_data:
    print(f"{p['title']}: {len(p['sections'])} sections")

terms_obj = {
    'meta': {
        'title': 'LINEUP TERMS & CONDITIONS',
        'subtitle': 'A Market Rulebook and User Agreement',
        'effectiveDate': '15 July 2026',
        'lastUpdated': '20 July 2026',
        'version': '1.2',
        'operator': 'LineUp',
        'jurisdiction': 'Emirate of Dubai, United Arab Emirates',
        'platformUrl': 'https://lineup.trade/',
        'contact': 'Support@Lineup.trade',
        'pdfFile': 'LineUp_Terms_and_Conditions_v1.2.pdf'
    },
    'parts': parts_data
}

with open('terms_data.js', 'w', encoding='utf-8') as f:
    f.write('window.LU_TERMS = ' + json.dumps(terms_obj, indent=2) + ';')

with open('terms_data.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(terms_obj, indent=2))

print('terms_data.js & terms_data.json created successfully!')
