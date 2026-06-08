let running = false, ivId = null, upId = null;
let cycles = 0, startTs = null;

function ts() {
  return new Date().toTimeString().slice(0, 8);
}

function rnd(a, b) {
  return Math.round((Math.random() * (b - a) + a) * 100) / 100;
}

function log(type, msg) {
  const term = document.getElementById('term');
  const cl   = document.getElementById('cursorLine');
  if (cl) cl.remove();

  const d = document.createElement('div');
  d.className = 'll';
  const map = {
    ok: ['lok', '[OK]'],
    sp: ['lsp', '[⚠ SPIKE]'],
    er: ['ler', '[ERR]'],
    sy: ['lsy', '[SYS]'],
    m:  ['lm',  ''],
  };
  const [cls, pfx] = map[type] || map.m;
  d.innerHTML = `<span class="lt">${ts()}</span><span class="${cls}">${pfx}&nbsp;</span><span class="lm">${msg}</span>`;
  term.appendChild(d);

  const cur = document.createElement('div');
  cur.id = 'cursorLine';
  cur.className = 'll';
  cur.innerHTML = `<span class="lt">▶</span><span class="lm"><span class="cursor"></span></span>`;
  term.appendChild(cur);
  term.scrollTop = term.scrollHeight;
}

function clearTerm() {
  document.getElementById('term').innerHTML =
    `<div class="ll" id="cursorLine"><span class="lt">▶</span><span class="lm"><span class="cursor"></span></span></div>`;
}

async function send() {
  cycles++;
  document.getElementById('cycleEl').textContent = cycles;

  const spikeEvery = parseInt(document.getElementById('spikeEvery').value) || 1;
  const spikeMin   = parseFloat(document.getElementById('spikeMin').value) || 29;
  const tMin = parseFloat(document.getElementById('tMin').value) || 18;
  const tMax = parseFloat(document.getElementById('tMax').value) || 26;
  const hMin = parseFloat(document.getElementById('hMin').value) || 40;
  const hMax = parseFloat(document.getElementById('hMax').value) || 75;
  const isSpike = (cycles % spikeEvery === 0);

  const payload = {
    DeviceId:    document.getElementById('deviceId').value,
    Temperatura: isSpike ? rnd(spikeMin, spikeMin + 6) : rnd(tMin, tMax),
    Wilgotnosc:  rnd(hMin, hMax),
  };

  const info = `${payload.DeviceId} | temp=${payload.Temperatura}°C  hum=${payload.Wilgotnosc}%`;
  if (isSpike) log('sp', info);
  else         log('m',  info);

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) log('ok', `HTTP ${res.status}`);
    else        log('er', `HTTP ${res.status} — sprawdź klucz lub URL`);
  } catch (e) {
    log('er', `Błąd: ${e.message}`);
  }
}

function toggle() {
  if (!running) {
    running = true;
    cycles  = 0;
    startTs = Date.now();
    const sec = parseInt(document.getElementById('interval').value) || 5;
    document.getElementById('spikeDisp').textContent = document.getElementById('spikeEvery').value;

    document.getElementById('mainBtn').classList.add('running');
    document.getElementById('btnLabel').textContent  = 'DZIAŁA';
    document.getElementById('btnLabel').className    = 'btn-label running';
    document.getElementById('ctrlPanel').classList.add('active');
    document.getElementById('statusPill').classList.add('running');
    document.getElementById('statusTxt').textContent = 'RUNNING';

    log('sy', `Start | device: ${document.getElementById('deviceId').value} | co ${sec}s`);
    send();
    ivId = setInterval(send, sec * 1000);

    upId = setInterval(() => {
      const s = Math.floor((Date.now() - startTs) / 1000);
      document.getElementById('uptimeEl').textContent = [
        Math.floor(s / 3600),
        Math.floor(s % 3600 / 60),
        s % 60,
      ].map(n => String(n).padStart(2, '0')).join(':');
    }, 1000);

  } else {
    running = false;
    clearInterval(ivId);
    clearInterval(upId);

    document.getElementById('mainBtn').classList.remove('running');
    document.getElementById('btnLabel').textContent  = 'ZATRZYMANY';
    document.getElementById('btnLabel').className    = 'btn-label';
    document.getElementById('ctrlPanel').classList.remove('active');
    document.getElementById('statusPill').classList.remove('running');
    document.getElementById('statusTxt').textContent = 'IDLE';

    log('sy', `Zatrzymano po ${cycles} cyklach.`);
  }
}