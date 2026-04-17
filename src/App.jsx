import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   DATA — targetType: "pitch" = vocal frequency match, "entrainment" = brainwave target (hum quality)
   ═══════════════════════════════════════════════════════════════════════ */
const DEITIES = [
  {id:"ganesha",name:"Ganesha",mantra:"Gam",freq:14,range:[12,16],domain:"Grounding",color:"#E85D3A",glyph:"गं",chakra:"Muladhara",chakraIdx:0,element:"Earth",petals:4,rings:3,targetType:"entrainment",desc:"14Hz grounds awareness, anchoring Prana at the base. The brainwave target is achieved through rhythmic repetition, not vocal pitch."},
  {id:"shiva",name:"Shiva",mantra:"Om",freq:7.83,range:[6,10],domain:"Schumann Resonance",color:"#5B8DEF",glyph:"शिव",chakra:"Sahasrara",chakraIdx:6,element:"Akasha",petals:12,rings:5,targetType:"entrainment",desc:"7.83Hz aligns with Earth's electromagnetic pulse. Entrainment occurs through sustained rhythmic practice, not direct vocal production."},
  {id:"durga",name:"Durga",mantra:"Dum",freq:11,range:[10,12],domain:"Alpha Protection",color:"#D4503A",glyph:"दुं",chakra:"Manipura",chakraIdx:2,element:"Fire",petals:8,rings:4,targetType:"entrainment",desc:"Alpha-band 10-12Hz builds a psycho-acoustic shield. Rhythmic chanting at 18s cycles drives alpha entrainment."},
  {id:"lakshmi",name:"Lakshmi",mantra:"Shrim",freq:45,range:[40,50],domain:"Abundance / Gamma",color:"#F0C040",glyph:"श्रीं",chakra:"Anahata",chakraIdx:3,element:"Water",petals:16,rings:4,targetType:"entrainment",desc:"45Hz gamma synchrony through sustained vocal resonance and rhythmic structure."},
  {id:"saraswati",name:"Saraswati",mantra:"Aim",freq:26,range:[22,30],domain:"Cognitive Focus",color:"#D8D0C0",glyph:"ऐं",chakra:"Vishuddha",chakraIdx:4,element:"Akasha",petals:6,rings:3,targetType:"entrainment",desc:"26Hz beta resonance sharpens cognition. Achieved through focused mantra cadence."},
  {id:"hanuman",name:"Hanuman",mantra:"Ham",freq:392,range:[370,415],domain:"Vagus Nerve",color:"#FF6B2B",glyph:"हं",chakra:"Vishuddha",chakraIdx:4,element:"Air",petals:10,rings:5,targetType:"pitch",desc:"392Hz (G4) stimulates the vagus nerve. This is in human vocal range — match the pitch for direct resonance."},
  {id:"kali",name:"Kali",mantra:"Krim",freq:33,range:[30,36],domain:"Transformation",color:"#9B3DC7",glyph:"क्रीं",chakra:"Ajna",chakraIdx:5,element:"Fire",petals:3,rings:4,targetType:"entrainment",desc:"33Hz gamma at the third eye. Entrainment through sustained anusvara resonance."},
  {id:"krishna",name:"Krishna",mantra:"Klim",freq:33,range:[30,36],domain:"Attraction",color:"#2D8AE0",glyph:"क्लीं",chakra:"Anahata",chakraIdx:3,element:"Water",petals:8,rings:4,targetType:"entrainment",desc:"33Hz heart resonance through devoted rhythmic chanting."},
  {id:"vishnu",name:"Vishnu",mantra:"Dam",freq:293.7,range:[280,310],domain:"Preservation",color:"#3D8ACA",glyph:"दं",chakra:"Anahata",chakraIdx:3,element:"Water",petals:12,rings:3,targetType:"pitch",desc:"293.7Hz (D4) preserves harmonic equilibrium. In vocal range — match the pitch for direct frequency resonance."},
  {id:"bhairava",name:"Bhairava",mantra:"Bhram",freq:2.5,range:[0.5,4],domain:"Delta / Fearlessness",color:"#C7384A",glyph:"भ्रां",chakra:"Muladhara",chakraIdx:0,element:"Earth",petals:5,rings:3,targetType:"entrainment",desc:"Delta-range. The deepest brainwave state, induced by slow rhythmic repetition, not vocal pitch."},
  {id:"bagalamukhi",name:"Bagalamukhi",mantra:"Hlim",freq:20,range:[17,23],domain:"Stillness",color:"#C4A82B",glyph:"ह्लीं",chakra:"Ajna",chakraIdx:5,element:"Akasha",petals:6,rings:4,targetType:"entrainment",desc:"20Hz threshold of audibility. Stillness achieved through rhythmic repetition."},
];

const CHAKRAS=[
  {name:"Muladhara",color:"#E85D3A",y:88,label:"Root"},
  {name:"Svadhisthana",color:"#F09030",y:78,label:"Sacral"},
  {name:"Manipura",color:"#F0C040",y:66,label:"Solar"},
  {name:"Anahata",color:"#4ADE80",y:52,label:"Heart"},
  {name:"Vishuddha",color:"#38BDF8",y:40,label:"Throat"},
  {name:"Ajna",color:"#8B5CF6",y:26,label:"Third Eye"},
  {name:"Sahasrara",color:"#E0D0FF",y:18,label:"Crown"},
];

const BRAIN_STATES={
  delta:{name:"Delta",range:"0.5-4 Hz",state:"Deep Dreamless / Prajna",color:"#6366F1"},
  theta:{name:"Theta",range:"4-8 Hz",state:"Meditation / Svapna",color:"#8B5CF6"},
  alpha:{name:"Alpha",range:"8-13 Hz",state:"Relaxed Awareness",color:"#38BDF8"},
  beta:{name:"Beta",range:"13-30 Hz",state:"Focused Cognition",color:"#4ADE80"},
  gamma:{name:"Gamma",range:"30-100 Hz",state:"Transcendent Unity",color:"#F0C040"},
};
const getBrainState=(f)=>{if(f<4)return"delta";if(f<8)return"theta";if(f<13)return"alpha";if(f<30)return"beta";return"gamma";};

const CYCLE_DURATION=18;
const fmt=(s)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

const SIMULATED_USERS=[
  {id:"s1",name:"Arjun",location:"Varanasi",initial:"A"},
  {id:"s2",name:"Priya",location:"Pune",initial:"P"},
  {id:"s3",name:"Kavya",location:"Bengaluru",initial:"K"},
  {id:"s4",name:"Rishi",location:"London",initial:"R"},
];

/* ═══════════════════════════════════════════════════════════════════════
   MEASUREMENT ENGINE — dual model
   ═══════════════════════════════════════════════════════════════════════ */

// Parabolic interpolation for sub-bin frequency resolution
const detectPitch=(analyser,sampleRate)=>{
  const bl=analyser.frequencyBinCount,d=new Float32Array(bl);
  analyser.getFloatFrequencyData(d);
  let maxVal=-Infinity,maxIdx=0;
  for(let i=2;i<bl-1;i++){if(d[i]>maxVal){maxVal=d[i];maxIdx=i;}}
  if(maxVal<-75)return{freq:null,level:maxVal};
  const a=d[maxIdx-1],b=d[maxIdx],g=d[maxIdx+1];
  const denom=a-2*b+g;
  const corr=Math.abs(denom)>0.0001?0.5*(a-g)/denom:0;
  const binW=sampleRate/(bl*2);
  return{freq:Math.max(0,(maxIdx+corr)*binW),level:maxVal};
};

// Measure hum quality for entrainment deities (voice presence + steadiness)
const measureHumQuality=(analyser)=>{
  const bl=analyser.frequencyBinCount;
  const td=new Uint8Array(bl);
  analyser.getByteTimeDomainData(td);

  // RMS energy (voice presence)
  let sum=0;
  for(let i=0;i<bl;i++){const v=(td[i]-128)/128;sum+=v*v;}
  const rms=Math.sqrt(sum/bl);
  const presence=Math.min(1,rms*8); // 0-1, saturates at moderate volume

  // Spectral flatness approximation (tonal vs noise)
  const fd=new Float32Array(bl);
  analyser.getFloatFrequencyData(fd);
  let logSum=0,linSum=0,count=0;
  for(let i=4;i<200;i++){ // focus on vocal range bins
    const v=Math.pow(10,fd[i]/20);
    if(v>0){logSum+=Math.log(v);linSum+=v;count++;}
  }
  const geoMean=Math.exp(logSum/count);
  const ariMean=linSum/count;
  const tonality=ariMean>0?1-(geoMean/ariMean):0; // higher = more tonal (humming)
  const steadiness=Math.min(1,tonality*1.5);

  // Combined quality score
  const quality=presence*0.4+steadiness*0.6;
  return{quality:Math.min(1,quality)*100, presence:presence*100, steadiness:steadiness*100, rms};
};

