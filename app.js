// ═══════════════════════════════════════════════════
// HOUSTON CARPET CLEANING (HCC) — APP.JS
// Netlify-ready booking web application
// ═══════════════════════════════════════════════════

// ─── DATA ─────────────────────────────────────────

const SERVICES = [
  {
    id: 'deep',
    name: 'Deep Extraction Clean',
    desc: 'Truck-mounted hot-water extraction lifts embedded dirt, allergens, and bacteria for a like-new finish.',
    price: 159,
    unit: 'per room',
    icon: '◈'
  },
  {
    id: 'steam',
    name: 'Steam Sanitization',
    desc: 'Chemical-free high-temp steam kills 99.9% of bacteria and dust mites. Great for allergy-prone homes.',
    price: 139,
    unit: 'per room',
    icon: '◉'
  },
  {
    id: 'stain',
    name: 'Stain & Spot Treatment',
    desc: 'Precision removal of wine, coffee, ink, food, and pet stains with enzyme-based solutions.',
    price: 99,
    unit: 'per area',
    icon: '◍'
  },
  {
    id: 'pet',
    name: 'Pet Odor Elimination',
    desc: 'Sub-surface enzyme treatment neutralizes urine, dander, and organic odors at the pad level.',
    price: 129,
    unit: 'per room',
    icon: '◎'
  },
  {
    id: 'upholstery',
    name: 'Upholstery Cleaning',
    desc: 'Safe, thorough cleaning for sofas, sectionals, accent chairs, and fabric headboards.',
    price: 109,
    unit: 'per piece',
    icon: '▣'
  },
  {
    id: 'tile',
    name: 'Tile & Grout Restoration',
    desc: 'High-pressure cleaning plus sealant application brings tile and grout back to showroom condition.',
    price: 179,
    unit: 'per area',
    icon: '⬡'
  }
];

const ADDONS = [
  { id: 'protector', name: 'Carpet Protector', desc: 'Scotchgard™ fiber shield', price: 49 },
  { id: 'deodorize', name: 'Whole-Room Deodorizer', desc: 'Long-lasting fresh scent', price: 35 },
  { id: 'speed-dry', name: 'Speed Dry Service', desc: '2-hour dry with industrial fans', price: 29 },
  { id: 'antimicrobial', name: 'Antimicrobial Treatment', desc: 'Hospital-grade disinfectant', price: 59 },
  { id: 'baseboard', name: 'Baseboard Cleaning', desc: 'Hand-wiped in every room', price: 39 },
  { id: 'furniture', name: 'Furniture Moving', desc: 'We move & replace for you', price: 45 }
];

const TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM'
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const WKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


// ─── STATE ────────────────────────────────────────

const selSvc = new Set();
const selAddon = new Set();
let selDate = null;
let selTime = null;
let calM = new Date().getMonth();
let calY = new Date().getFullYear();


// ═══════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════

function drawServices() {
  const el = document.getElementById('svcGrid');
  el.innerHTML = SERVICES.map(s => {
    const on = selSvc.has(s.id);
    return `
      <div class="svc-card ${on ? 'on' : ''} rv" onclick="togSvc('${s.id}')">
        <div class="svc-header">
          <div class="svc-ico">${s.icon}</div>
          <div class="svc-sel">${on ? '✓' : ''}</div>
        </div>
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
        <div class="svc-price">$${s.price}<small> ${s.unit}</small></div>
      </div>`;
  }).join('');
  revealAll();
}

function drawAddons() {
  const el = document.getElementById('addonGrid');
  el.innerHTML = ADDONS.map(a => {
    const on = selAddon.has(a.id);
    return `
      <div class="ao-card ${on ? 'on' : ''} rv" onclick="togAddon('${a.id}')">
        <div class="ao-box">${on ? '✓' : ''}</div>
        <div class="ao-txt">
          <h3>${a.name}</h3>
          <p>${a.desc}</p>
          <span class="ao-price">+$${a.price}</span>
        </div>
      </div>`;
  }).join('');
  revealAll();
}

