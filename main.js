/* ============================================================
   DATA
   ============================================================ */
const DISASTERS = [
  { date: new Date(2020, 8, 17),  year: 2020, event: "Medicane Ianos",    type: "Storm",      deaths: 3,  impact: 2, region: "Ionian Islands & Thessaly",   desc: "40 boats sunk in Cephalonia. Extreme flooding in Karditsa. Extensive infrastructure damage across the Ionian coast." },
  { date: new Date(2020, 9, 30),  year: 2020, event: "Samos Earthquake",  type: "Earthquake", deaths: 2,  impact: 2, region: "Samos, East Aegean",           desc: "Magnitude 7.0. Tsunami warnings issued. Heavy damage to neo-classical buildings. Aftershocks felt across the Aegean." },
  { date: new Date(2021, 7, 3),   year: 2021, event: "Summer Wildfires",  type: "Wildfire",   deaths: 3,  impact: 3, region: "Evia / Attica / Peloponnese",  desc: "~125,000 hectares burned. North Evia forests decimated. Thousands evacuated by sea. Fire services overwhelmed." },
  { date: new Date(2023, 7, 19),  year: 2023, event: "Evros Wildfire",    type: "Wildfire",   deaths: 28, impact: 5, region: "NE Greece",                    desc: "The largest single wildfire ever recorded in the EU. 28 deaths. Entire villages destroyed. EU emergency assistance mobilised." },
  { date: new Date(2023, 8, 4),   year: 2023, event: "Storm Daniel",      type: "Storm",      deaths: 17, impact: 4, region: "Thessaly, Central Greece",     desc: "17 deaths. Highest rainfall ever recorded in Greek history. The agricultural 'breadbasket' of Greece was destroyed." },
  { date: new Date(2024, 5, 15),  year: 2024, event: "Heatwaves & Drought", type: "Heatwave", deaths: 0,  impact: 3, region: "Nationwide",                   desc: "Record-breaking temperatures in June–July. Prolonged water shortages. Mass crop failures. Heat mortality not in emergency records." },
  { date: new Date(2025, 7, 1),   year: 2025, event: "Summer Fire Season", type: "Wildfire",  deaths: 0,  impact: 3, region: "Athens (Attica)",              desc: "70% of remaining Attica forests devastated over a 25-year cumulative cycle. Soil degradation driving secondary flood risk." },
  { date: new Date(2026, 0, 15),  year: 2026, event: "Winter Storm",      type: "Storm",      deaths: 2,  impact: 3, region: "Athens (Attica)",              desc: "A month's worth of rain in hours. Streets became rivers in Glyfada and Astros. 112 emergency alerts issued." },
  { date: new Date(2026, 3, 1),   year: 2026, event: "April Floods",      type: "Flood",      deaths: 1,  impact: 2, region: "Nea Makri, East Attica",       desc: "Bridge collapse in Poros. 30 rescues from submerged vehicles. Saharan dust created compounding hazardous conditions." },
];

const TYPE_COLOR = {
  'Wildfire':   '#2a60df',
  'Storm':      '#1a3fa0',
  'Flood':      '#4b7ee8',
  'Earthquake': '#77b6ff',
  'Heatwave':   '#cae6ff',
};

/* ============================================================
   FULL-PAGE SCROLL SYSTEM
   ============================================================ */
const fpWrapper  = document.getElementById('fp-wrapper');
const slides     = [...document.querySelectorAll('.fp-slide')];
const dots       = [...document.querySelectorAll('.fp-dot')];
let   currentIdx = 0;

/* Update active dot and progress bar */
function setActiveDot(idx) {
  currentIdx = idx;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  const pct = slides.length > 1 ? (idx / (slides.length - 1)) * 100 : 0;
  document.getElementById('scroll-progress').style.width = pct + '%';
}

/* Scroll wrapper to a slide by index */
function goToSlide(idx) {
  idx = Math.max(0, Math.min(idx, slides.length - 1));
  slides[idx].scrollIntoView({ behavior: 'smooth' });
  setActiveDot(idx);
}

/* Dot click */
dots.forEach(dot => {
  dot.addEventListener('click', () => goToSlide(+dot.dataset.slide));
});

/* Hero "Scroll to explore" button */
document.querySelector('.scroll-cue')?.addEventListener('click', () => goToSlide(1));

/* Keyboard navigation */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goToSlide(currentIdx + 1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goToSlide(currentIdx - 1); }
});

