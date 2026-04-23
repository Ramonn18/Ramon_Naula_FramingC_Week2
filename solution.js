/* ============================================================
   EVROS WILDFIRE — VOLUNTEER ROUTING TOOL
   Map:     Leaflet.js + CartoDB Positron (no API key)
   Fire:    Approximate perimeter — Copernicus EMSN166 activation
   Villages: OpenStreetMap Overpass API (real coordinates)
   ============================================================ */

/* ── GOOGLE GEMINI API KEY ──────────────────────────────────
   Free key at: https://aistudio.google.com/
   Paste your key below. Do not commit to a public repo.
   ─────────────────────────────────────────────────────────── */
const GEMINI_API_KEY = 'type-your-key-here';

/* ----------------------------------------------------------
   FIRE PERIMETER
   Source: Copernicus EMS EMSN166 — WildfireDEL (delineation)
   112 burn patches · 92,321 ha · photo-interpreted
   Loaded from fire_perimeter.js (FIRE_PERIMETER_DATA global)
   ---------------------------------------------------------- */

/* ----------------------------------------------------------
   RESIDENT COLOURS (shared across all disaster types)
   ---------------------------------------------------------- */
const RESIDENT_COLORS = {
  elderly:  '#e8aa30',
  disabled: '#77b6ff',
  both:     '#a78bfa',
};

/* ============================================================
   DISASTER DATASETS
   Sources: OpenStreetMap Overpass API (village coordinates),
   Copernicus EMS activation records, civil protection reports.
   Resident data is representative — not real personal data.
   ============================================================ */

/* ── WILDFIRE · Evros, August 2023 ─────────────────────────
   Copernicus EMS EMSN166 · 92,321 ha · 112 burn patches
   ---------------------------------------------------------- */
const WILDFIRE_DATA = {
  label:      'Evros — August 2023',
  mapCenter:  [41.05, 26.10],
  mapZoom:    10,
  mapBounds:  [[40.82, 25.61], [41.25, 26.30]],
  showFireLayer: true,
  dataSource: 'Villages: OpenStreetMap &nbsp;|&nbsp; Fire boundary: <a href="https://mapping.emergency.copernicus.eu/activations/EMSN166/" target="_blank">Copernicus EMS EMSN166</a> &nbsp;|&nbsp; 92,321 ha · 112 burn patches',
  volunteerStart: { lat: 40.8942, lon: 26.1741, label: 'Volunteer<br>Feres', note: 'E90 highway · volunteer base' },
  villages: [
    { name: 'Aristino',  lat: 40.8729, lon: 25.9981, note: 'Fire origin — evacuated Aug 19' },
    { name: 'Avantas',   lat: 40.9328, lon: 25.9160, note: 'First evacuation wave' },
    { name: 'Nipsa',     lat: 40.9302, lon: 26.0177, note: 'First evacuation wave' },
    { name: 'Aetochori', lat: 40.8983, lon: 25.9976, note: 'First evacuation wave' },
    { name: 'Pefka',     lat: 40.9008, lon: 26.0413, note: 'First evacuation wave' },
    { name: 'Loutros',   lat: 40.8812, lon: 26.0468, note: 'Second evacuation wave' },
    { name: 'Agnantia',  lat: 40.8828, lon: 25.9767, note: 'Second evacuation wave' },
    { name: 'Doriko',    lat: 40.9090, lon: 25.9797, note: 'Second evacuation wave' },
    { name: 'Lefkimmi',  lat: 41.0234, lon: 26.1975, note: 'Fire zone' },
    { name: 'Lykofos',   lat: 41.1200, lon: 26.2893, note: 'Fire zone' },
    { name: 'Dadia',     lat: 41.1293, lon: 26.2249, note: 'Epicenter — Dadia NP' },
    { name: 'Sidiro',    lat: 41.2466, lon: 26.1314, note: 'Fire zone (north)' },
  ],
  residents: [
    { id: 'r1', name: 'Mr. Karakostas',  type: 'both',     lat: 40.8731, lon: 25.9992, floor: 1, note: 'Age 81, mobility aid — Aristino (fire origin)' },
    { id: 'r2', name: 'Ms. Pavlidou',    type: 'disabled', lat: 40.9326, lon: 25.9158, floor: 0, note: 'Wheelchair user — Avantas' },
    { id: 'r3', name: 'Mrs. Tsoukalas',  type: 'elderly',  lat: 40.9304, lon: 26.0179, floor: 0, note: 'Age 77, lives alone — Nipsa' },
    { id: 'r4', name: 'Mr. Demetriou',   type: 'elderly',  lat: 40.8985, lon: 25.9974, floor: 1, note: 'Age 74, hearing impaired — Aetochori' },
    { id: 'r5', name: 'Mrs. Zervou',     type: 'both',     lat: 41.1291, lon: 26.2251, floor: 0, note: 'Age 85, confined to bed — Dadia (epicenter)' },
    { id: 'r6', name: 'Mr. Alexiou',     type: 'disabled', lat: 41.0232, lon: 26.1977, floor: 0, note: 'Visual impairment — Lefkimmi' },
    { id: 'r7', name: 'Ms. Nikolaidou',  type: 'elderly',  lat: 41.1198, lon: 26.2891, floor: 1, note: 'Age 79, mobility impaired — Lykofos' },
    { id: 'r8', name: 'Mr. Stavrakis',   type: 'both',     lat: 41.2464, lon: 26.1312, floor: 0, note: 'Age 82, wheelchair — Sidiro (north)' },
  ],
  safeExits: [
    { id: 'feres',          name: 'Feres — Staging Area',  note: 'E90 highway · volunteer base',            lat: 40.8942, lon: 26.1741 },
    { id: 'alexandroupoli', name: 'Alexandroupoli',         note: 'Regional hospital · civil protection HQ', lat: 40.8498, lon: 25.8739 },
    { id: 'didymoteicho',   name: 'Didymoteicho',           note: 'Northern corridor · clear of fire zone',  lat: 41.3492, lon: 26.4955 },
  ],
};

/* ── FLOODING · Medicane Ianos, Kefalonia, September 2020 ──
   Copernicus EMS EMSR426 · Ionian Islands activation
   ---------------------------------------------------------- */
