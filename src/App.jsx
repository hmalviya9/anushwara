import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DEITY DATA ─── */
const DEITIES = [
  { id: "ganesha", name: "Ganesha", mantra: "Gaṁ", freq: 14, range: [12, 16], domain: "Grounding", color: "#E85D3A", glyph: "ॐ", chakra: "Mūlādhāra", element: "Earth", description: "Remover of obstacles. The 14Hz frequency grounds awareness into the body, anchoring Prāṇa at the base." },
  { id: "shiva", name: "Shiva", mantra: "Oṁ / Hauṁ", freq: 7.83, range: [6, 10], domain: "Schumann Resonance", color: "#5B8DEF", glyph: "☽", chakra: "Sahasrāra", element: "Ākāsha", description: "Pure consciousness. 7.83Hz aligns with Earth's electromagnetic pulse — the Schumann Resonance — dissolving the boundary between self and cosmos." },
  { id: "durga", name: "Durgā", mantra: "Duṁ", freq: 11, range: [10, 12], domain: "Alpha Protection", color: "#D4503A", glyph: "त्रि", chakra: "Maṇipūra", element: "Fire", description: "The invincible protector. Alpha-band 10-12Hz resonance builds a psycho-acoustic shield of fierce compassion." },
  { id: "lakshmi", name: "Lakṣmī", mantra: "Śrīṁ", freq: 45, range: [40, 50], domain: "Abundance · High Gamma", color: "#F0C040", glyph: "श्री", chakra: "Anāhata", element: "Water", description: "Radiant abundance. 45Hz high-gamma synchrony correlates with heightened awareness and expanded perception." },
  { id: "saraswati", name: "Sarasvatī", mantra: "Aiṁ", freq: 26, range: [22, 30], domain: "Cognitive Focus", color: "#F5F5F0", glyph: "वी", chakra: "Viśuddha", element: "Ākāsha", description: "Goddess of knowledge. 26Hz beta resonance sharpens cognitive architecture and creative flow states." },
  { id: "hanuman", name: "Hanumān", mantra: "Haṁ", freq: 392, range: [370, 415], domain: "Vagus Nerve · Vitality", color: "#FF6B2B", glyph: "ह", chakra: "Viśuddha", element: "Air", description: "Boundless devotion. 392Hz (G4) stimulates the vagus nerve, activating the parasympathetic rest-and-digest response." },
  { id: "kali", name: "Kālī", mantra: "Krīṁ", freq: 33, range: [30, 36], domain: "Transformation", color: "#9B3DC7", glyph: "का", chakra: "Ājñā", element: "Fire", description: "The transformer. 33Hz gamma oscillation dissolves calcified patterns, making space for radical renewal." },
  { id: "krishna", name: "Kṛṣṇa", mantra: "Klīṁ", freq: 33, range: [30, 36], domain: "Emotional Attraction", color: "#2D8AE0", glyph: "कृ", chakra: "Anāhata", element: "Water", description: "Divine attraction. 33Hz resonance opens the heart field, magnetizing connection and emotional coherence." },
  { id: "vishnu", name: "Viṣṇu", mantra: "Daṁ", freq: 293.7, range: [280, 310], domain: "Preservation", color: "#3D8ACA", glyph: "वि", chakra: "Anāhata", element: "Water", description: "The sustainer. 293.7Hz (D4) maintains harmonic equilibrium — preservation through resonant stability." },
  { id: "bhairava", name: "Bhairava", mantra: "Bhrāṁ", freq: 2.5, range: [0.5, 4], domain: "Delta · Fearlessness", color: "#C7384A", glyph: "भ", chakra: "Mūlādhāra", element: "Earth", description: "Fierce awareness. Delta-range frequencies access the deepest strata of consciousness where fear dissolves." },
  { id: "bagalamukhi", name: "Bagalāmukhī", mantra: "Hlīṁ", freq: 20, range: [17, 23], domain: "Stillness", color: "#C4A82B", glyph: "ह्ल", chakra: "Ājñā", element: "Ākāsha", description: "The paralyzer of illusion. 20Hz — the threshold of audibility — suspends mental turbulence into crystalline stillness." },
];

