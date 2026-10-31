import re
import json
import os

def clean_text(text):
    # Fix unicode quotes & dashes
    text = text.replace('’', "'").replace('“', '"').replace('”', '"').replace('‘', "'").replace('–', '-').replace('—', '-')
    # Clean page headers / footers
    text = re.sub(r'Page \d+ of \d+', '', text)
    text = re.sub(r'LINEUP [A-Z\s&]+ POLICY', '', text)
    text = re.sub(r'LINEUP [A-Z\s&]+ STATEMENT', '', text)
    text = re.sub(r'LINEUP [A-Z\s&]+ RULES', '', text)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    return text

def build_refund_policy():
    with open('extracted_refund_policy.txt', 'r', encoding='utf-8') as f:
        raw = f.read()

    raw = clean_text(raw)
    # Start after Table of Contents
    start_idx = raw.find('1. Purpose and Scope')
    body = raw[start_idx:]

    titles = [
        "1. Purpose and Scope",
        "2. Important Context: LineUp Does Not Hold Your Funds",
        "3. Deposits: Refunds of Unused Funds",
        "4. Refund Method, Timeframe, and Fees",
        "5. Orders and Trades: Cancellation and Finality",
        "6. Limited Exceptions: Platform Errors",
        "7. Cryptocurrency: Returns and Irreversibility",
        "8. Chargebacks and Payment Disputes",
        "9. How to Request a Refund or Raise a Concern",
        "10. Changes to This Policy",
        "11. Contact"
    ]

    positions = []
    for title in titles:
        match = re.search(re.escape(title), body)
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

    refund_obj = {
        'meta': {
            'title': 'LINEUP REFUND AND CANCELLATION POLICY',
            'subtitle': 'Refund, Return & Order Cancellation Rules',
            'effectiveDate': '15 July 2026',
            'lastUpdated': '20 July 2026',
            'version': '1.0',
            'operator': 'LineUp, Emirate of Dubai, United Arab Emirates',
            'platformUrl': 'https://lineup.trade/',
            'contact': 'Support@Lineup.trade',
            'pdfFile': 'LineUp_Refund_and_Cancellation_Policy.pdf'
        },
        'sections': sections
    }

    with open('refund_policy_data.js', 'w', encoding='utf-8') as f:
        f.write('window.LU_REFUND = ' + json.dumps(refund_obj, indent=2) + ';')

    with open('refund_policy_data.json', 'w', encoding='utf-8') as f:
        f.write(json.dumps(refund_obj, indent=2))

    print(f"Refund policy parsed: {len(sections)} sections")
    return refund_obj

def build_risk_disclosure():
    with open('extracted_risk_disclosure.txt', 'r', encoding='utf-8') as f:
        raw = f.read()

    raw = clean_text(raw)
    start_idx = raw.find('1. Purpose and Status of This Statement')
    body = raw[start_idx:]

    titles = [
        "1. Purpose and Status of This Statement",
        "2. Capital-at-Risk and No Guaranteed Returns",
        "3. Nature of Synthetic Player Assets",
        "4. Leverage and Margin Risk",
        "5. Short-Selling Risk",
        "6. Liquidation Risk",
        "7. Negative-Balance Protection and Its Limits",
        "8. Liquidity and Execution Risk",
        "9. Volatility, Interruptions, and Circuit Breakers",
        "10. Technology, Latency, and Operational Risk",
        "11. Cryptocurrency and Self-Custody Wallet Risk",
        "12. Currency and Conversion Risk",
        "13. Data Risk",
        "14. Sports-Event Risk",
        "15. No Advice and Suitability",
        "16. Regulatory and Legal Risk",
        "17. Tax Risk",
        "18. Responsible Trading and Wellbeing",
        "19. Acknowledgement",
        "20. Contact"
    ]

    positions = []
    for title in titles:
        match = re.search(re.escape(title), body)
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

    risk_obj = {
        'meta': {
            'title': 'LINEUP RISK DISCLOSURE STATEMENT',
            'subtitle': 'Key Risks of Trading Synthetic Player Assets',
            'effectiveDate': '15 July 2026',
            'lastUpdated': '20 July 2026',
            'version': '1.0',
            'operator': 'LineUp, Emirate of Dubai, United Arab Emirates',
            'platformUrl': 'https://lineup.trade/',
            'contact': 'Support@Lineup.trade',
            'pdfFile': 'LineUp_Risk_Disclosure_Statement.pdf'
        },
        'sections': sections
    }

    with open('risk_disclosure_data.js', 'w', encoding='utf-8') as f:
        f.write('window.LU_RISK = ' + json.dumps(risk_obj, indent=2) + ';')

    with open('risk_disclosure_data.json', 'w', encoding='utf-8') as f:
        f.write(json.dumps(risk_obj, indent=2))

    print(f"Risk disclosure parsed: {len(sections)} sections")
    return risk_obj

