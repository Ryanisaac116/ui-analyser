// Pro Frontend script — tabs, animations, palette, analyze/batch wiring, reports

// ===== Tab Nav =====
const panels = document.querySelectorAll('.panel');
const navItems = document.querySelectorAll('.nav-item');
const crumb = document.getElementById('crumb');
navItems.forEach(btn => btn.addEventListener('click', () => {
  navItems.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const id = btn.dataset.tab;
  panels.forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${id}`).classList.add('active');
  crumb.textContent = btn.textContent;
}));

// ===== Theme & Palette =====
const themeBtn = document.getElementById('themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('ui-theme');
if(savedTheme) root.setAttribute('data-theme', savedTheme);

function toggleTheme(){
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  localStorage.setItem('ui-theme', next);
}
themeBtn.addEventListener('click', toggleTheme);

const palettes = {
  sunset: ['#ff6ec7','#ff8a5b','#ffd166'],
  ocean:  ['#4ad6ff','#7aa0ff','#6a5cff'],
  forest: ['#00d68f','#69ff9f','#4ad6ff'],
  royal:  ['#6a5cff','#4ad6ff','#00d68f'],
  candy:  ['#ff6ec7','#4ad6ff','#6a5cff'],
};
function applyPalette(name){
  const [a,b,c] = palettes[name] || palettes.candy;
  root.style.setProperty('--grad-1', a);
  root.style.setProperty('--grad-2', b);
  root.style.setProperty('--grad-3', c);
  localStorage.setItem('ui-pal', name);
}
const savedPal = localStorage.getItem('ui-pal') || 'sunset';
applyPalette(savedPal);
document.querySelectorAll('.swatch').forEach(s => {
  const p = palettes[s.dataset.pal];
  if(p) s.style.background = `linear-gradient(135deg, ${p[0]}, ${p[1]})`;
  s.addEventListener('click', ()=> applyPalette(s.dataset.pal));
});

// ===== Topbar Loader =====
const topbar = document.getElementById('topbar');
let topbarTimer = null;
function startTopbar(){ topbar.classList.add('active'); topbar.style.width = '0%'; let w=0; clearInterval(topbarTimer); topbarTimer=setInterval(()=>{ w=Math.min(95,w+Math.random()*12); topbar.style.width=w+'%'; },220); }
function finishTopbar(){ clearInterval(topbarTimer); topbar.style.width='100%'; setTimeout(()=>{ topbar.classList.remove('active'); topbar.style.width='0%'; },280); }

// ===== Analyze (single) =====
const formSingle = document.getElementById('form-single');
const urlInput = document.getElementById('url');
const optLinks = document.getElementById('optLinks');
const optContrast = document.getElementById('optContrast');
const tableBody = document.querySelector('#table tbody');
const metaEl = document.getElementById('meta');
const filterSel = document.getElementById('filter');
const searchBox = document.getElementById('search');
const dlBtn = document.getElementById('download');
const copyBtn = document.getElementById('copy');
const csvBtn = document.getElementById('toCsv');
const exportJsonTop = document.getElementById('exportJsonTop');
const exportCsvTop = document.getElementById('exportCsvTop');

let lastReport = null;
let currentIssues = [];

formSingle.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const url = urlInput.value.trim();
  if(!isHttpUrl(url)) return toast('Enter a valid http(s) URL', true);
  startTopbar();
  tableBody.innerHTML = `<tr><td colspan="5">Running…</td></tr>`;
  try{
    const q = new URLSearchParams({ url, checkLinks:String(optLinks.checked), checkContrast:String(optContrast.checked) });
    const res = await fetch('/api/analyze?' + q.toString());
    const data = await res.json();
    lastReport = data;
    renderMeta(data);
    renderIssues(data.issues||[]);
    pushHistoryRow(data);
  }catch(err){
    tableBody.innerHTML = `<tr><td colspan="5">Error: ${escapeHtml(String(err))}</td></tr>`;
  }finally{ finishTopbar(); }
});

function renderMeta(data){
  metaEl.innerHTML = ''
    + badge(`Status: ${data.meta?.status ?? 'n/a'}`)
    + badge(`Load: ${data.meta?.timeMs ?? '?'} ms`)
    + badge(`Final URL: ${escapeHtml(data.meta?.finalUrl || '')}`)
    + badge(`Found: ${(data.issues||[]).length} issues`);
}
function badge(t){ return `<span class="badge">${t}</span>` }

function renderIssues(issues){
  currentIssues = issues.slice();
  updateFiltered();
}
function updateFiltered(){
  const sev = filterSel.value; const q = searchBox.value.toLowerCase().trim();
  let fil = currentIssues.filter(it => sev==='all' ? true : it.severity===sev);
  if(q){ fil = fil.filter(it => (it.title+" "+(it.details||" ")+" "+(it.sample||" ")).toLowerCase().includes(q)) }
  tableBody.innerHTML = fil.length ? fil.map((it,i)=>row(it,i+1)).join('') : `<tr class="empty-row"><td colspan="5">No results for current filter.</td></tr>`;
}
filterSel.addEventListener('change', updateFiltered);
searchBox.addEventListener('input', updateFiltered);

function row(it, i){
  return `<tr>
    <td>${i}</td>
    <td class="sev ${it.severity}">${it.severity?.toUpperCase?.()||''}</td>
    <td>${escapeHtml(it.title||'')}</td>
    <td>${escapeHtml(it.details||'')}</td>
    <td>${escapeHtml(it.sample||'')}</td>
  </tr>`
}

// ===== Batch =====
const formBatch = document.getElementById('form-batch');
const urlsBox = document.getElementById('urls');
const optLinksB = document.getElementById('optLinksB');
const optContrastB = document.getElementById('optContrastB');
const batchTableBody = document.querySelector('#batchTable tbody');
const batchProgress = document.getElementById('batchProgress');

formBatch.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const list = urlsBox.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,20);
  if(!list.length) return toast('Paste at least one URL', true);
  startTopbar();
  batchTableBody.innerHTML = `<tr><td colspan="8">Running…</td></tr>`;
  batchProgress.textContent = 'Running…';
  try{
    const res = await fetch('/api/analyze-batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ urls:list, options:{ checkLinks:optLinksB.checked, checkContrast:optContrastB.checked } }) });
    const data = await res.json();
    batchProgress.textContent = `Completed ${data.count} URLs`;
    const rows = [];
    data.results.forEach((r) => {
      (r.issues||[]).forEach(it => rows.push(rowFrom(r, it)));
      if(!(r.issues||[]).length) rows.push(rowFrom(r, { severity:'OK', title:'No issues found' }));
    });
    batchTableBody.innerHTML = rows.map((r,i)=>batchRow(r,i+1)).join('');
    updateReportsFromBatch(rows);
  }catch(err){
    batchTableBody.innerHTML = `<tr><td colspan="8">Error: ${escapeHtml(String(err))}</td></tr>`;
  }finally{ finishTopbar(); }
});

function rowFrom(r, it){
  return { url: r.meta?.finalUrl || r.meta?.requestedUrl || '', severity: it.severity, title: it.title, details: it.details||'', sample: it.sample||'', status: r.meta?.status||'', timeMs: r.meta?.timeMs||'' };
}
function batchRow(r,i){
  return `<tr>
    <td>${i}</td>
    <td>${escapeHtml(r.url)}</td>
    <td class="sev ${r.severity}">${escapeHtml(r.severity||'')}</td>
    <td>${escapeHtml(r.title||'')}</td>
    <td>${escapeHtml(r.details||'')}</td>
    <td>${escapeHtml(r.sample||'')}</td>
    <td>${escapeHtml(r.status||'')}</td>
    <td>${escapeHtml(r.timeMs||'')}</td>
  </tr>`
}

// ===== Reports (summary + chart + history) =====
const statsBox = document.getElementById('summaryStats');
const trendChart = document.getElementById('trendChart');
const historyBody = document.querySelector('#historyTable tbody');

function pushHistoryRow(data){
  const issues = data.issues||[];
  const e = issues.filter(x=>x.severity==='error').length;
  const w = issues.filter(x=>x.severity==='warn').length;
  const n = issues.filter(x=>x.severity==='note').length;
  const url = data.meta?.finalUrl || data.meta?.requestedUrl || '';
  if(historyBody.querySelector('.empty-row')) historyBody.innerHTML='';
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${historyBody.children.length+1}</td><td>${escapeHtml(url)}</td><td>${e}</td><td>${w}</td><td>${n}</td><td>${escapeHtml(String(data.meta?.timeMs||''))}</td>`;
  historyBody.prepend(tr);
  updateStats();
  plotTrend();
}

function updateReportsFromBatch(rows){
  if(historyBody.querySelector('.empty-row')) historyBody.innerHTML='';
  // Aggregate by URL (latest wins)
  const byUrl = new Map();
  rows.forEach(r => {
    const entry = byUrl.get(r.url) || { e:0,w:0,n:0, t:r.timeMs };
    if(r.severity==='error') entry.e++;
    else if(r.severity==='warn') entry.w++;
    else if(r.severity==='note' || r.severity==='OK') entry.n++;
    byUrl.set(r.url, entry);
  });
  [...byUrl.entries()].forEach(([url, m], idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td><td>${escapeHtml(url)}</td><td>${m.e}</td><td>${m.w}</td><td>${m.n}</td><td>${escapeHtml(String(m.t||''))}</td>`;
    historyBody.append(tr);
  });
  updateStats();
  plotTrend();
}

function updateStats(){
  const rows = [...historyBody.querySelectorAll('tr')];
  if(!rows.length){ statsBox.innerHTML = `<div class="stat"><div class="k">–</div><div class="v">Total issues</div></div><div class="stat"><div class="k">–</div><div class="v">Pages scanned</div></div><div class="stat"><div class="k">–</div><div class="v">Avg/ms</div></div>`; return; }
  let total=0, pages=rows.length, times=[];
  rows.forEach(tr=>{
    const e=+tr.children[2].textContent||0;
    const w=+tr.children[3].textContent||0;
    const n=+tr.children[4].textContent||0;
    const t=+tr.children[5].textContent||0;
    total += e+w+n; if(t) times.push(t);
  });
  const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;
  statsBox.innerHTML = `
    <div class="stat"><div class="k">${total}</div><div class="v">Total issues</div></div>
    <div class="stat"><div class="k">${pages}</div><div class="v">Pages scanned</div></div>
    <div class="stat"><div class="k">${avg} ms</div><div class="v">Avg per page</div></div>`;
}

function plotTrend(){
  // draw simple SVG line over last 12 entries
  const rows = [...historyBody.querySelectorAll('tr')].slice(0,12).reverse();
  const totals = rows.map(tr=> (+tr.children[2].textContent||0) + (+tr.children[3].textContent||0) + (+tr.children[4].textContent||0) );
  const max = Math.max(1, ...totals);
  const w = trendChart.clientWidth || 600; const h = trendChart.clientHeight || 180; const pad = 10;
  const step = (w - pad*2) / Math.max(1, totals.length-1);
  const pts = totals.map((v,i)=> [pad + i*step, h - pad - (h-pad*2)*(v/max)]);
  const path = pts.map((p,i)=> (i? 'L':'M')+p[0]+','+p[1]).join(' ');
  trendChart.innerHTML = `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="var(--grad-1)"/>
        <stop offset="100%" stop-color="var(--grad-2)"/>
      </linearGradient>
    </defs>
    <path d="${path}" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

// ===== Exports =====
function downloadJSON(filename, data){ const blob=new Blob([JSON.stringify(data||{error:'no-report'}, null, 2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href) }
function downloadCSV(filename, rows){ const csv = rows.map(r=> r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href) }

function exportCurrentJSON(){ if(!lastReport) return toast('Run an analysis first', true); downloadJSON('ui-bugs-analyser-report.json', lastReport) }
function exportCurrentCSV(){ if(!lastReport) return toast('Run an analysis first', true); const rows=[["severity","title","details","sample","requestedUrl","finalUrl","status","timeMs"]]; (lastReport.issues||[]).forEach(it=> rows.push([it.severity,it.title,it.details||"",it.sample||"", lastReport.meta?.requestedUrl||"", lastReport.meta?.finalUrl||"", lastReport.meta?.status||"", lastReport.meta?.timeMs||""])); downloadCSV('ui-bugs-analyser-report.csv', rows) }

document.getElementById('download').addEventListener('click', exportCurrentJSON);
document.getElementById('toCsv').addEventListener('click', exportCurrentCSV);
document.getElementById('copy').addEventListener('click', ()=>{ if(!lastReport) return toast('Run an analysis first', true); navigator.clipboard.writeText(JSON.stringify(lastReport, null, 2)); toast('Copied JSON') });
exportJsonTop.addEventListener('click', exportCurrentJSON);
exportCsvTop.addEventListener('click', exportCurrentCSV);

// ===== Helpers =====
function isHttpUrl(v){ try{ const u=new URL(v); return ['http:','https:'].includes(u.protocol) }catch{ return false } }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])); }
function toast(text, danger){ const t=document.createElement('div'); t.textContent=text; t.style.position='fixed'; t.style.zIndex=1000; t.style.left='50%'; t.style.bottom='24px'; t.style.transform='translateX(-50%)'; t.style.padding='10px 14px'; t.style.borderRadius='12px'; t.style.fontWeight='800'; t.style.border='1px solid var(--border)'; t.style.background = danger? 'linear-gradient(135deg, #ef4444, #ff9b9b)' : 'linear-gradient(135deg, var(--grad-1), var(--grad-2))'; t.style.color='#0b1020'; t.style.boxShadow='0 10px 24px rgba(0,0,0,.2)'; document.body.appendChild(t); setTimeout(()=>t.remove(), 1700) }