// Pitch accuracy for vocal-range deities (Hanuman, Vishnu)
const measurePitchAccuracy=(analyser,sampleRate,targetFreq,rangeLo,rangeHi)=>{
  const result=detectPitch(analyser,sampleRate);
  if(result.freq===null)return{accuracy:0,detectedFreq:null};
  const f=result.freq;
  const sigma=(rangeHi-rangeLo)*0.4;
  const dist=Math.abs(f-targetFreq);
  const acc=Math.exp(-(dist*dist)/(2*sigma*sigma))*100;
  return{accuracy:acc,detectedFreq:f};
};

/* ═══════════════════════════════════════════════════════════════════════
   INSIGHT ENGINE (abbreviated — same 5-tier system)
   ═══════════════════════════════════════════════════════════════════════ */
const generateInsights=(brainState,duration,peaceScore,deity,accuracyLog)=>{
  const cycles=Math.floor(duration/CYCLE_DURATION);
  const avgAcc=accuracyLog.length>0?accuracyLog.reduce((a,b)=>a+b,0)/accuracyLog.length:0;
  const minutes=duration/60;
  const noBoost=minutes<1?Math.round(1+minutes*3):minutes<3?Math.round(3+(minutes-1)*2.5):minutes<10?Math.round(8+(minutes-3)):15;
  const tier=minutes<1?0:minutes<3?1:minutes<7?2:minutes<15?3:4;

  const honest=[
    `Brief initiation: ${duration}s (${cycles} cycle${cycles!==1?"s":""}). HYP II.2: "Pranayama should be practiced gradually." Starting matters, but physiological shifts need sustained practice.`,
    `Initial autonomic response triggered. Parasympathetic engagement begins within 60-90s of rhythmic humming (Stromberg et al., 2002). Deeper shifts require 7+ minutes.`,
    `Entering the consolidation threshold. GS V.75: "Prana beginning to enter the Sushumna." Measurable changes are forming.`,
    `Sustained practice — reliable physiological markers. EEG entrainment stabilizes after 7-10 min of rhythmic vocalization (Bernardi et al.).`,
    `Traditionally complete duration. SS III.53-54 prescribes deepening pranic absorption at this length. Full Helmholtz cycling achieved.`,
  ];

  const bodyMap={delta:["Brief delta exposure. Orienting response only.","Initial vagal tone shift. ANS beginning to downregulate. HYP II.3: 'When the breath wanders, the mind is unsteady.'",`Parasympathetic deepening. Cortisol ~8-12% reduction (Bernardi). NO vasodilation at ~${noBoost}x in ${CHAKRAS[deity.chakraIdx].name} region.`,`Significant shift. GH pulsatility enhanced (Takahashi, 1968). NO at ~${noBoost}x. NK cells upregulating (Davidson, 2003).`,`Deep cellular repair. MU III.34-35: 'all dualities absorbed.' Synaptic homeostasis (Tononi & Cirelli, 2006). GH peak. Immune restoration.`],
    theta:["Brief theta contact. PYS I.38: dream-knowledge is valid, but more time needed.","Limbic calming initiated. Theta begins after ~90s (Lazar, 2005). Amygdala downregulating.",`Theta entrainment forming. Cortisol ~10-15%. HYP II.78: 'Prana flows in Sushumna, mind becomes steady.' Serotonin pathways activating.`,`Sustained theta. Cortisol ~18-23%. DMN deactivation (Brewer, 2011). Melatonin precursors active.`,`Full Svapna immersion (MU verse 4). Hypnagogic gateway open. Cortisol ~23%. Complete limbic-cortical integration.`],
    alpha:["Brief alpha signal. PYS I.34 recommends breath regulation but more time needed.","Alpha onset. Posterior rhythm strengthening within 60-90s (Cahn & Polich, 2006). NO initiated.",`Alpha stabilizing. BP normalizing. NO sustained ~${noBoost}x (Karolinska). GS V.84: 'breath like unflickering flame.'`,`Equilibrium achieved. BP normalized. NO ~${noBoost}x for ~30 min post. HRV improved. PYS II.52: 'covering over inner light diminished.'`,`Full alpha dominance. NO ~${noBoost}x for ~45 min. HYP II.77: 'nadis purified, body luminous.' Baroreflex enhanced.`],
    beta:["Brief beta stimulation. PYS III.1: dharana needs sustained effort.","Initial prefrontal activation. Beta needs 3+ min to stabilize (Lutz, 2004). Dopamine responding.","Beta coherence forming. PFC activated. DA/NE finding balance. SS III.21: 'Saraswati awakening in throat.'","Sustained beta. PFC fully active. DA/NE balanced. Reaction time improved. PYS III.4: Samyama.","Full cognitive enhancement. PYS I.35: 'sensory engagement becomes lucid.' Use next 90 min for demanding work."],
    gamma:["Brief gamma exposure. PYS I.14: firm ground requires long, uninterrupted practice.","Initial gamma flickers. Needs 5+ min to stabilize (Lutz, 2004). Vagal tone responding.",`Gamma establishing. Vagal tone elevating. NO at ~${noBoost}x. MU verse 7: Turiya correlates with sustained gamma.`,`Significant gamma. Anti-inflammatory cascade (Tracey, 2009). NO at ~${noBoost}x. Cross-hemispheric binding increasing.`,`Full gamma coherence. MU verse 7: 'Turiya is Atman to be realized.' 40Hz binding across all cortex (Davidson & Lutz, 2008).`],
  };
  const mindMap={delta:["Brief contact. No significant subconscious access yet.","Mental deceleration beginning. BG VI.26: 'restrain the wandering mind.'","Surface patterns loosening. PYS I.2: 'citta-vrtti-nirodhah.' Fluctuations slowed.","Subconscious patterns surfacing. Samskaras (PYS II.15) becoming accessible.","Deep release. Prajna state (MU): 'consciousness unified and full of bliss.'"],
    theta:["Not yet at Svapna threshold (MU verse 4). Continue to access creative layer.","Guard at subconscious gate relaxing. Reduced censorship (Dietrich, 2004).","Approaching hypnagogic threshold. PYS I.38 validates dream-knowledge.","Gateway opening. Creative insights in 2-4 hours (Sio & Ormerod, 2009). Dreams enhanced.","Full Svapna. MU verse 4: 'antah-prajna.' Journal visions within 15 minutes."],
    alpha:["Brief calming. Inner critic not yet addressed.","Self-referential thought quieting. Reduced DMN activity (Brewer, 2011).","Inner critic measurably quieter. PYS I.33: alpha inclines toward maitri-karuna-mudita.","Equanimous awareness. Clarity enhanced 2-3 hours. BG II.48: 'samatvam yoga ucyate.'","Full equanimity. PYS I.33: balanced mind 'becomes clear and pleasant.'"],
    beta:["Focusing signal received but dharana (PYS III.1) not yet reached.","Attention consolidating. Vikshepa (PYS I.30) reducing.","Focus establishing. PYS I.32: 'eka-tattva-abhyasa.' Verbal fluency improving.","Dharana maturing toward dhyana (PYS III.2). Use this window for demanding work.","Full enhancement. PYS III.4: samyama — gateway to 'prajna-aloka.'"],
    gamma:["Brief contact. Turiya (MU) requires sustained practice.","Subject-object boundary beginning to dissolve. Stable access needs 5+ min.","Observer-observed softening. Compassion circuits activating. BG VI.29: 'Self in all beings.'","Non-dual awareness glimpsed. PYS III.35: 'qualities returning to source.'","Turiya. MU verse 12: 'Amatra is the fourth — it is Atman.'"],
  };

  const isPitch=deity.targetType==="pitch";
  const measureNote=isPitch
    ?`Your voice was measured for pitch accuracy against ${deity.freq}Hz (${deity.freq===392?"G4":"D4"}). This frequency is within human vocal range, so direct resonance matching is possible.`
    :`Your voice was measured for hum quality: presence (are you humming?), steadiness (is it tonal and consistent?), and sustained duration. The ${deity.freq}Hz target is a brainwave entrainment frequency — below vocal range — achieved through rhythmic repetition of the 18-second cycle, not by humming at that pitch.`;

  const vibration={
    frequency:`Target: ${deity.freq}Hz (${BRAIN_STATES[brainState].name} band, ${BRAIN_STATES[brainState].range}). ${isPitch?"This is a vocal pitch you can match directly.":"This is a brainwave frequency — the rhythm of your 18s mantra cycles induces this neural oscillation over time."}`,
    measurement:measureNote,
    resonance:`The anusvara nasal hum creates Helmholtz Resonance in the paranasal sinuses. Weitzberg & Lundberg (Karolinska, 2002): ~${noBoost}x increase in Nitric Oxide during sustained humming. NO is a vasodilator — widens blood vessels, lowers blood pressure, increases oxygen delivery.`,
    harmonics:`Your hum's fundamental generates harmonics that interact with cranial structures. Rig Veda I.164.45 describes harmonic structure of sacred sound. The anusvara specifically activates the sphenoid and ethmoid sinuses as resonant chambers.`,
    accuracy:`Average session quality: ${Math.round(avgAcc)}%. ${avgAcc>70?"Excellent — sustained, consistent practice.":avgAcc>40?"Moderate — building consistency. Focus on maintaining a steady, even hum through the full 9-second anusvara phase.":"Early practice — the key is sustaining the nasal hum without breaks. Volume does not matter; steadiness does."}`,
  };

  const t=Math.min(tier,4);
  return{body:(bodyMap[brainState]||bodyMap.alpha)[t],mind:(mindMap[brainState]||mindMap.alpha)[t],protocol:honest[t],vibration,noBoost,cycles,tier,avgAccuracy:Math.round(avgAcc)};
};

