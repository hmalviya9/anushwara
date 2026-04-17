import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const DEITIES = [
  {id:"ganesha",name:"Ganesha",mantra:"Gam",freq:14,range:[12,16],domain:"Grounding",color:"#E85D3A",glyph:"गं",chakra:"Muladhara",chakraIdx:0,element:"Earth",petals:4,rings:3,desc:"14Hz grounds awareness into the body, anchoring Prana at the base."},
  {id:"shiva",name:"Shiva",mantra:"Om",freq:7.83,range:[6,10],domain:"Schumann Resonance",color:"#5B8DEF",glyph:"शिव",chakra:"Sahasrara",chakraIdx:6,element:"Akasha",petals:12,rings:5,desc:"7.83Hz aligns with Earth's electromagnetic pulse — the Schumann Resonance."},
  {id:"durga",name:"Durga",mantra:"Dum",freq:11,range:[10,12],domain:"Alpha Protection",color:"#D4503A",glyph:"दुं",chakra:"Manipura",chakraIdx:2,element:"Fire",petals:8,rings:4,desc:"Alpha-band 10-12Hz builds a psycho-acoustic shield around the solar plexus."},
  {id:"lakshmi",name:"Lakshmi",mantra:"Shrim",freq:45,range:[40,50],domain:"Abundance / Gamma",color:"#F0C040",glyph:"श्रीं",chakra:"Anahata",chakraIdx:3,element:"Water",petals:16,rings:4,desc:"45Hz high-gamma synchrony correlates with heightened awareness and heart-field expansion."},
  {id:"saraswati",name:"Saraswati",mantra:"Aim",freq:26,range:[22,30],domain:"Cognitive Focus",color:"#D8D0C0",glyph:"ऐं",chakra:"Vishuddha",chakraIdx:4,element:"Akasha",petals:6,rings:3,desc:"26Hz beta resonance sharpens cognitive architecture and throat center expression."},
  {id:"hanuman",name:"Hanuman",mantra:"Ham",freq:392,range:[370,415],domain:"Vagus Nerve",color:"#FF6B2B",glyph:"हं",chakra:"Vishuddha",chakraIdx:4,element:"Air",petals:10,rings:5,desc:"392Hz (G4) stimulates the vagus nerve, activating parasympathetic response."},
  {id:"kali",name:"Kali",mantra:"Krim",freq:33,range:[30,36],domain:"Transformation",color:"#9B3DC7",glyph:"क्रीं",chakra:"Ajna",chakraIdx:5,element:"Fire",petals:3,rings:4,desc:"33Hz gamma at the third eye dissolves calcified patterns for radical renewal."},
  {id:"krishna",name:"Krishna",mantra:"Klim",freq:33,range:[30,36],domain:"Attraction",color:"#2D8AE0",glyph:"क्लीं",chakra:"Anahata",chakraIdx:3,element:"Water",petals:8,rings:4,desc:"33Hz resonance opens the heart field, magnetizing emotional coherence."},
  {id:"vishnu",name:"Vishnu",mantra:"Dam",freq:293.7,range:[280,310],domain:"Preservation",color:"#3D8ACA",glyph:"दं",chakra:"Anahata",chakraIdx:3,element:"Water",petals:12,rings:3,desc:"293.7Hz (D4) maintains harmonic equilibrium through resonant stability."},
  {id:"bhairava",name:"Bhairava",mantra:"Bhram",freq:2.5,range:[0.5,4],domain:"Delta / Fearlessness",color:"#C7384A",glyph:"भ्रां",chakra:"Muladhara",chakraIdx:0,element:"Earth",petals:5,rings:3,desc:"Delta-range frequencies access the deepest strata where fear dissolves."},
  {id:"bagalamukhi",name:"Bagalamukhi",mantra:"Hlim",freq:20,range:[17,23],domain:"Stillness",color:"#C4A82B",glyph:"ह्लीं",chakra:"Ajna",chakraIdx:5,element:"Akasha",petals:6,rings:4,desc:"20Hz threshold of audibility suspends mental turbulence into crystalline stillness."},
];

const CHAKRAS = [
  {name:"Muladhara",color:"#E85D3A",y:88,label:"Root"},
  {name:"Svadhisthana",color:"#F09030",y:78,label:"Sacral"},
  {name:"Manipura",color:"#F0C040",y:66,label:"Solar"},
  {name:"Anahata",color:"#4ADE80",y:52,label:"Heart"},
  {name:"Vishuddha",color:"#38BDF8",y:40,label:"Throat"},
  {name:"Ajna",color:"#8B5CF6",y:26,label:"Third Eye"},
  {name:"Sahasrara",color:"#E0D0FF",y:18,label:"Crown"},
];

const BRAIN_STATES = {
  delta:{name:"Delta",range:"0.5-4 Hz",state:"Deep Dreamless / Prajna",color:"#6366F1"},
  theta:{name:"Theta",range:"4-8 Hz",state:"Meditation / Svapna",color:"#8B5CF6"},
  alpha:{name:"Alpha",range:"8-13 Hz",state:"Relaxed Awareness",color:"#38BDF8"},
  beta:{name:"Beta",range:"13-30 Hz",state:"Focused Cognition",color:"#4ADE80"},
  gamma:{name:"Gamma",range:"30-100 Hz",state:"Transcendent Unity",color:"#F0C040"},
};
const getBrainState=(f)=>{if(f<4)return"delta";if(f<8)return"theta";if(f<13)return"alpha";if(f<30)return"beta";return"gamma";};

const CYCLE_DURATION = 18;
const fmt=(s)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

const SIMULATED_USERS=[
  {id:"s1",name:"Arjun",location:"Varanasi",initial:"A"},
  {id:"s2",name:"Priya",location:"Pune",initial:"P"},
  {id:"s3",name:"Kavya",location:"Bengaluru",initial:"K"},
  {id:"s4",name:"Rishi",location:"London",initial:"R"},
  {id:"s5",name:"Ananya",location:"Mumbai",initial:"A"},
];

/* ═══════════════════════════════════════════════════════════════════════
   INSIGHT ENGINE — duration-aware, citation-backed
   ═══════════════════════════════════════════════════════════════════════ */
