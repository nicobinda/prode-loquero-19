// Mapeo de código de 3 letras → ISO 3166-1 alpha-2 (2 letras, lowercase)
// usado por flagcdn.com.
//
// football-data.org devuelve una mezcla de códigos FIFA (URU) e ISO 3166-1
// alpha-3 (URY), así que mapeamos ambas variantes a la misma ISO2.
//
// Casos especiales: Inglaterra, Escocia, Gales, Irlanda del Norte usan
// subdivisiones GB-ENG, GB-SCT, GB-WLS, GB-NIR que flagcdn soporta.

export const FIFA_TO_ISO2: Record<string, string> = {
  // AFC
  AFG: 'af', AUS: 'au', BHR: 'bh', BAN: 'bd', BHU: 'bt', BRU: 'bn',
  CAM: 'kh', CHN: 'cn', TPE: 'tw', GUM: 'gu', HKG: 'hk', IND: 'in',
  IDN: 'id', IRN: 'ir', IRQ: 'iq', JPN: 'jp', JOR: 'jo', PRK: 'kp',
  KOR: 'kr', KUW: 'kw', KGZ: 'kg', LAO: 'la', LBN: 'lb', MAC: 'mo',
  MAS: 'my', MDV: 'mv', MGL: 'mn', MYA: 'mm', NEP: 'np', OMA: 'om',
  PAK: 'pk', PLE: 'ps', PHI: 'ph', QAT: 'qa', KSA: 'sa', SIN: 'sg',
  SRI: 'lk', SYR: 'sy', TJK: 'tj', THA: 'th', TLS: 'tl', TKM: 'tm',
  UAE: 'ae', UZB: 'uz', VIE: 'vn', YEM: 'ye',

  // CAF
  ALG: 'dz', ANG: 'ao', BEN: 'bj', BOT: 'bw', BFA: 'bf', BDI: 'bi',
  CMR: 'cm', CPV: 'cv', CTA: 'cf', CHA: 'td', COM: 'km', CGO: 'cg',
  COD: 'cd', CIV: 'ci', DJI: 'dj', EGY: 'eg', EQG: 'gq', ERI: 'er',
  SWZ: 'sz', ETH: 'et', GAB: 'ga', GAM: 'gm', GHA: 'gh', GUI: 'gn',
  GNB: 'gw', KEN: 'ke', LES: 'ls', LBR: 'lr', LBY: 'ly', MAD: 'mg',
  MWI: 'mw', MLI: 'ml', MTN: 'mr', MRI: 'mu', MAR: 'ma', MOZ: 'mz',
  NAM: 'na', NIG: 'ne', NGA: 'ng', RWA: 'rw', STP: 'st', SEN: 'sn',
  SEY: 'sc', SLE: 'sl', SOM: 'so', RSA: 'za', SSD: 'ss', SDN: 'sd',
  TAN: 'tz', TOG: 'tg', TUN: 'tn', UGA: 'ug', ZAM: 'zm', ZIM: 'zw',

  // CONCACAF
  AIA: 'ai', ATG: 'ag', ARU: 'aw', BAH: 'bs', BRB: 'bb', BLZ: 'bz',
  BER: 'bm', VGB: 'vg', CAN: 'ca', CAY: 'ky', CRC: 'cr', CUB: 'cu',
  CUW: 'cw', CUR: 'cw', DMA: 'dm', DOM: 'do', SLV: 'sv', GRN: 'gd', GUA: 'gt',
  GUF: 'gf', GUY: 'gy', HAI: 'ht', HON: 'hn', JAM: 'jm', MTQ: 'mq',
  MEX: 'mx', MSR: 'ms', NCA: 'ni', PAN: 'pa', PUR: 'pr', SKN: 'kn',
  LCA: 'lc', SMN: 'sx', VIN: 'vc', SUR: 'sr', TRI: 'tt', TCA: 'tc',
  USA: 'us', VIR: 'vi',

  // CONMEBOL
  ARG: 'ar', BOL: 'bo', BRA: 'br', CHI: 'cl', CHL: 'cl', COL: 'co',
  ECU: 'ec', PAR: 'py', PER: 'pe', URU: 'uy', VEN: 've',

  // OFC
  ASA: 'as', COK: 'ck', FIJ: 'fj', NCL: 'nc', NZL: 'nz', PNG: 'pg',
  SAM: 'ws', SOL: 'sb', TAH: 'pf', TGA: 'to', VAN: 'vu',

  // UEFA
  ALB: 'al', AND: 'ad', ARM: 'am', AUT: 'at', AZE: 'az', BLR: 'by',
  BEL: 'be', BIH: 'ba', BUL: 'bg', CRO: 'hr', CYP: 'cy', CZE: 'cz',
  DEN: 'dk', ENG: 'gb-eng', EST: 'ee', FRO: 'fo', FIN: 'fi', FRA: 'fr',
  GEO: 'ge', GER: 'de', GIB: 'gi', GRE: 'gr', HUN: 'hu', ISL: 'is',
  IRL: 'ie', ISR: 'il', ITA: 'it', KAZ: 'kz', KVX: 'xk', LVA: 'lv',
  LIE: 'li', LTU: 'lt', LUX: 'lu', MKD: 'mk', MLT: 'mt', MDA: 'md',
  MNE: 'me', NED: 'nl', NIR: 'gb-nir', NOR: 'no', POL: 'pl', POR: 'pt',
  ROU: 'ro', RUS: 'ru', SMR: 'sm', SCO: 'gb-sct', SRB: 'rs', SVK: 'sk',
  SVN: 'si', ESP: 'es', SWE: 'se', SUI: 'ch', TUR: 'tr', UKR: 'ua',
  WAL: 'gb-wls',

  // ─── Alias ISO 3166-1 alpha-3 (cuando difieren del FIFA) ─────────
  // CONMEBOL
  URY: 'uy',  // Uruguay (FIFA: URU)
  PRY: 'py',  // Paraguay (FIFA: PAR)
  // UEFA
  HRV: 'hr',  // Croatia (FIFA: CRO)
  DNK: 'dk',  // Denmark (FIFA: DEN)
  DEU: 'de',  // Germany (FIFA: GER)
  GRC: 'gr',  // Greece (FIFA: GRE)
  NLD: 'nl',  // Netherlands (FIFA: NED)
  PRT: 'pt',  // Portugal (FIFA: POR)
  CHE: 'ch',  // Switzerland (FIFA: SUI)
  // CAF
  DZA: 'dz',  // Algeria (FIFA: ALG)
  ZAF: 'za',  // South Africa (FIFA: RSA)
  // AFC
  SGP: 'sg',  // Singapore (FIFA: SIN)
  PHL: 'ph',  // Philippines (FIFA: PHI)
  KHM: 'kh',  // Cambodia (FIFA: CAM)
  MYS: 'my',  // Malaysia (FIFA: MAS)
  MNG: 'mn',  // Mongolia (FIFA: MGL)
  MMR: 'mm',  // Myanmar (FIFA: MYA)
  NPL: 'np',  // Nepal (FIFA: NEP)
  LKA: 'lk',  // Sri Lanka (FIFA: SRI)
  VNM: 'vn',  // Vietnam (FIFA: VIE)
  // CONCACAF
  BHS: 'bs',  // Bahamas (FIFA: BAH)
  BMU: 'bm',  // Bermuda (FIFA: BER)
  GTM: 'gt',  // Guatemala (FIFA: GUA)
  GRD: 'gd',  // Grenada (FIFA: GRN)
  HTI: 'ht',  // Haiti (FIFA: HAI)
  HND: 'hn',  // Honduras (FIFA: HON)
  NIC: 'ni',  // Nicaragua (FIFA: NCA)
  PRI: 'pr',  // Puerto Rico (FIFA: PUR)
  KNA: 'kn',  // St Kitts and Nevis (FIFA: SKN)
  VCT: 'vc',  // St Vincent (FIFA: VIN)
  TTO: 'tt',  // Trinidad & Tobago (FIFA: TRI)
  // CAF extras
  COG: 'cg',  // Congo (FIFA: CGO)
  GNQ: 'gq',  // Equatorial Guinea (FIFA: EQG)
  GMB: 'gm',  // Gambia (FIFA: GAM)
  GIN: 'gn',  // Guinea (FIFA: GUI)
  LSO: 'ls',  // Lesotho (FIFA: LES)
  MDG: 'mg',  // Madagascar (FIFA: MAD)
  MRT: 'mr',  // Mauritania (FIFA: MTN)
  MUS: 'mu',  // Mauritius (FIFA: MRI)
  NER: 'ne',  // Niger (FIFA: NIG)
  TZA: 'tz',  // Tanzania (FIFA: TAN)
  ZMB: 'zm',  // Zambia (FIFA: ZAM)
  ZWE: 'zw',  // Zimbabwe (FIFA: ZIM)
};

export function tlaToIso2(tla: string): string | null {
  return FIFA_TO_ISO2[tla.toUpperCase()] ?? null;
}

export function flagUrl(tla: string, width = 40): string | null {
  if (isTbdCode(tla)) return null;
  const iso = tlaToIso2(tla);
  if (!iso) return null;
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

// Códigos placeholder generados por sync.ts comienzan con "_"
export function isTbdCode(code: string): boolean {
  return code.startsWith('_');
}
