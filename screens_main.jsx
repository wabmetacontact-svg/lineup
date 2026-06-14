/* ============================================================================
   LineUp — Screens A: Onboarding/Login, Home, Market
   ============================================================================ */
(function () {
  const { useState, useMemo } = React;
  const { fmtINR, fmtPct, fmtNum, ROLES } = window.LU;
  const { Icon, LogoMark, Wordmark, Avatar, Sparkline, AreaChart, Delta, RoleDot, PlayerRow } = window.UI;

  const HScroll = ({ children, gap = 12, pad = 18 }) => (
    <div style={{ display: 'flex', gap, overflowX: 'auto', padding: `2px ${pad}px 2px`, scrollbarWidth: 'none', margin: `0 -${pad}px` }}>{children}</div>
  );

  /* ===================== ONBOARDING / LOGIN ===================== */
  function Onboarding({ app }) {
    const [step, setStep] = useState(0); // 0 welcome, 1 login
    const movers = app.players.slice(0, 3);
    return (
      <div className="screen" style={{ background: 'linear-gradient(170deg, #1C1542 0%, #0C0820 60%)', color: '#fff', minHeight: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 26px 26px' }}>
          {step === 0 ? (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div className="fade-up" style={{ marginBottom: 26 }}><LogoMark size={68} /></div>
                <h1 className="fade-up" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.04em', margin: 0 }}>
                  Trade cricket<br />like the <span style={{ color: '#8B7BF5' }}>stock market.</span>
                </h1>
                <p className="fade-up muted" style={{ fontSize: 16, lineHeight: 1.5, marginTop: 16, color: '#B8B2DC', maxWidth: 300 }}>
                  Buy, sell &amp; short your favourite players. Prices move live with every run, wicket and over.
                </p>
                <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 28 }}>
                  {movers.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 10 }}>
                      <Avatar player={p} size={38} />
                      <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{p.short}</span>
                      <Sparkline data={p.series} up={p.change >= 0} w={56} h={24} />
                      <span className="num" style={{ fontWeight: 800, fontSize: 13 }}>{fmtINR(p.price)}</span>
                      <span style={{ color: p.change >= 0 ? '#29D49A' : '#FF5B7C', fontWeight: 800, fontSize: 12.5, minWidth: 54, textAlign: 'right' }}>{fmtPct(p.change)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn btn-block" style={{ background: '#fff', color: '#1A1633' }} onClick={() => setStep(1)}>
                  Get started <Icon name="arrowUR" size={18} stroke={2.4} />
                </button>
                <button className="btn btn-block" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} onClick={() => setStep(1)}>I already have an account</button>
              </div>
            </>
          ) : (
            <>
              <button className="back-btn" style={{ background: 'rgba(255,255,255,.08)', boxShadow: 'none', color: '#fff', marginTop: 6 }} onClick={() => setStep(0)}><Icon name="chevL" size={22} /></button>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <LogoMark size={52} />
                <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 22, marginBottom: 6 }}>Welcome back</h1>
                <p className="muted" style={{ color: '#B8B2DC', fontSize: 15, marginBottom: 26 }}>Log in to your LineUp account</p>
                <label className="label" style={{ color: '#9088c4', marginBottom: 8, display: 'block' }}>Mobile number</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div className="field" style={{ width: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.12)', color: '#fff' }}>🇮🇳 +91</div>
                  <input className="field" placeholder="98765 43210" inputMode="numeric" style={{ flex: 1, background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.12)', color: '#fff' }} />
                </div>
                <button className="btn btn-block btn-primary" onClick={() => app.login()}>Continue <Icon name="arrowUR" size={18} stroke={2.4} /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
                  <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.12)' }} /><span className="muted" style={{ color: '#8880b4', fontSize: 12.5 }}>or continue with</span><span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.12)' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Google', 'Apple', 'Email'].map((s) => (
                    <button key={s} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 13.5 }} onClick={() => app.login()}>{s}</button>
                  ))}
                </div>
              </div>
              <p className="muted" style={{ color: '#7d76a8', fontSize: 11.5, textAlign: 'center', lineHeight: 1.5 }}>By continuing you agree to LineUp's Terms &amp; our Risk Disclosure. Trading involves risk of loss.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ===================== HOME ===================== */
  function Home({ app }) {
    const totals = app.portfolioTotals();
    const movers = useMemo(() => [...app.players].sort((a, b) => b.change - a.change), [app.players]);
    const gainers = movers.slice(0, 6);
    const heldIds = app.holdings.map((h) => h.pid);
    const held = app.holdings.slice(0, 4);
    const m = window.LU.match;
    return (
      <div className="screen screen-scroll stagger">
        {/* header */}
        <div className="appbar" style={{ paddingTop: 6 }}>
          <LogoMark size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>Good evening,</div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', marginTop: -1 }}>{app.user.name.split(' ')[0]} 👋</div>
          </div>
          <button className="icon-btn" onClick={() => app.go('search')}><Icon name="search" size={20} /></button>
          <button className="icon-btn" onClick={() => app.go('notifications')} style={{ position: 'relative' }}>
            <Icon name="bell" size={20} /><span style={{ position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, background: 'var(--down)', border: '2px solid var(--surface)' }} />
          </button>
        </div>

        {/* portfolio value card */}
        <div className="screen-pad">
          <div className="card" style={{ padding: 18, background: 'linear-gradient(155deg, var(--brand) 0%, #2A2160 100%)', border: 'none', color: '#fff', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
            <div className="row-between">
              <span style={{ fontSize: 13, color: '#D6D0F5', fontWeight: 600 }}>Portfolio value</span>
              <button onClick={() => app.setHideBalance(!app.hideBalance)} style={{ color: '#D6D0F5', display: 'grid', placeItems: 'center' }}><Icon name={app.hideBalance ? 'eyeOff' : 'eye'} size={18} /></button>
            </div>
            <div className="num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 4 }}>
              {app.hideBalance ? '₹ • • • • •' : fmtINR(totals.value)}
            </div>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <span className="delta-pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>
                <Icon name={totals.dayPL >= 0 ? 'arrowUR' : 'arrowDR'} size={13} stroke={2.4} />{fmtPct(totals.dayPct)}
              </span>
              <span style={{ fontSize: 13, color: '#D6D0F5', fontWeight: 600 }}>{app.hideBalance ? '••••' : window.LU.fmtSigned(totals.dayPL)} today</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-sm" style={{ flex: 1, background: '#fff', color: 'var(--brand)', height: 44 }} onClick={() => app.go('addfunds')}><Icon name="plus" size={17} stroke={2.6} /> Add funds</button>
              <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(255,255,255,.14)', color: '#fff', height: 44 }} onClick={() => app.setTab('portfolio')}><Icon name="layers" size={17} /> Holdings</button>
            </div>
          </div>
        </div>

        {/* live match strip */}
        <div className="screen-pad" style={{ marginTop: 16 }}>
          <button className="card tap" style={{ width: '100%', padding: 14, textAlign: 'left', display: 'block' }} onClick={() => app.go('live')}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="chip" style={{ background: 'var(--down-bg)', color: 'var(--live)' }}><span className="live-dot" /> LIVE</span>
              <span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{m.series.split('·')[0]}</span>
            </div>
            <div className="row-between">
              <div className="row" style={{ gap: 10 }}>
                <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: 'linear-gradient(150deg,#2A6FDB,#1B4F9E)', borderRadius: 11 }}>IND</div>
                <div><div style={{ fontWeight: 800, fontSize: 15 }} className="num">{m.teamA.score}/{m.teamA.wkts}</div><div className="muted" style={{ fontSize: 11 }}>{m.teamA.overs} ov · batting</div></div>
              </div>
              <span className="muted" style={{ fontWeight: 800, fontSize: 12 }}>vs</span>
              <div className="row" style={{ gap: 10 }}>
                <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap' }} className="num">Target {m.teamB.target}</div><div className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>2nd innings</div></div>
                <div className="avatar" style={{ width: 34, height: 34, fontSize: 11, background: 'linear-gradient(150deg,#1FAA6E,#127a4c)', borderRadius: 11 }}>AUS</div>
              </div>
            </div>
            <div className="divider" style={{ margin: '12px 0 10px' }} />
            <div className="row-between"><span style={{ fontSize: 12.5, color: 'var(--brand-2)', fontWeight: 700 }}>⚡ 6 players trading live</span><span className="row" style={{ gap: 4, color: 'var(--text-2)', fontSize: 12.5, fontWeight: 700 }}>Open match<Icon name="chevR" size={15} /></span></div>
          </button>
        </div>

        {/* your positions */}
        <div className="screen-pad" style={{ marginTop: 20 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <span className="section-title">Your positions</span>
            <button className="muted" style={{ fontSize: 13, fontWeight: 700 }} onClick={() => app.setTab('portfolio')}>See all</button>
          </div>
        </div>
        <HScroll>
          {held.map((h) => { const p = app.byId[h.pid]; const pl = app.holdingPL(h); return (
            <button key={h.pid} className="card tap" style={{ minWidth: 158, padding: 13, textAlign: 'left' }} onClick={() => app.go('player', { id: p.id })}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <Avatar player={p} size={38} />
                <span className="chip" style={{ height: 22, fontSize: 10.5, background: h.side === 'long' ? 'var(--up-bg)' : 'var(--down-bg)', color: h.side === 'long' ? 'var(--up)' : 'var(--down)' }}>{h.side === 'long' ? 'BUY' : 'SELL'}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.short}</div>
              <div className="muted" style={{ fontSize: 11, fontWeight: 600, marginTop: 1 }}>{fmtINR(h.avg * h.qty, 0)} · {h.horizon}</div>
              <div className="num" style={{ fontWeight: 800, fontSize: 16, marginTop: 8 }}>{fmtINR(p.price)}</div>
              <div style={{ marginTop: 2 }}><Delta value={pl.pct} /></div>
            </button>
          ); })}
          <button className="card tap flat" style={{ minWidth: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--brand-2)', background: 'var(--brand-soft)', border: '1px dashed var(--border-2)' }} onClick={() => app.setTab('market')}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface)', display: 'grid', placeItems: 'center' }}><Icon name="plus" size={20} stroke={2.4} /></span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>Trade more</span>
          </button>
        </HScroll>

        {/* top gainers */}
        <div className="screen-pad" style={{ marginTop: 22 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <span className="section-title">🔥 Trending now</span>
            <button className="muted" style={{ fontSize: 13, fontWeight: 700 }} onClick={() => app.setTab('market')}>Market</button>
          </div>
        </div>
        <HScroll>
          {gainers.map((p) => (
            <button key={p.id} className="card tap" style={{ minWidth: 170, padding: 14, textAlign: 'left' }} onClick={() => app.go('player', { id: p.id })}>
              <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                <Avatar player={p} size={40} />
                <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.short}</div><div style={{ marginTop: 2 }}><RoleDot role={p.role} /></div></div>
              </div>
              <Sparkline data={p.series} up={p.change >= 0} w={142} h={40} />
              <div className="row-between" style={{ marginTop: 10 }}>
                <span className="num" style={{ fontWeight: 800, fontSize: 15 }}>{fmtINR(p.price)}</span>
                <Delta value={p.change} pill />
              </div>
            </button>
          ))}
        </HScroll>

        {/* watchlist */}
        <div className="screen-pad" style={{ marginTop: 22 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <span className="section-title">👁 Watchlist</span>
            <button className="muted" style={{ fontSize: 13, fontWeight: 700 }} onClick={() => app.setTab('market')}>Edit</button>
          </div>
          <div className="card" style={{ overflow: 'hidden', marginTop: 8 }}>
            {app.watchlist.slice(0, 5).map((id, i) => { const p = app.byId[id]; return (
              <div key={id}>
                {i > 0 && <div className="divider" style={{ marginLeft: 70 }} />}
                <PlayerRow player={p} onOpen={(pl) => app.go('player', { id: pl.id })} />
              </div>
            ); })}
          </div>
        </div>

        <p className="screen-pad muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 18, lineHeight: 1.5 }}>Prices are simulated for demo. Player tokens are synthetic — value tracks live performance. Trading involves risk.</p>
      </div>
    );
  }

  /* ===================== MARKET ===================== */
  function Market({ app }) {
    const [tag, setTag] = useState('All');
    const [sort, setSort] = useState('change');
    const [q, setQ] = useState('');
    const tags = window.LU.trendingTags;
    let list = app.players;
    if (tag === 'Live now') list = list.filter((p) => p.playing);
    else if (tag === 'Top gainers') list = [...list].sort((a, b) => b.change - a.change);
    else if (tag === 'Top losers') list = [...list].sort((a, b) => a.change - b.change);
    else if (tag === 'Batters') list = list.filter((p) => p.role === 'BAT');
    else if (tag === 'Bowlers') list = list.filter((p) => p.role === 'BWL');
    else if (tag === 'All-rounders') list = list.filter((p) => p.role === 'AR' || p.role === 'WK');
    else if (tag === 'Watchlist') list = list.filter((p) => app.watchlist.includes(p.id));
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (tag === 'All' || tag === 'Watchlist') {
      list = [...list].sort((a, b) => sort === 'change' ? b.change - a.change : sort === 'price' ? b.price - a.price : b.volume - a.volume);
    }
    const idx = useMemo(() => { const a = app.players.reduce((s, p) => s + p.change, 0) / app.players.length; return a; }, [app.players]);

    return (
      <div className="screen screen-scroll">
        <div className="appbar">
          <div style={{ flex: 1 }}><h1>Market</h1><div className="sub">{app.players.length} players · LineUp Index {idx >= 0 ? '+' : ''}{idx.toFixed(2)}%</div></div>
          <button className="icon-btn" onClick={() => app.go('leaderboard')}><Icon name="trophy" size={20} /></button>
        </div>
        <div className="screen-pad">
          <button className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', textAlign: 'left' }} onClick={() => app.go('search')}>
            <Icon name="search" size={19} /> Search players, teams…
          </button>
        </div>
        <div className="screen-pad" style={{ marginTop: 14 }}>
          <div className="pill-tabs">
            {tags.map((t) => <button key={t} className={'pill-tab' + (tag === t ? ' on' : '')} onClick={() => setTag(t)}>{t === 'Live now' ? '🔴 Live now' : t}</button>)}
          </div>
        </div>
        {/* market index banner */}
        <div className="screen-pad" style={{ marginTop: 14 }}>
          <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 13, background: idx >= 0 ? 'var(--up-bg)' : 'var(--down-bg)', color: idx >= 0 ? 'var(--up)' : 'var(--down)', display: 'grid', placeItems: 'center' }}><Icon name="trend" size={20} /></span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>LineUp Index</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Avg of all player tokens</div></div>
            <div style={{ textAlign: 'right' }}><div className="num" style={{ fontWeight: 800, fontSize: 15 }}>{(100 + idx * 4).toFixed(2)}</div><Delta value={idx} /></div>
          </div>
        </div>
        {/* sort */}
        <div className="screen-pad" style={{ marginTop: 16, marginBottom: 6 }}>
          <div className="row-between">
            <span className="label">{list.length} players</span>
            <div className="seg" style={{ width: 196 }}>
              {[['change', 'Movers'], ['price', 'Price'], ['volume', 'Volume']].map(([k, l]) => <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{l}</button>)}
            </div>
          </div>
        </div>
        <div className="screen-pad">
          <div className="card" style={{ overflow: 'hidden' }}>
            {list.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="divider" style={{ marginLeft: 70 }} />}
                <PlayerRow player={p} onOpen={(pl) => app.go('player', { id: pl.id })} />
              </div>
            ))}
            {list.length === 0 && <div style={{ padding: 40, textAlign: 'center' }} className="muted">No players match this filter.</div>}
          </div>
        </div>
      </div>
    );
  }

  window.SCR_A = { Onboarding, Home, Market, HScroll };
})();