const FLOOD_DATA = {
  label:      'Kefalonia — September 2020',
  mapCenter:  [38.22, 20.56],
  mapZoom:    11,
  mapBounds:  [[38.05, 20.35], [38.48, 20.82]],
  showFireLayer: false,
  dataSource: 'Villages: OpenStreetMap &nbsp;|&nbsp; Event: <a href="https://mapping.emergency.copernicus.eu/activations/EMSR426/" target="_blank">Copernicus EMS EMSR426</a> &nbsp;|&nbsp; Medicane Ianos · Sep 2020',
  volunteerStart: { lat: 38.1754, lon: 20.4904, label: 'Volunteer<br>Argostoli', note: 'Civil protection HQ · Kefalonia' },
  villages: [
    { name: 'Argostoli',   lat: 38.1754, lon: 20.4904, note: 'Administrative capital — partial flooding' },
    { name: 'Lixouri',     lat: 38.2024, lon: 20.4412, note: 'Severe flash flooding — roads cut off' },
    { name: 'Karavomylos', lat: 38.2485, lon: 20.6391, note: 'Cave Lake overflow — flash flood' },
    { name: 'Sami',        lat: 38.2524, lon: 20.6477, note: 'Port damaged — access limited' },
    { name: 'Pessada',     lat: 38.1230, lon: 20.5848, note: 'Southern village — road damage' },
    { name: 'Agia Efimia', lat: 38.3261, lon: 20.6071, note: 'Northern coast — landslides' },
    { name: 'Mouzakata',   lat: 38.1433, lon: 20.5467, note: 'Inland village — crop flooding' },
    { name: 'Poros',       lat: 38.1452, lon: 20.7836, note: 'SE port — storm surge' },
  ],
  residents: [
    { id: 'r1', name: 'Ms. Metaxas',           type: 'elderly',  lat: 38.2026, lon: 20.4408, floor: 0, note: 'Age 78, lives alone — Lixouri, ground floor flooded' },
    { id: 'r2', name: 'Mr. Kourkoulis',         type: 'disabled', lat: 38.2487, lon: 20.6393, floor: 0, note: 'Mobility impaired — Karavomylos, road cut off' },
    { id: 'r3', name: 'Mrs. Travlos',           type: 'both',     lat: 38.1231, lon: 20.5851, floor: 1, note: 'Age 84, wheelchair — Pessada, isolated by landslide' },
    { id: 'r4', name: 'Mr. Anagnostopoulos',    type: 'elderly',  lat: 38.3260, lon: 20.6069, floor: 0, note: 'Age 72, hearing impaired — Agia Efimia' },
    { id: 'r5', name: 'Ms. Kefalas',            type: 'disabled', lat: 38.1435, lon: 20.5470, floor: 0, note: 'Visual impairment — Mouzakata, access road flooded' },
    { id: 'r6', name: 'Mr. Drosos',             type: 'both',     lat: 38.2526, lon: 20.6479, floor: 1, note: 'Age 80, mobility aid — Sami, stairs damaged' },
    { id: 'r7', name: 'Mrs. Georgatos',         type: 'elderly',  lat: 38.1453, lon: 20.7839, floor: 0, note: 'Age 76, lives alone — Poros, storm surge at door' },
    { id: 'r8', name: 'Mr. Vlassopoulos',       type: 'disabled', lat: 38.1755, lon: 20.4906, floor: 0, note: 'Wheelchair user — Argostoli outskirts, basement flooded' },
  ],
  safeExits: [
    { id: 'argostoli_harbor', name: 'Argostoli Harbour',     note: 'Evacuation boats · civil protection HQ', lat: 38.1720, lon: 20.4882 },
    { id: 'sami_high',        name: 'Sami — Inland Shelter', note: 'Above flood line · Red Cross station',   lat: 38.2580, lon: 20.6410 },
    { id: 'poros_road',       name: 'Poros — Southern Exit', note: 'Road to airport · less affected zone',   lat: 38.1390, lon: 20.7710 },
  ],
};

/* ── STORM · Daniel, Thessaly, September 2023 ───────────────
   Copernicus EMS EMSR604 · Thessaly flooding activation
   ---------------------------------------------------------- */
const STORM_DATA = {
  label:      'Thessaly — September 2023',
  mapCenter:  [39.43, 21.95],
  mapZoom:    10,
  mapBounds:  [[39.10, 21.40], [39.80, 22.70]],
  showFireLayer: false,
  dataSource: 'Villages: OpenStreetMap &nbsp;|&nbsp; Event: <a href="https://mapping.emergency.copernicus.eu/activations/EMSR604/" target="_blank">Copernicus EMS EMSR604</a> &nbsp;|&nbsp; Storm Daniel · Sep 2023',
  volunteerStart: { lat: 39.3626, lon: 21.9213, label: 'Volunteer<br>Karditsa', note: 'Civil protection HQ · Storm Daniel staging' },
  villages: [
    { name: 'Palamas',      lat: 39.4698, lon: 22.0897, note: 'Completely inundated — Storm Daniel epicentre' },
    { name: 'Mouzaki',      lat: 39.4253, lon: 21.6694, note: 'Flash flooding — Thessaly plains' },
    { name: 'Sofades',      lat: 39.3373, lon: 22.1002, note: 'Rapid inundation — Enipeas river overflow' },
    { name: 'Karditsa',     lat: 39.3626, lon: 21.9213, note: 'City centre — partial flooding' },
    { name: 'Farsala',      lat: 39.2946, lon: 22.3819, note: 'Enipeas valley — road network cut' },
    { name: 'Mataraga',     lat: 39.4853, lon: 21.8502, note: 'Isolated by floodwater — no road access' },
    { name: 'Tirnavos',     lat: 39.7463, lon: 22.2913, note: 'Pinios tributary flooding' },
    { name: 'Ag. Georgios', lat: 39.2501, lon: 22.2183, note: 'Agricultural plains — widespread flooding' },
  ],
  residents: [
    { id: 'r1', name: 'Mr. Tzoumerkas',     type: 'both',     lat: 39.4700, lon: 22.0900, floor: 0, note: 'Age 83, bedridden — Palamas, water at roof level' },
    { id: 'r2', name: 'Ms. Karaiskaki',     type: 'elderly',  lat: 39.4254, lon: 21.6696, floor: 1, note: 'Age 75, lives alone — Mouzaki, isolated on upper floor' },
    { id: 'r3', name: 'Mr. Ploumistis',     type: 'disabled', lat: 39.3374, lon: 22.1004, floor: 0, note: 'Wheelchair user — Sofades, house surrounded by water' },
    { id: 'r4', name: 'Mrs. Papageorgiou',  type: 'elderly',  lat: 39.4854, lon: 21.8503, floor: 0, note: 'Age 79, mobility impaired — Mataraga, no road access' },
    { id: 'r5', name: 'Mr. Thessalos',      type: 'both',     lat: 39.3628, lon: 21.9215, floor: 1, note: 'Age 81, hearing impaired — Karditsa outskirts' },
    { id: 'r6', name: 'Ms. Piniotis',       type: 'disabled', lat: 39.2948, lon: 22.3821, floor: 0, note: 'Visual impairment — Farsala, isolated farmhouse' },
    { id: 'r7', name: 'Mr. Enipeas',        type: 'elderly',  lat: 39.7465, lon: 22.2915, floor: 0, note: 'Age 77, lives alone — Tirnavos, river banks breached' },
    { id: 'r8', name: 'Mrs. Thessaliotis',  type: 'disabled', lat: 39.2503, lon: 22.2186, floor: 1, note: 'Mobility impaired — Ag. Georgios, farm road flooded' },
  ],
  safeExits: [
    { id: 'trikala',    name: 'Trikala',      note: 'Civil protection HQ · general hospital', lat: 39.5553, lon: 21.7676 },
    { id: 'larissa',    name: 'Larissa',       note: 'Regional capital · University hospital', lat: 39.6374, lon: 22.4194 },
    { id: 'volos_port', name: 'Volos — Port',  note: 'Sea evacuation · Red Cross station',     lat: 39.3617, lon: 22.9432 },
  ],
};

const DISASTER_DATA = { wildfire: WILDFIRE_DATA, flood: FLOOD_DATA, storm: STORM_DATA };

/* Active dataset — populated by loadDisaster() in initApp() */
let ACTIVE_VILLAGES        = [];
let ACTIVE_RESIDENTS       = [];
let ACTIVE_VOLUNTEER_START = { lat: 0, lon: 0 };
let ACTIVE_SAFE_EXITS      = [];
let ACTIVE_MAP_CONFIG      = {};

/* Partitioned residents — set by partitionResidents() */
let MY_RESIDENTS    = [];   // assigned to this volunteer — routed + highlighted
let OTHER_RESIDENTS = [];   // assigned to simulated other volunteers — dimmed

/* ============================================================
   VOLUNTEER PARTITIONING
   Scores each resident against this volunteer's specific
   skills and distance preference, then splits the list.
   ============================================================ */
function partitionResidents() {
  const all = ACTIVE_RESIDENTS;
  const vs  = ACTIVE_VOLUNTEER_START;

  const scored = all.map(r => {
    const dist = geoDistance(vs.lat, vs.lon, r.lat, r.lon);
    let s = 0;

    /* Type-skill matching */
    if (selectedSkills.has('elderly')    && (r.type === 'elderly'  || r.type === 'both'))  s += 4;
    if (selectedSkills.has('disability') && (r.type === 'disabled' || r.type === 'both'))  s += 4;
    if (selectedSkills.has('medical')    && r.type === 'both')                              s += 3;
    if (selectedSkills.has('rescue')     && r.type === 'both')                              s += 2;
    if (selectedSkills.has('physical')   && r.floor > 0)                                   s += 3;

    /* Distance preference: vehicle → far residents; no vehicle → near */
    s += selectedSkills.has('transport') ? dist / 800 : -(dist / 800);

    return { ...r, _match: s };
  });

  scored.sort((a, b) => b._match - a._match);

  const half     = Math.ceil(scored.length / 2);
  MY_RESIDENTS    = scored.slice(0, half);
  OTHER_RESIDENTS = scored.slice(half);
}