/* ═══════════════════════════════════════════════════════════════════════
   DEITY MANDALA
   ═══════════════════════════════════════════════════════════════════════ */
const DeityMandala=({deity,isActive,analyserRef,peaceScore,phase})=>{
  const canvasRef=useRef(null);const tRef=useRef(0);
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const S=380,dpr=window.devicePixelRatio||1;
    c.width=S*dpr;c.height=S*dpr;const ctx=c.getContext("2d");ctx.scale(dpr,dpr);
    let raf;const{petals,rings,color,freq}=deity;
    const hr=parseInt(color.slice(1,3),16),hg=parseInt(color.slice(3,5),16),hb=parseInt(color.slice(5,7),16);
    const getAL=()=>{if(!isActive||!analyserRef.current)return 0;const a=analyserRef.current;const d=new Uint8Array(a.frequencyBinCount);a.getByteTimeDomainData(d);let s=0;for(let i=0;i<d.length;i++){const v=(d[i]-128)/128;s+=v*v;}return Math.sqrt(s/d.length);};
    const draw=()=>{
      tRef.current+=0.012;const T=tRef.current;const cx=S/2,cy=S/2;
      const aL=isActive?0.3+getAL()*3:0.15;const bP=isActive&&phase===0?Math.sin(T*1.2)*0.06:0;
      ctx.clearRect(0,0,S,S);
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,S*0.48);
      bg.addColorStop(0,`rgba(${hr},${hg},${hb},${0.04+getAL()*0.05})`);bg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=bg;ctx.fillRect(0,0,S,S);
      ctx.save();ctx.translate(cx,cy);
      for(let i=0;i<rings;i++){const r=55+i*30+bP*45;const rot=T*(0.07+i*0.025)*(i%2===0?1:-1);
        ctx.save();ctx.rotate(rot);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${hr},${hg},${hb},${0.07+aL*0.04-i*0.008})`;ctx.lineWidth=0.7;ctx.stroke();
        const dc=petals*(i+1);for(let j=0;j<dc;j++){const an=(j/dc)*Math.PI*2;const dx=Math.cos(an)*r,dy=Math.sin(an)*r;
          ctx.beginPath();ctx.arc(dx,dy,1+getAL()*1.5,0,Math.PI*2);ctx.fillStyle=`rgba(${hr},${hg},${hb},${0.12+aL*0.06})`;ctx.fill();}ctx.restore();}
      for(let layer=0;layer<3;layer++){const bR=38+layer*32+getAL()*12;const rot=T*(0.12-layer*0.035)*(layer%2===0?1:-1);const al=0.09+aL*0.08-layer*0.015;
        ctx.save();ctx.rotate(rot);
        for(let p=0;p<petals;p++){const an=(p/petals)*Math.PI*2;ctx.save();ctx.rotate(an);
          ctx.beginPath();const pL=bR*(0.8+getAL()*0.3);const pW=Math.PI/(petals*1.5);
          ctx.moveTo(0,0);ctx.quadraticCurveTo(Math.sin(pW)*pL*0.55,-pL*0.5,0,-pL);ctx.quadraticCurveTo(-Math.sin(pW)*pL*0.55,-pL*0.5,0,0);
          ctx.strokeStyle=`rgba(${hr},${hg},${hb},${al})`;ctx.lineWidth=0.9+getAL()*0.4;ctx.stroke();
          ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,-pL*0.65);ctx.strokeStyle=`rgba(${hr},${hg},${hb},${al*0.4})`;ctx.lineWidth=0.3;ctx.stroke();
          ctx.restore();}
        if(layer<2){const tR=bR*0.55;const tP=layer===0?3:6;ctx.beginPath();for(let t2=0;t2<tP;t2++){const a2=(t2/tP)*Math.PI*2-Math.PI/2;const tx=Math.cos(a2)*tR,ty=Math.sin(a2)*tR;t2===0?ctx.moveTo(tx,ty):ctx.lineTo(tx,ty);}ctx.closePath();ctx.strokeStyle=`rgba(${hr},${hg},${hb},${al*0.6})`;ctx.lineWidth=0.5;ctx.stroke();}
        ctx.restore();}
      const bR2=5+Math.sin(T*2)*1.8+getAL()*6;const bG=ctx.createRadialGradient(0,0,0,0,0,bR2*2.5);
      bG.addColorStop(0,`rgba(${hr},${hg},${hb},${0.3+aL*0.15})`);bG.addColorStop(1,`rgba(${hr},${hg},${hb},0)`);
      ctx.fillStyle=bG;ctx.fillRect(-bR2*3,-bR2*3,bR2*6,bR2*6);
      ctx.beginPath();ctx.arc(0,0,bR2,0,Math.PI*2);ctx.fillStyle=`rgba(${hr},${hg},${hb},${0.3+aL*0.12})`;ctx.fill();
      ctx.fillStyle=`rgba(${hr},${hg},${hb},${0.6+aL*0.15})`;ctx.font=`${isActive?"600":"400"} ${18+getAL()*4}px 'Cormorant Garamond',serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(deity.glyph,0,1);
      if(isActive){const pC=20+Math.floor(peaceScore/5);for(let i=0;i<pC;i++){const an=(i/pC)*Math.PI*2+T*0.3;const rV=120+Math.sin(T*2+i*0.5)*18+getAL()*25;const px=Math.cos(an)*rV,py=Math.sin(an)*rV;const pS=0.7+Math.sin(T*3+i)*0.4+getAL()*0.8;const pA=0.1+Math.sin(T*2+i*0.3)*0.04+getAL()*0.08;ctx.beginPath();ctx.arc(px,py,pS,0,Math.PI*2);ctx.fillStyle=`rgba(${hr},${hg},${hb},${pA})`;ctx.fill();}}
      ctx.restore();raf=requestAnimationFrame(draw);};
    draw();return()=>cancelAnimationFrame(raf);
  },[deity,isActive,phase,peaceScore,analyserRef]);
  return <canvas ref={canvasRef} style={{width:380,height:380,display:"block",maxWidth:"100%"}}/>;
};

/* ═══════════════════════════════════════════════════════════════════════
   SESSION INSIGHTS
   ═══════════════════════════════════════════════════════════════════════ */