const generateInsights = (brainState, duration, peaceScore, deity, accuracyLog) => {
  const cycles = Math.floor(duration / CYCLE_DURATION);
  const avgAcc = accuracyLog.length>0?accuracyLog.reduce((a,b)=>a+b,0)/accuracyLog.length:0;
  const minutes = duration/60;
  const noBoost = minutes<1?Math.round(1+minutes*3):minutes<3?Math.round(3+(minutes-1)*2.5):minutes<10?Math.round(8+(minutes-3)):15;
  const tier = minutes<1?0:minutes<3?1:minutes<7?2:minutes<15?3:4;

  const honest = {
    0:`This was a brief initiation of ${duration}s (${cycles} cycle${cycles!==1?"s":""}). The body has begun to orient toward resonance, but physiological shifts require sustained practice. Hatha Yoga Pradipika (II.2): "Pranayama should be practiced gradually, as a lion or tiger is tamed — slowly, lest it destroy the practitioner." Starting is significant.`,
    1:`Initial autonomic response triggered. Research shows parasympathetic engagement begins within 60-90s of rhythmic humming (Stromberg et al., 2002). Deeper neuroplastic and endocrine shifts require 7+ minutes of sustained practice.`,
    2:`You are entering the threshold where measurable changes consolidate. Gheranda Samhita (V.75) describes this as "Prana beginning to enter the Sushumna" — scattered breath-energy starts centralizing.`,
    3:`Sustained practice at this duration produces reliable physiological markers. EEG studies confirm brainwave entrainment stabilizes after 7-10 minutes of rhythmic vocalization (Bernardi et al., Karolinska Institute).`,
    4:`This is a traditionally complete practice duration. Shiva Samhita (III.53-54) prescribes "four watches" of practice, each deepening pranic absorption. At 15+ minutes, full Helmholtz resonance cycling has occurred.`,
  };

  const bodyMap = {
    delta:[
      `Brief delta exposure. ${cycles} cycle${cycles!==1?"s":""} initiated the orienting response only. MU calls this Prajna but accessing it requires sustained descent.`,
      `Initial vagal tone shift at ${deity.freq}Hz. ANS has begun downregulating sympathetic arousal. HRV may show marginal improvement. Per HYP II.3: "When the breath wanders, the mind is unsteady."`,
      `Parasympathetic engagement deepening. Cortisol modulation initiated (~8-12% reduction, Bernardi et al.). ${CHAKRAS[deity.chakraIdx].name} region shows increased blood flow from NO vasodilation.`,
      `Significant parasympathetic shift. GH pulsatility enhanced (Takahashi et al., 1968). Sinus NO sustained at ~${noBoost}x. NK cell activity begins upregulating after 10+ min (Davidson et al., 2003).`,
      `Deep cellular repair window opened. MU Karika III.34-35 describes Prajna as where "all dualities are absorbed" — corresponding to delta's role in synaptic homeostasis (Tononi & Cirelli, 2006). GH peak. Immune restoration active.`,
    ],
    theta:[
      `Brief theta exposure at ${deity.freq}Hz. PYS I.38: "svapna-nidra-jnana-alambanam va" — knowledge from dream-sleep is valid, but ${cycles} cycle${cycles!==1?"s":""} only begins to open this gateway.`,
      `Initial limbic calming. Theta oscillations begin after ~90s of rhythmic practice (Lazar et al., 2005). Amygdala reactivity starting to downregulate. This is the Svapna threshold (MU verse 4).`,
      `Theta entrainment establishing. Cortisol reduction ~10-15%. HYP II.78: "When Prana flows in the Sushumna, the mind becomes steady." Serotonin pathways activating.`,
      `Sustained theta coherence. Cortisol ~18-23% reduction. DMN deactivation (Brewer et al., 2011) = reduced self-referential thought. Melatonin precursors activated.`,
      `Deep theta immersion. Svapna state (MU) fully established. Hypnagogic gateway open. Per PYS I.38, this becomes "support for steadying the mind." Cortisol ~23% reduction. Full limbic-cortical integration.`,
    ],
    alpha:[
      `Brief alpha exposure. At ${deity.freq}Hz the nervous system received an initial relaxation signal. PYS I.34 recommends breath regulation but ${cycles} cycle${cycles!==1?"s":""} is only the first step.`,
      `Alpha onset detected. Posterior dominant alpha strengthens within 60-90s of rhythmic humming (Cahn & Polich, 2006). Sinus NO initiated but needs 3+ min for full Helmholtz engagement.`,
      `Alpha stabilizing. BP normalizing. Sinus NO sustained ~${noBoost}x (Weitzberg & Lundberg, 2002, Karolinska). GS V.84: "the breath becoming like the unflickering flame."`,
      `Nervous system equilibrium achieved. BP normalized. NO sustained ~${noBoost}x for ~30 min post-session. HRV improved. PYS II.52: "the covering over inner light is diminished."`,
      `Full alpha dominance. BP normalized. NO ~${noBoost}x for ~45 min. HRV significantly improved. HYP II.77: "When the nadis are purified, the body becomes light and luminous." Baroreflex enhanced (Bernardi, 2001).`,
    ],
    beta:[
      `Brief beta stimulation at ${deity.freq}Hz. PYS III.1 defines dharana as "binding attention" but this requires sustained effort beyond ${cycles} cycle${cycles!==1?"s":""}.`,
      `Initial prefrontal activation. Beta entrainment needs 3+ min to stabilize into task-positive network engagement (Lutz et al., 2004). Dopamine pathways beginning to respond.`,
      `Beta coherence establishing. PFC activated. Dopamine and norepinephrine finding balance. SS III.21: "awakening of Saraswati in the throat center."`,
      `Sustained beta coherence. PFC fully activated. DA/NE balanced. Reaction time improved. PYS III.4: Samyama — "the three together."`,
      `Full cognitive enhancement. Pattern recognition amplified. PYS I.35: "vishayavati va pravrittih" — sensory engagement becomes lucid. Use next 90 min for most important work.`,
    ],
    gamma:[
      `Brief gamma exposure at ${deity.freq}Hz. PYS I.14: "sa tu dirgha-kala-nairantarya-satkara-asevitah dridha-bhumih" — firm ground requires long, uninterrupted practice. ${cycles} cycle${cycles!==1?"s":""} is a beginning.`,
      `Initial gamma flickers. Gamma oscillations are fragile — beginners need 5+ min to stabilize (Lutz et al., 2004). Vagal tone beginning to respond.`,
      `Gamma bursts establishing. Vagal tone elevating. NO at ~${noBoost}x (Karolinska). MU verse 7 describes Turiya — the "fourth state" correlating with sustained gamma coherence.`,
      `Significant gamma coherence. Vagal tone elevated. Anti-inflammatory cascade triggered (Tracey, 2009). NO at ~${noBoost}x. Cross-hemispheric binding increasing (Lutz et al.).`,
      `Full gamma coherence — whole-brain synchrony. Vagal tone maximal. NO at ~${noBoost}x. MU verse 7: "Turiya is Atman to be realized." Correlate: 40Hz binding across all cortex (Davidson & Lutz, 2008).`,
    ],
  };

  const mindMap = {
    delta:[
      "Brief delta intention. No significant subconscious access at this duration. PYS I.30 lists doubt (samshaya) among obstacles; short practice is insufficient to dissolve it.",
      "Initial mental deceleration. The 'monkey mind' is beginning to slow. BG VI.26: 'Wherever the wandering mind goes, restrain it and bring it back under the Self.'",
      "Surface thought patterns loosening. PYS I.2: 'yoga is citta-vrtti-nirodhah' — stilling mind fluctuations. Fluctuations have slowed but not stilled.",
      "Subconscious patterns beginning to surface. The samskaras (PYS II.15) are becoming accessible. Genuine psychological processing begins.",
      "Subconscious patterns accessed and releasing. Dreamless awareness touched — the Prajna state of MU where 'consciousness is unified and full of bliss.'",
    ],
    theta:[
      "Brief theta contact. The mind has not crossed into Svapna (MU verse 4). Continue practice to access the creative-intuitive layer.",
      "The 'guard at the gate' of the subconscious is relaxing. Theta correlates with reduced censorship (Dietrich, 2004) but needs more time.",
      "Approaching hypnagogic threshold. PYS I.38 validates dream-knowledge as legitimate meditative support. Creative associations forming.",
      "Hypnagogic gateway opening. Internal censor significantly quieted. Insights may surface in 2-4 hours (Sio & Ormerod, 2009).",
      "Full Svapna gateway. MU verse 4: 'antah-prajna' — inward cognition. Journal any visions within 15 minutes to capture theta-state insights.",
    ],
    alpha:[
      "Brief calming signal. The inner critic (pratipaksha, PYS II.33) has not been addressed at this duration.",
      "Initial quieting of self-referential thought. Alpha increase correlates with reduced DMN activity (Brewer et al., 2011).",
      "Inner critic measurably quieter. PYS I.33 prescribes maitri-karuna-mudita-upeksha. Alpha states naturally incline toward these qualities.",
      "Equanimous awareness establishing. Decision-making clarity enhanced for 2-3 hours. BG II.48: 'samatvam yoga ucyate.'",
      "Inner critic fully quieted. Equanimous awareness established. PYS I.33: this balanced mind 'becomes clear and pleasant.'",
    ],
    beta:[
      "Brief cognitive stimulation. The mind received a focusing signal but has not reached dharana (PYS III.1).",
      "Attention beginning to consolidate. The 'scattering' (vikshepa, PYS I.30) is starting to reduce.",
      "Cognitive focus establishing. PYS I.32: 'eka-tattva-abhyasa' — practice on a single principle. Verbal fluency improving.",
      "Sustained cognitive enhancement. Dharana (PYS III.1) maturing toward dhyana (PYS III.2). Use this window for demanding work.",
      "Full cognitive enhancement. PYS III.4: samyama — unity of concentration, meditation, absorption — gateway to 'prajna-aloka.'",
    ],
    gamma:[
      `Brief gamma contact. MU's Turiya requires sustained practice. At ${cycles} cycle${cycles!==1?"s":""}, the mind has been pointed toward transcendence but has not arrived.`,
      "Initial dissolution of subject-object boundary. Gamma coherence correlates with non-dual states (Lutz et al., 2004) but stable access requires 5+ minutes.",
      "Observer-observed distinction beginning to soften. Compassion circuits activating. BG VI.29: 'seeing the Self in all beings.'",
      "Non-dual awareness glimpsed. Compassion circuits fully activated. PYS III.35: 'the qualities returning to their source.'",
      "Turiya. MU verse 12: 'Amatra is the fourth — it is Atman.' 40Hz gamma binding across all cortical regions (Davidson & Lutz, 2008).",
    ],
  };

  const protocols = [
    `Session: ${duration}s (${cycles} cycle${cycles!==1?"s":""}). Traditional minimum is 108 repetitions (one mala), but 11 reps (~${Math.round(11*CYCLE_DURATION/60)} min) is valid in Tantric tradition. Aim for 3-5 min next time. Post: sit quietly 1 min. Drink warm water.`,
    `${cycles} cycles completed. GS V.57 recommends minimum "twenty pranayamas" per sitting. Drink warm water. Sit quietly 2-3 min. Avoid phone immediately — parasympathetic window is fragile.`,
    brainState==="delta"||brainState==="theta"
      ?`${cycles} cycles at ${deity.freq}Hz. HYP II.11: "After pranayama, one should rest." Silence 5 min. Brahmi (Bacopa) tea for theta-state consolidation (Stough et al., 2001). Avoid screens 15 min. Journal insights. Sattvic food.`
      :brainState==="alpha"
      ?`${cycles} cycles. Practice 3 rounds Nadi Shodhana to lock in alpha — HYP II.10 prescribes this for nadi purification. Walk barefoot 5-10 min (Prithvi contact). Sattvic meal. Avoid agitating media 1 hour.`
      :`${cycles} cycles. Use next 60 min for focused work — neurochemically optimal window. SS III.22 prescribes Shankhapushpi for mental clarity. Light food. 3 rounds Surya Namaskar to channel energy.`,
    brainState==="delta"||brainState==="theta"
      ?`${cycles} cycles — meaningful practice. HYP II.78: "When the nadis are purified, signs manifest." Silence (Mauna) 10 min. Brahmi tea + Ashwagandha with warm milk before sleep. Yoga Nidra within 2 hours. Sleep before 10 PM. No screens 30 min.`
      :brainState==="alpha"
      ?`${cycles} cycles — GS considers this "beginning of true practice." 5 rounds Nadi Shodhana. Barefoot on earth 10 min. Khichdi with ghee. SS III.40: "eat moderately, sleep moderately." No agitating content 2 hours.`
      :`${cycles} cycles — solid cognitive practice. Use next 90 min for important intellectual work. Shankhapushpi or Gotu Kola. 6 rounds Surya Namaskar. PYS II.46: "sthira-sukham asanam."`,
    brainState==="gamma"
      ?`${cycles} cycles — advanced gamma practice. Mauna 20 min. Practice Metta meditation to radiate gamma coherence. Ashwagandha with warm milk. Avoid agitating content 3 hours. PYS I.14: firm ground requires long, uninterrupted, earnest practice.`
      :brainState==="delta"||brainState==="theta"
      ?`${cycles} cycles — complete practice by traditional standards. SS III.53-54 describes this as second stage (Ghata). Mauna 20 min. Brahmi + Ashwagandha. Yoga Nidra or Trataka evening. Sleep before 10 PM. No agitation 3 hours. Journal before sleep.`
      :`${cycles} cycles — excellent practice. HYP II.77: "By pranayama all diseases are cured." 5 rounds Nadi Shodhana, 10 min barefoot, Sattvic meal. Track patterns across sessions — PYS I.14 emphasizes consistency over intensity.`,
  ];

  const vibration = {
    frequency:`Your target was ${deity.freq}Hz in the ${BRAIN_STATES[brainState].name} band (${BRAIN_STATES[brainState].range}). ${brainState==="delta"?"Below audible threshold — felt as bodily vibration rather than sound.":brainState==="theta"?"At the edge of perception — the boundary between waking and dream consciousness.":brainState==="alpha"?"Relaxed wakefulness — the brain's natural 'idle' frequency when eyes close.":brainState==="beta"?"Active cognition — the brain's working frequency during focused tasks.":"High integration — binding distributed neural processes into unified awareness."}`,
    resonance:`The Anuswara nasal hum creates Helmholtz Resonance in the paranasal sinuses — the sinuses act as resonant cavities (like blowing across a bottle). Weitzberg & Lundberg (Karolinska, 2002) measured a ${noBoost}x increase in Nitric Oxide during sustained humming. NO is a vasodilator — it widens blood vessels, lowering blood pressure and increasing oxygen delivery to tissues.`,
    harmonics:`At ${deity.freq}Hz, the fundamental frequency generates harmonics at ${(deity.freq*2).toFixed(1)}Hz, ${(deity.freq*3).toFixed(1)}Hz, and ${(deity.freq*4).toFixed(1)}Hz. These overtones interact with different brain regions simultaneously. The Rig Veda (I.164.45) speaks of "four horns, three feet, two heads" — interpreted as harmonic structure of sacred sound.`,
    accuracy:`Your average resonance accuracy was ${Math.round(avgAcc)}%. ${avgAcc>70?"Excellent — sustained proximity to target frequency maximizes entrainment.":avgAcc>40?"Moderate — the brain received intermittent entrainment signals. With practice, accuracy naturally improves as the vocal apparatus learns the target pitch.":"Low — this is normal for early practice. The vocal cords and breath support need training to sustain specific frequencies. Focus on the nasal hum quality rather than pitch precision."}`,
  };

  const t=Math.min(tier,4);
  return {
    body:(bodyMap[brainState]||bodyMap.alpha)[t],
    mind:(mindMap[brainState]||mindMap.alpha)[t],
    protocol:protocols[t],
    honesty:honest[t],
    vibration,
    noBoost,cycles,tier,avgAccuracy:Math.round(avgAcc),
  };
};

