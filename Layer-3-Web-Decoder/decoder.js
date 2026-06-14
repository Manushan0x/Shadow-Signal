// ─────────────────────────────────────────────────────────────
//  Spy Agent — WAV Morse Decoder  (decoder.js)
//  Matched to SpyAgent Java project:
//    AudioGenerator: FREQ=800Hz, DOT=90ms, DASH=250ms, GAP=80ms
//    AudioMixer:     signal×2 + noise÷2
//    AmbientMusic:   220+330+110 Hz sine + Gaussian noise
//  Algorithm: Goertzel DFT (20ms windows) → run-length → morse
// ─────────────────────────────────────────────────────────────

const REVERSE_MORSE = {
  '.-':'A',    '-...':'B',  '-.-.':'C',  '-..':'D',
  '.':'E',     '..-.':'F',  '--.':'G',   '....':'H',
  '..':'I',    '.---':'J',  '-.-':'K',   '.-..':'L',
  '--':'M',    '-.':'N',    '---':'O',   '.--.':'P',
  '--.-':'Q',  '.-.':'R',   '...':'S',   '-':'T',
  '..-':'U',   '...-':'V',  '.--':'W',   '-..-':'X',
  '-.--':'Y',  '--..':'Z',
  '-----':'0', '.----':'1', '..---':'2', '...--':'3',
  '....-':'4', '.....':'5', '-....':'6', '--...':'7',
  '---..':'8', '----.':'9',
  '.-.-.-':'.','--..--':',','..--..':'?','-.-.--':'!','-..-.':'/'
};

// Known constants from AudioGenerator.java
const MORSE_FREQ = 800;
const DOT_MS     = 90;
const DASH_MS    = 250;
const GAP_MS     = 80;

// ── DOM refs ──────────────────────────────────────────────────
const dropzone     = document.getElementById('dropzone');
const fileInput    = document.getElementById('fileInput');
const filenameEl   = document.getElementById('filename');
const statusEl     = document.getElementById('status');
const progressWrap = document.getElementById('progressWrap');
const progressBar  = document.getElementById('progressBar');
const morseDisplay = document.getElementById('morseDisplay');
const outputText   = document.getElementById('outputText');

// ── Event wiring ─────────────────────────────────────────────
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) processFile(e.target.files[0]);
});
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.name.toLowerCase().endsWith('.wav')) processFile(file);
  else setStatus('INVALID FILE — MUST BE A .wav FILE', 'err');
});

// ── Helpers ───────────────────────────────────────────────────
function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className   = 'status-line ' + type;
}
function setProgress(pct) {
  progressWrap.style.display = 'block';
  progressBar.style.width    = pct + '%';
  if (pct >= 100) setTimeout(() => { progressWrap.style.display = 'none'; }, 900);
}
function tick() { return new Promise(r => setTimeout(r, 12)); }

// ── Main pipeline ─────────────────────────────────────────────
async function processFile(file) {
  filenameEl.textContent = '[ ' + file.name + ' ]';
  setStatus('READING FILE...');
  setProgress(5);

  let samples, sampleRate;
  try {
    const buf = await file.arrayBuffer();
    setProgress(15);
    setStatus('PARSING WAV HEADERS...');
    const parsed = parseWAV(buf);
    samples    = parsed.samples;
    sampleRate = parsed.sampleRate;
  } catch (err) {
    setStatus('WAV PARSE ERROR: ' + err.message, 'err');
    return;
  }

  setProgress(28);
  setStatus('DRAWING RAW WAVEFORM...');
  drawWave('rawCanvas', samples, '#006633');
  await tick();

  setStatus('SCANNING 800Hz GOERTZEL POWER...');
  const power = goertzelScan(samples, sampleRate);
  setProgress(46);
  drawPowerWave('filtCanvas', power, '#00aa55');
  await tick();

  setStatus('DETECTING MORSE ENVELOPE...');
  setProgress(62);
  drawEnvelope(power);
  await tick();

  setStatus('EXTRACTING MORSE SYMBOLS...');
  const morse = envelopeToMorse(power);
  setProgress(78);
  morseDisplay.innerHTML = '';
  morseDisplay.textContent = morse || '(no morse pattern detected)';
  await tick();

  setStatus('DECODING MORSE → TEXT...');
  const text = decodeMorse(morse);
  setProgress(100);

  if (text && text.replace(/[? ]/g, '').length > 0) {
    revealText(text);
    updateStats(text, morse);
    setStatus('TRANSMISSION DECRYPTED SUCCESSFULLY', 'ok');
  } else {
    setStatus('DECODING FAILED — SIGNAL TOO NOISY OR WRONG FILE', 'err');
    outputText.innerHTML = '<span class="dim2">???</span>';
  }
}

