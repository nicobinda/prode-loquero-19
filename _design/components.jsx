// components.jsx — Shared UI components for Prode Binda 2026
// All components honor the `dark` and `density` props from the theme.

const PB_COLORS = {
  navy: '#00186B',
  deepBlue: '#0B1D5E',
  ceruleo: '#618DFF',
  violeta: '#604DFF',
  lightBlue: '#DCEDFF',
  veryLightBlue: '#E4F1FF',
  totalBlack: '#000000',
  darkText: '#292929',
  muted: '#8F8B8B',
  border: '#D9D9D9',
  bgGray: '#F7F7F7',
  green: '#59E892',
  greenDark: '#44E283',
  yellow: '#FFD747',
  red: '#FF5959',
  redDark: '#E20B32',
  white: '#FFFFFF',
};

// Theme helper — returns dark or light tokens
function pbTheme(dark) {
  if (dark) {
    return {
      bg:        '#0A1338',
      surface:   '#0F1A4A',
      surfaceAlt:'#162666',
      border:    'rgba(255,255,255,0.10)',
      borderStrong:'rgba(255,255,255,0.20)',
      text:      '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.65)',
      textDim:   'rgba(255,255,255,0.40)',
      primary:   PB_COLORS.ceruleo,
      primaryText:'#FFFFFF',
      accent:    PB_COLORS.violeta,
      chipBg:    'rgba(97,141,255,0.12)',
      chipBorder:'rgba(97,141,255,0.30)',
      input:     'rgba(255,255,255,0.06)',
      shadow:    '0 4px 16px rgba(0,0,0,0.35)',
      success:   PB_COLORS.green,
      yellow:    PB_COLORS.yellow,
      red:       PB_COLORS.red,
    };
  }
  return {
    bg:        '#FFFFFF',
    surface:   '#FFFFFF',
    surfaceAlt:'#F7F7F7',
    border:    '#E6E6E6',
    borderStrong:'#D9D9D9',
    text:      '#0B1D5E',
    textMuted: '#8F8B8B',
    textDim:   '#B8B6B6',
    primary:   PB_COLORS.navy,
    primaryText:'#FFFFFF',
    accent:    PB_COLORS.violeta,
    chipBg:    PB_COLORS.veryLightBlue,
    chipBorder:'rgba(97,141,255,0.30)',
    input:     '#FFFFFF',
    shadow:    '0 4px 12px rgba(11,29,94,0.08)',
    success:   PB_COLORS.greenDark,
    yellow:    PB_COLORS.yellow,
    red:       PB_COLORS.redDark,
  };
}

// ─── Big primary button ────────────────────────────────────────────
function PBButton({ children, onClick, disabled, variant='primary', dark, full=true, style }) {
  const t = pbTheme(dark);
  const styles = {
    primary: { bg: t.primary, color: '#fff', border: 'none' },
    secondary: { bg: 'transparent', color: t.primary, border: `1.5px solid ${t.primary}` },
    ghost: { bg: 'transparent', color: t.primary, border: 'none' },
    disabled: { bg: dark ? 'rgba(255,255,255,0.10)' : '#D1D0D0', color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)', border: 'none' },
  };
  const s = disabled ? styles.disabled : styles[variant];
  return (
    <button
      onClick={disabled ? null : onClick}
      style={{
        width: full ? '100%' : 'auto',
        padding: '14px 24px',
        background: s.bg,
        color: s.color,
        border: s.border,
        borderRadius: 4,
        fontFamily: 'Lato, sans-serif',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 120ms ease',
        ...style,
      }}
    >{children}</button>
  );
}