/* ═══════════════════════════════════════════════════════════════════════
   DEITY MANDALA — Procedural sacred geometry, audio-reactive
   ═══════════════════════════════════════════════════════════════════════ */
const DeityMandala = ({ deity, isActive, analyserRef, peaceScore, phase }) => {
  const canvasRef = useRef(null);
  const tRef = useRef(0);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const S = 400;
    const dpr = window.devicePixelRatio||1;
    canvas.width=S*dpr; canvas.height=S*dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr,dpr);

    let raf;
    const { petals, rings, color, freq } = deity;

    const hexToRgb=(h)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return{r,g,b};};
    const rgb = hexToRgb(color);

    const getAudioLevel = () => {
      if(!isActive||!analyserRef.current) return 0;
      const a=analyserRef.current;
      const d=new Uint8Array(a.frequencyBinCount);
      a.getByteTimeDomainData(d);
      let sum=0;for(let i=0;i<d.length;i++){const v=(d[i]-128)/128;sum+=v*v;}
      return Math.sqrt(sum/d.length);
    };

    const draw=()=>{
      tRef.current+=0.012;
      const T=tRef.current;
      const cx=S/2, cy=S/2;
      const audioLevel = getAudioLevel();
      const aL = isActive ? 0.3+audioLevel*3 : 0.15;
      const breathPulse = isActive && phase===0 ? Math.sin(T*1.2)*0.08 : 0;

      ctx.clearRect(0,0,S,S);

      // Background glow
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,S*0.48);
      bg.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},${0.03+audioLevel*0.06})`);
      bg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=bg;ctx.fillRect(0,0,S,S);

      ctx.save();
      ctx.translate(cx,cy);

      // === OUTER RINGS ===
      for(let i=0;i<rings;i++){
        const r = 60+i*32+breathPulse*50;
        const rot = T*(0.08+i*0.03)*(i%2===0?1:-1);
        ctx.save();ctx.rotate(rot);
        ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${0.06+aL*0.04-i*0.01})`;
        ctx.lineWidth=0.6;ctx.stroke();

        // Ring dots
        const dotCount = petals*(i+1);
        for(let j=0;j<dotCount;j++){
          const angle = (j/dotCount)*Math.PI*2;
          const dx = Math.cos(angle)*r;
          const dy = Math.sin(angle)*r;
          const dotR = 1+audioLevel*2;
          ctx.beginPath();ctx.arc(dx,dy,dotR,0,Math.PI*2);
          ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${0.1+aL*0.08})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // === PETAL / YANTRA GEOMETRY ===
      for(let layer=0;layer<3;layer++){
        const baseR = 40+layer*35+audioLevel*15;
        const rot = T*(0.15-layer*0.04)*(layer%2===0?1:-1);
        const alpha = 0.08+aL*0.1-layer*0.02;

        ctx.save();ctx.rotate(rot);

        // Draw petals as pointed ellipses
        for(let p=0;p<petals;p++){
          const angle = (p/petals)*Math.PI*2;
          ctx.save();ctx.rotate(angle);

          // Petal shape
          ctx.beginPath();
          const petalLen = baseR*(0.8+audioLevel*0.4);
          const petalW = Math.PI/(petals*1.5);
          ctx.moveTo(0,0);
          ctx.quadraticCurveTo(
            Math.sin(petalW)*petalLen*0.6, -petalLen*0.5,
            0, -petalLen
          );
          ctx.quadraticCurveTo(
            -Math.sin(petalW)*petalLen*0.6, -petalLen*0.5,
            0, 0
          );
          ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
          ctx.lineWidth=0.8+audioLevel*0.5;
          ctx.stroke();

          // Inner line
          ctx.beginPath();
          ctx.moveTo(0,-5);ctx.lineTo(0,-petalLen*0.7);
          ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${alpha*0.5})`;
          ctx.lineWidth=0.4;ctx.stroke();

          ctx.restore();
        }

        // Inner triangles (alternating up/down)
        if(layer<2){
          const triR = baseR*0.6;
          const triPts = layer===0?3:6;
          ctx.beginPath();
          for(let t2=0;t2<triPts;t2++){
            const a2 = (t2/triPts)*Math.PI*2 - Math.PI/2;
            const tx = Math.cos(a2)*triR;
            const ty = Math.sin(a2)*triR;
            t2===0?ctx.moveTo(tx,ty):ctx.lineTo(tx,ty);
          }
          ctx.closePath();
          ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${alpha*0.7})`;
          ctx.lineWidth=0.5;ctx.stroke();
        }

        ctx.restore();
      }

      // === CENTER: Bindu + Glyph ===
      // Pulsing bindu
      const binduR = 6+Math.sin(T*2)*2+audioLevel*8;
      const binduGrad = ctx.createRadialGradient(0,0,0,0,0,binduR*2.5);
      binduGrad.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},${0.3+aL*0.2})`);
      binduGrad.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      ctx.fillStyle=binduGrad;
      ctx.fillRect(-binduR*3,-binduR*3,binduR*6,binduR*6);

      ctx.beginPath();ctx.arc(0,0,binduR,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${0.25+aL*0.15})`;
      ctx.fill();

      // Deity glyph
      ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${0.5+aL*0.2})`;
      ctx.font=`${isActive?"600":"300"} ${20+audioLevel*6}px 'Cormorant Garamond',serif`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(deity.glyph,0,1);

      // === PARTICLE RING (active only) ===
      if(isActive){
        const particleCount = 24+Math.floor(peaceScore/5);
        for(let i=0;i<particleCount;i++){
          const angle = (i/particleCount)*Math.PI*2 + T*0.3;
          const rVar = 130+Math.sin(T*2+i*0.5)*20+audioLevel*30;
          const px = Math.cos(angle)*rVar;
          const py = Math.sin(angle)*rVar;
          const pSize = 0.8+Math.sin(T*3+i)*0.5+audioLevel;
          const pAlpha = 0.1+Math.sin(T*2+i*0.3)*0.05+audioLevel*0.1;
          ctx.beginPath();ctx.arc(px,py,pSize,0,Math.PI*2);
          ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${pAlpha})`;
          ctx.fill();
        }
      }

      ctx.restore();
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[deity,isActive,phase,peaceScore,analyserRef]);

  return <canvas ref={canvasRef} style={{width:400,height:400,display:"block"}}/>;
};

/* ═══════════════════════════════════════════════════════════════════════
   BODY VISUALIZATION (compact)
   ═══════════════════════════════════════════════════════════════════════ */