function drawCal() {
  document.getElementById('calTitle').textContent = `${MONTHS[calM]} ${calY}`;

  const wkEl = document.getElementById('calWk');
  wkEl.innerHTML = WKDAYS.map(d => `<span>${d}</span>`).join('');

  const grid = document.getElementById('calDays');
  const first = new Date(calY, calM, 1).getDay();
  const days = new Date(calY, calM + 1, 0).getDate();
  const today = new Date();
  const todayFlat = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let h = '';
  for (let i = 0; i < first; i++) h += '<button class="day nil"></button>';

  for (let d = 1; d <= days; d++) {
    const dt = new Date(calY, calM, d);
    const past = dt < todayFlat;
    const sun = dt.getDay() === 0;
    const isNow = dt.getTime() === todayFlat.getTime();
    const isSel = selDate &&
      d === selDate.getDate() &&
      calM === selDate.getMonth() &&
      calY === selDate.getFullYear();

    let c = 'day';
    if (past || sun) c += ' off';
    if (isNow) c += ' now';
    if (isSel) c += ' sel';

    if (past || sun) {
      h += `<button class="${c}" disabled>${d}</button>`;
    } else {
      h += `<button class="${c}" onclick="pickDay(${d})">${d}</button>`;
    }
  }
  grid.innerHTML = h;
}

function drawTimes() {
  const el = document.getElementById('timeGrid');
  el.innerHTML = TIMES.map(t =>
    `<button class="t-btn ${selTime === t ? 'sel' : ''}" onclick="pickTime('${t}')">${t}</button>`
  ).join('');
}

function drawSummary() {
  const el = document.getElementById('sideBody');
  const svcs = SERVICES.filter(s => selSvc.has(s.id));
  const adds = ADDONS.filter(a => selAddon.has(a.id));

  if (!svcs.length) {
    el.innerHTML = '<p class="side-empty">Select a service to get started</p>';
    return;
  }

  const svcTot = svcs.reduce((a, s) => a + s.price, 0);
  const addTot = adds.reduce((a, x) => a + x.price, 0);
  const total = svcTot + addTot;
  const ready = selDate && selTime;

  let h = '<div class="sg-label">Services</div>';
  svcs.forEach(s => {
    h += `<div class="s-row"><span class="s-lbl">${s.name}</span><span class="s-val">$${s.price}</span></div>`;
  });

  if (adds.length) {
    h += '<div class="sg-label">Add-ons</div>';
    adds.forEach(a => {
      h += `<div class="s-row"><span class="s-lbl">${a.name}</span><span class="s-val">+$${a.price}</span></div>`;
    });
  }

  if (selDate) {
    const ds = selDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    h += '<div class="sg-label">Appointment</div>';
    h += `<div class="s-row"><span class="s-lbl">Date</span><span class="s-val">${ds}</span></div>`;
  }
  if (selTime) {
    h += `<div class="s-row"><span class="s-lbl">Time</span><span class="s-val">${selTime}</span></div>`;
  }

  h += `
    <div class="s-line"></div>
    <div class="s-total">
      <span class="s-lbl">Estimated Total</span>
      <span class="s-val">$${total}</span>
    </div>
    <button class="btn btn-fill s-book-btn" onclick="submitBooking()" ${ready ? '' : 'disabled'}>
      Confirm Booking
    </button>
  `;
  el.innerHTML = h;
}


// ═══════════════════════════════════════════════════
// INTERACTIONS
// ═══════════════════════════════════════════════════

function togSvc(id) {
  selSvc.has(id) ? selSvc.delete(id) : selSvc.add(id);
  drawServices();
  drawSummary();
}

function togAddon(id) {
  selAddon.has(id) ? selAddon.delete(id) : selAddon.add(id);
  drawAddons();
  drawSummary();
}

function pickDay(d) {
  selDate = new Date(calY, calM, d);
  drawCal();
  drawSummary();
}

function pickTime(t) {
  selTime = t;
  drawTimes();
  drawSummary();
}

function calPrev() {
  calM--;
  if (calM < 0) { calM = 11; calY--; }
  drawCal();
}

function calNext() {
  calM++;
  if (calM > 11) { calM = 0; calY++; }
  drawCal();
}


// ═══════════════════════════════════════════════════
// SUBMIT BOOKING
// ═══════════════════════════════════════════════════