/* ============================================================
   INTERSECTION OBSERVER — triggers stagger reveals + counters
   Scoped to #fp-wrapper so it reacts to snap scrolling
   ============================================================ */
const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const slide = entry.target;
    slide.classList.add('in-view');

    // Update active dot
    const idx = slides.indexOf(slide);
    if (idx !== -1) setActiveDot(idx);

    // Counter animation for stat slides
    const numEl = slide.querySelector('.stat-number[data-count]');
    if (numEl && !numEl.dataset.counted) {
      numEl.dataset.counted = '1';
      const target = +numEl.dataset.count;
      const suffix = numEl.dataset.suffix || '';
      animateCounter(numEl, target, suffix, 1100);
    }

    // Draw charts when their slide enters view (once)
    if (slide.id === 'section-timeline' && !slide.dataset.charted) {
      slide.dataset.charted = '1';
      buildLegend('timeline-legend');
      drawTimeline();
    }
    if (slide.dataset.slide === '5' && !slide.dataset.charted) {
      slide.dataset.charted = '1';
      drawBarChart();
    }
    if (slide.id === 'section-routing' && !slide.dataset.charted) {
      slide.dataset.charted = '1';
      drawNeighborhoodMap();
    }
  });
}, {
  root: fpWrapper,
  threshold: 0.55,
});

slides.forEach(s => slideObserver.observe(s));

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, suffix, duration) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = Math.round(ease * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   TOOLTIP
   ============================================================ */
const tooltip = document.getElementById('tooltip');

function showTooltip(event, d) {
  const deathHtml = d.deaths > 0
    ? `<div class="tt-deaths">${d.deaths} death${d.deaths > 1 ? 's' : ''} recorded</div>`
    : `<div class="tt-deaths no-count">No direct fatality count in emergency records</div>`;

  tooltip.innerHTML = `
    <div class="tt-title">${d.event}</div>
    <div class="tt-meta">${d.year} &mdash; ${d.region}</div>
    <div class="tt-desc">${d.desc}</div>
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
   LEGEND
   ============================================================ */
function buildLegend(id) {
  const wrap = document.getElementById(id);
  if (!wrap || wrap.children.length > 0) return;

  Object.entries(TYPE_COLOR).forEach(([type, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-dot" style="background:${color}"></div><span>${type}</span>`;
    wrap.appendChild(item);
  });

  const note = document.createElement('div');
  note.className = 'legend-item';
  note.innerHTML = `
    <svg width="26" height="12" style="margin-right:2px">
      <circle cx="5"  cy="6" r="3.5" fill="none" stroke="#6b8fc7" stroke-width="1" stroke-dasharray="2,2"/>
      <circle cx="19" cy="6" r="5.5" fill="none" stroke="#6b8fc7" stroke-width="1"/>
    </svg>
    <span style="color:#6b8fc7">size = death toll</span>
  `;
  wrap.appendChild(note);
}

/* ============================================================
   TIMELINE CHART
   ============================================================ */
let tlGroup = null, tlScaleX = null, tlScaleY = null, tlLineFn = null;

function r(d)    { return d.deaths === 0 ? 9 : Math.sqrt(d.deaths) * 5 + 7; }
function getY(d) { return d.deaths === 0 ? tlScaleY(2) : tlScaleY(d.deaths); }

