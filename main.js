/* ============================================================
   DATA — sourced from "Sociological Resilience: Erosion of
   Social Capital", Natural Disaster Report: Greece 2020–2026
   ============================================================ */
const DISASTERS = [
  {
    date: new Date(2020, 8, 17),
    year: 2020, event: "Medicane Ianos",
    type: "Storm", deaths: 3, impact: 2,
    region: "Ionian Islands & Thessaly",
    desc: "40 boats sunk in Cephalonia. Extreme flooding in Karditsa. Extensive infrastructure damage across the Ionian coast."
  },
  {
    date: new Date(2020, 9, 30),
    year: 2020, event: "Samos Earthquake",
    type: "Earthquake", deaths: 2, impact: 2,
    region: "Samos, East Aegean",
    desc: "Magnitude 7.0. Tsunami warnings issued. Heavy damage to neo-classical buildings. Aftershocks felt across the Aegean."
  },
  {
    date: new Date(2021, 7, 3),
    year: 2021, event: "Summer Wildfires",
    type: "Wildfire", deaths: 3, impact: 3,
    region: "Evia / Attica / Peloponnese",
    desc: "~125,000 hectares burned. North Evia forests decimated. Thousands evacuated by sea. Fire services overwhelmed."
  },
  {
    date: new Date(2023, 7, 19),
    year: 2023, event: "Evros Wildfire",
    type: "Wildfire", deaths: 28, impact: 5,
    region: "NE Greece",
    desc: "The largest single wildfire ever recorded in the European Union. 28 deaths. Entire villages destroyed. EU emergency assistance mobilised."
  },
  {
    date: new Date(2023, 8, 4),
    year: 2023, event: "Storm Daniel",
    type: "Storm", deaths: 17, impact: 4,
    region: "Thessaly, Central Greece",
    desc: "17 deaths. Highest rainfall ever recorded in Greek history. The agricultural 'breadbasket' of Greece was destroyed."
  },
  {
    date: new Date(2024, 5, 15),
    year: 2024, event: "Heatwaves & Drought",
    type: "Heatwave", deaths: 0, impact: 3,
    region: "Nationwide",
    desc: "Record-breaking temperatures in June–July. Prolonged water shortages. Mass crop failures. Heat mortality not captured in emergency records."
  },
  {
    date: new Date(2025, 7, 1),
    year: 2025, event: "Summer Fire Season",
    type: "Wildfire", deaths: 0, impact: 3,
    region: "Athens (Attica)",
    desc: "70% of remaining Attica forests devastated over a 25-year cumulative cycle. Soil degradation driving a secondary, compounding flood risk for Athens."
  },
  {
    date: new Date(2026, 0, 15),
    year: 2026, event: "Winter Storm",
    type: "Storm", deaths: 2, impact: 3,
    region: "Athens (Attica)",
    desc: "A month's worth of rain fell in hours. Streets became rivers in Glyfada and Astros. 112 emergency alerts issued."
  },
  {
    date: new Date(2026, 3, 1),
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
   SCROLL PROGRESS BAR
   ============================================================ */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrolled  = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = ((scrolled / maxScroll) * 100) + '%';
}, { passive: true });

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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
  const pad  = 16;
  const tipW = 280;
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
function buildLegend(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;

  Object.entries(TYPE_COLOR).forEach(([type, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-dot" style="background:${color};
           border: 1.5px solid ${color};
           opacity: ${color === '#cae6ff' ? '1' : '1'}"></div>
      <span>${type}</span>
    `;
    wrap.appendChild(item);
  });

  // Size note
  const note = document.createElement('div');
  note.className = 'legend-item';
  note.innerHTML = `
    <svg width="28" height="14" style="margin-right:2px">
      <circle cx="5"  cy="7" r="4"   fill="none" stroke="#6b8fc7" stroke-width="1" stroke-dasharray="3,2"/>
      <circle cx="20" cy="7" r="6.5" fill="none" stroke="#6b8fc7" stroke-width="1"/>
    </svg>
    <span style="color:#6b8fc7">circle = death toll</span>
  `;
  wrap.appendChild(note);
}

/* ============================================================
   TIMELINE — persistent SVG references for filter transitions
   ============================================================ */
let tlGroup      = null;   // main <g> element
let tlScaleX     = null;   // x scale (shared)
let tlScaleY     = null;   // y scale (shared)
let tlLineFn     = null;   // line generator
let tlWidth      = 0;
let tlHeight     = 0;

function r(d) {
  return d.deaths === 0 ? 9 : Math.sqrt(d.deaths) * 5 + 7;
}

function getY(d) {
  return d.deaths === 0 ? tlScaleY(2) : tlScaleY(d.deaths);
}

/* Draw the static chart scaffolding once */
function drawTimeline() {
  const wrapper = document.querySelector('#timeline-chart').parentElement;
  const totalW  = Math.max(wrapper.clientWidth, 600);
  const margin  = { top: 50, right: 60, bottom: 48, left: 58 };
  tlWidth       = totalW - margin.left - margin.right;
  tlHeight      = 240 - margin.top - margin.bottom;

  const svg = d3.select('#timeline-chart')
    .attr('width',  totalW)
    .attr('height', tlHeight + margin.top + margin.bottom);

  svg.selectAll('*').remove();  // clear on redraw

  tlGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  tlScaleX = d3.scaleTime()
    .domain([new Date(2019, 10, 1), new Date(2026, 9, 1)])
    .range([0, tlWidth]);

  tlScaleY = d3.scaleLinear()
    .domain([0, 33])
    .range([tlHeight, 0]);

  tlLineFn = d3.line()
    .x(d => tlScaleX(d.date))
    .y(d => getY(d))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Grid
  tlGroup.append('g').attr('class', 'grid')
    .call(d3.axisLeft(tlScaleY).ticks(5).tickSize(-tlWidth).tickFormat(''));

  // Decorative top band
  tlGroup.append('rect')
    .attr('x', 0).attr('y', -margin.top)
    .attr('width', tlWidth).attr('height', margin.top * 0.5)
    .attr('fill', '#2a60df').attr('opacity', 0.04);

  // Year guide lines
  [2020, 2021, 2022, 2023, 2024, 2025, 2026].forEach(yr => {
    tlGroup.append('line')
      .attr('x1', tlScaleX(new Date(yr, 0, 1)))
      .attr('x2', tlScaleX(new Date(yr, 0, 1)))
      .attr('y1', 0).attr('y2', tlHeight)
      .attr('stroke', 'rgba(42,96,223,0.08)')
      .attr('stroke-width', 1);
  });

  // Trend line (will be updated on filter)
  tlGroup.append('path')
    .attr('class', 'trend-line')
    .attr('fill',            'none')
    .attr('stroke',          'rgba(42,96,223,0.15)')
    .attr('stroke-width',    1.5)
    .attr('stroke-dasharray','4 4');

  // Axes
  tlGroup.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${tlHeight})`)
    .call(d3.axisBottom(tlScaleX)
      .ticks(d3.timeYear.every(1))
      .tickFormat(d3.timeFormat('%Y')));

  tlGroup.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(tlScaleY).ticks(5));

  // Y label
  tlGroup.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(tlHeight / 2)).attr('y', -42)
    .attr('text-anchor', 'middle')
    .attr('fill', '#6b8fc7')
    .attr('font-size', '11px')
    .attr('font-family', 'Inter, sans-serif')
    .text('Deaths recorded');

  // 2023 annotation group (shown for all / wildfire / storm filters)
  tlGroup.append('text')
    .attr('class', 'peak-label')
    .attr('font-size',   '9.5px')
    .attr('font-family', 'Cinzel, serif')
    .attr('fill', '#2a60df')
    .attr('font-weight', '700');

  // Render circles for the first time
  renderTimelineCircles('all');
}

