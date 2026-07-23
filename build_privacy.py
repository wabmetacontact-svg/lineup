import re
import json

with open('extracted_privacy.txt', 'r', encoding='utf-8') as f:
    raw = f.read()

# Replace unicode quotes with standard ASCII quotes
raw = raw.replace('’', "'").replace('“', '"').replace('”', '"')

# Locate body start after TOC
start_idx = raw.find('1. Introduction and Scope')
second_idx = raw.find('1. Introduction and Scope', start_idx + 100)
if second_idx != -1:
    body = raw[second_idx:]
else:
    body = raw[start_idx:]

# Clean page footers / headers
body = re.sub(r'Page \d+ of \d+', '', body)
body = re.sub(r'LINEUP PRIVACY POLICY', '', body)
body = re.sub(r'^\s*\d+\s*$', '', body, flags=re.MULTILINE)

expected_titles = [
    "1. Introduction and Scope",
    "2. Definitions",
    "3. The Personal Data We Collect",
    "4. How and Why We Use Your Personal Data",
    "5. Automated Decision-Making and Profiling",
    "6. Analytics, Cookies, and Tracking Technologies",
    "7. Marketing Communications",
    "8. How We Share Your Personal Data",
    "9. International Data Transfers",
    "10. Data Retention",
    "11. Data Security",
    "12. Your Rights",
    "13. Third-Party Services and Links",
    "14. Children",
    "15. Changes to This Policy",
    "16. Google Play Data Safety Disclosure",
    "17. Contact Us"
]

positions = []
for title in expected_titles:
    parts = title.split(' ')
    num = re.escape(parts[0])
    rest = r'\s+'.join([re.escape(p) for p in parts[1:]])
    pattern = rf'{num}\s+{rest}'
    match = re.search(pattern, body)
    if match:
        positions.append((match.start(), title, match.end()))

positions.sort()

sections = []
for i in range(len(positions)):
    pos, stitle, end_pos = positions[i]
    next_pos = positions[i+1][0] if i+1 < len(positions) else len(body)
    
    scontent = body[end_pos:next_pos].strip()
    
    subsections = [sub.strip() for sub in re.split(r'\n(?=\d+\.\d+\.)', scontent) if sub.strip()]
    
    sections.append({
        'id': f"sec-{i+1}",
        'title': stitle,
        'content': scontent,
        'subsections': subsections
    })

print(f"Parsed {len(sections)} sections for Privacy Policy successfully.")
for s in sections:
    print(f" - {s['title']} ({len(s['subsections'])} subsections)")

privacy_obj = {
    'meta': {
        'title': 'LINEUP PRIVACY POLICY',
        'subtitle': 'Data Protection & Privacy Notice',
        'effectiveDate': '15 July 2026',
        'lastUpdated': '20 July 2026',
        'dataController': 'LineUp, Emirate of Dubai, United Arab Emirates',
        'platformUrl': 'https://lineup.trade/',
        'contact': 'Support@Lineup.trade',
        'pdfFile': 'LineUp_Privacy_Policy.pdf'
    },
    'sections': sections
}

with open('privacy_data.js', 'w', encoding='utf-8') as f:
    f.write('window.LU_PRIVACY = ' + json.dumps(privacy_obj, indent=2) + ';')

with open('privacy_data.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(privacy_obj, indent=2))

print("privacy_data.js & privacy_data.json created successfully!")