// ─────────────────────────────────────────────────────────────
//  WAV PARSER
//  Java WavWriter writes 8-bit PCM using signed bytes cast to
//  unsigned — so WAV 8-bit samples use standard unsigned 0-255,
//  centre = 128.
// ─────────────────────────────────────────────────────────────
function parseWAV(buf) {
  const view = new DataView(buf);
  const riff = String.fromCharCode(view.getUint8(0),view.getUint8(1),view.getUint8(2),view.getUint8(3));
  if (riff !== 'RIFF') throw new Error('Not a RIFF/WAV file');

  const sampleRate    = view.getUint32(24, true);
  const numChannels   = view.getUint16(22, true);
  const bitsPerSample = view.getUint16(34, true);

  // Scan chunks to find 'data'
  let offset = 12, dataOffset = -1, dataSize = 0;
  while (offset < buf.byteLength - 8) {
    const id   = String.fromCharCode(view.getUint8(offset),view.getUint8(offset+1),view.getUint8(offset+2),view.getUint8(offset+3));
    const size = view.getUint32(offset + 4, true);
    if (id === 'data') { dataOffset = offset + 8; dataSize = size; break; }
    offset += 8 + (size % 2 === 0 ? size : size + 1);
    if (size === 0) break;
  }
  if (dataOffset < 0) throw new Error('No data chunk found in WAV');

  const bytesPerSample = bitsPerSample / 8;
  const numSamples     = Math.floor(dataSize / (bytesPerSample * numChannels));
  const samples        = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const pos = dataOffset + i * bytesPerSample * numChannels;
    let val;
    if (bitsPerSample === 8) {
      // WAV 8-bit is unsigned (0-255), centre = 128
      val = (view.getUint8(pos) - 128) / 128.0;
    } else if (bitsPerSample === 16) {
      val = view.getInt16(pos, true) / 32768.0;
    } else {
      val = (view.getUint8(pos) - 128) / 128.0;
    }
    samples[i] = val;
  }
  return { samples, sampleRate, bitsPerSample, numChannels };
}

// ─────────────────────────────────────────────────────────────
//  GOERTZEL SCAN
//  Slides a 20ms window across all samples and computes the
//  spectral power at exactly 800Hz per window.
//  Much more robust than IIR bandpass for a known target freq.
// ─────────────────────────────────────────────────────────────
function goertzelScan(samples, sr) {
  const WIN   = Math.round(sr * 0.020);   // 20ms per window
  const COUNT = Math.floor(samples.length / WIN);
  const k     = Math.round(WIN * MORSE_FREQ / sr);
  const omega = 2 * Math.PI * k / WIN;
  const coeff = 2 * Math.cos(omega);
  const power = new Float32Array(COUNT);

  for (let w = 0; w < COUNT; w++) {
    let s0 = 0, s1 = 0, s2 = 0;
    const base = w * WIN;
    for (let i = base; i < base + WIN; i++) {
      s0 = samples[i] + coeff * s1 - s2;
      s2 = s1; s1 = s0;
    }
    power[w] = s2 * s2 + s1 * s1 - coeff * s1 * s2;
  }
  return power;  // one power value per 20ms
}

// ─────────────────────────────────────────────────────────────
//  GOERTZEL POWER → MORSE STRING
//  Timing thresholds tuned from real WAV analysis.
// ─────────────────────────────────────────────────────────────
function envelopeToMorse(power) {
  const MS_PER_WIN = 20;  // each power value = 20ms

  // Adaptive threshold: 25% of peak
  let peak = 0;
  for (let i = 0; i < power.length; i++) if (power[i] > peak) peak = power[i];
  const threshold = peak * 0.25;

  // Binary on/off per 20ms window
  const binary = new Uint8Array(power.length);
  for (let i = 0; i < power.length; i++) binary[i] = power[i] > threshold ? 1 : 0;

  // Run-length encode → (value, durationMs)
  const runs = [];
  let cur = binary[0], cnt = 1;
  for (let i = 1; i < binary.length; i++) {
    if (binary[i] === cur) cnt++;
    else { runs.push({ v: cur, ms: cnt * MS_PER_WIN }); cur = binary[i]; cnt = 1; }
  }
  runs.push({ v: cur, ms: cnt * MS_PER_WIN });

  // Timing thresholds (ms)
  const MID_TONE_MS   = (DOT_MS + DASH_MS) / 2;  // 170 ms
  const MIN_TONE_MS   = 40;   // shorter = noise, ignore
  const MIN_GAP_MS    = 50;   // shorter = intra-element silence, ignore
  const LETTER_GAP_MS = 150;  // silence ≥ this → letter boundary
  const WORD_GAP_MS   = 500;  // silence ≥ this → word boundary

  let morse = '';
  for (const run of runs) {
    if (run.v === 1) {
      if (run.ms < MIN_TONE_MS) continue;
      morse += run.ms < MID_TONE_MS ? '.' : '-';
    } else {
      if (run.ms < MIN_GAP_MS)          continue;
      if (run.ms >= WORD_GAP_MS)        morse += ' / ';
      else if (run.ms >= LETTER_GAP_MS) morse += ' ';
    }
  }
  return morse.trim();
}