/* Update only the circles and trend line when filter changes */
function renderTimelineCircles(filter) {
  if (!tlGroup) return;

  const data = filter === 'all'
    ? DISASTERS
    : DISASTERS.filter(d => d.type === filter);

  const sorted = [...data].sort((a, b) => a.date - b.date);

  // Update trend line
  tlGroup.select('.trend-line')
    .datum(sorted)
    .transition().duration(450).ease(d3.easeCubicOut)
    .attr('d', tlLineFn);

  // Update 2023 peak annotation
  const evros = data.find(d => d.event === 'Evros Wildfire');
  const label = tlGroup.select('.peak-label');
  if (evros && (filter === 'all' || filter === 'Wildfire')) {
    label
      .attr('x', tlScaleX(evros.date) + r(evros) + 8)
      .attr('y', getY(evros) + 4)
      .text('2023 peak — 45 deaths');
  } else {
    label.text('');
  }

  // D3 join with key function for object constancy
  const events = tlGroup.selectAll('.evt')
    .data(data, d => d.event);

  // EXIT — shrink and remove
  events.exit()
    .transition().duration(300).ease(d3.easeCubicIn)
    .attr('opacity', 0)
    .remove();

  // ENTER — create new groups
  const enter = events.enter()
    .append('g')
    .attr('class', 'evt')
    .attr('transform', d => `translate(${tlScaleX(d.date)},${getY(d)})`)
    .attr('opacity', 0)
    .style('cursor', 'pointer');

  enter.append('circle')
    .attr('class', 'evt-circle')
    .attr('r', 0)
    .attr('fill',         d => TYPE_COLOR[d.type])
    .attr('fill-opacity', d => d.deaths === 0 ? 0.35 : 0.85)
    .attr('stroke',       d => TYPE_COLOR[d.type])
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', d => d.deaths === 0 ? '3 2' : 'none');

  enter.append('circle')
    .attr('r', d => Math.max(3, r(d) * 0.32))
    .attr('fill', 'white')
    .attr('fill-opacity', 0.2)
    .attr('pointer-events', 'none');

  enter.append('text')
    .attr('class', 'evt-label')
    .attr('text-anchor', 'middle')
    .attr('font-size', '9px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', '#2a3a5c')
    .attr('font-weight', '500')
    .text(d => d.event.length > 15 ? d.event.slice(0, 14) + '…' : d.event);

  // MERGE enter + update
  const merged = enter.merge(events);

  // Animate into position
  merged.transition().duration(500).ease(d3.easeCubicOut)
    .delay((d, i) => i * 40)
    .attr('opacity', 1)
    .attr('transform', d => `translate(${tlScaleX(d.date)},${getY(d)})`);

  merged.select('.evt-circle')
    .transition().duration(500).ease(d3.easeCubicOut)
    .delay((d, i) => i * 40)
    .attr('r', d => r(d));

  merged.select('.evt-label')
    .attr('y', d => -(r(d) + 7));

  // Interactions (re-attach on every render)
  merged
    .on('mouseover', function (event, d) {
      d3.select(this).raise();
      d3.select(this).select('.evt-circle')
        .transition().duration(130)
        .attr('r', r(d) * 1.22)
        .attr('fill-opacity', 1);
      showTooltip(event, d);
    })
    .on('mousemove', (event) => positionTooltip(event))
    .on('mouseout', function (event, d) {
      d3.select(this).select('.evt-circle')
        .transition().duration(130)
        .attr('r', r(d))
        .attr('fill-opacity', d.deaths === 0 ? 0.35 : 0.85);
      hideTooltip();
    });
}