/* ─── SVG SACRED GEOMETRY ─── */
const SriYantra = ({ size = 200, color = "#D4A843", opacity = 0.15, animate = false }) => {
  const r = size / 2;
  const triangles = [];
  for (let i = 0; i < 9; i++) {
    const scale = 1 - i * 0.09;
    const h = r * scale * 0.85;
    if (i % 2 === 0) {
      triangles.push(`M ${r} ${r - h * 0.66} L ${r - h * 0.6} ${r + h * 0.33} L ${r + h * 0.6} ${r + h * 0.33} Z`);
    } else {
      triangles.push(`M ${r} ${r + h * 0.66} L ${r - h * 0.6} ${r - h * 0.33} L ${r + h * 0.6} ${r - h * 0.33} Z`);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
      {[0.95, 0.75, 0.55].map((s, i) => (
        <circle key={i} cx={r} cy={r} r={r * s} fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 0.7}>
          {animate && <animateTransform attributeName="transform" type="rotate" from={`0 ${r} ${r}`} to={`${i % 2 === 0 ? 360 : -360} ${r} ${r}`} dur={`${60 + i * 20}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {triangles.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth="0.6" opacity={opacity}>
          {animate && <animateTransform attributeName="transform" type="rotate" from={`0 ${r} ${r}`} to={`${i % 2 === 0 ? 360 : -360} ${r} ${r}`} dur={`${80 + i * 10}s`} repeatCount="indefinite" />}
        </path>
      ))}
      <circle cx={r} cy={r} r={3} fill={color} opacity={opacity * 2} />
    </svg>
  );
};

/* ─── PEACE SCORE GAUGE ─── */
const PeaceGauge = ({ score, size = 220 }) => {
  const stroke = 8;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getColor = (s) => {
    if (s < 25) return "#E85D3A";
    if (s < 50) return "#F0C040";
    if (s < 75) return "#5BD4A8";
    return "#7BE87B";
  };
  const glowColor = getColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <filter id="gaugeGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#gaugeGrad)" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" filter="url(#gaugeGlow)" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontFamily: "'Cormorant Garamond', serif" }}>Peace Score</span>
        <span style={{ fontSize: 48, fontWeight: 200, color: glowColor, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, transition: "color 0.5s" }}>{Math.round(score)}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginTop: 2 }}>{score < 25 ? "SEEKING" : score < 50 ? "ALIGNING" : score < 75 ? "RESONATING" : "SAMĀDHI"}</span>
      </div>
    </div>
  );
};

/* ─── WAVEFORM VISUALIZER ─── */
const WaveVisualizer = ({ analyserRef, isActive, deityColor, width = 600, height = 180 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      if (analyserRef.current && isActive) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);
        const maxRadius = Math.min(width, height) / 2 - 10;

        for (let ring = 0; ring < 4; ring++) {
          const ringRadius = maxRadius * (0.3 + ring * 0.2);
          ctx.beginPath();
          for (let i = 0; i < 360; i++) {
            const idx = Math.floor((i / 360) * bufferLength);
            const v = (dataArray[idx] - 128) / 128;
            const r = ringRadius + v * 25 * (1 + ring * 0.3);
            const angle = (i * Math.PI) / 180;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = deityColor + (ring === 0 ? "CC" : ring === 1 ? "88" : ring === 2 ? "55" : "33");
          ctx.lineWidth = 1.5 - ring * 0.3;
          ctx.stroke();
        }
        // Center bindu
        const centerV = Math.abs((dataArray[0] - 128) / 128);
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + centerV * 8, 0, Math.PI * 2);
        ctx.fillStyle = deityColor + "AA";
        ctx.fill();
      } else {
        // Idle — breathing circles
        const t = Date.now() / 3000;
        for (let i = 0; i < 3; i++) {
          const r = 30 + Math.sin(t + i * 0.7) * 15 + i * 18;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(212,168,67,${0.08 - i * 0.02})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isActive, deityColor, width, height, analyserRef]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
};

/* ─── FREQUENCY ANALYZER ─── */
const FrequencyDisplay = ({ analyserRef, isActive, targetFreq, targetRange, sampleRate }) => {
  const [detected, setDetected] = useState(null);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (!isActive || !analyserRef.current) { setDetected(null); setAccuracy(0); return; }
    const interval = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatFrequencyData(dataArray);

      let maxVal = -Infinity, maxIdx = 0;
      for (let i = 1; i < bufferLength; i++) {
        if (dataArray[i] > maxVal) { maxVal = dataArray[i]; maxIdx = i; }
      }
      if (maxVal > -80) {
        const freq = (maxIdx * sampleRate) / (bufferLength * 2);
        setDetected(freq);
        const [lo, hi] = targetRange;
        if (freq >= lo && freq <= hi) {
          const dist = Math.abs(freq - targetFreq) / (hi - lo) * 2;
          setAccuracy(Math.max(0, 1 - dist) * 100);
        } else {
          const dist = Math.min(Math.abs(freq - lo), Math.abs(freq - hi));
          setAccuracy(Math.max(0, 100 - dist * 2));
        }
      } else {
        setDetected(null);
        setAccuracy(0);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isActive, analyserRef, targetFreq, targetRange, sampleRate]);

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
      {[
        { label: "DETECTED", value: detected ? `${detected.toFixed(1)} Hz` : "— Hz", color: detected ? "#F0C040" : "rgba(255,255,255,0.15)" },
        { label: "TARGET", value: `${targetFreq} Hz`, color: "rgba(255,255,255,0.5)" },
        { label: "ACCURACY", value: isActive && detected ? `${Math.round(accuracy)}%` : "—%", color: accuracy > 60 ? "#7BE87B" : accuracy > 30 ? "#F0C040" : "rgba(255,255,255,0.25)" },
      ].map((item, i) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {i > 0 && <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontFamily: "'JetBrains Mono', monospace", color: item.color }}>{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── BREATHING GUIDE ─── */
const BreathingGuide = ({ isActive, mantra, onPhaseChange }) => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef(null);

  const phaseDefs = [
    { label: "Inhale", duration: 4000, icon: "↑", instruction: "Deep diaphragmatic breath through the nose" },
    { label: `Syllable: ${mantra.replace(/ṁ$/, "")}`, duration: 2000, icon: "◆", instruction: "25% — voice the seed syllable clearly" },
    { label: "Anusvāra: ṁ~", duration: 6000, icon: "〰", instruction: "75% — sustain the nasal hum, feel sinus resonance" },
  ];

  useEffect(() => {
    if (!isActive) {
      setPhase(0); setProgress(0); setCycle(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const tick = 50;
    let elapsed = 0;
    let cp = 0;
    const durations = [4000, 2000, 6000];
    intervalRef.current = setInterval(() => {
      elapsed += tick;
      const dur = durations[cp];
      setProgress(Math.min(elapsed / dur, 1));
      if (elapsed >= dur) {
        elapsed = 0;
        cp = (cp + 1) % 3;
        if (cp === 0) setCycle((c) => c + 1);
        setPhase(cp);
        if (onPhaseChange) onPhaseChange(cp);
      }
    }, tick);
    return () => clearInterval(intervalRef.current);
  }, [isActive, mantra, onPhaseChange]);

  const cur = phaseDefs[phase];
  const barColor = phase === 0 ? "#5B8DEF" : phase === 1 ? "#F0C040" : "#7BE87B";

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {phaseDefs.map((p, i) => (
          <div key={i} style={{ flex: p.duration, position: "relative", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            {i === phase && <div style={{ position: "absolute", inset: 0, borderRadius: 3, background: barColor, width: `${progress * 100}%`, transition: "width 50ms linear" }} />}
            {i < phase && <div style={{ position: "absolute", inset: 0, borderRadius: 3, background: barColor, opacity: 0.3 }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28, opacity: 0.7, width: 36, textAlign: "center", color: barColor }}>{cur.icon}</span>
        <div>
          <div style={{ fontSize: 15, color: barColor, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{cur.label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{cur.instruction}</div>
        </div>
        {isActive && <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>Cycle {cycle + 1}</span>}
      </div>
    </div>
  );
};

/* ─── DEITY CARD ─── */
const DeityCard = ({ deity, isSelected, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "12px 8px", borderRadius: 12,
    border: isSelected ? `1px solid ${deity.color}55` : "1px solid rgba(255,255,255,0.04)",
    background: isSelected ? `${deity.color}11` : "rgba(255,255,255,0.02)",
    cursor: "pointer", transition: "all 0.3s", minWidth: 80,
    boxShadow: isSelected ? `0 0 20px ${deity.color}22` : "none",
  }}>
    <span style={{ fontSize: 22, filter: isSelected ? "none" : "grayscale(0.5)", transition: "filter 0.3s" }}>{deity.glyph}</span>
    <span style={{ fontSize: 10, letterSpacing: 1.5, color: isSelected ? deity.color : "rgba(255,255,255,0.35)", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{deity.name}</span>
    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{deity.freq}Hz</span>
  </button>
);

/* ─── MIC PERMISSION OVERLAY ─── */
const MicOverlay = ({ status, onRequest, onDismiss }) => {
  if (status === "granted") return null;
  const denied = status === "denied";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(5,5,10,0.92)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        maxWidth: 440, width: "100%", textAlign: "center", padding: "48px 32px", borderRadius: 24,
        background: "linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(212,168,67,0.12)", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", pointerEvents: "none" }}>
          {[0.8, 0.6, 0.4].map((s, i) => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: 200 * s, height: 200 * s, border: "1px solid rgba(212,168,67,0.06)", borderRadius: "50%", transform: "translate(-50%, -50%)" }} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: denied ? "rgba(232,93,58,0.1)" : "rgba(212,168,67,0.08)",
              border: `1px solid ${denied ? "rgba(232,93,58,0.2)" : "rgba(212,168,67,0.15)"}`,
              animation: denied ? "none" : "micPulse 2.5s ease-in-out infinite",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={denied ? "#E85D3A" : "#D4A843"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
                {denied && <line x1="1" y1="1" x2="23" y2="23" stroke="#E85D3A" strokeWidth="2" />}
              </svg>
            </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 300, margin: "0 0 8px", fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1, color: denied ? "#E85D3A" : "#D4A843" }}>
            {denied ? "Microphone Blocked" : "Microphone Access Required"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "'Cormorant Garamond', serif", margin: "0 0 8px" }}>
            {denied
              ? "Your browser has blocked microphone access. Anuswara needs your voice to analyze resonance frequencies and compute your Peace Score."
              : "Anuswara uses your microphone to detect the frequency of your mantra chant in real-time. No audio is recorded or transmitted — all analysis happens locally in your browser."}
          </p>
          {denied && (
            <div style={{ margin: "16px 0", padding: 14, borderRadius: 10, background: "rgba(232,93,58,0.06)", border: "1px solid rgba(232,93,58,0.1)", textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(232,93,58,0.7)", marginBottom: 8, textTransform: "uppercase" }}>How to enable</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace" }}>
                <div>🔒 Click the lock / site-info icon in your address bar</div>
                <div>🎤 Set Microphone → "Allow"</div>
                <div>🔄 Refresh this page</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {!denied && (
              <button onClick={onRequest} style={{ padding: "14px 36px", borderRadius: 99, border: "1px solid rgba(212,168,67,0.3)", cursor: "pointer", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, background: "rgba(212,168,67,0.1)", color: "#D4A843" }}>
                ◉ Enable Microphone
              </button>
            )}
            <button onClick={onDismiss} style={{ padding: "14px 24px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)" }}>
              {denied ? "Continue Without Mic" : "Skip for Now"}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 16, fontFamily: "'JetBrains Mono', monospace" }}>
            🔒 Zero data leaves your device · Local Web Audio API only
          </p>
        </div>
      </div>
      <style>{`@keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 rgba(212,168,67,0.15)} 50%{box-shadow:0 0 0 18px rgba(212,168,67,0)} }`}</style>
    </div>
  );
};

/* ─── SCIENCE PANEL ─── */
const SciencePanel = () => (
  <div style={{ padding: 16, borderRadius: 12, background: "rgba(91,141,239,0.06)", border: "1px solid rgba(91,141,239,0.12)", marginTop: 12 }}>
    <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(91,141,239,0.7)", marginBottom: 8, textTransform: "uppercase" }}>Bio-Acoustic Science</div>
    <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontFamily: "'Cormorant Garamond', serif" }}>
      The <strong style={{ color: "#5BD4A8" }}>Anusvāra</strong> (nasal 'ṁ' hum) creates Helmholtz Resonance in the paranasal sinuses.
      Research from the Karolinska Institute demonstrates that humming increases <strong style={{ color: "#5BD4A8" }}>Nitric Oxide (NO)</strong> production
      by approximately 15×, promoting vasodilation, reduced blood pressure, and enhanced parasympathetic tone.
      The target frequencies in this lab are mapped to specific brainwave bands and vagal activation thresholds.
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [selectedDeity, setSelectedDeity] = useState(DEITIES[0]);
  const [isListening, setIsListening] = useState(false);
  const [peaceScore, setPeaceScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [micError, setMicError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [micPermission, setMicPermission] = useState("unknown");
  const [showMicOverlay, setShowMicOverlay] = useState(false);
  const [sampleRate, setSampleRate] = useState(44100);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const sessionIntervalRef = useRef(null);
  const scoreIntervalRef = useRef(null);

  /* ── Permission check on mount ── */
  useEffect(() => {
    (async () => {
      try {
        if (navigator.permissions?.query) {
          const result = await navigator.permissions.query({ name: "microphone" });
          setMicPermission(result.state);
          if (result.state !== "granted") setShowMicOverlay(true);
          result.addEventListener("change", () => {
            setMicPermission(result.state);
            if (result.state === "granted") setShowMicOverlay(false);
          });
        } else {
          setMicPermission("prompt");
          setShowMicOverlay(true);
        }
      } catch (_) {
        setMicPermission("prompt");
        setShowMicOverlay(true);
      }
    })();
  }, []);

  /* ── Proactive mic request ── */
  const requestMic = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicError("Your browser doesn't support microphone access. Try Chrome or Firefox.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicPermission("granted");
      setShowMicOverlay(false);
      setMicError(null);
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
      } else if (err.name === "NotFoundError") {
        setMicError("No microphone found. Please connect one and try again.");
      } else {
        setMicError("Mic error: " + (err.message || "Unknown issue"));
      }
    }
  }, []);

  /* ── Start session ── */
  const startListening = useCallback(async () => {
    try {
      setMicError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicError("Microphone API not available.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      setMicPermission("granted");

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      streamRef.current = stream;
      setSampleRate(audioCtx.sampleRate);
      setIsListening(true);
      setSessionTime(0);
      setPeaceScore(0);

      sessionIntervalRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);

      // Peace score loop
      const deityRange = selectedDeity.range;
      const deityFreq = selectedDeity.freq;
      scoreIntervalRef.current = setInterval(() => {
        const bufLen = analyser.frequencyBinCount;
        const data = new Float32Array(bufLen);
        analyser.getFloatFrequencyData(data);
        let maxVal = -Infinity, maxIdx = 0;
        for (let i = 1; i < bufLen; i++) { if (data[i] > maxVal) { maxVal = data[i]; maxIdx = i; } }
        if (maxVal > -75) {
          const freq = (maxIdx * audioCtx.sampleRate) / (bufLen * 2);
          const [lo, hi] = deityRange;
          let acc = 0;
          if (freq >= lo && freq <= hi) {
            acc = Math.max(0, 1 - Math.abs(freq - deityFreq) / ((hi - lo) / 2) * 0.5);
          } else {
            acc = Math.max(0, 1 - Math.min(Math.abs(freq - lo), Math.abs(freq - hi)) / 100);
          }
          setPeaceScore((prev) => {
            const stress = 1 + Math.max(0, 1 - acc) * 0.5;
            return Math.min(100, prev + (0.2 * acc * 2.5) / stress);
          });
        }
      }, 200);
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
        setShowMicOverlay(true);
      } else if (err.name === "NotFoundError") {
        setMicError("No microphone detected.");
      } else if (err.name === "NotReadableError" || err.name === "AbortError") {
        setMicError("Mic is in use by another app. Close it and retry.");
      } else {
        setMicError("Mic error: " + (err.message || "Try refreshing."));
      }
    }
  }, [selectedDeity]);

  /* ── Stop session ── */
  const stopListening = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    analyserRef.current = null;
    setIsListening(false);
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
  }, []);

  useEffect(() => () => stopListening(), [stopListening]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ═══ RENDER ═══ */
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#E8E4DC", fontFamily: "'Cormorant Garamond', Georgia, serif", position: "relative", overflow: "hidden" }}>

      {showMicOverlay && <MicOverlay status={micPermission} onRequest={requestMic} onDismiss={() => setShowMicOverlay(false)} />}

      {/* BG sacred geometry */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.4, zIndex: 0 }}>
        <SriYantra size={800} opacity={0.04} animate />
      </div>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse at 50% 0%, ${selectedDeity.color}08 0%, transparent 60%)`, transition: "background 1s" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "rgba(212,168,67,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Mantra Lab</div>
          <h1 style={{ fontSize: 36, fontWeight: 300, margin: 0, letterSpacing: 2, color: "#D4A843" }}>अनुस्वार</h1>
          <h2 style={{ fontSize: 18, fontWeight: 300, margin: "4px 0 0", letterSpacing: 4, color: "rgba(255,255,255,0.3)" }}>THE SONIC BODY</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 8, letterSpacing: 1 }}>
            Bio-acoustic resonance through Beeja mantra · Helmholtz sinus activation · Nitric Oxide synthesis
          </p>
          {/* Mic badge */}
          <button onClick={() => { if (micPermission !== "granted") setShowMicOverlay(true); }} style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "5px 14px", borderRadius: 99,
            background: micPermission === "granted" ? "rgba(123,232,123,0.06)" : micPermission === "denied" ? "rgba(232,93,58,0.06)" : "rgba(212,168,67,0.06)",
            border: `1px solid ${micPermission === "granted" ? "rgba(123,232,123,0.15)" : micPermission === "denied" ? "rgba(232,93,58,0.15)" : "rgba(212,168,67,0.15)"}`,
            cursor: micPermission === "granted" ? "default" : "pointer",
            fontSize: 10, letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace",
            color: micPermission === "granted" ? "rgba(123,232,123,0.7)" : micPermission === "denied" ? "rgba(232,93,58,0.7)" : "rgba(212,168,67,0.7)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: micPermission === "granted" ? "#7BE87B" : micPermission === "denied" ? "#E85D3A" : "#D4A843", boxShadow: `0 0 6px ${micPermission === "granted" ? "rgba(123,232,123,0.4)" : micPermission === "denied" ? "rgba(232,93,58,0.4)" : "rgba(212,168,67,0.4)"}` }} />
            {micPermission === "granted" ? "MIC READY" : micPermission === "denied" ? "MIC BLOCKED — TAP TO FIX" : "MIC PENDING"}
          </button>
        </header>

        {/* Deity selector */}
        <div style={{ overflowX: "auto", marginBottom: 28, paddingBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {DEITIES.map((d) => <DeityCard key={d.id} deity={d} isSelected={selectedDeity.id === d.id} onClick={() => { if (!isListening) setSelectedDeity(d); }} />)}
          </div>
        </div>

        {/* Deity info */}
        <div style={{ padding: 24, borderRadius: 16, marginBottom: 24, background: `linear-gradient(135deg, ${selectedDeity.color}08 0%, rgba(255,255,255,0.02) 100%)`, border: `1px solid ${selectedDeity.color}18`, transition: "all 0.6s" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>{selectedDeity.glyph}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: selectedDeity.color }}>{selectedDeity.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontStyle: "italic", marginTop: 2 }}>{selectedDeity.mantra}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                {[
                  { l: "Frequency", v: `${selectedDeity.freq} Hz` },
                  { l: "Range", v: `${selectedDeity.range[0]}–${selectedDeity.range[1]} Hz` },
                  { l: "Domain", v: selectedDeity.domain },
                  { l: "Chakra", v: selectedDeity.chakra },
                  { l: "Element", v: selectedDeity.element },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>{selectedDeity.description}</p>
            </div>
          </div>
        </div>

        {/* Session area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
            <PeaceGauge score={peaceScore} />
            <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <WaveVisualizer analyserRef={analyserRef} isActive={isListening} deityColor={selectedDeity.color} width={380} height={160} />
              {isListening && <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>Session: {fmt(sessionTime)}</div>}
            </div>
          </div>

          <FrequencyDisplay analyserRef={analyserRef} isActive={isListening} targetFreq={selectedDeity.freq} targetRange={selectedDeity.range} sampleRate={sampleRate} />
          <BreathingGuide isActive={isListening} mantra={selectedDeity.mantra} onPhaseChange={setCurrentPhase} />

          {/* Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <button
              onClick={() => { if (isListening) { stopListening(); return; } if (micPermission === "denied") { setShowMicOverlay(true); return; } startListening(); }}
              style={{
                padding: "14px 40px", borderRadius: 99, cursor: "pointer",
                fontSize: 13, letterSpacing: 3, textTransform: "uppercase",
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 600,
                background: isListening ? "rgba(232,93,58,0.15)" : `${selectedDeity.color}22`,
                color: isListening ? "#E85D3A" : selectedDeity.color,
                border: `1px solid ${isListening ? "rgba(232,93,58,0.3)" : selectedDeity.color + "33"}`,
              }}
            >
              {isListening ? "◼  End Session" : micPermission === "denied" ? "🎤  Enable Mic to Begin" : "◉  Begin Sādhanā"}
            </button>
            <button onClick={() => setShowInfo(!showInfo)} style={{ padding: "14px 24px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }}>
              {showInfo ? "Hide" : "Science"}
            </button>
          </div>

          {micError && (
            <div style={{ textAlign: "center", color: "#E85D3A", fontSize: 13, padding: 12, borderRadius: 8, background: "rgba(232,93,58,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <span>{micError}</span>
              <button onClick={() => { setMicError(null); setShowMicOverlay(true); }} style={{ padding: "6px 16px", borderRadius: 99, border: "1px solid rgba(232,93,58,0.3)", cursor: "pointer", fontSize: 11, letterSpacing: 1, background: "rgba(232,93,58,0.1)", color: "#E85D3A", fontFamily: "'Cormorant Garamond', serif" }}>Retry</button>
            </div>
          )}
          {showInfo && <SciencePanel />}
        </div>

        {/* Method cards */}
        <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(212,168,67,0.5)", marginBottom: 16, textTransform: "uppercase", textAlign: "center" }}>Anusvāra Method</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { step: 1, label: "Inhale", desc: "4s diaphragmatic breath", pct: "", color: "#5B8DEF" },
              { step: 2, label: "Seed Syllable", desc: `Voice "${selectedDeity.mantra.replace(/ṁ$/, "")}" clearly`, pct: "25%", color: "#F0C040" },
              { step: 3, label: "Anusvāra Hum", desc: "Sustain nasal 'ṁ~' resonance", pct: "75%", color: "#7BE87B" },
            ].map(({ step, label, desc, pct, color }) => (
              <div key={step} style={{
                flex: 1, minWidth: 140, padding: 16, borderRadius: 12,
                background: currentPhase === step - 1 && isListening ? `${color}11` : "rgba(255,255,255,0.02)",
                border: `1px solid ${currentPhase === step - 1 && isListening ? color + "33" : "rgba(255,255,255,0.04)"}`,
                textAlign: "center", transition: "all 0.3s",
              }}>
                <div style={{ fontSize: 22, fontWeight: 300, color, opacity: 0.7 }}>{step}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{desc}</div>
                {pct && <div style={{ fontSize: 10, color, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>Duration: {pct}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>PEACE SCORE ALGORITHM</div>
          <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: "rgba(212,168,67,0.6)", overflowWrap: "break-word" }}>
            peaceScore = (Anusvāra_Duration × Accuracy_Multiplier) / Stress_Factor
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
            Where Stress_Factor = 1 + (1 − accuracy) × 0.5 · Accuracy = distance from target frequency within resonant range
          </div>
        </div>

        <footer style={{ textAlign: "center", marginTop: 40, paddingBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.12)" }}>ANUSWARA · THE SONIC BODY · BIO-ACOUSTIC MANTRA LAB</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.08)", marginTop: 4 }}>Frequency targets based on EEG brainwave bands · Karolinska Institute NO research · Helmholtz resonator acoustics</div>
        </footer>
      </div>
    </div>
  );
}