// ─── Text input ────────────────────────────────────────────────────
function PBInput({ label, value, onChange, placeholder, type='text', error, dark, maxLength, inputMode, autoFocus }) {
  const t = pbTheme(dark);
  return (
    <label style={{ display:'block', width:'100%' }}>
      {label && (
        <div style={{
          fontFamily:'Lato', fontSize:11, fontWeight:600, letterSpacing:'0.08em',
          textTransform:'uppercase', color: t.textMuted, marginBottom:6,
        }}>{label}</div>
      )}
      <input
        type={type}
        inputMode={inputMode}
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: t.input,
          color: t.text,
          border: `1px solid ${error ? t.red : t.borderStrong}`,
          borderRadius: 4,
          fontFamily: 'Lato', fontSize: 16, lineHeight: '20px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <div style={{
          marginTop:6, fontFamily:'Lato', fontWeight:700, fontSize:12,
          color: t.red, letterSpacing:'0.02em',
        }}>{error}</div>
      )}
    </label>
  );
}

// ─── PIN cells ─────────────────────────────────────────────────────
function PinInput({ value, onChange, length=4, error, dark, autoFocus }) {
  const t = pbTheme(dark);
  const refs = React.useRef([]);
  React.useEffect(() => { if (autoFocus && refs.current[0]) refs.current[0].focus(); }, [autoFocus]);
  const cells = Array.from({length}, (_, i) => value[i] || '');
  function handle(i, v) {
    const digit = v.replace(/\D/g,'').slice(-1);
    const next = cells.slice();
    next[i] = digit;
    onChange(next.join(''));
    if (digit && i < length - 1) refs.current[i+1]?.focus();
  }
  function handleKey(i, e) {
    if (e.key === 'Backspace' && !cells[i] && i > 0) refs.current[i-1]?.focus();
  }
  return (
    <div>
      <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
        {cells.map((c, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="tel"
            inputMode="numeric"
            value={c}
            onChange={e => handle(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            style={{
              width: 52, height: 64,
              textAlign:'center',
              fontFamily:'Titillium Web, sans-serif', fontWeight:700, fontSize:28,
              color: t.text,
              background: t.input,
              border:`1.5px solid ${error ? t.red : (c ? t.primary : t.borderStrong)}`,
              borderRadius: 4,
              outline:'none',
              boxSizing:'border-box',
            }}
          />
        ))}
      </div>
      {error && (
        <div style={{
          marginTop:10, fontFamily:'Lato', fontWeight:700, fontSize:12,
          color: t.red, letterSpacing:'0.02em', textAlign:'center',
        }}>{error}</div>
      )}
    </div>
  );
}

// ─── Avatar (player) ───────────────────────────────────────────────
function Avatar({ player, size=32, dark, ring }) {
  const t = pbTheme(dark);
  if (player.photoUrl) {
    return <img src={player.photoUrl} alt={player.nick} style={{
      width:size, height:size, borderRadius:'50%', objectFit:'cover',
      border: ring ? `2px solid ${t.primary}` : 'none',
    }}/>;
  }
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background: player.avatar || PB_COLORS.ceruleo,
      color: '#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'Lato', fontWeight:700, fontSize: size * 0.38,
      letterSpacing:'0.02em',
      flexShrink: 0,
      border: ring ? `2px solid ${t.primary}` : 'none',
      boxShadow: ring ? '0 0 0 2px #fff inset' : 'none',
    }}>{player.initials}</div>
  );
}

// ─── Status tag ────────────────────────────────────────────────────
function StatusTag({ status, minute, dark }) {
  const t = pbTheme(dark);
  const map = {
    upcoming: { bg: dark?'rgba(255,255,255,0.06)':PB_COLORS.veryLightBlue, color: t.primary, label:'PROGRAMADO' },
    live:     { bg: 'rgba(255,89,89,0.12)', color: t.red, label: minute ? `EN VIVO · ${minute}` : 'EN VIVO' },
    finished: { bg: dark?'rgba(89,232,146,0.15)':'rgba(68,226,131,0.14)', color: t.success, label:'FINALIZADO' },
  };
  const s = map[status];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'3px 8px', borderRadius:3,
      background: s.bg, color: s.color,
      fontFamily:'Titillium Web', fontWeight:600, fontSize:10,
      letterSpacing:'0.08em', textTransform:'uppercase',
      whiteSpace:'nowrap',
    }}>
      {status==='live' && <span style={{ width:6, height:6, borderRadius:'50%', background:t.red, animation:'pb-pulse 1.2s infinite' }}/>}
      {s.label}
    </span>
  );
}

