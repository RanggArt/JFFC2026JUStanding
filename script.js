// ==========================================
// 1. LOGIKA ANIMASI API KANVAS
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
    if (sparks.length < 150) {
        sparks.push(new Spark());
    }
    for (let i = 0; i < sparks.length; i++) {
        sparks[i].update();
        sparks[i].draw();
        if (sparks[i].life <= 0 || sparks[i].size <= 0.1) {
            sparks.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}
animate();

// ==========================================
// 2. LOGIKA APLIKASI KLASEMEN JFFC
// ==========================================
(function(){
  const STORAGE_KEY = 'jffc_standing_kontingen_v3';
  let data = [];
  let editing = null;
  let activeCat = 'Hoselaying';

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
    Hoselaying: { cls:'hl', rule:'Peringkat berdasarkan Nilai Akhir/Score TERTINGGI', order:'desc', hint:'Nilai Akhir/Score TERTINGGI = peringkat 1.' },
    Braveheart: { cls:'bh', rule:'Peringkat individu atlet berdasarkan WAKTU TERCEPAT (terendah)', order:'asc', hint:'Waktu TERCEPAT (terendah) = peringkat 1.' }
  };

  function load(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); data = raw ? JSON.parse(raw) : []; }
    catch(e){ data = []; }
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
      leaderBanner.innerHTML = `<div class="leader-empty">Belum ada data untuk kategori ${activeCat}.</div>`;
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
            <div class="sub-data"><span>${escapeHtml(row.kontingen)}</span><span>${row.waktu || '—'}</span></div>
          </div>
          <div class="data-cell"><div class="v">${escapeHtml(row.kontingen)}</div></div>
          <div class="score-box bh"><div class="v">${row.waktu || fmtNum(row.score)}</div></div>
          <div class="row-actions">
            <button class="del-btn" data-del-id="${row.id}" title="Hapus">Hapus</button>
          </div>
        </div>`;
      }
      return `
      <div class="row rank-${rank} hl" ${rowKey}>
        <div class="rank-num">${rank}</div>
        <div class="name-cell">
          <div class="nm">${escapeHtml(row.kontingen)}</div>
          ${gapHtml}
          <div class="sub-data"><span>Nilai ${fmtNum(row.nilai)}</span><span>${row.waktu || '—'}</span></div>
        </div>
        <div class="data-cell"><div class="v">${fmtNum(row.nilai)}</div></div>
        <div class="data-cell"><div class="v">${row.waktu || '—'}</div></div>
        <div class="score-box hl"><div class="v">${fmtNum(row.score)}</div></div>
        <div class="row-actions">
          <button class="del-btn" data-del-id="${row.id}" title="Hapus">Hapus</button>
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
      const rowObj = { id: editing ? editing.id : Date.now().toString(), kategori, kontingen, namaAtlet, waktu, score };
      if(idx >= 0) data[idx] = rowObj; else data.push(rowObj);
    } else {
      const nilai = parseFloat(inpNilai.value) || 0;
      const waktu = inpWaktuHL.value.trim();
      const score = parseFloat(inpScore.value) || 0;
      
      let idx = -1;
      if (editing) idx = data.findIndex(d => d.id === editing.id);
      else idx = data.findIndex(d => d.kategori === 'Hoselaying' && d.kontingen === kontingen);
      
      const rowObj = { id: idx >= 0 ? data[idx].id : Date.now().toString(), kategori, kontingen, nilai, waktu, score };
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
    // Template ini membawa data kamu saat ini namun tanpa tombol aksi (read-only)
    const exportHTMLString = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JFFC 2026 — Standing Kontingen (Read Only)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    /* Menghilangkan tombol agar menjadi view-only */
    .row:hover { border-color: var(--line); background: rgba(20,20,22,0.85); cursor: default; }
    .row-actions { display: none !important; }
    .fab-stack { display: none !important; }
  </style>
</head>
<body>
  <canvas id="fireCanvas"></canvas>
  <img src="assets/bghutjak_kiri.png" class="bg-kiri" alt="Ornamen Kiri">
  <img src="assets/bghutjak_kanan.png" class="bg-kanan" alt="Ornamen Kanan">
  
  <div id="app">
    <header>
      <div class="brand">
        <div class="mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c1 1 2 2 2 4a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 1 2 1 3 1-1 3-3 3-7Z"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="eyebrow">Sudinkar Jakarta Utara · 2026</div>
          <div class="title">JAKARTA FIREFIGHTER CHALLENGE</div>
        </div>
      </div>
    </header>

    <div class="hero">
      <div class="eyebrow">Jakarta Firefighter Challenge 2026</div>
      <h1 id="heroTitle">HOSELAYING</h1>
      <div class="sub">Pemadam Jakarta Utara</div>
    </div>

    <div class="tabs">
      <button class="tab-btn active hl" id="tabHL">Hoselaying</button>
      <button class="tab-btn" id="tabBH">Braveheart</button>
    </div>
    <div class="rule-hint" id="ruleHint">Peringkat berdasarkan Nilai Akhir/Score TERTINGGI</div>

    <div class="leader-banner" id="leaderBanner"></div>

    <div class="table-wrap cat-hl" id="tableWrap">
      <div class="table-head" id="headHL">
        <span></span><span>Kontingen</span><span style="text-align:center">Nilai</span><span style="text-align:center">Waktu</span><span style="text-align:center">Score</span><span></span>
      </div>
      <div class="table-head" id="headBH" style="display:none">
        <span></span><span>Nama Atlet</span><span style="text-align:center">Kontingen</span><span style="text-align:center">Waktu</span><span></span>
      </div>
      <div id="tableBody"></div>
    </div>
    <footer>Tampilan Read-Only (Terakhir Disimpan)</footer>
  </div>

  <script>
    // Data klasemen disuntikkan langsung di file ekspor ini
    const data = ${JSON.stringify(data)};
    let activeCat = '${activeCat}';

    // Animasi Api
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

    // Fungsi Render Tabel Read-Only
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
          <div class="leader-avatar">\${initials(leadName)}</div>
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
              <div class="sub-data"><span>\${escapeHtml(row.kontingen)}</span><span>\${row.waktu || '—'}</span></div>
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
            <div class="sub-data"><span>Nilai \${fmtNum(row.nilai)}</span><span>\${row.waktu || '—'}</span></div>
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
  <\/script>
</body>
</html>`;

    // 2. Buat file Blob dari String Template di atas lalu otomatis download
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

  load();
  setFormCat('Hoselaying');
  render();
})();