def build_trading_rules():
    with open('extracted_trading_rules.txt', 'r', encoding='utf-8') as f:
        raw = f.read()

    raw = clean_text(raw)
    start_idx = raw.find('PART I. MARKET FUNDAMENTALS')
    body = raw[start_idx:]

    parts_def = [
        ('Part 1', 'PART I. MARKET FUNDAMENTALS'),
        ('Part 2', 'PART II. MARKET INSTRUMENTS'),
        ('Part 3', 'PART III. TRADING OPERATIONS'),
        ('Part 4', 'PART IV. PRICING SYSTEM'),
        ('Part 5', 'PART V. MARGIN, LEVERAGE, AND RISK'),
        ('Part 6', 'PART VI. MARKET PROTECTION'),
        ('Part 7', 'PART VII. SETTLEMENT'),
        ('Part 8', 'PART VIII. MARKET INTEGRITY'),
        ('Part 9', 'PART IX. SYSTEM GOVERNANCE')
    ]

    positions = []
    for pid, ptitle in parts_def:
        match = re.search(re.escape(ptitle), body)
        if match:
            positions.append((match.start(), pid, ptitle))

    positions.sort()
    parts_data = []

    for i in range(len(positions)):
        pos, pid, ptitle = positions[i]
        next_pos = positions[i+1][0] if i+1 < len(positions) else len(body)
        part_text = body[pos + len(ptitle):next_pos].strip()

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

    trading_obj = {
        'meta': {
            'title': 'LINEUP TRADING AND MARKET RULES',
            'subtitle': 'Comprehensive Rulebook & Exchange Operating Standards',
            'effectiveDate': '15 July 2026',
            'lastUpdated': '20 July 2026',
            'version': '1.0',
            'operator': 'LineUp, Emirate of Dubai, United Arab Emirates',
            'platformUrl': 'https://lineup.trade/',
            'contact': 'Support@Lineup.trade',
            'pdfFile': 'LineUp_Trading_and_Market_Rules.pdf'
        },
        'parts': parts_data
    }

    with open('trading_rules_data.js', 'w', encoding='utf-8') as f:
        f.write('window.LU_TRADING = ' + json.dumps(trading_obj, indent=2) + ';')

    with open('trading_rules_data.json', 'w', encoding='utf-8') as f:
        f.write(json.dumps(trading_obj, indent=2))

    print(f"Trading rules parsed: {len(parts_data)} parts")
    return trading_obj

