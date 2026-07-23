import json

with open('privacy_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

meta = data['meta']
sections = data['sections']

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Privacy Policy · LineUp</title>
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
    font-size: clamp(32px, 5vw, 54px);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #cfc9fa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .terms-subtitle {{
    font-size: 17px;
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
    max-height: calc(100vh - 110px);
    overflow-y: auto;
    padding-right: 12px;
  }}
  .toc-menu {{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}
  .toc-link {{
    padding: 10px 14px;
    border-radius: 8px;
    color: #a49fc4;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .toc-link:hover, .toc-link.active {{
    background: rgba(91, 75, 214, 0.2);
    color: #ffffff;
    border-left: 3px solid #6c5ce7;
  }}

  .search-box {{
    margin-bottom: 24px;
    position: sticky;
    top: 90px;
    z-index: 10;
    background: rgba(10, 7, 24, 0.95);
    backdrop-filter: blur(12px);
    padding: 12px 0;
  }}
  .search-box input {{
    width: 100%;
    padding: 14px 18px 14px 44px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    transition: border 0.2s;
  }}
  .search-box input:focus {{
    border-color: #6c5ce7;
  }}
  .search-icon {{
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #8b85b4;
    pointer-events: none;
  }}

  .section-card {{
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    margin-bottom: 20px;
    overflow: hidden;
    scroll-margin-top: 100px;
    transition: border 0.2s;
  }}
  .section-card:hover {{
    border-color: rgba(91, 75, 214, 0.4);
  }}
  .section-title {{
    padding: 18px 22px;
    font-size: 17px;
    font-weight: 700;
    color: #a59bf4;
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .section-body {{
    padding: 20px 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 14px;
    line-height: 1.7;
    color: #d1cbe8;
  }}
  .subsection-text {{
    margin-bottom: 14px;
    white-space: pre-line;
  }}
  .subsection-text:last-child {{
    margin-bottom: 0;
  }}
  .download-btn {{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%);
    color: #ffffff;
    font-weight: 700;
    border-radius: 12px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(108, 92, 231, 0.3);
  }}
  .download-btn:hover {{
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(108, 92, 231, 0.5);
  }}
</style>
</head>
<body data-page="privacy">
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
      <a class="btn btn-ghost btn-sm" href="LineUp.html">Open app</a>
      <a class="download-btn" href="{meta['pdfFile']}" download="{meta['pdfFile']}" style="padding: 8px 16px; font-size: 13px;">
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
      Official Data Protection &amp; Privacy Notice
    </div>
    <h1 class="terms-title">{meta['title']}</h1>
    <p class="terms-subtitle">{meta['subtitle']}</p>
    
    <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 24px;">
      <a class="download-btn" href="{meta['pdfFile']}" download="{meta['pdfFile']}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Full Privacy Policy (PDF)
      </a>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span class="label">Effective Date</span><span class="val">{meta['effectiveDate']}</span></div>
      <div class="meta-item"><span class="label">Last Updated</span><span class="val">{meta['lastUpdated']}</span></div>
      <div class="meta-item"><span class="label">Data Controller</span><span class="val">{meta['dataController']}</span></div>
      <div class="meta-item"><span class="label">Platform URL</span><span class="val">{meta['platformUrl']}</span></div>
      <div class="meta-item"><span class="label">Privacy Contact</span><span class="val">{meta['contact']}</span></div>
    </div>
  </div>
</section>

<!-- ============ MAIN CONTENT LAYOUT ============ -->
<div class="container">
  <div class="terms-layout">
    
    <!-- SIDEBAR TOC -->
    <aside class="terms-sidebar">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8b85b4; margin-bottom: 12px; letter-spacing: 0.8px;">Table of Contents</div>
      <nav class="toc-menu" id="toc-menu">
"""

for sec in sections:
    sec_id = sec['id']
    stitle = sec['title']
    html_content += f"""        <a class="toc-link" href="#{sec_id}">{stitle}</a>\n"""

html_content += """      </nav>
    </aside>

    <!-- CONTENT BODY -->
    <main>
      <div class="search-box">
        <div style="position: relative;">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="terms-search" placeholder="Search privacy topics (e.g. data collection, cookies, GDPR, rights, security)..." />
        </div>
      </div>

      <div id="terms-content">
"""

for sec in sections:
    sec_id = sec['id']
    stitle = sec['title']
    html_content += f"""
        <div class="section-card" id="{sec_id}">
          <div class="section-title">
            <span>{stitle}</span>
          </div>
          <div class="section-body">
"""
    if 'subsections' in sec and sec['subsections']:
        for sub in sec['subsections']:
            sub_clean = sub.replace('<', '&lt;').replace('>', '&gt;')
            html_content += f"""            <div class="subsection-text">{sub_clean}</div>\n"""
    else:
        content_clean = sec['content'].replace('<', '&lt;').replace('>', '&gt;')
        html_content += f"""            <div class="subsection-text">{content_clean}</div>\n"""

    html_content += """          </div>
        </div>
"""

html_content += f"""
      </div>
    </main>
  </div>
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
        <a href="{meta['pdfFile']}" download>Download Privacy PDF</a>
        <a href="#">Risk Disclosure</a>
      </div>
    </div>
  </div>
</footer>

<script>
  // Live search functionality
  const searchInput = document.getElementById('terms-search');
  const sections = document.querySelectorAll('.section-card');

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

  // TOC active state highlighting
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
"""

with open('privacy.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('privacy.html generated successfully!')