// ─── Country flag chip (emoji-based, with code fallback) ──────────
function FlagChip({ code, size=24 }) {
  const team = window.TEAMS[code];
  if (!team) return null;
  return (
    <span style={{
      fontSize: size, lineHeight:1,
      display:'inline-block',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',
    }} aria-label={team.name}>{team.flag}</span>
  );
}

// ─── Score input (the two boxes for predicting) ───────────────────
function ScoreBox({ value, onChange, disabled, dark, highlight }) {
  const t = pbTheme(dark);
  const empty = value === null || value === undefined || value === '';
  return (
    <input
      value={empty ? '' : value}
      onChange={e => {
        if (disabled) return;
        const v = e.target.value.replace(/\D/g,'').slice(-1);
        onChange(v === '' ? null : Number(v));
      }}
      disabled={disabled}
      type="tel"
      inputMode="numeric"
      placeholder="–"
      style={{
        width: 38, height: 44, textAlign:'center',
        fontFamily:'Titillium Web', fontWeight:700, fontSize:22,
        color: highlight ? t.primary : t.text,
        background: disabled ? (dark?'rgba(255,255,255,0.04)':'#F7F7F7') : t.input,
        border: `1.5px solid ${empty ? t.borderStrong : t.primary}`,
        borderRadius: 4,
        outline:'none',
        boxSizing:'border-box',
        opacity: disabled ? 0.7 : 1,
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// MATCH CARD — Three layout variants exposed as a tweak
// Layout A: vertical stacked teams (per question pick)
// Layout B: horizontal classic (ARG vs BRA)
// Layout C: horizontal with metadata header strip
// ──────────────────────────────────────────────────────────────────

function MatchCardA({ match, prediction, onScore, onOpen, dark, density }) {
  const t = pbTheme(dark);
  const home = window.TEAMS[match.home];
  const away = window.TEAMS[match.away];
  const locked = match.status !== 'upcoming';
  const compact = density === 'compact';
  const pad = compact ? '12px 14px' : '14px 16px';

  // Show real score if finished/live, otherwise the user's prediction
  const liveOrFinal = locked ? match.realScore : null;
  const homeScore = locked ? (liveOrFinal?.[0] ?? '–') : (prediction?.[0] ?? null);
  const awayScore = locked ? (liveOrFinal?.[1] ?? '–') : (prediction?.[1] ?? null);

  const Row = ({ teamCode, score }) => {
    const team = window.TEAMS[teamCode];
    return (
      <div style={{
        display:'flex', alignItems:'center', gap:12,
        padding: compact ? '6px 0' : '8px 0',
      }}>
        <FlagChip code={teamCode} size={26} />
        <span style={{
          flex:1,
          fontFamily:'Lato', fontWeight:600, fontSize:15,
          color: t.text, letterSpacing:'0.01em',
        }}>{team.name}</span>
        {locked ? (
          <span style={{
            width:38, textAlign:'right',
            fontFamily:'Titillium Web', fontWeight:700, fontSize:22,
            color: t.text,
          }}>{score}</span>
        ) : (
          <ScoreBox
            value={score}
            onChange={v => onScore(teamCode === match.home ? [v, prediction?.[1] ?? null] : [prediction?.[0] ?? null, v])}
            disabled={locked}
            dark={dark}
          />
        )}
      </div>
    );
  };

  return (
    <div
      onClick={locked ? onOpen : undefined}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        padding: pad,
        cursor: locked ? 'pointer' : 'default',
        boxShadow: t.shadow,
        position:'relative',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: compact?4:8 }}>
        <span style={{
          fontFamily:'Titillium Web', fontWeight:600, fontSize:11,
          letterSpacing:'0.08em', textTransform:'uppercase',
          color: t.textMuted,
        }}>{match.day} · {match.time}</span>
        <StatusTag status={match.status} minute={match.minute} dark={dark}/>
      </div>
      <div style={{ borderTop:`1px solid ${t.border}`, marginTop:4 }}/>
      <Row teamCode={match.home} score={homeScore}/>
      <div style={{ borderTop:`1px dashed ${t.border}`, opacity:.6 }}/>
      <Row teamCode={match.away} score={awayScore}/>
      {!compact && (
        <div style={{
          fontFamily:'Lato', fontSize:11, color: t.textDim,
          marginTop:6, letterSpacing:'0.02em',
        }}>{match.venue} · Grupo {match.group}</div>
      )}
    </div>
  );
}

function MatchCardB({ match, prediction, onScore, onOpen, dark, density }) {
  const t = pbTheme(dark);
  const home = window.TEAMS[match.home];
  const away = window.TEAMS[match.away];
  const locked = match.status !== 'upcoming';
  const compact = density === 'compact';
  const homeScore = locked ? match.realScore?.[0] : (prediction?.[0] ?? null);
  const awayScore = locked ? match.realScore?.[1] : (prediction?.[1] ?? null);

  return (
    <div
      onClick={locked ? onOpen : undefined}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        padding: compact ? '12px 12px' : '14px 14px',
        cursor: locked ? 'pointer' : 'default',
        boxShadow: t.shadow,
      }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{
          fontFamily:'Titillium Web', fontWeight:600, fontSize:11,
          letterSpacing:'0.08em', textTransform:'uppercase',
          color: t.textMuted,
        }}>{match.day} · {match.time}</span>
        <StatusTag status={match.status} minute={match.minute} dark={dark}/>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <FlagChip code={match.home} size={32}/>
          <span style={{
            fontFamily:'Lato', fontWeight:700, fontSize:11,
            letterSpacing:'0.06em', textTransform:'uppercase',
            color: t.text, textAlign:'center',
          }}>{match.home}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {locked ? (
            <>
              <span style={{ fontFamily:'Titillium Web', fontWeight:700, fontSize:28, color:t.text, minWidth:28, textAlign:'center' }}>{homeScore ?? '–'}</span>
              <span style={{ fontFamily:'Titillium Web', fontWeight:600, fontSize:18, color:t.textDim }}>:</span>
              <span style={{ fontFamily:'Titillium Web', fontWeight:700, fontSize:28, color:t.text, minWidth:28, textAlign:'center' }}>{awayScore ?? '–'}</span>
            </>
          ) : (
            <>
              <ScoreBox value={homeScore} onChange={v => onScore([v, awayScore])} dark={dark}/>
              <span style={{ fontFamily:'Titillium Web', fontWeight:600, fontSize:18, color:t.textDim }}>:</span>
              <ScoreBox value={awayScore} onChange={v => onScore([homeScore, v])} dark={dark}/>
            </>
          )}
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <FlagChip code={match.away} size={32}/>
          <span style={{
            fontFamily:'Lato', fontWeight:700, fontSize:11,
            letterSpacing:'0.06em', textTransform:'uppercase',
            color: t.text, textAlign:'center',
          }}>{match.away}</span>
        </div>
      </div>
      {!compact && (
        <div style={{
          marginTop:10, paddingTop:10, borderTop:`1px solid ${t.border}`,
          display:'flex', justifyContent:'space-between',
          fontFamily:'Lato', fontSize:11, color:t.textMuted, letterSpacing:'0.02em',
        }}>
          <span>{match.venue}</span>
          <span>Grupo {match.group}</span>
        </div>
      )}
    </div>
  );
}