function submitBooking() {
  // Validate selections
  if (!selSvc.size) return toast('Please select at least one service.', 'err');
  if (!selDate) return toast('Please choose a date.', 'err');
  if (!selTime) return toast('Please choose a time.', 'err');

  // Validate form
  const first = document.getElementById('inFirst').value.trim();
  const last  = document.getElementById('inLast').value.trim();
  const phone = document.getElementById('inPhone').value.trim();
  const email = document.getElementById('inEmail').value.trim();
  const addr  = document.getElementById('inAddr').value.trim();
  const notes = document.getElementById('inNotes').value.trim();

  if (!first || !last) return toast('Please enter your full name.', 'err');
  if (!phone) return toast('Please enter your phone number.', 'err');
  if (!email || !email.includes('@')) return toast('Please enter a valid email.', 'err');
  if (!addr) return toast('Please enter your service address.', 'err');

  const svcs = SERVICES.filter(s => selSvc.has(s.id));
  const adds = ADDONS.filter(a => selAddon.has(a.id));
  const total = svcs.reduce((a, s) => a + s.price, 0) + adds.reduce((a, x) => a + x.price, 0);

  const dateStr = selDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // Build booking record
  const booking = {
    id: Date.now(),
    customer: { firstName: first, lastName: last, phone, email, address: addr },
    services: svcs.map(s => s.name),
    addons: adds.map(a => a.name),
    date: dateStr,
    time: selTime,
    total,
    notes,
    createdAt: new Date().toISOString()
  };

  // Persist to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('hcc_bookings') || '[]');
    existing.push(booking);
    localStorage.setItem('hcc_bookings', JSON.stringify(existing));
  } catch (e) { /* silent */ }

  console.log('📋 HCC Booking:', booking);

  // Show confirmation modal
  document.getElementById('modalMsg').textContent =
    `Thank you, ${first}! Your HCC cleaning has been scheduled. We'll send confirmation to ${email} within the hour.`;

  let receipt = '';
  receipt += `<div class="mr-row"><span class="mr-l">Services</span><span class="mr-v">${svcs.map(s => s.name).join(', ')}</span></div>`;
  if (adds.length) {
    receipt += `<div class="mr-row"><span class="mr-l">Add-ons</span><span class="mr-v">${adds.map(a => a.name).join(', ')}</span></div>`;
  }
  receipt += `<div class="mr-row"><span class="mr-l">Date</span><span class="mr-v">${dateStr}</span></div>`;
  receipt += `<div class="mr-row"><span class="mr-l">Time</span><span class="mr-v">${selTime}</span></div>`;
  receipt += `<div class="mr-row"><span class="mr-l">Address</span><span class="mr-v">${addr}</span></div>`;
  receipt += `<div class="mr-row mr-total"><span class="mr-l">Total</span><span class="mr-v">$${total}</span></div>`;

  document.getElementById('modalReceipt').innerHTML = receipt;
  document.getElementById('overlay').classList.add('open');

  // Reset everything
  selSvc.clear();
  selAddon.clear();
  selDate = null;
  selTime = null;
  document.getElementById('inFirst').value = '';
  document.getElementById('inLast').value = '';
  document.getElementById('inPhone').value = '';
  document.getElementById('inEmail').value = '';
  document.getElementById('inAddr').value = '';
  document.getElementById('inNotes').value = '';

  drawServices();
  drawAddons();
  drawCal();
  drawTimes();
  drawSummary();
}

function dismissModal() {
  document.getElementById('overlay').classList.remove('open');
}


// ═══════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════

function toast(msg, type = 'ok') {
  const el = document.getElementById('toastBar');
  el.textContent = msg;
  el.className = `toast-bar ${type}`;
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.classList.remove('show'), 3400);
}

function toggleBurger() {
  document.getElementById('mainNav').classList.toggle('open');
}


// ═══════════════════════════════════════════════════
// SCROLL & REVEAL
// ═══════════════════════════════════════════════════

function onScroll() {
  const hdr = document.getElementById('siteHeader');
  hdr.classList.toggle('pinned', window.scrollY > 50);
}

function revealAll() {
  const els = document.querySelectorAll('.rv:not(.vis)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('vis'), i * 50);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}


// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════

function init() {
  drawServices();
  drawAddons();
  drawCal();
  drawTimes();
  drawSummary();

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  revealAll();

  // Burger
  document.getElementById('burger').addEventListener('click', toggleBurger);

  // Close nav on link click (mobile)
  document.querySelectorAll('.main-nav a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('mainNav').classList.remove('open');
    });
  });

  // Close modal on backdrop
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) dismissModal();
  });

  // Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dismissModal();
  });

  console.log('✦ HCC App initialized — ready for bookings');
}

init();
