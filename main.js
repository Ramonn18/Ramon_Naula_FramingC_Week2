/* ============================================================
   DATA — sourced from "Sociological Resilience: Erosion of
   Social Capital", Natural Disaster Report: Greece 2020–2026
   ============================================================ */
const DISASTERS = [
  {
    date: new Date(2020, 8, 17),   // Sep 2020
    year: 2020, event: "Medicane Ianos",
    type: "Storm", deaths: 3, impact: 2,
    region: "Ionian Islands & Thessaly",
    desc: "40 boats sunk in Cephalonia. Extreme flooding in Karditsa. Extensive infrastructure damage across the Ionian coast."
  },
  {
    date: new Date(2020, 9, 30),   // Oct 2020
    year: 2020, event: "Samos Earthquake",
    type: "Earthquake", deaths: 2, impact: 2,
    region: "Samos, East Aegean",
    desc: "Magnitude 7.0. Tsunami warnings issued. Heavy damage to neo-classical buildings. Aftershocks felt across the Aegean."
  },
  {
    date: new Date(2021, 7, 3),    // Aug 2021
    year: 2021, event: "Summer Wildfires",
    type: "Wildfire", deaths: 3, impact: 3,
    region: "Evia / Attica / Peloponnese",
    desc: "~125,000 hectares burned. North Evia forests decimated. Thousands evacuated by sea. Fire services overwhelmed."
  },
  {
    date: new Date(2023, 7, 19),   // Aug 2023
    year: 2023, event: "Evros Wildfire",
    type: "Wildfire", deaths: 28, impact: 5,
    region: "NE Greece",
    desc: "The largest single wildfire ever recorded in the European Union. 28 deaths. Entire villages destroyed. EU emergency assistance mobilised."
  },
  {
    date: new Date(2023, 8, 4),    // Sep 2023
    year: 2023, event: "Storm Daniel",
    type: "Storm", deaths: 17, impact: 4,
    region: "Thessaly, Central Greece",
    desc: "17 deaths. Highest rainfall ever recorded in Greek history. The agricultural 'breadbasket' of Greece was destroyed."
  },
  {
    date: new Date(2024, 5, 15),   // Jun 2024
    year: 2024, event: "Heatwaves & Drought",
    type: "Heatwave", deaths: 0, impact: 3,
    region: "Nationwide",
    desc: "Record-breaking temperatures in June–July. Prolonged water shortages across the mainland. Mass crop failures. Heat mortality not captured in emergency records."
  },
  {
    date: new Date(2025, 7, 1),    // Aug 2025
    year: 2025, event: "Summer Fire Season",
    type: "Wildfire", deaths: 0, impact: 3,
    region: "Athens (Attica)",
    desc: "70% of remaining Attica forests devastated over a 25-year cumulative cycle. Soil degradation is now driving a secondary, compounding flood risk for Athens."
  },
  {
    date: new Date(2026, 0, 15),   // Jan 2026
    year: 2026, event: "Winter Storm",
    type: "Storm", deaths: 2, impact: 3,
    region: "Athens (Attica)",
    desc: "A month's worth of rain fell in hours. Streets became rivers in Glyfada and Astros. 112 emergency alerts issued."
  },
  {
    date: new Date(2026, 3, 1),    // Apr 2026
    year: 2026, event: "April Floods",
    type: "Flood", deaths: 1, impact: 2,
    region: "Nea Makri, East Attica",
    desc: "Bridge collapse in Poros. 30 rescues from submerged vehicles. Saharan dust created compounding hazardous conditions."
  },
];

/* ============================================================
   COLOR MAP
   ============================================================ */
const TYPE_COLOR = {
  'Wildfire':   '#2a60df',   // color 1 — dominant, most deaths
  'Storm':      '#1a3fa0',   // darker blue — second most impactful
  'Flood':      '#4b7ee8',   // mid-blue
  'Earthquake': '#77b6ff',   // color 2
  'Heatwave':   '#cae6ff',   // color 3 — light (deaths unquantified)
};

