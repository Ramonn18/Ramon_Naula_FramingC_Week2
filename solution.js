/* ============================================================
   EVROS WILDFIRE — VOLUNTEER ROUTING TOOL
   Map:     Leaflet.js + CartoDB Positron (no API key)
   Fire:    Approximate perimeter — Copernicus EMSN166 activation
   Villages: OpenStreetMap Overpass API (real coordinates)
   ============================================================ */

/* ----------------------------------------------------------
   FIRE PERIMETER
   Source: Copernicus EMS EMSN166 — WildfireDEL (delineation)
   112 burn patches · 92,321 ha · photo-interpreted
   Loaded from fire_perimeter.js (FIRE_PERIMETER_DATA global)
   ---------------------------------------------------------- */

/* ----------------------------------------------------------
   AFFECTED VILLAGES
   Source: OpenStreetMap Overpass API (real coordinates)
   Cross-referenced with Copernicus EMSN166 activation page
   and news reports of evacuated settlements.
   ---------------------------------------------------------- */
const AFFECTED_VILLAGES = [
  { name: 'Aristino',   lat: 40.8729, lon: 25.9981, note: 'Fire origin — evacuated Aug 19' },
  { name: 'Avantas',    lat: 40.9328, lon: 25.9160, note: 'First evacuation wave' },
  { name: 'Nipsa',      lat: 40.9302, lon: 26.0177, note: 'First evacuation wave' },
  { name: 'Aetochori',  lat: 40.8983, lon: 25.9976, note: 'First evacuation wave' },
  { name: 'Pefka',      lat: 40.9008, lon: 26.0413, note: 'First evacuation wave' },
  { name: 'Loutros',    lat: 40.8812, lon: 26.0468, note: 'Second evacuation wave' },
  { name: 'Agnantia',   lat: 40.8828, lon: 25.9767, note: 'Second evacuation wave' },
  { name: 'Doriko',     lat: 40.9090, lon: 25.9797, note: 'Second evacuation wave' },
  { name: 'Lefkimmi',   lat: 41.0234, lon: 26.1975, note: 'Fire zone' },
  { name: 'Lykofos',    lat: 41.1200, lon: 26.2893, note: 'Fire zone' },
  { name: 'Dadia',      lat: 41.1293, lon: 26.2249, note: 'Epicenter — Dadia NP' },
  { name: 'Sidiro',     lat: 41.2466, lon: 26.1314, note: 'Fire zone (north)' },
];

/* ----------------------------------------------------------
   VULNERABLE RESIDENTS
   Representative persons placed at real evacuated village
   coordinates. Not real personal data — modelled after the
   demographic profile of affected communities.
   ---------------------------------------------------------- */
const RESIDENT_COLORS = {
  elderly:  '#e8aa30',
  disabled: '#77b6ff',
  both:     '#a78bfa',
};

const RESIDENTS_DATA = [
  {
    id: 'r1', name: 'Mr. Karakostas',
    type: 'both',     lat: 40.8731, lon: 25.9992, floor: 1,
    note: 'Age 81, mobility aid — Aristino (fire origin)',
  },
  {
    id: 'r2', name: 'Ms. Pavlidou',
    type: 'disabled', lat: 40.9326, lon: 25.9158, floor: 0,
    note: 'Wheelchair user — Avantas',
  },
  {
    id: 'r3', name: 'Mrs. Tsoukalas',
    type: 'elderly',  lat: 40.9304, lon: 26.0179, floor: 0,
    note: 'Age 77, lives alone — Nipsa',
  },
  {
    id: 'r4', name: 'Mr. Demetriou',
    type: 'elderly',  lat: 40.8985, lon: 25.9974, floor: 1,
    note: 'Age 74, hearing impaired — Aetochori',
  },
  {
    id: 'r5', name: 'Mrs. Zervou',
    type: 'both',     lat: 41.1291, lon: 26.2251, floor: 0,
    note: 'Age 85, confined to bed — Dadia (epicenter)',
  },
  {
    id: 'r6', name: 'Mr. Alexiou',
    type: 'disabled', lat: 41.0232, lon: 26.1977, floor: 0,
    note: 'Visual impairment — Lefkimmi',
  },
  {
    id: 'r7', name: 'Ms. Nikolaidou',
    type: 'elderly',  lat: 41.1198, lon: 26.2891, floor: 1,
    note: 'Age 79, mobility impaired — Lykofos',
  },
  {
    id: 'r8', name: 'Mr. Stavrakis',
    type: 'both',     lat: 41.2464, lon: 26.1312, floor: 0,
    note: 'Age 82, wheelchair — Sidiro (north)',
  },
];

