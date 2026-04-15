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