/* ============================================================
   TOOLTIP
   ============================================================ */
const tooltip = document.getElementById('tooltip');

function showTooltip(event, d) {
  const deathHtml = d.deaths > 0
    ? `<div class="tt-deaths">${d.deaths} death${d.deaths > 1 ? 's' : ''} recorded</div>`
    : `<div class="tt-deaths no-count">Direct fatality count not in emergency records</div>`;

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
  const pad   = 16;
  const tipW  = 286;
  const tipH  = tooltip.offsetHeight || 120;
  let x = event.clientX + pad;
  let y = event.clientY - tipH / 2;

  if (x + tipW > window.innerWidth)  x = event.clientX - tipW - pad;
  if (y < 8)                          y = 8;
  if (y + tipH > window.innerHeight) y = window.innerHeight - tipH - 8;

  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

/* ============================================================
   LEGEND
   ============================================================ */
function buildLegend(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;

  Object.entries(TYPE_COLOR).forEach(([type, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-dot" style="background:${color}"></div>
      <span>${type}</span>
    `;
    wrap.appendChild(item);
  });

  // Size key
  const sizeItem = document.createElement('div');
  sizeItem.className = 'legend-item';
  sizeItem.innerHTML = `
    <svg width="24" height="14" style="margin-right:2px">
      <circle cx="5"  cy="7" r="4"  fill="none" stroke="#8B7355" stroke-width="1" stroke-dasharray="3,2"/>
      <circle cx="18" cy="7" r="6.5" fill="none" stroke="#8B7355" stroke-width="1"/>
    </svg>
    <span style="color:#8B7355">Circle = death toll</span>
  `;
  wrap.appendChild(sizeItem);
}

/* ============================================================
   TIMELINE CHART
   ============================================================ */
function drawTimeline() {
  const wrapper  = document.querySelector('#timeline-chart').parentElement;
  const totalW   = Math.max(wrapper.clientWidth, 600);
  const margin   = { top: 50, right: 60, bottom: 48, left: 58 };
  const W        = totalW - margin.left - margin.right;
  const H        = 240 - margin.top - margin.bottom;

  const svg = d3.select('#timeline-chart')
    .attr('width',  totalW)
    .attr('height', H + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // ── Scales ──────────────────────────────────────────────
  const xScale = d3.scaleTime()
    .domain([new Date(2019, 10, 1), new Date(2026, 9, 1)])
    .range([0, W]);

  const yScale = d3.scaleLinear()
    .domain([0, 33])
    .range([H, 0]);

  // Radius: sqrt encoding so large values don't dominate visually
  const r = d => d.deaths === 0 ? 9 : Math.sqrt(d.deaths) * 5 + 7;

  // Y position: 0-death events placed at y=1.8 (just above baseline)
  const getY = d => d.deaths === 0 ? yScale(2) : yScale(d.deaths);

  // ── Horizontal grid ──────────────────────────────────────
  g.append('g')
    .attr('class', 'grid')
    .call(
      d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-W)
        .tickFormat('')
    );

  // ── Decorative top band (pottery-style border) ───────────
  g.append('rect')
    .attr('x', 0)
    .attr('y', -margin.top)
    .attr('width', W)
    .attr('height', margin.top * 0.55)
    .attr('fill', '#1A1209')
    .attr('opacity', 0.05);

  // ── Year guide lines ─────────────────────────────────────
  [2020, 2021, 2022, 2023, 2024, 2025, 2026].forEach(yr => {
    g.append('line')
      .attr('x1', xScale(new Date(yr, 0, 1)))
      .attr('x2', xScale(new Date(yr, 0, 1)))
      .attr('y1', 0)
      .attr('y2', H)
      .attr('stroke', 'rgba(42,96,223,0.08)')
      .attr('stroke-width', 1);
  });

  // ── Connecting dashed trend line ─────────────────────────
  const sorted = [...DISASTERS].sort((a, b) => a.date - b.date);
  const line   = d3.line()
    .x(d => xScale(d.date))
    .y(d => getY(d))
    .curve(d3.curveCatmullRom.alpha(0.5));

  g.append('path')
    .datum(sorted)
    .attr('fill',            'none')
    .attr('stroke',          'rgba(42,96,223,0.15)')
    .attr('stroke-width',    1.5)
    .attr('stroke-dasharray','4 4')
    .attr('d',               line);

  // ── Axes ─────────────────────────────────────────────────
  const xAxis = d3.axisBottom(xScale)
    .ticks(d3.timeYear.every(1))
    .tickFormat(d3.timeFormat('%Y'));

  g.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${H})`)
    .call(xAxis);

  g.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(yScale).ticks(5));

  // Y axis label
  g.append('text')
    .attr('transform',   'rotate(-90)')
    .attr('x',           -(H / 2))
    .attr('y',           -42)
    .attr('text-anchor', 'middle')
    .attr('fill',        '#6b8fc7')
    .attr('font-size',   '11px')
    .attr('font-family', 'Inter, sans-serif')
    .text('Deaths recorded');

  // ── Annotation: 2023 peak ────────────────────────────────
  const evros = DISASTERS.find(d => d.event === 'Evros Wildfire');
  if (evros) {
    const ax = xScale(evros.date) + r(evros) + 8;
    const ay = getY(evros);

    g.append('text')
      .attr('x',           ax)
      .attr('y',           ay + 4)
      .attr('font-size',   '9.5px')
      .attr('font-family', 'Cinzel, serif')
      .attr('fill',        '#2a60df')
      .attr('font-weight', '700')
      .text('2023 peak — 45 deaths total');
  }

  // ── Event circles ────────────────────────────────────────
  const events = g.selectAll('.evt')
    .data(DISASTERS)
    .join('g')
      .attr('class',     'evt')
      .attr('transform', d => `translate(${xScale(d.date)},${getY(d)})`)
      .style('cursor',   'pointer');

  // Main circle
  events.append('circle')
    .attr('class',        'evt-circle')
    .attr('r',            0)             // animate from 0
    .attr('fill',         d => TYPE_COLOR[d.type])
    .attr('fill-opacity', d => d.deaths === 0 ? 0.35 : 0.85)
    .attr('stroke',       d => TYPE_COLOR[d.type])
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', d => d.deaths === 0 ? '3 2' : 'none')
    // entrance animation
    .transition()
    .duration(700)
    .delay((d, i) => i * 80)
    .attr('r', d => r(d));

  // Inner highlight (shimmer)
  events.append('circle')
    .attr('r',              d => Math.max(3, r(d) * 0.32))
    .attr('fill',           'white')
    .attr('fill-opacity',   0.25)
    .attr('pointer-events', 'none');

  // Short label above circle
  events.append('text')
    .attr('y',            d => -(r(d) + 7))
    .attr('text-anchor',  'middle')
    .attr('font-size',    '9px')
    .attr('font-family',  'Inter, sans-serif')
    .attr('fill',         '#2a3a5c')
    .attr('font-weight',  '500')
    .attr('opacity',      0)
    .text(d => d.event.length > 15 ? d.event.slice(0, 14) + '…' : d.event)
    .transition()
    .duration(400)
    .delay((d, i) => i * 80 + 500)
    .attr('opacity', 1);

  // ── Interactions ─────────────────────────────────────────
  events
    .on('mouseover', function (event, d) {
      d3.select(this).raise();
      d3.select(this).select('.evt-circle')
        .transition().duration(140)
        .attr('r',            r(d) * 1.22)
        .attr('fill-opacity', 1);
      showTooltip(event, d);
    })
    .on('mousemove', (event) => positionTooltip(event))
    .on('mouseout',  function (event, d) {
      d3.select(this).select('.evt-circle')
        .transition().duration(140)
        .attr('r',            r(d))
        .attr('fill-opacity', d.deaths === 0 ? 0.35 : 0.85);
      hideTooltip();
    });
}

/* ============================================================
   BAR CHART — Deaths by disaster type
   ============================================================ */
function drawBarChart() {
  // Aggregate
  const typeTotals = d3.rollup(
    DISASTERS,
    v => d3.sum(v, d => d.deaths),
    d => d.type
  );

  const barData = Array.from(typeTotals, ([type, deaths]) => ({ type, deaths }))
    .sort((a, b) => b.deaths - a.deaths);

  const wrapper = document.querySelector('#bar-chart').parentElement;
  const totalW  = Math.max(wrapper.clientWidth, 480);
  const margin  = { top: 12, right: 90, bottom: 36, left: 118 };
  const W       = totalW - margin.left - margin.right;
  const bandH   = 34;
  const bandGap = 12;
  const totalH  = barData.length * (bandH + bandGap) + margin.top + margin.bottom;

  const svg = d3.select('#bar-chart')
    .attr('width',  totalW)
    .attr('height', totalH);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const plotH = barData.length * (bandH + bandGap);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d.deaths) * 1.18])
    .range([0, W]);

  const yScale = d3.scaleBand()
    .domain(barData.map(d => d.type))
    .range([0, plotH])
    .paddingInner(0.28);

  // ── Grid ─────────────────────────────────────────────────
  g.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${plotH})`)
    .call(
      d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(-plotH)
        .tickFormat('')
    );

  // ── Bar groups ───────────────────────────────────────────
  const bars = g.selectAll('.bar-grp')
    .data(barData)
    .join('g')
      .attr('class',     'bar-grp')
      .attr('transform', d => `translate(0,${yScale(d.type)})`);

  // Track (background)
  bars.append('rect')
    .attr('x',      0)
    .attr('width',  W)
    .attr('height', yScale.bandwidth())
    .attr('fill',   'rgba(42,96,223,0.04)');

  // Filled bar (animates in)
  bars.append('rect')
    .attr('class',   'bar-fill')
    .attr('x',       0)
    .attr('width',   0)
    .attr('height',  yScale.bandwidth())
    .attr('fill',    d => TYPE_COLOR[d.type])
    .attr('rx',      2)
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill-opacity', 0.72);
      showTooltip(event, {
        event:  d.type + ' events',
        year:   '2020–2026',
        region: 'Greece',
        desc:   `Combined recorded fatalities across all ${d.type.toLowerCase()} events in the study period.`,
        deaths: d.deaths,
      });
    })
    .on('mousemove', (event) => positionTooltip(event))
    .on('mouseout',  function () {
      d3.select(this).attr('fill-opacity', 1);
      hideTooltip();
    })
    .transition()
    .duration(900)
    .delay((d, i) => i * 130)
    .attr('width', d => xScale(d.deaths));

  // Type label (left)
  bars.append('text')
    .attr('x',           -10)
    .attr('y',           yScale.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('font-size',   '12px')
    .attr('font-family', 'Cinzel, serif')
    .attr('fill',        d => TYPE_COLOR[d.type])
    .attr('font-weight', '600')
    .text(d => d.type);

  // Value label (right of bar)
  bars.append('text')
    .attr('class',       'bar-label')
    .attr('x',           xScale(0) + 6)
    .attr('y',           yScale.bandwidth() / 2 + 4)
    .attr('font-size',   '11.5px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill',        '#2a3a5c')
    .attr('font-weight', '500')
    .text(d => d.deaths > 0 ? `${d.deaths} deaths` : 'see note *')
    .transition()
    .duration(900)
    .delay((d, i) => i * 130)
    .attr('x', d => xScale(d.deaths) + 8);

  // ── X axis ───────────────────────────────────────────────
  g.append('g')
    .attr('class',     'axis x-axis')
    .attr('transform', `translate(0,${plotH})`)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d > 0 ? d : ''));
}

/* ============================================================
   INIT
   ============================================================ */
buildLegend('timeline-legend');
drawTimeline();
drawBarChart();

// Redraw on resize (debounced)
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    d3.select('#timeline-chart').selectAll('*').remove();
    d3.select('#bar-chart').selectAll('*').remove();
    drawTimeline();
    drawBarChart();
  }, 260);
});