/* Volunteer stages at Feres — on E90, outside the fire zone */
const VOLUNTEER_START = { lat: 40.8942, lon: 26.1741 };

/* ============================================================
   STATE
   ============================================================ */
let leafletMap    = null;
let routePolyline = null;
let residentMarkers = []; // [{ id, marker }]
let routingAnimating = false;

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
  const floorPenalty = 1 + (resident.floor || 0) * 0.4;
  return (typeWeight[resident.type] * 1e6) / (dist * floorPenalty);
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
  leafletMap = L.map('routing-map', {
    center: [41.05, 26.10],
    zoom: 10,
    zoomControl: true,
  });

  /* CartoDB Positron — clean light basemap, no API key */
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
      '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap);

  /* Fire perimeter — Copernicus EMSN166 WildfireDEL -------- */
  L.geoJSON(FIRE_PERIMETER_DATA, {
    style: {
      color:       '#c0392b',
      weight:       1.5,
      dashArray:   null,
      fillColor:   '#e74c3c',
      fillOpacity:  0.18,
    },
  })
  .bindTooltip(
    '<strong>Evros Wildfire — Aug 2023</strong><br>' +
    '<small>Copernicus EMSN166 · 92,321 ha<br>' +
    'Dadia National Park & surrounding region</small>',
    { sticky: true, className: 'lf-fire-tip' }
  )
  .addTo(leafletMap);

  /* Village reference markers ----------------------------- */
  AFFECTED_VILLAGES.forEach(v => {
    L.circleMarker([v.lat, v.lon], {
      radius:      5,
      color:       'rgba(60,80,120,0.5)',
      fillColor:   'rgba(60,80,120,0.12)',
      fillOpacity: 1,
      weight:      1.5,
    })
    .bindTooltip(
      `<strong>${v.name}</strong><br><small>${v.note}</small>`,
      { className: 'lf-village-tip' }
    )
    .addTo(leafletMap);
  });

  /* Volunteer marker -------------------------------------- */
  const volIcon = L.divIcon({
    className: '',
    html: `<div class="lf-vol-dot">V</div><span class="lf-vol-label">Volunteer<br>Feres</span>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  });
  L.marker([VOLUNTEER_START.lat, VOLUNTEER_START.lon], { icon: volIcon })
   .bindTooltip(
     '<strong>Volunteer — Feres staging</strong><br>' +
     '<small>E90 highway · outside fire zone</small>',
     { className: 'lf-vol-tip' }
   )
   .addTo(leafletMap);

  /* Resident markers -------------------------------------- */
  residentMarkers = RESIDENTS_DATA.map(res => {
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
      .on('mouseover', e => showTooltip(
          e.originalEvent,
          res.name,
          `${res.type.charAt(0).toUpperCase() + res.type.slice(1)} · Floor ${res.floor}`,
          res.note
        ))
      .on('mousemove',  e => moveTooltip(e.originalEvent))
      .on('mouseout',   hideTooltip)
      .addTo(leafletMap);

    return { id: res.id, marker, color, initial };
  });

  /* Data source notice (bottom-left control) -------------- */
  const notice = L.control({ position: 'bottomleft' });
  notice.onAdd = () => {
    const d = L.DomUtil.create('div', 'lf-data-notice');
    d.innerHTML =
      'Villages: OpenStreetMap &nbsp;|&nbsp; ' +
      'Fire boundary: <a href="https://mapping.emergency.copernicus.eu/activations/EMSN166/" target="_blank">' +
      'Copernicus EMS EMSN166</a> &nbsp;|&nbsp; 92,321 ha · 112 burn patches';
    return d;
  };
  notice.addTo(leafletMap);

  /* Fit map to show the full fire zone on load */
  leafletMap.fitBounds([[40.83, 25.85], [41.30, 26.35]], { padding: [30, 30] });
}

/* ============================================================
   CALCULATE & ANIMATE ROUTE
   ============================================================ */
function calculateAndAnimateRoute() {
  if (routingAnimating) return;
  routingAnimating = true;

  if (routePolyline) { leafletMap.removeLayer(routePolyline); routePolyline = null; }

  const route = computeRoute(RESIDENTS_DATA, VOLUNTEER_START);

  /* Build progressive polyline starting from volunteer */
  const lineCoords = [[VOLUNTEER_START.lat, VOLUNTEER_START.lon]];
  routePolyline = L.polyline(lineCoords, {
    color:     '#2a60df',
    weight:     3,
    lineJoin:  'round',
    opacity:    0.85,
  }).addTo(leafletMap);

  const listEl = document.getElementById('priority-list');
  listEl.innerHTML = '';

  const STEP = 700; // ms per stop

  route.forEach((res, i) => {
    setTimeout(() => {
      /* Extend the route line to this stop */
      lineCoords.push([res.lat, res.lon]);
      routePolyline.setLatLngs([...lineCoords]);

      /* Update the resident dot to show visit order */
      const dot = document.getElementById(`dot-${res.id}`);
      if (dot) {
        dot.textContent = i + 1;
        dot.style.background  = '#2a60df';
        dot.style.borderColor = 'white';
        dot.classList.add('dot-visited');
      }

      /* Add priority list item */
      const prevPos  = i === 0 ? VOLUNTEER_START : { lat: route[i-1].lat, lon: route[i-1].lon };
      const distKm   = (geoDistance(prevPos.lat, prevPos.lon, res.lat, res.lon) / 1000).toFixed(1);
      const priority = score(res, prevPos).toFixed(0);
      const color    = RESIDENT_COLORS[res.type];

      const item = document.createElement('div');
      item.className = 'priority-item';
      item.style.borderLeftColor = color;
      item.innerHTML = `
        <span class="pi-rank">${i + 1}</span>
        <span class="pi-dot" style="background:${color}"></span>
        <div class="pi-info">
          <div class="pi-name">${res.name}</div>
          <div class="pi-detail">
            ${res.type.charAt(0).toUpperCase() + res.type.slice(1)}
            &nbsp;·&nbsp; Fl.${res.floor}
            &nbsp;·&nbsp; ${distKm} km
          </div>
        </div>`;
      listEl.appendChild(item);
      requestAnimationFrame(() => item.classList.add('visible'));

    }, i * STEP);
  });

  setTimeout(() => { routingAnimating = false; }, route.length * STEP + 400);
}

/* ============================================================
   RESET
   ============================================================ */
function resetRoute() {
  routingAnimating = false;
  if (routePolyline) { leafletMap.removeLayer(routePolyline); routePolyline = null; }

  /* Restore original resident dot labels */
  residentMarkers.forEach(({ id, color, initial }) => {
    const dot = document.getElementById(`dot-${id}`);
    if (dot) {
      dot.textContent = initial;
      dot.style.background  = color;
      dot.style.borderColor = 'white';
      dot.classList.remove('dot-visited');
    }
  });

  const listEl = document.getElementById('priority-list');
  listEl.innerHTML =
    '<p class="priority-empty">Press "Calculate Route" to see the optimized visit order.</p>';
}

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    initMap();
    document.getElementById('btn-route')?.addEventListener('click', calculateAndAnimateRoute);
    document.getElementById('btn-reset')?.addEventListener('click', resetRoute);
  });
});