/* ============================================================
   FILTER TABS
   ============================================================ */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTimelineCircles(btn.dataset.filter);
  });
});

/* ============================================================
   BAR CHART — Deaths by disaster type
   ============================================================ */
function drawBarChart() {
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

  // Grid
  g.append('g').attr('class', 'grid')
    .attr('transform', `translate(0,${plotH})`)
    .call(d3.axisBottom(xScale).ticks(5).tickSize(-plotH).tickFormat(''));

  // Bar groups
  const bars = g.selectAll('.bar-grp')
    .data(barData)
    .join('g')
      .attr('class',     'bar-grp')
      .attr('transform', d => `translate(0,${yScale(d.type)})`);

  // Track
  bars.append('rect')
    .attr('x', 0).attr('width', W)
    .attr('height', yScale.bandwidth())
    .attr('fill', 'rgba(42,96,223,0.04)');

  // Filled bar
  bars.append('rect')
    .attr('class',   'bar-fill')
    .attr('x', 0)   .attr('width', 0)
    .attr('height',  yScale.bandwidth())
    .attr('fill',    d => TYPE_COLOR[d.type])
    .attr('rx', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill-opacity', 0.72);
      showTooltip(event, {
        event: d.type + ' events', year: '2020–2026', region: 'Greece',
        desc:  `Combined recorded fatalities across all ${d.type.toLowerCase()} events in the study period.`,
        deaths: d.deaths,
      });
    })
    .on('mousemove', (event) => positionTooltip(event))
    .on('mouseout',  function () { d3.select(this).attr('fill-opacity', 1); hideTooltip(); })
    .transition().duration(900).delay((d, i) => i * 130)
    .attr('width', d => xScale(d.deaths));

  // Type label (left)
  bars.append('text')
    .attr('x', -10).attr('y', yScale.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('font-size',   '12px')
    .attr('font-family', 'Cinzel, serif')
    .attr('fill',        d => TYPE_COLOR[d.type])
    .attr('font-weight', '600')
    .text(d => d.type);

  // Value label (animates right with bar)
  bars.append('text')
    .attr('class', 'bar-label')
    .attr('x', 6).attr('y', yScale.bandwidth() / 2 + 4)
    .attr('font-size', '11.5px').attr('font-family', 'Inter, sans-serif')
    .attr('fill', '#2a3a5c').attr('font-weight', '500')
    .text(d => d.deaths > 0 ? `${d.deaths} deaths` : 'see note *')
    .transition().duration(900).delay((d, i) => i * 130)
    .attr('x', d => xScale(d.deaths) + 8);

  // X axis
  g.append('g').attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${plotH})`)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d > 0 ? d : ''));
}

/* ============================================================
   INIT
   ============================================================ */
buildLegend('timeline-legend');
drawTimeline();
drawBarChart();

/* Responsive redraw */
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    // Preserve active filter
    const activeFilter = document.querySelector('.tab.active')?.dataset.filter || 'all';
    d3.select('#bar-chart').selectAll('*').remove();
    drawTimeline();
    renderTimelineCircles(activeFilter);
    drawBarChart();
  }, 260);
}, { passive: true });