// ─────────────────────────────────────────────────────────────
//  MORSE → TEXT  (matches MorseConverter.java exactly)
// ─────────────────────────────────────────────────────────────
function decodeMorse(morse) {
  if (!morse) return '';
  return morse
    .split(' / ')
    .map(word =>
      word.trim().split(/\s+/).filter(Boolean)
          .map(code => REVERSE_MORSE[code] || '?').join('')
    )
    .join(' ')
    .trim();
}

// ─────────────────────────────────────────────────────────────
//  DRAWING FUNCTIONS
// ─────────────────────────────────────────────────────────────
function drawWave(canvasId, data, strokeColor) {
  const canvas = document.getElementById(canvasId);
  const W = canvas.clientWidth || 730;
  canvas.width = W;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#060e08';
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.strokeStyle = '#0a2a14';
  ctx.lineWidth = 0.5;
  ctx.moveTo(0, H/2); ctx.lineTo(W, H/2);
  ctx.stroke();

  const step = Math.max(1, Math.floor(data.length / W));
  const mid  = H / 2;
  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x++) {
    let maxV = -Infinity;
    const start = x * step;
    for (let j = 0; j < step && (start + j) < data.length; j++) {
      if (data[start + j] > maxV) maxV = data[start + j];
    }
    const y = mid - maxV * mid * 0.88;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPowerWave(canvasId, power, strokeColor) {
  const canvas = document.getElementById(canvasId);
  const W = canvas.clientWidth || 730;
  canvas.width = W;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#060e08';
  ctx.fillRect(0, 0, W, H);

  let maxP = 0;
  for (let i = 0; i < power.length; i++) if (power[i] > maxP) maxP = power[i];
  const norm = Math.max(maxP, 0.0001);

  const step = Math.max(1, Math.floor(power.length / W));
  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  for (let x = 0; x < W; x++) {
    let peak = 0;
    const start = x * step;
    for (let j = 0; j < step && (start+j) < power.length; j++) {
      if (power[start+j] > peak) peak = power[start+j];
    }
    const y = H - (peak / norm) * (H - 4) - 2;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawEnvelope(power) {
  const canvas = document.getElementById('envCanvas');
  const W = canvas.clientWidth || 730;
  canvas.width = W;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#060e08';
  ctx.fillRect(0, 0, W, H);

  let maxP = 0;
  for (let i = 0; i < power.length; i++) if (power[i] > maxP) maxP = power[i];
  const thr  = maxP * 0.25;
  const norm = Math.max(maxP, 0.0001);
  const step = Math.max(1, Math.floor(power.length / W));

  // Fill bars
  for (let x = 0; x < W; x++) {
    let peak = 0;
    const start = x * step;
    for (let j = 0; j < step && (start+j) < power.length; j++) {
      if (power[start+j] > peak) peak = power[start+j];
    }
    const barH = (peak / norm) * (H - 4);
    ctx.fillStyle = peak > thr ? '#00ff8833' : '#0a1a0f';
    ctx.fillRect(x, H - barH - 2, 1, barH + 2);
  }

  // Envelope line
  ctx.beginPath();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < W; x++) {
    let peak = 0;
    const start = x * step;
    for (let j = 0; j < step && (start+j) < power.length; j++) {
      if (power[start+j] > peak) peak = power[start+j];
    }
    const y = H - (peak / norm) * (H - 4) - 2;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Threshold line (amber dashed)
  const ty = H - (thr / norm) * (H - 4) - 2;
  ctx.beginPath();
  ctx.strokeStyle = '#ffaa0077';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.moveTo(0, ty); ctx.lineTo(W, ty);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ─────────────────────────────────────────────────────────────
//  OUTPUT REVEAL + STATS
// ─────────────────────────────────────────────────────────────
function revealText(text) {
  outputText.innerHTML = '';
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'char-span';
    span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
    span.style.animationDelay = (i * 0.07) + 's';
    outputText.appendChild(span);
  }
}

function updateStats(text, morse) {
  const chars  = text.replace(/\s/g, '').length;
  const words  = text.trim().split(/\s+/).filter(Boolean).length;
  const dots   = (morse.match(/\./g)  || []).length;
  const dashes = (morse.match(/-/g)   || []).length;
  document.getElementById('sChars').textContent  = chars;
  document.getElementById('sWords').textContent  = words;
  document.getElementById('sDots').textContent   = dots;
  document.getElementById('sDashes').textContent = dashes;
}