def generate_section_html(meta, sections_or_parts, is_parts=False):
    pdf = meta['pdfFile']
    title = meta['title']
    subtitle = meta['subtitle']

    toc_items = []
    content_cards = []

    if not is_parts:
        for s in sections_or_parts:
            sid = s['id']
            stitle = s['title']
            subs = s['subsections']
            
            toc_items.append(f'<a href="#{sid}" class="toc-link">{stitle}</a>')

            sub_html = []
            if subs:
                for sub in subs:
                    lines = sub.split('\n')
                    first_line = lines[0].strip()
                    rest = '\n'.join(lines[1:]).strip()
                    sub_html.append(f'''
                    <div style="margin-bottom: 18px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <h4 style="color: #6c5ce7; margin-bottom: 8px; font-size: 15px;">{first_line}</h4>
                        <p style="color: #b8b3d6; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{rest if rest else first_line}</p>
                    </div>
                    ''')
            else:
                sub_html.append(f'<p style="color: #b8b3d6; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{s["content"]}</p>')

            content_cards.append(f'''
            <div class="section-card" id="{sid}">
                <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">{stitle}</h3>
                {"".join(sub_html)}
            </div>
            ''')
    else:
        sec_counter = 1
        for p in sections_or_parts:
            pid = p['id']
            ptitle = p['title']
            toc_items.append(f'<a href="#{pid}" class="toc-link" style="font-weight: 700; color: #a59bf4;">{ptitle}</a>')
            
            sec_htmls = []
            for s in p['sections']:
                sid = f"sec-{sec_counter}"
                sec_counter += 1
                stitle = s['title']
                subs = s.get('subsections', [])
                
                sub_html = []
                if subs:
                    for sub in subs:
                        lines = sub.split('\n')
                        first_line = lines[0].strip()
                        rest = '\n'.join(lines[1:]).strip()
                        sub_html.append(f'''
                        <div style="margin-bottom: 16px; padding: 14px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                            <h4 style="color: #6c5ce7; margin-bottom: 6px; font-size: 14px;">{first_line}</h4>
                            <p style="color: #b8b3d6; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap;">{rest if rest else first_line}</p>
                        </div>
                        ''')
                else:
                    sub_html.append(f'<p style="color: #b8b3d6; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{s["content"]}</p>')

                sec_htmls.append(f'''
                <div class="section-card" id="{sid}" style="margin-top: 20px;">
                    <h4 style="font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 12px;">{stitle}</h4>
                    {"".join(sub_html)}
                </div>
                ''')

            content_cards.append(f'''
            <div id="{pid}" style="margin-bottom: 40px;">
                <h2 style="font-size: 22px; font-weight: 800; color: #6c5ce7; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(108, 92, 231, 0.4);">{ptitle}</h2>
                {"".join(sec_htmls)}
            </div>
            ''')

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} · LineUp</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700" rel="stylesheet" />
<link rel="stylesheet" href="site.css" />
<link rel="icon" type="image/png" href="favicon.png" />
<style>
  .terms-hero {{
    padding: 60px 0 40px;
    background: linear-gradient(180deg, rgba(91, 75, 214, 0.12) 0%, rgba(10, 7, 24, 0) 100%);
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  }}
  .terms-badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: rgba(91, 75, 214, 0.2);
    border: 1px solid rgba(91, 75, 214, 0.4);
    border-radius: 20px;
    color: #a59bf4;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 16px;
  }}
  .terms-title {{
    font-size: clamp(28px, 4.5vw, 48px);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #cfc9fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .terms-subtitle {{
    font-size: 16px;
    color: var(--text-muted, #938eb4);
    max-width: 680px;
    line-height: 1.6;
    margin-bottom: 24px;
  }}
  .meta-grid {{
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    font-size: 13px;
  }}
  .meta-item {{
    display: flex;
    flex-direction: column;
    gap: 2px;
  }}
  .meta-item span.label {{
    color: #8b85b4;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .meta-item span.val {{
    color: #ffffff;
    font-weight: 700;
  }}

  .terms-layout {{
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 40px;
    padding: 40px 0 80px;
  }}
  @media (max-width: 900px) {{
    .terms-layout {{
      grid-template-columns: 1fr;
    }}
    .terms-sidebar {{
      position: static !important;
      max-height: none !important;
    }}
  }}

  .terms-sidebar {{
    position: sticky;
    top: 90px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    padding-right: 12px;
  }}
  .terms-sidebar::-webkit-scrollbar {{
    width: 4px;
  }}
  .terms-sidebar::-webkit-scrollbar-thumb {{
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }}

  .toc-title {{
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8b85b4;
    font-weight: 700;
    margin-bottom: 12px;
  }}
  .toc-list {{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}
  .toc-link {{
    color: #a099c7;
    font-size: 13px;
    text-decoration: none;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: block;
    line-height: 1.4;
  }}
  .toc-link:hover, .toc-link.active {{
    background: rgba(108, 92, 231, 0.15);
    color: #fff;
  }}

  .search-box {{
    margin-bottom: 20px;
  }}
  .search-box input {{
    width: 100%;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    outline: none;
  }}
  .search-box input:focus {{
    border-color: #6c5ce7;
  }}

  .section-card {{
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }}

  .download-btn {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    border-radius: 8px;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }}
  .download-btn:hover {{
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(108, 92, 231, 0.5);
  }}
</style>
</head>
<body data-page="legal">
<div class="page-bg"></div>

<!-- ============ NAV ============ -->
<header class="nav">
  <div class="container nav-inner">
    <a class="brand" href="index.html" aria-label="LineUp home">
      <img src="logo.png" alt="LineUp" width="34" height="34" style="border-radius: 9px;" />
      <span class="wordmark">Line<b>Up</b></span>
    </a>
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="Features.html">Features</a>
      <a href="Liquidity-Engine.html">Liquidity &amp; Engine</a>
      <a href="Contact.html">Contact</a>
    </nav>
    <div class="nav-right">
      <a class="btn btn-ghost btn-sm" href="https://app.lineup.trade/sport-select">Open app</a>
      <a class="download-btn" href="{pdf}" download="{pdf}" style="padding: 8px 16px; font-size: 13px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download PDF
      </a>
    </div>
  </div>
</header>

<!-- ============ HERO ============ -->
<section class="terms-hero">
  <div class="container">
    <div class="terms-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Official Exchange Policy & Governance Document
    </div>
    <h1 class="terms-title">{title}</h1>
    <p class="terms-subtitle">{subtitle}</p>
    
    <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 24px;">
      <a class="download-btn" href="{pdf}" download="{pdf}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Full Document (PDF)
      </a>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span class="label">Effective Date</span><span class="val">{meta["effectiveDate"]}</span></div>
      <div class="meta-item"><span class="label">Last Updated</span><span class="val">{meta["lastUpdated"]}</span></div>
      <div class="meta-item"><span class="label">Version</span><span class="val">{meta.get("version", "1.0")}</span></div>
      <div class="meta-item"><span class="label">Operator</span><span class="val">{meta["operator"]}</span></div>
      <div class="meta-item"><span class="label">Platform URL</span><span class="val">{meta["platformUrl"]}</span></div>
      <div class="meta-item"><span class="label">Contact</span><span class="val">{meta["contact"]}</span></div>
    </div>
  </div>
</section>

<!-- ============ MAIN CONTENT LAYOUT ============ -->
<div class="container terms-layout">
  <aside class="terms-sidebar">
    <div class="search-box">
      <input type="text" id="terms-search" placeholder="Search document..." />
    </div>
    <div class="toc-title">Table of Contents</div>
    <div class="toc-list">
      {"".join(toc_items)}
    </div>
  </aside>

  <main class="terms-body">
    {"".join(content_cards)}
  </main>
</div>

<!-- ============ FOOTER ============ -->
<footer class="footer">
  <div class="container footer-inner">
    <div>
      <a class="brand" href="index.html">
        <img src="logo.png" alt="LineUp" width="30" height="30" style="border-radius: 8px;" />
        <span class="wordmark">Line<b>Up</b></span>
      </a>
      <p style="margin-top: 12px; font-size: 13px; color: #8b85b4;">The premier synthetic cricket player asset &amp; liquidity exchange.</p>
    </div>
    <div>
      <h5>Legal &amp; Governance</h5>
      <div class="f-links">
        <a href="terms.html">Terms &amp; Conditions</a>
        <a href="privacy.html">Privacy Policy</a>
        <a href="trading-rules.html">Trading &amp; Market Rules</a>
        <a href="refund-policy.html">Refund Policy</a>
        <a href="risk-disclosure.html">Risk Disclosure</a>
      </div>
    </div>
  </div>
</footer>

<script>
  const searchInput = document.getElementById('terms-search');
  const sections = document.querySelectorAll('.section-card');

  if (searchInput) {{
    searchInput.addEventListener('input', (e) => {{
      const q = e.target.value.toLowerCase().trim();
      sections.forEach(sec => {{
        const text = sec.textContent.toLowerCase();
        if (!q || text.includes(q)) {{
          sec.style.display = 'block';
        }} else {{
          sec.style.display = 'none';
        }}
      }});
    }});
  }}

  window.addEventListener('scroll', () => {{
    let current = '';
    sections.forEach(sec => {{
      const secTop = sec.offsetTop;
      if (pageYOffset >= secTop - 120) {{
        current = sec.getAttribute('id');
      }}
    }});

    document.querySelectorAll('.toc-link').forEach(link => {{
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {{
        link.classList.add('active');
      }}
    }});
  }});
</script>
</body>
</html>
'''

if __name__ == '__main__':
    refund_obj = build_refund_policy()
    refund_html = generate_section_html(refund_obj['meta'], refund_obj['sections'], is_parts=False)
    with open('refund-policy.html', 'w', encoding='utf-8') as f:
        f.write(refund_html)

    risk_obj = build_risk_disclosure()
    risk_html = generate_section_html(risk_obj['meta'], risk_obj['sections'], is_parts=False)
    with open('risk-disclosure.html', 'w', encoding='utf-8') as f:
        f.write(risk_html)

    trading_obj = build_trading_rules()
    trading_html = generate_section_html(trading_obj['meta'], trading_obj['parts'], is_parts=True)
    with open('trading-rules.html', 'w', encoding='utf-8') as f:
        f.write(trading_html)

    print("All 3 legal documents built successfully into JSON/JS and HTML!")