const SessionInsights=({session,onShare,onClose})=>{
  if(!session)return null;
  const{deity,peaceScore,duration,brainState,accuracyLog}=session;
  const ins=generateInsights(brainState,duration,peaceScore,deity,accuracyLog);
  const grade=peaceScore>=80?"S":peaceScore>=60?"A":peaceScore>=40?"B":peaceScore>=20?"C":"D";
  const projectedAt10=Math.min(100,peaceScore*(600/Math.max(duration,1)));
  const P=({title,accent,children})=>(<div style={{padding:16,borderRadius:14,background:`${accent}08`,border:`1px solid ${accent}15`,marginBottom:16}}><div style={{fontSize:10,letterSpacing:2.5,color:`${accent}99`,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>{title}</div><div style={{fontSize:15,color:"rgba(255,255,255,0.6)",lineHeight:1.85,fontFamily:"'Cormorant Garamond',serif"}}>{children}</div></div>);

  return(
    <div style={{animation:"fadeIn 0.5s ease"}}><style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
      {/* Score */}
      <div style={{textAlign:"center",padding:"32px 24px",borderRadius:18,background:`linear-gradient(135deg,${deity.color}0C,rgba(255,255,255,0.02))`,border:`1px solid ${deity.color}20`,marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:4,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",marginBottom:8}}>Session Complete</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
          <div><div style={{fontSize:60,fontWeight:200,color:deity.color,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{Math.round(peaceScore)}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginTop:2}}>PEACE SCORE</div></div>
          <div style={{width:60,height:60,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`${deity.color}15`,border:`2px solid ${deity.color}44`,fontSize:26,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:deity.color}}>{grade}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:20,flexWrap:"wrap"}}>
          {[{l:"Duration",v:fmt(duration)},{l:"Cycles",v:`${ins.cycles} x 18s`},{l:"Brain State",v:BRAIN_STATES[brainState].name},{l:"NO Boost",v:`~${ins.noBoost}x`},{l:"Quality",v:`${ins.avgAccuracy}%`},{l:"Projected 10m",v:`${Math.round(projectedAt10)}`},{l:"Tier",v:`${ins.tier}/4`}].map(i=>(<div key={i.l} style={{textAlign:"center",minWidth:60}}>
            <div style={{fontSize:8,letterSpacing:2,color:"rgba(255,255,255,0.3)",textTransform:"uppercase"}}>{i.l}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{i.v}</div>
          </div>))}
        </div>
      </div>

      <P title={`Honesty Assessment / Tier ${ins.tier}`} accent="rgba(212,168,67">{ins.protocol}</P>

      {/* Accuracy Timeline */}
      <div style={{padding:16,borderRadius:14,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",marginBottom:16}}>
        <div style={{fontSize:10,letterSpacing:2.5,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",marginBottom:12}}>Resonance Quality Over Time</div>
        <div style={{height:55,display:"flex",alignItems:"flex-end",gap:1}}>{(accuracyLog||[]).map((v,i)=>(<div key={i} style={{flex:1,height:`${Math.max(3,v)}%`,borderRadius:"2px 2px 0 0",background:v>60?`rgba(123,232,123,${0.3+v/200})`:v>30?`rgba(240,192,64,${0.3+v/200})`:`rgba(232,93,58,${0.3+v/200})`}}/>))}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>Start</span><span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>End</span></div>
      </div>

      <P title="Sharira / Body" accent="rgba(91,212,168">{ins.body}</P>
      <P title="Manas / Mind" accent="rgba(139,92,246">{ins.mind}</P>

      {/* Vibration Resonance */}
      <div style={{padding:16,borderRadius:14,background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.1)",marginBottom:16}}>
        <div style={{fontSize:10,letterSpacing:2.5,color:"rgba(56,189,248,0.7)",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>Vibration Resonance Analysis</div>
        {[{t:"Target Frequency",c:ins.vibration.frequency},{t:"What Was Measured",c:ins.vibration.measurement},{t:"Helmholtz Resonance / NO",c:ins.vibration.resonance},{t:"Harmonic Structure",c:ins.vibration.harmonics},{t:"Your Session Quality",c:ins.vibration.accuracy}].map(v=>(<div key={v.t} style={{marginBottom:12}}>
          <div style={{fontSize:9,letterSpacing:1.5,color:"rgba(56,189,248,0.55)",textTransform:"uppercase",marginBottom:4}}>{v.t}</div>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.55)",lineHeight:1.8,fontFamily:"'Cormorant Garamond',serif",margin:0}}>{v.c}</p>
        </div>))}
      </div>

      <div style={{padding:14,borderRadius:12,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",marginBottom:20}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.25)",textTransform:"uppercase",marginBottom:6}}>Sources</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace"}}>PYS=Patanjali Yoga Sutra / HYP=Hatha Yoga Pradipika / MU=Mandukya Upanishad / SS=Shiva Samhita / GS=Gheranda Samhita / BG=Bhagavad Gita / Karolinska=Weitzberg & Lundberg 2002 / Lutz 2004 / Bernardi 2001</div>
      </div>

      <div style={{display:"flex",gap:12}}>
        <button onClick={onShare} style={{flex:1,padding:"14px",borderRadius:99,border:"1px solid rgba(212,168,67,0.25)",cursor:"pointer",fontSize:13,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.08)",color:"#D4A843"}}>Share</button>
        <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:99,border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",fontSize:13,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.45)"}}>New Session</button>
      </div>
    </div>);
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARE + SANGHA (compact)
   ═══════════════════════════════════════════════════════════════════════ */
const ShareModal=({session,onClose})=>{const[copied,setCopied]=useState(false);if(!session)return null;
  const txt=`Anuswara -- The Sonic Body\n\nDeity: ${session.deity.name} (${session.deity.mantra})\nPeace Score: ${Math.round(session.peaceScore)}/100\nDuration: ${fmt(session.duration)} (${Math.floor(session.duration/18)} cycles)\nBrain State: ${BRAIN_STATES[session.brainState].name}\nChakra: ${session.deity.chakra}\nFrequency: ${session.deity.freq}Hz\n\nJoin: anuswara.vercel.app`;
  const doShare=async()=>{if(navigator.share){try{await navigator.share({title:"Anuswara",text:txt})}catch(_){}}else doCopy()};
  const doCopy=()=>{navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})};
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(5,5,10,0.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{maxWidth:440,width:"100%",padding:"28px 22px",borderRadius:18,background:"rgba(15,15,20,0.95)",border:"1px solid rgba(212,168,67,0.1)"}}>
    <div style={{fontSize:10,letterSpacing:3,color:"rgba(212,168,67,0.6)",textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>Share Session</div>
    <pre style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:14,fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word",border:"1px solid rgba(255,255,255,0.05)",maxHeight:240,overflow:"auto"}}>{txt}</pre>
    <div style={{display:"flex",gap:8,marginTop:14}}>
      <button onClick={doShare} style={{flex:1,padding:"12px",borderRadius:99,border:"1px solid rgba(212,168,67,0.25)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.08)",color:"#D4A843"}}>{navigator.share?"Share":"Copy"}</button>
      <button onClick={doCopy} style={{flex:1,padding:"12px",borderRadius:99,border:"1px solid rgba(255,255,255,0.06)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(255,255,255,0.03)",color:copied?"#7BE87B":"rgba(255,255,255,0.45)"}}>{copied?"Copied":"Copy Text"}</button>
    </div></div></div>);
};

const SanghaModule=({deity,peaceScore})=>{
  const[rc,setRc]=useState("");const[inRoom,setIn]=useState(false);const[parts,setParts]=useState([]);const[msgs,setMsgs]=useState([]);const[mi,setMi]=useState("");const[name,setName]=useState("Sadhaka");const[cs,setCs]=useState(0);const sIv=useRef(null);const ce=useRef(null);
  const create=()=>{const c=Math.random().toString(36).substring(2,8).toUpperCase();setRc(c);join(c)};
  const join=(code)=>{const c=code||rc;setIn(true);setRc(c);const s=[...SIMULATED_USERS].sort(()=>Math.random()-0.5).slice(0,2+Math.floor(Math.random()*2)).map(u=>({...u,ps:0}));setParts(s);setMsgs([{f:"System",t:`Room ${c} / ${deity.name}`,s:true},...s.map(x=>({f:"System",t:`${x.name} joined from ${x.location}`,s:true}))]);sIv.current=setInterval(()=>setParts(p=>p.map(x=>({...x,ps:Math.min(100,x.ps+Math.random()*2.2)}))),2500)};
  const leave=()=>{setIn(false);setParts([]);setMsgs([]);if(sIv.current)clearInterval(sIv.current)};
  useEffect(()=>()=>{if(sIv.current)clearInterval(sIv.current)},[]);
  useEffect(()=>{ce.current?.scrollIntoView({behavior:"smooth"})},[msgs]);
  useEffect(()=>{if(!inRoom)return;const a=[peaceScore,...parts.map(p=>p.ps)];setCs(a.reduce((a,b)=>a+b,0)/a.length)},[peaceScore,parts,inRoom]);
  const send=()=>{if(!mi.trim())return;setMsgs(p=>[...p,{f:name,t:mi}]);setMi("");setTimeout(()=>{const r=parts[Math.floor(Math.random()*parts.length)];if(r){const rr=["Om Shanti","Beautiful resonance","Hari Om","Deep vibrations today","Namaste","Going deeper","The field is growing"];setMsgs(p=>[...p,{f:r.name,t:rr[Math.floor(Math.random()*rr.length)]}])}},1500+Math.random()*3000)};

  if(!inRoom)return(<div style={{padding:28,borderRadius:18,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}}>
    <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:11,letterSpacing:3,color:"rgba(212,168,67,0.6)",textTransform:"uppercase",marginBottom:10}}>Sangha / Group Sadhana</div><p style={{fontSize:15,color:"rgba(255,255,255,0.5)",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.8,maxWidth:420,margin:"0 auto"}}>Practice across distances. Group resonance amplifies individual sadhana by the square of participants (Maharishi Effect).</p></div>
    <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:300,margin:"0 auto"}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#E8E4DC",fontSize:15,fontFamily:"'Cormorant Garamond',serif",outline:"none"}}/>
      <button onClick={create} style={{padding:"14px",borderRadius:99,border:`1px solid ${deity.color}35`,cursor:"pointer",fontSize:13,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:`${deity.color}0E`,color:deity.color}}>Create Room</button>
      <div style={{display:"flex",gap:8}}><input value={rc} onChange={e=>setRc(e.target.value.toUpperCase())} placeholder="Code" style={{flex:1,padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#E8E4DC",fontSize:15,fontFamily:"'JetBrains Mono',monospace",outline:"none",letterSpacing:4,textAlign:"center"}}/><button onClick={()=>join()} disabled={rc.length<4} style={{padding:"12px 20px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",cursor:rc.length<4?"not-allowed":"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",opacity:rc.length<4?0.4:1}}>Join</button></div>
    </div></div>);

  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderRadius:14,background:`${deity.color}08`,border:`1px solid ${deity.color}15`,flexWrap:"wrap",gap:10}}>
      <div><div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.35)",textTransform:"uppercase"}}>Room</div><div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",color:deity.color,letterSpacing:4}}>{rc}</div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.35)",textTransform:"uppercase"}}>Collective</div><div style={{fontSize:22,fontWeight:200,color:cs>50?"#7BE87B":"#F0C040",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(cs)}</div></div>
      <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{parts.length+1} online</div><button onClick={leave} style={{fontSize:10,color:"#E85D3A",background:"none",border:"none",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",padding:"3px 0"}}>Leave</button></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
      <div style={{padding:12,borderRadius:10,background:`${deity.color}0A`,border:`1px solid ${deity.color}20`,textAlign:"center"}}><div style={{width:30,height:30,borderRadius:"50%",background:`${deity.color}25`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:13,fontWeight:600,color:deity.color}}>{name[0]}</div><div style={{fontSize:12,fontWeight:600,color:deity.color,marginTop:4}}>{name} (You)</div><div style={{marginTop:6,height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${peaceScore}%`,borderRadius:2,background:deity.color,transition:"width 0.5s"}}/></div><div style={{fontSize:10,color:deity.color,fontFamily:"'JetBrains Mono',monospace",marginTop:4}}>{Math.round(peaceScore)}</div></div>
      {parts.map(p=>(<div key={p.id} style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",textAlign:"center"}}><div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.5)"}}>{p.initial}</div><div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.55)",marginTop:4}}>{p.name}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{p.location}</div><div style={{marginTop:6,height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${p.ps}%`,borderRadius:2,background:p.ps>50?"#7BE87B":"#F0C040",transition:"width 0.5s"}}/></div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontFamily:"'JetBrains Mono',monospace",marginTop:4}}>{Math.round(p.ps)}</div></div>))}
    </div>
    <div style={{borderRadius:14,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",textTransform:"uppercase"}}>Sangha Chat</div>
      <div style={{height:190,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:6}}>
        {msgs.map((m,i)=>(<div key={i} style={{fontSize:14,lineHeight:1.6,color:m.s?"rgba(212,168,67,0.45)":"rgba(255,255,255,0.6)",fontStyle:m.s?"italic":"normal",fontFamily:"'Cormorant Garamond',serif"}}>{!m.s&&<span style={{fontWeight:600,color:m.f===name?deity.color:"rgba(255,255,255,0.65)",marginRight:6}}>{m.f}:</span>}{m.t}</div>))}
        <div ref={ce}/></div>
      <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
        <input value={mi} onChange={e=>setMi(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send()}} placeholder="Type a message..." style={{flex:1,padding:"12px 16px",background:"transparent",border:"none",color:"#E8E4DC",fontSize:14,fontFamily:"'Cormorant Garamond',serif",outline:"none"}}/>
        <button onClick={send} style={{padding:"12px 18px",background:"transparent",border:"none",color:deity.color,cursor:"pointer",fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>Send</button>
      </div>
    </div>
  </div>);
};

/* ═══════════════════════════════════════════════════════════════════════
   CORE UI — improved contrast and font visibility
   ═══════════════════════════════════════════════════════════════════════ */
const PeaceGauge=({score,size=180})=>{const s=7,r=(size-s*2)/2,ci=2*Math.PI*r,off=ci-(score/100)*ci;const c=score<25?"#E85D3A":score<50?"#F0C040":score<75?"#5BD4A8":"#7BE87B";
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0,margin:"0 auto"}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><defs><filter id="gg"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="ggl"><stop offset="0%" stopColor={c}/><stop offset="100%" stopColor={c} stopOpacity="0.3"/></linearGradient></defs><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={s}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ggl)" strokeWidth={s} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" filter="url(#gg)" style={{transition:"stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)"}}/></svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,0.45)",fontFamily:"'Cormorant Garamond',serif"}}>PEACE</span><span style={{fontSize:42,fontWeight:200,color:c,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{Math.round(score)}</span><span style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginTop:2}}>{score<25?"SEEKING":score<50?"ALIGNING":score<75?"RESONATING":"SAMADHI"}</span></div></div>);
};

