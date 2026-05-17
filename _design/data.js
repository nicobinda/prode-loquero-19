// Hardcoded data for Prode Binda 2026 prototype

const TEAMS = {
  ARG: { name: 'Argentina',   flag: '🇦🇷', code: 'ARG' },
  BRA: { name: 'Brasil',      flag: '🇧🇷', code: 'BRA' },
  FRA: { name: 'Francia',     flag: '🇫🇷', code: 'FRA' },
  ESP: { name: 'España',      flag: '🇪🇸', code: 'ESP' },
  ENG: { name: 'Inglaterra',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
  GER: { name: 'Alemania',    flag: '🇩🇪', code: 'GER' },
  POR: { name: 'Portugal',    flag: '🇵🇹', code: 'POR' },
  NED: { name: 'Países Bajos',flag: '🇳🇱', code: 'NED' },
  ITA: { name: 'Italia',      flag: '🇮🇹', code: 'ITA' },
  BEL: { name: 'Bélgica',     flag: '🇧🇪', code: 'BEL' },
  CRO: { name: 'Croacia',     flag: '🇭🇷', code: 'CRO' },
  URU: { name: 'Uruguay',     flag: '🇺🇾', code: 'URU' },
  COL: { name: 'Colombia',    flag: '🇨🇴', code: 'COL' },
  MEX: { name: 'México',      flag: '🇲🇽', code: 'MEX' },
  USA: { name: 'EE.UU.',      flag: '🇺🇸', code: 'USA' },
  CAN: { name: 'Canadá',      flag: '🇨🇦', code: 'CAN' },
  JPN: { name: 'Japón',       flag: '🇯🇵', code: 'JPN' },
  KOR: { name: 'Corea del Sur',flag:'🇰🇷', code: 'KOR' },
  MAR: { name: 'Marruecos',   flag: '🇲🇦', code: 'MAR' },
  SEN: { name: 'Senegal',     flag: '🇸🇳', code: 'SEN' },
  AUS: { name: 'Australia',   flag: '🇦🇺', code: 'AUS' },
  ECU: { name: 'Ecuador',     flag: '🇪🇨', code: 'ECU' },
  CHL: { name: 'Chile',       flag: '🇨🇱', code: 'CHL' },
  PAR: { name: 'Paraguay',    flag: '🇵🇾', code: 'PAR' },
};

// Phase 1: 12 sample group-stage matches across multiple groups & days
// status: 'upcoming' | 'live' | 'finished'
const PHASE_1 = [
  // Group A
  { id:'p1-01', phase:1, group:'A', stage:'Fase de Grupos', date:'2026-06-11', day:'Jue 11 Jun', time:'17:00', venue:'Estadio Azteca', home:'MEX', away:'JPN', status:'finished',  realScore:[2,1] },
  { id:'p1-02', phase:1, group:'A', stage:'Fase de Grupos', date:'2026-06-11', day:'Jue 11 Jun', time:'20:00', venue:'BMO Field',     home:'CAN', away:'KOR', status:'finished',  realScore:[1,1] },
  // Group B
  { id:'p1-03', phase:1, group:'B', stage:'Fase de Grupos', date:'2026-06-12', day:'Vie 12 Jun', time:'14:00', venue:'SoFi Stadium', home:'USA', away:'AUS', status:'finished',  realScore:[3,0] },
  { id:'p1-04', phase:1, group:'B', stage:'Fase de Grupos', date:'2026-06-12', day:'Vie 12 Jun', time:'17:00', venue:'MetLife',      home:'ENG', away:'SEN', status:'live',     realScore:[1,0], minute:'67\'' },
  // Group C — Argentina!
  { id:'p1-05', phase:1, group:'C', stage:'Fase de Grupos', date:'2026-06-13', day:'Sáb 13 Jun', time:'16:00', venue:'Estadio Monumental Norte', home:'ARG', away:'CRO', status:'upcoming' },
  { id:'p1-06', phase:1, group:'C', stage:'Fase de Grupos', date:'2026-06-13', day:'Sáb 13 Jun', time:'19:00', venue:'Lincoln Field', home:'ECU', away:'PAR', status:'upcoming' },
  // Group D
  { id:'p1-07', phase:1, group:'D', stage:'Fase de Grupos', date:'2026-06-14', day:'Dom 14 Jun', time:'15:00', venue:'Levi\'s Stadium', home:'BRA', away:'COL', status:'upcoming' },
  { id:'p1-08', phase:1, group:'D', stage:'Fase de Grupos', date:'2026-06-14', day:'Dom 14 Jun', time:'18:00', venue:'NRG Stadium',    home:'FRA', away:'MAR', status:'upcoming' },
  // Group E
  { id:'p1-09', phase:1, group:'E', stage:'Fase de Grupos', date:'2026-06-15', day:'Lun 15 Jun', time:'14:00', venue:'AT&T Stadium',   home:'ESP', away:'ITA', status:'upcoming' },
  { id:'p1-10', phase:1, group:'E', stage:'Fase de Grupos', date:'2026-06-15', day:'Lun 15 Jun', time:'17:00', venue:'Mercedes-Benz',  home:'POR', away:'URU', status:'upcoming' },
  // Group F
  { id:'p1-11', phase:1, group:'F', stage:'Fase de Grupos', date:'2026-06-16', day:'Mar 16 Jun', time:'14:00', venue:'Lumen Field',    home:'GER', away:'BEL', status:'upcoming' },
  { id:'p1-12', phase:1, group:'F', stage:'Fase de Grupos', date:'2026-06-16', day:'Mar 16 Jun', time:'17:00', venue:'Gillette',       home:'NED', away:'CHL', status:'upcoming' },
];

const PHASE_2 = [
  // 16vos
  { id:'p2-01', phase:2, group:'16vos', stage:'16vos de Final', date:'2026-06-28', day:'Dom 28 Jun', time:'15:00', venue:'MetLife',     home:'ARG', away:'JPN', status:'upcoming', penalties:false },
  { id:'p2-02', phase:2, group:'16vos', stage:'16vos de Final', date:'2026-06-28', day:'Dom 28 Jun', time:'19:00', venue:'NRG Stadium', home:'BRA', away:'AUS', status:'upcoming', penalties:false },
  { id:'p2-03', phase:2, group:'16vos', stage:'16vos de Final', date:'2026-06-29', day:'Lun 29 Jun', time:'15:00', venue:'SoFi',        home:'FRA', away:'KOR', status:'upcoming', penalties:false },
  { id:'p2-04', phase:2, group:'16vos', stage:'16vos de Final', date:'2026-06-29', day:'Lun 29 Jun', time:'19:00', venue:'AT&T',        home:'ESP', away:'SEN', status:'upcoming', penalties:false },
  // 8vos
  { id:'p2-05', phase:2, group:'8vos', stage:'Octavos de Final', date:'2026-07-04', day:'Sáb 4 Jul',  time:'16:00', venue:'Mercedes-Benz', home:'ARG', away:'POR', status:'upcoming', penalties:false },
  { id:'p2-06', phase:2, group:'8vos', stage:'Octavos de Final', date:'2026-07-04', day:'Sáb 4 Jul',  time:'20:00', venue:'Lumen Field',   home:'BRA', away:'ENG', status:'upcoming', penalties:false },
  { id:'p2-07', phase:2, group:'8vos', stage:'Octavos de Final', date:'2026-07-05', day:'Dom 5 Jul',  time:'16:00', venue:'Levi\'s',       home:'FRA', away:'GER', status:'upcoming', penalties:false },
  { id:'p2-08', phase:2, group:'8vos', stage:'Octavos de Final', date:'2026-07-05', day:'Dom 5 Jul',  time:'20:00', venue:'Gillette',      home:'ESP', away:'NED', status:'upcoming', penalties:false },
];

const PHASE_3 = [
  { id:'p3-01', phase:3, group:'4tos', stage:'Cuartos de Final', date:'2026-07-09', day:'Jue 9 Jul',  time:'16:00', venue:'AT&T',        home:'ARG', away:'BRA', status:'upcoming', penalties:false },
  { id:'p3-02', phase:3, group:'4tos', stage:'Cuartos de Final', date:'2026-07-09', day:'Jue 9 Jul',  time:'20:00', venue:'MetLife',     home:'FRA', away:'ESP', status:'upcoming', penalties:false },
  { id:'p3-03', phase:3, group:'4tos', stage:'Cuartos de Final', date:'2026-07-10', day:'Vie 10 Jul', time:'16:00', venue:'NRG',         home:'GER', away:'POR', status:'upcoming', penalties:false },
  { id:'p3-04', phase:3, group:'4tos', stage:'Cuartos de Final', date:'2026-07-10', day:'Vie 10 Jul', time:'20:00', venue:'SoFi',        home:'NED', away:'ENG', status:'upcoming', penalties:false },
  { id:'p3-05', phase:3, group:'Semi', stage:'Semifinal',        date:'2026-07-14', day:'Mar 14 Jul', time:'19:00', venue:'AT&T',        home:'ARG', away:'FRA', status:'upcoming', penalties:false },
  { id:'p3-06', phase:3, group:'Semi', stage:'Semifinal',        date:'2026-07-15', day:'Mié 15 Jul', time:'19:00', venue:'MetLife',     home:'GER', away:'NED', status:'upcoming', penalties:false },
  { id:'p3-07', phase:3, group:'3er',  stage:'Tercer Puesto',    date:'2026-07-18', day:'Sáb 18 Jul', time:'15:00', venue:'NRG',         home:'FRA', away:'NED', status:'upcoming', penalties:false },
  { id:'p3-08', phase:3, group:'Final',stage:'FINAL',            date:'2026-07-19', day:'Dom 19 Jul', time:'15:00', venue:'MetLife — East Rutherford', home:'ARG', away:'GER', status:'upcoming', penalties:false },
];

const ALL_MATCHES = [...PHASE_1, ...PHASE_2, ...PHASE_3];

// Players (12) — current user is "vos" (Tincho)
const PLAYERS = [
  { id:'u-vos', nick:'Tincho',   real:'Martín B.',     avatar:'#618DFF', initials:'MB', isMe:true  },
  { id:'u-02',  nick:'Lala',     real:'Laura Binda',   avatar:'#FFD747', initials:'LB' },
  { id:'u-03',  nick:'Tío Beto', real:'Roberto Binda', avatar:'#59E892', initials:'RB' },
  { id:'u-04',  nick:'Mamá',     real:'Silvia G.',     avatar:'#FF5959', initials:'SG' },
  { id:'u-05',  nick:'El Negro', real:'Diego Binda',   avatar:'#604DFF', initials:'DB' },
  { id:'u-06',  nick:'Pipi',     real:'Pilar Binda',   avatar:'#0B1D5E', initials:'PB' },
  { id:'u-07',  nick:'Abu',      real:'Hugo Binda',    avatar:'#8F8B8B', initials:'HB' },
  { id:'u-08',  nick:'Nico10',   real:'Nicolás P.',    avatar:'#618DFF', initials:'NP' },
  { id:'u-09',  nick:'Cami',     real:'Camila Binda',  avatar:'#FF6838', initials:'CB' },
  { id:'u-10',  nick:'Chechu',   real:'Cecilia M.',    avatar:'#59E892', initials:'CM' },
  { id:'u-11',  nick:'Juancho',  real:'Juan Binda',    avatar:'#FFD747', initials:'JB' },
  { id:'u-12',  nick:'Fefa',     real:'Federico G.',   avatar:'#604DFF', initials:'FG' },
];

// Predictions: matchId -> userId -> [home, away] (penalties optional)
// We seed: real scores for finished matches, all 12 players have predictions
// for finished+live matches; only 'me' has predictions for upcoming ones (some).
function seedPredictions() {
  const preds = {};
  const finishedAndLive = ALL_MATCHES.filter(m => m.status !== 'upcoming');
  finishedAndLive.forEach(m => {
    preds[m.id] = {};
    PLAYERS.forEach((p, i) => {
      // pseudo-random but deterministic predictions clustered around real score
      const seed = (m.id.charCodeAt(3) + i * 7) % 5;
      const h = Math.max(0, m.realScore ? m.realScore[0] + (seed - 2) : 1);
      const a = Math.max(0, m.realScore ? m.realScore[1] + ((seed + i) % 5 - 2) : 1);
      preds[m.id][p.id] = [Math.min(h, 4), Math.min(a, 4)];
    });
  });
  // Some upcoming matches have my predictions already
  preds['p1-05'] = { 'u-vos': [3, 1] }; // ARG vs CRO
  preds['p1-07'] = { 'u-vos': [2, 1] }; // BRA vs COL
  preds['p1-09'] = { 'u-vos': [1, 1] }; // ESP vs ITA
  preds['p2-01'] = { 'u-vos': [2, 0] }; // ARG vs JPN
  preds['p3-08'] = { 'u-vos': [3, 1] }; // FINAL ARG vs GER
  return preds;
}

// Score a match for a single user prediction given real result
function scoreMatch(phase, pred, real, predPens, realPens) {
  if (!pred || !real) return 0;
  const [ph, pa] = pred;
  const [rh, ra] = real;
  const predOut = ph > pa ? 'H' : ph < pa ? 'A' : 'D';
  const realOut = rh > ra ? 'H' : rh < ra ? 'A' : 'D';
  let pts = 0;
  if (phase === 1) {
    if (predOut === realOut) pts += 1;
    if (ph === rh) pts += 1;
    if (pa === ra) pts += 1;
  } else if (phase === 2) {
    // for KO: "passes" = winner. We treat outcome match as passing.
    if (predOut === realOut || (predOut !== 'D' && realOut !== 'D' && predOut === realOut)) pts += 3;
    if (ph === rh) pts += 3;
    if (pa === ra) pts += 3;
    if (predPens === realPens) pts += 1;
  } else if (phase === 3) {
    if (predOut === realOut) pts += 9;
    if (ph === rh) pts += 9;
    if (pa === ra) pts += 9;
    if (predPens === realPens) pts += 3;
  }
  return pts;
}

// Pre-computed leaderboard data (hardcoded final state for prototype clarity)
const LEADERBOARD = {
  phase1: [
    { id:'u-03', pts: 87 }, // Tío Beto — winner Fase 1
    { id:'u-vos', pts: 79 },
    { id:'u-02', pts: 74 },
    { id:'u-05', pts: 71 },
    { id:'u-08', pts: 68 },
    { id:'u-12', pts: 65 },
    { id:'u-06', pts: 61 },
    { id:'u-04', pts: 58 },
    { id:'u-09', pts: 54 },
    { id:'u-10', pts: 51 },
    { id:'u-11', pts: 47 },
    { id:'u-07', pts: 39 },
  ],
  phase2: [ // in progress
    { id:'u-vos', pts: 24 },
    { id:'u-08', pts: 21 },
    { id:'u-03', pts: 18 },
    { id:'u-02', pts: 18 },
    { id:'u-05', pts: 15 },
    { id:'u-04', pts: 12 },
    { id:'u-12', pts: 12 },
    { id:'u-09', pts: 9 },
    { id:'u-06', pts: 9 },
    { id:'u-11', pts: 6 },
    { id:'u-10', pts: 3 },
    { id:'u-07', pts: 0 },
  ],
  phase3: [ // not started
    { id:'u-vos', pts: 0 },
    { id:'u-02', pts: 0 },
    { id:'u-03', pts: 0 },
    { id:'u-04', pts: 0 },
    { id:'u-05', pts: 0 },
    { id:'u-06', pts: 0 },
    { id:'u-07', pts: 0 },
    { id:'u-08', pts: 0 },
    { id:'u-09', pts: 0 },
    { id:'u-10', pts: 0 },
    { id:'u-11', pts: 0 },
    { id:'u-12', pts: 0 },
  ],
};
LEADERBOARD.general = LEADERBOARD.phase1.map(r => {
  const p2 = LEADERBOARD.phase2.find(x => x.id === r.id).pts;
  const p3 = LEADERBOARD.phase3.find(x => x.id === r.id).pts;
  return { id: r.id, pts: r.pts + p2 + p3 };
}).sort((a,b) => b.pts - a.pts);

const VALID_DNI = '30123456';
const VALID_PIN = '1234';

Object.assign(window, {
  TEAMS, PHASE_1, PHASE_2, PHASE_3, ALL_MATCHES, PLAYERS,
  seedPredictions, scoreMatch, LEADERBOARD, VALID_DNI, VALID_PIN,
});
