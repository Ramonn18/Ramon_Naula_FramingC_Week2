/* ============================================================
   VOLUNTEER ROUTING SYSTEM — solution.js
   ============================================================ */
const RESIDENT_COLORS = {
  elderly:  '#e8aa30',
  disabled: '#77b6ff',
  both:     '#a78bfa',
};

const RESIDENTS_DATA = [
  { id: 'r1', name: 'Mr. Papadopoulos',  type: 'elderly',  floor: 3, x: 0.18, y: 0.22, note: 'Age 82, mobility aid' },
  { id: 'r2', name: 'Ms. Stavros',       type: 'disabled', floor: 0, x: 0.62, y: 0.14, note: 'Wheelchair user' },
  { id: 'r3', name: 'Mrs. Karagianni',   type: 'both',     floor: 4, x: 0.78, y: 0.36, note: 'Age 79, mobility impaired' },
  { id: 'r4', name: 'Mr. Nikolaou',      type: 'elderly',  floor: 1, x: 0.26, y: 0.58, note: 'Age 74, hearing impaired' },
  { id: 'r5', name: 'Ms. Demetriou',     type: 'disabled', floor: 2, x: 0.72, y: 0.64, note: 'Visual impairment' },
  { id: 'r6', name: 'Mrs. Alexiou',      type: 'both',     floor: 5, x: 0.44, y: 0.80, note: 'Age 85, confined to bed' },
  { id: 'r7', name: 'Mr. Christodoulou', type: 'elderly',  floor: 0, x: 0.84, y: 0.82, note: 'Age 71, lives alone' },
];

const VOLUNTEER_START = { x: 0.50, y: 0.50 };
let routingAnimating = false;

/* ============================================================
   TOOLTIP
   ============================================================ */
const tooltip = document.getElementById('tooltip');

function showTooltip(event, d) {
  const deathHtml = d.deaths == null
    ? ''
    : d.deaths > 0
      ? `<div class="tt-deaths">${d.deaths} death${d.deaths > 1 ? 's' : ''} recorded</div>`
      : `<div class="tt-deaths no-count">No direct fatality count in emergency records</div>`;

  const descHtml = d.desc ? `<div class="tt-desc">${d.desc}</div>` : '';

  tooltip.innerHTML = `
    <div class="tt-title">${d.event}</div>
    <div class="tt-meta">${d.year} &mdash; ${d.region}</div>
    ${descHtml}
    ${deathHtml}
  `;
  tooltip.classList.add('visible');
  positionTooltip(event);
}