const FreqDisplay=({deity,analyserRef,isActive,sampleRate,quality})=>{
  const isPitch=deity.targetType==="pitch";
  const items=isPitch?[
    {l:"DETECTED",v:quality.detectedFreq?quality.detectedFreq.toFixed(1)+" Hz":"--",c:quality.detectedFreq?"#F0C040":"rgba(255,255,255,0.2)"},
    {l:"TARGET",v:deity.freq+" Hz",c:"rgba(255,255,255,0.5)"},
    {l:"PITCH ACCURACY",v:isActive?Math.round(quality.accuracy)+"%":"--",c:quality.accuracy>60?"#7BE87B":quality.accuracy>30?"#F0C040":"rgba(255,255,255,0.25)"},
  ]:[
    {l:"PRESENCE",v:isActive?Math.round(quality.presence)+"%":"--",c:quality.presence>60?"#7BE87B":quality.presence>30?"#F0C040":"rgba(255,255,255,0.25)"},
    {l:"STEADINESS",v:isActive?Math.round(quality.steadiness)+"%":"--",c:quality.steadiness>60?"#7BE87B":quality.steadiness>30?"#F0C040":"rgba(255,255,255,0.25)"},
    {l:"HUM QUALITY",v:isActive?Math.round(quality.accuracy)+"%":"--",c:quality.accuracy>60?"#7BE87B":quality.accuracy>30?"#F0C040":"rgba(255,255,255,0.25)"},
  ];
  return(<div style={{display:"flex",gap:16,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
    {items.map((item,i)=>(<div key={item.l} style={{display:"flex",alignItems:"center",gap:16}}>
      {i>0&&<div style={{width:1,height:28,background:"rgba(255,255,255,0.06)"}}/>}
      <div style={{textAlign:"center"}}><div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.35)"}}>{item.l}</div><div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",color:item.c,marginTop:2}}>{item.v}</div></div>
    </div>))}
  </div>);
};

