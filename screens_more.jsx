/* ============================================================================
   LineUp — Screens C: Live match, Leaderboard, Wallet, Add funds,
            Profile/Settings, Search, Notifications, History
   ============================================================================ */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { fmtINR, fmtPct, fmtNum, fmtSigned, ROLES, TEAMS, statLine } = window.LU;
  const { Icon, Avatar, PersonAvatar, Sparkline, Delta, RoleDot, PlayerRow, LogoMark, Wordmark } = window.UI;

  /* ===================== LIVE MATCH ===================== */
  const BALLS = ['0', '1', '2', '4', '6', '1', '0', 'W', '1', '4', '2', '0'];
  const IMPF = { '6': 0.006, '4': 0.004, 'W': 0.007, '2': 0.0016, '1': 0.0009, '0': 0.0005 };
  function LiveMatch({ app }) {
    const m = window.LU.match;
    const livePlayers = app.players.filter((p) => p.playing);
    const [feed, setFeed] = useState(m.timeline.slice().reverse());
    const [tab, setTab] = useState('trade');
    const overRef = useRef({ o: 17, b: 2 });

    useEffect(() => {
      const id = setInterval(() => {
        const r = BALLS[Math.floor(Math.random() * BALLS.length)];
        overRef.current.b += 1; if (overRef.current.b > 6) { overRef.current.o += 1; overRef.current.b = 1; }
        const pl = livePlayers[Math.floor(Math.random() * livePlayers.length)];
        const txts = { '6': 'SIX! launched into the crowd', '4': 'FOUR! finds the boundary', 'W': 'WICKET! huge moment', '0': 'dot ball, good length', '1': 'single taken', '2': 'two runs, good running' };
        const imp = +(pl.price * (IMPF[r] || 0.001)).toFixed(2);
        setFeed((f) => [{ o: overRef.current.o + '.' + overRef.current.b, r, t: pl.id, txt: pl.short + ' — ' + (txts[r] || r + ' runs'), big: r === '6', wkt: r === 'W', imp, up: r !== '0', _new: true }, ...f].slice(0, 20));
      }, 3500);
      return () => clearInterval(id);
    }, []);

    const SquadTeam = ({ code }) => {
      const sq = m.squads[code]; const team = TEAMS[code];
      return (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
          <div className="row" style={{ gap: 10, padding: '12px 14px', background: 'var(--surface-2)' }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 10, borderRadius: 10, background: `linear-gradient(150deg,${team.c1},${team.c2})` }}>{code}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{team.name}</div><div className="muted" style={{ fontSize: 10.5, fontWeight: 700 }}>Playing XI · {sq.listed.length} tradable</div></div>
            <span className="chip" style={{ height: 22, background: 'var(--up-bg)', color: 'var(--up)' }}>{code === m.teamA.code ? 'Batting' : 'Bowling'}</span>
          </div>
          {sq.listed.map((id, i) => { const p = app.byId[id]; return (
            <div key={id} className="row" style={{ gap: 11, padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
              <Avatar player={p} size={36} showFlag={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 6 }}><span style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>{p.short}</span>{m.striker === id && <span style={{ fontSize: 12 }}>🏏</span>}{m.bowler === id && <span style={{ fontSize: 11 }}>⚡</span>}</div>
                <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, marginTop: 1 }}>{ROLES[p.role].label} · {statLine(p)}</div>
              </div>
              <div style={{ textAlign: 'right' }}><div className="num" style={{ fontWeight: 800, fontSize: 13 }}>{fmtINR(p.price)}</div><Delta value={p.change} /></div>
              <button className="btn-sm btn-up" style={{ height: 34, borderRadius: 11, padding: '0 12px', fontSize: 12.5 }} onClick={() => app.go('trade', { id, side: 'long', horizon: 'Scalp' })}>Trade</button>
            </div>
          ); })}
          <div className="row" style={{ gap: 8, padding: '10px 14px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <span className="muted" style={{ fontSize: 10.5, fontWeight: 800 }}>NOT LISTED</span>
            {sq.bench.map((n) => <span key={n} className="chip" style={{ height: 22, fontSize: 10.5, background: 'var(--surface-3)', color: 'var(--text-3)' }}>{n}</span>)}
          </div>
        </div>
      );
    };

    return (
      <div className="screen screen-scroll">
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div style={{ flex: 1, minWidth: 0 }}><div className="row" style={{ gap: 7 }}><span className="live-dot" /><span style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap' }}>Live Match</span></div><div className="muted" style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.venue}</div></div>
          <button className="icon-btn ghost"><Icon name="refresh" size={18} /></button>
        </div>

        {/* scoreboard */}
        <div className="screen-pad">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 16, background: 'linear-gradient(150deg, var(--brand) 0%, #2A2160 100%)', color: '#fff' }}>
              <div className="row-between" style={{ marginBottom: 14 }}>
                <span className="chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}><span className="live-dot" /> LIVE</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#D6D0F5' }}>{m.series}</span>
              </div>
              <div className="row-between">
                <div className="row" style={{ gap: 11 }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 13, background: 'rgba(255,255,255,.16)', borderRadius: 13 }}>IND</div>
                  <div><div className="num" style={{ fontWeight: 800, fontSize: 22 }}>{m.teamA.score}/{m.teamA.wkts}</div><div style={{ fontSize: 11.5, color: '#D6D0F5', fontWeight: 600 }}>{m.teamA.overs} overs</div></div>
                </div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10.5, color: '#D6D0F5', fontWeight: 700 }}>TARGET</div><div className="num" style={{ fontWeight: 800, fontSize: 20 }}>{m.teamB.target}</div></div>
                <div className="row" style={{ gap: 11 }}>
                  <div><div className="num" style={{ fontWeight: 800, fontSize: 22, textAlign: 'right', opacity: .6 }}>{m.teamB.score}/{m.teamB.wkts}</div><div style={{ fontSize: 11.5, color: '#D6D0F5', fontWeight: 600, textAlign: 'right' }}>2nd inns</div></div>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 12, background: 'rgba(255,255,255,.16)', borderRadius: 13 }}>AUS</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', padding: 12 }}>
              {[['CRR', m.crr.toFixed(2)], ['This over', feed.slice(0, 6).reverse().map((f) => f.r).join(' ')], ['Need', (m.teamB.target - m.teamA.score) + ' off 16']].map(([l, v], i) => (
                <div key={i} style={{ flex: i === 1 ? 1.4 : 1, textAlign: 'center', borderLeft: i ? '1px solid var(--border)' : 'none' }}>
                  <div className="label" style={{ fontSize: 9.5 }}>{l}</div><div className="num" style={{ fontWeight: 800, fontSize: 13, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="screen-pad" style={{ marginTop: 14 }}>
          <div className="pill-tabs">
            {[['trade', '⚡ Trade'], ['scorecard', 'Scorecard'], ['series', 'Series'], ['squads', 'Squads'], ['balls', 'Ball by ball']].map(([k, l]) => <button key={k} className={'pill-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}
          </div>
        </div>

        {tab === 'trade' && (
          <div className="screen-pad" style={{ marginTop: 14 }}>
            <div className="card" style={{ padding: '11px 14px', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--brand-soft)', border: '1px solid var(--border-2)', marginBottom: 12 }}>
              <Icon name="bolt" size={18} style={{ color: 'var(--brand-2)' }} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>Tap any player to trade live — invest from just ₹10.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {livePlayers.map((p) => (
                <div key={p.id} className="card" style={{ padding: 12 }}>
                  <div className="row" style={{ gap: 11 }}>
                    <Avatar player={p} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }} onClick={() => app.go('player', { id: p.id })}>
                      <div className="row" style={{ gap: 6 }}><span style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>{p.short}</span>{m.striker === p.id && <span className="chip" style={{ height: 19, fontSize: 9.5, padding: '0 6px', background: 'var(--brand-soft)', color: 'var(--brand-2)' }}>ON STRIKE</span>}{m.bowler === p.id && <span className="chip" style={{ height: 19, fontSize: 9.5, padding: '0 6px', background: 'var(--surface-3)', color: 'var(--text-2)' }}>BOWLING</span>}</div>
                      <div className="num" key={p.tick} style={{ fontWeight: 800, fontSize: 14, marginTop: 2, animation: 'fadeIn .3s' }}>{fmtINR(p.price)} <span style={{ fontSize: 11.5 }}><Delta value={p.change} /></span></div>
                      <div className="num muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{m.bowler === p.id ? '🎯 ' + statLine(p) : '🏏 ' + statLine(p)} · {ROLES[p.role].short}</div>
                    </div>
                    <Sparkline data={p.series} up={p.change >= 0} w={48} h={28} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn-sm btn-up" style={{ flex: 1, height: 38 }} onClick={() => app.go('trade', { id: p.id, side: 'long', horizon: 'Scalp' })}>Buy</button>
                    <button className="btn-sm btn-down" style={{ flex: 1, height: 38 }} onClick={() => app.go('trade', { id: p.id, side: 'short', horizon: 'Scalp' })}>Sell</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'squads' && (
          <div className="screen-pad" style={{ marginTop: 14 }}>
            <SquadTeam code="IND" />
            <SquadTeam code="AUS" />
          </div>
        )}

        {tab === 'scorecard' && (
          <div className="screen-pad" style={{ marginTop: 14 }}>
            <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
              <div className="row-between" style={{ padding: '12px 14px', background: 'var(--surface-2)' }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap' }}>🇮🇳 India · Batting</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 800 }}>{m.teamA.score}/{m.teamA.wkts} <span className="muted" style={{ fontSize: 11 }}>({m.teamA.overs})</span></span>
              </div>
              <div className="row" style={{ padding: '7px 14px', background: 'var(--surface-2)' }}>
                <span className="label" style={{ flex: 1, fontSize: 9.5 }}>Batter</span>
                {[['R', 38], ['B', 32], ['4s', 30], ['6s', 30], ['SR', 50]].map(([h, w]) => <span key={h} className="label" style={{ width: w, textAlign: 'right', fontSize: 9.5 }}>{h}</span>)}
              </div>
              {m.batCard.map((b) => { const p = app.byId[b.pid]; const s = p.stats; return (
                <button key={b.pid} className="row tap" style={{ width: '100%', padding: '10px 14px', borderTop: '1px solid var(--border)', textAlign: 'left' }} onClick={() => app.go('player', { id: b.pid })}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}><span style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>{p.short}</span>{b.strike && <span className="live-dot" style={{ width: 6, height: 6 }} />}</div>
                    <div className="muted" style={{ fontSize: 10.5, fontWeight: 600 }}>{b.how}</div>
                  </div>
                  <span className="num" style={{ width: 38, textAlign: 'right', fontWeight: 800, fontSize: 13 }}>{s.runs}</span>
                  <span className="num muted" style={{ width: 32, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.balls}</span>
                  <span className="num muted" style={{ width: 30, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.fours}</span>
                  <span className="num muted" style={{ width: 30, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.sixes}</span>
                  <span className="num muted" style={{ width: 50, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.sr}</span>
                </button>
              ); })}
              <div className="row" style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                <span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>Extras {m.extras} · Last wicket {m.fow}</span>
              </div>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="row-between" style={{ padding: '12px 14px', background: 'var(--surface-2)' }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap' }}>🇦🇺 Australia · Bowling</span>
              </div>
              <div className="row" style={{ padding: '7px 14px', background: 'var(--surface-2)' }}>
                <span className="label" style={{ flex: 1, fontSize: 9.5 }}>Bowler</span>
                {[['O', 42], ['R', 36], ['W', 30], ['Econ', 50]].map(([h, w]) => <span key={h} className="label" style={{ width: w, textAlign: 'right', fontSize: 9.5 }}>{h}</span>)}
              </div>
              {m.bowlCard.map((id) => { const p = app.byId[id]; const s = p.stats; return (
                <button key={id} className="row tap" style={{ width: '100%', padding: '10px 14px', borderTop: '1px solid var(--border)', textAlign: 'left' }} onClick={() => app.go('player', { id })}>
                  <span style={{ flex: 1, fontWeight: 800, fontSize: 13 }}>{p.short}{m.bowler === id && <span className="live-dot" style={{ width: 6, height: 6, marginLeft: 7, display: 'inline-block', verticalAlign: 'middle' }} />}</span>
                  <span className="num muted" style={{ width: 42, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.overs}</span>
                  <span className="num muted" style={{ width: 36, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.conceded}</span>
                  <span className="num" style={{ width: 30, textAlign: 'right', fontSize: 13, fontWeight: 800, color: 'var(--up)' }}>{s.wickets}</span>
                  <span className="num muted" style={{ width: 50, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.econ}</span>
                </button>
              ); })}
            </div>
            <p className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>Live runs, wickets &amp; catches feed each player's performance index — and their token price.</p>
          </div>
        )}

        {tab === 'series' && (
          <div className="screen-pad" style={{ marginTop: 14 }}>
            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{m.tournament.name}</div>
              <div className="row" style={{ gap: 8, marginTop: 8 }}><span className="chip" style={{ background: 'var(--up-bg)', color: 'var(--up)' }}>🏆 {m.tournament.lead}</span></div>
            </div>
            <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
              <div className="label" style={{ padding: '12px 14px 4px' }}>Series standings</div>
              <div className="row" style={{ padding: '6px 14px' }}>
                <span className="label" style={{ flex: 1, fontSize: 9.5 }}>Team</span>
                {[['P', 32], ['W', 32], ['L', 32], ['Pts', 36], ['NRR', 52]].map(([h, w]) => <span key={h} className="label" style={{ width: w, textAlign: 'right', fontSize: 9.5 }}>{h}</span>)}
              </div>
              {m.tournament.standings.map((s, i) => { const team = TEAMS[s.team]; return (
                <div key={s.team} className="row" style={{ padding: '11px 14px', borderTop: '1px solid var(--border)' }}>
                  <div className="row" style={{ flex: 1, gap: 9, minWidth: 0 }}>
                    <span className="num" style={{ width: 12, fontWeight: 800, color: 'var(--text-3)', fontSize: 12 }}>{i + 1}</span>
                    <div className="avatar" style={{ width: 26, height: 26, fontSize: 9, borderRadius: 8, background: `linear-gradient(150deg,${team.c1},${team.c2})` }}>{s.team}</div>
                    <span style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>{team.name}</span>
                  </div>
                  <span className="num muted" style={{ width: 32, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.p}</span>
                  <span className="num" style={{ width: 32, textAlign: 'right', fontSize: 13, fontWeight: 800, color: 'var(--up)' }}>{s.w}</span>
                  <span className="num muted" style={{ width: 32, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{s.l}</span>
                  <span className="num" style={{ width: 36, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{s.pts}</span>
                  <span className="num muted" style={{ width: 52, textAlign: 'right', fontSize: 11.5, fontWeight: 700 }}>{s.nrr}</span>
                </div>
              ); })}
            </div>
            <div className="label" style={{ marginBottom: 10 }}>Fixtures &amp; results</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {m.tournament.fixtures.map((f) => (
                <div key={f.n} className="card" style={{ padding: 13, display: 'flex', alignItems: 'center', gap: 12, border: f.live ? '1.5px solid var(--live)' : '1px solid var(--border)' }}>
                  <div className="num" style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', background: f.live ? 'var(--down-bg)' : f.win ? 'var(--up-bg)' : 'var(--surface-3)', color: f.live ? 'var(--live)' : f.win ? 'var(--up)' : 'var(--text-3)', fontWeight: 800, fontSize: 12 }}>M{f.n}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}><span style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>IND vs AUS</span>{f.live && <span className="chip" style={{ height: 19, fontSize: 9.5, padding: '0 6px', background: 'var(--down-bg)', color: 'var(--live)' }}><span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE</span>}</div>
                    <div className="muted" style={{ fontSize: 11, fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.venue}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: f.win ? 'var(--up)' : f.live ? 'var(--live)' : 'var(--text-2)' }}>{f.win ? f.win + ' won' : f.live ? 'In play' : 'Upcoming'}</div>
                    <div className="muted" style={{ fontSize: 10.5, fontWeight: 600 }}>{f.win ? f.res.replace('India won by ', 'by ') : f.live ? 'India batting' : f.res}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'balls' && (
          <div className="screen-pad" style={{ marginTop: 14 }}>
            <div className="row-between" style={{ marginBottom: 10 }}><span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Every ball moves prices · tap to trade</span><span className="live-dot" /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {feed.map((e, i) => { const pl = app.byId[e.t]; return (
                <button key={e.o + '-' + i} className={'card tap ' + (e._new ? (e.up ? 'flash-up' : 'flash-down') : '')} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }} onClick={() => app.go('trade', { id: e.t, side: e.up ? 'long' : 'short', horizon: 'Scalp' })}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-num)', background: e.r === 'W' ? 'var(--down)' : e.big ? 'var(--up)' : e.r === '4' ? 'var(--up-bg)' : 'var(--surface-3)', color: e.r === 'W' || e.big ? '#fff' : e.r === '4' ? 'var(--up)' : 'var(--text)' }}>{e.r}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.txt}</div>
                    <div className="row" style={{ gap: 6, marginTop: 2 }}>
                      <span className="num" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)' }}>Over {e.o}</span>
                      {pl && <span className="num" style={{ fontSize: 11, fontWeight: 800, color: e.up ? 'var(--up)' : 'var(--down)' }}>{pl.short} {e.up ? '+' : '−'}{fmtINR(e.imp || 1)}</span>}
                    </div>
                  </div>
                  <span className="chip" style={{ height: 28, background: e.up ? 'var(--up-bg)' : 'var(--down-bg)', color: e.up ? 'var(--up)' : 'var(--down)', flexShrink: 0 }}><Icon name="bolt" size={13} /> Trade</span>
                </button>
              ); })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ===================== LEADERBOARD ===================== */
  function Leaderboard({ app }) {
    const [period, setPeriod] = useState('Week');
    const L = window.LU.leaders;
    const top3 = L.slice(0, 3);
    const podOrder = [top3[1], top3[0], top3[2]];
    const you = L.find((l) => l.you);
    return (
      <div className="screen screen-scroll">
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 17 }}>Leaderboard</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Top traders by return</div></div>
          <button className="icon-btn ghost"><Icon name="info" size={18} /></button>
        </div>
        <div className="screen-pad" style={{ marginTop: 4 }}>
          <div className="seg">{['Day', 'Week', 'Season', 'All-time'].map((x) => <button key={x} className={period === x ? 'on' : ''} onClick={() => setPeriod(x)}>{x}</button>)}</div>
        </div>

        {/* podium */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
            {podOrder.map((p, i) => { const place = p.rank; const h = place === 1 ? 108 : place === 2 ? 84 : 70; return (
              <div key={p.handle} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <PersonAvatar color={p.av} label={p.name[0]} size={place === 1 ? 58 : 48} />
                  <span style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 22, height: 22, borderRadius: 11, background: place === 1 ? '#F5B324' : place === 2 ? '#B8BFCB' : '#C98A4B', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11, border: '2px solid var(--bg)' }}>{place}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 12.5, marginTop: 6, textAlign: 'center' }}>{p.name.split(' ')[0]}</div>
                <div className="num" style={{ fontWeight: 800, fontSize: 13, color: 'var(--up)' }}>+{p.ret.toFixed(0)}%</div>
                <div style={{ width: '100%', height: h, marginTop: 8, borderRadius: '14px 14px 0 0', background: place === 1 ? 'linear-gradient(var(--brand-2), var(--brand))' : 'var(--surface-3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10 }}>
                  {place === 1 && <Icon name="trophy" size={22} style={{ color: '#fff' }} />}
                </div>
              </div>
            ); })}
          </div>
        </div>

        {/* list */}
        <div className="screen-pad" style={{ marginTop: 8 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            {L.map((p, i) => (
              <div key={p.handle}>
                {i > 0 && <div className="divider" style={{ marginLeft: 64 }} />}
                <div className="row" style={{ gap: 12, padding: '12px 14px', background: p.you ? 'var(--brand-soft)' : 'transparent' }}>
                  <span className="num" style={{ width: 22, fontWeight: 800, fontSize: 14, color: p.rank <= 3 ? 'var(--warn)' : 'var(--text-3)', textAlign: 'center' }}>{p.rank}</span>
                  <PersonAvatar color={p.av} label={p.name[0]} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}{p.you && <span style={{ color: 'var(--brand-2)' }}> · You</span>}</div><div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{p.handle} · {fmtINR(p.val, 0)}</div></div>
                  <span className="num" style={{ fontWeight: 800, fontSize: 14, color: 'var(--up)' }}>+{p.ret.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="screen-pad" style={{ marginTop: 14 }}>
          <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--brand-soft)', border: '1px solid var(--border-2)' }}>
            <Icon name="trophy" size={22} style={{ color: 'var(--brand-2)' }} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13 }}>You're #{you.rank} this {period.toLowerCase()}</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Climb 1 rank to reach the top 5</div></div>
            <button className="btn btn-primary btn-sm" onClick={() => app.setTab('market')}>Trade</button>
          </div>
        </div>
      </div>
    );
  }

  /* ===================== WALLET ===================== */
  function Wallet({ app }) {
    const w = app.wallet;
    const t = app.portfolioTotals();
    const icons = { long: 'arrowUR', short: 'arrowDR', deposit: 'plus', settle: 'check' };
    return (
      <div className="screen screen-scroll">
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 17 }}>Wallet</div>
          <button className="icon-btn ghost" onClick={() => app.go('history')}><Icon name="history" size={18} /></button>
        </div>
        <div className="screen-pad">
          <div className="card" style={{ padding: 18, background: 'linear-gradient(150deg,#1C1542,#0C0820)', color: '#fff', border: 'none' }}>
            <span style={{ fontSize: 13, color: '#B8B2DC', fontWeight: 600 }}>Available balance</span>
            <div className="num" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 4 }}>{fmtINR(w.available)}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-sm" style={{ flex: 1, height: 44, background: '#fff', color: 'var(--brand)' }} onClick={() => app.go('addfunds')}><Icon name="plus" size={17} stroke={2.6} /> Add funds</button>
              <button className="btn btn-sm" style={{ flex: 1, height: 44, background: 'rgba(255,255,255,.14)', color: '#fff' }} onClick={() => app.toast('Withdrawal request sent', 'check')}><Icon name="bank" size={17} /> Withdraw</button>
            </div>
          </div>
        </div>
        <div className="screen-pad" style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="card" style={{ flex: 1, padding: 14 }}><div className="label" style={{ fontSize: 10 }}>Invested</div><div className="num" style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{fmtINR(t.invested)}</div></div>
            <div className="card" style={{ flex: 1, padding: 14 }}><div className="label" style={{ fontSize: 10 }}>In positions</div><div className="num" style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{fmtINR(t.value)}</div></div>
          </div>
        </div>
        <div className="screen-pad" style={{ marginTop: 20 }}>
          <span className="section-title">Recent activity</span>
          <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
            {w.tx.map((tx, i) => (
              <div key={tx.id}>
                {i > 0 && <div className="divider" style={{ marginLeft: 62 }} />}
                <div className="row" style={{ gap: 12, padding: '13px 14px' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', background: tx.amt >= 0 ? 'var(--up-bg)' : 'var(--surface-3)', color: tx.amt >= 0 ? 'var(--up)' : 'var(--text-2)' }}><Icon name={icons[tx.icon] || 'coins'} size={18} stroke={2.2} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.label}</div><div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{tx.t}</div></div>
                  <span className="num" style={{ fontWeight: 800, fontSize: 14, color: tx.amt >= 0 ? 'var(--up)' : 'var(--text)' }}>{fmtSigned(tx.amt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== ADD FUNDS ===================== */
  function AddFunds({ app }) {
    const [amt, setAmt] = useState('5000');
    const [method, setMethod] = useState('upi');
    const methods = [['upi', 'UPI', 'upi', 'Instant · GPay, PhonePe, Paytm'], ['card', 'Card', 'card', 'Visa, Mastercard, RuPay'], ['bank', 'Net banking', 'bank', 'All major banks']];
    const val = +amt || 0;
    return (
      <div className="screen" style={{ paddingBottom: 96 }}>
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 17 }}>Add funds</div>
        </div>
        <div className="viewport" style={{ overflow: 'auto' }}>
          <div className="screen-pad" style={{ marginTop: 10 }}>
            <div className="label" style={{ marginBottom: 10, textAlign: 'center' }}>Enter amount</div>
            <div className="num" style={{ textAlign: 'center', fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em' }}>₹{val.toLocaleString('en-IN')}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
              {[1000, 5000, 10000, 25000].map((n) => <button key={n} className="btn-sm" style={{ borderRadius: 11, padding: '0 14px', height: 38, background: val === n ? 'var(--brand)' : 'var(--surface-3)', color: val === n ? '#fff' : 'var(--text-2)', fontWeight: 800, fontSize: 13 }} onClick={() => setAmt('' + n)}>₹{(n / 1000) + 'K'}</button>)}
            </div>
            <div className="label" style={{ margin: '24px 0 10px' }}>Payment method</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {methods.map(([k, label, ic, sub]) => (
                <button key={k} className="card tap" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: method === k ? '1.5px solid var(--brand-2)' : '1px solid var(--border)' }} onClick={() => setMethod(k)}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-soft)', color: 'var(--brand-2)', display: 'grid', placeItems: 'center' }}><Icon name={ic} size={20} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{label}</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{sub}</div></div>
                  <span style={{ width: 22, height: 22, borderRadius: 11, border: method === k ? '7px solid var(--brand-2)' : '2px solid var(--border-2)' }} />
                </button>
              ))}
            </div>
            <div style={{ height: 12 }} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 18px calc(14px)', background: 'var(--nav-bg)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid var(--border)', zIndex: 40 }}>
          <button className="btn btn-primary btn-block" disabled={val < 100} onClick={() => app.addFunds(val)}>Add {fmtINR(val, 0)}</button>
        </div>
      </div>
    );
  }

  /* ===================== PROFILE / SETTINGS ===================== */
  function Profile({ app }) {
    const u = app.user;
    const t = app.portfolioTotals();
    const Toggle = ({ on, onChange }) => (
      <button onClick={onChange} style={{ width: 48, height: 28, borderRadius: 14, background: on ? 'var(--brand-2)' : 'var(--border-2)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: 11, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
      </button>
    );
    const Item = ({ icon, label, sub, right, onClick, danger }) => (
      <div className="row" style={{ width: '100%', gap: 13, padding: '13px 14px', textAlign: 'left', cursor: 'pointer' }} onClick={onClick} role="button">
        <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center', background: danger ? 'var(--down-bg)' : 'var(--surface-3)', color: danger ? 'var(--down)' : 'var(--text-2)' }}><Icon name={icon} size={18} /></span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: danger ? 'var(--down)' : 'var(--text)' }}>{label}</div>{sub && <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{sub}</div>}</div>
        {right !== undefined ? right : <Icon name="chevR" size={18} style={{ color: 'var(--text-3)' }} />}
      </div>
    );

    return (
      <div className="screen screen-scroll">
        <div className="appbar"><div style={{ flex: 1 }}><h1>Profile</h1></div>
          <button className="icon-btn" onClick={() => app.go('settings')}><Icon name="settings" size={20} /></button></div>

        {/* user card */}
        <div className="screen-pad">
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ gap: 14 }}>
              <PersonAvatar color={u.av} label={u.name[0]} size={58} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 7 }}><span style={{ fontWeight: 800, fontSize: 18, whiteSpace: 'nowrap' }}>{u.name}</span>{u.kyc && <Icon name="check" size={16} style={{ color: '#fff', background: 'var(--up)', borderRadius: 8, padding: 2 }} stroke={3} />}</div>
                <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{u.handle} · {u.tier}</div>
              </div>
              <button className="btn-sm btn-outline" style={{ borderRadius: 11, padding: '0 14px', height: 36, fontWeight: 700, fontSize: 13 }} onClick={() => app.toast('Edit profile', 'profile')}>Edit</button>
            </div>
            <div style={{ display: 'flex', marginTop: 16 }}>
              {[['Total return', '+' + t.totalPct.toFixed(0) + '%', 'var(--up)'], ['Win rate', '68%', 'var(--text)'], ['Rank', '#6', 'var(--brand-2)']].map(([l, v, c], i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i ? '1px solid var(--border)' : 'none' }}>
                  <div className="num" style={{ fontWeight: 800, fontSize: 18, color: c }}>{v}</div><div className="label" style={{ fontSize: 9.5, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* appearance */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Appearance</div>
          <div className="card" style={{ padding: 6 }}>
            <div className="row" style={{ gap: 13, padding: '10px 12px' }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--surface-3)', color: 'var(--text-2)' }}><Icon name={app.theme === 'dark' ? 'moon' : 'sun'} size={18} /></span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>Theme</div><div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Switch light / dark</div></div>
            </div>
            <div className="seg" style={{ margin: '0 10px 10px' }}>
              {[['light', '☀ Light'], ['dark', '🌙 Dark']].map(([k, l]) => <button key={k} className={app.theme === k ? 'on' : ''} onClick={() => app.setTheme(k)}>{l}</button>)}
            </div>
          </div>
        </div>

        {/* account */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Account</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <Item icon="wallet" label="Wallet & balance" sub={fmtINR(app.wallet.available) + ' available'} onClick={() => app.go('wallet')} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="shield" label="KYC & verification" sub="Verified" right={<span className="chip" style={{ background: 'var(--up-bg)', color: 'var(--up)' }}>Done</span>} onClick={() => app.toast('KYC verified', 'shield')} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="card" label="Payment methods" sub="2 linked" onClick={() => app.go('addfunds')} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="history" label="Order & trade history" onClick={() => app.go('history')} />
          </div>
        </div>

        {/* prefs */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Preferences</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <Item icon="bell" label="Notifications" right={<Toggle on={app.prefs.notif} onChange={() => app.setPref('notif', !app.prefs.notif)} />} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="eye" label="Hide balances" sub="Mask portfolio value" right={<Toggle on={app.hideBalance} onChange={() => app.setHideBalance(!app.hideBalance)} />} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="bolt" label="Live price alerts" right={<Toggle on={app.prefs.alerts} onChange={() => app.setPref('alerts', !app.prefs.alerts)} />} />
          </div>
        </div>

        {/* support */}
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Support</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <Item icon="headset" label="Help & support" onClick={() => app.toast('Support chat opening…', 'headset')} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="doc" label="Risk disclosure" sub="Trading involves risk of loss" onClick={() => app.toast('Opening risk disclosure', 'doc')} />
            <div className="divider" style={{ marginLeft: 62 }} />
            <Item icon="info" label="About LineUp" sub="v1.0.0" onClick={() => app.toast('LineUp v1.0.0 · Demo', 'info')} />
          </div>
        </div>
        <div className="screen-pad" style={{ marginTop: 18 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <Item icon="logout" label="Log out" danger onClick={() => app.logout()} right={<span />} />
          </div>
        </div>
        <div className="screen-pad" style={{ textAlign: 'center', marginTop: 18 }}><LogoMark size={32} /><div className="muted" style={{ fontSize: 11, marginTop: 8 }}>Made for cricket traders · Demo build</div></div>
      </div>
    );
  }

  /* ===================== SEARCH ===================== */
  function Search({ app }) {
    const [q, setQ] = useState('');
    const res = q ? app.players.filter((p) => (p.name + p.team + ROLES[p.role].label).toLowerCase().includes(q.toLowerCase())) : [];
    const trending = app.players.slice().sort((a, b) => b.volume - a.volume).slice(0, 5);
    return (
      <div className="screen screen-scroll">
        <div className="appbar solid" style={{ background: 'var(--bg)', gap: 10 }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div className="field" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 46 }}>
            <Icon name="search" size={19} style={{ color: 'var(--text-3)' }} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players, teams…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)', fontWeight: 600, fontSize: 15 }} />
            {q && <button onClick={() => setQ('')}><Icon name="x" size={18} style={{ color: 'var(--text-3)' }} /></button>}
          </div>
        </div>
        <div className="screen-pad" style={{ marginTop: 6 }}>
          {!q && <><div className="label" style={{ marginBottom: 10 }}>Trending searches</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>{['Kohli', 'Bumrah', 'Live now', 'Top gainers', 'Maxwell', 'Rashid Khan'].map((s) => <button key={s} className="pill-tab" onClick={() => setQ(s)}>{s}</button>)}</div><div className="label" style={{ marginBottom: 8 }}>Most traded</div></>}
          <div className="card" style={{ overflow: 'hidden' }}>
            {(q ? res : trending).map((p, i) => (<div key={p.id}>{i > 0 && <div className="divider" style={{ marginLeft: 70 }} />}<PlayerRow player={p} onOpen={(pl) => app.go('player', { id: pl.id })} /></div>))}
            {q && res.length === 0 && <div style={{ padding: 40, textAlign: 'center' }} className="muted">No results for "{q}"</div>}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== NOTIFICATIONS ===================== */
  function Notifications({ app }) {
    const items = [
      { ic: 'arrowUR', c: 'up', t: 'V. Kohli is up 3.4% today', s: 'Your buy position is +₹2,850 · 2m ago', new: true },
      { ic: 'bolt', c: 'brand', t: 'SIX! Suryakumar Yadav', s: 'SKY token jumped 1.2% on that hit · 5m ago', new: true },
      { ic: 'arrowDR', c: 'down', t: 'B. Azam dropped below ₹2,200', s: 'Your sell position is in profit +₹700 · 22m ago', new: true },
      { ic: 'clock', c: 'text', t: 'Day position settled', s: 'J. Bumrah · realised +₹1,284 · 3h ago' },
      { ic: 'trophy', c: 'warn', t: 'You climbed to rank #6', s: 'Leaderboard · this week · 5h ago' },
      { ic: 'gift', c: 'brand', t: '₹100 bonus credited', s: 'Welcome reward · Yesterday' },
    ];
    const cmap = { up: ['var(--up-bg)', 'var(--up)'], down: ['var(--down-bg)', 'var(--down)'], brand: ['var(--brand-soft)', 'var(--brand-2)'], warn: ['var(--warn-bg)', 'var(--warn)'], text: ['var(--surface-3)', 'var(--text-2)'] };
    return (
      <div className="screen screen-scroll">
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 17 }}>Notifications</div>
          <button className="muted" style={{ fontSize: 13, fontWeight: 700 }} onClick={() => app.toast('All marked read', 'check')}>Mark read</button>
        </div>
        <div className="screen-pad" style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it, i) => (
              <div key={i} className="card" style={{ padding: 14, display: 'flex', gap: 12, background: it.new ? 'var(--surface)' : 'var(--surface-2)', position: 'relative' }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', background: cmap[it.c][0], color: cmap[it.c][1] }}><Icon name={it.ic} size={19} stroke={2.2} /></span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{it.t}</div><div className="muted" style={{ fontSize: 12, fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}>{it.s}</div></div>
                {it.new && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand-2)', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== HISTORY ===================== */
  function History({ app }) {
    const all = [...app.closed.map((c) => ({ label: (c.side === 'long' ? 'Closed buy' : 'Closed sell') + ' · ' + app.byId[c.pid].short, amt: c.pl, t: 'Just now', icon: c.pl >= 0 ? 'check' : 'arrowDR' })), ...app.wallet.tx.map((tx) => ({ label: tx.label, amt: tx.amt, t: tx.t, icon: { long: 'arrowUR', short: 'arrowDR', deposit: 'plus', settle: 'check' }[tx.icon] || 'coins' }))];
    return (
      <div className="screen screen-scroll">
        <div className="appbar solid" style={{ background: 'var(--bg)' }}>
          <button className="back-btn" onClick={app.back}><Icon name="chevL" size={22} /></button>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 17 }}>History</div>
        </div>
        <div className="screen-pad">
          <div className="card" style={{ overflow: 'hidden' }}>
            {all.map((tx, i) => (
              <div key={i}>{i > 0 && <div className="divider" style={{ marginLeft: 62 }} />}
                <div className="row" style={{ gap: 12, padding: '13px 14px' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', background: tx.amt >= 0 ? 'var(--up-bg)' : 'var(--surface-3)', color: tx.amt >= 0 ? 'var(--up)' : 'var(--text-2)' }}><Icon name={tx.icon} size={18} stroke={2.2} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{tx.label}</div><div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{tx.t}</div></div>
                  <span className="num" style={{ fontWeight: 800, fontSize: 14, color: tx.amt >= 0 ? 'var(--up)' : 'var(--text)' }}>{fmtSigned(tx.amt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  window.SCR_C = { LiveMatch, Leaderboard, Wallet, AddFunds, Profile, Search, Notifications, History };
})();
