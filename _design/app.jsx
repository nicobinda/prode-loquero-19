// app.jsx — Prode Binda 2026 main app

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tournamentState": "mid"
}/*EDITMODE-END*/;

const LOCKED_LAYOUT = 'B';
const LOCKED_DENSITY = 'compact';

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Router state
  const [screen, setScreen] = React.useState('welcome'); // welcome | profile | home | ranking | rules
  const [user, setUser] = React.useState({ ...window.PLAYERS[0], photoUrl: null });
  const [predictions, setPredictions] = React.useState(() => window.seedPredictions());
  const [activeMatch, setActiveMatch] = React.useState(null);

  function handleWelcomeSuccess() {
    setScreen('profile');
  }
  function handleProfileComplete(data) {
    setUser(u => ({ ...u, nick: data.nick, photoUrl: data.photoUrl }));
    setScreen('home');
  }

  const dark = false;

  return (
    <>
      <GlobalStyles/>
      <PhoneFrame dark={dark}>
        {screen === 'welcome' && (
          <WelcomeScreen onSuccess={handleWelcomeSuccess} dark={dark}/>
        )}
        {screen === 'profile' && (
          <ProfileSetupScreen onComplete={handleProfileComplete} dark={dark}/>
        )}
        {screen === 'home' && (
          <HomeScreen
            user={user}
            dark={dark}
            density={LOCKED_DENSITY}
            layout={LOCKED_LAYOUT}
            predictions={predictions}
            setPredictions={setPredictions}
            tournamentState={t.tournamentState}
            onNavRanking={() => setScreen('ranking')}
            onNavRules={() => setScreen('rules')}
            onOpenMatch={setActiveMatch}
          />
        )}
        {screen === 'ranking' && (
          <RankingScreen
            user={user}
            dark={dark}
            tournamentState={t.tournamentState}
            onNavHome={() => setScreen('home')}
            onNavRules={() => setScreen('rules')}
          />
        )}
        {screen === 'rules' && (
          <RulesScreen
            user={user}
            dark={dark}
            onNavHome={() => setScreen('home')}
            onNavRanking={() => setScreen('ranking')}
            onNavAccount={() => setScreen('account')}
          />
        )}
        {screen === 'account' && (
          <AccountScreen
            user={user}
            setUser={setUser}
            dark={dark}
            onNavHome={() => setScreen('home')}
            onNavRanking={() => setScreen('ranking')}
            onNavRules={() => setScreen('rules')}
            onLogout={() => {
              setUser({ ...window.PLAYERS[0], photoUrl: null });
              setPredictions(window.seedPredictions());
              setScreen('welcome');
            }}
          />
        )}
        <MatchDetailModal
          match={activeMatch}
          predictions={predictions}
          onClose={() => setActiveMatch(null)}
          dark={dark}
        />
      </PhoneFrame>

      {/* Quick screen jumper (always visible, helps demo) */}
      <ScreenJumper screen={screen} setScreen={setScreen} dark={dark}/>

      <ProdeTweaksPanel tweaks={t} setTweak={setTweak} screen={screen} setScreen={setScreen}/>
    </>
  );
}

// ─── Phone frame wrapper — uses iOS frame on desktop, full-bleed on mobile ──
function PhoneFrame({ children, dark }) {
  const [isMobile, setIsMobile] = React.useState(window.matchMedia('(max-width: 640px)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const fn = e => setIsMobile(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  if (isMobile) {
    return (
      <div style={{
        width:'100vw', height:'100vh', overflow:'hidden',
        background: dark ? '#0A1338' : '#FFFFFF',
      }}>{children}</div>
    );
  }
  return (
    <div style={{
      minHeight:'100vh',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'40px 20px',
      background: dark ? '#0A1338' : '#EEF1F8',
      backgroundImage: dark
        ? 'radial-gradient(ellipse 600px 400px at 30% 30%, rgba(96,77,255,0.15), transparent 60%), radial-gradient(ellipse 500px 400px at 70% 70%, rgba(97,141,255,0.10), transparent 60%)'
        : 'radial-gradient(ellipse 600px 400px at 30% 30%, rgba(220,237,255,0.6), transparent 60%), radial-gradient(ellipse 500px 400px at 70% 70%, rgba(228,241,255,0.6), transparent 60%)',
    }}>
      <IOSDevice width={390} height={780} dark={dark}>
        {children}
      </IOSDevice>
    </div>
  );
}

// ─── Tweaks panel ──────────────────────────────────────────────────
function ProdeTweaksPanel({ tweaks, setTweak, screen, setScreen }) {
  return (
    <TweaksPanel title="TWEAKS · PRODE BINDA">
      <TweakSection title="Pantalla">
        <TweakSelect
          label="Ir a"
          value={screen}
          options={[
            { value:'welcome', label:'1 · Welcome' },
            { value:'profile', label:'2 · Datos personales' },
            { value:'home',    label:'3 · Pantalla principal' },
            { value:'ranking', label:'4 · Ranking' },
            { value:'rules',   label:'5 · Reglas' },
            { value:'account', label:'6 · Mi cuenta' },
          ]}
          onChange={setScreen}
        />
      </TweakSection>
      <TweakSection title="Estado del torneo">
        <TweakSelect
          label="Momento"
          value={tweaks.tournamentState}
          options={[
            { value:'start', label:'Recién empieza (todo por jugar)' },
            { value:'mid',   label:'A mitad (Fase 1 con resultados)' },
            { value:'end',   label:'Casi terminado (Fase 1 y 2 finalizadas)' },
          ]}
          onChange={v => setTweak('tournamentState', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// ─── Screen jumper — visible chips on top to navigate the demo ─────
function ScreenJumper({ screen, setScreen, dark }) {
  const items = [
    { value:'welcome', label:'Welcome' },
    { value:'profile', label:'Datos' },
    { value:'home',    label:'Principal' },
    { value:'ranking', label:'Ranking' },
    { value:'rules',   label:'Reglas' },
  ];
  return (
    <div style={{
      position:'fixed', top:14, left:14, zIndex:100,
      display:'flex', gap:6, flexWrap:'wrap', maxWidth:'calc(100vw - 28px)',
      padding:6, borderRadius:6,
      background: dark ? 'rgba(11,29,94,0.85)' : 'rgba(255,255,255,0.92)',
      backdropFilter:'blur(12px)',
      WebkitBackdropFilter:'blur(12px)',
      boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
      border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)',
    }}>
      {items.map((it, i) => (
        <button key={it.value} onClick={() => setScreen(it.value)} style={{
          padding:'6px 10px',
          background: screen === it.value
            ? '#604DFF'
            : 'transparent',
          color: screen === it.value
            ? '#fff'
            : (dark ? 'rgba(255,255,255,0.85)' : '#0B1D5E'),
          border:'none', borderRadius:4,
          fontFamily:'Titillium Web, sans-serif', fontWeight:700, fontSize:11,
          letterSpacing:'0.06em', textTransform:'uppercase',
          cursor:'pointer',
        }}>
          <span style={{ opacity:0.6, marginRight:4 }}>{i+1}</span>{it.label}
        </button>
      ))}
    </div>
  );
}

// ─── Global keyframes & font reset ─────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes pb-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      @keyframes pb-fadein { from { opacity:0 } to { opacity:1 } }
      @keyframes pb-slideup { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      input, button { font-family: inherit; }
      button:focus, input:focus { outline:none; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.3); border-radius:3px; }
    `}</style>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