const BreathGuide=({isActive,mantra,onPhaseChange})=>{
  const[ph,setPh]=useState(0);const[pr,setPr]=useState(0);const[cy,setCy]=useState(0);const iv=useRef(null);
  const durs=[3000,6000,9000];
  const defs=[{label:"Inhale",icon:"/",inst:"3s -- deep diaphragmatic breath"},{label:mantra,icon:"*",inst:"6s -- voice the beeja from navel center"},{label:"Anusvara Hum",icon:"~",inst:"9s -- seal lips, sustain nasal resonance"}];
  useEffect(()=>{if(!isActive){setPh(0);setPr(0);setCy(0);if(iv.current)clearInterval(iv.current);return;}let e=0,cp=0;iv.current=setInterval(()=>{e+=50;setPr(Math.min(e/durs[cp],1));if(e>=durs[cp]){e=0;cp=(cp+1)%3;if(cp===0)setCy(c=>c+1);setPh(cp);onPhaseChange?.(cp);}},50);return()=>clearInterval(iv.current)},[isActive,mantra]);
  const cur=defs[ph];const bc=ph===0?"#5B8DEF":ph===1?"#F0C040":"#7BE87B";
  return(<div><div style={{display:"flex",gap:2,marginBottom:10}}>{defs.map((_,i)=>(<div key={i} style={{flex:durs[i],height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden",position:"relative"}}>{i===ph&&<div style={{position:"absolute",inset:0,borderRadius:3,background:bc,width:`${pr*100}%`,transition:"width 50ms linear"}}/>}{i<ph&&<div style={{position:"absolute",inset:0,borderRadius:3,background:bc,opacity:0.25}}/>}</div>))}</div>
    <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22,color:bc,width:28,textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>{cur.icon}</span><div style={{flex:1}}><div style={{fontSize:15,color:bc,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>{cur.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{cur.inst}</div></div>{isActive&&<span style={{fontSize:10,color:"rgba(255,255,255,0.2)",fontFamily:"'JetBrains Mono',monospace"}}>Cycle {cy+1}</span>}</div></div>);
};

const MicOverlay=({status,onReq,onSkip})=>{if(status==="granted")return null;const d=status==="denied";
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(5,5,10,0.94)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{maxWidth:400,width:"100%",textAlign:"center",padding:"40px 28px",borderRadius:20,background:"rgba(15,15,20,0.95)",border:"1px solid rgba(212,168,67,0.1)"}}>
    <div style={{width:64,height:64,borderRadius:"50%",margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center",background:d?"rgba(232,93,58,0.1)":"rgba(212,168,67,0.08)",border:`1px solid ${d?"rgba(232,93,58,0.2)":"rgba(212,168,67,0.14)"}`,animation:d?"none":"micP 2.5s ease-in-out infinite"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={d?"#E85D3A":"#D4A843"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
    <h2 style={{fontSize:20,fontWeight:300,margin:"0 0 8px",fontFamily:"'Cormorant Garamond',serif",color:d?"#E85D3A":"#D4A843"}}>{d?"Microphone Blocked":"Microphone Required"}</h2>
    <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.8,fontFamily:"'Cormorant Garamond',serif"}}>{d?"Click the lock icon in your address bar, set Microphone to Allow, then refresh the page.":"All audio analysis happens locally in your browser. Nothing is recorded or transmitted."}</p>
    <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:20}}>{!d&&<button onClick={onReq} style={{padding:"12px 28px",borderRadius:99,border:"1px solid rgba(212,168,67,0.25)",cursor:"pointer",fontSize:13,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.1)",color:"#D4A843"}}>Enable</button>}<button onClick={onSkip} style={{padding:"12px 22px",borderRadius:99,border:"1px solid rgba(255,255,255,0.07)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.4)"}}>Skip</button></div>
  </div><style>{`@keyframes micP{0%,100%{box-shadow:0 0 0 0 rgba(212,168,67,0.12)}50%{box-shadow:0 0 0 16px rgba(212,168,67,0)}}`}</style></div>);
};

/* ═══════════════════════════════════════════════════════════════════════
   GUIDE PAGE
   ═══════════════════════════════════════════════════════════════════════ */
const GuidePage=()=>{
  const S=({title,children})=>(<div style={{marginBottom:28}}><div style={{fontSize:12,letterSpacing:3,color:"rgba(212,168,67,0.65)",textTransform:"uppercase",marginBottom:12,fontWeight:600}}>{title}</div><div style={{fontSize:16,color:"rgba(255,255,255,0.6)",lineHeight:2,fontFamily:"'Cormorant Garamond',serif"}}>{children}</div></div>);
  return(<div style={{maxWidth:640,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:36}}><div style={{fontSize:24,fontWeight:300,color:"#D4A843",fontFamily:"'Cormorant Garamond',serif",marginBottom:6}}>Sadhana Guide</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)",letterSpacing:2}}>How to Practice with Anuswara</div></div>

    <S title="What is Anuswara"><p style={{margin:"0 0 12px"}}>Anuswara (Anusvara) is the nasal resonance sound -- the "m" hum at the end of every Beeja mantra. When lips seal and sound vibrates through the nasal cavity, the paranasal sinuses act as Helmholtz resonant chambers.</p><p style={{margin:0}}>Research from the Karolinska Institute (Weitzberg and Lundberg, 2002) showed humming increases Nitric Oxide in the sinuses by approximately 15x. NO is a vasodilator that widens blood vessels, lowers blood pressure, and enhances oxygen delivery.</p></S>

    <S title="The 3-6-9 Breath Cycle"><p style={{margin:"0 0 12px"}}>Each repetition follows an 18-second cycle:</p>
      <div style={{padding:18,borderRadius:14,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{[
          {t:"3 seconds",l:"Inhale",c:"#5B8DEF",d:"Deep diaphragmatic breath through the nose. Belly expands. Activates vagus nerve."},
          {t:"6 seconds",l:"Beeja Syllable",c:"#F0C040",d:"Voice the seed syllable from the navel center. Clear consonant and vowel. Steady tone."},
          {t:"9 seconds",l:"Anusvara Hum",c:"#7BE87B",d:"Seal lips. Sustained 'mmm' resonates through sinuses and cranium. Even pressure, not loud."},
        ].map(s=>(<div key={s.l} style={{flex:1,minWidth:160,padding:12,borderRadius:10,border:`1px solid ${s.c}18`}}>
          <div style={{fontSize:11,color:s.c,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{s.t}</div>
          <div style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.65)",marginBottom:4}}>{s.l}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>{s.d}</div>
        </div>))}</div></div>
      <p style={{margin:0}}>The 3-6-9 ratio gives the anusvara 50% of total cycle time -- the proportion at which sinus resonance is most effective.</p></S>

    <S title="How Measurement Works"><p style={{margin:"0 0 12px"}}>The app uses two measurement models depending on the deity's target frequency:</p>
      <div style={{padding:16,borderRadius:14,background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.08)",marginBottom:14}}>
        <div style={{marginBottom:14}}><div style={{fontSize:10,letterSpacing:2,color:"rgba(56,189,248,0.7)",textTransform:"uppercase",marginBottom:6}}>Pitch Matching (Hanuman 392Hz, Vishnu 293.7Hz)</div><div style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.8}}>These frequencies are within human vocal range. The app detects your humming pitch using FFT analysis with parabolic interpolation for sub-bin accuracy, then computes how close your pitch is to the target using a Gaussian accuracy curve.</div></div>
        <div><div style={{fontSize:10,letterSpacing:2,color:"rgba(56,189,248,0.7)",textTransform:"uppercase",marginBottom:6}}>Hum Quality (all other deities)</div><div style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.8}}>Target frequencies below ~50Hz are brainwave entrainment targets -- not pitches you can hum. You cannot produce a 7.83Hz sound with your voice. Instead, the app measures: voice presence (are you humming?), tonal steadiness (is it a clean hum vs breathy noise?), and sustained duration. The brainwave entrainment happens through the rhythm of your 18-second mantra cycles over time, not through directly matching the frequency.</div></div>
      </div></S>

    <S title="What Projected Score Means"><p style={{margin:0}}>After a session, the insights show a "Projected 10m" value. This extrapolates your current peace score trajectory to estimate where you would reach if you maintained the same quality for 10 minutes total. It is a linear projection: (current_score / current_duration) multiplied by 600 seconds, capped at 100. This helps you understand the value of extending your practice -- a 2-minute session at 15 points projects to approximately 75 at 10 minutes.</p></S>

    <S title="Choosing a Deity"><div style={{padding:14,borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
      {[{r:"Delta (0.5-4 Hz)",d:"Bhairava",u:"Deep release, fearlessness, sleep preparation"},
        {r:"Theta (4-8 Hz)",d:"Shiva",u:"Meditation, intuition, creative insight"},
        {r:"Alpha (8-13 Hz)",d:"Durga, Ganesha",u:"Calm alertness, stress relief, grounding"},
        {r:"Beta (13-30 Hz)",d:"Saraswati, Bagalamukhi",u:"Focus, learning, mental clarity, stillness"},
        {r:"Gamma (30-100+ Hz)",d:"Lakshmi, Kali, Krishna, Hanuman, Vishnu",u:"Transcendence, compassion, high integration"},
      ].map((r,i)=>(<div key={r.r} style={{padding:"10px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.03)":"none"}}>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:"'JetBrains Mono',monospace"}}>{r.r}</div>
        <div style={{fontSize:14,color:"rgba(212,168,67,0.7)",marginTop:3}}>{r.d}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:2}}>{r.u}</div>
      </div>))}</div></S>

    <S title="Recommended Duration"><div style={{padding:14,borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
      {[{c:"11 cycles",t:"~3.3 min",n:"Minimum short practice (Tantric tradition)"},
        {c:"21 cycles",t:"~6.3 min",n:"Quarter mala -- good daily maintenance"},
        {c:"54 cycles",t:"~16 min",n:"Half mala -- full physiological response"},
        {c:"108 cycles",t:"~32 min",n:"Full mala -- traditional complete practice"},
      ].map(r=>(<div key={r.c} style={{display:"flex",gap:14,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.03)",alignItems:"baseline"}}>
        <div style={{fontSize:14,color:"rgba(212,168,67,0.7)",fontFamily:"'JetBrains Mono',monospace",minWidth:75}}>{r.c}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontFamily:"'JetBrains Mono',monospace",minWidth:60}}>{r.t}</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.5)"}}>{r.n}</div>
      </div>))}</div></S>

    <S title="Posture"><p style={{margin:0}}>Sit comfortably -- Sukhasana, Padmasana, or a chair with feet flat. Spine erect but not rigid. BG VI.13: "Holding body, head, and neck erect, steady and still." Quiet environment helps accuracy. Keep microphone uncovered.</p></S>
  </div>);
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════ */
export default function App(){
  const[tab,setTab]=useState("sadhana");const[deity,setDeity]=useState(DEITIES[0]);
  const[isListening,setIsListening]=useState(false);const[peaceScore,setPeaceScore]=useState(0);
  const[sessionTime,setSessionTime]=useState(0);const[phase,setPhase]=useState(0);
  const[micPerm,setMicPerm]=useState("unknown");const[showMicOv,setShowMicOv]=useState(false);
  const[micErr,setMicErr]=useState(null);const[sampleRate,setSampleRate]=useState(44100);
  const[sessionResult,setSessionResult]=useState(null);const[showShare,setShowShare]=useState(false);
  const[accuracyLog,setAccuracyLog]=useState([]);const[showScience,setShowScience]=useState(false);
  const[sessionHistory,setSessionHistory]=useState([]);
  const[quality,setQuality]=useState({accuracy:0,presence:0,steadiness:0,detectedFreq:null});

  const audioCtxRef=useRef(null);const analyserRef=useRef(null);const streamRef=useRef(null);
  const sessIv=useRef(null);const scoreIv=useRef(null);

  useEffect(()=>{(async()=>{try{if(navigator.permissions?.query){const r=await navigator.permissions.query({name:"microphone"});setMicPerm(r.state);if(r.state!=="granted")setShowMicOv(true);r.addEventListener("change",()=>{setMicPerm(r.state);if(r.state==="granted")setShowMicOv(false)});}else{setMicPerm("prompt");setShowMicOv(true)}}catch(_){setMicPerm("prompt");setShowMicOv(true)}})()},[]);

  const requestMic=useCallback(async()=>{try{if(!navigator.mediaDevices?.getUserMedia){setMicErr("Browser doesn't support mic.");return}const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());setMicPerm("granted");setShowMicOv(false);setMicErr(null)}catch(e){if(e.name==="NotAllowedError")setMicPerm("denied");else setMicErr(e.message||"Mic unavailable")}},[]);

  const startSession=useCallback(async()=>{try{setMicErr(null);
    if(!navigator.mediaDevices?.getUserMedia){setMicErr("Mic API unavailable.");return}
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    setMicPerm("granted");
    const actx=new(window.AudioContext||window.webkitAudioContext)();
    const src=actx.createMediaStreamSource(stream);const an=actx.createAnalyser();
    an.fftSize=8192;an.smoothingTimeConstant=0.85;src.connect(an);
    audioCtxRef.current=actx;analyserRef.current=an;streamRef.current=stream;
    setSampleRate(actx.sampleRate);setIsListening(true);setSessionTime(0);setPeaceScore(0);
    setAccuracyLog([]);setSessionResult(null);setQuality({accuracy:0,presence:0,steadiness:0,detectedFreq:null});

    sessIv.current=setInterval(()=>setSessionTime(t=>t+1),1000);

    const isPitch=deity.targetType==="pitch";
    scoreIv.current=setInterval(()=>{
      let acc=0;
      if(isPitch){
        const r=measurePitchAccuracy(an,actx.sampleRate,deity.freq,deity.range[0],deity.range[1]);
        acc=r.accuracy/100;
        setQuality({accuracy:r.accuracy,presence:100,steadiness:100,detectedFreq:r.detectedFreq});
      }else{
        const r=measureHumQuality(an);
        acc=r.quality/100;
        setQuality({accuracy:r.quality,presence:r.presence,steadiness:r.steadiness,detectedFreq:null});
      }
      setAccuracyLog(prev=>{const n=[...prev,Math.round(acc*100)];return n.length>60?n.slice(-60):n});
      setPeaceScore(prev=>{const sf=1+Math.max(0,1-acc)*0.5;return Math.min(100,prev+(0.2*acc*2.5)/sf)});
    },200);
  }catch(e){if(e.name==="NotAllowedError"){setMicPerm("denied");setShowMicOv(true)}else setMicErr(e.message||"Mic error")}},[deity]);

  const stopSession=useCallback(()=>{
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    if(audioCtxRef.current)audioCtxRef.current.close();
    analyserRef.current=null;setIsListening(false);
    if(sessIv.current)clearInterval(sessIv.current);if(scoreIv.current)clearInterval(scoreIv.current);
    if(sessionTime>3){const result={deity,peaceScore,duration:sessionTime,brainState:getBrainState(deity.freq),accuracyLog:[...accuracyLog],timestamp:new Date()};setSessionResult(result);setSessionHistory(prev=>[result,...prev].slice(0,20));setTab("insights")}
  },[deity,peaceScore,sessionTime,accuracyLog]);

  useEffect(()=>()=>{if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());if(audioCtxRef.current)audioCtxRef.current.close();if(sessIv.current)clearInterval(sessIv.current);if(scoreIv.current)clearInterval(scoreIv.current)},[]);

  const tabs=[{id:"sadhana",label:"Sadhana"},{id:"insights",label:"Insights"},{id:"sangha",label:"Sangha"},{id:"guide",label:"Guide"}];

  return(
    <div style={{minHeight:"100vh",background:"#08080D",color:"#E8E4DC",fontFamily:"'Cormorant Garamond',Georgia,serif",position:"relative"}}>
      {showMicOv&&<MicOverlay status={micPerm} onReq={requestMic} onSkip={()=>setShowMicOv(false)}/>}
      {showShare&&<ShareModal session={sessionResult} onClose={()=>setShowShare(false)}/>}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:`radial-gradient(ellipse at 50% 0%,${deity.color}08 0%,transparent 55%)`}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"20px 16px 100px"}}>
        <header style={{textAlign:"center",marginBottom:24}}>
          <h1 style={{fontSize:30,fontWeight:300,margin:0,letterSpacing:3,color:"#D4A843"}}>Anuswara</h1>
          <div style={{fontSize:11,fontWeight:400,letterSpacing:5,color:"rgba(255,255,255,0.35)",marginTop:3}}>THE SONIC BODY</div>
        </header>

        <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:24}}>
          {tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 20px",borderRadius:99,border:tab===t.id?`1px solid ${deity.color}30`:"1px solid rgba(255,255,255,0.04)",background:tab===t.id?`${deity.color}0C`:"transparent",cursor:"pointer",fontSize:12,letterSpacing:2.5,color:tab===t.id?deity.color:"rgba(255,255,255,0.35)",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,transition:"all 0.3s"}}>{t.label}</button>))}
        </div>

        {/* ═══ SADHANA ═══ */}
        {tab==="sadhana"&&(<>
          <div style={{overflowX:"auto",marginBottom:18}}>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {DEITIES.map(d=>(<button key={d.id} onClick={()=>{if(!isListening)setDeity(d)}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 8px",borderRadius:10,minWidth:68,border:deity.id===d.id?`1px solid ${d.color}45`:"1px solid rgba(255,255,255,0.035)",background:deity.id===d.id?`${d.color}0C`:"transparent",cursor:"pointer",transition:"all 0.3s"}}>
                <span style={{fontSize:16,fontWeight:700,color:deity.id===d.id?d.color:"rgba(255,255,255,0.35)",fontFamily:"'Cormorant Garamond',serif"}}>{d.glyph}</span>
                <span style={{fontSize:9,letterSpacing:1,color:deity.id===d.id?d.color:"rgba(255,255,255,0.3)",fontWeight:600}}>{d.name}</span>
              </button>))}
            </div>
          </div>

          {/* Deity bar */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,marginBottom:20,background:`${deity.color}07`,border:`1px solid ${deity.color}15`,flexWrap:"wrap"}}>
            <span style={{fontSize:24,fontWeight:700,color:deity.color,fontFamily:"'Cormorant Garamond',serif"}}>{deity.glyph}</span>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:17,fontWeight:600,color:deity.color}}>{deity.name} <span style={{fontWeight:300,fontSize:14,color:"rgba(255,255,255,0.4)",fontStyle:"italic"}}>{deity.mantra}</span></div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{deity.freq}Hz / {deity.domain} / {deity.chakra}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>Measurement: {deity.targetType==="pitch"?"PITCH MATCHING":"HUM QUALITY"}</div>
            </div>
            <button onClick={()=>setShowScience(!showScience)} style={{fontSize:10,letterSpacing:1.5,color:"rgba(255,255,255,0.35)",background:"none",border:"1px solid rgba(255,255,255,0.07)",borderRadius:99,padding:"6px 14px",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>{showScience?"Hide":"Science"}</button>
          </div>
          {showScience&&(<div style={{padding:14,borderRadius:12,background:"rgba(91,141,239,0.04)",border:"1px solid rgba(91,141,239,0.08)",marginBottom:18}}><p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.8,margin:0}}>{deity.desc}</p><p style={{fontSize:13,color:"rgba(91,212,168,0.55)",lineHeight:1.8,margin:"8px 0 0"}}>The anusvara nasal hum creates Helmholtz Resonance in paranasal sinuses, increasing Nitric Oxide ~15x (Karolinska Institute), triggering vasodilation and parasympathetic activation.</p></div>)}

          {/* Layout: Mandala + Controls */}
          <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{flex:"0 0 auto",borderRadius:16,background:"rgba(255,255,255,0.008)",border:"1px solid rgba(255,255,255,0.03)",overflow:"hidden"}}>
              <DeityMandala deity={deity} isActive={isListening} analyserRef={analyserRef} peaceScore={peaceScore} phase={phase}/>
            </div>
            <div style={{flex:1,minWidth:270,display:"flex",flexDirection:"column",gap:16}}>
              <PeaceGauge score={peaceScore}/>
              <FreqDisplay deity={deity} analyserRef={analyserRef} isActive={isListening} sampleRate={sampleRate} quality={quality}/>
              <BreathGuide isActive={isListening} mantra={deity.mantra} onPhaseChange={setPhase}/>
              {isListening&&<div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:"'JetBrains Mono',monospace"}}>Session: {fmt(sessionTime)} / Cycle {Math.floor(sessionTime/18)+1}</div>}

              <button onClick={()=>{if(isListening){stopSession()}else if(micPerm==="denied"){setShowMicOv(true)}else startSession()}}
                style={{padding:"14px 20px",borderRadius:99,cursor:"pointer",fontSize:14,letterSpacing:2.5,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,transition:"all 0.3s",background:isListening?"rgba(232,93,58,0.12)":`${deity.color}14`,color:isListening?"#E85D3A":deity.color,border:`1px solid ${isListening?"rgba(232,93,58,0.25)":deity.color+"30"}`}}>
                {isListening?"End Session":micPerm==="denied"?"Enable Mic":"Begin Sadhana"}
              </button>
              {micErr&&<div style={{fontSize:12,color:"#E85D3A",padding:10,borderRadius:8,background:"rgba(232,93,58,0.06)",textAlign:"center"}}>{micErr}</div>}

              <div style={{display:"flex",gap:6}}>
                {[{s:1,l:"Inhale",p:"3s",c:"#5B8DEF"},{s:2,l:"Syllable",p:"6s",c:"#F0C040"},{s:3,l:"Anusvara",p:"9s",c:"#7BE87B"}].map(({s,l,p,c})=>(<div key={s} style={{flex:1,padding:"10px 8px",borderRadius:8,textAlign:"center",background:phase===s-1&&isListening?`${c}0C`:"rgba(255,255,255,0.015)",border:`1px solid ${phase===s-1&&isListening?c+"25":"rgba(255,255,255,0.03)"}`,transition:"all 0.3s"}}><div style={{fontSize:16,fontWeight:300,color:c,opacity:0.6}}>{s}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>{l}</div><div style={{fontSize:9,color:c,marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>{p}</div></div>))}
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ INSIGHTS ═══ */}
        {tab==="insights"&&(sessionResult?
          <SessionInsights session={sessionResult} onShare={()=>setShowShare(true)} onClose={()=>{setSessionResult(null);setTab("sadhana")}}/>
          :<div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:22,marginBottom:16,fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.25)"}}>Insights</div>
            <div style={{fontSize:16,color:"rgba(255,255,255,0.4)",fontFamily:"'Cormorant Garamond',serif"}}>Complete a session to see your insights</div>
            {sessionHistory.length>0&&<div style={{marginTop:32,maxWidth:460,margin:"32px auto 0"}}>
              <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:12}}>Past Sessions</div>
              {sessionHistory.map((s,i)=>(<button key={i} onClick={()=>setSessionResult(s)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 16px",borderRadius:10,marginBottom:6,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:16,fontWeight:700,color:s.deity.color}}>{s.deity.glyph}</span>
                <div style={{flex:1}}><div style={{fontSize:14,color:"rgba(255,255,255,0.55)"}}>{s.deity.name} / {fmt(s.duration)}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.25)"}}>{s.timestamp.toLocaleString()}</div></div>
                <div style={{fontSize:18,fontWeight:200,color:s.peaceScore>=50?"#7BE87B":"#F0C040",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(s.peaceScore)}</div>
              </button>))}
            </div>}
          </div>
        )}

        {tab==="sangha"&&<SanghaModule deity={deity} peaceScore={peaceScore}/>}
        {tab==="guide"&&<GuidePage/>}

        <footer style={{textAlign:"center",marginTop:40}}><div style={{fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.1)"}}>ANUSWARA / THE SONIC BODY / BIO-ACOUSTIC MANTRA LAB</div></footer>
      </div>
    </div>
  );
}