/* ============================================================
   GEMINI MISSION BRIEF
   ============================================================ */
const ROLE_LABELS_BRIEF = {
  volunteer: 'Community Volunteer', medical: 'Medical Support',
  responder: 'First Responder',     civil:   'Civil Protection',
};
const SKILL_LABELS_BRIEF = {
  physical: 'Physical Support', medical: 'First Aid / Medical', transport: 'Has Vehicle',
  elderly: 'Elderly Care', disability: 'Disability Support',
  language: 'Speaks Greek', rescue: 'Search & Rescue', comms: 'Communications',
};

async function generateMissionBrief() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_KEY_HERE') return null;

  const role      = ROLE_LABELS_BRIEF[volunteerRole] || 'Volunteer';
  const skillList = [...selectedSkills].map(s => SKILL_LABELS_BRIEF[s] || s).join(', ') || 'General volunteering';

  const myLines = MY_RESIDENTS.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.type}, floor ${r.floor}: ${r.note}`
  ).join('\n');

  const otherLines = OTHER_RESIDENTS.map(r =>
    `- ${r.name} (${r.type})`
  ).join('\n');

  const prompt =
`You are briefing a disaster response volunteer. Return ONLY a raw JSON object — no markdown fences, no explanation.

Event: ${ACTIVE_MAP_CONFIG.label}
Volunteer: ${volunteerName || 'Volunteer'}, Role: ${role}
Skills: ${skillList}

Their assigned stops:
${myLines}

Covered by other volunteers:
${otherLines}

Return exactly this JSON shape (all values plain text, max 12 words each):
{
  "priority": "one sentence: who is most urgent and why this volunteer is right for them",
  "prepare": "one concrete action tip based on their skills before they leave",
  "why_split": "one sentence: why these residents match this volunteer vs the others",
  "start": "first name only of their first stop"
}`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 220, responseMimeType: 'application/json' },
        }),
      }
    );
    const data = await resp.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) return null;
    /* Strip any accidental markdown fences */
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function fallbackMissionBrief() {
  const urgencyOrder = { both: 0, disabled: 1, elderly: 2 };
  const top   = [...MY_RESIDENTS].sort((a, b) => urgencyOrder[a.type] - urgencyOrder[b.type])[0];
  const first = MY_RESIDENTS[0];

  let prepare   = 'Check your equipment before leaving the staging area.';
  let why_split = `${OTHER_RESIDENTS.length} nearby residents are covered by other team members.`;

  if (selectedSkills.has('transport')) {
    prepare   = 'Plan your driving route — these stops are spread across a wide area.';
    why_split = 'You have a vehicle, so the team assigned you the most distant residents.';
  } else if (selectedSkills.has('medical')) {
    prepare   = 'Bring your full medical kit — these cases require on-site assessment.';
    why_split = 'Your medical skills match the most complex cases on this route.';
  } else if (selectedSkills.has('physical')) {
    prepare   = 'You may need to carry or assist residents down stairs — pace yourself.';
    why_split = 'Upper-floor residents are assigned to you given your physical capability.';
  } else if (selectedSkills.has('elderly')) {
    prepare   = 'Move calmly and speak clearly — these residents may be disoriented.';
    why_split = 'Your elderly care experience is matched to the senior residents on your list.';
  } else if (selectedSkills.has('disability')) {
    prepare   = 'Check mobility needs at each stop before attempting to assist.';
    why_split = 'Residents with mobility and sensory impairments are assigned to you.';
  }

  return {
    priority:   `${top?.name || 'First resident'} is your most critical stop — ${top?.note?.split(' — ')[1] || 'priority case'}.`,
    prepare,
    why_split,
    start:      first?.name?.split(' ').pop() || 'first stop',
  };
}

/* ============================================================
   ONBOARDING STATE
   ============================================================ */
let selectedDisaster = null;
let volunteerName    = '';
let volunteerRole    = '';
let selectedSkills   = new Set();

/* Per-skill routing multipliers applied during score() */
const SKILL_MODIFIERS = {
  physical:   (r) => r.floor > 0 ? 1.28 : 1.0,
  medical:    (r) => r.type === 'both' ? 1.45 : 1.0,
  transport:  () => 1.0,                                    // reduces distance weight globally
  elderly:    (r) => (r.type === 'elderly' || r.type === 'both') ? 1.38 : 1.0,
  disability: (r) => (r.type === 'disabled' || r.type === 'both') ? 1.38 : 1.0,
  rescue:     (r) => r.type === 'both' ? 1.3 : 1.1,
  language:   () => 1.0,
  comms:      () => 1.0,
};

function dismissOnboarding() {
  const overlay = document.getElementById('onboarding');
  if (!overlay) return;
  overlay.classList.add('ob-exiting');
  setTimeout(() => {
    overlay.remove();
    /* Map initialises here — after overlay is gone, no z-index conflict */
    initApp();
  }, 420);
}

function loadDisaster() {
  const data = DISASTER_DATA[selectedDisaster] || DISASTER_DATA.wildfire;
  ACTIVE_VILLAGES        = data.villages;
  ACTIVE_RESIDENTS       = data.residents;
  ACTIVE_VOLUNTEER_START = data.volunteerStart;
  ACTIVE_SAFE_EXITS      = data.safeExits;
  ACTIVE_MAP_CONFIG      = data;

  /* Update header location label */
  const locEl = document.querySelector('.sol-loc');
  if (locEl) locEl.textContent = data.label;

  /* Counters are updated after partition in refreshUIAfterPartition() */
}

function refreshUIAfterPartition() {
  const n = MY_RESIDENTS.length;
  const stagingName = ACTIVE_VOLUNTEER_START.label?.replace('<br>', ' ') || 'Staging';

  const mcHint = document.querySelector('#mc-idle .mc-hint');
  if (mcHint) mcHint.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
      <path d="M12 8v4l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    ${n} residents assigned &middot; staging: ${stagingName}`;

  const prioMeta = document.querySelector('.priority-meta');
  if (prioMeta) prioMeta.textContent = `${n} residents assigned · staging: ${stagingName}`;

  ['mc-progress', 'mc-remaining', 'rs-progress'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'mc-progress')  el.textContent = `0 / ${n}`;
    if (id === 'mc-remaining') el.textContent = String(n);
    if (id === 'rs-progress')  el.textContent = `0 / ${n}`;
  });
}

function initApp() {
  loadDisaster();
  /* partitionResidents() was already called in the step-4 brief handler;
     call it here as a guard in case the flow is ever bypassed. */
  if (MY_RESIDENTS.length === 0) partitionResidents();
  refreshUIAfterPartition();

  requestAnimationFrame(() => {
    try {
      initMap();
    } catch (err) {
      console.error('[VolRoute] Map init error:', err);
    }

    /* Calculate Route */
    document.getElementById('btn-route')?.addEventListener('click', calculateAndAnimateRoute);
    document.getElementById('btn-route-sheet')?.addEventListener('click', calculateAndAnimateRoute);

    /* Reset */
    document.getElementById('btn-reset-sheet')?.addEventListener('click', resetRoute);
    document.getElementById('btn-reset')?.addEventListener('click', resetRoute);

    /* Map card: active stop actions */
    document.getElementById('mc-safe-btn')?.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (id) markStop(id, 'safe');
    });
    document.getElementById('mc-flag-btn')?.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (id) markStop(id, 'flag');
    });

    /* Preview card actions */
    document.getElementById('mc-preview-safe')?.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      clearPreview();
      markStop(id, 'safe');
    });
    document.getElementById('mc-preview-flag')?.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      clearPreview();
      markStop(id, 'flag');
    });
    document.getElementById('mc-back-btn')?.addEventListener('click', () => {
      clearPreview();
      showCardState(prevCardState);
    });

    /* Queue sheet */
    document.getElementById('mc-queue-btn')?.addEventListener('click', openSheet);
    document.getElementById('qs-close')?.addEventListener('click', closeSheet);
    document.getElementById('qs-backdrop')?.addEventListener('click', closeSheet);

    /* Event delegation for Safe / Help inside the queue list */
    document.getElementById('priority-list')?.addEventListener('click', e => {
      const btn = e.target.closest('.pi-btn');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains('pi-safe')) markStop(id, 'safe');
      if (btn.classList.contains('pi-flag')) markStop(id, 'flag');
    });

    /* Tablet: sheet always visible */
    if (window.matchMedia('(min-width: 768px)').matches) {
      const sheet = document.getElementById('queue-sheet');
      if (sheet) { sheet.classList.add('open'); sheet.removeAttribute('aria-hidden'); }
      const sheetRouteBtn = document.getElementById('btn-route-sheet');
      if (sheetRouteBtn) sheetRouteBtn.removeAttribute('hidden');
    }

    renderVolunteerProfile();
  });
}