function positionTooltip(event) {
  const pad = 16, tipW = 280;
  const tipH = tooltip.offsetHeight || 120;
  let x = event.clientX + pad;
  let y = event.clientY - tipH / 2;
  if (x + tipW > window.innerWidth)  x = event.clientX - tipW - pad;
  if (y < 8)                          y = 8;
  if (y + tipH > window.innerHeight) y = window.innerHeight - tipH - 8;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

function hideTooltip() { tooltip.classList.remove('visible'); }

/* ============================================================
   SCORING & ROUTING ALGORITHM
   ============================================================ */
function getResidentScore(resident, fromPos, mapW, mapH) {
  const dx   = (resident.x - fromPos.x) * mapW;
  const dy   = (resident.y - fromPos.y) * mapH;
  const dist = Math.hypot(dx, dy) || 0.1;
  const typeWeight  = { elderly: 1.2, disabled: 1.5, both: 2.2 };
  const floorPenalty = 1 + (resident.floor || 0) * 0.4;
  return (typeWeight[resident.type] * 100) / (dist * floorPenalty);
}

function computeRoute(residents, volunteer, mapW, mapH) {
  const route = [];
  const remaining = [...residents];
  let current = { x: volunteer.x, y: volunteer.y };
  while (remaining.length > 0) {
    const scored = remaining
      .map(r => ({ ...r, score: getResidentScore(r, current, mapW, mapH) }))
      .sort((a, b) => b.score - a.score);
    route.push(scored[0]);
    remaining.splice(remaining.findIndex(r => r.id === scored[0].id), 1);
    current = { x: scored[0].x, y: scored[0].y };
  }
  return route;
}

/* ============================================================
   DRAW MAP
   ============================================================ */
function drawNeighborhoodMap() {
  const container = document.getElementById('routing-map');
  if (!container) return;
  const panel = container.parentElement;
  const W = panel.clientWidth  || 500;
  const H = panel.clientHeight || 380;

  const svg = d3.select('#routing-map').attr('width', W).attr('height', H);
  svg.selectAll('*').remove();

  const defs = svg.append('defs');
  const gridSize = Math.round(Math.min(W, H) / 8);
  defs.append('pattern')
    .attr('id', 'map-grid').attr('width', gridSize).attr('height', gridSize)
    .attr('patternUnits', 'userSpaceOnUse')
    .append('rect').attr('width', gridSize).attr('height', gridSize)
    .attr('fill', 'none').attr('stroke', 'rgba(42,96,223,0.09)').attr('stroke-width', 1);

  svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'url(#map-grid)');

  [
    [0.04,0.04,0.17,0.17],[0.26,0.04,0.20,0.13],[0.58,0.04,0.15,0.20],
    [0.78,0.04,0.18,0.16],[0.04,0.30,0.13,0.22],[0.77,0.28,0.19,0.17],
    [0.04,0.64,0.13,0.20],[0.23,0.65,0.20,0.17],[0.59,0.73,0.15,0.18],
    [0.79,0.70,0.17,0.24],
  ].forEach(([bx,by,bw,bh]) => {
    svg.append('rect')
      .attr('x', bx*W).attr('y', by*H).attr('width', bw*W).attr('height', bh*H)
      .attr('fill','rgba(42,96,223,0.045)').attr('stroke','rgba(42,96,223,0.1)')
      .attr('stroke-width',1).attr('rx',2);
  });

  svg.append('path').attr('id','route-path')
    .attr('fill','none').attr('stroke','#2a60df').attr('stroke-width',2.5)
    .attr('stroke-linecap','round').attr('opacity',0);

  const vg = svg.append('g').attr('class','volunteer-marker')
    .attr('transform',`translate(${VOLUNTEER_START.x*W},${VOLUNTEER_START.y*H})`);
  vg.append('circle').attr('r',16).attr('fill','rgba(34,197,94,0.12)');
  vg.append('circle').attr('r', 9).attr('fill','#22c55e');
  vg.append('text').attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('font-size','9px').attr('font-family','Inter,sans-serif')
    .attr('fill','#fff').attr('font-weight','700').text('V');
  vg.append('text').attr('y',-22).attr('text-anchor','middle')
    .attr('font-size','9px').attr('font-family','Cinzel,serif')
    .attr('fill','#166534').attr('font-weight','600').text('Volunteer');

  RESIDENTS_DATA.forEach(res => {
    const color = RESIDENT_COLORS[res.type];
    const initial = res.type === 'elderly' ? 'E' : res.type === 'disabled' ? 'D' : 'B';
    const rg = svg.append('g').attr('class',`resident-marker res-${res.id}`)
      .attr('transform',`translate(${res.x*W},${res.y*H})`)
      .style('cursor','pointer');

    rg.append('circle').attr('r',17).attr('fill',color).attr('fill-opacity',0.1);
    rg.append('circle').attr('r', 9).attr('fill',color).attr('fill-opacity',0.92)
      .attr('stroke','white').attr('stroke-width',1.5);
    rg.append('text').attr('text-anchor','middle').attr('dominant-baseline','central')
      .attr('font-size','7.5px').attr('font-family','Inter,sans-serif')
      .attr('fill','#fff').attr('font-weight','700').text(initial);

    if (res.floor > 0) {
      rg.append('rect').attr('x',5).attr('y',-21).attr('width',19).attr('height',11)
        .attr('fill',color).attr('rx',2);
      rg.append('text').attr('x',14.5).attr('y',-13).attr('text-anchor','middle')
        .attr('font-size','7px').attr('font-family','Inter,sans-serif')
        .attr('fill','white').attr('font-weight','700').text(`F${res.floor}`);
    }

    rg.on('mouseover', (event) => showTooltip(event, {
        event: res.name,
        year:  res.type.charAt(0).toUpperCase() + res.type.slice(1),
        region:`Floor ${res.floor} · ${res.note}`,
        deaths: null,
      }))
      .on('mousemove', positionTooltip)
      .on('mouseout',  hideTooltip);
  });

  RESIDENTS_DATA.forEach(res => {
    svg.append('circle').attr('class',`vo-ring vo-${res.id}`)
      .attr('cx',res.x*W).attr('cy',res.y*H).attr('r',17)
      .attr('fill','none').attr('stroke','#2a60df').attr('stroke-width',2).attr('opacity',0);
    svg.append('text').attr('class',`vo-num vn-${res.id}`)
      .attr('x',res.x*W - 20).attr('y',res.y*H - 18)
      .attr('font-size','10px').attr('font-family','Cinzel,serif')
      .attr('fill','#2a60df').attr('font-weight','700').attr('opacity',0);
  });
}

