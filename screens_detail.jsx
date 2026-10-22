/* ============================================================================
   LineUp — Screens B: Player detail, Pick ticket, My Team
   ============================================================================ */
(function () {
  const { useState, useMemo } = React;
  const { fmtINR, fmtPct, fmtNum, fmtSigned, ROLES, TEAMS } = window.LU;
  const { Icon, Avatar, AreaChart, Sparkline, Delta, RoleDot } = window.UI;

  const Stat = ({ label, value, sub }) => (
    <div style={{ flex: 1 }}>
      <div className="label" style={{ fontSize: 10.5, marginBottom: 3 }}>{label}</div>
      <div className="num" style={{ fontWeight: 800, fontSize: 14.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1 }}>{sub}</div>}
    </div>
  );

  /* ===================== PLAYER DETAIL ===================== */
  function PlayerDetail({ app, params }) {
    const p = app.byId[params.id];
    const [range, setRange] = useState('1D');
    const up = p.change >= 0;
    const watched = app.watchlist.includes(p.id);
    const hold = app.holdings.find((h) => h.pid === p.id);
    const team = TEAMS[p.team];

    const series = useMemo(() => {
      const seeds = { '1H': 71, '1D': p.id.length + 90, '1W': 140, '1M': 210, 'Series': 320 };
      const n = { '1H': 24, '1D': 32, '1W': 28, '1M': 30, 'Series': 26 }[range];
      const drift = (p.change / 100) * p.price / (range === '1H' ? 60 : 30);
      const s = window.LU.genSeries(seeds[range] + p.price, n, drift, p.price * (range === '1H' ? 0.01 : 0.022), p.price * 0.97);
      const gLast = s[s.length - 1], delta = p.price - gLast;
      return s.map((v, i) => +(v + delta * (i / (s.length - 1))).toFixed(2));
    }, [range, p.id]);

    // recent form (synthetic last 6 innings scores)
    const form = useMemo(() => {
      const r = window.LU.seeded(p.id.length * 37 + 11);
      return Array.from({ length: 6 }, () => Math.round(r() * (p.role === 'BWL' ? 4 : 90)));
    }, [p.id]);
    const formMax = Math.max(...form, 1);

    return (
      <div className="screen" style={{ paddingBottom: 96 }}>
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div className="row" style={{ flex: 1, gap: 10, minWidth: 0 }}>
            <Avatar player={p} size={34} />
            <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.short}</div><div className="muted" style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name} · {ROLES[p.role].label}</div></div>
          </div>
          <button className="icon-btn ghost" onClick={() => app.go('share')}><Icon name="share" size={18} /></button>
          <button className="icon-btn ghost" onClick={() => app.toggleWatch(p.id)} style={{ color: watched ? 'var(--warn)' : 'var(--text)' }}><Icon name="star" size={19} fill={watched ? 'currentColor' : 'none'} /></button>
        </div>

        <div className="viewport">
          {/* player value */}
          <div className="screen-pad fade-up" style={{ marginTop: 4 }}>
            {p.playing && <span className="chip" style={{ background: 'var(--down-bg)', color: 'var(--live)', marginBottom: 8 }}><span className="live-dot" /> In play · batting</span>}
            <div className="num" style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em' }}>{fmtINR(p.price)}</div>
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <Delta value={p.change} abs={p.changeAbs} pill size={13.5} />
              <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Today</span>
            </div>
          </div>

          {/* chart */}
          <div style={{ marginTop: 14, padding: '0 4px' }}><AreaChart data={series} up={up} h={188} key={range} markers={range === '1D' || range === '1H' ? window.LU.chartMarkers(p) : []} /></div>
          {(range === '1D' || range === '1H') && window.LU.chartMarkers(p).length > 0 && (
            <div className="screen-pad" style={{ marginTop: 6 }}>
              <div className="row" style={{ gap: 14, justifyContent: 'center' }}>
                <span className="row" style={{ gap: 5 }}><span style={{ width: 14, height: 14, borderRadius: 7, background: 'var(--up)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 8, fontWeight: 800 }} className="num">4</span><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Boundary</span></span>
                <span className="row" style={{ gap: 5 }}><span style={{ width: 14, height: 14, borderRadius: 7, background: 'var(--brand-2)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 8, fontWeight: 800 }} className="num">W</span><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Wicket</span></span>
                <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>= live performance</span>
              </div>
            </div>
          )}
          <div className="screen-pad" style={{ marginTop: 8 }}>
            <div className="seg">
              {['1H', '1D', '1W', '1M', 'Series'].map((r) => <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>)}
            </div>
          </div>

          {/* day stats */}
          <div className="screen-pad" style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 16, display: 'flex', gap: 8 }}>
              <Stat label="Open" value={fmtINR(p.dayOpen)} />
              <Stat label="High" value={fmtINR(p.dayHigh)} />
              <Stat label="Low" value={fmtINR(p.dayLow)} />
              <Stat label="Activity" value={'₹' + fmtNum(p.volume * 1e5)} />
            </div>
          </div>

          {/* this match stats */}
          <div className="screen-pad" style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 16 }}>
              <div className="row-between" style={{ marginBottom: 14 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap' }}>{p.playing ? 'This match' : 'Last match'}</span>
                  {p.playing && <span className="chip" style={{ height: 22, background: 'var(--down-bg)', color: 'var(--live)' }}><span className="live-dot" /> Live</span>}
                </div>
                <span className="num muted" style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>vs AUS · Chennai</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Stat label="Runs" value={p.stats.runs + ' (' + p.stats.balls + ')'} />
                <Stat label="Wickets" value={p.stats.isBowl ? p.stats.wickets + '/' + p.stats.conceded : '—'} />
                <Stat label="Catches" value={p.stats.catches} />
                <Stat label={p.stats.isBowl && !p.stats.isBat ? 'Econ' : 'SR'} value={p.stats.isBowl && !p.stats.isBat ? p.stats.econ : p.stats.sr} />
              </div>
              {(p.stats.fours > 0 || p.stats.sixes > 0 || p.stats.milestones.length > 0) && (
                <div className="row" style={{ gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                  {p.stats.fours > 0 && <span className="chip" style={{ height: 24, background: 'var(--surface-3)' }}>{p.stats.fours} fours</span>}
                  {p.stats.sixes > 0 && <span className="chip" style={{ height: 24, background: 'var(--surface-3)' }}>{p.stats.sixes} sixes</span>}
                  {p.stats.milestones.map((ms) => <span key={ms} className="chip" style={{ height: 24, background: 'var(--up-bg)', color: 'var(--up)' }}>⭐ {ms.includes('W') ? ms.replace('W', ' wkts') : ms + ' runs'}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* performance index */}
          <div className="screen-pad" style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 16 }}>
              <div className="row-between" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 8 }}><Icon name="bolt" size={18} style={{ color: 'var(--brand-2)' }} /><span style={{ fontWeight: 800, fontSize: 14.5 }}>Performance index</span></div>
                <span className="chip" style={{ background: p.idx >= 1 ? 'var(--up-bg)' : 'var(--down-bg)', color: p.idx >= 1 ? 'var(--up)' : 'var(--down)' }}>×{p.idx.toFixed(2)}</span>
              </div>
              <div className="meter" style={{ marginBottom: 6 }}><i style={{ width: ((p.idx - 0.8) / 0.4 * 100) + '%', background: p.idx >= 1 ? 'var(--up)' : 'var(--down)' }} /></div>
              <div className="row-between"><span className="muted" style={{ fontSize: 11 }}>0.80×</span><span className="muted" style={{ fontSize: 11 }}>1.20×</span></div>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div className="label" style={{ marginBottom: 10 }}>Driven by performance</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {window.LU.priceDrivers(p).map((d) => (
                  <div key={d.k} className="row" style={{ gap: 10 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--brand-soft)', color: 'var(--brand-2)' }}><Icon name={d.ic} size={16} /></span>
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{d.k}</span>
                    <span className="num" style={{ fontWeight: 800, fontSize: 13 }}>{d.v}</span>
                    <span className="delta-pill up" style={{ minWidth: 52, justifyContent: 'center' }}>+{d.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 12, marginBottom: 0 }}>Player value = base (fan demand) × performance index, recalculated live from runs, wickets &amp; catches. Capped per match to keep play fair.</p>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div className="label" style={{ marginBottom: 10 }}>Recent form · last 6</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 56 }}>
                {form.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span className="num" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)' }}>{v}{p.role === 'BWL' ? 'w' : ''}</span>
                    <div style={{ width: '100%', height: (v / formMax * 38) + 6, borderRadius: 5, background: v / formMax > 0.6 ? 'var(--up)' : v / formMax > 0.3 ? 'var(--brand-2)' : 'var(--surface-3)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* what's driving it (if playing) */}
          {p.playing && (
            <div className="screen-pad" style={{ marginTop: 18 }}>
              <div className="card" style={{ padding: 16 }}>
                <div className="row-between" style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>What's driving it</span>
                  <button className="row" style={{ gap: 3, color: 'var(--brand-2)', fontSize: 12.5, fontWeight: 700 }} onClick={() => app.go('live')}>Live match <Icon name="chevR" size={15} /></button>
                </div>
                {window.LU.match.timeline.filter((e) => e.t === p.id).slice(0, 3).map((e, i) => (
                  <div key={i} className="row" style={{ gap: 10, padding: '8px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                    <span className="num" style={{ width: 34, fontWeight: 800, fontSize: 12, color: 'var(--text-3)' }}>{e.o}</span>
                    <span style={{ width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, background: e.r === 'W' ? 'var(--down-bg)' : e.big ? 'var(--up-bg)' : 'var(--surface-3)', color: e.r === 'W' ? 'var(--down)' : e.big ? 'var(--up)' : 'var(--text)' }}>{e.r}</span>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{e.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* your pick */}
          {hold && (() => { const pl = app.holdingPL(hold); return (
            <div className="screen-pad" style={{ marginTop: 18 }}>
              <div className="label" style={{ marginBottom: 10 }}>Your pick</div>
              <div className="card" style={{ padding: 16 }}>
                <div className="row-between">
                  <span className="chip" style={{ background: hold.side === 'long' ? 'var(--up-bg)' : 'var(--down-bg)', color: hold.side === 'long' ? 'var(--up)' : 'var(--down)' }}>{hold.side === 'long' ? 'BACK' : 'FADE'} · {hold.horizon}{hold.horizon === 'Over' && hold.entryBall ? ' · ball ' + hold.entryBall : ''}</span>
                  <Delta value={pl.pct} pill />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Stat label="Units" value={(+hold.qty).toFixed(hold.qty < 1 ? 3 : 2)} />
                  <Stat label="Avg entry" value={fmtINR(hold.avg)} />
                  <Stat label="Result" value={fmtSigned(pl.abs)} />
                </div>
                <button className="btn btn-outline btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => app.go('trade', { id: p.id, close: hold })}>Release / edit pick</button>
              </div>
            </div>
          ); })()}

          <div style={{ height: 20 }} />
        </div>

        {/* sticky pick bar */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 18px calc(14px)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, zIndex: 40 }}>
          <button className="btn btn-down" style={{ flex: 1 }} onClick={() => app.go('trade', { id: p.id, side: 'short' })}>Fade</button>
          <button className="btn btn-up" style={{ flex: 1 }} onClick={() => app.go('trade', { id: p.id, side: 'long' })}>Back</button>
        </div>
      </div>
    );
  }

  /* ===================== PICK TICKET ===================== */
  const HORIZONS = [
    { k: 'Over', d: 'Seconds–minutes · per over/ball', ic: 'bolt' },
    { k: 'Match', d: 'Within the match · auto-settles at end', ic: 'clock' },
    { k: 'Series', d: 'Days–weeks · Test matches', ic: 'swap' },
    { k: 'Season', d: 'Weeks–months · full tournament', ic: 'trophy' },
  ];
  function TradeTicket({ app, params }) {
    const p = app.byId[params.id];
    const [side, setSide] = useState(params.side || (params.close ? params.close.side : 'long'));
    const [horizon, setHorizon] = useState(params.close ? params.close.horizon : (params.horizon || (p.playing ? 'Match' : 'Season')));
    const [orderType, setOrderType] = useState('market');
    const [limit, setLimit] = useState(p.price.toFixed(0));
    const closing = !!params.close;
    const [amount, setAmount] = useState(closing ? Math.max(10, Math.round(params.close.qty * p.price)) : 500);

    const price = orderType === 'limit' ? (+limit || p.price) : p.price;
    const amt = +amount || 0;
    const units = amt / price;
    const fee = amt * 0.002;
    const margin = side === 'short' ? amt * 0.25 : 0;
    const need = side === 'short' ? margin + fee : amt + fee;
    const bal = app.wallet.available;
    const pct = Math.min(100, Math.round(need / bal * 100));
    const belowMin = amt < 10;
    const insufficient = need > bal || belowMin;

    return (
      <div className="screen" style={{ paddingBottom: 96 }}>
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div className="row" style={{ flex: 1, gap: 10, minWidth: 0 }}><Avatar player={p} size={34} /><div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{closing ? 'Release' : 'Play'} {p.short}</div><div className="num muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{fmtINR(p.price)} · {fmtPct(p.change)}</div></div></div>
        </div>

        <div className="viewport" style={{ overflow: 'auto' }}>
          <div className="screen-pad" style={{ marginTop: 6 }}>
            {/* back/fade */}
            <div className="ls-toggle">
              <button className={'ls-btn' + (side === 'long' ? ' on-long' : '')} onClick={() => setSide('long')}>
                <span className="row" style={{ gap: 6 }}><Icon name="arrowUR" size={18} stroke={2.4} /> Back</span>
                <small>Gain if value rises</small>
              </button>
              <button className={'ls-btn' + (side === 'short' ? ' on-short' : '')} onClick={() => setSide('short')}>
                <span className="row" style={{ gap: 6 }}><Icon name="arrowDR" size={18} stroke={2.4} /> Fade</span>
                <small>Gain if value drops</small>
              </button>
            </div>

            {/* game format */}
            <div className="label" style={{ margin: '20px 0 10px' }}>Game format</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {HORIZONS.map((h) => (
                <button key={h.k} className="card tap" style={{ padding: 12, textAlign: 'left', border: horizon === h.k ? '1.5px solid var(--brand-2)' : '1px solid var(--border)', background: horizon === h.k ? 'var(--brand-soft)' : 'var(--surface)' }} onClick={() => setHorizon(h.k)}>
                  <div className="row-between"><Icon name={h.ic} size={17} style={{ color: 'var(--brand-2)' }} />{horizon === h.k && <Icon name="check" size={16} style={{ color: 'var(--brand-2)' }} stroke={3} />}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginTop: 8 }}>{h.k}</div>
                  <div className="muted" style={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.35, marginTop: 2 }}>{h.d}</div>
                </button>
              ))}
            </div>
            {horizon === 'Over' && (
              <div className="card" style={{ padding: '11px 13px', marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--brand-soft)', border: '1px solid var(--border-2)' }}>
                <span className="live-dot" />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 12.5 }}>Entry at ball {window.LU.match.ball}</div><div className="muted" style={{ fontSize: 10.5, fontWeight: 600 }}>Over picks are stamped to the live ball &amp; settle per over</div></div>
                <span className="num chip" style={{ background: 'var(--surface)', color: 'var(--brand-2)', height: 26 }}>Over {window.LU.match.ball}</span>
              </div>
            )}

            {/* pick type */}
            <div className="row" style={{ gap: 8, marginTop: 20 }}>
              <div className="seg" style={{ flex: 1 }}>
                {['market', 'limit'].map((o) => <button key={o} className={orderType === o ? 'on' : ''} onClick={() => setOrderType(o)} >{o === 'market' ? 'Instant' : 'Target value'}</button>)}
              </div>
            </div>
            {orderType === 'limit' && (
              <div style={{ marginTop: 10 }}>
                <div className="label" style={{ marginBottom: 6 }}>Target value</div>
                <div className="row" style={{ gap: 8 }}>
                  <div className="field" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}><span className="muted" style={{ fontWeight: 800 }}>₹</span><input className="num" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)', fontWeight: 800, fontSize: 16, width: '100%' }} /></div>
                </div>
              </div>
            )}

            {/* amount */}
            <div className="row-between" style={{ margin: '20px 0 10px' }}><span className="label">{closing ? 'Release' : 'Entry amount'}</span><span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>Balance {fmtINR(bal)}</span></div>
            <div className="card" style={{ padding: 16 }}>
              <div className="row" style={{ gap: 4, alignItems: 'center' }}>
                <span className="num" style={{ fontWeight: 800, fontSize: 30, color: belowMin ? 'var(--down)' : 'var(--text)' }}>₹</span>
                <input className="num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric"
                  style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', color: belowMin ? 'var(--down)' : 'var(--text)', fontWeight: 800, fontSize: 30 }} />
              </div>
              <div className="row-between" style={{ marginTop: 4 }}>
                <span className="muted num" style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>≈ {units.toFixed(units < 1 ? 3 : 2)} units</span>
                <span className="muted num" style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>@ {fmtINR(price)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {[100, 500, 1000, 5000].map((n) => <button key={n} className="btn-sm" style={{ flex: 1, borderRadius: 10, background: amt === n ? 'var(--brand)' : 'var(--surface-3)', color: amt === n ? '#fff' : 'var(--text-2)', fontWeight: 800, fontSize: 12.5, height: 36 }} onClick={() => setAmount('' + n)}>₹{n >= 1000 ? (n / 1000) + 'K' : n}</button>)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {[['Min ₹10', 10], ['25%', Math.floor(bal * 0.25)], ['50%', Math.floor(bal * 0.5)], ['Max', Math.floor(side === 'short' ? bal / 0.252 : bal / 1.002)]].map(([l, v]) => <button key={l} className="btn-sm" style={{ flex: 1, borderRadius: 10, background: 'var(--surface-3)', color: 'var(--text-2)', fontWeight: 700, fontSize: 11.5, height: 32 }} onClick={() => setAmount('' + v)}>{l}</button>)}
              </div>
            </div>
            <p className="muted row" style={{ fontSize: 11.5, marginTop: 8, gap: 6 }}><Icon name="info" size={14} style={{ flexShrink: 0, color: belowMin ? 'var(--down)' : 'var(--brand-2)' }} />{belowMin ? 'Minimum entry is ₹10.' : `Enter with any amount from ₹10 — you'll hold ${units.toFixed(units < 1 ? 3 : 2)} player units.`}</p>

            {/* summary */}
            <div className="card" style={{ padding: 16, marginTop: 12 }}>
              {[['Pick type', orderType === 'market' ? 'Instant' : 'Target @ ' + fmtINR(+limit || p.price)], ['Est. player value', fmtINR(price)], ['Entry amount', fmtINR(amt)], ['≈ Units', units.toFixed(units < 1 ? 3 : 2)], ['Platform fee (0.2%)', fmtINR(fee)]].map(([l, v], i) => (
                <div key={i} className="row-between" style={{ padding: '5px 0' }}><span className="muted" style={{ fontSize: 13 }}>{l}</span><span className="num" style={{ fontWeight: 700, fontSize: 13.5 }}>{v}</span></div>
              ))}
              {side === 'short' && <div className="row-between" style={{ padding: '5px 0' }}><span className="muted" style={{ fontSize: 13 }}>Fade deposit (25%)</span><span className="num" style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--warn)' }}>{fmtINR(margin)}</span></div>}
              <div className="divider" style={{ margin: '8px 0' }} />
              <div className="row-between"><span style={{ fontWeight: 800, fontSize: 14.5 }}>{side === 'short' ? 'Deposit required' : 'Total payable'}</span><span className="num" style={{ fontWeight: 800, fontSize: 16 }}>{fmtINR(need)}</span></div>
              <div className="row-between" style={{ marginTop: 8 }}><span className="muted" style={{ fontSize: 12 }}>Wallet used</span><span className="muted num" style={{ fontSize: 12, fontWeight: 700 }}>{pct}% of {fmtINR(bal)}</span></div>
              <div className="meter" style={{ marginTop: 6 }}><i style={{ width: pct + '%', background: insufficient ? 'var(--down)' : 'var(--brand-2)' }} /></div>
            </div>
            {side === 'short' && <p className="muted row" style={{ fontSize: 11.5, marginTop: 10, gap: 6, lineHeight: 1.4 }}><Icon name="info" size={15} style={{ flexShrink: 0, color: 'var(--warn)' }} /> Fade picks gain when a player's value drops, but carry risk if the player outperforms. A circuit breaker caps daily value changes at ±20%.</p>}
            <div style={{ height: 12 }} />
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 18px calc(14px)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid var(--border)', zIndex: 40 }}>
          <button className={'btn btn-block ' + (side === 'long' ? 'btn-up' : 'btn-down')} disabled={insufficient}
            onClick={() => app.executeTrade({ pid: p.id, side, amount: amt, qty: units, horizon, price, closing, entryBall: horizon === 'Over' ? window.LU.match.ball : null })}>
            {belowMin ? 'Enter at least ₹10' : insufficient ? 'Insufficient balance' : `${closing ? 'Release' : side === 'long' ? 'Back' : 'Fade'} ${p.short} · ${fmtINR(need)}`}
          </button>
        </div>
      </div>
    );
  }

  /* ===================== MY TEAM ===================== */
  function Portfolio({ app }) {
    const [view, setView] = useState('positions');
    const [hz, setHz] = useState('All');
    const HZ = window.LU.HZ;
    const t = app.portfolioTotals();
    const sorted = [...app.holdings].filter((h) => hz === 'All' || h.horizon === hz).sort((a, b) => app.holdingPL(b).abs - app.holdingPL(a).abs);
    // split by game format
    const alloc = useMemo(() => {
      const m = {};
      app.holdings.forEach((h) => { const v = app.byId[h.pid].price * h.qty; m[h.horizon] = (m[h.horizon] || 0) + v; });
      const tot = Object.values(m).reduce((s, v) => s + v, 0) || 1;
      const colors = { Over: '#E0863A', Match: '#5B4BD6', Series: '#3A86E0', Season: '#1FAA6E' };
      return Object.entries(m).map(([k, v]) => ({ k, v, pct: v / tot * 100, c: colors[k] || '#888' })).sort((a, b) => b.v - a.v);
    }, [app.holdings, app.players]);

    return (
      <div className="screen screen-scroll">
        <div className="appbar"><div style={{ flex: 1 }}><h1>My Team</h1><div className="sub">{app.holdings.length} active picks</div></div>
          <button className="icon-btn" onClick={() => app.go('history')}><Icon name="history" size={20} /></button></div>

        {/* summary */}
        <div className="screen-pad">
          <div className="card" style={{ padding: 18 }}>
            <div className="row-between"><span className="label">Team value</span><span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Entered {fmtINR(t.invested)}</span></div>
            <div className="num" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 4 }}>{app.hideBalance ? '₹ • • • •' : fmtINR(t.value)}</div>
            <div className="row" style={{ gap: 10, marginTop: 8 }}>
              <Delta value={t.totalPct} pill /><span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{app.hideBalance ? '••••' : fmtSigned(t.totalPL)} all-time</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <div className="card flat" style={{ flex: 1, padding: 12, background: 'var(--surface-2)', border: 'none' }}><div className="label" style={{ fontSize: 10 }}>Today's result</div><div className="num" style={{ fontWeight: 800, fontSize: 15, marginTop: 3, color: t.dayPL >= 0 ? 'var(--up)' : 'var(--down)' }}>{fmtSigned(t.dayPL)}</div></div>
              <div className="card flat" style={{ flex: 1, padding: 12, background: 'var(--surface-2)', border: 'none' }}><div className="label" style={{ fontSize: 10 }}>Wallet balance</div><div className="num" style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{fmtINR(app.wallet.available)}</div></div>
            </div>
          </div>
        </div>

        {/* allocation */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Team split by format</div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {alloc.map((a) => <div key={a.k} style={{ width: a.pct + '%', background: a.c }} />)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginTop: 14 }}>
              {alloc.map((a) => (
                <div key={a.k} className="row" style={{ gap: 7 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: a.c }} /><span style={{ fontWeight: 700, fontSize: 12.5 }}>{a.k}</span><span className="muted num" style={{ fontSize: 12, fontWeight: 700 }}>{a.pct.toFixed(0)}%</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* picks */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="seg" style={{ marginBottom: 14 }}>
            {[['positions', 'Active picks'], ['closed', 'Released']].map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}
          </div>
          {view === 'positions' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="pill-tabs" style={{ marginBottom: 2 }}>
                {['All', 'Over', 'Match', 'Series', 'Season'].map((k) => (
                  <button key={k} className={'pill-tab' + (hz === k ? ' on' : '')} onClick={() => setHz(k)} style={hz === k && k !== 'All' ? { background: HZ[k].c, borderColor: HZ[k].c } : undefined}>
                    {k !== 'All' && <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, marginRight: 6, background: hz === k ? '#fff' : HZ[k].c, verticalAlign: 'middle' }} />}{k}
                  </button>
                ))}
              </div>
              {sorted.map((h) => { const p = app.byId[h.pid]; const pl = app.holdingPL(h); const hc = HZ[h.horizon] || {}; return (
                <button key={h.pid} className="card tap" style={{ padding: 14, textAlign: 'left' }} onClick={() => app.go('player', { id: p.id })}>
                  <div className="row" style={{ gap: 12 }}>
                    <Avatar player={p} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 6 }}><span style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap' }}>{p.short}</span><span className="chip" style={{ height: 20, fontSize: 10, padding: '0 7px', background: h.side === 'long' ? 'var(--up-bg)' : 'var(--down-bg)', color: h.side === 'long' ? 'var(--up)' : 'var(--down)' }}>{h.side === 'long' ? 'BACK' : 'FADE'}</span></div>
                      <div className="row" style={{ gap: 6, marginTop: 5 }}>
                        <span className="chip" style={{ height: 21, fontSize: 10.5, padding: '0 8px', background: hc.c + '22', color: hc.c }}><span style={{ width: 6, height: 6, borderRadius: 2, background: hc.c }} />{h.horizon}</span>
                        <span className="muted" style={{ fontSize: 10.5, fontWeight: 700 }}>{h.horizon === 'Over' && h.entryBall ? 'Entry ball ' + h.entryBall : hc.tag}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 800, fontSize: 14.5 }}>{fmtINR(p.price * h.qty)}</div>
                      <div style={{ marginTop: 2 }}><Delta value={pl.pct} /></div>
                    </div>
                  </div>
                  <div className="divider" style={{ margin: '12px 0 10px' }} />
                  <div className="row-between">
                    <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Entry {fmtINR(h.avg * h.qty)} · {(+h.qty).toFixed(h.qty < 1 ? 3 : 2)} units</span>
                    <span className="num" style={{ fontWeight: 800, fontSize: 13.5, color: pl.abs >= 0 ? 'var(--up)' : 'var(--down)' }}>{fmtSigned(pl.abs)}</span>
                  </div>
                </button>
              ); })}
              {sorted.length === 0 && <div className="card" style={{ padding: 40, textAlign: 'center' }}><div className="muted">{hz === 'All' ? 'No active picks yet.' : `No ${hz} picks.`}</div><button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => app.setTab('market')}>Explore players</button></div>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {app.closed.length === 0 && <div className="card" style={{ padding: 36, textAlign: 'center' }} ><div className="muted">No released picks in this session.</div></div>}
              {app.closed.map((c, i) => { const p = app.byId[c.pid]; return (
                <div key={i} className="card" style={{ padding: 14 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <Avatar player={p} size={40} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{p.short}</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Released {c.side === 'long' ? 'back' : 'fade'} · {(+c.qty).toFixed(c.qty < 1 ? 3 : 2)} units</div></div>
                    <span className="num" style={{ fontWeight: 800, fontSize: 14, color: c.pl >= 0 ? 'var(--up)' : 'var(--down)' }}>{fmtSigned(c.pl)}</span>
                  </div>
                </div>
              ); })}
            </div>
          )}
        </div>
      </div>
    );
  }

  window.SCR_B = { PlayerDetail, TradeTicket, Portfolio };
})();
