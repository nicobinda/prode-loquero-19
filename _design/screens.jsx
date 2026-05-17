// screens.jsx — Prode Binda 2026 prototype screens

// ─────────────────────────────────────────────────────────────────
// WELCOME — DNI then PIN, blurred crowd background
// ─────────────────────────────────────────────────────────────────
function WelcomeScreen({ onSuccess, dark }) {
  const t = window.pbTheme(dark);
  const [step, setStep] = React.useState('dni'); // 'dni' | 'pin'
  const [dni, setDni] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(null);

  function continueDni() {
    setError(null);
    if (!/^\d{7,8}$/.test(dni.replace(/\./g,''))) {
      setError('Ingresá un DNI válido (7 u 8 dígitos)');
      return;
    }
    setStep('pin');
  }

  React.useEffect(() => {
    if (pin.length === 4) {
      // any 4 digits OK; "wrong" demo: 0000
      if (pin === '0000') {
        setError('PIN incorrecto. Probá de nuevo.');
        setTimeout(() => { setPin(''); setError(null); }, 1500);
      } else {
        setTimeout(onSuccess, 350);
      }
    }
  }, [pin]);

  return (
    <div style={{
      width:'100%', height:'100%',
      position:'relative',
      background: PB_COLORS.deepBlue,
      overflow:'hidden',
      color:'#fff',
    }}>
      {/* Background illustration */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage: 'url(assets/welcome-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}/>
      {/* Dark overlay for legibility */}
      <div style={{
        position:'absolute', inset:0,
        background: 'linear-gradient(180deg, rgba(8,16,46,0.55) 0%, rgba(8,16,46,0.65) 40%, rgba(8,16,46,0.92) 80%, rgba(8,16,46,0.98) 100%)',
      }}/>
      <div style={{
        position:'relative', zIndex:1,
        height:'100%',
        padding:'48px 28px 32px',
        display:'flex', flexDirection:'column',
      }}>
        {/* Logo */}
        <div style={{
          display:'flex', justifyContent:'center', alignItems:'center',
          marginTop:32,
        }}>
          <BrandLogo size={180}/>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:14,
            letterSpacing:'0.10em', textTransform:'uppercase',
            color: PB_COLORS.ceruleo, marginBottom:8,
          }}>
            {step === 'dni' ? '¡Hola, familia!' : 'Te conocemos…'}
          </div>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:24, lineHeight:'30px',
            color:'#fff', marginBottom:24,
          }}>
            {step === 'dni'
              ? 'Ingresá tu DNI para entrar al Prode'
              : 'Ahora poné tu PIN de 4 dígitos'}
          </div>

          {step === 'dni' ? (
            <div>
              <PBInput
                label="DNI"
                value={dni}
                onChange={v => { setDni(v.replace(/\D/g,'').slice(0,8)); setError(null); }}
                placeholder="30.123.456"
                inputMode="numeric"
                error={error}
                dark={true}
                autoFocus
              />
              <div style={{ marginTop:18 }}>
                <PBButton onClick={continueDni} dark={true} disabled={!dni}>
                  Continuar
                </PBButton>
              </div>
              <div style={{
                marginTop:14, textAlign:'center',
                fontFamily:'Lato', fontSize:12,
                color:'rgba(255,255,255,0.55)',
              }}>
                Demo: probá con cualquier DNI de 7-8 dígitos
              </div>
            </div>
          ) : (
            <div>
              <PinInput value={pin} onChange={setPin} length={4} error={error} dark={true} autoFocus/>
              <div style={{ marginTop:20, textAlign:'center' }}>
                <button onClick={() => { setStep('dni'); setPin(''); setError(null); }} style={{
                  background:'transparent', border:'none', cursor:'pointer',
                  fontFamily:'Lato', fontWeight:700, fontSize:13,
                  color:'rgba(255,255,255,0.65)',
                  letterSpacing:'0.04em',
                  padding:8,
                }}>← Cambiar DNI</button>
              </div>
              <div style={{
                marginTop:18, textAlign:'center',
                fontFamily:'Lato', fontSize:12,
                color:'rgba(255,255,255,0.55)',
              }}>
                Demo: cualquier PIN de 4 dígitos (0000 falla)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Crowd backdrop — abstract blurred-people effect ───────────────
function CrowdBackdrop() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
      {/* base color wash */}
      <div style={{
        position:'absolute', inset:0,
        background: `
          radial-gradient(ellipse 80% 50% at 30% 20%, rgba(96,77,255,0.55), transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 30%, rgba(97,141,255,0.45), transparent 60%),
          radial-gradient(ellipse 70% 50% at 50% 90%, rgba(255,215,71,0.20), transparent 70%),
          linear-gradient(180deg, ${PB_COLORS.deepBlue} 0%, #050B2E 100%)
        `,
      }}/>
      {/* "crowd" dot pattern at bottom */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, height:'45%',
        backgroundImage: `
          radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 2px),
          radial-gradient(circle, rgba(255,215,71,0.20) 1.5px, transparent 2.5px)
        `,
        backgroundSize: '12px 12px, 24px 24px',
        backgroundPosition: '0 0, 6px 8px',
        filter: 'blur(0.6px)',
        maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 90%, transparent 100%)',
        opacity: 0.85,
      }}/>
      {/* subtle scanlight */}
      <div style={{
        position:'absolute', top:'-20%', left:'-20%', width:'140%', height:'60%',
        background:'radial-gradient(ellipse at center, rgba(255,255,255,0.10), transparent 60%)',
        filter:'blur(20px)',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROFILE SETUP — apodo + foto
// ─────────────────────────────────────────────────────────────────
function ProfileSetupScreen({ onComplete, dark }) {
  const t = window.pbTheme(dark);
  const [nick, setNick] = React.useState('');
  const [photo, setPhoto] = React.useState(null);
  const fileRef = React.useRef(null);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPhoto(url);
  }

  return (
    <div style={{
      width:'100%', height:'100%',
      background: t.bg, color: t.text,
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      <div style={{
        padding:'max(58px, env(safe-area-inset-top, 18px)) 16px 14px',
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        display:'flex', alignItems:'center', gap:10,
      }}>
        <BrandLogo size={28} dark={dark}/>
        <div style={{
          fontFamily:'Titillium Web', fontWeight:700, fontSize:13,
          letterSpacing:'0.10em', textTransform:'uppercase',
          color: t.textMuted,
        }}>Casi listo</div>
      </div>
      <div style={{ flex:1, padding:'24px 22px 20px', overflowY:'auto' }}>
        <div style={{
          fontFamily:'Titillium Web', fontWeight:700, fontSize:24, lineHeight:'30px',
          color: t.text, marginBottom:8,
        }}>Armemos tu perfil</div>
        <div style={{
          fontFamily:'Lato', fontSize:14, lineHeight:'20px',
          color: t.textMuted, marginBottom:28,
        }}>Así te reconocen los demás en el ranking y en los partidos.</div>

        {/* Photo upload */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 }}>
          <div onClick={() => fileRef.current?.click()} style={{
            width:128, height:128, borderRadius:'50%',
            background: photo ? `url(${photo}) center/cover` : t.surfaceAlt,
            border: `2px dashed ${photo ? 'transparent' : t.borderStrong}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', position:'relative',
            boxShadow: photo ? t.shadow : 'none',
          }}>
            {!photo && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:4, opacity:0.5 }}>📷</div>
                <div style={{
                  fontFamily:'Lato', fontSize:11, fontWeight:600,
                  color: t.textMuted, letterSpacing:'0.04em',
                }}>Subí tu foto</div>
              </div>
            )}
            {photo && (
              <div style={{
                position:'absolute', bottom:4, right:4,
                width:32, height:32, borderRadius:'50%',
                background: t.primary, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, boxShadow: t.shadow,
              }}>✎</div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} style={{ display:'none' }}/>
          <div style={{
            marginTop:10, fontFamily:'Lato', fontSize:12,
            color: t.textDim,
          }}>JPG o PNG · Hasta 5MB</div>
        </div>

        <PBInput
          label="Apodo"
          value={nick}
          onChange={setNick}
          placeholder="Ej: Tincho, Lala, El Negro…"
          dark={dark}
          maxLength={20}
        />
        <div style={{
          marginTop:6, fontFamily:'Lato', fontSize:12,
          color: t.textMuted,
        }}>{nick.length}/20</div>
      </div>
      <div style={{
        padding:'16px 22px 24px',
        background: t.surface,
        borderTop:`1px solid ${t.border}`,
      }}>
        <PBButton
          onClick={() => onComplete({ nick: nick || 'Tincho', photoUrl: photo })}
          dark={dark}
          disabled={!nick.trim()}
        >
          Empezar a jugar →
        </PBButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HOME — Pantalla principal
// ─────────────────────────────────────────────────────────────────
function HomeScreen({ user, dark, density, layout, predictions, setPredictions, tournamentState, onNavRanking, onNavRules, onOpenMatch }) {
  const t = window.pbTheme(dark);
  const [phase, setPhase] = React.useState(getDefaultPhase(tournamentState));
  const [groupBy, setGroupBy] = React.useState('day'); // 'zone' | 'day'

  function getDefaultPhase(state) {
    if (state === 'mid') return 1;
    if (state === 'end') return 3;
    return 1;
  }

  // Apply tournament state to matches
  const allMatches = React.useMemo(() => {
    const ms = phase===1 ? PHASE_1 : phase===2 ? PHASE_2 : PHASE_3;
    return ms.map(m => applyState(m, tournamentState, phase));
  }, [phase, tournamentState]);

  // Group matches by zone or day
  const grouped = React.useMemo(() => {
    const g = {};
    allMatches.forEach(m => {
      const key = groupBy === 'zone' ? `Grupo ${m.group}` : m.day;
      if (m.phase >= 2 && groupBy === 'zone') {
        // For phase 2/3, group by stage name
        const k2 = m.stage;
        if (!g[k2]) g[k2] = [];
        g[k2].push(m);
      } else {
        if (!g[key]) g[key] = [];
        g[key].push(m);
      }
    });
    return g;
  }, [allMatches, groupBy]);

  function setScore(matchId, score) {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId]||{}), 'u-vos': score },
    }));
  }

  // Stats: pending vs total
  const myPending = allMatches.filter(m => m.status === 'upcoming' && !predictions[m.id]?.['u-vos']).length;
  const myTotal = allMatches.filter(m => m.status === 'upcoming').length;

  return (
    <div style={{
      width:'100%', height:'100%',
      background: t.bg, color: t.text,
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      <AppHeader
        onNavRanking={onNavRanking}
        onNavRules={onNavRules}
        onNavHome={() => {}}
        currentTab="home"
        dark={dark}
        user={user}
      />
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch' }}>
        {/* Welcome strip with my stats */}
        <div style={{
          padding:'16px 16px 0',
          background: t.bg,
        }}>
          <div style={{
            background: dark
              ? `linear-gradient(135deg, ${PB_COLORS.deepBlue}, ${PB_COLORS.violeta})`
              : `linear-gradient(135deg, ${PB_COLORS.navy}, ${PB_COLORS.violeta})`,
            color:'#fff', borderRadius:6, padding:'14px 16px',
            display:'flex', alignItems:'center', gap:14,
            boxShadow:'0 4px 12px rgba(11,29,94,0.18)',
          }}>
            <Avatar player={user} size={48}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:700, fontSize:11,
                letterSpacing:'0.10em', textTransform:'uppercase',
                color:'rgba(255,255,255,0.7)',
              }}>Hola, {user.nick}</div>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:700, fontSize:18,
                lineHeight:'22px', marginTop:2,
              }}>{myPending > 0 ? `Te faltan ${myPending} pronósticos` : '¡Todo cargado, dale!'}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{
                fontFamily:'Titillium Web', fontSize:10, fontWeight:600,
                letterSpacing:'0.10em', color:'rgba(255,255,255,0.7)',
              }}>PUNTOS GENERAL</div>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:900, fontSize:24,
              }}>{LEADERBOARD.general.find(r => r.id==='u-vos')?.pts ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Phase tabs */}
        <div style={{ padding:'18px 0 0' }}>
          <Tabs
            tabs={[
              { value:1, label:'Fase 1' },
              { value:2, label:'Fase 2' },
              { value:3, label:'Fase 3' },
            ]}
            active={phase}
            onChange={setPhase}
            dark={dark}
          />
        </div>

        {/* Phase locked banner */}
        {((phase===2 && tournamentState==='start') || (phase===3 && tournamentState!=='end')) && (
          <div style={{
            margin:'14px 16px 0', padding:'12px 14px',
            background: dark ? 'rgba(255,215,71,0.10)' : 'rgba(255,215,71,0.18)',
            border: `1px solid rgba(255,215,71,0.5)`,
            borderRadius:4,
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{ fontSize:18 }}>🔒</span>
            <div style={{
              fontFamily:'Lato', fontSize:13, color: t.text, lineHeight:'18px',
            }}>Esta fase se habilita cuando termine la anterior. Mientras tanto, dale a la <b>Fase {phase-1}</b>.</div>
          </div>
        )}

        {/* View selector + sub-phase info */}
        <div style={{ padding:'14px 16px 6px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:12,
            letterSpacing:'0.08em', textTransform:'uppercase',
            color: t.textMuted, flex:1,
          }}>
            {phase===1 ? 'Fase de Grupos' : phase===2 ? '16vos · 8vos' : 'Cuartos · Semis · Final'}
            <span style={{ color:t.textDim, marginLeft:6 }}>
              · {phase===1?'72':phase===2?'24':'8'} partidos
            </span>
          </div>
          <div style={{ minWidth:170 }}>
            <Tabs
              tabs={[
                { value:'day', label:'Por Día' },
                { value:'zone', label: phase===1 ? 'Por Zona' : 'Por Etapa' },
              ]}
              active={groupBy}
              onChange={setGroupBy}
              dark={dark}
              variant="secondary"
            />
          </div>
        </div>

        {/* Match list */}
        <div style={{ padding:'8px 16px 24px', display:'flex', flexDirection:'column', gap:18 }}>
          {Object.entries(grouped).map(([heading, matches]) => (
            <div key={heading}>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:700, fontSize:13,
                letterSpacing:'0.10em', textTransform:'uppercase',
                color: t.text, marginBottom:8,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <span>{heading}</span>
                <div style={{ flex:1, height:1, background: t.border }}/>
                <span style={{ color:t.textMuted, fontSize:11 }}>{matches.length}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: density==='compact'?8:10 }}>
                {matches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    layout={layout}
                    dark={dark}
                    density={density}
                    prediction={predictions[m.id]?.['u-vos']}
                    onScore={(score) => setScore(m.id, score)}
                    onOpen={() => onOpenMatch(m)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Apply tournament state to a match. State drives what is finished/live/upcoming
function applyState(m, state, phase) {
  if (state === 'start') {
    return { ...m, status: 'upcoming', realScore: null, minute: null };
  }
  if (state === 'mid') {
    // Phase 1 mostly finished, some live, rest upcoming
    if (phase === 1) {
      const finishedIds = ['p1-01','p1-02','p1-03'];
      const liveIds = ['p1-04'];
      if (finishedIds.includes(m.id)) return { ...m, status:'finished' };
      if (liveIds.includes(m.id)) return { ...m, status:'live', minute:'67\'' };
      return { ...m, status:'upcoming', realScore: null, minute: null };
    }
    return { ...m, status:'upcoming', realScore: null, minute: null };
  }
  if (state === 'end') {
    // All Phase 1 & 2 finished. Phase 3 partially.
    if (phase <= 2) return { ...m, status:'finished', realScore: m.realScore || [Math.floor(Math.random()*4), Math.floor(Math.random()*4)] };
    if (phase === 3) {
      const finished3 = ['p3-01','p3-02','p3-03','p3-04','p3-05','p3-06'];
      const live3 = ['p3-07'];
      if (finished3.includes(m.id)) return { ...m, status:'finished', realScore: m.realScore || [2,1] };
      if (live3.includes(m.id)) return { ...m, status:'live', minute:'42\'' };
      return { ...m, status:'upcoming' };
    }
  }
  return m;
}

// ─────────────────────────────────────────────────────────────────
// MATCH DETAIL MODAL — predicciones + puntos
// ─────────────────────────────────────────────────────────────────
function MatchDetailModal({ match, predictions, onClose, dark }) {
  const t = window.pbTheme(dark);
  if (!match) return null;
  const home = window.TEAMS[match.home];
  const away = window.TEAMS[match.away];
  const finished = match.status === 'finished';
  const live = match.status === 'live';

  const myPred = predictions[match.id]?.['u-vos'];

  // Build list of all player predictions, with points if finished
  const rows = window.PLAYERS.map(p => {
    const pred = predictions[match.id]?.[p.id];
    const pts = finished && pred && match.realScore
      ? window.scoreMatch(match.phase, pred, match.realScore)
      : null;
    return { player: p, pred, pts };
  }).filter(r => r.pred);

  // Sort by points desc when finished, else by hitting outcome first
  if (finished) rows.sort((a,b) => (b.pts ?? 0) - (a.pts ?? 0));

  return (
    <Modal open={!!match} onClose={onClose} dark={dark}>
      {/* Header */}
      <div style={{
        fontFamily:'Titillium Web', fontWeight:600, fontSize:11,
        letterSpacing:'0.08em', textTransform:'uppercase',
        color: t.textMuted, textAlign:'center', marginBottom:6,
      }}>
        {match.stage} · {match.day} · {match.time}
      </div>
      {/* Big real score */}
      <div style={{
        background: dark ? PB_COLORS.deepBlue : PB_COLORS.veryLightBlue,
        borderRadius:6, padding:'16px 14px', marginBottom:14,
      }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
        }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <FlagChip code={match.home} size={36}/>
            <div style={{
              fontFamily:'Lato', fontWeight:700, fontSize:13,
              letterSpacing:'0.04em', color: dark?'#fff':t.text, textAlign:'center',
            }}>{home.name}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            {finished || live ? (
              <>
                <div style={{
                  fontFamily:'Titillium Web', fontWeight:900, fontSize:42,
                  color: dark?'#fff':PB_COLORS.navy, lineHeight:'42px',
                }}>{match.realScore[0]} – {match.realScore[1]}</div>
                <div style={{
                  fontFamily:'Titillium Web', fontWeight:700, fontSize:10,
                  letterSpacing:'0.10em', textTransform:'uppercase',
                  color: live ? t.red : (dark?'rgba(255,255,255,0.7)':t.textMuted),
                  marginTop:4,
                }}>
                  {live ? `EN VIVO · ${match.minute || '67\''}` : 'RESULTADO FINAL · FIFA'}
                </div>
              </>
            ) : (
              <div style={{
                fontFamily:'Titillium Web', fontWeight:700, fontSize:14,
                color: dark?'rgba(255,255,255,0.7)':t.textMuted,
                letterSpacing:'0.06em', textTransform:'uppercase',
              }}>Por jugar</div>
            )}
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <FlagChip code={match.away} size={36}/>
            <div style={{
              fontFamily:'Lato', fontWeight:700, fontSize:13,
              letterSpacing:'0.04em', color: dark?'#fff':t.text, textAlign:'center',
            }}>{away.name}</div>
          </div>
        </div>
      </div>

      {/* My prediction strip */}
      <div style={{
        background: t.surfaceAlt,
        border: `1px solid ${t.border}`,
        borderRadius:6, padding:'12px 14px', marginBottom:14,
        display:'flex', alignItems:'center', gap:12,
      }}>
        <Avatar player={window.PLAYERS.find(p=>p.id==='u-vos')} size={36} ring/>
        <div style={{ flex:1 }}>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:11,
            letterSpacing:'0.10em', textTransform:'uppercase',
            color: t.primary,
          }}>Tu pronóstico</div>
          <div style={{
            fontFamily:'Lato', fontSize:13, color: t.text, marginTop:2,
          }}>{myPred ? `${home.code} ${myPred[0]} – ${myPred[1]} ${away.code}` : 'No cargaste pronóstico para este partido'}</div>
        </div>
        {finished && myPred && (
          <PointsBadge pts={window.scoreMatch(match.phase, myPred, match.realScore)} dark={dark}/>
        )}
      </div>

      {/* All players' predictions */}
      <div style={{
        fontFamily:'Titillium Web', fontWeight:700, fontSize:12,
        letterSpacing:'0.08em', textTransform:'uppercase',
        color: t.textMuted, margin:'4px 0 8px',
      }}>
        Pronósticos del grupo
        {finished && <span style={{ color: t.textDim, marginLeft:6 }}>(ordenado por puntos)</span>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {rows.map(({ player, pred, pts }, idx) => (
          <div key={player.id} style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'8px 10px',
            background: player.isMe ? (dark?'rgba(97,141,255,0.10)':PB_COLORS.veryLightBlue) : 'transparent',
            border: player.isMe ? `1px solid ${t.chipBorder}` : `1px solid ${t.border}`,
            borderRadius:4,
          }}>
            {finished && (
              <div style={{
                width:20, textAlign:'center',
                fontFamily:'Titillium Web', fontWeight:700, fontSize:13,
                color: idx===0 ? t.success : t.textMuted,
              }}>{idx+1}</div>
            )}
            <Avatar player={player} size={28}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:'Lato', fontWeight: player.isMe ? 700 : 600, fontSize:14,
                color: t.text,
              }}>{player.nick}{player.isMe && <span style={{ color:t.primary, marginLeft:6, fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>VOS</span>}</div>
            </div>
            <div style={{
              fontFamily:'Titillium Web', fontWeight:700, fontSize:18,
              color: t.text,
              minWidth:48, textAlign:'right',
            }}>{pred[0]} – {pred[1]}</div>
            {finished && pts !== null && (
              <PointsBadge pts={pts} dark={dark}/>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop:18 }}>
        <PBButton onClick={onClose} dark={dark} variant="secondary">Cerrar</PBButton>
      </div>
    </Modal>
  );
}

function PointsBadge({ pts, dark }) {
  const t = window.pbTheme(dark);
  const color = pts === 0 ? t.textMuted : pts >= 6 ? t.success : t.primary;
  const bg = pts === 0 ? (dark?'rgba(255,255,255,0.05)':'#F2F2F2')
            : pts >= 6 ? (dark?'rgba(89,232,146,0.18)':'rgba(68,226,131,0.20)')
            : (dark?'rgba(97,141,255,0.18)':PB_COLORS.veryLightBlue);
  return (
    <div style={{
      minWidth:48, height:30, padding:'0 10px', borderRadius:4,
      background: bg, color,
      display:'flex', alignItems:'center', justifyContent:'center', gap:4,
      fontFamily:'Titillium Web', fontWeight:700, fontSize:14,
      letterSpacing:'0.04em',
    }}>
      <span style={{ fontWeight:900 }}>{pts}</span>
      <span style={{ fontSize:10, opacity:0.8 }}>PTS</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RANKING — 4 tabs
// ─────────────────────────────────────────────────────────────────
function RankingScreen({ user, dark, tournamentState, onNavHome, onNavRules }) {
  const t = window.pbTheme(dark);
  const [tab, setTab] = React.useState('phase1');

  const board = LEADERBOARD[tab];
  // Phase 1 finished if state is 'mid' or 'end'
  const phaseFinished = (tab === 'phase1' && (tournamentState === 'mid' || tournamentState === 'end'))
                      || (tab === 'phase2' && tournamentState === 'end')
                      || (tab === 'phase3' && false); // never quite finished in our states
  const winner = phaseFinished ? PLAYERS.find(p => p.id === board[0].id) : null;

  // Phase in play — show "X puntos todavía en juego"
  const phaseInPlay =
    (tab === 'phase1' && tournamentState === 'start') ||
    (tab === 'phase2' && tournamentState === 'mid')   ||
    (tab === 'phase3' && tournamentState === 'end');
  // Max points still attainable in the current phase. For the demo we assume
  // the bulk is yet to be played, so we surface the full theoretical maximum.
  // Phase 1: 72 partidos × 3 pts = 216 · Phase 2: 24 × 10 = 240 · Phase 3: 8 × 30 = 240
  const ptsInPlay = tab === 'phase1' ? 216 : tab === 'phase2' ? 240 : tab === 'phase3' ? 240 : 0;

  return (
    <div style={{
      width:'100%', height:'100%',
      background: t.bg, color: t.text,
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      <AppHeader
        onNavRanking={() => {}}
        onNavRules={onNavRules}
        onNavHome={onNavHome}
        currentTab="ranking"
        dark={dark}
        user={user}
      />
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'18px 16px 0' }}>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:900, fontSize:24,
            color: t.text, letterSpacing:'0.02em',
          }}>Ranking</div>
          <div style={{
            fontFamily:'Lato', fontSize:13, color: t.textMuted, marginTop:2,
          }}>¿Quién va ganando el Prode?</div>
        </div>
        <div style={{ padding:'18px 0 0' }}>
          <Tabs
            tabs={[
              { value:'phase1',  label:'Fase 1' },
              { value:'phase2',  label:'Fase 2' },
              { value:'phase3',  label:'Fase 3' },
              { value:'general', label:'General' },
            ]}
            active={tab}
            onChange={setTab}
            dark={dark}
          />
        </div>

        {/* Champion banner */}
        {winner && (
          <div style={{ padding:'18px 16px 0' }}>
            <ChampionBanner winner={winner} phaseLabel={tab==='phase1'?'Fase 1':tab==='phase2'?'Fase 2':'Fase 3'} dark={dark} pts={board[0].pts}/>
          </div>
        )}

        {/* Points still in play */}
        {phaseInPlay && (
          <div style={{
            margin:'16px 16px 0',
            padding:'12px 14px',
            background: dark ? 'rgba(89,232,146,0.10)' : 'rgba(68,226,131,0.12)',
            border: `1px solid ${dark?'rgba(89,232,146,0.30)':'rgba(40,180,90,0.30)'}`,
            borderRadius: 4,
            display:'flex', alignItems:'center', gap:12,
          }}>
            <div style={{
              width:34, height:34, borderRadius:'50%',
              background: dark ? 'rgba(89,232,146,0.18)' : 'rgba(68,226,131,0.22)',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.success} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:900, fontSize:18,
                color: t.text, lineHeight:'22px',
              }}>
                {ptsInPlay} <span style={{ fontSize:14, fontWeight:700, color:t.textMuted }}>pts</span>
              </div>
              <div style={{
                fontFamily:'Lato', fontSize:12, color: t.textMuted, marginTop:1,
              }}>todavía en juego en esta fase</div>
            </div>
          </div>
        )}

        {/* Pot info — only for general */}
        {tab === 'general' && (
          <div style={{
            margin:'16px 16px 0',
            padding:'12px 14px',
            background: dark?'rgba(255,255,255,0.04)':PB_COLORS.veryLightBlue,
            border: `1px solid ${t.border}`,
            borderRadius:4,
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:700, fontSize:11,
                letterSpacing:'0.10em', textTransform:'uppercase',
                color: t.textMuted,
              }}>Pozo total</div>
              <div style={{
                fontFamily:'Titillium Web', fontWeight:900, fontSize:22,
                color: t.text, marginTop:2,
              }}>USD 1.200</div>
            </div>
            <div style={{
              fontFamily:'Lato', fontSize:11, color: t.textMuted,
              textAlign:'right', lineHeight:'14px',
            }}>12 jugadores<br/>USD 100 c/u</div>
          </div>
        )}

        {/* Table */}
        <div style={{ padding:'18px 16px 30px' }}>
          <div style={{
            background: t.surface, border:`1px solid ${t.border}`,
            borderRadius:6, overflow:'hidden',
          }}>
            {/* Column header */}
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 14px',
              background: t.surfaceAlt,
              borderBottom: `1px solid ${t.border}`,
              fontFamily:'Titillium Web', fontWeight:700, fontSize:10,
              letterSpacing:'0.10em', textTransform:'uppercase',
              color: t.textMuted,
            }}>
              <span style={{ width:24 }}>#</span>
              <span style={{ width:32 }}/>
              <span style={{ flex:1 }}>Jugador</span>
              <span style={{ width:60, textAlign:'right' }}>Puntos</span>
            </div>
            {board.map((row, i) => {
              const player = PLAYERS.find(p => p.id === row.id);
              const isMe = player.isMe;
              const isWinner = i === 0 && phaseFinished;
              return (
                <div key={row.id} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 14px',
                  borderBottom: i < board.length - 1 ? `1px solid ${t.border}` : 'none',
                  background: isMe ? (dark?'rgba(97,141,255,0.10)':PB_COLORS.veryLightBlue) : 'transparent',
                }}>
                  <span style={{
                    width:24,
                    fontFamily:'Titillium Web', fontWeight:isWinner?900:700, fontSize:isWinner?18:14,
                    color: isWinner ? PB_COLORS.yellow : (i<3?t.primary:t.textMuted),
                  }}>{isWinner ? '👑' : i+1}</span>
                  <Avatar player={player} size={32} ring={isMe}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      fontFamily:'Lato', fontWeight:isMe||isWinner?700:600, fontSize:14,
                      color: t.text,
                    }}>{player.nick}{isMe && <span style={{ color:t.primary, marginLeft:6, fontSize:10, fontWeight:700, letterSpacing:'0.08em' }}>VOS</span>}</div>
                  </div>
                  <div style={{
                    width:60, textAlign:'right',
                    fontFamily:'Titillium Web', fontWeight:isWinner?900:700, fontSize:isWinner?20:18,
                    color: isWinner ? t.success : t.text,
                  }}>{row.pts}</div>
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop:14, fontFamily:'Lato', fontSize:11,
            color: t.textDim, textAlign:'center',
          }}>
            {tab === 'general' && 'Suma de las 3 fases · Actualizado en tiempo real'}
            {tab === 'phase1' && (phaseFinished ? 'Fase 1 finalizada · 72 partidos jugados' : '72 partidos · Fase de Grupos')}
            {tab === 'phase2' && (phaseFinished ? 'Fase 2 finalizada · 24 partidos' : '24 partidos · 16vos + 8vos')}
            {tab === 'phase3' && (phaseFinished ? 'Fase 3 finalizada · 8 partidos' : '8 partidos · 4tos, Semis y Final')}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChampionBanner({ winner, phaseLabel, dark, pts }) {
  const t = window.pbTheme(dark);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${PB_COLORS.deepBlue} 0%, ${PB_COLORS.violeta} 100%)`,
      color:'#fff', borderRadius:6, padding:'18px 16px',
      position:'relative', overflow:'hidden',
      boxShadow:'0 8px 24px rgba(11,29,94,0.25)',
    }}>
      {/* Decorative confetti dots */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`
          radial-gradient(circle at 10% 20%, rgba(255,215,71,0.5) 1.5px, transparent 2px),
          radial-gradient(circle at 80% 30%, rgba(89,232,146,0.4) 1.5px, transparent 2px),
          radial-gradient(circle at 30% 80%, rgba(97,141,255,0.4) 1.5px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(255,89,89,0.4) 1.5px, transparent 2px)
        `,
        backgroundSize:'80px 80px',
        opacity:0.7,
      }}/>
      <div style={{ position:'relative', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{
          width:56, height:56, borderRadius:'50%',
          background:`radial-gradient(circle, ${PB_COLORS.yellow} 60%, transparent 70%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:32,
        }}>🏆</div>
        <div style={{ flex:1 }}>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:11,
            letterSpacing:'0.16em', textTransform:'uppercase',
            color: PB_COLORS.yellow,
          }}>Campeón de {phaseLabel}</div>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:900, fontSize:22,
            letterSpacing:'0.02em', marginTop:2,
          }}>{winner.nick.toUpperCase()}</div>
          <div style={{
            fontFamily:'Lato', fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:2,
          }}>{pts} puntos · 20% del pozo</div>
        </div>
        <Avatar player={winner} size={48}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RULES — Reglas screen
// ─────────────────────────────────────────────────────────────────
function RulesScreen({ user, dark, onNavHome, onNavRanking, onNavAccount }) {
  const t = window.pbTheme(dark);
  const Section = ({ children }) => (
    <div style={{
      fontFamily:'Lato', fontSize:14, lineHeight:'22px', color: t.text,
      marginBottom:14,
    }}>{children}</div>
  );
  const H = ({ children }) => (
    <div style={{
      fontFamily:'Titillium Web', fontWeight:700, fontSize:13,
      letterSpacing:'0.10em', textTransform:'uppercase',
      color: t.primary, marginBottom:8, marginTop:18,
    }}>{children}</div>
  );

  return (
    <div style={{
      width:'100%', height:'100%',
      background: t.bg, color: t.text,
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      <AppHeader
        onNavRanking={onNavRanking}
        onNavRules={() => {}}
        onNavHome={onNavHome}
        currentTab="rules"
        dark={dark}
        user={user}
      />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 20px 32px' }}>
        <div style={{
          fontFamily:'Titillium Web', fontWeight:900, fontSize:26,
          color: t.text, letterSpacing:'0.02em',
        }}>Reglas del Prode</div>
        <div style={{
          fontFamily:'Lato', fontSize:13, color: t.textMuted, marginTop:4, marginBottom:16,
        }}>Léelas con calma, después no decimos que no avisamos.</div>

        <H>El campeonato</H>
        <Section>
          El Prode tiene <b>un campeón general</b>: el jugador que sume más puntos en total.
          Además hay <b>3 etapas</b>, cada una con su ganador. Los puntajes se reinician
          entre etapas, pero suman para el general.
        </Section>
        <ul style={{ margin:'-6px 0 14px 18px', padding:0, fontFamily:'Lato', fontSize:14, lineHeight:'22px', color: t.text }}>
          <li><b>Etapa 1:</b> Fase de grupos (72 partidos)</li>
          <li><b>Etapa 2:</b> 16vos y 8vos (24 partidos)</li>
          <li><b>Etapa 3:</b> 4tos, Semis y Final (8 partidos)</li>
        </ul>

        <H>Cargar resultados</H>
        <Section>
          Podés cargar y corregir tus pronósticos cuando quieras, <b>hasta el inicio del partido</b>.
          Una vez que arranca, queda fijo. Si no cargás un resultado, ese partido te suma <b>0 puntos</b>.
        </Section>
        <Section>
          Hasta que arranca un partido, <b>nadie puede ver lo que cargaron los demás</b>.
          Una vez iniciado, se publican todas las respuestas.
        </Section>

        <H>Puntajes — Etapa 1</H>
        <PointsTable rows={[
          ['+1', 'Acertar si gana A, B o empata'],
          ['+1', 'Acertar cantidad exacta de goles del Equipo A'],
          ['+1', 'Acertar cantidad exacta de goles del Equipo B'],
        ]} dark={dark}/>

        <H>Puntajes — Etapa 2</H>
        <PointsTable rows={[
          ['+3', 'Acertar quién pasa de ronda'],
          ['+3', 'Acertar cantidad exacta de goles del Equipo A'],
          ['+3', 'Acertar cantidad exacta de goles del Equipo B'],
          ['+1', 'Acertar si fueron a penales'],
        ]} dark={dark}/>

        <H>Puntajes — Etapa 3</H>
        <PointsTable rows={[
          ['+9', 'Acertar quién pasa de ronda'],
          ['+9', 'Acertar cantidad exacta de goles del Equipo A'],
          ['+9', 'Acertar cantidad exacta de goles del Equipo B'],
          ['+3', 'Acertar si fueron a penales'],
        ]} dark={dark}/>

        <H>Premios</H>
        <Section>
          La participación cuesta <b>USD 100</b>. El pozo se reparte así:
        </Section>
        <PrizeBars dark={dark}/>
        <Section style={{ marginTop:10 }}>
          Si hay empate entre ganadores de una etapa, el premio se reparte equitativamente
          entre todos los empatados.
        </Section>

        <H>Otros detalles</H>
        <ul style={{ margin:'0 0 0 18px', padding:0, fontFamily:'Lato', fontSize:14, lineHeight:'22px', color: t.text }}>
          <li>Las Etapas 2 y 3 sólo se habilitan al terminar la anterior.</li>
          <li>El resultado oficial es el que publica la FIFA.</li>
        </ul>

        <div style={{ marginTop:32 }}>
          <PBButton onClick={onNavAccount} dark={dark} variant="secondary">
            Mi cuenta
          </PBButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MI CUENTA — editar apodo y foto, cerrar sesión
// ─────────────────────────────────────────────────────────────────
function AccountScreen({ user, setUser, dark, onNavHome, onNavRanking, onNavRules, onLogout }) {
  const t = window.pbTheme(dark);
  const [nick, setNick] = React.useState(user.nick || '');
  const [photo, setPhoto] = React.useState(user.photoUrl || null);
  const [saved, setSaved] = React.useState(false);
  const fileRef = React.useRef(null);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(URL.createObjectURL(f));
    setSaved(false);
  }

  function save() {
    setUser(u => ({ ...u, nick: nick.trim() || u.nick, photoUrl: photo }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const dirty = (nick.trim() !== user.nick) || (photo !== user.photoUrl);

  return (
    <div style={{
      width:'100%', height:'100%',
      background: t.bg, color: t.text,
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      <AppHeader
        onNavRanking={onNavRanking}
        onNavRules={onNavRules}
        onNavHome={onNavHome}
        currentTab="account"
        dark={dark}
        user={user}
      />
      <div style={{ flex:1, overflowY:'auto', padding:'18px 22px 24px' }}>
        <div style={{
          fontFamily:'Titillium Web', fontWeight:900, fontSize:26,
          color: t.text, letterSpacing:'0.02em',
        }}>Mi cuenta</div>
        <div style={{
          fontFamily:'Lato', fontSize:13, color: t.textMuted, marginTop:4, marginBottom:24,
        }}>Editá tu apodo y foto. Cambios visibles para el resto del grupo.</div>

        {/* Photo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <div onClick={() => fileRef.current?.click()} style={{
            width:120, height:120, borderRadius:'50%',
            background: photo ? `url(${photo}) center/cover` : t.surfaceAlt,
            border: `2px dashed ${photo ? 'transparent' : t.borderStrong}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', position:'relative',
            boxShadow: photo ? t.shadow : 'none',
          }}>
            {!photo && <div style={{ fontSize:30, opacity:0.5 }}>📷</div>}
            <div style={{
              position:'absolute', bottom:2, right:2,
              width:30, height:30, borderRadius:'50%',
              background: t.primary, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, boxShadow: t.shadow,
            }}>✎</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} style={{ display:'none' }}/>
          <div style={{
            marginTop:8, fontFamily:'Lato', fontSize:12,
            color: t.textDim,
          }}>Tocá para cambiar la foto</div>
        </div>

        {/* Apodo */}
        <PBInput
          label="Apodo"
          value={nick}
          onChange={v => { setNick(v); setSaved(false); }}
          placeholder="Tu apodo"
          dark={dark}
          maxLength={20}
        />
        <div style={{
          marginTop:6, fontFamily:'Lato', fontSize:12,
          color: t.textMuted,
        }}>{nick.length}/20</div>

        <div style={{ marginTop:20 }}>
          <PBButton onClick={save} dark={dark} disabled={!dirty || !nick.trim()}>
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </PBButton>
        </div>

        {/* Logout */}
        <div style={{
          marginTop:36, paddingTop:20,
          borderTop: `1px solid ${t.border}`,
        }}>
          <div style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:13,
            letterSpacing:'0.10em', textTransform:'uppercase',
            color: t.textMuted, marginBottom:12,
          }}>Sesión</div>
          <button onClick={onLogout} style={{
            width:'100%', padding:'14px 16px',
            background:'transparent',
            border:`1.5px solid ${PB_COLORS.red || '#E54848'}`,
            color: PB_COLORS.red || '#E54848',
            borderRadius:4,
            fontFamily:'Titillium Web', fontWeight:700, fontSize:14,
            letterSpacing:'0.08em', textTransform:'uppercase',
            cursor:'pointer',
          }}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

function PointsTable({ rows, dark }) {
  const t = window.pbTheme(dark);
  return (
    <div style={{
      background: t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:4,
      overflow:'hidden', marginBottom:14,
    }}>
      {rows.map(([pts, desc], i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 14px',
          borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : 'none',
        }}>
          <div style={{
            minWidth:44, padding:'2px 8px',
            background: t.primary, color:'#fff', borderRadius:3,
            fontFamily:'Titillium Web', fontWeight:900, fontSize:14,
            textAlign:'center',
          }}>{pts}</div>
          <div style={{
            fontFamily:'Lato', fontSize:14, color: t.text,
            lineHeight:'18px',
          }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

function PrizeBars({ dark }) {
  const t = window.pbTheme(dark);
  const rows = [
    { label:'Campeón general', pct:40, color:PB_COLORS.violeta },
    { label:'Campeón Etapa 1', pct:20, color:PB_COLORS.ceruleo },
    { label:'Campeón Etapa 2', pct:20, color:PB_COLORS.green },
    { label:'Campeón Etapa 3', pct:20, color:PB_COLORS.yellow },
  ];
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      borderTop:`1px solid ${t.border}`,
    }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 0',
          borderBottom:`1px solid ${t.border}`,
        }}>
          <span style={{
            width:8, height:8, borderRadius:'50%',
            background:r.color, flexShrink:0,
          }}/>
          <span style={{
            flex:1, fontFamily:'Lato', fontSize:14, color: t.text,
          }}>{r.label}</span>
          <span style={{
            fontFamily:'Titillium Web', fontWeight:700, fontSize:18,
            color: t.text, letterSpacing:0.2,
          }}>{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  WelcomeScreen, ProfileSetupScreen, HomeScreen, MatchDetailModal, RankingScreen, RulesScreen, AccountScreen,
});