const BodyVis = ({ isActive, deity, phase, peaceScore }) => {
  const canvasRef=useRef(null);const tR=useRef(0);const parts=useRef([]);
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;
    const ctx=c.getContext("2d");const W=280,H=440,dpr=window.devicePixelRatio||1;
    c.width=W*dpr;c.height=H*dpr;ctx.scale(dpr,dpr);
    if(!parts.current.length){for(let i=0;i<40;i++)parts.current.push({x:W/2+(Math.random()-0.5)*40,y:H*0.15+Math.random()*H*0.55,vx:(Math.random()-0.5)*0.2,vy:-0.15-Math.random()*0.3,size:1+Math.random()*1.5,life:Math.random(),speed:0.003+Math.random()*0.003});}
    let raf;const aIdx=deity.chakraIdx;const chC=CHAKRAS[aIdx].color;
    const draw=()=>{
      tR.current+=0.016;const T=tR.current;ctx.clearRect(0,0,W,H);const cx=W/2,bt=H*0.08;
      // Body silhouette
      ctx.beginPath();ctx.ellipse(cx,bt+24,20,26,0,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.02)";ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.lineWidth=0.6;ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-9,bt+48);ctx.lineTo(cx-9,bt+56);ctx.quadraticCurveTo(cx-38,bt+70,cx-35,bt+140);ctx.quadraticCurveTo(cx-32,bt+210,cx-22,bt+255);ctx.lineTo(cx-12,bt+255);ctx.quadraticCurveTo(cx-22,bt+300,cx-28,bt+345);ctx.lineTo(cx-16,bt+345);ctx.lineTo(cx-8,bt+260);ctx.lineTo(cx+8,bt+260);ctx.lineTo(cx+16,bt+345);ctx.lineTo(cx+28,bt+345);ctx.quadraticCurveTo(cx+22,bt+300,cx+12,bt+255);ctx.lineTo(cx+22,bt+255);ctx.quadraticCurveTo(cx+32,bt+210,cx+35,bt+140);ctx.quadraticCurveTo(cx+38,bt+70,cx+9,bt+56);ctx.lineTo(cx+9,bt+48);ctx.closePath();ctx.fillStyle="rgba(255,255,255,0.012)";ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.04)";ctx.stroke();
      // Spine
      const sG=isActive?0.12+Math.sin(T*2)*0.06:0.03;const grd=ctx.createLinearGradient(cx,bt+48,cx,bt+260);grd.addColorStop(0,"rgba(255,255,255,0)");grd.addColorStop(0.15,`rgba(212,168,67,${sG})`);grd.addColorStop(0.85,`rgba(212,168,67,${sG})`);grd.addColorStop(1,"rgba(255,255,255,0)");ctx.beginPath();ctx.moveTo(cx,bt+48);ctx.lineTo(cx,bt+260);ctx.strokeStyle=grd;ctx.lineWidth=isActive?2:1;ctx.stroke();
      // Nadis
      if(isActive){for(let side of[-1,1]){ctx.beginPath();for(let y=bt+52;y<bt+250;y+=2){const p=(y-bt-52)/198;const a=9*Math.sin(p*Math.PI*3.5+T*1.5*side);y===bt+52?ctx.moveTo(cx+a*side,y):ctx.lineTo(cx+a*side,y);}ctx.strokeStyle=side===-1?"rgba(91,141,239,0.08)":"rgba(232,93,58,0.08)";ctx.lineWidth=0.6;ctx.stroke();}}
      // Chakras
      CHAKRAS.forEach((ch,i)=>{const cy=bt+48+(ch.y/100)*215;const isTgt=i===aIdx;const r=isTgt?(7+Math.sin(T*3)*2):3.5;
        if(isActive&&isTgt){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r*3);g.addColorStop(0,ch.color+"35");g.addColorStop(1,ch.color+"00");ctx.fillStyle=g;ctx.fillRect(cx-r*3.5,cy-r*3.5,r*7,r*7);}
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=isActive&&isTgt?ch.color+"BB":ch.color+"22";ctx.fill();
        ctx.fillStyle=isTgt?ch.color+"99":"rgba(255,255,255,0.1)";ctx.font=(isTgt?"600 8px":"300 6px")+" 'Cormorant Garamond',serif";ctx.textAlign="left";ctx.fillText(ch.label,cx+14,cy+3);});
      // Brain
      if(isActive){const bs=getBrainState(deity.freq);const bC=BRAIN_STATES[bs].color;ctx.beginPath();for(let x=cx-24;x<cx+24;x++){const p=(x-cx+24)/48;const w=Math.sin(p*Math.PI*8+T*deity.freq*0.12)*3.5*(0.5+peaceScore/250);x===cx-24?ctx.moveTo(x,bt+15+w):ctx.lineTo(x,bt+15+w);}ctx.strokeStyle=bC+"66";ctx.lineWidth=0.8;ctx.stroke();ctx.fillStyle=bC+"77";ctx.font="bold 7px 'JetBrains Mono',monospace";ctx.textAlign="center";ctx.fillText(BRAIN_STATES[bs].name.toUpperCase(),cx,bt-2);}
      // Sinus NO
      if(isActive&&phase===2){const sY=bt+27;const sg=0.1+Math.sin(T*4)*0.07;for(let s of[-1,1]){ctx.beginPath();ctx.ellipse(cx+s*11,sY,6,3.5,0,0,Math.PI*2);ctx.fillStyle=`rgba(91,212,168,${sg})`;ctx.fill();}ctx.fillStyle=`rgba(91,212,168,${0.3+Math.sin(T*3)*0.12})`;ctx.font="bold 6px 'JetBrains Mono',monospace";ctx.textAlign="center";ctx.fillText("NO 15x",cx,sY+12);}
      // Vagus
      if(isActive&&(deity.id==="hanuman"||peaceScore>35)){const va=Math.min(0.2,peaceScore/300);ctx.strokeStyle=`rgba(74,222,128,${va})`;ctx.lineWidth=1.4;for(let s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*3,bt+42);ctx.quadraticCurveTo(cx+s*14,bt+95,cx+s*10,bt+150);ctx.quadraticCurveTo(cx+s*7,bt+195,cx+s*3,bt+230);ctx.stroke();}}
      // Heart
      const hB=Math.abs(Math.sin(T*3));ctx.beginPath();ctx.arc(cx,bt+110,4+hB*2*(isActive?1:0.3),0,Math.PI*2);ctx.fillStyle=isActive?`rgba(239,68,68,${0.1+hB*0.1})`:"rgba(239,68,68,0.03)";ctx.fill();
      // Particles
      if(isActive){const ty=bt+48+(CHAKRAS[aIdx].y/100)*215;parts.current.forEach(p=>{p.life+=p.speed;if(p.life>1){p.life=0;p.y=bt+55+Math.random()*200;p.x=cx+(Math.random()-0.5)*30;}p.y+=(ty-p.y)*0.003+p.vy;p.x+=p.vx+Math.sin(T+p.life*10)*0.2;const al=Math.sin(p.life*Math.PI)*0.3;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle=chC+Math.round(al*255).toString(16).padStart(2,"0");ctx.fill();});}
      raf=requestAnimationFrame(draw);
    };draw();return()=>cancelAnimationFrame(raf);
  },[isActive,deity,phase,peaceScore]);
  return <canvas ref={canvasRef} style={{width:280,height:440,display:"block"}}/>;
};

/* ═══════════════════════════════════════════════════════════════════════
   SESSION INSIGHTS with vibration resonance
   ═══════════════════════════════════════════════════════════════════════ */
const SessionInsights = ({ session, onShare, onClose }) => {
  if(!session)return null;
  const{deity,peaceScore,duration,brainState,accuracyLog}=session;
  const ins=generateInsights(brainState,duration,peaceScore,deity,accuracyLog);
  const grade=peaceScore>=80?"S":peaceScore>=60?"A":peaceScore>=40?"B":peaceScore>=20?"C":"D";
  const P=({title,color,children})=>(<div style={{padding:14,borderRadius:12,background:`${color}06`,border:`1px solid ${color}12`,marginBottom:14}}><div style={{fontSize:9,letterSpacing:2,color:`${color}88`,textTransform:"uppercase",marginBottom:8}}>{title}</div><p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.8,fontFamily:"'Cormorant Garamond',serif",margin:0}}>{children}</p></div>);

  return(
    <div style={{animation:"fadeIn 0.5s ease"}}><style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      <div style={{textAlign:"center",padding:"28px 20px",borderRadius:16,background:`linear-gradient(135deg,${deity.color}0A,rgba(255,255,255,0.02))`,border:`1px solid ${deity.color}18`,marginBottom:18}}>
        <div style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:6}}>Session Complete</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18}}>
          <div><div style={{fontSize:56,fontWeight:200,color:deity.color,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{Math.round(peaceScore)}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2}}>PEACE SCORE</div></div>
          <div style={{width:56,height:56,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`${deity.color}12`,border:`2px solid ${deity.color}40`,fontSize:24,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:deity.color}}>{grade}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:18,flexWrap:"wrap"}}>
          {[{l:"Duration",v:fmt(duration)},{l:"Cycles",v:`${ins.cycles} x 18s`},{l:"Deity",v:deity.name},{l:"Brain State",v:BRAIN_STATES[brainState].name},{l:"NO Boost",v:`~${ins.noBoost}x`},{l:"Avg Accuracy",v:`${ins.avgAccuracy}%`},{l:"Chakra",v:deity.chakra}].map(i=>(<div key={i.l} style={{textAlign:"center"}}><div style={{fontSize:7,letterSpacing:2,color:"rgba(255,255,255,0.18)",textTransform:"uppercase"}}>{i.l}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{i.v}</div></div>))}
        </div>
      </div>

      <P title={`Assessment / Tier ${ins.tier} of 4`} color="rgba(212,168,67">{ins.honesty}</P>

      <div style={{padding:14,borderRadius:12,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",marginBottom:10}}>Resonance Accuracy Timeline</div>
        <div style={{height:50,display:"flex",alignItems:"flex-end",gap:1}}>{(accuracyLog||[]).map((v,i)=>(<div key={i} style={{flex:1,height:`${Math.max(2,v)}%`,borderRadius:"2px 2px 0 0",background:v>60?`rgba(123,232,123,${0.25+v/250})`:v>30?`rgba(240,192,64,${0.25+v/250})`:`rgba(232,93,58,${0.25+v/250})`}}/>))}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:7,color:"rgba(255,255,255,0.12)"}}>Start</span><span style={{fontSize:7,color:"rgba(255,255,255,0.12)"}}>End</span></div>
      </div>

      <P title="Sharira / Body Effects" color="rgba(91,212,168">{ins.body}</P>
      <P title="Manas / Mind Effects" color="rgba(139,92,246">{ins.mind}</P>

      {/* Vibration Resonance Section */}
      <div style={{padding:14,borderRadius:12,background:"rgba(56,189,248,0.03)",border:"1px solid rgba(56,189,248,0.08)",marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(56,189,248,0.6)",textTransform:"uppercase",marginBottom:10}}>Vibration Resonance Analysis</div>
        {[{t:"Target Frequency",c:ins.vibration.frequency},{t:"Helmholtz Resonance / NO",c:ins.vibration.resonance},{t:"Harmonic Structure",c:ins.vibration.harmonics},{t:"Your Accuracy",c:ins.vibration.accuracy}].map(v=>(<div key={v.t} style={{marginBottom:10}}><div style={{fontSize:8,letterSpacing:1.5,color:"rgba(56,189,248,0.45)",textTransform:"uppercase",marginBottom:3}}>{v.t}</div><p style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.7,fontFamily:"'Cormorant Garamond',serif",margin:0}}>{v.c}</p></div>))}
      </div>

      <P title="Post-Sadhana Vidhi / Ancient Protocol" color="rgba(212,168,67">{ins.protocol}</P>

      <div style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.03)",marginBottom:18}}>
        <div style={{fontSize:8,letterSpacing:2,color:"rgba(255,255,255,0.15)",textTransform:"uppercase",marginBottom:6}}>Sources</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.18)",lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace"}}>PYS = Patanjali Yoga Sutra / HYP = Hatha Yoga Pradipika / MU = Mandukya Upanishad / SS = Shiva Samhita / GS = Gheranda Samhita / BG = Bhagavad Gita / Karolinska = Weitzberg & Lundberg 2002 / Lutz et al. 2004 / Bernardi et al. 2001</div>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={onShare} style={{flex:1,minWidth:130,padding:"13px 16px",borderRadius:99,border:"1px solid rgba(212,168,67,0.2)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.07)",color:"#D4A843"}}>Share Session</button>
        <button onClick={onClose} style={{flex:1,minWidth:130,padding:"13px 16px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.35)"}}>New Session</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════════════════════ */