function drawTimeline() {
  const wrapper  = document.querySelector('#timeline-chart').parentElement;
  const totalW   = Math.max(wrapper.clientWidth, 560);
  const totalH   = Math.max(wrapper.clientHeight, 160);
  const margin   = { top: 36, right: 52, bottom: 38, left: 52 };
  const W        = totalW - margin.left - margin.right;
  const H        = totalH - margin.top  - margin.bottom;

  const svg = d3.select('#timeline-chart')
    .attr('width', totalW).attr('height', totalH);
  svg.selectAll('*').remove();

  tlGroup  = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  tlScaleX = d3.scaleTime().domain([new Date(2019,10,1), new Date(2026,9,1)]).range([0, W]);
  tlScaleY = d3.scaleLinear().domain([0, 33]).range([H, 0]);
  tlLineFn = d3.line().x(d => tlScaleX(d.date)).y(d => getY(d)).curve(d3.curveCatmullRom.alpha(0.5));

  // Grid
  tlGroup.append('g').attr('class', 'grid')
    .call(d3.axisLeft(tlScaleY).ticks(4).tickSize(-W).tickFormat(''));

  // Year guide lines
  [2020,2021,2022,2023,2024,2025,2026].forEach(yr => {
    tlGroup.append('line')
      .attr('x1', tlScaleX(new Date(yr,0,1))).attr('x2', tlScaleX(new Date(yr,0,1)))
      .attr('y1', 0).attr('y2', H)
      .attr('stroke','rgba(42,96,223,0.07)').attr('stroke-width', 1);
  });

  // Trend line placeholder
  tlGroup.append('path').attr('class','trend-line')
    .attr('fill','none').attr('stroke','rgba(42,96,223,0.15)')
    .attr('stroke-width',1.5).attr('stroke-dasharray','4 4');

  // Axes
  tlGroup.append('g').attr('class','axis x-axis')
    .attr('transform',`translate(0,${H})`)
    .call(d3.axisBottom(tlScaleX).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat('%Y')));

  tlGroup.append('g').attr('class','axis y-axis')
    .call(d3.axisLeft(tlScaleY).ticks(4));

  tlGroup.append('text')
    .attr('transform','rotate(-90)').attr('x',-(H/2)).attr('y',-38)
    .attr('text-anchor','middle').attr('fill','#6b8fc7')
    .attr('font-size','10px').attr('font-family','Inter, sans-serif')
    .text('Deaths recorded');

  // Peak annotation
  tlGroup.append('text').attr('class','peak-label')
    .attr('font-size','9px').attr('font-family','Cinzel, serif')
    .attr('fill','#2a60df').attr('font-weight','700');

  renderTimelineCircles('all');
}

function renderTimelineCircles(filter) {
  if (!tlGroup) return;
  const data   = filter === 'all' ? DISASTERS : DISASTERS.filter(d => d.type === filter);
  const sorted = [...data].sort((a,b) => a.date - b.date);

  tlGroup.select('.trend-line').datum(sorted)
    .transition().duration(450).ease(d3.easeCubicOut).attr('d', tlLineFn);

  const evros = data.find(d => d.event === 'Evros Wildfire');
  const label = tlGroup.select('.peak-label');
  if (evros && (filter === 'all' || filter === 'Wildfire')) {
    label.attr('x', tlScaleX(evros.date) + r(evros) + 7).attr('y', getY(evros) + 4).text('2023 peak — 45 deaths');
  } else { label.text(''); }

  const evts = tlGroup.selectAll('.evt').data(data, d => d.event);

  evts.exit().transition().duration(280).ease(d3.easeCubicIn).attr('opacity',0).remove();

  const enter = evts.enter().append('g').attr('class','evt')
    .attr('transform', d => `translate(${tlScaleX(d.date)},${getY(d)})`)
    .attr('opacity', 0).style('cursor','pointer');

  enter.append('circle').attr('class','evt-circle').attr('r',0)
    .attr('fill', d => TYPE_COLOR[d.type])
    .attr('fill-opacity', d => d.deaths === 0 ? 0.35 : 0.85)
    .attr('stroke', d => TYPE_COLOR[d.type]).attr('stroke-width',1.5)
    .attr('stroke-dasharray', d => d.deaths === 0 ? '3 2' : 'none');

  enter.append('circle')
    .attr('r', d => Math.max(3, r(d)*0.3))
    .attr('fill','white').attr('fill-opacity',0.2).attr('pointer-events','none');

  enter.append('text').attr('class','evt-label').attr('text-anchor','middle')
    .attr('font-size','8.5px').attr('font-family','Inter, sans-serif')
    .attr('fill','#2a3a5c').attr('font-weight','500')
    .text(d => d.event.length > 15 ? d.event.slice(0,14)+'…' : d.event);

  const merged = enter.merge(evts);

  merged.transition().duration(500).ease(d3.easeCubicOut).delay((_,i) => i*40)
    .attr('opacity',1).attr('transform', d => `translate(${tlScaleX(d.date)},${getY(d)})`);

  merged.select('.evt-circle').transition().duration(500).ease(d3.easeCubicOut).delay((_,i) => i*40)
    .attr('r', d => r(d));

  merged.select('.evt-label').attr('y', d => -(r(d)+6));

  merged
    .on('mouseover', function(event, d) {
      d3.select(this).raise();
      d3.select(this).select('.evt-circle')
        .transition().duration(130).attr('r', r(d)*1.22).attr('fill-opacity',1);
      showTooltip(event, d);
    })
    .on('mousemove', (event) => positionTooltip(event))
    .on('mouseout', function(event, d) {
      d3.select(this).select('.evt-circle')
        .transition().duration(130).attr('r', r(d)).attr('fill-opacity', d.deaths===0 ? 0.35 : 0.85);
      hideTooltip();
    });
}