function MatchCardC({ match, prediction, onScore, onOpen, dark, density }) {
  const t = pbTheme(dark);
  const locked = match.status !== 'upcoming';
  const compact = density === 'compact';
  const homeScore = locked ? match.realScore?.[0] : (prediction?.[0] ?? null);
  const awayScore = locked ? match.realScore?.[1] : (prediction?.[1] ?? null);
  const home = window.TEAMS[match.home];
  const away = window.TEAMS[match.away];

  return (
    <div
      onClick={locked ? onOpen : undefined}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        overflow:'hidden',
        cursor: locked ? 'pointer' : 'default',
        boxShadow: t.shadow,
      }}
    >
      {/* Header strip */}
      <div style={{
        background: dark ? PB_COLORS.deepBlue : PB_COLORS.navy,
        color:'#fff',
        padding: '8px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:11,
            letterSpacing:'0.10em', textTransform:'uppercase',
          }}>Grupo {match.group}</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:'rgba(255,255,255,0.4)' }}/>
          <span style={{
            fontFamily:'Titillium Web', fontSize:11,
            letterSpacing:'0.06em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.75)',
          }}>{match.day} {match.time}</span>
        </div>
        <StatusTag status={match.status} minute={match.minute} dark={true}/>
      </div>
      <div style={{ padding: compact ? '10px 14px' : '14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <FlagChip code={match.home} size={28}/>
            <span style={{
              fontFamily:'Lato', fontWeight:700, fontSize:13,
              letterSpacing:'0.04em', textTransform:'uppercase', color:t.text,
            }}>{home.name}</span>
          </div>
          {locked
            ? <span style={{ fontFamily:'Titillium Web', fontWeight:700, fontSize:24, color:t.text, minWidth:36, textAlign:'right' }}>{homeScore ?? '–'}</span>
            : <ScoreBox value={homeScore} onChange={v => onScore([v, awayScore])} dark={dark}/>
          }
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop: compact?6:10 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <FlagChip code={match.away} size={28}/>
            <span style={{
              fontFamily:'Lato', fontWeight:700, fontSize:13,
              letterSpacing:'0.04em', textTransform:'uppercase', color:t.text,
            }}>{away.name}</span>
          </div>
          {locked
            ? <span style={{ fontFamily:'Titillium Web', fontWeight:700, fontSize:24, color:t.text, minWidth:36, textAlign:'right' }}>{awayScore ?? '–'}</span>
            : <ScoreBox value={awayScore} onChange={v => onScore([homeScore, v])} dark={dark}/>
          }
        </div>
        {!compact && (
          <div style={{
            marginTop:10,
            fontFamily:'Lato', fontSize:11, color:t.textDim,
            letterSpacing:'0.02em',
          }}>{match.venue}</div>
        )}
      </div>
    </div>
  );
}

