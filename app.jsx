/* ============================================================================
   LineUp — App root: navigation, live price engine, trade logic, theming
   ============================================================================ */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const { StatusBar, BottomNav, Toast } = window.UI;
  const A = window.SCR_A, B = window.SCR_B, C = window.SCR_C;
  const LU = window.LU;

  const TAB_SCREENS = { home: A.Home, market: A.Market, portfolio: B.Portfolio, profile: C.Profile };
  const PUSH_SCREENS = {
    player: B.PlayerDetail, trade: B.TradeTicket, live: C.LiveMatch,
    leaderboard: C.Leaderboard, wallet: C.Wallet, addfunds: C.AddFunds,
    search: C.Search, notifications: C.Notifications, history: C.History,
  };

  function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('lu_theme') || 'light');
    const [accent, setAccent] = useState(() => localStorage.getItem('lu_accent') || 'indigo');
    const [loggedIn, setLoggedIn] = useState(false);
    const [tab, setTabRaw] = useState('home');
    const [stack, setStack] = useState([]);
    const [players, setPlayers] = useState(() => LU.players.map((p) => ({ ...p, series: [...p.series] })));
    const [holdings, setHoldings] = useState(() => LU.holdings.map((h) => ({ ...h })));
    const [closed, setClosed] = useState([]);
    const [wallet, setWallet] = useState(() => ({ ...LU.wallet, tx: [...LU.wallet.tx] }));
    const [watchlist, setWatchlist] = useState(() => [...LU.watchlist]);
    const [hideBalance, setHideBalance] = useState(false);
    const [prefs, setPrefs] = useState({ notif: true, alerts: true });
    const [toast, setToast] = useState(null);
    const [live, setLive] = useState(true);
    const toastTimer = useRef(null);
    const byId = useRef(Object.fromEntries(players.map((p) => [p.id, p]))).current;
    // keep byId pointing at latest player objects
    const byIdMap = {}; players.forEach((p) => { byIdMap[p.id] = p; });

    useEffect(() => { localStorage.setItem('lu_theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('lu_accent', accent); }, [accent]);

    /* ---- live price engine ---- */
    useEffect(() => {
      if (!loggedIn || !live) return;
      const id = setInterval(() => {
        setPlayers((prev) => prev.map((p) => {
          const vol = p.basePrice * 0.0014 * (p.playing ? 2.4 : 1);
          const drift = (p.idx - 1) * p.basePrice * 0.00018;
          let np = p.price + (Math.random() - 0.5) * vol * 2 + drift;
          np = Math.max(p.basePrice * 0.7, Math.min(p.basePrice * 1.35, np));
          np = +np.toFixed(2);
          const series = [...p.series.slice(-31), np];
          const change = +((np - p.dayOpen) / p.dayOpen * 100).toFixed(2);
          return { ...p, prevPrice: p.price, price: np, series, change, changeAbs: +(np - p.dayOpen).toFixed(2), tick: p.tick + 1 };
        }));
      }, 1400);
      return () => clearInterval(id);
    }, [loggedIn, live]);

    /* ---- helpers ---- */
    const holdingPL = useCallback((h) => {
      const p = byIdMap[h.pid]; if (!p) return { abs: 0, pct: 0 };
      const abs = (h.side === 'long' ? (p.price - h.avg) : (h.avg - p.price)) * h.qty;
      return { abs: +abs.toFixed(2), pct: +(abs / (h.avg * h.qty) * 100).toFixed(2) };
    }, [players]);
    const holdingValue = (h) => { const p = byIdMap[h.pid]; const pl = holdingPL(h); return h.side === 'long' ? p.price * h.qty : h.avg * h.qty + pl.abs; };
    const portfolioTotals = useCallback(() => {
      let posVal = 0, invested = 0, totalPL = 0, dayPL = 0;
      holdings.forEach((h) => {
        const p = byIdMap[h.pid]; const pl = holdingPL(h);
        posVal += holdingValue(h); invested += h.avg * h.qty; totalPL += pl.abs;
        dayPL += (p.price - p.dayOpen) * h.qty * (h.side === 'long' ? 1 : -1);
      });
      const value = posVal + wallet.available;
      return {
        value, posVal, invested, totalPL: +totalPL.toFixed(2),
        totalPct: invested ? +(totalPL / invested * 100).toFixed(2) : 0,
        dayPL: +dayPL.toFixed(2), dayPct: posVal ? +(dayPL / posVal * 100).toFixed(2) : 0,
      };
    }, [holdings, players, wallet]);

    /* ---- navigation ---- */
    const showToast = useCallback((msg, icon) => {
      setToast({ msg, icon }); clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    }, []);
    const go = useCallback((name, params = {}) => {
      if (name === 'share') { showToast('Share link copied', 'share'); return; }
      if (name === 'settings') { setTabRaw('profile'); setStack([]); return; }
      const vp = document.querySelector('.viewport');
      setStack((s) => [...s, { name, params }]);
    }, [showToast]);
    const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);
    const setTab = useCallback((t) => { setStack([]); setTabRaw(t); const vp = document.querySelector('.viewport'); if (vp) vp.scrollTop = 0; }, []);

    const toggleWatch = useCallback((id) => {
      setWatchlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);
      showToast(watchlist.includes(id) ? 'Removed from watchlist' : 'Added to watchlist', 'star');
    }, [watchlist, showToast]);

    /* ---- trades ---- */
    const executeTrade = useCallback(({ pid, side, qty, amount, horizon, price, closing, entryBall }) => {
      const p = byIdMap[pid];
      if (closing) {
        const h = holdings.find((x) => x.pid === pid);
        if (h) {
          const pl = holdingPL(h);
          const credit = h.side === 'long' ? p.price * qty : h.avg * h.qty * 0.25 + pl.abs;
          setClosed((c) => [{ pid, side: h.side, qty, pl: pl.abs }, ...c]);
          setHoldings((hs) => hs.filter((x) => x.pid !== pid));
          setWallet((w) => ({ ...w, available: +(w.available + credit).toFixed(2) }));
          showToast(`Closed ${p.short} · ${pl.abs >= 0 ? '+' : ''}${LU.fmtINR(pl.abs)}`, pl.abs >= 0 ? 'check' : 'info');
        }
      } else {
        const amt = amount != null ? amount : price * qty;
        const fee = amt * 0.002;
        const need = side === 'short' ? amt * 0.25 + fee : amt + fee;
        setWallet((w) => ({ ...w, available: +(w.available - need).toFixed(2), tx: [{ id: Date.now(), type: side, label: `${side === 'long' ? 'Bought' : 'Shorted'} ${p.short} · ${LU.fmtINR(amt, 0)}`, amt: -need, t: 'Just now', icon: side === 'long' ? 'long' : 'short' }, ...w.tx] }));
        setHoldings((hs) => {
          const ex = hs.find((x) => x.pid === pid && x.side === side);
          if (ex) return hs.map((x) => x === ex ? { ...x, qty: +(x.qty + qty).toFixed(4), avg: +((x.avg * x.qty + price * qty) / (x.qty + qty)).toFixed(2) } : x);
          return [{ pid, side, qty: +qty.toFixed(4), avg: price, horizon, entryBall: entryBall || null }, ...hs];
        });
        showToast(`${side === 'long' ? 'Bought' : 'Sold'} ${LU.fmtINR(amt, 0)} of ${p.short}${entryBall ? ' · ball ' + entryBall : ''}`, side === 'long' ? 'arrowUR' : 'arrowDR');
      }
      back();
    }, [holdings, players, showToast, back]);

    const addFunds = useCallback((val) => {
      setWallet((w) => ({ ...w, available: +(w.available + val).toFixed(2), tx: [{ id: Date.now(), type: 'deposit', label: 'Added to wallet', amt: val, t: 'Just now', icon: 'deposit' }, ...w.tx] }));
      showToast(`${LU.fmtINR(val, 0)} added`, 'check'); back();
    }, [showToast, back]);

    const setPref = useCallback((k, v) => setPrefs((p) => ({ ...p, [k]: v })), []);
    const login = useCallback(() => { setLoggedIn(true); setTabRaw('home'); }, []);
    const logout = useCallback(() => { setLoggedIn(false); setStack([]); setTabRaw('home'); }, []);

    const app = {
      players, byId: byIdMap, holdings, closed, wallet, watchlist, user: LU.user, prefs,
      theme, setTheme, accent, hideBalance, setHideBalance, live, setLive,
      tab, setTab, go, back, stack,
      toggleWatch, executeTrade, addFunds, setPref, login, logout,
      toast: showToast, holdingPL, holdingValue, portfolioTotals,
    };

    // current screen
    let Screen, isPush = false, screenKey = tab;
    if (stack.length) { const top = stack[stack.length - 1]; Screen = PUSH_SCREENS[top.name]; isPush = true; screenKey = top.name + stack.length; var pushParams = top.params; }
    else { Screen = TAB_SCREENS[tab]; }

    return (
      <div className="lineup" data-theme={loggedIn ? theme : 'dark'} data-accent={accent} style={{ width: '100%', height: '100%' }}>
        <div className="phone-stage">
          <div className="phone">
            <div className="phone-notch" />
            <div className="phone-screen">
              <StatusBar />
              {!loggedIn ? (
                <div className="viewport"><A.Onboarding app={app} /></div>
              ) : (
                <>
                  <div className="viewport" key={screenKey}>
                    {Screen && (isPush ? <Screen app={app} params={pushParams} /> : <Screen app={app} />)}
                  </div>
                  {!isPush && <BottomNav tab={tab} go={(t) => setTab(t)} />}
                  <Toast msg={toast && toast.msg} icon={toast && toast.icon} />
                </>
              )}
              <div className="gesture-bar"><div className="pill" /></div>
            </div>
          </div>
        </div>
        <window.TweaksMount app={app} setAccent={setAccent} />
      </div>
    );
  }

  window.LineUpApp = App;
})();