/* Filter tabs */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTimelineCircles(btn.dataset.filter);
  });
});

/* ============================================================
   BAR CHART
   ============================================================ */
function drawBarChart() {
  const typeTotals = d3.rollup(DISASTERS, v => d3.sum(v, d => d.deaths), d => d.type);
  const barData    = Array.from(typeTotals, ([type, deaths]) => ({ type, deaths }))
                         .sort((a,b) => b.deaths - a.deaths);

  const wrapper  = document.querySelector('#bar-chart').parentElement;
  const totalW   = Math.max(wrapper.clientWidth, 440);
  const margin   = { top: 10, right: 80, bottom: 30, left: 112 };
  const W        = totalW - margin.left - margin.right;
  // Scale bar height to fill available wrapper space; clamp between 32–64px
  const availH   = wrapper.clientHeight > 40 ? wrapper.clientHeight : window.innerHeight * 0.55;
  const bandH    = Math.min(64, Math.max(32, Math.floor((availH - margin.top - margin.bottom - 30) / barData.length) - 12));
  const bandGap  = Math.round(bandH * 0.22);
  const totalH   = barData.length * (bandH + bandGap) + margin.top + margin.bottom;

  const svg = d3.select('#bar-chart').attr('width', totalW).attr('height', totalH);
  const g   = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const plotH = barData.length * (bandH + bandGap);

  const xScale = d3.scaleLinear().domain([0, d3.max(barData, d => d.deaths)*1.18]).range([0, W]);
  const yScale = d3.scaleBand().domain(barData.map(d => d.type)).range([0, plotH]).paddingInner(0.28);

  g.append('g').attr('class','grid').attr('transform',`translate(0,${plotH})`)
    .call(d3.axisBottom(xScale).ticks(4).tickSize(-plotH).tickFormat(''));

  const bars = g.selectAll('.bar-grp').data(barData).join('g')
    .attr('class','bar-grp').attr('transform', d => `translate(0,${yScale(d.type)})`);

  bars.append('rect').attr('x',0).attr('width',W).attr('height',yScale.bandwidth())
    .attr('fill','rgba(42,96,223,0.04)');

  bars.append('rect').attr('class','bar-fill').attr('x',0).attr('width',0)
    .attr('height',yScale.bandwidth()).attr('fill', d => TYPE_COLOR[d.type]).attr('rx',2)
    .style('cursor','pointer')
    .on('mouseover', function(event,d) {
      d3.select(this).attr('fill-opacity',0.72);
      showTooltip(event,{event:d.type+' events',year:'2020–2026',region:'Greece',
        desc:`Combined recorded fatalities from ${d.type.toLowerCase()} events across the period.`,deaths:d.deaths});
    })
    .on('mousemove', (event) => positionTooltip(event))
    .on('mouseout',  function() { d3.select(this).attr('fill-opacity',1); hideTooltip(); })
    .transition().duration(850).delay((_,i) => i*120).attr('width', d => xScale(d.deaths));

  bars.append('text').attr('x',-8).attr('y', yScale.bandwidth()/2+5)
    .attr('text-anchor','end').attr('font-size','13px').attr('font-family','Cinzel, serif')
    .attr('fill', d => TYPE_COLOR[d.type]).attr('font-weight','600').text(d => d.type);

  bars.append('text').attr('class','bar-label').attr('x',6).attr('y', yScale.bandwidth()/2+5)
    .attr('font-size','12px').attr('font-family','Inter, sans-serif')
    .attr('fill','#2a3a5c').attr('font-weight','500')
    .text(d => d.deaths > 0 ? `${d.deaths} deaths` : 'see note *')
    .transition().duration(850).delay((_,i) => i*120).attr('x', d => xScale(d.deaths)+7);

  g.append('g').attr('class','axis x-axis').attr('transform',`translate(0,${plotH})`)
    .call(d3.axisBottom(xScale).ticks(4).tickFormat(d => d > 0 ? d : ''));
}

/* ============================================================
   VOLUNTEER ROUTING SYSTEM
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

/* ------ Scoring: high score = visit first ------ */
function getResidentScore(resident, fromPos, mapW, mapH) {
  const dx   = (resident.x - fromPos.x) * mapW;
  const dy   = (resident.y - fromPos.y) * mapH;
  const dist = Math.hypot(dx, dy) || 0.1;
  const typeWeight  = { elderly: 1.2, disabled: 1.5, both: 2.2 };
  const floorPenalty = 1 + (resident.floor || 0) * 0.4;
  return (typeWeight[resident.type] * 100) / (dist * floorPenalty);
}