function renderVolunteerProfile() {
  const ROLE_LABELS = {
    volunteer: 'Community Volunteer', medical: 'Medical Support',
    responder: 'First Responder',     civil: 'Civil Protection',
  };
  const SKILL_LABELS = {
    physical: 'Physical', medical: 'First Aid', transport: 'Vehicle',
    elderly: 'Elderly Care', disability: 'Disability', language: 'Greek',
    rescue: 'S&R', comms: 'Comms',
  };

  const meta = document.querySelector('.priority-meta');
  if (!meta) return;

  /* Volunteer name + role line */
  if (volunteerName) {
    const nameEl = document.createElement('p');
    nameEl.className   = 'ob-volunteer-name';
    const roleStr      = volunteerRole ? ` · ${ROLE_LABELS[volunteerRole] || volunteerRole}` : '';
    nameEl.textContent = volunteerName + roleStr;
    meta.insertAdjacentElement('afterend', nameEl);
  }

  /* Skill tags */
  if (selectedSkills.size > 0) {
    const tags = document.createElement('div');
    tags.className = 'ob-skill-tags';
    selectedSkills.forEach(s => {
      const t = document.createElement('span');
      t.className   = 'ob-skill-tag';
      t.textContent = SKILL_LABELS[s] || s;
      tags.appendChild(t);
    });
    const anchor = document.querySelector('.ob-volunteer-name') || meta;
    anchor.insertAdjacentElement('afterend', tags);
  }
}

/* ============================================================
   STATE
   ============================================================ */
let leafletMap          = null;
let routePolyline       = null;   // L.layerGroup holding all route lines
let residentMarkers     = [];
let routingAnimating    = false;
let currentRoute        = [];
let visitedStops        = new Set();
let flaggedStops        = new Set();
let routeSegmentCoords  = [];     // Array<[lat,lon][]> — road coords per segment
let routeSegmentLines   = [];     // Solid progress polylines, one per segment
let previewLine         = null;   // Road preview for tapped resident
let selectedResId       = null;   // Currently previewed resident id
let prevCardState       = 'mc-idle'; // Card state to restore on preview dismiss
let evacuationLine      = null;   // Active evacuation route polyline
let activeExitId        = null;   // Which exit is currently routed to

function updateStatus(state) {
  const el = document.getElementById('route-status');
  if (!el) return;
  const labels = { ready: 'READY', routing: 'ROUTING', complete: 'COMPLETE' };
  el.dataset.state = state;
  el.textContent   = labels[state] || state.toUpperCase();
}

function setRouteBtn(disabled) {
  ['btn-route', 'btn-route-sheet'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = disabled;
  });
}

/* ============================================================
   QUEUE SHEET — open / close
   ============================================================ */
function openSheet() {
  const sheet = document.getElementById('queue-sheet');
  if (sheet) { sheet.classList.add('open'); sheet.removeAttribute('aria-hidden'); }
}

function closeSheet() {
  const sheet = document.getElementById('queue-sheet');
  if (sheet) { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); }
}

/* ============================================================
   MAP CARD — state machine
   idle | active | done
   ============================================================ */
function showCardState(id) {
  ['mc-idle', 'mc-preview', 'mc-active', 'mc-done'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.hidden = (s !== id);
  });
}

function updateMapCard(stop) {
  if (!stop) {
    /* All done */
    const done    = visitedStops.size;
    const flagged = flaggedStops.size;
    document.getElementById('mc-done-sub').textContent =
      `${done} safe · ${flagged} flagged for help`;
    showCardState('mc-done');
    return;
  }

  const urgency = URGENCY[stop.type];
  const uColor  = URGENCY_COLOR[urgency];
  const total   = currentRoute.length;
  const visited = visitedStops.size + flaggedStops.size;

  document.getElementById('mc-stop-name').textContent  = stop.name;
  document.getElementById('mc-stop-meta').innerHTML    =
    `<span style="color:${uColor};font-weight:600">${urgency}</span>` +
    ` &middot; Floor ${stop.floor} &middot; ${stop.village || stop.note.split(' — ')[0]}`;
  document.getElementById('mc-progress').textContent   = `${visited} / ${total}`;
  document.getElementById('mc-remaining').textContent  = String(total - visited);

  /* Wire current stop id to the card buttons */
  document.getElementById('mc-safe-btn').dataset.id = stop.id;
  document.getElementById('mc-flag-btn').dataset.id = stop.id;

  showCardState('mc-active');
}

/* ============================================================
   EVACUATION ROUTES — shown when all residents are handled
   ============================================================ */