function MatchCard(props) {
  const layout = props.layout || 'A';
  if (layout === 'B') return <MatchCardB {...props}/>;
  if (layout === 'C') return <MatchCardC {...props}/>;
  return <MatchCardA {...props}/>;
}

// ─── App Header ────────────────────────────────────────────────────
function AppHeader({ onNavRanking, onNavRules, onNavHome, dark, currentTab, user }) {
  const t = pbTheme(dark);
  return (
    <div style={{
      background: t.surface,
      borderBottom: `1px solid ${t.border}`,
      padding: 'max(54px, env(safe-area-inset-top, 14px)) 16px 12px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      position:'sticky', top:0, zIndex:10,
    }}>
      <div onClick={onNavHome} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
        <BrandLogo size={26} dark={dark}/>
        <div style={{
          fontFamily:'Titillium Web', fontWeight:900, fontSize:20,
          letterSpacing:'0.02em', color: t.text,
          lineHeight:1,
        }}>Prode {user?.nick ? `de ${user.nick}` : ''}</div>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <button onClick={onNavRules} style={{
          padding:'8px 10px', background:'transparent', border:'none',
          fontFamily:'Titillium Web', fontWeight:600, fontSize:11,
          letterSpacing:'0.10em', textTransform:'uppercase',
          color: currentTab==='rules' ? t.primary : t.textMuted,
          cursor:'pointer',
        }}>Reglas</button>
        <button onClick={onNavRanking} style={{
          padding:'8px 10px', background: currentTab==='ranking' ? t.primary : 'transparent',
          color: currentTab==='ranking' ? '#fff' : t.primary,
          border: `1.5px solid ${t.primary}`, borderRadius:4,
          fontFamily:'Titillium Web', fontWeight:700, fontSize:11,
          letterSpacing:'0.10em', textTransform:'uppercase',
          cursor:'pointer',
        }}>Ranking</button>
      </div>
    </div>
  );
}