/* ------ Greedy nearest-highest-priority algorithm ------ */
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

/* ------ Draw the neighbourhood map (once) ------ */
function drawNeighborhoodMap() {
  const container = document.getElementById('routing-map');
  if (!container) return;
  const panel = container.parentElement;
  const W = panel.clientWidth  || 500;
  const H = panel.clientHeight || 380;

  const svg = d3.select('#routing-map').attr('width', W).attr('height', H);
  svg.selectAll('*').remove();

  /* Street grid pattern */
  const defs = svg.append('defs');
  const gridSize = Math.round(Math.min(W, H) / 8);
  defs.append('pattern')
    .attr('id', 'map-grid').attr('width', gridSize).attr('height', gridSize)
    .attr('patternUnits', 'userSpaceOnUse')
    .append('rect').attr('width', gridSize).attr('height', gridSize)
    .attr('fill', 'none').attr('stroke', 'rgba(42,96,223,0.09)').attr('stroke-width', 1);

  svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'url(#map-grid)');

  /* City blocks (rough rectangles for visual context) */
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

  /* Route path — drawn by animation */
  svg.append('path').attr('id','route-path')
    .attr('fill','none').attr('stroke','#2a60df').attr('stroke-width',2.5)
    .attr('stroke-linecap','round').attr('opacity',0);

  /* Volunteer marker */
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

  /* Resident markers */
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

    /* Floor badge */
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
        desc:  '',
        deaths: 0,
      }))
      .on('mousemove', positionTooltip)
      .on('mouseout',  hideTooltip);
  });

  /* Visit-order rings (revealed during animation) */
  RESIDENTS_DATA.forEach(res => {
    svg.append('circle').attr('class',`vo-ring vo-${res.id}`)
      .attr('cx',res.x*W).attr('cy',res.y*H).attr('r',17)
      .attr('fill','none').attr('stroke','#2a60df').attr('stroke-width',2).attr('opacity',0);
    svg.append('text').attr('class',`vo-num vn-${res.id}`)
      .attr('x',res.x*W - 20).attr('y',res.y*H - 18)
      .attr('font-size','10px').attr('font-family','Cinzel,serif')
      .attr('fill','#2a60df').attr('font-weight','700').attr('opacity',0);
  });

  /* Attach button listeners (safe to call each time map draws) */
  document.getElementById('btn-route')?.addEventListener('click', calculateAndAnimateRoute);
  document.getElementById('btn-reset')?.addEventListener('click', resetRoute);
}

/* ------ Animate the route ------ */
function calculateAndAnimateRoute() {
  if (routingAnimating) return;
  routingAnimating = true;

  const mapEl = document.getElementById('routing-map');
  if (!mapEl) return;
  const W = +mapEl.getAttribute('width') || 500;
  const H = +mapEl.getAttribute('height') || 380;

  const route = computeRoute(RESIDENTS_DATA, VOLUNTEER_START, W, H);

  /* Build path */
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

  /* Build priority list progressively */
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

      /* Reveal numbered ring on map */
      d3.select(`.vo-${res.id}`).transition().duration(200).attr('opacity', 1);
      d3.select(`.vn-${res.id}`).text(i + 1).transition().duration(200).attr('opacity', 1);
    }, i * 600);
  });

  setTimeout(() => { routingAnimating = false; }, route.length * 600 + 400);
}

/* ------ Reset map to initial state ------ */
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
   RESPONSIVE REDRAW
   ============================================================ */
let _rt;
window.addEventListener('resize', () => {
  clearTimeout(_rt);
  _rt = setTimeout(() => {
    const tSlide = document.getElementById('section-timeline');
    const bSlide = document.querySelector('[data-slide="5"]');
    const activeFilter = document.querySelector('.tab.active')?.dataset.filter || 'all';

    if (tSlide?.dataset.charted) {
      d3.select('#timeline-chart').selectAll('*').remove();
      tlGroup = null;
      drawTimeline();
      renderTimelineCircles(activeFilter);
    }
    if (bSlide?.dataset.charted) {
      d3.select('#bar-chart').selectAll('*').remove();
      drawBarChart();
    }
  }, 280);
}, { passive: true });
