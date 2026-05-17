# PRODE BINDA — Especificación

App web de pronósticos deportivos para la **FIFA World Cup 2026**, de uso familiar y privado.

---

## 1. Stack y arquitectura

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 (confirmado)
- **Backend**: Next.js API routes / Server Actions
- **DB + Auth + Storage**: Supabase (Postgres + Storage para fotos de perfil)
- **API de fútbol**: API-Football (RapidAPI) → fixtures, resultados, estados de partido
- **Hosting**: Vercel (frontend) + Supabase (managed)
- **Sin sistema de pagos online**: el pozo se gestiona offline

---

## 2. Autenticación

- Login con **DNI argentino (7-8 dígitos)** + **PIN de 4 dígitos**
- Solo DNIs **pre-cargados por admin** pueden registrarse
- Primer login: el jugador define su PIN (queda fijo, no se cambia)
- PIN almacenado con hash (bcrypt/argon2)
- **Reset de PIN**: solo desde panel admin (a pedido)
- Sin recuperación por email (no se pide email)
- Tras primer login se piden 2 datos:
  - **Apodo** (string único, validado)
  - **Foto de perfil** (upload + crop cuadrado, guardada en Supabase Storage)
- Sesión: cookie HTTP-only, JWT o session de Supabase Auth (custom)

> Nota: Supabase Auth no soporta nativamente login DNI+PIN. Se implementa **auth custom** con tabla `users` propia + sesiones firmadas. La RLS de Supabase se basa en JWT propio.

---

## 3. Reglas del Prode (resumen funcional)

### Estructura

| Etapa | Partidos | Multiplicador |
|---|---|---|
| 1 — Fase de grupos | 72 | x1 |
| 2 — 16vos + 8vos | 24 | x2 |
| 3 — 4tos + Semis + Final | 8 | x3 |

### Puntaje por partido

- **Etapa 1**: +1 resultado (gana A / B / empate), +1 goles exactos A, +1 goles exactos B (máx 3)
- **Etapa 2**: +2 quién pasa, +2 goles A, +2 goles B, +1 si fue a penales (máx 7)
- **Etapa 3**: +3 quién pasa, +3 goles A, +3 goles B, +1 si fue a penales (máx 10)

### Reglas operativas

- Pronósticos editables hasta el kickoff de cada partido
- Una vez iniciado: bloqueado y se publican pronósticos de todos
- Antes del kickoff: los pronósticos ajenos NO son visibles
- Sin pronóstico cargado → 0 puntos
- **Etapas 2 y 3 se habilitan al finalizar la anterior**
- **Goles en knockout**: cuentan tiempo regular + prórroga, **sin contar penales**
- **Penales (predicción)**: solo aplican en etapas 2 y 3

### Premios (informativo, sin manejo online)

- Pozo = $100 USD × cantidad de jugadores
- Campeón general: 40%
- Campeón Etapa 1 / 2 / 3: 20% cada uno
- Empates en ranking → reparto equitativo del premio

---

## 4. Modelo de datos (alto nivel)

```
users
  id, dni (unique), pin_hash, nickname (unique nullable hasta 1er login),
  avatar_url, is_admin, created_at, first_login_at

matches  (sincronizados desde API-Football)
  id, external_id, stage (1|2|3), round, team_a, team_b,
  kickoff_at, status (scheduled|live|finished),
  goals_a, goals_b, went_to_penalties, winner_team, updated_at

predictions
  id, user_id, match_id, goals_a, goals_b, went_to_penalties,
  winner_team, created_at, updated_at
  unique(user_id, match_id)

scores  (vista materializada o cálculo on-the-fly)
  user_id, match_id, stage, points

audit_log  (admin actions)
  id, admin_id, action, target, payload, created_at
```

---

## 5. Pantallas

### Públicas (pre-login)
- Login (DNI + PIN)