// ─── Brand mark — official Prode Binda 2026 logo ──────────────────
function BrandLogo({ size=40, dark }) {
  return (
    <img
      src="assets/logo-prode-binda.png"
      alt="Prode Binda 2026"
      style={{
        width: size, height: size,
        objectFit: 'contain',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────
function Tabs({ tabs, active, onChange, dark, variant='primary' }) {
  const t = pbTheme(dark);
  return (
    <div style={{
      display:'flex',
      borderBottom: variant==='primary' ? `1px solid ${t.border}` : 'none',
      background: t.surface,
      padding: variant==='secondary' ? '4px' : '0',
      borderRadius: variant==='secondary' ? 4 : 0,
      border: variant==='secondary' ? `1px solid ${t.border}` : 'none',
      gap: variant==='secondary' ? 2 : 0,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.value;
        if (variant === 'secondary') {
          return (
            <button key={tab.value} onClick={() => onChange(tab.value)} style={{
              flex:1,
              padding:'8px 10px',
              background: isActive ? t.primary : 'transparent',
              color: isActive ? '#fff' : t.textMuted,
              border:'none', borderRadius:3,
              fontFamily:'Titillium Web',
              fontWeight: isActive ? 700 : 400,
              fontSize:11, letterSpacing:'0.08em',
              textTransform:'uppercase',
              cursor:'pointer',
              transition:'all 120ms',
            }}>{tab.label}</button>
          );
        }
        return (
          <button key={tab.value} onClick={() => onChange(tab.value)} style={{
            flex:1,
            padding:'14px 6px',
            background:'transparent',
            color: isActive ? t.text : t.textMuted,
            border:'none',
            borderBottom: `2px solid ${isActive ? t.primary : 'transparent'}`,
            fontFamily:'Titillium Web',
            fontWeight: isActive ? 700 : 400,
            fontSize:13, letterSpacing:'0.08em',
            textTransform:'uppercase',
            cursor:'pointer',
            marginBottom:-1,
          }}>{tab.label}</button>
        );
      })}
    </div>
  );
}

// ─── Modal sheet ───────────────────────────────────────────────────
function Modal({ open, onClose, children, dark, title }) {
  const t = pbTheme(dark);
  if (!open) return null;
  return (
    <div style={{
      position:'absolute', inset:0,
      background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      zIndex:50,
      animation:'pb-fadein 200ms ease',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxHeight:'85%',
        background: t.surface,
        borderRadius:'16px 16px 0 0',
        padding:'10px 16px 16px',
        overflowY:'auto',
        animation:'pb-slideup 240ms cubic-bezier(.22,1,.36,1)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.20)',
      }}>
        <div style={{
          width:36, height:4, borderRadius:2,
          background: t.borderStrong,
          margin:'0 auto 12px',
        }}/>
        {title && (
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:13,
            letterSpacing:'0.08em', textTransform:'uppercase',
            color:t.textMuted, textAlign:'center', marginBottom:10,
          }}>{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  PB_COLORS, pbTheme,
  PBButton, PBInput, PinInput, Avatar, StatusTag, FlagChip,
  ScoreBox, MatchCard, AppHeader, BrandLogo, Tabs, Modal,
});