function buildEvacExits() {
  const from = getCurrentPos();

  /* Reveal the sheet evacuation section */
  const qsEvac = document.getElementById('qs-evac');
  if (qsEvac) qsEvac.hidden = false;

  /* On mobile: open the sheet so the user sees it */
  if (!window.matchMedia('(min-width: 768px)').matches) {
    openSheet();
  }

  /* Populate both containers: sheet panel + map card */
  ['qs-evac-exits', 'mc-evac-exits'].forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    ACTIVE_SAFE_EXITS.forEach(exit => {
      const straightKm = (geoDistance(from.lat, from.lon, exit.lat, exit.lon) / 1000).toFixed(0);
      const btn = document.createElement('button');
      btn.className  = 'mc-exit-btn';
      btn.dataset.id = exit.id;
      btn.dataset.container = containerId;
      btn.innerHTML  = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="mc-exit-info">
          <div class="mc-exit-name">${exit.name}</div>
          <div class="mc-exit-note">${exit.note}</div>
        </div>
        <div class="mc-exit-dist" id="exit-dist-${containerId}-${exit.id}">~${straightKm} km</div>`;
      btn.addEventListener('click', () => routeToExit(exit));
      container.appendChild(btn);
    });
  });
}

async function routeToExit(exit) {
  /* Mark selected button */
  document.querySelectorAll('.mc-exit-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.id === exit.id);
    b.disabled = true;
  });

  /* Clear previous evacuation line */
  if (evacuationLine) { leafletMap.removeLayer(evacuationLine); evacuationLine = null; }
  activeExitId = exit.id;

  const from = getCurrentPos();

  /* Fetch road route to the exit */
  const coords = await fetchRoadSegment(from, exit);

  if (activeExitId !== exit.id) return; // user switched exit mid-fetch

  /* Road km */
  const roadKm = (coords.reduce((s, c, i) => {
    if (i === 0) return 0;
    return s + geoDistance(coords[i-1][0], coords[i-1][1], c[0], c[1]);
  }, 0) / 1000).toFixed(1);

  /* Draw evacuation route — green, slightly dashed */
  evacuationLine = L.polyline(coords, {
    color:     '#22c55e',
    weight:     6,
    opacity:    0.9,
    dashArray: '14 8',
    lineJoin:  'round',
    lineCap:   'round',
  }).addTo(leafletMap);

  /* Add exit point marker */
  const exitIcon = L.divIcon({
    className: '',
    html: `<div class="lf-exit-dot">EXIT</div>`,
    iconSize:   [42, 24],
    iconAnchor: [21, 12],
  });
  L.marker([exit.lat, exit.lon], { icon: exitIcon }).addTo(leafletMap);

  /* Update map card status (mobile) */
  const mcStatusEl = document.getElementById('mc-evac-status');
  const mcDest = document.getElementById('mc-evac-dest');
  const mcKm   = document.getElementById('mc-evac-km');
  if (mcDest) mcDest.textContent = exit.name;
  if (mcKm)   mcKm.textContent   = roadKm;
  if (mcStatusEl) mcStatusEl.hidden = false;

  /* Update sheet panel status (tablet) */
  const qsStatusEl = document.getElementById('qs-evac-status');
  const qsDest = document.getElementById('qs-evac-dest');
  const qsKm   = document.getElementById('qs-evac-km');
  if (qsDest) qsDest.textContent = exit.name;
  if (qsKm)   qsKm.textContent   = roadKm;
  if (qsStatusEl) qsStatusEl.hidden = false;

  /* Update distance on all matching exit buttons (both containers) */
  document.querySelectorAll(`.mc-exit-btn[data-id="${exit.id}"] .mc-exit-dist`)
    .forEach(el => { el.textContent = `${roadKm} km`; });

  /* Re-enable all buttons */
  document.querySelectorAll('.mc-exit-btn').forEach(b => b.disabled = false);

  /* Fit map to evacuation route */
  leafletMap.fitBounds(
    L.latLngBounds([[from.lat, from.lon], ...coords]),
    { padding: [60, 60] }
  );
}

/* ============================================================
   RESIDENT PREVIEW — tap any marker to see road path to them
   ============================================================ */

/* Returns the volunteer's current position:
   last visited/flagged stop, or the staging area if none yet. */
function getCurrentPos() {
  const done = new Set([...visitedStops, ...flaggedStops]);
  for (let i = currentRoute.length - 1; i >= 0; i--) {
    if (done.has(currentRoute[i].id)) return currentRoute[i];
  }
  return ACTIVE_VOLUNTEER_START;
}

function clearPreview() {
  if (previewLine) { leafletMap.removeLayer(previewLine); previewLine = null; }
  if (selectedResId) {
    const dot = document.getElementById(`dot-${selectedResId}`);
    if (dot) dot.classList.remove('dot-selected');
    selectedResId = null;
  }
}

async function selectResident(resId) {
  /* Toggle off if same resident tapped again */
  if (selectedResId === resId) {
    clearPreview();
    showCardState(prevCardState);
    return;
  }

  clearPreview();

  const res = MY_RESIDENTS.find(r => r.id === resId);
  if (!res) return;

  selectedResId = resId;

  /* Remember what card state to return to */
  const visibleCard = ['mc-idle','mc-active','mc-done'].find(id => {
    const el = document.getElementById(id);
    return el && !el.hidden;
  });
  prevCardState = visibleCard || 'mc-idle';

  /* Ring the selected marker */
  const dot = document.getElementById(`dot-${resId}`);
  if (dot) dot.classList.add('dot-selected');

  /* Show preview card immediately with loading state */
  const urgency = URGENCY[res.type];
  const uColor  = URGENCY_COLOR[urgency];
  document.getElementById('mc-preview-name').textContent = res.name;
  document.getElementById('mc-preview-meta').innerHTML   =
    `<span style="color:${uColor};font-weight:600">${urgency}</span>` +
    ` &middot; Floor ${res.floor}`;
  document.getElementById('mc-preview-label').textContent = 'ROUTE PREVIEW';
  document.getElementById('mc-preview-km').textContent    = '…';
  document.getElementById('mc-preview-km').style.color    = '#ffffff';
  document.getElementById('mc-preview-safe').dataset.id   = res.id;
  document.getElementById('mc-preview-flag').dataset.id   = res.id;
  showCardState('mc-preview');

  /* Fetch road route from current position */
  const from   = getCurrentPos();
  const coords = await fetchRoadSegment(from, res);

  /* Guard: user may have deselected while fetching */
  if (selectedResId !== resId) return;

  /* Road distance */
  const roadM = coords.reduce((s, c, i) => {
    if (i === 0) return 0;
    return s + geoDistance(coords[i-1][0], coords[i-1][1], c[0], c[1]);
  }, 0);
  const roadKm = (roadM / 1000).toFixed(1);

  /* Update card with distance, color the number in the resident's type color */
  document.getElementById('mc-preview-km').textContent = roadKm;
  document.getElementById('mc-preview-km').style.color = RESIDENT_COLORS[res.type];

  /* Draw road path in the resident's color */
  previewLine = L.polyline(coords, {
    color:    RESIDENT_COLORS[res.type],
    weight:    6,
    opacity:   0.88,
    lineJoin: 'round',
    lineCap:  'round',
  }).addTo(leafletMap);

  /* Fit map to show volunteer → resident route */
  const allPts = [[from.lat, from.lon], ...coords];
  leafletMap.fitBounds(L.latLngBounds(allPts), { padding: [60, 60] });
}

/* ============================================================
   TOOLTIP (shared HTML overlay — consistent with main deck)
   ============================================================ */
const tooltip = document.getElementById('tooltip');

function showTooltip(e, title, meta, desc) {
  tooltip.innerHTML = `
    <div class="tt-title">${title}</div>
    <div class="tt-meta">${meta}</div>
    ${desc ? `<div class="tt-desc">${desc}</div>` : ''}
  `;
  tooltip.classList.add('visible');
  moveTooltip(e);
}

function moveTooltip(e) {
  const pad = 16, tipW = 260;
  const tipH = tooltip.offsetHeight || 80;
  let x = e.clientX + pad;
  let y = e.clientY - tipH / 2;
  if (x + tipW > window.innerWidth)  x = e.clientX - tipW - pad;
  if (y < 8)                          y = 8;
  if (y + tipH > window.innerHeight) y = window.innerHeight - tipH - 8;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

function hideTooltip() { tooltip.classList.remove('visible'); }

/* ============================================================
   GEOGRAPHIC DISTANCE — Haversine (metres)
   ============================================================ */
function geoDistance(lat1, lon1, lat2, lon2) {
  const R  = 6_371_000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a  = Math.sin(Δφ / 2) ** 2
           + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ============================================================
   SCORING & ROUTING ALGORITHM
   ============================================================ */
function score(resident, fromPos) {
  const dist        = geoDistance(fromPos.lat, fromPos.lon, resident.lat, resident.lon) || 1;
  const typeWeight  = { elderly: 1.2, disabled: 1.5, both: 2.2 };
  /* Physical skill → less floor penalty (can carry people up/down) */
  const floorPenalty = 1 + (resident.floor || 0) * (selectedSkills.has('physical') ? 0.18 : 0.4);
  /* Vehicle → distance matters less */
  const distWeight   = selectedSkills.has('transport') ? 0.65 : 1.0;

  let skillMult = 1.0;
  selectedSkills.forEach(skill => {
    const mod = SKILL_MODIFIERS[skill];
    if (mod) skillMult *= mod(resident);
  });

  return (typeWeight[resident.type] * skillMult * 1e6) / (dist * distWeight * floorPenalty);
}

function computeRoute(residents, start) {
  const route     = [];
  const remaining = [...residents];
  let   current   = { lat: start.lat, lon: start.lon };
  while (remaining.length > 0) {
    const best = remaining
      .map(r => ({ ...r, _score: score(r, current) }))
      .sort((a, b) => b._score - a._score)[0];
    route.push(best);
    remaining.splice(remaining.findIndex(r => r.id === best.id), 1);
    current = { lat: best.lat, lon: best.lon };
  }
  return route;
}

/* ============================================================
   MAP INITIALISATION
   ============================================================ */
function initMap() {
  const cfg = ACTIVE_MAP_CONFIG;

  leafletMap = L.map('routing-map', {
    center:      cfg.mapCenter,
    zoom:        cfg.mapZoom,
    zoomControl: true,
  });

  /* CartoDB Dark Matter — high-contrast field tool aesthetic */
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
      '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap);

  /* ── Wildfire-specific layers (EFFIS + Copernicus perimeter) ── */
  const layersPanel = document.getElementById('map-layers');
  if (cfg.showFireLayer) {
    const effisLayer = L.tileLayer.wms(
      'https://maps.effis.emergency.copernicus.eu/effis', {
        layers:      'modis.ba.poly',
        format:      'image/png',
        transparent:  true,
        version:     '1.3.0',
        opacity:      0.55,
        attribution: 'Burned area: <a href="https://effis.jrc.ec.europa.eu" target="_blank">EFFIS © JRC/EU</a>',
      }
    ).addTo(leafletMap);

    const fireLayer = L.geoJSON(FIRE_PERIMETER_DATA, {
      style: { color: '#e55a00', weight: 1, fillColor: '#ff7700', fillOpacity: 0.09, dashArray: '2 7' },
    })
    .bindTooltip(
      '<strong>Affected Zone — Evros Aug 2023</strong><br>' +
      '<small>Copernicus EMS EMSN166 · 92,321 ha<br>' +
      'Basis for civil protection evacuation orders</small>',
      { sticky: true, className: 'lf-fire-tip' }
    )
    .addTo(leafletMap);

    function syncFireStyle() {
      const z = leafletMap.getZoom();
      fireLayer.setStyle(
        z <= 8  ? { weight: 0.6, dashArray: '1 8',  fillOpacity: 0.06 } :
        z <= 10 ? { weight: 1.0, dashArray: '2 7',  fillOpacity: 0.09 } :
        z <= 12 ? { weight: 1.4, dashArray: '3 6',  fillOpacity: 0.11 } :
                  { weight: 1.8, dashArray: '4 5',  fillOpacity: 0.13 }
      );
    }
    leafletMap.on('zoomend', syncFireStyle);
    syncFireStyle();

    function wireLayerToggle(btnId, layer) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const on = leafletMap.hasLayer(layer);
        on ? leafletMap.removeLayer(layer) : layer.addTo(leafletMap);
        btn.classList.toggle('active', !on);
      });
    }
    wireLayerToggle('layer-fire',  fireLayer);
    wireLayerToggle('layer-effis', effisLayer);
    if (layersPanel) layersPanel.style.display = '';
  } else {
    if (layersPanel) layersPanel.style.display = 'none';
  }

  /* Village reference markers ----------------------------- */
  ACTIVE_VILLAGES.forEach(v => {
    L.circleMarker([v.lat, v.lon], {
      radius:      4,
      color:       'rgba(140, 175, 230, 0.45)',
      fillColor:   'rgba(140, 175, 230, 0.12)',
      fillOpacity: 1,
      weight:      1.2,
    })
    .bindTooltip(
      `<strong>${v.name}</strong><br><small>${v.note}</small>`,
      { className: 'lf-village-tip' }
    )
    .addTo(leafletMap);
  });

  /* Volunteer marker -------------------------------------- */
  const vs = ACTIVE_VOLUNTEER_START;
  const volIcon = L.divIcon({
    className: '',
    html: `<div class="lf-vol-dot">V</div><span class="lf-vol-label">${vs.label}</span>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  });
  L.marker([vs.lat, vs.lon], { icon: volIcon })
   .bindTooltip(
     `<strong>Volunteer — ${vs.label.replace('<br>', ' ')}</strong><br><small>${vs.note}</small>`,
     { className: 'lf-vol-tip' }
   )
   .addTo(leafletMap);

  /* Other-volunteer residents — dimmed, non-interactive --  */
  OTHER_RESIDENTS.forEach(res => {
    const color   = RESIDENT_COLORS[res.type];
    const initial = res.type === 'elderly' ? 'E' : res.type === 'disabled' ? 'D' : 'B';
    const icon = L.divIcon({
      className: '',
      html: `<div class="lf-res-wrap lf-res-other">
               <div class="lf-res-dot" style="background:${color};opacity:0.25">${initial}</div>
               <span class="lf-other-badge">V2</span>
             </div>`,
      iconSize:   [24, 32],
      iconAnchor: [12, 24],
    });
    L.marker([res.lat, res.lon], { icon, interactive: false })
     .bindTooltip(
       `<strong>${res.name}</strong><br><small>Assigned to another volunteer</small>`,
       { className: 'lf-village-tip' }
     )
     .addTo(leafletMap);
  });

  /* Resident markers — this volunteer's assignment ---------- */
  residentMarkers = MY_RESIDENTS.map(res => {
    const color   = RESIDENT_COLORS[res.type];
    const initial = res.type === 'elderly' ? 'E' : res.type === 'disabled' ? 'D' : 'B';

    const icon = L.divIcon({
      className: '',
      html: `
        <div class="lf-res-wrap">
          ${res.floor > 0
            ? `<span class="lf-floor" style="background:${color}">F${res.floor}</span>`
            : ''}
          <div class="lf-res-dot" id="dot-${res.id}" style="background:${color}">${initial}</div>
        </div>`,
      iconSize:   [24, 32],
      iconAnchor: [12, 24],
    });

    const marker = L.marker([res.lat, res.lon], { icon })
      .on('click', () => selectResident(res.id))
      .on('mouseover', e => {
          if (selectedResId === res.id) return;
          showTooltip(
            e.originalEvent,
            res.name,
            `${res.type.charAt(0).toUpperCase() + res.type.slice(1)} · Floor ${res.floor}`,
            res.note
          );
        })
      .on('mousemove',  e => moveTooltip(e.originalEvent))
      .on('mouseout',   hideTooltip)
      .addTo(leafletMap);

    return { id: res.id, marker, color, initial };
  });

  /* Data source attribution (bottom-left) ----------------- */
  const notice = L.control({ position: 'bottomleft' });
  notice.onAdd = () => {
    const d = L.DomUtil.create('div', 'lf-data-notice');
    d.innerHTML = cfg.dataSource;
    return d;
  };
  notice.addTo(leafletMap);

  /* Tap on map background dismisses any active preview */
  leafletMap.on('click', () => {
    if (selectedResId) {
      clearPreview();
      showCardState(prevCardState);
    }
  });

  /* Fit map after layout is painted */
  setTimeout(() => {
    leafletMap.invalidateSize();
    leafletMap.fitBounds(cfg.mapBounds, { padding: [36, 36] });
  }, 120);
}

