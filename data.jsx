/* ============================================================================
   LineUp — Data layer
   Players (as stocks), live match, portfolio, leaderboard, wallet, helpers
   Exposed on window: LU (namespace)
   ============================================================================ */
(function () {
  // ---- deterministic pseudo-random so sparklines are stable across renders ----
  function seeded(seed) {
    let s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }
  // generate a sparkline path of n points trending by `drift`, volatility `vol`
  function genSeries(seed, n, drift, vol, base) {
    const r = seeded(seed);
    const out = [];
    let v = base;
    for (let i = 0; i < n; i++) {
      v += (r() - 0.5) * vol + drift;
      v = Math.max(base * 0.5, v);
      out.push(+v.toFixed(2));
    }
    return out;
  }

  // ---- formatting ----
  const fmtINR = (n, dec = 2) => {
    const neg = n < 0; n = Math.abs(n);
    const [int, frac] = Number(n).toFixed(dec).split('.');
    // Indian grouping
    let last3 = int.slice(-3), rest = int.slice(0, -3);
    if (rest) last3 = ',' + last3;
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    const s = rest + last3 + (dec ? '.' + frac : '');
    return (neg ? '-₹' : '₹') + s;
  };
  const fmtNum = (n) => {
    if (Math.abs(n) >= 1e7) return (n / 1e7).toFixed(2) + ' Cr';
    if (Math.abs(n) >= 1e5) return (n / 1e5).toFixed(2) + ' L';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return '' + n;
  };
  const fmtPct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
  const fmtSigned = (n) => (n >= 0 ? '+' : '−') + fmtINR(Math.abs(n));

  // ---- team / country palette ----
  const TEAMS = {
    IND: { name: 'India', c1: '#2A6FDB', c2: '#1B4F9E', flag: '🇮🇳' },
    AUS: { name: 'Australia', c1: '#1FAA6E', c2: '#127a4c', flag: '🇦🇺' },
    PAK: { name: 'Pakistan', c1: '#0F8A4A', c2: '#0a5e32', flag: '🇵🇰' },
    ENG: { name: 'England', c1: '#4257C7', c2: '#2c3a8f', flag: '🏴' },
    NZ:  { name: 'New Zealand', c1: '#2C3440', c2: '#10151d', flag: '🇳🇿' },
    SA:  { name: 'South Africa', c1: '#1B8E5A', c2: '#11603c', flag: '🇿🇦' },
    AFG: { name: 'Afghanistan', c1: '#3B6FB0', c2: '#264a78', flag: '🇦🇫' },
    WI:  { name: 'West Indies', c1: '#8E2434', c2: '#5e1623', flag: '🌴' },
    SL:  { name: 'Sri Lanka', c1: '#1C6FA6', c2: '#124a70', flag: '🇱🇰' },
  };
  const ROLES = {
    BAT: { label: 'Batter', short: 'BAT', c: '#E0863A' },
    BWL: { label: 'Bowler', short: 'BWL', c: '#3A86E0' },
    AR:  { label: 'All-rounder', short: 'AR', c: '#8B4DE0' },
    WK:  { label: 'WK-Batter', short: 'WK', c: '#1FAA6E' },
  };

  // ---- player roster ----
  // p:price, d:24h % change, mc: volume(cr), idx: performance index, seed for series
  const RAW = [
    ['kohli','Virat Kohli','V. Kohli','IND','BAT',2847.5,3.42,128.4,1.18,11,['Hot','Live'],true],
    ['rohit','Rohit Sharma','R. Sharma','IND','BAT',2410.0,-1.18,96.2,1.05,12,['Live'],true],
    ['bumrah','Jasprit Bumrah','J. Bumrah','IND','BWL',2615.8,5.10,112.7,1.22,13,['Hot','Live'],true],
    ['gill','Shubman Gill','S. Gill','IND','BAT',1980.2,2.04,74.1,1.09,14,['Rising'],false],
    ['pant','Rishabh Pant','R. Pant','IND','WK',1742.6,-2.66,61.8,0.97,15,[],false],
    ['jadeja','Ravindra Jadeja','R. Jadeja','IND','AR',1655.4,1.33,58.3,1.04,16,[],false],
    ['hardik','Hardik Pandya','H. Pandya','IND','AR',1588.9,-0.74,55.0,0.99,17,[],false],
    ['surya','Suryakumar Yadav','SKY','IND','BAT',1820.3,4.21,67.4,1.12,18,['Hot'],false],
    ['siraj','Mohammed Siraj','M. Siraj','IND','BWL',1124.7,0.88,33.2,1.01,19,[],false],
    ['babar','Babar Azam','B. Azam','PAK','BAT',2190.0,-3.05,81.5,0.94,21,['Live'],true],
    ['shaheen','Shaheen Afridi','S. Afridi','PAK','BWL',1760.5,1.92,52.7,1.06,22,[],false],
    ['rizwan','Mohammad Rizwan','M. Rizwan','PAK','WK',1402.8,0.42,38.1,1.00,23,[],false],
    ['smith','Steve Smith','S. Smith','AUS','BAT',2055.6,-1.74,72.9,0.96,24,['Live'],true],
    ['cummins','Pat Cummins','P. Cummins','AUS','BWL',1990.4,2.58,69.3,1.10,25,['Live'],true],
    ['maxwell','Glenn Maxwell','G. Maxwell','AUS','AR',1612.2,6.33,60.5,1.20,26,['Hot'],false],
    ['head','Travis Head','T. Head','AUS','BAT',1730.9,3.11,57.8,1.13,27,['Rising'],true],
    ['starc','Mitchell Starc','M. Starc','AUS','BWL',1668.3,-0.95,49.6,0.98,28,[],true],
    ['stokes','Ben Stokes','B. Stokes','ENG','AR',1845.7,1.47,63.2,1.05,31,[],false],
    ['buttler','Jos Buttler','J. Buttler','ENG','WK',1712.0,-2.21,54.9,0.95,32,[],false],
    ['root','Joe Root','J. Root','ENG','BAT',1888.4,0.66,59.7,1.02,33,[],false],
    ['archer','Jofra Archer','J. Archer','ENG','BWL',1455.1,4.78,41.3,1.15,34,['Rising'],false],
    ['williamson','Kane Williamson','K. Williamson','NZ','BAT',1798.2,-0.33,52.4,1.00,35,[],false],
    ['boult','Trent Boult','T. Boult','NZ','BWL',1380.6,1.05,36.8,1.03,36,[],false],
    ['rashid','Rashid Khan','R. Khan','AFG','BWL',1925.9,5.67,64.1,1.21,37,['Hot'],false],
    ['gurbaz','Rahmanullah Gurbaz','R. Gurbaz','AFG','WK',980.4,2.90,24.7,1.08,38,['Rising'],false],
    ['dekock','Quinton de Kock','Q. de Kock','SA','WK',1520.7,-1.40,44.2,0.97,39,[],false],
    ['rabada','Kagiso Rabada','K. Rabada','SA','BWL',1640.3,0.74,47.9,1.04,40,[],false],
    ['markram','Aiden Markram','A. Markram','SA','BAT',1188.5,-0.55,30.6,0.99,41,[],false],
    ['pooran','Nicholas Pooran','N. Pooran','WI','WK',1310.8,3.88,34.0,1.11,42,['Rising'],false],
    ['hasaranga','Wanindu Hasaranga','W. Hasaranga','SL','AR',1095.2,1.20,27.3,1.02,43,[],false],
  ];

  const players = RAW.map((row) => {
    const [id, name, short, team, role, p, d, mc, idx, seed, tags, playing] = row;
    const drift = (d / 100) * p / 28;
    const series = genSeries(seed, 32, drift, p * 0.018, p * 0.985);
    series[series.length - 1] = p;
    // ---- live/last match performance stats ----
    const r2 = seeded(seed * 131 + 977); r2(); r2(); r2();
    const isBat = role === 'BAT' || role === 'WK' || role === 'AR';
    const isBowl = role === 'BWL' || role === 'AR';
    const runs = isBat ? Math.round(r2() * (role === 'AR' ? 46 : 82)) : Math.round(r2() * 16);
    const balls = Math.max(1, Math.round(runs / (1.05 + r2() * 0.65)));
    const fours = Math.round(runs / 13), sixes = Math.round(runs / 25);
    const wickets = isBowl ? Math.round(r2() * 3) : 0;
    const overs = isBowl ? +(1.2 + r2() * 2.8).toFixed(1) : 0;
    const conceded = isBowl ? Math.round(overs * (6 + r2() * 5)) : 0;
    const catches = Math.round(r2() * 2);
    const milestones = [];
    if (runs >= 50) milestones.push(runs >= 100 ? '100' : '50');
    if (wickets >= 3) milestones.push(wickets + 'W');
    const stats = {
      isBat, isBowl, runs, balls, fours, sixes, wickets, overs, conceded, catches, milestones,
      sr: balls ? +(runs / balls * 100).toFixed(1) : 0,
      econ: overs ? +(conceded / overs).toFixed(1) : 0,
    };
    return {
      id, name, short, team, role,
      price: p, basePrice: p, prevPrice: p,
      change: d, changeAbs: +(p * d / 100).toFixed(2),
      volume: mc, idx, tags: tags || [], playing, stats,
      series, dayOpen: +(p - (p * d / 100)).toFixed(2),
      dayHigh: +(p * (1 + Math.abs(d) / 100 + 0.012)).toFixed(2),
      dayLow: +(p * (1 - Math.abs(d) / 100 - 0.008)).toFixed(2),
      tick: 0, flash: null,
    };
  });
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));

  // ---- live match ----
  const match = {
    id: 'm1', series: 'Border–Gavaskar T20 · Match 3',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    teamA: { code: 'IND', name: 'India', score: 178, wkts: 4, overs: 17.2, run: true },
    teamB: { code: 'AUS', name: 'Australia', score: 0, wkts: 0, overs: 0, target: 191 },
    status: 'India batting · 2nd innings break soon',
    ball: '17.2', // current over.ball
    striker: 'surya', nonStriker: 'hardik', bowler: 'cummins',
    crr: 10.27, rrr: null,
    // recent ball events newest-last; t = price effect player id, imp = ₹ move
    timeline: [
      { o: '17.2', r: '6', t: 'surya', txt: 'SIX! Surya pulls Cummins over deep mid-wicket', big: true, imp: 14.2, up: true },
      { o: '17.1', r: '1', t: 'hardik', txt: 'Pandya tucks to fine leg, quick single', imp: 1.1, up: true },
      { o: '16.6', r: 'W', t: 'cummins', txt: 'WICKET! Cummins bowls Gill, big breakthrough', wkt: true, imp: 18.5, up: true },
      { o: '16.5', r: '4', t: 'surya', txt: 'FOUR! Surya drives through covers', imp: 9.4, up: true },
      { o: '16.4', r: '2', t: 'surya', txt: 'Worked into the gap for two', imp: 2.3, up: true },
      { o: '16.3', r: '0', t: 'cummins', txt: 'Dot ball, beaten outside off', imp: 0.6, up: true },
    ],
    squads: {
      IND: { listed: ['rohit', 'gill', 'kohli', 'surya', 'pant', 'hardik', 'jadeja', 'bumrah', 'siraj'], bench: ['Axar Patel', 'Kuldeep Yadav'] },
      AUS: { listed: ['head', 'smith', 'maxwell', 'cummins', 'starc'], bench: ['M. Marsh', 'J. Inglis', 'A. Zampa', 'J. Hazlewood', 'T. David', 'S. Abbott'] },
    },
    // scorecard: batting order + dismissals (IND), bowling card (AUS)
    batCard: [
      { pid: 'rohit', how: 'c Inglis b Starc' },
      { pid: 'gill', how: 'b Cummins' },
      { pid: 'kohli', how: 'lbw b Maxwell' },
      { pid: 'pant', how: 'c & b Cummins' },
      { pid: 'surya', how: 'not out', strike: true },
      { pid: 'hardik', how: 'not out' },
    ],
    bowlCard: ['cummins', 'starc', 'maxwell'],
    extras: 14, fow: '4–142 (Gill, 16.6)',
    tournament: {
      name: 'Border–Gavaskar T20 Series 2026',
      lead: 'India lead the series 2–0',
      fixtures: [
        { n: 1, venue: 'Wankhede, Mumbai', res: 'India won by 6 wickets', win: 'IND', done: true },
        { n: 2, venue: 'Kotla, Delhi', res: 'India won by 14 runs', win: 'IND', done: true },
        { n: 3, venue: 'Chepauk, Chennai', res: 'Live · India batting', live: true },
        { n: 4, venue: 'Eden Gardens, Kolkata', res: 'Sat · 7:00 PM IST', upcoming: true },
        { n: 5, venue: 'Chinnaswamy, Bengaluru', res: 'Tue · 7:00 PM IST', upcoming: true },
      ],
      standings: [
        { team: 'IND', p: 2, w: 2, l: 0, pts: 4, nrr: '+1.42' },
        { team: 'AUS', p: 2, w: 0, l: 2, pts: 0, nrr: '−1.42' },
      ],
    },
  };

  // ---- portfolio (open positions) ----
  // side long/short, qty, avg entry, horizon
  const holdings = [
    { pid: 'kohli',   side: 'long',  qty: 12, avg: 2610.0, horizon: 'Position' },
    { pid: 'bumrah',  side: 'long',  qty: 8,  avg: 2455.5, horizon: 'Day' },
    { pid: 'maxwell', side: 'long',  qty: 15, avg: 1490.0, horizon: 'Scalp', entryBall: '14.3' },
    { pid: 'babar',   side: 'short', qty: 10, avg: 2270.0, horizon: 'Swing' },
    { pid: 'pant',    side: 'long',  qty: 9,  avg: 1810.0, horizon: 'Day' },
    { pid: 'rashid',  side: 'long',  qty: 6,  avg: 1740.0, horizon: 'Position' },
  ];
  const watchlist = ['surya', 'cummins', 'head', 'archer', 'gurbaz', 'rohit'];

  // ---- wallet ----
  const wallet = {
    balance: 48250.75, invested: 132480.0, available: 48250.75,
    tx: [
      { id: 1, type: 'buy', label: 'Bought V. Kohli · ₹11,240', amt: -11240.0, t: '2m ago', icon: 'long' },
      { id: 2, type: 'sell', label: 'Sold G. Maxwell · ₹8,060', amt: +8060.0, t: '18m ago', icon: 'short' },
      { id: 3, type: 'deposit', label: 'Added via UPI', amt: +25000.0, t: '1h ago', icon: 'deposit' },
      { id: 4, type: 'settle', label: 'Day position settled · J. Bumrah', amt: +1284.0, t: '3h ago', icon: 'settle' },
      { id: 5, type: 'buy', label: 'Sold B. Azam · ₹22,700', amt: -22700.0, t: '5h ago', icon: 'short' },
      { id: 6, type: 'deposit', label: 'Added via Card', amt: +15000.0, t: 'Yesterday', icon: 'deposit' },
    ],
  };

  // ---- leaderboard ----
  const leaders = [
    { rank: 1, name: 'Arjun Mehta', handle: '@arjun_trades', ret: 184.2, val: 842500, you: false, av: '#E0863A' },
    { rank: 2, name: 'Priya Nair', handle: '@priyaplays', ret: 152.8, val: 610200, you: false, av: '#8B4DE0' },
    { rank: 3, name: 'Dev Kapoor', handle: '@devthebull', ret: 138.6, val: 528900, you: false, av: '#1FAA6E' },
    { rank: 4, name: 'Sana Iqbal', handle: '@sana_swing', ret: 121.3, val: 471000, you: false, av: '#3A86E0' },
    { rank: 5, name: 'Karthik R', handle: '@kartrade', ret: 109.7, val: 402300, you: false, av: '#E03A57' },
    { rank: 6, name: 'You', handle: '@rohan', ret: 96.4, val: 180730, you: true, av: '#5B4BD6' },
    { rank: 7, name: 'Meera Joshi', handle: '@meera_j', ret: 88.1, val: 165400, you: false, av: '#D9892B' },
    { rank: 8, name: 'Vikram S', handle: '@vik_scalp', ret: 74.5, val: 142800, you: false, av: '#2C3440' },
  ];

  const user = { name: 'Rohan Kapoor', handle: '@rohan', tier: 'Pro Trader', joined: 'Jan 2025', kyc: true, av: '#5B4BD6' };

  const trendingTags = ['All', 'Live now', 'Top gainers', 'Top losers', 'Batters', 'Bowlers', 'All-rounders', 'Watchlist'];

  const statLine = (p) => {
    const s = p.stats;
    if (s.isBowl && !s.isBat) return `${s.wickets}/${s.conceded} (${s.overs} ov)`;
    if (s.isBat && s.isBowl) return `${s.runs} (${s.balls}) · ${s.wickets}/${s.conceded}`;
    return `${s.runs} (${s.balls})`;
  };
  const priceDrivers = (p) => {
    const s = p.stats; const out = [];
    if (s.isBat) out.push({ k: 'Runs scored', v: s.runs, pct: +Math.min(13, s.runs * 0.11).toFixed(1), ic: 'bat' });
    if (s.isBowl) out.push({ k: 'Wickets', v: s.wickets, pct: +(s.wickets * 4).toFixed(1), ic: 'ball' });
    out.push({ k: 'Catches', v: s.catches, pct: +(s.catches * 1.6).toFixed(1), ic: 'target' });
    return out;
  };
  // performance markers placed onto a price series (fx = 0..1 along x)
  const chartMarkers = (p) => {
    const s = p.stats; const m = [];
    const sixes = Math.min(s.sixes, 3), fours = Math.min(s.fours, 3), wkts = Math.min(s.wickets, 3);
    let n = sixes + fours + wkts;
    if (!n) return [];
    // spread across the recent 65% of the chart
    let i = 0; const place = () => 0.36 + (n === 1 ? 0.5 : (i++ / (n - 1)) * 0.6);
    for (let k = 0; k < sixes; k++) m.push({ fx: place(), type: '6', up: true });
    for (let k = 0; k < fours; k++) m.push({ fx: place(), type: '4', up: true });
    for (let k = 0; k < wkts; k++) m.push({ fx: place(), type: 'W', up: true });
    return m.sort((a, b) => a.fx - b.fx);
  };

  window.LU = {
    players, byId, match, holdings, watchlist, wallet, leaders, user,
    TEAMS, ROLES, trendingTags, statLine, priceDrivers, chartMarkers,
    HZ: {
      Scalp: { c: '#E0863A', d: 'Seconds–minutes · per over/ball', tag: 'Auto · live' },
      Day: { c: '#5B4BD6', d: 'Settles at match end', tag: 'Settles today' },
      Swing: { c: '#3A86E0', d: 'Days–weeks · Test matches', tag: 'Multi-day' },
      Position: { c: '#1FAA6E', d: 'Weeks–months · full tournament', tag: 'Long-term' },
    },
    fmtINR, fmtNum, fmtPct, fmtSigned, genSeries, seeded,
  };
})();
