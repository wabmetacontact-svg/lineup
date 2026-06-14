/* ============================================================================
   LineUp — Shared UI (icons, logo, charts, primitives, nav)
   Exposed on window. Depends on: React, LU (data).
   ============================================================================ */
(function () {
  const { useState, useRef, useEffect, useMemo } = React;
  const { fmtINR, fmtPct, TEAMS, ROLES } = window.LU;

  /* ---------------- Icons (Lucide-style, stroke = currentColor) -------------- */
  const P = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5',
    market: 'M3 3v18h18M7 15l3-4 3 2 5-7',
    portfolio: 'M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    live: 'M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0M12 12h.01M4 16h16',
    profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    bell: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M9.5 20a2.5 2.5 0 0 0 5 0',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H9.9l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.2l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z',
    arrowUR: 'M7 17 17 7M7 7h10v10',
    arrowDR: 'M7 7l10 10M17 7v10H7',
    trend: 'M3 17 9 11l4 4 8-8M14 7h7v7',
    chevR: 'M9 6l6 6-6 6',
    chevL: 'M15 6l-6 6 6 6',
    chevD: 'M6 9l6 6 6-6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    wallet: 'M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H3V7zM3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM16 13.5h.01',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    eyeOff: 'M3 3l18 18M10.6 10.6a3 3 0 0 0 4 4M9.4 5.2A10 10 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3 3.6M6.2 6.3A18 18 0 0 0 2 12s4 7 10 7a10 10 0 0 0 3-.5',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    trophy: 'M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 16h6M8 21h8M12 14v2',
    star: 'M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z',
    x: 'M6 6l12 12M18 6 6 18',
    check: 'M5 13l4 4L19 7',
    info: 'M12 16v-5M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
    clock: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    bank: 'M4 10h16M5 10l7-5 7 5M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16',
    card: 'M3 6h18v12H3zM3 10h18',
    upi: 'M5 12h14M9 7l-3 5 3 5M15 7l3 5-3 5',
    share: 'M12 3v12M8 7l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6',
    gift: 'M20 8H4v4h16V8zM12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M9 8a2 2 0 1 1 3-2 2 2 0 1 1 3 2',
    history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4M12 8v4l3 2',
    logout: 'M15 17l5-5-5-5M20 12H9M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4',
    fire: 'M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c2 2 2 4 2 5a4 4 0 0 1-8 0c0-4 4-5 4-12z',
    bat: 'M14 4l6 6-9 9-3-3zM7 14l-4 4 3 3 4-4',
    ball: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM6 6l12 12M8 4l8 16',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
    coins: 'M9 13a6 3 0 1 0 0-6 6 3 0 0 0 0 6zM3 7v6c0 1.7 2.7 3 6 3M3 10c0 1.7 2.7 3 6 3M15 8a6 3 0 0 1 6 3v6c0 1.7-2.7 3-6 3s-6-1.3-6-3',
    scan: 'M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16',
    swap: 'M7 4v13M4 14l3 3 3-3M17 20V7M20 10l-3-3-3 3',
    refresh: 'M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5',
    headset: 'M4 14v-2a8 8 0 0 1 16 0v2M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zM20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2zM18 16v1a4 4 0 0 1-4 4h-2',
    lock: 'M6 11h12v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11V8a3 3 0 0 1 6 0v3',
    doc: 'M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M8 13h8M8 17h5',
  };
  function Icon({ name, size = 22, stroke = 2, fill = 'none', style }) {
    const d = P[name] || '';
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
        strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
        {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
      </svg>
    );
  }

  /* ---------------- Logo mark ---------------- */
  function LogoMark({ size = 40, radius }) {
    const r = radius != null ? radius : size * 0.27;
    const uid = useMemo(() => 'lg' + Math.random().toString(36).slice(2, 7), []);
    const bar = (cx, h, k) => {
      const w = 12, y0 = 78 - h, cy = y0 + h / 2;
      return <rect key={k} x={cx - w / 2} y={y0} width={w} height={h} rx={w / 2}
        transform={`rotate(26 ${cx} ${cy})`} fill="#fff" />;
    };
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: r, display: 'block' }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5B4BD6" /><stop offset="1" stopColor="#2E2566" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="27" fill={`url(#${uid})`} />
        {bar(33, 26, 'a')}{bar(49, 40, 'b')}{bar(67, 62, 'c')}
      </svg>
    );
  }
  function Wordmark({ size = 22, color }) {
    return <span style={{ fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', color: color || 'var(--text)' }}>
      Line<span style={{ color: 'var(--brand-2)' }}>Up</span></span>;
  }

  /* ---------------- Status bar ---------------- */
  function StatusBar() {
    const [time, setTime] = useState('9:41');
    useEffect(() => {
      const f = () => { const d = new Date(); setTime(d.getHours() % 12 + ':' + String(d.getMinutes()).padStart(2, '0')); };
      f(); const id = setInterval(f, 10000); return () => clearInterval(id);
    }, []);
    return (
      <div className="statusbar">
        <span className="num" style={{ fontWeight: 700 }}>{time}</span>
        <div className="sb-icons">
          <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor"><rect x="0" y="8" width="3" height="5" rx="1" /><rect x="5" y="5" width="3" height="8" rx="1" /><rect x="10" y="2" width="3" height="11" rx="1" /><rect x="15" y="0" width="3" height="13" rx="1" opacity="1" /></svg>
          <svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor"><path d="M8.5 2.5c2.2 0 4.2.8 5.7 2.2l1.1-1.2A10 10 0 0 0 8.5.8 10 10 0 0 0 1.7 3.5l1.1 1.2A8.2 8.2 0 0 1 8.5 2.5zM8.5 6c1.3 0 2.5.5 3.4 1.3l1.1-1.2A7 7 0 0 0 8.5 4.3a7 7 0 0 0-4.5 1.8l1.1 1.2A5.5 5.5 0 0 1 8.5 6zM8.5 9.5l2-2.1A4 4 0 0 0 8.5 6.7a4 4 0 0 0-2 .7z" /></svg>
          <svg width="25" height="13" viewBox="0 0 25 13" fill="none"><rect x="1" y="1" width="20" height="11" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".4" /><rect x="2.6" y="2.6" width="15" height="7.8" rx="1.6" fill="currentColor" /><rect x="22.5" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5" /></svg>
        </div>
      </div>
    );
  }

  /* ---------------- Avatar ---------------- */
  function Avatar({ player, size = 44, showFlag = true }) {
    const team = TEAMS[player.team] || {};
    const initials = player.short.replace(/[^A-Z]/g, '').slice(0, 2) || player.name[0];
    return (
      <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.34,
        background: `linear-gradient(150deg, ${team.c1}, ${team.c2})`, borderRadius: size * 0.34 }}>
        {initials}
        {showFlag && <span className="flag" style={{ background: team.c2 }}>{team.flag}</span>}
      </div>
    );
  }
  function PersonAvatar({ color, label, size = 44 }) {
    return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36,
      background: `linear-gradient(150deg, ${color}, ${color}99)`, borderRadius: size * 0.32 }}>{label}</div>;
  }

  /* ---------------- Charts ---------------- */
  function chartPath(data, w, h, pad = 4) {
    const min = Math.min(...data), max = Math.max(...data);
    const rng = max - min || 1;
    const dx = w / (data.length - 1);
    return data.map((v, i) => `${i ? 'L' : 'M'}${(i * dx).toFixed(2)},${(pad + (h - pad * 2) * (1 - (v - min) / rng)).toFixed(2)}`).join(' ');
  }
  function Sparkline({ data, up, w = 84, h = 34, strokeW = 2 }) {
    const color = up ? 'var(--up)' : 'var(--down)';
    const d = useMemo(() => chartPath(data, w, h), [data, w, h]);
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  function AreaChart({ data, up, h = 200, animate = true, showDot = true, markers }) {
    const wrap = useRef(null);
    const [w, setW] = useState(320);
    useEffect(() => { if (wrap.current) setW(wrap.current.clientWidth); }, []);
    const color = up ? 'var(--up)' : 'var(--down)';
    const uid = useMemo(() => 'ac' + Math.random().toString(36).slice(2, 7), []);
    const pad = 6;
    const line = useMemo(() => chartPath(data, w, h, pad), [data, w, h]);
    const area = line + ` L${w},${h} L0,${h} Z`;
    const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
    const yAt = (v) => pad + (h - pad * 2) * (1 - (v - min) / rng);
    const valAt = (fx) => { const t = fx * (data.length - 1); const i = Math.floor(t), f = t - i; return data[i] + (data[Math.min(i + 1, data.length - 1)] - data[i]) * f; };
    const lastY = yAt(data[data.length - 1]);
    const mk = markers || [];
    const mColor = (t) => t === 'W' ? 'var(--brand-2)' : t === '6' ? 'var(--up)' : 'var(--up)';
    return (
      <div ref={wrap} style={{ width: '100%', position: 'relative' }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.28" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${uid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          {mk.map((m, i) => {
            const x = m.fx * w, y = yAt(valAt(m.fx)), c = mColor(m.type);
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={x} y2={h} stroke={c} strokeWidth="1" strokeDasharray="2 3" opacity="0.35" />
                <circle cx={x} cy={y} r="3.5" fill={c} stroke="var(--surface)" strokeWidth="1.5" />
                <g transform={`translate(${Math.max(9, Math.min(w - 9, x))},${Math.max(11, y - 16)})`}>
                  <circle r="9" fill={c} />
                  <text textAnchor="middle" dy="3.4" fontSize="9.5" fontWeight="800" fill="#fff" fontFamily="var(--font-num)">{m.type}</text>
                </g>
              </g>
            );
          })}
          {showDot && <g>
            <circle cx={w} cy={lastY} r="11" fill={color} opacity="0.16" />
            <circle cx={w} cy={lastY} r="4.5" fill={color} stroke="var(--surface)" strokeWidth="2" />
          </g>}
        </svg>
      </div>
    );
  }

  /* ---------------- Delta / price ---------------- */
  function Delta({ value, pill, abs, size }) {
    const up = value >= 0;
    const txt = (abs != null ? (up ? '+' : '−') + fmtINR(Math.abs(abs)) + '  ' : '') + fmtPct(value);
    return (
      <span className={(pill ? 'delta-pill ' : 'delta ') + (up ? 'up' : 'down')} style={size ? { fontSize: size } : undefined}>
        <Icon name={up ? 'arrowUR' : 'arrowDR'} size={pill ? 13 : 14} stroke={2.4} />{txt}
      </span>
    );
  }
  function RoleDot({ role }) {
    const r = ROLES[role] || {};
    return <span className="chip" style={{ background: r.c + '1f', color: r.c, height: 22, padding: '0 8px', fontSize: 11 }}>{r.short}</span>;
  }

  /* ---------------- Player row (market list) ---------------- */
  function PlayerRow({ player, onOpen, right }) {
    const up = player.change >= 0;
    return (
      <button className="card tap flat" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'transparent', border: 'none' }}
        onClick={() => onOpen && onOpen(player)}>
        <Avatar player={player} size={44} />
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.short}</span>
            {player.playing && <span className="live-dot" style={{ width: 6, height: 6 }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <RoleDot role={player.role} />
            <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{player.team}</span>
          </div>
        </div>
        {right !== undefined ? right : <>
          <Sparkline data={player.series} up={up} w={46} h={28} />
          <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <div className="num" style={{ fontWeight: 800, fontSize: 14.5 }}>{fmtINR(player.price)}</div>
            <div style={{ marginTop: 2 }}><Delta value={player.change} /></div>
          </div>
        </>}
      </button>
    );
  }

  /* ---------------- Bottom nav ---------------- */
  function BottomNav({ tab, go }) {
    const items = [
      { k: 'home', icon: 'home', label: 'Home' },
      { k: 'market', icon: 'market', label: 'Market' },
      { k: 'trade', icon: 'swap', label: '', fab: true },
      { k: 'portfolio', icon: 'layers', label: 'Portfolio' },
      { k: 'profile', icon: 'profile', label: 'Profile' },
    ];
    return (
      <nav className="bottomnav">
        <div className="bottomnav-inner">
          {items.map((it) => it.fab ? (
            <button key={it.k} className="navitem" onClick={() => go('market')}>
              <span className="fab-trade"><Icon name="bolt" size={24} fill="currentColor" stroke={0} /></span>
            </button>
          ) : (
            <button key={it.k} className={'navitem' + (tab === it.k ? ' on' : '')} onClick={() => go(it.k)}>
              <Icon name={it.icon} size={23} fill={tab === it.k ? 'currentColor' : 'none'} stroke={tab === it.k ? 0 : 2} />
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  /* ---------------- Toast ---------------- */
  function Toast({ msg, icon }) {
    if (!msg) return null;
    return <div className="toast"><Icon name={icon || 'check'} size={18} style={{ color: 'var(--up)' }} />{msg}</div>;
  }

  /* ---------------- Bottom sheet ---------------- */
  function Sheet({ open, onClose, children }) {
    if (!open) return null;
    return (
      <div className="sheet-scrim" onClick={onClose}>
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          {children}
        </div>
      </div>
    );
  }

  window.UI = {
    Icon, LogoMark, Wordmark, StatusBar, Avatar, PersonAvatar,
    Sparkline, AreaChart, chartPath, Delta, RoleDot, PlayerRow, BottomNav, Toast, Sheet,
  };
})();