/* ============================================================
   OSRM — real road routing (OpenStreetMap, no API key)
   Public demo server; returns GeoJSON geometry for each segment.
   Falls back to a straight line if the request fails.
   ============================================================ */
const OSRM = 'https://router.project-osrm.org/route/v1/driving';

async function fetchRoadSegment(from, to) {
  const url = `${OSRM}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res   = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const data  = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]) {
      /* OSRM returns [lon, lat]; Leaflet needs [lat, lon] */
      return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    }
  } catch (_) { /* network error or timeout — fall through */ }
  /* Straight-line fallback */
  return [[from.lat, from.lon], [to.lat, to.lon]];
}

/* ============================================================
   CALCULATE & ANIMATE ROUTE
   ============================================================ */
const URGENCY       = { both: 'CRITICAL', disabled: 'HIGH', elderly: 'MODERATE' };
const URGENCY_COLOR = { CRITICAL: '#a78bfa', HIGH: '#77b6ff', MODERATE: '#e8aa30' };

function buildQueueItem(res, rank, distKm) {
  const color   = RESIDENT_COLORS[res.type];
  const urgency = URGENCY[res.type];
  const uColor  = URGENCY_COLOR[urgency];
  const item    = document.createElement('div');
  item.className         = 'priority-item';
  item.id                = `pitem-${res.id}`;
  item.dataset.id        = res.id;
  item.style.borderLeftColor = color;
  item.innerHTML = `
    <span class="pi-rank">${rank}</span>
    <span class="pi-dot" style="background:${color}"></span>
    <div class="pi-info">
      <div class="pi-name">${res.name}</div>
      <div class="pi-detail">
        <span class="pi-tag" style="background:${uColor}22;color:${uColor};border:1px solid ${uColor}44">${urgency}</span>
        Fl.${res.floor} &nbsp;&middot;&nbsp; ${distKm} km
      </div>
      <div class="pi-note">${res.note}</div>
    </div>
    <div class="pi-actions">
      <button class="pi-btn pi-safe" data-id="${res.id}" title="Mark as safe / evacuated">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Safe
      </button>
      <button class="pi-btn pi-flag" data-id="${res.id}" title="Needs emergency assistance">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Help
      </button>
    </div>`;
  return item;
}

async function calculateAndAnimateRoute() {
  if (routingAnimating) return;
  routingAnimating = true;
  visitedStops.clear();
  flaggedStops.clear();
  routeSegmentCoords = [];
  routeSegmentLines  = [];

  /* Clear existing route layers */
  if (routePolyline) { leafletMap.removeLayer(routePolyline); routePolyline = null; }

  currentRoute = computeRoute(MY_RESIDENTS, ACTIVE_VOLUNTEER_START);

  /* — Loading state — */
  updateStatus('routing');
  setRouteBtn(true);
  setRouteBtnLabel('Fetching roads…');

  /* Build ordered waypoint list: volunteer → each stop */
  const waypoints = [ACTIVE_VOLUNTEER_START, ...currentRoute];

  /* Fetch all road segments in parallel */
  const segmentPromises = waypoints.slice(0, -1).map((from, i) =>
    fetchRoadSegment(from, waypoints[i + 1])
  );
  routeSegmentCoords = await Promise.all(segmentPromises);

  setRouteBtnLabel('Calculate Route');

  /* ── Draw dashed overview of full road route ── */
  const allRoadCoords = routeSegmentCoords.flat();
  const dashOverview  = L.polyline(allRoadCoords, {
    color:     'rgba(42, 96, 223, 0.22)',
    weight:     3,
    opacity:    1,
    dashArray: '6 10',
    lineJoin:  'round',
    lineCap:   'round',
  }).addTo(leafletMap);

  routePolyline = L.layerGroup([dashOverview]);
  leafletMap.fitBounds(L.latLngBounds(allRoadCoords), { padding: [48, 48] });

  /* ── Total road distance (sum of segment lengths) ── */
  const totalKm = routeSegmentCoords.reduce((sum, seg) => {
    for (let i = 1; i < seg.length; i++) {
      sum += geoDistance(seg[i-1][0], seg[i-1][1], seg[i][0], seg[i][1]);
    }
    return sum;
  }, 0);

  /* ── Animate stops one by one ── */
  const listEl    = document.getElementById('priority-list');
  const summaryEl = document.getElementById('route-summary');
  listEl.innerHTML = '';

  const STEP = 800;

  const firstDot = document.getElementById(`dot-${currentRoute[0].id}`);
  if (firstDot) firstDot.classList.add('dot-active');

  currentRoute.forEach((res, i) => {
    setTimeout(() => {

      /* Draw solid road segment for this stop */
      const segLine = L.polyline(routeSegmentCoords[i], {
        color:    '#2a60df',
        weight:    5,
        opacity:   0.85,
        lineJoin: 'round',
        lineCap:  'round',
      }).addTo(leafletMap);
      routeSegmentLines.push(segLine);
      routePolyline.addLayer(segLine);

      /* Map marker: show rank */
      const dot = document.getElementById(`dot-${res.id}`);
      if (dot) {
        dot.classList.remove('dot-active');
        dot.textContent = i + 1;
        dot.style.background  = '#2a60df';
        dot.style.borderColor = 'rgba(255,255,255,0.55)';
        dot.classList.add('dot-visited');
      }
      if (i < currentRoute.length - 1) {
        const nextDot = document.getElementById(`dot-${currentRoute[i + 1].id}`);
        if (nextDot) nextDot.classList.add('dot-active');
      }

      /* Queue item — distance along road */
      const segKm = routeSegmentCoords[i].reduce((s, c, j) => {
        if (j === 0) return 0;
        return s + geoDistance(routeSegmentCoords[i][j-1][0], routeSegmentCoords[i][j-1][1], c[0], c[1]) / 1000;
      }, 0).toFixed(1);
      const item = buildQueueItem(res, i + 1, segKm);
      listEl.appendChild(item);
      requestAnimationFrame(() => item.classList.add('visible'));

      /* After last stop */
      if (i === currentRoute.length - 1) {
        setTimeout(() => {
          routingAnimating = false;
          updateStatus('routing');

          if (summaryEl) {
            document.getElementById('rs-dist').textContent     = (totalKm / 1000).toFixed(1);
            document.getElementById('rs-progress').textContent = `0 / ${currentRoute.length}`;
            document.getElementById('rs-flagged').textContent  = '0';
            summaryEl.hidden = false;
          }

          if (window.matchMedia('(min-width: 768px)').matches) {
            const sheetBtn = document.getElementById('btn-route-sheet');
            if (sheetBtn) sheetBtn.hidden = true;
          }

          highlightNextStop();
        }, 400);
      }
    }, i * STEP);
  });
}

function setRouteBtnLabel(text) {
  ['btn-route', 'btn-route-sheet'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    /* Replace text node, keep svg icon intact */
    const textNode = [...btn.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (textNode) textNode.textContent = ' ' + text;
  });
}

/* ============================================================
   MARK A STOP — core field interaction
   ============================================================ */
function markStop(id, outcome) {
  /* Dismiss any active preview before marking */
  if (selectedResId === id) clearPreview();

  if (outcome === 'safe')  visitedStops.add(id);
  if (outcome === 'flag')  flaggedStops.add(id);

  /* Queue item */
  const item = document.getElementById(`pitem-${id}`);
  if (item) {
    item.classList.remove('active');
    item.classList.add(outcome === 'safe' ? 'done' : 'flagged');
    const actions = item.querySelector('.pi-actions');
    if (actions) {
      actions.outerHTML = outcome === 'safe'
        ? '<span class="pi-status pi-status-safe">Evacuated</span>'
        : '<span class="pi-status pi-status-flag">Help called</span>';
    }
  }

  /* Map marker */
  updateMarkerOutcome(id, outcome);

  /* Dim completed segment on progress line */
  dimCompletedSegment(id);

  /* Summary counters */
  updateSummary();

  /* Advance to next stop */
  highlightNextStop();
}

function updateMarkerOutcome(id, outcome) {
  const entry = residentMarkers.find(m => m.id === id);
  if (!entry) return;
  const isSafe  = outcome === 'safe';
  const bg      = isSafe ? 'rgba(107, 143, 199, 0.55)' : 'rgba(220, 80, 80, 0.75)';
  const symbol  = isSafe ? '✓' : '!';
  const newIcon = L.divIcon({
    className: '',
    html: `<div class="lf-res-wrap">
             <div class="lf-res-dot lf-res-outcome" style="background:${bg};border-color:rgba(255,255,255,0.25)">${symbol}</div>
           </div>`,
    iconSize:   [26, 34],
    iconAnchor: [13, 27],
  });
  entry.marker.setIcon(newIcon);
}

function dimCompletedSegment(id) {
  const idx = currentRoute.findIndex(r => r.id === id);
  if (idx < 0 || !routeSegmentLines[idx]) return;
  routeSegmentLines[idx].setStyle({
    color:     '#6b8fc7',
    weight:     3,
    opacity:    0.25,
    dashArray: '4 7',
  });
}

function highlightNextStop() {
  residentMarkers.forEach(({ id }) => {
    const dot = document.getElementById(`dot-${id}`);
    if (dot) dot.classList.remove('dot-active');
  });
  document.querySelectorAll('.priority-item.active').forEach(el => el.classList.remove('active'));

  const done = new Set([...visitedStops, ...flaggedStops]);
  const next = currentRoute.find(r => !done.has(r.id));

  if (!next) {
    updateStatus('complete');
    updateMapCard(null);
    buildEvacExits();
    return;
  }

  /* Highlight queue item */
  const el = document.getElementById(`pitem-${next.id}`);
  if (el) {
    el.classList.add('active');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* Pulse marker + pan map */
  const dot = document.getElementById(`dot-${next.id}`);
  if (dot) dot.classList.add('dot-active');
  leafletMap.panTo([next.lat, next.lon], { animate: true, duration: 0.6 });

  /* Update floating card */
  updateMapCard(next);
}

function updateSummary() {
  const total   = currentRoute.length;
  const done    = visitedStops.size + flaggedStops.size;
  const flagged = flaggedStops.size;
  const progEl  = document.getElementById('rs-progress');
  const flagEl  = document.getElementById('rs-flagged');
  if (progEl) progEl.textContent = `${done} / ${total}`;
  if (flagEl) flagEl.textContent  = String(flagged);
  if (flagged > 0 && flagEl) flagEl.classList.add('rs-alert');
}

/* ============================================================
   RESET
   ============================================================ */
function resetRoute() {
  routingAnimating   = false;
  visitedStops.clear();
  flaggedStops.clear();
  currentRoute       = [];
  routeSegmentCoords = [];
  routeSegmentLines  = [];
  clearPreview();
  if (evacuationLine) { leafletMap.removeLayer(evacuationLine); evacuationLine = null; }
  activeExitId  = null;
  prevCardState = 'mc-idle';
  const mcEvacStatus = document.getElementById('mc-evac-status');
  if (mcEvacStatus) mcEvacStatus.hidden = true;
  const qsEvacStatus = document.getElementById('qs-evac-status');
  if (qsEvacStatus) qsEvacStatus.hidden = true;
  const qsEvac = document.getElementById('qs-evac');
  if (qsEvac) qsEvac.hidden = true;
  setRouteBtnLabel('Calculate Route');

  if (routePolyline) { leafletMap.removeLayer(routePolyline); routePolyline = null; }

  /* Restore all markers to original state */
  residentMarkers.forEach(({ id, color, initial }) => {
    const dot = document.getElementById(`dot-${id}`);
    if (dot) {
      dot.textContent = initial;
      dot.style.background  = color;
      dot.style.borderColor = 'rgba(255,255,255,0.7)';
      dot.classList.remove('dot-visited', 'dot-active');
    }
    /* Re-draw the original icon (in case setIcon was called) */
    const entry = residentMarkers.find(m => m.id === id);
    const res   = MY_RESIDENTS.find(r => r.id === id);
    if (entry && res) {
      const floorHtml = res.floor > 0
        ? `<span class="lf-floor" style="background:${color}">F${res.floor}</span>` : '';
      entry.marker.setIcon(L.divIcon({
        className: '',
        html: `<div class="lf-res-wrap">${floorHtml}<div class="lf-res-dot" id="dot-${id}" style="background:${color}">${initial}</div></div>`,
        iconSize:   [26, 34],
        iconAnchor: [13, 27],
      }));
    }
  });

  /* Reset queue */
  const listEl = document.getElementById('priority-list');
  listEl.innerHTML = `
    <div class="priority-empty">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 15V5m0 0L9 7"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>Press <strong>Calculate Route</strong> to generate an optimized visit order based on vulnerability and proximity.</p>
    </div>`;

  const summaryEl = document.getElementById('route-summary');
  if (summaryEl) summaryEl.hidden = true;

  showCardState('mc-idle');
  closeSheet();
  updateStatus('ready');
  setRouteBtn(false);

  leafletMap.fitBounds(ACTIVE_MAP_CONFIG.mapBounds, { padding: [36, 36] });
}

/* ============================================================
   ONBOARDING INIT — runs before map so it's immune to map errors
   ============================================================ */
function showObStep(n) {
  [1, 2, 3, 4].forEach(i => {
    const el = document.getElementById(`ob-step-${i}`);
    if (!el) return;
    if (i === n) { el.removeAttribute('hidden'); el.style.display = 'flex'; }
    else          { el.style.display = 'none'; }
  });
  const fill = document.getElementById('ob-prog-fill');
  if (fill) fill.style.width = `${(n / 4) * 100}%`;
}

function initOnboarding() {
  /* ── Step 1: Disaster selection ── */
  document.querySelectorAll('.dc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dc').forEach(b => b.classList.remove('dc-selected'));
      btn.classList.add('dc-selected');
      selectedDisaster = btn.dataset.type;
      const next = document.getElementById('ob-next-1');
      if (next) next.disabled = false;
    });
  });

  document.getElementById('ob-next-1')?.addEventListener('click', () => showObStep(2));

  /* ── Step 2: Volunteer profile ── */
  const nameInput = document.getElementById('ob-name');
  const next2     = document.getElementById('ob-next-2');

  function checkProfileReady() {
    volunteerName = nameInput ? nameInput.value.trim() : '';
    if (next2) next2.disabled = volunteerName.length === 0;
  }

  nameInput?.addEventListener('input', checkProfileReady);

  document.querySelectorAll('.ob-role').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ob-role').forEach(b => b.classList.remove('ob-role-on'));
      btn.classList.add('ob-role-on');
      volunteerRole = btn.dataset.role;
    });
  });

  document.getElementById('ob-back-btn-2')?.addEventListener('click', () => showObStep(1));
  document.getElementById('ob-next-2')?.addEventListener('click',     () => showObStep(3));

  /* ── Step 3: Skills ── */
  document.querySelectorAll('.sk').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.dataset.skill;
      if (selectedSkills.has(skill)) {
        selectedSkills.delete(skill);
        btn.classList.remove('sk-on');
      } else {
        selectedSkills.add(skill);
        btn.classList.add('sk-on');
      }
    });
  });

  document.getElementById('ob-back-btn-3')?.addEventListener('click', () => showObStep(2));

  /* Step 3 → Step 4: generate the mission brief */
  document.getElementById('ob-start')?.addEventListener('click', async () => {
    showObStep(4);

    /* Run partition now so the brief and assigned list are ready */
    partitionResidents();

    /* YOUR STOPS section */
    const assignedEl = document.getElementById('ob-assigned');
    if (assignedEl) {
      assignedEl.innerHTML = MY_RESIDENTS.map(r => {
        const color   = RESIDENT_COLORS[r.type];
        const urgency = { both: 'CRITICAL', disabled: 'HIGH', elderly: 'MODERATE' }[r.type];
        return `<div class="ob-assigned-item">
          <span class="ob-assigned-dot" style="background:${color}"></span>
          <div class="ob-assigned-info">
            <span class="ob-assigned-name">${r.name}</span>
            <span class="ob-assigned-tag" style="color:${color}">${urgency} · Fl.${r.floor}</span>
          </div>
        </div>`;
      }).join('');
    }

    /* COVERED BY TEAM section */
    const otherSection = document.getElementById('ob-other-section');
    const otherEl      = document.getElementById('ob-other-assigned');
    if (otherEl && OTHER_RESIDENTS.length > 0) {
      otherEl.innerHTML = OTHER_RESIDENTS.map(r => {
        const color = RESIDENT_COLORS[r.type];
        return `<div class="ob-other-item">
          <span class="ob-other-dot" style="background:${color}"></span>
          <span class="ob-other-name">${r.name}</span>
        </div>`;
      }).join('');
      if (otherSection) otherSection.removeAttribute('hidden');
    }

    /* Fetch AI brief while residents list is already visible */
    const loadingEl = document.getElementById('ob-brief-loading');
    const beginBtn  = document.getElementById('ob-begin');

    let brief = await generateMissionBrief();
    if (!brief) brief = fallbackMissionBrief();

    if (loadingEl) loadingEl.style.display = 'none';

    /* Render insight chips */
    const insightsEl = document.getElementById('ob-insights');
    if (insightsEl) {
      document.getElementById('ob-ins-priority').textContent = brief.priority;
      document.getElementById('ob-ins-start').textContent    = brief.start;
      document.getElementById('ob-ins-prepare').textContent  = brief.prepare;
      document.getElementById('ob-ins-split').textContent    = brief.why_split;
      insightsEl.removeAttribute('hidden');
    }

    if (beginBtn) beginBtn.disabled = false;
  });

  /* Step 4 → dismiss to map */
  document.getElementById('ob-begin')?.addEventListener('click', dismissOnboarding);
}

/* ============================================================
   INIT — onboarding only; map starts after "Start Mission"
   ============================================================ */
window.addEventListener('load', () => {
  initOnboarding();
});