const ShareModal=({session,onClose})=>{
  const[copied,setCopied]=useState(false);if(!session)return null;
  const txt=`Anuswara — The Sonic Body\n\nDeity: ${session.deity.name} (${session.deity.mantra})\nPeace Score: ${Math.round(session.peaceScore)}/100\nDuration: ${fmt(session.duration)}\nMantra Cycles: ${Math.floor(session.duration/18)}\nBrain State: ${BRAIN_STATES[session.brainState].name}\nChakra: ${session.deity.chakra}\nFrequency: ${session.deity.freq}Hz (${session.deity.domain})\n\nJoin: anuswara.vercel.app\n\n#Anuswara #MantraScience #BeejaMantra`;
  const doShare=async()=>{if(navigator.share){try{await navigator.share({title:"Anuswara Session",text:txt});}catch(_){}}else doCopy();};
  const doCopy=()=>{navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(5,5,10,0.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:460,width:"100%",maxHeight:"80vh",overflow:"auto",padding:"28px 22px",borderRadius:18,background:"linear-gradient(135deg,rgba(212,168,67,0.04),rgba(255,255,255,0.015))",border:"1px solid rgba(212,168,67,0.08)"}}>
        <div style={{fontSize:9,letterSpacing:3,color:"rgba(212,168,67,0.5)",textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>Share Your Session</div>
        <pre style={{background:"rgba(0,0,0,0.25)",borderRadius:10,padding:14,fontSize:11,color:"rgba(255,255,255,0.55)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word",border:"1px solid rgba(255,255,255,0.03)",maxHeight:260,overflow:"auto"}}>{txt}</pre>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={doShare} style={{flex:1,padding:"11px 14px",borderRadius:99,border:"1px solid rgba(212,168,67,0.2)",cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.08)",color:"#D4A843"}}>{navigator.share?"Share":"Copy"}</button>
          <button onClick={doCopy} style={{flex:1,padding:"11px 14px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(255,255,255,0.02)",color:copied?"#7BE87B":"rgba(255,255,255,0.35)"}}>{copied?"Copied":"Copy Text"}</button>
          <button onClick={onClose} style={{padding:"11px 14px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",fontSize:11,fontFamily:"'Cormorant Garamond',serif",background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.25)"}}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SANGHA — GROUP SADHNA (no emojis)
   ═══════════════════════════════════════════════════════════════════════ */
const SanghaModule=({deity,peaceScore})=>{
  const[roomCode,setRoomCode]=useState("");const[inRoom,setInRoom]=useState(false);
  const[participants,setParticipants]=useState([]);const[messages,setMessages]=useState([]);
  const[msgInput,setMsgInput]=useState("");const[myName,setMyName]=useState("Sadhaka");
  const[collectiveScore,setCollectiveScore]=useState(0);
  const simIv=useRef(null);const chatEnd=useRef(null);

  const createRoom=()=>{const code=Math.random().toString(36).substring(2,8).toUpperCase();setRoomCode(code);joinRoom(code);};
  const joinRoom=(code)=>{const c=code||roomCode;setInRoom(true);setRoomCode(c);
    const sims=[...SIMULATED_USERS].sort(()=>Math.random()-0.5).slice(0,2+Math.floor(Math.random()*3)).map(u=>({...u,peaceScore:0}));
    setParticipants(sims);
    setMessages([{from:"System",text:`Room ${c} created. Deity: ${deity.name} (${deity.mantra})`,time:Date.now(),system:true},...sims.map(s=>({from:"System",text:`${s.name} from ${s.location} joined`,time:Date.now(),system:true}))]);
    simIv.current=setInterval(()=>{setParticipants(prev=>prev.map(p=>({...p,peaceScore:Math.min(100,p.peaceScore+Math.random()*2.5)})));},2500);};
  const leaveRoom=()=>{setInRoom(false);setParticipants([]);setMessages([]);if(simIv.current)clearInterval(simIv.current);};
  useEffect(()=>()=>{if(simIv.current)clearInterval(simIv.current);},[]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  useEffect(()=>{if(!inRoom)return;const all=[peaceScore,...participants.map(p=>p.peaceScore)];setCollectiveScore(all.reduce((a,b)=>a+b,0)/all.length);},[peaceScore,participants,inRoom]);
  const sendMsg=()=>{if(!msgInput.trim())return;setMessages(prev=>[...prev,{from:myName,text:msgInput,time:Date.now()}]);setMsgInput("");
    setTimeout(()=>{const r=participants[Math.floor(Math.random()*participants.length)];if(r){const reps=["Om Shanti","Beautiful resonance","I feel the collective energy","Hari Om","Powerful vibrations today","Namaste","Going deeper","Such stillness","The field is growing","Jai"];setMessages(prev=>[...prev,{from:r.name,text:reps[Math.floor(Math.random()*reps.length)],time:Date.now()}]);}},1500+Math.random()*3000);};

  if(!inRoom)return(
    <div style={{padding:24,borderRadius:16,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:10,letterSpacing:3,color:"rgba(212,168,67,0.5)",textTransform:"uppercase",marginBottom:8}}>Sangha / Group Sadhana</div>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.35)",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.7,maxWidth:420,margin:"0 auto"}}>Practice together across distances. Vedic tradition holds that group resonance amplifies individual sadhana by the square of participants (Maharishi Effect).</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:300,margin:"0 auto"}}>
        <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder="Your name" style={{padding:"11px 14px",borderRadius:10,background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",color:"#E8E4DC",fontSize:14,fontFamily:"'Cormorant Garamond',serif",outline:"none"}}/>
        <button onClick={createRoom} style={{padding:"13px 18px",borderRadius:99,border:`1px solid ${deity.color}30`,cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:`${deity.color}0C`,color:deity.color}}>Create Room</button>
        <div style={{display:"flex",gap:6}}>
          <input value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())} placeholder="Code" style={{flex:1,padding:"11px 14px",borderRadius:10,background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",color:"#E8E4DC",fontSize:14,fontFamily:"'JetBrains Mono',monospace",outline:"none",letterSpacing:3,textAlign:"center"}}/>
          <button onClick={()=>joinRoom()} disabled={roomCode.length<4} style={{padding:"11px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",cursor:roomCode.length<4?"not-allowed":"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(255,255,255,0.035)",color:"rgba(255,255,255,0.35)",opacity:roomCode.length<4?0.4:1}}>Join</button>
        </div>
      </div>
    </div>);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:12,background:`${deity.color}06`,border:`1px solid ${deity.color}12`,flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.25)",textTransform:"uppercase"}}>Room</div><div style={{fontSize:16,fontFamily:"'JetBrains Mono',monospace",color:deity.color,letterSpacing:4}}>{roomCode}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.25)",textTransform:"uppercase"}}>Collective</div><div style={{fontSize:20,fontWeight:200,color:collectiveScore>50?"#7BE87B":"#F0C040",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(collectiveScore)}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{participants.length+1} practitioners</div><button onClick={leaveRoom} style={{fontSize:9,letterSpacing:1,color:"#E85D3A",background:"none",border:"none",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",padding:"3px 0"}}>Leave</button></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
        <div style={{padding:10,borderRadius:8,background:`${deity.color}08`,border:`1px solid ${deity.color}18`,textAlign:"center"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${deity.color}20`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:12,fontWeight:600,color:deity.color}}>{myName[0]}</div>
          <div style={{fontSize:11,fontWeight:600,color:deity.color,marginTop:4}}>{myName} (You)</div>
          <div style={{marginTop:5,height:3,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",width:`${peaceScore}%`,borderRadius:2,background:deity.color,transition:"width 0.5s"}}/></div>
          <div style={{fontSize:9,color:deity.color,fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{Math.round(peaceScore)}</div>
        </div>
        {participants.map(p=>(<div key={p.id} style={{padding:10,borderRadius:8,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)",textAlign:"center"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.4)"}}>{p.initial}</div>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",marginTop:4}}>{p.name}</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>{p.location}</div>
          <div style={{marginTop:5,height:3,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",width:`${p.peaceScore}%`,borderRadius:2,background:p.peaceScore>50?"#7BE87B":"#F0C040",transition:"width 0.5s"}}/></div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{Math.round(p.peaceScore)}</div>
        </div>))}
      </div>
      <div style={{borderRadius:12,background:"rgba(255,255,255,0.012)",border:"1px solid rgba(255,255,255,0.035)",overflow:"hidden"}}>
        <div style={{padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>Sangha Chat</div>
        <div style={{height:180,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:5}}>
          {messages.map((m,i)=>(<div key={i} style={{fontSize:13,lineHeight:1.5,color:m.system?"rgba(212,168,67,0.35)":"rgba(255,255,255,0.5)",fontStyle:m.system?"italic":"normal",fontFamily:"'Cormorant Garamond',serif"}}>{!m.system&&<span style={{fontWeight:600,color:m.from===myName?deity.color:"rgba(255,255,255,0.55)",marginRight:5}}>{m.from}:</span>}{m.text}</div>))}
          <div ref={chatEnd}/>
        </div>
        <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
          <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendMsg();}} placeholder="Type a message..." style={{flex:1,padding:"10px 14px",background:"transparent",border:"none",color:"#E8E4DC",fontSize:13,fontFamily:"'Cormorant Garamond',serif",outline:"none"}}/>
          <button onClick={sendMsg} style={{padding:"10px 16px",background:"transparent",border:"none",color:deity.color,cursor:"pointer",fontSize:13,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>Send</button>
        </div>
      </div>
    </div>);
};

/* ═══════════════════════════════════════════════════════════════════════
   CORE COMPONENTS — with FIXED accuracy (parabolic interpolation)
   ═══════════════════════════════════════════════════════════════════════ */

// Parabolic interpolation for sub-bin frequency resolution
const detectFrequency = (analyser, sampleRate) => {
  const bl = analyser.frequencyBinCount;
  const d = new Float32Array(bl);
  analyser.getFloatFrequencyData(d);

  // Find peak bin
  let maxVal=-Infinity, maxIdx=0;
  for(let i=2;i<bl-1;i++){if(d[i]>maxVal){maxVal=d[i];maxIdx=i;}}
  if(maxVal<-80) return {freq:null, level:maxVal};

  // Parabolic interpolation between bins for sub-bin accuracy
  const alpha = d[maxIdx-1];
  const beta = d[maxIdx];
  const gamma = d[maxIdx+1];
  const denom = alpha - 2*beta + gamma;
  let correction = 0;
  if(Math.abs(denom)>0.0001){
    correction = 0.5*(alpha-gamma)/denom;
  }

  const binWidth = sampleRate / (bl*2);
  const freq = (maxIdx + correction) * binWidth;
  return {freq: Math.max(0, freq), level: maxVal};
};

// Gaussian accuracy curve centered on target
const calcAccuracy = (detected, target, rangeLo, rangeHi) => {
  if(detected===null) return 0;
  const center = target;
  const halfRange = (rangeHi - rangeLo) / 2;
  const sigma = halfRange * 0.8; // 80% of half-range = 1 sigma

  const dist = Math.abs(detected - center);
  // Gaussian: e^(-dist^2 / (2*sigma^2))
  const gaussian = Math.exp(-(dist*dist)/(2*sigma*sigma));

  // Scale: within range = high accuracy, outside = gaussian falloff
  if(detected >= rangeLo && detected <= rangeHi){
    return 50 + gaussian * 50; // 50-100% when in range
  }
  // Outside range: rapid falloff
  const outsideDist = Math.min(Math.abs(detected-rangeLo), Math.abs(detected-rangeHi));
  const outerSigma = target * 0.3; // 30% of target freq
  return Math.max(0, 50 * Math.exp(-(outsideDist*outsideDist)/(2*outerSigma*outerSigma)));
};

const PeaceGauge=({score,size=170})=>{
  const s=6,r=(size-s*2)/2,circ=2*Math.PI*r,off=circ-(score/100)*circ;
  const c=score<25?"#E85D3A":score<50?"#F0C040":score<75?"#5BD4A8":"#7BE87B";
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0,margin:"0 auto"}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><defs><filter id="gg"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="ggl"><stop offset="0%" stopColor={c}/><stop offset="100%" stopColor={c} stopOpacity="0.3"/></linearGradient></defs><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={s}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ggl)" strokeWidth={s} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" filter="url(#gg)" style={{transition:"stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)"}}/></svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.3)",fontFamily:"'Cormorant Garamond',serif"}}>PEACE</span><span style={{fontSize:38,fontWeight:200,color:c,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{Math.round(score)}</span><span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:2}}>{score<25?"SEEKING":score<50?"ALIGNING":score<75?"RESONATING":"SAMADHI"}</span></div>
  </div>);
};

const FreqDisplay=({analyserRef,isActive,targetFreq,targetRange,sampleRate})=>{
  const[det,setDet]=useState(null);const[acc,setAcc]=useState(0);
  useEffect(()=>{
    if(!isActive||!analyserRef.current){setDet(null);setAcc(0);return;}
    const iv=setInterval(()=>{
      const a=analyserRef.current;if(!a)return;
      const result = detectFrequency(a, sampleRate);
      if(result.freq!==null){
        setDet(result.freq);
        setAcc(calcAccuracy(result.freq, targetFreq, targetRange[0], targetRange[1]));
      }else{setDet(null);setAcc(0);}
    },120);
    return()=>clearInterval(iv);
  },[isActive,analyserRef,targetFreq,targetRange,sampleRate]);
  return(<div style={{display:"flex",gap:14,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
    {[{l:"DETECTED",v:det?det.toFixed(1)+" Hz":"--",c:det?"#F0C040":"rgba(255,255,255,0.15)"},
      {l:"TARGET",v:targetFreq+" Hz",c:"rgba(255,255,255,0.35)"},
      {l:"ACCURACY",v:isActive&&det?Math.round(acc)+"%":"--",c:acc>60?"#7BE87B":acc>30?"#F0C040":"rgba(255,255,255,0.18)"},
    ].map((item,i)=>(<div key={item.l} style={{display:"flex",alignItems:"center",gap:14}}>
      {i>0&&<div style={{width:1,height:24,background:"rgba(255,255,255,0.05)"}}/>}
      <div style={{textAlign:"center"}}><div style={{fontSize:8,letterSpacing:2,color:"rgba(255,255,255,0.22)"}}>{item.l}</div><div style={{fontSize:16,fontFamily:"'JetBrains Mono',monospace",color:item.c}}>{item.v}</div></div>
    </div>))}
  </div>);
};

const BreathGuide=({isActive,mantra,onPhaseChange})=>{
  const[phase,setPhase]=useState(0);const[progress,setProgress]=useState(0);const[cycle,setCycle]=useState(0);const iv=useRef(null);
  const durs=[3000,6000,9000];
  const defs=[{label:"Inhale",icon:"/",inst:"3s -- deep diaphragmatic breath, expand belly"},{label:mantra,icon:"*",inst:"6s -- voice the beeja syllable from navel"},{label:"Anusvara Hum",icon:"~",inst:"9s -- seal lips, sustain nasal resonance"}];
  useEffect(()=>{if(!isActive){setPhase(0);setProgress(0);setCycle(0);if(iv.current)clearInterval(iv.current);return;}
    let e=0,cp=0;iv.current=setInterval(()=>{e+=50;setProgress(Math.min(e/durs[cp],1));if(e>=durs[cp]){e=0;cp=(cp+1)%3;if(cp===0)setCycle(c=>c+1);setPhase(cp);onPhaseChange?.(cp);}},50);
    return()=>clearInterval(iv.current);},[isActive,mantra]);
  const cur=defs[phase];const bc=phase===0?"#5B8DEF":phase===1?"#F0C040":"#7BE87B";
  return(<div><div style={{display:"flex",gap:2,marginBottom:8}}>{defs.map((_,i)=>(<div key={i} style={{flex:durs[i],height:4,borderRadius:2,background:"rgba(255,255,255,0.045)",overflow:"hidden",position:"relative"}}>{i===phase&&<div style={{position:"absolute",inset:0,borderRadius:2,background:bc,width:`${progress*100}%`,transition:"width 50ms linear"}}/>}{i<phase&&<div style={{position:"absolute",inset:0,borderRadius:2,background:bc,opacity:0.2}}/>}</div>))}</div>
    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20,color:bc,width:24,textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>{cur.icon}</span><div style={{flex:1}}><div style={{fontSize:13,color:bc,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>{cur.label}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>{cur.inst}</div></div>{isActive&&<span style={{fontSize:9,color:"rgba(255,255,255,0.13)",fontFamily:"'JetBrains Mono',monospace"}}>Cycle {cycle+1}</span>}</div></div>);
};

const MicOverlay=({status,onReq,onSkip})=>{if(status==="granted")return null;const d=status==="denied";
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(5,5,10,0.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{maxWidth:400,width:"100%",textAlign:"center",padding:"36px 24px",borderRadius:18,background:"linear-gradient(135deg,rgba(212,168,67,0.04),rgba(255,255,255,0.015))",border:"1px solid rgba(212,168,67,0.08)"}}>
      <div style={{width:60,height:60,borderRadius:"50%",margin:"0 auto 18px",display:"flex",alignItems:"center",justifyContent:"center",background:d?"rgba(232,93,58,0.1)":"rgba(212,168,67,0.07)",border:`1px solid ${d?"rgba(232,93,58,0.18)":"rgba(212,168,67,0.12)"}`,animation:d?"none":"micP 2.5s ease-in-out infinite"}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d?"#E85D3A":"#D4A843"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
      </div>
      <h2 style={{fontSize:18,fontWeight:300,margin:"0 0 6px",fontFamily:"'Cormorant Garamond',serif",color:d?"#E85D3A":"#D4A843"}}>{d?"Microphone Blocked":"Microphone Required"}</h2>
      <p style={{fontSize:12,color:"rgba(255,255,255,0.38)",lineHeight:1.7,fontFamily:"'Cormorant Garamond',serif"}}>{d?"Click the lock icon in your address bar, set Mic to Allow, then refresh.":"All analysis is local. No audio is recorded or transmitted."}</p>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:18}}>
        {!d&&<button onClick={onReq} style={{padding:"11px 24px",borderRadius:99,border:"1px solid rgba(212,168,67,0.2)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.08)",color:"#D4A843"}}>Enable</button>}
        <button onClick={onSkip} style={{padding:"11px 18px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.28)"}}>Skip</button>
      </div>
    </div>
    <style>{`@keyframes micP{0%,100%{box-shadow:0 0 0 0 rgba(212,168,67,0.12)}50%{box-shadow:0 0 0 14px rgba(212,168,67,0)}}`}</style>
  </div>);
};

/* ═══════════════════════════════════════════════════════════════════════
   GUIDE PAGE
   ═══════════════════════════════════════════════════════════════════════ */
const GuidePage=()=>{
  const S=({title,children})=>(<div style={{marginBottom:24}}><div style={{fontSize:11,letterSpacing:3,color:"rgba(212,168,67,0.55)",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>{title}</div><div style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.9,fontFamily:"'Cormorant Garamond',serif"}}>{children}</div></div>);

  return(
    <div style={{maxWidth:640,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:22,fontWeight:300,color:"#D4A843",fontFamily:"'Cormorant Garamond',serif",marginBottom:4}}>Sadhana Guide</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",letterSpacing:2}}>How to Practice with Anuswara</div>
      </div>

      <S title="What is Anuswara">
        <p style={{margin:"0 0 10px"}}>Anuswara (Anusvara) is the nasal resonance sound represented by the dot (bindu) above Sanskrit syllables. It is the "m" hum at the end of every Beeja mantra — the part where lips seal and sound vibrates through the nasal cavity and skull.</p>
        <p style={{margin:0}}>This app uses the bio-acoustic principle that humming creates Helmholtz Resonance in your paranasal sinuses. Research from the Karolinska Institute (Weitzberg & Lundberg, 2002) showed that humming increases Nitric Oxide production in the sinuses by approximately 15 times compared to quiet exhalation. NO is a vasodilator — it widens blood vessels, lowers blood pressure, and enhances oxygen delivery.</p>
      </S>

      <S title="The 3-6-9 Breath Cycle">
        <p style={{margin:"0 0 10px"}}>Each mantra repetition follows a precise 18-second cycle designed to maximize both the vocal resonance and the anusvara hum duration:</p>
        <div style={{padding:16,borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",marginBottom:12}}>
          <div style={{display:"flex",gap:8}}>
            {[{t:"3 seconds",l:"Inhale",c:"#5B8DEF",d:"Deep diaphragmatic breath through the nose. Let the belly expand fully — do not breathe into the chest. This activates the vagus nerve and prepares the full lung capacity for the extended exhalation."},
              {t:"6 seconds",l:"Beeja Syllable",c:"#F0C040",d:"Voice the seed syllable clearly from the navel center (Manipura). The consonant and vowel should be distinct. For example, in 'Gam' — the 'Ga' is voiced for 6 seconds with steady tone."},
              {t:"9 seconds",l:"Anusvara Hum",c:"#7BE87B",d:"Seal the lips. The 'mmm' hum resonates through the nasal passages, sinuses, and cranium. This is where the Helmholtz cavity effect activates. Maintain steady, even pressure — not loud, but consistent."}
            ].map(s=>(<div key={s.l} style={{flex:1,padding:10,borderRadius:8,border:`1px solid ${s.c}15`}}>
              <div style={{fontSize:9,color:s.c,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{s.t}</div>
              <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.5)",marginBottom:4}}>{s.l}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",lineHeight:1.6}}>{s.d}</div>
            </div>))}
          </div>
        </div>
        <p style={{margin:0}}>The 3-6-9 ratio ensures the anusvara receives 50% of total cycle time — the proportion at which sinus resonance is most effective. The beeja syllable at 33% establishes the vocal frequency before the hum sustains it.</p>
      </S>

      <S title="Choosing a Deity Module">
        <p style={{margin:"0 0 10px"}}>Each of the 11 deities maps to a specific brainwave frequency range. Choose based on your intention:</p>
        <div style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)"}}>
          {[{r:"Delta (0.5-4 Hz)",d:"Bhairava",u:"Deep release, fearlessness, sleep preparation"},
            {r:"Theta (4-8 Hz)",d:"Shiva",u:"Meditation, intuition, creative insight"},
            {r:"Alpha (8-13 Hz)",d:"Durga, Ganesha",u:"Calm alertness, stress relief, grounding"},
            {r:"Beta (13-30 Hz)",d:"Saraswati, Bagalamukhi",u:"Focus, learning, mental clarity"},
            {r:"Gamma (30-100+ Hz)",d:"Lakshmi, Kali, Krishna, Hanuman, Vishnu",u:"Transcendence, compassion, high integration"},
          ].map(r=>(<div key={r.r} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.02)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>{r.r}</div>
            <div style={{fontSize:13,color:"rgba(212,168,67,0.6)",marginTop:2}}>{r.d}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:1}}>{r.u}</div>
          </div>))}
        </div>
      </S>

      <S title="The Mandala Visualization">
        <p style={{margin:0}}>When you begin a session, a sacred geometry mandala specific to your chosen deity appears. This is not decorative — it serves as a Trataka (gazing) object. The ancient practice of Trataka (HYP II.31-32) involves steady, unblinking gaze at a single point. The mandala reacts to your voice in real-time: when your hum is strong, the geometry expands and particles flow. This bio-feedback loop helps you sustain focus without mental effort. Let your gaze rest softly on the central bindu (point) — do not strain.</p>
      </S>

      <S title="Understanding the Peace Score">
        <p style={{margin:"0 0 10px"}}>The Peace Score (0-100) is calculated using:</p>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(212,168,67,0.5)",padding:10,borderRadius:8,background:"rgba(255,255,255,0.02)",marginBottom:10}}>peaceScore += (accuracy x 2.5 x 0.2) / stressFactor</div>
        <p style={{margin:"0 0 8px"}}>Where accuracy is measured using parabolic interpolation on FFT frequency bins with a Gaussian accuracy curve centered on the target frequency. This means: the closer your humming frequency matches the target, the faster the score rises. The stress factor penalizes inconsistency.</p>
        <p style={{margin:0}}>Grades: S (80+) = exceptional resonance / A (60+) = strong practice / B (40+) = developing / C (20+) = early practice / D = brief or misaligned. A low score does not mean failure — it means the vocal apparatus is still learning the target frequency. Consistency matters more than any single score.</p>
      </S>

      <S title="Understanding the Insights">
        <p style={{margin:"0 0 10px"}}>After each session, insights are generated based on your actual duration, accuracy, and the brain-state frequency of your chosen deity. The system uses a 5-tier honesty model:</p>
        <div style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)"}}>
          {["Tier 0 (under 1 min): Acknowledges the initiation but makes no physiological claims.",
            "Tier 1 (1-3 min): Notes initial autonomic response with appropriate caveats.",
            "Tier 2 (3-7 min): Describes consolidating changes with research citations.",
            "Tier 3 (7-15 min): Reports reliable physiological markers backed by studies.",
            "Tier 4 (15+ min): Full traditional practice — complete claims with ancient and modern references.",
          ].map((t,i)=>(<div key={i} style={{padding:"6px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.02)":"none",fontSize:12,color:"rgba(255,255,255,0.35)",lineHeight:1.6}}>{t}</div>))}
        </div>
        <p style={{margin:"10px 0 0"}}>Every body effect, mind effect, and protocol cites specific verses from Yoga Sutra, Hatha Yoga Pradipika, Mandukya Upanishad, Shiva Samhita, Gheranda Samhita, or Bhagavad Gita — alongside modern neuroscience papers.</p>
      </S>

      <S title="Recommended Practice Duration">
        <p style={{margin:"0 0 10px"}}>Traditional prescriptions for mantra japa:</p>
        <div style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)"}}>
          {[{c:"11 cycles",t:"~3.3 min",n:"Minimum valid short practice (Tantric tradition)"},
            {c:"21 cycles",t:"~6.3 min",n:"Quarter mala — good for daily maintenance"},
            {c:"54 cycles",t:"~16 min",n:"Half mala — substantial practice, full physiological response"},
            {c:"108 cycles",t:"~32 min",n:"Full mala — traditional complete practice"},
          ].map(r=>(<div key={r.c} style={{display:"flex",gap:12,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.02)",alignItems:"baseline"}}>
            <div style={{fontSize:13,color:"rgba(212,168,67,0.6)",fontFamily:"'JetBrains Mono',monospace",minWidth:70}}>{r.c}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono',monospace",minWidth:55}}>{r.t}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>{r.n}</div>
          </div>))}
        </div>
      </S>

      <S title="Group Sadhana (Sangha)">
        <p style={{margin:0}}>The Sangha module lets you create or join a room with a 6-character code. Share this code with friends so they can join from anywhere. Each participant's Peace Score is visible to all, and a collective score shows the group average. The Vedic tradition describes the "Maharishi Effect" — that the square root of 1% of a population meditating together creates measurable field effects. While this app simulates participants for demonstration, the architecture is ready for real-time WebSocket integration in production.</p>
      </S>

      <S title="Posture and Environment">
        <p style={{margin:0}}>Sit in any comfortable position — Sukhasana (cross-legged), Padmasana (lotus), or even a chair with feet flat on the ground. Spine should be erect but not rigid. The Bhagavad Gita (VI.13) instructs: "Holding the body, head, and neck erect, steady and still." A quiet environment helps the frequency analyzer detect your voice accurately. Use headphones only if needed to block external noise — the microphone should remain uncovered to pick up your humming.</p>
      </S>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════ */
export default function App(){
  const[tab,setTab]=useState("sadhana");
  const[deity,setDeity]=useState(DEITIES[0]);
  const[isListening,setIsListening]=useState(false);
  const[peaceScore,setPeaceScore]=useState(0);
  const[sessionTime,setSessionTime]=useState(0);
  const[phase,setPhase]=useState(0);
  const[micPerm,setMicPerm]=useState("unknown");
  const[showMicOv,setShowMicOv]=useState(false);
  const[micErr,setMicErr]=useState(null);
  const[sampleRate,setSampleRate]=useState(44100);
  const[sessionResult,setSessionResult]=useState(null);
  const[showShare,setShowShare]=useState(false);
  const[accuracyLog,setAccuracyLog]=useState([]);
  const[showScience,setShowScience]=useState(false);
  const[sessionHistory,setSessionHistory]=useState([]);

  const audioCtxRef=useRef(null);const analyserRef=useRef(null);const streamRef=useRef(null);
  const sessIv=useRef(null);const scoreIv=useRef(null);

  useEffect(()=>{(async()=>{try{if(navigator.permissions?.query){const r=await navigator.permissions.query({name:"microphone"});setMicPerm(r.state);if(r.state!=="granted")setShowMicOv(true);r.addEventListener("change",()=>{setMicPerm(r.state);if(r.state==="granted")setShowMicOv(false);});}else{setMicPerm("prompt");setShowMicOv(true);}}catch(e){setMicPerm("prompt");setShowMicOv(true);}})();},[]);

  const requestMic=useCallback(async()=>{try{if(!navigator.mediaDevices?.getUserMedia){setMicErr("Browser doesn't support mic.");return;}const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());setMicPerm("granted");setShowMicOv(false);setMicErr(null);}catch(e){if(e.name==="NotAllowedError")setMicPerm("denied");else setMicErr(e.message||"Mic unavailable");}},[]);

  const startSession=useCallback(async()=>{try{setMicErr(null);
    if(!navigator.mediaDevices?.getUserMedia){setMicErr("Mic API unavailable.");return;}
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    setMicPerm("granted");
    const actx=new(window.AudioContext||window.webkitAudioContext)();
    const src=actx.createMediaStreamSource(stream);
    const an=actx.createAnalyser();an.fftSize=8192;an.smoothingTimeConstant=0.85;src.connect(an);
    audioCtxRef.current=actx;analyserRef.current=an;streamRef.current=stream;
    setSampleRate(actx.sampleRate);setIsListening(true);setSessionTime(0);setPeaceScore(0);
    setAccuracyLog([]);setSessionResult(null);

    sessIv.current=setInterval(()=>setSessionTime(t=>t+1),1000);

    const dr=deity.range,df=deity.freq;
    scoreIv.current=setInterval(()=>{
      const result = detectFrequency(an, actx.sampleRate);
      if(result.freq!==null){
        const acc = calcAccuracy(result.freq, df, dr[0], dr[1]) / 100;
        setAccuracyLog(prev=>{const n=[...prev,Math.round(acc*100)];return n.length>60?n.slice(-60):n;});
        setPeaceScore(prev=>{const sf=1+Math.max(0,1-acc)*0.5;return Math.min(100,prev+(0.2*acc*2.5)/sf);});
      }
    },200);
  }catch(e){if(e.name==="NotAllowedError"){setMicPerm("denied");setShowMicOv(true);}else setMicErr(e.message||"Mic error");}},[deity]);

  const stopSession=useCallback(()=>{
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    if(audioCtxRef.current)audioCtxRef.current.close();
    analyserRef.current=null;setIsListening(false);
    if(sessIv.current)clearInterval(sessIv.current);
    if(scoreIv.current)clearInterval(scoreIv.current);
    if(sessionTime>3){
      const result={deity,peaceScore,duration:sessionTime,brainState:getBrainState(deity.freq),accuracyLog:[...accuracyLog],timestamp:new Date()};
      setSessionResult(result);setSessionHistory(prev=>[result,...prev].slice(0,20));setTab("insights");
    }
  },[deity,peaceScore,sessionTime,accuracyLog]);

  useEffect(()=>()=>{
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    if(audioCtxRef.current)audioCtxRef.current.close();
    if(sessIv.current)clearInterval(sessIv.current);
    if(scoreIv.current)clearInterval(scoreIv.current);
  },[]);

  const tabs=[{id:"sadhana",label:"Sadhana"},{id:"insights",label:"Insights"},{id:"sangha",label:"Sangha"},{id:"guide",label:"Guide"}];

  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",color:"#E8E4DC",fontFamily:"'Cormorant Garamond',Georgia,serif",position:"relative"}}>
      {showMicOv&&<MicOverlay status={micPerm} onReq={requestMic} onSkip={()=>setShowMicOv(false)}/>}
      {showShare&&<ShareModal session={sessionResult} onClose={()=>setShowShare(false)}/>}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:`radial-gradient(ellipse at 50% 0%,${deity.color}06 0%,transparent 60%)`}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"18px 14px 90px"}}>
        <header style={{textAlign:"center",marginBottom:20}}>
          <h1 style={{fontSize:26,fontWeight:300,margin:0,letterSpacing:2,color:"#D4A843"}}>Anuswara</h1>
          <div style={{fontSize:10,fontWeight:300,letterSpacing:4,color:"rgba(255,255,255,0.22)",marginTop:2}}>THE SONIC BODY</div>
        </header>

        <div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:22}}>
          {tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",borderRadius:99,border:tab===t.id?`1px solid ${deity.color}28`:"1px solid rgba(255,255,255,0.03)",background:tab===t.id?`${deity.color}0A`:"transparent",cursor:"pointer",fontSize:11,letterSpacing:2,color:tab===t.id?deity.color:"rgba(255,255,255,0.25)",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,transition:"all 0.3s"}}>{t.label}</button>))}
        </div>

        {/* ═══ SADHANA ═══ */}
        {tab==="sadhana"&&(<>
          <div style={{overflowX:"auto",marginBottom:16,paddingBottom:4}}>
            <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
              {DEITIES.map(d=>(<button key={d.id} onClick={()=>{if(!isListening)setDeity(d);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 7px",borderRadius:8,minWidth:62,border:deity.id===d.id?`1px solid ${d.color}40`:"1px solid rgba(255,255,255,0.025)",background:deity.id===d.id?`${d.color}0A`:"transparent",cursor:"pointer",transition:"all 0.3s"}}>
                <span style={{fontSize:14,fontWeight:600,color:deity.id===d.id?d.color:"rgba(255,255,255,0.3)",fontFamily:"'Cormorant Garamond',serif"}}>{d.glyph}</span>
                <span style={{fontSize:8,letterSpacing:1,color:deity.id===d.id?d.color:"rgba(255,255,255,0.25)",fontWeight:600}}>{d.name}</span>
              </button>))}
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:18,background:`${deity.color}05`,border:`1px solid ${deity.color}10`,flexWrap:"wrap"}}>
            <span style={{fontSize:20,fontWeight:600,color:deity.color,fontFamily:"'Cormorant Garamond',serif"}}>{deity.glyph}</span>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:15,fontWeight:600,color:deity.color}}>{deity.name} <span style={{fontWeight:300,fontSize:13,color:"rgba(255,255,255,0.28)",fontStyle:"italic"}}>{deity.mantra}</span></div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:1}}>{deity.freq}Hz / {deity.domain} / {deity.chakra}</div>
            </div>
            <button onClick={()=>setShowScience(!showScience)} style={{fontSize:9,letterSpacing:1,color:"rgba(255,255,255,0.22)",background:"none",border:"1px solid rgba(255,255,255,0.05)",borderRadius:99,padding:"5px 10px",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif"}}>{showScience?"Hide":"Science"}</button>
          </div>
          {showScience&&(<div style={{padding:12,borderRadius:10,background:"rgba(91,141,239,0.03)",border:"1px solid rgba(91,141,239,0.06)",marginBottom:16}}>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.7,margin:0}}>{deity.desc}</p>
            <p style={{fontSize:11,color:"rgba(91,212,168,0.45)",lineHeight:1.7,margin:"6px 0 0"}}>The Anusvara nasal hum creates Helmholtz Resonance in paranasal sinuses, increasing Nitric Oxide ~15x (Karolinska Institute), triggering vasodilation and parasympathetic activation.</p>
          </div>)}

          {/* Main: Mandala + Body + Controls */}
          <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"center"}}>
            {/* Deity Mandala */}
            <div style={{flex:"0 0 auto",borderRadius:14,background:"rgba(255,255,255,0.005)",border:"1px solid rgba(255,255,255,0.02)",overflow:"hidden"}}>
              <DeityMandala deity={deity} isActive={isListening} analyserRef={analyserRef} peaceScore={peaceScore} phase={phase}/>
            </div>

            {/* Controls */}
            <div style={{flex:1,minWidth:260,display:"flex",flexDirection:"column",gap:14}}>
              <PeaceGauge score={peaceScore}/>
              <FreqDisplay analyserRef={analyserRef} isActive={isListening} targetFreq={deity.freq} targetRange={deity.range} sampleRate={sampleRate}/>
              <BreathGuide isActive={isListening} mantra={deity.mantra} onPhaseChange={setPhase}/>
              {isListening&&<div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.18)",fontFamily:"'JetBrains Mono',monospace"}}>Session: {fmt(sessionTime)} / Cycle {Math.floor(sessionTime/18)+1}</div>}

              <button onClick={()=>{if(isListening){stopSession();}else if(micPerm==="denied"){setShowMicOv(true);}else{startSession();}}}
                style={{padding:"13px 18px",borderRadius:99,cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,transition:"all 0.3s",background:isListening?"rgba(232,93,58,0.1)":`${deity.color}12`,color:isListening?"#E85D3A":deity.color,border:`1px solid ${isListening?"rgba(232,93,58,0.22)":deity.color+"28"}`}}>
                {isListening?"End Session":micPerm==="denied"?"Enable Mic":"Begin Sadhana"}
              </button>
              {micErr&&<div style={{fontSize:11,color:"#E85D3A",padding:8,borderRadius:6,background:"rgba(232,93,58,0.05)",textAlign:"center"}}>{micErr}</div>}

              <div style={{display:"flex",gap:5}}>
                {[{s:1,l:"Inhale",p:"3s",c:"#5B8DEF"},{s:2,l:"Syllable",p:"6s",c:"#F0C040"},{s:3,l:"Anusvara",p:"9s",c:"#7BE87B"}].map(({s,l,p,c})=>(
                  <div key={s} style={{flex:1,padding:"8px 6px",borderRadius:6,textAlign:"center",background:phase===s-1&&isListening?`${c}0A`:"rgba(255,255,255,0.01)",border:`1px solid ${phase===s-1&&isListening?c+"20":"rgba(255,255,255,0.025)"}`,transition:"all 0.3s"}}>
                    <div style={{fontSize:14,fontWeight:300,color:c,opacity:0.55}}>{s}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:1}}>{l}</div>
                    <div style={{fontSize:8,color:c,marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>{p}</div>
                  </div>))}
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ INSIGHTS ═══ */}
        {tab==="insights"&&(sessionResult?
          <SessionInsights session={sessionResult} onShare={()=>setShowShare(true)} onClose={()=>{setSessionResult(null);setTab("sadhana");}}/>
          :<div style={{textAlign:"center",padding:"50px 18px"}}>
            <div style={{fontSize:28,marginBottom:14,opacity:0.15,fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.3)"}}>Insights</div>
            <div style={{fontSize:16,color:"rgba(255,255,255,0.28)",fontFamily:"'Cormorant Garamond',serif"}}>Complete a session to see your insights</div>
            {sessionHistory.length>0&&<div style={{marginTop:28,maxWidth:460,margin:"28px auto 0"}}>
              <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.18)",textTransform:"uppercase",marginBottom:10}}>Past Sessions</div>
              {sessionHistory.map((s,i)=>(<button key={i} onClick={()=>setSessionResult(s)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",borderRadius:8,marginBottom:5,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:14,fontWeight:600,color:s.deity.color}}>{s.deity.glyph}</span>
                <div style={{flex:1}}><div style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{s.deity.name} / {fmt(s.duration)}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.18)"}}>{s.timestamp.toLocaleString()}</div></div>
                <div style={{fontSize:16,fontWeight:200,color:s.peaceScore>=50?"#7BE87B":"#F0C040",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(s.peaceScore)}</div>
              </button>))}
            </div>}
          </div>
        )}

        {/* ═══ SANGHA ═══ */}
        {tab==="sangha"&&<SanghaModule deity={deity} peaceScore={peaceScore}/>}

        {/* ═══ GUIDE ═══ */}
        {tab==="guide"&&<GuidePage/>}

        <footer style={{textAlign:"center",marginTop:36}}><div style={{fontSize:8,letterSpacing:3,color:"rgba(255,255,255,0.06)"}}>ANUSWARA / THE SONIC BODY / BIO-ACOUSTIC MANTRA LAB</div></footer>
      </div>
    </div>
  );
}
