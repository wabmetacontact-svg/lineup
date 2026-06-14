/* ============================================================================
   LineUp — Tweaks panel mount (drives live app state)
   ============================================================================ */
(function () {
  const ACCENTS = [
    { k: 'indigo', c: '#5B4BD6' },
    { k: 'violet', c: '#7C4DE0' },
    { k: 'electric', c: '#4F46E5' },
    { k: 'magenta', c: '#C13BB0' },
  ];

  function TweaksMount({ app, setAccent }) {
    return (
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Appearance" />
        <window.TweakRadio label="Theme" value={app.theme} options={['light', 'dark']}
          onChange={(v) => app.setTheme(v)} />
        <div className="twk-row">
          <div className="twk-lbl"><span>Accent color</span></div>
          <div className="twk-chips" role="radiogroup">
            {ACCENTS.map((a) => (
              <button key={a.k} type="button" className="twk-chip" data-on={app.accent === a.k ? '1' : '0'}
                aria-label={a.k} title={a.k} style={{ background: a.c }} onClick={() => setAccent(a.k)}>
                {app.accent === a.k && <svg viewBox="0 0 14 14"><path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="#fff" /></svg>}
              </button>
            ))}
          </div>
        </div>

        <window.TweakSection label="Market simulation" />
        <window.TweakToggle label="Live ticking prices" value={app.live}
          onChange={(v) => app.setLive(v)} />
        <window.TweakToggle label="Hide balances" value={app.hideBalance}
          onChange={(v) => app.setHideBalance(v)} />
        <window.TweakToggle label="Price alerts" value={app.prefs.alerts}
          onChange={(v) => app.setPref('alerts', v)} />

        <window.TweakSection label="Session" />
        <window.TweakButton label="Reset demo data" secondary onClick={() => { localStorage.removeItem('lu_theme'); localStorage.removeItem('lu_accent'); location.reload(); }} />
      </window.TweaksPanel>
    );
  }

  window.TweaksMount = TweaksMount;
})();