/* ============================================================
   ANIMATE ROUTE
   ============================================================ */
function calculateAndAnimateRoute() {
  if (routingAnimating) return;
  routingAnimating = true;

  const mapEl = document.getElementById('routing-map');
  if (!mapEl) return;
  const W = +mapEl.getAttribute('width') || 500;
  const H = +mapEl.getAttribute('height') || 380;

  const route = computeRoute(RESIDENTS_DATA, VOLUNTEER_START, W, H);

  const pts = [
    { x: VOLUNTEER_START.x * W, y: VOLUNTEER_START.y * H },
    ...route.map(r => ({ x: r.x * W, y: r.y * H })),
  ];
  const lineFn  = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(0.5));
  const pathEl  = d3.select('#route-path').attr('d', lineFn(pts)).attr('opacity', 1);
  const totalLen = pathEl.node().getTotalLength();

  pathEl.attr('stroke-dasharray', `${totalLen} ${totalLen}`)
    .attr('stroke-dashoffset', totalLen)
    .transition().duration(route.length * 600).ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0);

  const listEl = document.getElementById('priority-list');
  listEl.innerHTML = '';

  route.forEach((res, i) => {
    const prevPos = i === 0 ? VOLUNTEER_START : route[i - 1];
    const score   = getResidentScore(res, prevPos, W, H).toFixed(1);
    const color   = RESIDENT_COLORS[res.type];

    setTimeout(() => {
      const item = document.createElement('div');
      item.className = 'priority-item';
      item.style.borderLeftColor = color;
      item.innerHTML = `
        <span class="pi-rank">${i + 1}</span>
        <span class="pi-dot" style="background:${color}"></span>
        <div class="pi-info">
          <div class="pi-name">${res.name}</div>
          <div class="pi-detail">${res.type.charAt(0).toUpperCase()+res.type.slice(1)} · Fl.${res.floor} · priority ${score}</div>
        </div>`;
      listEl.appendChild(item);
      requestAnimationFrame(() => item.classList.add('visible'));

      d3.select(`.vo-${res.id}`).transition().duration(200).attr('opacity', 1);
      d3.select(`.vn-${res.id}`).text(i + 1).transition().duration(200).attr('opacity', 1);
    }, i * 600);
  });

  setTimeout(() => { routingAnimating = false; }, route.length * 600 + 400);
}

function resetRoute() {
  routingAnimating = false;
  d3.select('#route-path').attr('opacity', 0).attr('stroke-dashoffset', 0);
  RESIDENTS_DATA.forEach(res => {
    d3.select(`.vo-${res.id}`).attr('opacity', 0);
    d3.select(`.vn-${res.id}`).attr('opacity', 0);
  });
  const listEl = document.getElementById('priority-list');
  listEl.innerHTML = '<p class="priority-empty">Press "Calculate Route" to see the optimized visit order.</p>';
}

/* ============================================================
   INIT & RESIZE
   ============================================================ */
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    drawNeighborhoodMap();
    document.getElementById('btn-route')?.addEventListener('click', calculateAndAnimateRoute);
    document.getElementById('btn-reset')?.addEventListener('click', resetRoute);
  });
});

let _rt;
window.addEventListener('resize', () => {
  clearTimeout(_rt);
  _rt = setTimeout(() => {
    d3.select('#routing-map').selectAll('*').remove();
    drawNeighborhoodMap();
    resetRoute();
  }, 280);
}, { passive: true });
