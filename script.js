// ==========================================
// 1. LOGIKA ANIMASI API KANVAS ok
// ==========================================
const canvas = document.getElementById('fireCanvas');
const ctx = canvas.getContext('2d');
let sparks = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Spark {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 4 + 1;
        this.speedY = Math.random() * -3 - 1;
        this.speedX = Math.random() * 2 - 1;
        this.life = 1;
        const colors = ['#ffc93c', '#ff2d3b', '#e08a4b', '#ff7b00'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.03;
        this.life -= 0.005;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (sparks.length < 150) sparks.push(new Spark());
    for (let i = 0; i < sparks.length; i++) {
        sparks[i].update(); sparks[i].draw();
        if (sparks[i].life <= 0 || sparks[i].size <= 0.1) { sparks.splice(i, 1); i--; }
    }
    requestAnimationFrame(animate);
}
animate();

// ==========================================
// 2. LOGIKA APLIKASI KLASEMEN JFFC
// ==========================================
(function(){
  const STORAGE_KEY = 'jffc_standing_kontingen_v3';
  
  let data = [
    {"id":"1783568136702lv8m4olq4od","kategori":"Braveheart","kontingen":"Seksi Operasi","namaAtlet":"Singgih","waktu":"06:20","score":380},
    {"id":"1783568634407by880n6ll7a","kategori":"Braveheart","kontingen":"Seksi Operasi","namaAtlet":"Viky Ferdiansyah","waktu":"06:41","score":401},
    {"id":"178356865832271t6eifddo6","kategori":"Braveheart","kontingen":"Seksi Operasi","namaAtlet":"Handoyo","waktu":"05:38","score":338},
    {"id":"1783568676958vb7jh1fm4fg","kategori":"Braveheart","kontingen":"Penjaringan","namaAtlet":"Raihan Akbar","waktu":"08:59","score":539},
    {"id":"1783568720892887e3ipnd13","kategori":"Braveheart","kontingen":"Kepulauan Seribu Utara","namaAtlet":"Budi Kurniawan","waktu":"08:09","score":489},
    {"id":"1783568751882sh69iyj903l","kategori":"Braveheart","kontingen":"Kelapa Gading","namaAtlet":"Alfredo","waktu":"10:21","score":621},
    {"id":"17835687822632am468qv7j9","kategori":"Braveheart","kontingen":"Pademangan","namaAtlet":"Kahidar","waktu":"10:30","score":630},
    {"id":"17835688264747qufwxn9ay8","kategori":"Braveheart","kontingen":"Penjaringan","namaAtlet":"Rico Sahroni","waktu":"10:06","score":606},
    {"id":"1783571895767swfv9t2103","kategori":"Braveheart","kontingen":"Cilincing","namaAtlet":"Muhammad Refi","waktu":"08:04","score":484},
    {"id":"17835719177348zbx0tc4pyq","kategori":"Braveheart","kontingen":"Kepulauan Seribu Selatan","namaAtlet":"Khadafi","waktu":"09:11","score":551},
    {"id":"1783571949579glwvq6ll4rq","kategori":"Braveheart","kontingen":"Pademangan","namaAtlet":"Difa Agustiawan","waktu":"09:48","score":588},
    {"id":"1783572352032p0i48je716q","kategori":"Braveheart","kontingen":"Seksi Operasi","namaAtlet":"Aditya","waktu":"06:25","score":385},
    {"id":"1783581178693795upj6fha5","kategori":"Braveheart","kontingen":"Kelapa Gading","namaAtlet":"Putra Rahmat Iqbal","waktu":"07:46","score":466},
    {"id":"1783581212555ctat87zo10k","kategori":"Braveheart","kontingen":"Penjaringan","namaAtlet":"Muhammad Yusril","waktu":"06:22","score":382},
    {"id":"1783581791385d3uiraj4jy7","kategori":"Braveheart","kontingen":"Kepulauan Seribu Utara","namaAtlet":"Azim Tamama","waktu":"07:49","score":469}
  ];
  let activeCat = 'Braveheart';
  let editing = null;

  const leaderBanner = document.getElementById('leaderBanner');
  const tableBody = document.getElementById('tableBody');
  const tableWrap = document.getElementById('tableWrap');
  const headHL = document.getElementById('headHL');
  const headBH = document.getElementById('headBH');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const selKontingen = document.getElementById('selKontingen');
  const inpNilai = document.getElementById('inpNilai');
  const inpWaktuHL = document.getElementById('inpWaktuHL');
  const inpScore = document.getElementById('inpScore');
  const inpNamaAtlet = document.getElementById('inpNamaAtlet');
  const inpWaktuBH = document.getElementById('inpWaktuBH');
  const fieldsHL = document.getElementById('fieldsHL');
  const fieldsBH = document.getElementById('fieldsBH');
  const drawerTitle = document.getElementById('drawerTitle');
  const optHL = document.getElementById('optHL');
  const optBH = document.getElementById('optBH');
  const catHint = document.getElementById('catHint');
  const heroTitle = document.getElementById('heroTitle');
  const ruleHint = document.getElementById('ruleHint');
  const tabHL = document.getElementById('tabHL');
  const tabBH = document.getElementById('tabBH');

  const CAT_INFO = {
    Hoselaying: { cls:'hl', rule:'Peringkat berdasarkan Nilai Akhir/Score TERTINGGI', order:'desc' },
    Braveheart: { cls:'bh', rule:'Peringkat individu atlet berdasarkan WAKTU TERCEPAT (terendah)', order:'asc' }
  };

  function load(){
    try{ 
      const raw = localStorage.getItem(STORAGE_KEY); 
      if(raw) {
        let savedData = JSON.parse(raw);
        if (savedData.length > 0) data = savedData;
      }
    }
    catch(e){}
    data.forEach(d => { if(!d.id) d.id = Date.now().toString() + Math.random().toString(36).substring(2); });
  }

  function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){} }

  function fmtNum(n){ const num = Number(n)||0; return num % 1 === 0 ? num.toString() : num.toFixed(2); }
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function initials(name){ return String(name).trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase(); }

  function parseWaktuToSeconds(str){
    str = String(str||'').trim().replace(',', '.');
    if(!str) return Infinity;
    const parts = str.split(':');
    if(parts.length >= 2){
      let total = 0;
      if(parts.length === 2) total = (parseFloat(parts[0])||0)*60 + (parseFloat(parts[1])||0);
      else if(parts.length === 3) total = (parseFloat(parts[0])||0)*3600 + (parseFloat(parts[1])||0)*60 + (parseFloat(parts[2])||0);
      return total;
    }
    const s = parseFloat(str);
    return isNaN(s) ? Infinity : s;
  }

  function getSorted(cat){
    const rows = data.filter(d=>d.kategori === cat);
    const order = CAT_INFO[cat].order;
    return [...rows].sort((a,b)=> order === 'asc' ? (a.score-b.score) : (b.score-a.score));
  }

  function renderHero(){
    heroTitle.textContent = activeCat.toUpperCase();
    heroTitle.classList.toggle('braveheart', activeCat === 'Braveheart');
    ruleHint.textContent = CAT_INFO[activeCat].rule;
    tabHL.classList.toggle('active', activeCat==='Hoselaying');
    tabBH.classList.toggle('active', activeCat==='Braveheart');
    tableWrap.classList.toggle('cat-hl', activeCat==='Hoselaying');
    tableWrap.classList.toggle('cat-bh', activeCat==='Braveheart');
    headHL.style.display = activeCat==='Hoselaying' ? 'grid' : 'none';
    headBH.style.display = activeCat==='Braveheart' ? 'grid' : 'none';
  }

  function render(){
    renderHero();
    const info = CAT_INFO[activeCat];
    const sorted = getSorted(activeCat);
    const leaderScore = sorted.length ? sorted[0].score : 0;
    const isBH = activeCat === 'Braveheart';

    if(sorted.length === 0){
      leaderBanner.innerHTML = `<div class="leader-empty">Belum ada data untuk kategori ${activeCat}. Klik "Input Data" untuk mulai mengisi klasemen.</div>`;
    } else {
      const l = sorted[0];
      const leadName = isBH ? l.namaAtlet : l.kontingen;
      const leadMeta = isBH ? ('Kontingen ' + escapeHtml(l.kontingen)) : ('Nilai ' + fmtNum(l.nilai) + ' &middot; Waktu ' + (l.waktu || '—'));
      const scoreLbl = isBH ? 'Waktu' : 'Score';
      const scoreVal = isBH ? (l.waktu || fmtNum(l.score)) : fmtNum(l.score);
      leaderBanner.innerHTML = `
        <div class="leader-card ${info.cls}">
          <div class="leader-avatar">${initials(leadName)}</div>
          <div class="leader-mid">
            <div class="leader-tag"><span class="dot"></span>Leader</div>
            <div class="leader-name">${escapeHtml(leadName)}</div>
            <div class="leader-meta">${leadMeta}</div>
          </div>
          <div class="leader-score-box">
            <div class="lbl">${scoreLbl}</div>
            <div class="val">${scoreVal}</div>
          </div>
        </div>`;
    }

    if(sorted.length === 0){
      tableBody.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>
          <p>Tabel standing ${activeCat} masih kosong</p>
        </div>`;
      return;
    }

    tableBody.innerHTML = sorted.map((row, i)=>{
      const rank = i+1;
      let gapHtml = '';
      if(rank > 1){
        const diff = info.order === 'asc' ? (row.score - leaderScore) : (leaderScore - row.score);
        const prefix = info.order === 'asc' ? '+' : '-';
        gapHtml = `<div class="gap">${prefix}${fmtNum(Math.abs(diff))}</div>`;
      }
      
      const rowKey = `data-id="${row.id}"`;

      if(isBH){
        return `
        <div class="row rank-${rank} bh" ${rowKey}>
          <div class="rank-num">${rank}</div>
          <div class="name-cell">
            <div class="nm">${escapeHtml(row.namaAtlet)}</div>
            ${gapHtml}
            <div class="sub-data"><span>${escapeHtml(row.kontingen)}</span></div>
          </div>
          <div class="data-cell"><div class="v">${escapeHtml(row.kontingen)}</div></div>
          <div class="score-box bh"><div class="v">${row.waktu || fmtNum(row.score)}</div></div>
          <div class="row-actions">
            <button class="del-btn" data-del-id="${row.id}" title="Hapus">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
            </button>
          </div>
        </div>`;
      }
      return `
      <div class="row rank-${rank} hl" ${rowKey}>
        <div class="rank-num">${rank}</div>
        <div class="name-cell">
          <div class="nm">${escapeHtml(row.kontingen)}</div>
          ${gapHtml}
          <div class="sub-data"><span>Nilai ${fmtNum(row.nilai)}</span></div>
        </div>
        <div class="data-cell"><div class="v">${fmtNum(row.nilai)}</div></div>
        <div class="data-cell"><div class="v">${row.waktu || '—'}</div></div>
        <div class="score-box hl"><div class="v">${fmtNum(row.score)}</div></div>
        <div class="row-actions">
          <button class="del-btn" data-del-id="${row.id}" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');

    tableBody.querySelectorAll('.row').forEach(el=>{
      el.addEventListener('click', (e)=>{
        if(e.target.closest('.del-btn')) return;
        openEdit(el.dataset.id);
      });
    });
    tableBody.querySelectorAll('.del-btn').forEach(el=>{
      el.addEventListener('click', (e)=>{
        e.stopPropagation();
        const delId = el.dataset.delId;
        data = data.filter(d => d.id !== delId);
        save(); render();
      });
    });
  }

  function setActiveCat(cat){ activeCat = cat; render(); }
  tabHL.addEventListener('click', ()=> setActiveCat('Hoselaying'));
  tabBH.addEventListener('click', ()=> setActiveCat('Braveheart'));

  function setFormCat(cat){
    optHL.classList.toggle('active', cat==='Hoselaying');
    optBH.classList.toggle('active', cat==='Braveheart');
    catHint.textContent = CAT_INFO[cat].hint;
    fieldsHL.style.display = cat==='Hoselaying' ? '' : 'none';
    fieldsBH.style.display = cat==='Braveheart' ? '' : 'none';
  }
  optHL.addEventListener('click', ()=>{ if(!editing) setFormCat('Hoselaying'); });
  optBH.addEventListener('click', ()=>{ if(!editing) setFormCat('Braveheart'); });

  function currentFormCat(){ return optBH.classList.contains('active') ? 'Braveheart' : 'Hoselaying'; }

  function openDrawer(){ drawer.classList.add('open'); overlay.classList.add('open'); }
  function closeDrawer(){
    drawer.classList.remove('open'); overlay.classList.remove('open');
    editing = null;
    selKontingen.value=''; inpNilai.value=''; inpWaktuHL.value=''; inpScore.value='';
    inpNamaAtlet.value=''; inpWaktuBH.value='';
    optHL.classList.remove('disabled'); optBH.classList.remove('disabled');
    drawerTitle.textContent = 'Input Data';
  }

  function openEdit(id){
    const row = data.find(d => d.id === id);
    if(!row) return;
    editing = row;
    setFormCat(row.kategori);
    optHL.classList.add('disabled'); optBH.classList.add('disabled');
    selKontingen.value = row.kontingen;
    
    if(row.kategori === 'Braveheart'){
      inpNamaAtlet.value = row.namaAtlet;
      inpWaktuBH.value = row.waktu;
      drawerTitle.textContent = 'Ubah Data — '+row.namaAtlet;
    } else {
      inpNilai.value = row.nilai;
      inpWaktuHL.value = row.waktu;
      inpScore.value = row.score;
      drawerTitle.textContent = 'Ubah Data — '+row.kontingen;
    }
    openDrawer();
  }

  document.getElementById('openDrawerBtn').addEventListener('click', ()=>{
    closeDrawer();
    setFormCat(activeCat);
    openDrawer();
  });
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  document.getElementById('cancelBtn').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.getElementById('saveBtn').addEventListener('click', ()=>{
    const kategori = editing ? editing.kategori : currentFormCat();
    const kontingen = selKontingen.value;
    if(!kontingen){ selKontingen.focus(); return; }

    if(kategori === 'Braveheart'){
      const namaAtlet = inpNamaAtlet.value.trim();
      if(!namaAtlet){ inpNamaAtlet.focus(); return; }
      const waktu = inpWaktuBH.value.trim();
      const score = parseWaktuToSeconds(waktu);
      
      let idx = editing ? data.findIndex(d => d.id === editing.id) : -1;
      const rowObj = { 
        id: editing ? editing.id : (Date.now().toString() + Math.random().toString(36).substring(2)), 
        kategori, kontingen, namaAtlet, waktu, score 
      };
      
      if(idx >= 0) data[idx] = rowObj; else data.push(rowObj);
    } else {
      const nilai = parseFloat(inpNilai.value) || 0;
      const waktu = inpWaktuHL.value.trim();
      const score = parseFloat(inpScore.value) || 0;
      
      let idx = -1;
      if (editing) {
          idx = data.findIndex(d => d.id === editing.id);
      } else {
          idx = data.findIndex(d => d.kategori === 'Hoselaying' && d.kontingen === kontingen);
      }
      
      const rowObj = { 
        id: idx >= 0 ? data[idx].id : (Date.now().toString() + Math.random().toString(36).substring(2)), 
        kategori, kontingen, nilai, waktu, score 
      };
      
      if(idx >= 0) data[idx] = rowObj; else data.push(rowObj);
    }

    save();
    if(kategori !== activeCat) setActiveCat(kategori); else render();
    closeDrawer();
  });

  document.getElementById('fullscreenBtn').addEventListener('click', ()=>{
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen().catch(()=>{}); }
    else { document.exitFullscreen(); }
  });

  // ==========================================
  // 3. FITUR EXPORT (DOWNLOAD) HTML VIEW-ONLY
  // ==========================================
  document.getElementById('shareBtn').addEventListener('click', ()=>{
    const exportHTMLString = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JFFC 2026 — Standing Kontingen (Read Only)</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Racing+Sans+One&display=swap" rel="stylesheet">
  
  <style>
    @font-face {
      font-family: 'MotoGP Display';
      src: url('font/MotoGPDisplay-Bold.woff') format('woff');
      font-weight: bold;
      font-style: normal;
    }
    :root {
      --bg-deep: #0a0a0c; --bg-panel: #141416; --bg-panel-2: #1b1b1e;
      --line: rgba(255, 255, 255, 0.08); --red-1: #ff2d3b; --red-2: #b8091a;
      --water-1: #1fb6ff; --water-2: #0e6bd6; --text-hi: #ffffff;
      --text-mid: #a7abb3; --text-dim: #5c6068;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100%; background-color: var(--bg-deep); color: var(--text-hi); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
    #app { position: relative; min-height: 100vh; background: repeating-linear-gradient(115deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 42px), radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255,45,59,0.16), transparent 60%); }
    #fireCanvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
    .bg-kiri, .bg-kanan { position: fixed; bottom: 0; z-index: 2; width: 40vw; max-width: 350px; pointer-events: none; }
    .bg-kiri { left: 0; } .bg-kanan { right: 0; }
    
    .hero { text-align: center; padding: 40px 20px 22px; position: relative; z-index: 5; }
    .main-logo { height: 90px; margin: 0 auto 16px auto; display: block; object-fit: contain; }
    .hero .eyebrow { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--text-mid); margin-bottom: 8px; }
    .hero h1 { margin: 0; font-family: 'MotoGP Display', 'Racing Sans One', sans-serif; letter-spacing: 0.05em; text-transform: uppercase; font-size: clamp(40px, 9vw, 80px); line-height: 1; background: linear-gradient(90deg, var(--red-1), var(--red-2)); -webkit-background-clip: text; background-clip: text; color: transparent; transition: .25s; }
    .hero h1.braveheart { background: linear-gradient(90deg, var(--water-1), var(--water-2)); -webkit-background-clip: text; background-clip: text; }
    .hero .sub { margin-top: 8px; font-size: 13.5px; font-weight: 700; color: var(--text-mid); letter-spacing: .1em; text-transform: uppercase; }
    
    .tabs { display: flex; justify-content: center; gap: 10px; margin: 24px 20px 8px; position: relative; z-index: 5; }
    .tab-btn { padding: 12px 26px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg-panel); color: var(--text-mid); font-size: 13.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; cursor: pointer; transition: .18s; }
    .tab-btn.active.hl { background: linear-gradient(135deg, var(--red-1), var(--red-2)); color: #fff; border: none; box-shadow: 0 6px 18px rgba(255, 45, 59, 0.35); }
    .tab-btn.active.bh { background: linear-gradient(135deg, var(--water-1), var(--water-2)); color: #fff; border: none; box-shadow: 0 6px 18px rgba(31, 182, 255, 0.35); }
    .rule-hint { text-align: center; position: relative; z-index: 5; font-size: 11.5px; color: var(--text-dim); margin: 0 20px 20px; font-weight: 600; }
    
    .leader-banner { max-width: 960px; margin: 0 auto 34px; padding: 0 20px; position: relative; z-index: 5; }
    .leader-card { display: flex; align-items: center; gap: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 18px 40px -10px rgba(255, 45, 59, 0.35); min-height: 118px; }
    .leader-card.hl { background: linear-gradient(90deg, var(--red-2) 0%, var(--red-1) 55%, #7a0812 100%); }
    .leader-card.bh { background: linear-gradient(90deg, var(--water-2) 0%, var(--water-1) 55%, #063a63 100%); box-shadow: 0 18px 40px -10px rgba(31, 182, 255, 0.35); }
    .leader-avatar { width: 118px; min-width: 118px; height: 118px; background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.22), rgba(0, 0, 0, 0.35)); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 36px; color: #fff; border-right: 1px solid rgba(255, 255, 255, 0.15); overflow: hidden; }
    .leader-avatar img.leader-photo { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
    .leader-avatar.no-photo { letter-spacing: .02em; }
    .leader-mid { flex: 1; padding: 14px 22px; min-width: 0; }
    .leader-tag { font-family: 'Plus Jakarta Sans', sans-serif; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: rgba(255, 255, 255, 0.75); margin-bottom: 6px; }
    .leader-tag .dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; box-shadow: 0 0 6px #fff; }
    .leader-name { font-weight: 800; letter-spacing: .01em; font-size: clamp(19px, 3.4vw, 30px); color: #fff; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .leader-meta { font-size: 12px; color: rgba(255, 255, 255, 0.75); font-weight: 600; margin-top: 4px; }
    .leader-score-box { width: 160px; min-width: 160px; height: 118px; background: rgba(0, 0, 0, 0.35); display: flex; flex-direction: column; align-items: center; justify-content: center; border-left: 1px solid rgba(255, 255, 255, 0.15); padding: 0 8px; }
    .leader-score-box .lbl { font-size: 10px; font-weight: 700; letter-spacing: .16em; color: rgba(255, 255, 255, 0.6); margin-bottom: 2px; text-transform: uppercase; }
    .leader-score-box .val { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(22px, 3.6vw, 34px); color: #fff; text-align: center; }
    
    .table-wrap { max-width: 960px; margin: 0 auto 50px; padding: 0 20px; position: relative; z-index: 5; }
    .table-head { display: grid; gap: 10px; padding: 0 18px 10px; align-items: center; }
    .table-head span { font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--text-dim); }
    
    .table-wrap.cat-hl .table-head, .table-wrap.cat-hl .row { grid-template-columns: 56px 1fr 100px 110px 130px; }
    .table-wrap.cat-bh .table-head, .table-wrap.cat-bh .row { grid-template-columns: 56px 1fr 170px 130px; }
    
    .row { display: grid; gap: 10px; align-items: center; background: rgba(20,20,22,0.85); backdrop-filter: blur(8px); border: 1px solid var(--line); border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; }
    .row.rank-1.hl { border-color: rgba(255, 45, 59, 0.45); box-shadow: 0 0 0 1px rgba(255, 45, 59, 0.2) inset; }
    .row.rank-1.bh { border-color: rgba(31, 182, 255, 0.45); box-shadow: 0 0 0 1px rgba(31, 182, 255, 0.2) inset; }
    .rank-num { font-family: 'Orbitron', 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 20px; color: var(--text-mid); text-align: center; }
    .row.rank-1.hl .rank-num { color: var(--red-1); }
    .row.rank-1.bh .rank-num { color: var(--water-1); }
    .row.rank-2 .rank-num { color: var(--silver); }
    .row.rank-3 .rank-num { color: var(--bronze); }
    
    .name-cell { min-width: 0; }
    .name-cell .nm { font-weight: 800; font-size: 15.5px; text-transform: uppercase; letter-spacing: .01em; color: var(--text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .row.bh .sub-data span:first-child { background: linear-gradient(90deg, #1fb6ff, #3a5bff); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 800; }
    .name-cell .gap { font-size: 11.5px; color: #22e07a !important; margin-top: 2px; font-weight: 800; text-shadow: 0 0 10px rgba(34, 224, 122, 0.35); }
    
    .data-cell { text-align: center; }
    .data-cell .v { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; color: var(--text-mid); }
    .score-box { border-radius: 9px; padding: 9px 6px; text-align: center; }
    .score-box.hl { background: linear-gradient(135deg, var(--red-1), var(--red-2)); }
    .score-box.bh { background: linear-gradient(135deg, var(--water-1), var(--water-2)); }
    .score-box .v { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 18px; color: #fff; }
    .row.rank-1.hl .score-box { box-shadow: 0 6px 18px rgba(255, 45, 59, 0.4); }
    .row.rank-1.bh .score-box { box-shadow: 0 6px 18px rgba(31, 182, 255, 0.4); }
    
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-dim); background: rgba(20,20,22,0.8); border-radius: 12px; border: 1px dashed var(--line); backdrop-filter: blur(5px); }
    .empty-state p { font-size: 13.5px; font-weight: 600; margin: 0; }
    
    footer { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 20px 20px 100px; color: var(--text-dim); font-size: 11px; position: relative; z-index: 5; letter-spacing: .05em; }
    .footer-credit { font-size: 11.5px; font-weight: 800; letter-spacing: .06em; }
    .footer-credit .name { background: linear-gradient(90deg, #1fb6ff, #3a5bff, #7b5cff); -webkit-background-clip: text; background-clip: text; color: transparent; }
    
    #musicToggle { position: fixed; top: 18px; right: 18px; z-index: 999; width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.18); background: linear-gradient(135deg, rgba(255,45,59,0.85), rgba(255,123,0,0.85)); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.35); transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.2s ease; }
    #musicToggle:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.45); }
    #musicToggle.muted { filter: grayscale(1) brightness(0.75); }
    #musicToggle .bars { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
    #musicToggle .bars span { width: 3px; background: #fff; border-radius: 2px; display: block; animation: musicBar 0.9s ease-in-out infinite; }
    #musicToggle .bars span:nth-child(1) { height: 6px; animation-delay: 0s; }
    #musicToggle .bars span:nth-child(2) { height: 16px; animation-delay: 0.15s; }
    #musicToggle .bars span:nth-child(3) { height: 10px; animation-delay: 0.3s; }
    #musicToggle .bars span:nth-child(4) { height: 14px; animation-delay: 0.45s; }
    #musicToggle.muted .bars span { animation-play-state: paused; height: 4px !important; }
    @keyframes musicBar { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
    
    @media (max-width: 640px) {
      .table-head { display: none; }
      .table-wrap.cat-hl .row { grid-template-columns: 40px 1fr 40px; grid-template-areas: "rank name score" "rank sub score"; row-gap: 4px; }
      .table-wrap.cat-bh .row { grid-template-columns: 40px 1fr 40px; grid-template-areas: "rank name score" "rank sub score"; row-gap: 4px; }
      .rank-num { grid-area: rank; font-size: 17px; }
      .name-cell { grid-area: name; }
      .name-cell .nm { font-size: 14px; }
      .data-cell { display: none; }
      .sub-data { display: flex; gap: 12px; margin-top: 3px; grid-area: sub; }
      .sub-data span { font-size: 11px; color: var(--text-dim); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
      .score-box { grid-area: score; padding: 7px 4px; }
      .score-box .v { font-size: 15px; }
      .leader-card { flex-wrap: wrap; }
      .leader-avatar { width: 80px; min-width: 80px; height: 80px; font-size: 26px; }
      .leader-score-box { width: 100%; min-width: 100%; height: 60px; border-left: none; border-top: 1px solid rgba(255, 255, 255, 0.15); flex-direction: row; gap: 10px; }
      #musicToggle { top: 12px; right: 12px; width: 46px; height: 46px; }
    }
    
    .row:hover { border-color: var(--line); background: rgba(20,20,22,0.85); cursor: default; }
    .row-actions { display: none !important; }
    .fab-stack { display: none !important; }
    .top-actions { display: none !important; }

    /* ===== Intro Screen "JUARA" ===== */
    .intro-screen {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 20px; text-align: center; padding: 40px 24px;
      background: radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,45,59,0.28), transparent 60%), #050506;
      transition: opacity .5s ease, visibility .5s ease;
    }
    .intro-screen.hide { opacity: 0; visibility: hidden; pointer-events: none; }
    .intro-logo { height: 100px; object-fit: contain; filter: drop-shadow(0 0 22px rgba(255,45,59,0.45)); margin-bottom: 4px; }
    .intro-eyebrow { font-size: 13px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--text-mid); }
    .intro-title { margin: 0; font-family: 'MotoGP Display', 'Racing Sans One', sans-serif; letter-spacing: .03em; text-transform: uppercase; font-size: clamp(24px, 5.5vw, 46px); line-height: 1.25; color: #fff; }
    .intro-title .juara {
      display: inline-block; margin-top: 8px; font-size: clamp(34px, 7.5vw, 66px);
      background: linear-gradient(90deg, var(--red-1), #ff7b00, var(--red-1));
      -webkit-background-clip: text; background-clip: text; color: transparent;
      text-shadow: 0 0 30px rgba(255,45,59,0.4);
    }
    .btn-lihat {
      margin-top: 14px; padding: 17px 56px; border-radius: 999px; border: none; cursor: pointer;
      font-size: 15px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #fff;
      background: linear-gradient(135deg, var(--red-1), var(--red-2));
      box-shadow: 0 12px 32px -6px rgba(255, 45, 59, 0.6);
      transition: transform .18s ease, box-shadow .18s ease;
    }
    .btn-lihat:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 16px 36px -6px rgba(255, 45, 59, 0.75); }
    .btn-lihat:active { transform: translateY(0) scale(0.97); }
    @media (max-width: 640px) {
      .intro-logo { height: 76px; }
    }
  </style>
</head>
<body>
  
  <!-- Intro Screen "JUARA" -->
  <div id="introScreen" class="intro-screen">
    <img src="assets/logodamjak5.png" alt="Logo Damkar" class="intro-logo">
    <div class="intro-eyebrow">Jakarta Firefighter Challenge 2026</div>
    <h1 class="intro-title">Pemadam Jakarta Utara<br><span class="juara">"JUARA"</span></h1>
    <button id="lihatBtn" class="btn-lihat" type="button">Lihat</button>
  </div>

  <canvas id="fireCanvas"></canvas>
  <img src="assets/bghutjak_kiri.png" class="bg-kiri" alt="Ornamen Kiri">
  <img src="assets/bghutjak_kanan.png" class="bg-kanan" alt="Ornamen Kanan">
  
  <!-- Audio Music -->
  <audio id="bgMusic" src="assets/News_Background_Music.mp3" loop preload="auto"></audio>
  <button id="musicToggle" class="muted" type="button" aria-label="Musik On/Off" title="Musik On/Off">
    <div class="bars"><span></span><span></span><span></span><span></span></div>
  </button>

  <div id="app">

    <div class="hero">
      <img src="assets/logodamjak5.png" alt="Logo Damkar" class="main-logo">
      <div class="eyebrow">Jakarta Firefighter Challenge 2026</div>
      <h1 id="heroTitle">HOSELAYING</h1>
      <div class="sub">Pemadam Jakarta Utara</div>
    </div>

    <div class="tabs">
      <button class="tab-btn active hl" id="tabHL">Hoselaying</button>
      <button class="tab-btn bh" id="tabBH">Braveheart</button>
    </div>
    <div class="rule-hint" id="ruleHint">Peringkat berdasarkan Nilai Akhir/Score TERTINGGI</div>

    <div class="leader-banner" id="leaderBanner"></div>

    <div class="table-wrap cat-hl" id="tableWrap">
      <div class="table-head" id="headHL">
        <span></span><span>Kontingen</span><span style="text-align:center">Nilai</span><span style="text-align:center">Waktu</span><span style="text-align:center">Score</span>
      </div>
      <div class="table-head" id="headBH" style="display:none">
        <span></span><span>Nama Atlet</span><span style="text-align:center">Kontingen</span><span style="text-align:center">Waktu</span>
      </div>
      <div id="tableBody"></div>
    </div>
    
    <footer>
      <div>Tampilan Read-Only (Terakhir Disimpan)</div>
      <div class="footer-credit">Crafted by <span class="name">Rangga Ganteng</span></div>
    </footer>
  </div>

  <script>
    const data = ${JSON.stringify(data)};
    let activeCat = '${activeCat}';

    const canvas = document.getElementById('fireCanvas');
    const ctx = canvas.getContext('2d');
    let sparks = [];
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeCanvas); resizeCanvas();
    class Spark {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 4 + 1;
            this.speedY = Math.random() * -3 - 1;
            this.speedX = Math.random() * 2 - 1;
            this.life = 1;
            const colors = ['#ffc93c', '#ff2d3b', '#e08a4b', '#ff7b00'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.size > 0.1) this.size -= 0.03;
            this.life -= 0.005;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (sparks.length < 150) sparks.push(new Spark());
        for (let i = 0; i < sparks.length; i++) {
            sparks[i].update(); sparks[i].draw();
            if (sparks[i].life <= 0 || sparks[i].size <= 0.1) { sparks.splice(i, 1); i--; }
        }
        requestAnimationFrame(animate);
    }
    animate();

    const leaderBanner = document.getElementById('leaderBanner');
    const tableBody = document.getElementById('tableBody');
    const tableWrap = document.getElementById('tableWrap');
    const headHL = document.getElementById('headHL');
    const headBH = document.getElementById('headBH');
    const heroTitle = document.getElementById('heroTitle');
    const ruleHint = document.getElementById('ruleHint');
    const tabHL = document.getElementById('tabHL');
    const tabBH = document.getElementById('tabBH');

    const CAT_INFO = {
      Hoselaying: { cls:'hl', rule:'Peringkat berdasarkan Nilai Akhir/Score TERTINGGI', order:'desc' },
      Braveheart: { cls:'bh', rule:'Peringkat individu atlet berdasarkan WAKTU TERCEPAT (terendah)', order:'asc' }
    };
    function fmtNum(n){ const num = Number(n)||0; return num % 1 === 0 ? num.toString() : num.toFixed(2); }
    function escapeHtml(str){ return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function initials(name){ return String(name).trim().split(/\\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
    function photoSlug(name){ return String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
    
    function getSorted(cat){
      const rows = data.filter(d=>d.kategori === cat);
      const order = CAT_INFO[cat].order;
      return [...rows].sort((a,b)=> order === 'asc' ? (a.score-b.score) : (b.score-a.score));
    }
    
    function render(){
      heroTitle.textContent = activeCat.toUpperCase();
      heroTitle.classList.toggle('braveheart', activeCat === 'Braveheart');
      ruleHint.textContent = CAT_INFO[activeCat].rule;
      tabHL.classList.toggle('active', activeCat==='Hoselaying');
      tabBH.classList.toggle('active', activeCat==='Braveheart');
      tableWrap.classList.toggle('cat-hl', activeCat==='Hoselaying');
      tableWrap.classList.toggle('cat-bh', activeCat==='Braveheart');
      headHL.style.display = activeCat==='Hoselaying' ? 'grid' : 'none';
      headBH.style.display = activeCat==='Braveheart' ? 'grid' : 'none';

      const info = CAT_INFO[activeCat];
      const sorted = getSorted(activeCat);
      const leaderScore = sorted.length ? sorted[0].score : 0;
      const isBH = activeCat === 'Braveheart';

      if(sorted.length === 0){
        leaderBanner.innerHTML = '<div class="leader-empty">Belum ada data untuk kategori ' + activeCat + '.</div>';
        tableBody.innerHTML = '<div class="empty-state"><p>Tabel standing masih kosong</p></div>';
        return;
      }

      const l = sorted[0];
      const leadName = isBH ? l.namaAtlet : l.kontingen;
      const leadMeta = isBH ? ('Kontingen ' + escapeHtml(l.kontingen)) : ('Nilai ' + fmtNum(l.nilai) + ' &middot; Waktu ' + (l.waktu || '—'));
      leaderBanner.innerHTML = \`
        <div class="leader-card \${info.cls}">
          <div class="leader-avatar">
            <img src="assets/\${photoSlug(leadName)}.png" alt="\${escapeHtml(leadName)}" class="leader-photo" onerror="this.remove(); this.parentElement.classList.add('no-photo'); this.parentElement.textContent='\${initials(leadName)}';">
          </div>
          <div class="leader-mid">
            <div class="leader-tag"><span class="dot"></span>Leader</div>
            <div class="leader-name">\${escapeHtml(leadName)}</div>
            <div class="leader-meta">\${leadMeta}</div>
          </div>
          <div class="leader-score-box">
            <div class="lbl">\${isBH ? 'Waktu' : 'Score'}</div>
            <div class="val">\${isBH ? (l.waktu || fmtNum(l.score)) : fmtNum(l.score)}</div>
          </div>
        </div>\`;

      tableBody.innerHTML = sorted.map((row, i)=>{
        const rank = i+1;
        let gapHtml = '';
        if(rank > 1){
          const diff = info.order === 'asc' ? (row.score - leaderScore) : (leaderScore - row.score);
          gapHtml = '<div class="gap">' + (info.order === 'asc' ? '+' : '-') + fmtNum(Math.abs(diff)) + '</div>';
        }
        if(isBH){
          return \`
          <div class="row rank-\${rank} bh">
            <div class="rank-num">\${rank}</div>
            <div class="name-cell">
              <div class="nm">\${escapeHtml(row.namaAtlet)}</div>\${gapHtml}
              <div class="sub-data"><span>\${escapeHtml(row.kontingen)}</span></div>
            </div>
            <div class="data-cell"><div class="v">\${escapeHtml(row.kontingen)}</div></div>
            <div class="score-box bh"><div class="v">\${row.waktu || fmtNum(row.score)}</div></div>
          </div>\`;
        }
        return \`
        <div class="row rank-\${rank} hl">
          <div class="rank-num">\${rank}</div>
          <div class="name-cell">
            <div class="nm">\${escapeHtml(row.kontingen)}</div>\${gapHtml}
            <div class="sub-data"><span>Nilai \${fmtNum(row.nilai)}</span></div>
          </div>
          <div class="data-cell"><div class="v">\${fmtNum(row.nilai)}</div></div>
          <div class="data-cell"><div class="v">\${row.waktu || '—'}</div></div>
          <div class="score-box hl"><div class="v">\${fmtNum(row.score)}</div></div>
        </div>\`;
      }).join('');
    }

    tabHL.addEventListener('click', ()=> { activeCat = 'Hoselaying'; render(); });
    tabBH.addEventListener('click', ()=> { activeCat = 'Braveheart'; render(); });
    render();

    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let musicOn = true; 

    function setMusicState(on){
      musicOn = on;
      musicToggle.classList.toggle('muted', !on);
      if(on){
        bgMusic.play().catch(()=>{ });
      } else {
        bgMusic.pause();
      }
    }

    musicToggle.addEventListener('click', ()=> setMusicState(!musicOn));
    musicToggle.classList.remove('muted');

    bgMusic.play().catch(()=>{
      const unlock = () => {
        if(musicOn){ bgMusic.play().catch(()=>{}); }
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { once:true });
      window.addEventListener('touchstart', unlock, { once:true });
      window.addEventListener('keydown', unlock, { once:true });
    });

    const introScreen = document.getElementById('introScreen');
    const lihatBtn = document.getElementById('lihatBtn');
    if(lihatBtn){
      lihatBtn.addEventListener('click', function(){
        introScreen.classList.add('hide');
        setMusicState(true);
      });
    }
  <\/script>
</body>
</html>`;

    // Trigger download
    const blob = new Blob([exportHTMLString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `JFFC_Standing_Viewer.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ==========================================
  // 4. LOGIKA BACKGROUND MUSIC TOGGLE
  // ==========================================
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let musicOn = true; 

  function setMusicState(on){
    musicOn = on;
    musicToggle.classList.toggle('muted', !on);
    if(on){
      bgMusic.play().catch(()=>{ /* Blokir autoplay ditangani di bawah */ });
    } else {
      bgMusic.pause();
    }
  }

  musicToggle.addEventListener('click', ()=> setMusicState(!musicOn));
  musicToggle.classList.remove('muted');

  bgMusic.play().catch(()=>{
    const unlock = () => {
      if(musicOn){ bgMusic.play().catch(()=>{}); }
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock, { once:true });
    window.addEventListener('touchstart', unlock, { once:true });
    window.addEventListener('keydown', unlock, { once:true });
  });

  // ===================== INIT =====================
  load();
  setFormCat(activeCat);
  render();
})();