### Jugador
- **Onboarding** (post-primer-login): set apodo + foto
- **Home / Próximos partidos**: lista con countdown y estado de pronóstico
- **Carga de pronóstico** por partido (con regla de bloqueo por kickoff)
- **Resultados publicados** (post-kickoff): mis predicciones vs. otros
- **Ranking**: global + por etapa, con foto y apodo
- **Mi perfil**: ver apodo, foto, historial

### Admin
- Gestión de DNIs autorizados (alta/baja/lista)
- Reset de PIN
- Override manual de resultados (fallback si API falla)
- Estado de sincronización con API-Football
- Marcar pagos del pozo (tracking)
- Audit log

---

## 6. Sincronización con API-Football

- Cron / Vercel Cron / Supabase Edge Function que cada N minutos:
  - Trae fixtures del Mundial 2026 (league id correspondiente)
  - Actualiza `matches.status` y resultados de partidos finalizados
  - Dispara recálculo de puntajes para partidos recién cerrados
- Tope de requests (plan free 100/día) → cachear y batch
- Plan de fallback: override manual desde admin

---

## 7. Reglas de visibilidad / seguridad

- App **100% privada**: sin sesión no se ve nada salvo login
- RLS en Supabase:
  - Cada usuario solo ve sus predicciones de partidos no iniciados
  - Predicciones de partidos `status='live'|'finished'` visibles a todos los logueados
  - Tabla `users` con datos sensibles (pin_hash) nunca al cliente
- Rate-limit en login (anti brute-force del PIN)
- Bloqueo temporal tras N intentos fallidos

---

## 8. Diseño / UI

Maquetas en `/design/` (prototipo React vía CDN + Babel standalone, mobile-first con frame iOS).

- **Tipografías**: Lato 400/600/700/900 + Titillium Web 400/600/700/900 (Google Fonts)
- **Color base**: `#EEF1F8` (background light); tema definido en `pbTheme(dark)` en `components.jsx`
- **Pantallas existentes**: `WelcomeScreen`, `ProfileSetupScreen`, `HomeScreen`, `MatchDetailModal`, `RankingScreen`, `RulesScreen`, `AccountScreen`
- **Componentes reutilizables**: `PBButton`, `PBInput`, `PinInput` (4 dígitos), `Avatar`, `FlagChip`, `StatusTag` (upcoming/live/finished), `ScoreBox`, `MatchCardB` (layout fijo), `PointsBadge`, `ChampionBanner`, `PointsTable`, `PrizeBars`
- **Estados de partido**: `upcoming | live | finished` — alineados con `fixture.status.short` de API-Football
- **Datos hardcoded** (`data.js`): solo 24 equipos placeholder y partidos de muestra → reemplazar por datos reales de API
- **Tercer Puesto**: ya incluido en `PHASE_3` (4 cuartos + 2 semis + 1 tercer puesto + 1 final = 8 partidos)
- **Migración a Next.js**: convertir los `.jsx` (Babel-in-browser) a componentes Next.js + TypeScript + Tailwind manteniendo el sistema visual de `pbTheme`

## 9. Decisiones pendientes

- League ID exacto del Mundial 2026 en API-Football (confirmar al inicio del torneo)
- Idioma asumido **es-AR**, timezone **America/Argentina/Buenos_Aires**
- "Quién pasa" se decide por el equipo que avanza, independiente del método (regular / prórroga / penales)
- Completar lista de 48 equipos (actualmente hay 24 en `data.js`)

---

## 10. Roadmap sugerido

1. **Setup**: repo, Supabase, schema, env, API-Football key
2. **Auth custom DNI+PIN** + middleware de sesión
3. **Onboarding** (apodo + foto + crop)
4. **Sync API-Football** + tabla `matches`
5. **CRUD predictions** con bloqueo por kickoff
6. **Cálculo de puntajes** y rankings
7. **Pantalla resultados públicos** post-kickoff
8. **Panel admin**: DNIs, reset PIN, override, pagos
9. **Estilizar con maquetas HTML** provistas
10. **QA + deploy**
