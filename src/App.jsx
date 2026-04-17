import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════════════════ */

const DEITIES = [
  { id:"ganesha",name:"Ganesha",mantra:"Gaṁ",freq:14,range:[12,16],domain:"Grounding",color:"#E85D3A",glyph:"ॐ",chakra:"Mūlādhāra",chakraIdx:0,element:"Earth",desc:"14Hz grounds awareness into the body, anchoring Prāṇa at the base. Removes obstacles from the energy body." },
  { id:"shiva",name:"Shiva",mantra:"Oṁ",freq:7.83,range:[6,10],domain:"Schumann Resonance",color:"#5B8DEF",glyph:"☽",chakra:"Sahasrāra",chakraIdx:6,element:"Ākāsha",desc:"7.83Hz aligns with Earth's electromagnetic pulse — dissolving the boundary between self and cosmos." },
  { id:"durga",name:"Durgā",mantra:"Duṁ",freq:11,range:[10,12],domain:"Alpha Protection",color:"#D4503A",glyph:"त्रि",chakra:"Maṇipūra",chakraIdx:2,element:"Fire",desc:"Alpha-band 10-12Hz builds a psycho-acoustic shield of fierce compassion around the solar plexus." },
  { id:"lakshmi",name:"Lakṣmī",mantra:"Śrīṁ",freq:45,range:[40,50],domain:"Abundance · Gamma",color:"#F0C040",glyph:"श्री",chakra:"Anāhata",chakraIdx:3,element:"Water",desc:"45Hz high-gamma synchrony correlates with heightened awareness and heart-field expansion." },
  { id:"saraswati",name:"Sarasvatī",mantra:"Aiṁ",freq:26,range:[22,30],domain:"Cognitive Focus",color:"#E8E0D0",glyph:"वी",chakra:"Viśuddha",chakraIdx:4,element:"Ākāsha",desc:"26Hz beta resonance sharpens cognitive architecture and activates the throat center of expression." },
  { id:"hanuman",name:"Hanumān",mantra:"Haṁ",freq:392,range:[370,415],domain:"Vagus Nerve",color:"#FF6B2B",glyph:"ह",chakra:"Viśuddha",chakraIdx:4,element:"Air",desc:"392Hz (G4) stimulates the vagus nerve, activating the parasympathetic rest-and-digest response." },
  { id:"kali",name:"Kālī",mantra:"Krīṁ",freq:33,range:[30,36],domain:"Transformation",color:"#9B3DC7",glyph:"का",chakra:"Ājñā",chakraIdx:5,element:"Fire",desc:"33Hz gamma oscillation at the third eye dissolves calcified patterns for radical renewal." },
  { id:"krishna",name:"Kṛṣṇa",mantra:"Klīṁ",freq:33,range:[30,36],domain:"Attraction",color:"#2D8AE0",glyph:"कृ",chakra:"Anāhata",chakraIdx:3,element:"Water",desc:"33Hz resonance opens the heart field, magnetizing connection and emotional coherence." },
  { id:"vishnu",name:"Viṣṇu",mantra:"Daṁ",freq:293.7,range:[280,310],domain:"Preservation",color:"#3D8ACA",glyph:"वि",chakra:"Anāhata",chakraIdx:3,element:"Water",desc:"293.7Hz (D4) maintains harmonic equilibrium — preservation through resonant stability." },
  { id:"bhairava",name:"Bhairava",mantra:"Bhrāṁ",freq:2.5,range:[0.5,4],domain:"Delta · Fearlessness",color:"#C7384A",glyph:"भ",chakra:"Mūlādhāra",chakraIdx:0,element:"Earth",desc:"Delta-range frequencies access the deepest strata of consciousness where fear dissolves." },
  { id:"bagalamukhi",name:"Bagalāmukhī",mantra:"Hlīṁ",freq:20,range:[17,23],domain:"Stillness",color:"#C4A82B",glyph:"ह्ल",chakra:"Ājñā",chakraIdx:5,element:"Ākāsha",desc:"20Hz — the threshold of audibility — suspends mental turbulence into crystalline stillness." },
];

const CHAKRAS = [
  { name:"Mūlādhāra",color:"#E85D3A",y:88,label:"Root" },
  { name:"Svādhiṣṭhāna",color:"#F09030",y:78,label:"Sacral" },
  { name:"Maṇipūra",color:"#F0C040",y:66,label:"Solar" },
  { name:"Anāhata",color:"#4ADE80",y:52,label:"Heart" },
  { name:"Viśuddha",color:"#38BDF8",y:40,label:"Throat" },
  { name:"Ājñā",color:"#8B5CF6",y:26,label:"Third Eye" },
  { name:"Sahasrāra",color:"#E0D0FF",y:18,label:"Crown" },
];

const BRAIN_STATES = {
  delta:{name:"Delta",range:"0.5–4 Hz",state:"Deep Dreamless · Prajna",color:"#6366F1"},
  theta:{name:"Theta",range:"4–8 Hz",state:"Meditation · Svapna",color:"#8B5CF6"},
  alpha:{name:"Alpha",range:"8–13 Hz",state:"Relaxed Awareness",color:"#38BDF8"},
  beta:{name:"Beta",range:"13–30 Hz",state:"Focused Cognition",color:"#4ADE80"},
  gamma:{name:"Gamma",range:"30–100 Hz",state:"Transcendent Unity",color:"#F0C040"},
};
const getBrainState=(f)=>{if(f<4)return"delta";if(f<8)return"theta";if(f<13)return"alpha";if(f<30)return"beta";return"gamma";};

const AFTEREFFECTS = {
  delta:{body:"Deep cellular repair initiated. Growth hormone secretion peaks. Immune system restoration active.",mind:"Subconscious patterns accessed and released. Samskaric impressions dissolving. Dreamless awareness touched.",protocol:"Rest in silence for 10 min. Avoid screens for 30 min. Warm milk with nutmeg (Jaiphal) before sleep tonight. Practice Yoga Nidra within 2 hours to deepen the delta imprint."},
  theta:{body:"Parasympathetic dominance achieved. Cortisol reduction ~23%. Limbic system calmed. Melatonin precursors activated.",mind:"Hypnagogic gateway opened. Creative insights may surface in next 2–4 hours. Dream recall will be enhanced tonight.",protocol:"Journal any visions within 15 min. Take Brahmi (Bacopa) tea. Practice Trataka (candle gazing) this evening. Sleep before 10 PM for optimal integration."},
  alpha:{body:"Nervous system balanced. Blood pressure normalized. Sinus NO production sustained for ~45 min post-session. HRV improved.",mind:"Inner critic quieted. Equanimous awareness established. Decision-making clarity enhanced for 2–3 hours.",protocol:"Practice Nadi Shodhana (alternate nostril breathing) 5 rounds. Light Sattvic meal — Khichdi or steamed vegetables. Walk barefoot on earth for 10 min (Prithvi contact)."},
  beta:{body:"Prefrontal cortex activated. Dopamine and norepinephrine balanced. Reaction time improved.",mind:"Cognitive throughput increased. Verbal fluency enhanced. Pattern recognition amplified. Ideal window for learning.",protocol:"Use next 90 min for important intellectual work. Take Shankhapushpi for sustained focus. Opt for fruits and nuts. Practice Surya Namaskar 6 rounds to channel the energy."},
  gamma:{body:"Whole-brain synchrony achieved. Vagal tone elevated. NO flooding sinuses and cardiovascular system. Anti-inflammatory cascade triggered.",mind:"Non-dual awareness glimpsed. Observer-observed distinction softened. Compassion circuits activated.",protocol:"Maintain silence (Mauna) for 20 min. Offer Jal to a Tulsi plant. Practice Metta meditation. Take Ashwagandha with warm milk. Avoid agitating content for 3 hours."},
};

const SIMULATED_USERS=[
  {id:"s1",name:"Arjun",location:"Varanasi",avatar:"🙏"},
  {id:"s2",name:"Priya",location:"Pune",avatar:"🧘"},
  {id:"s3",name:"Kavya",location:"Bengaluru",avatar:"✨"},
  {id:"s4",name:"Rishi",location:"London",avatar:"🕉️"},
  {id:"s5",name:"Ananya",location:"Mumbai",avatar:"🙏"},
];

const fmt=(s)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;


/* ═══════════════════════════════════════════════════════════════════════
   BODY VISUALIZATION — CANVAS ANATOMY WITH REAL-TIME ENERGY MAPPING
   ═══════════════════════════════════════════════════════════════════════ */
const BodyVisualization = ({ isActive, deity, phase, peaceScore }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const tRef = useRef(0);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const W=340, H=520;
    const dpr = window.devicePixelRatio||1;
    canvas.width=W*dpr; canvas.height=H*dpr;
    ctx.scale(dpr,dpr);

    if(particles.current.length===0){
      for(let i=0;i<50;i++){
        particles.current.push({
          x:W/2+(Math.random()-0.5)*60, y:H*0.15+Math.random()*H*0.6,
          vx:(Math.random()-0.5)*0.3, vy:-0.2-Math.random()*0.4,
          size:1+Math.random()*2, life:Math.random(), speed:0.003+Math.random()*0.004,
        });
      }
    }

    let raf;
    const activeChakra = deity.chakraIdx;
    const chakraColor = CHAKRAS[activeChakra].color;

    const draw=()=>{
      tRef.current += 0.016;
      const T = tRef.current;
      ctx.clearRect(0,0,W,H);
      const cx=W/2, bt=H*0.1;

      // ── HEAD ──
      ctx.beginPath(); ctx.ellipse(cx,bt+28,26,33,0,0,Math.PI*2);
      ctx.fillStyle="rgba(255,255,255,0.025)"; ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=0.8; ctx.stroke();

      // ── TORSO ──
      ctx.beginPath();
      ctx.moveTo(cx-11,bt+58); ctx.lineTo(cx-11,bt+68);
      ctx.quadraticCurveTo(cx-48,bt+85,cx-44,bt+170);
      ctx.quadraticCurveTo(cx-40,bt+260,cx-26,bt+310);
      ctx.lineTo(cx-14,bt+310);
      ctx.quadraticCurveTo(cx-28,bt+370,cx-34,bt+420);
      ctx.lineTo(cx-20,bt+420); ctx.lineTo(cx-10,bt+320);
      ctx.lineTo(cx+10,bt+320); ctx.lineTo(cx+20,bt+420);
      ctx.lineTo(cx+34,bt+420);
      ctx.quadraticCurveTo(cx+28,bt+370,cx+14,bt+310);
      ctx.lineTo(cx+26,bt+310);
      ctx.quadraticCurveTo(cx+40,bt+260,cx+44,bt+170);
      ctx.quadraticCurveTo(cx+48,bt+85,cx+11,bt+68);
      ctx.lineTo(cx+11,bt+58); ctx.closePath();
      ctx.fillStyle="rgba(255,255,255,0.015)"; ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.lineWidth=0.7; ctx.stroke();

      // ── ARMS ──
      ctx.beginPath(); ctx.moveTo(cx-44,bt+92);
      ctx.quadraticCurveTo(cx-72,bt+150,cx-62,bt+220);
      ctx.strokeStyle="rgba(255,255,255,0.04)"; ctx.lineWidth=0.7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+44,bt+92);
      ctx.quadraticCurveTo(cx+72,bt+150,cx+62,bt+220);
      ctx.stroke();

      // ── SUSHUMNA (SPINE) ──
      const spG = isActive ? 0.14+Math.sin(T*2)*0.08 : 0.035;
      const grad = ctx.createLinearGradient(cx,bt+58,cx,bt+320);
      grad.addColorStop(0,"rgba(255,255,255,0)");
      grad.addColorStop(0.15,"rgba(212,168,67,"+spG+")");
      grad.addColorStop(0.85,"rgba(212,168,67,"+spG+")");
      grad.addColorStop(1,"rgba(255,255,255,0)");
      ctx.beginPath(); ctx.moveTo(cx,bt+58); ctx.lineTo(cx,bt+320);
      ctx.strokeStyle=grad; ctx.lineWidth=isActive?2.5:1.2; ctx.stroke();

      // ── IDA & PINGALA (serpentine nadis) ──
      if(isActive){
        for(let side of[-1,1]){
          ctx.beginPath();
          for(let y=bt+64;y<bt+310;y+=2){
            const p=(y-bt-64)/(310-64);
            const a=11*Math.sin(p*Math.PI*3.5+T*1.5*side);
            const x=cx+a*side;
            y===bt+64?ctx.moveTo(x,y):ctx.lineTo(x,y);
          }
          ctx.strokeStyle=side===-1?"rgba(91,141,239,0.1)":"rgba(232,93,58,0.1)";
          ctx.lineWidth=0.8; ctx.stroke();
        }
      }

      // ── CHAKRA NODES ──
      CHAKRAS.forEach((ch,i)=>{
        const cy = bt + 58 + (ch.y/100)*265;
        const isTarget = i===activeChakra;
        const baseR = isTarget?9:4.5;
        const pulse = isActive&&isTarget?Math.sin(T*3)*2.5:0;
        const r = baseR+pulse;

        if(isActive&&isTarget){
          const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,r*3.5);
          grd.addColorStop(0,ch.color+"40"); grd.addColorStop(1,ch.color+"00");
          ctx.fillStyle=grd; ctx.fillRect(cx-r*4,cy-r*4,r*8,r*8);
        }

        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.fillStyle = isActive&&isTarget?ch.color+"CC":ch.color+"28";
        ctx.fill();
        if(isTarget&&isActive){ctx.strokeStyle=ch.color;ctx.lineWidth=1.2;ctx.stroke();}

        ctx.fillStyle = isTarget?ch.color+"AA":"rgba(255,255,255,0.12)";
        ctx.font = (isTarget?"600 9px":"300 7px")+" 'Cormorant Garamond',serif";
        ctx.textAlign="left"; ctx.fillText(ch.label, cx+18, cy+3);
      });

      // ── BRAIN WAVES ──
      if(isActive){
        const bs=getBrainState(deity.freq);
        const bC=BRAIN_STATES[bs].color;
        const bg=ctx.createRadialGradient(cx,bt+18,0,cx,bt+18,36);
        bg.addColorStop(0,bC+"1A"); bg.addColorStop(1,bC+"00");
        ctx.fillStyle=bg; ctx.fillRect(cx-40,bt-12,80,55);

        ctx.beginPath();
        for(let x=cx-30;x<cx+30;x++){
          const p=(x-(cx-30))/60;
          const w=Math.sin(p*Math.PI*8+T*deity.freq*0.15)*4.5*(0.5+peaceScore/200);
          x===cx-30?ctx.moveTo(x,bt+18+w):ctx.lineTo(x,bt+18+w);
        }
        ctx.strokeStyle=bC+"77"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=bC+"88"; ctx.font="bold 8px 'JetBrains Mono',monospace";
        ctx.textAlign="center"; ctx.fillText(BRAIN_STATES[bs].name.toUpperCase(),cx,bt-4);
      }

      // ── SINUS NO HIGHLIGHT (anuswara phase) ──
      if(isActive&&phase===2){
        const sY=bt+32;
        const sG=0.12+Math.sin(T*4)*0.08;
        for(let s of[-1,1]){
          ctx.beginPath(); ctx.ellipse(cx+s*14,sY,7,4.5,0,0,Math.PI*2);
          ctx.fillStyle="rgba(91,212,168,"+sG+")"; ctx.fill();
        }
        ctx.fillStyle="rgba(91,212,168,"+(0.35+Math.sin(T*3)*0.15)+")";
        ctx.font="bold 7px 'JetBrains Mono',monospace";
        ctx.textAlign="center"; ctx.fillText("NO\u2191 15\u00d7",cx,sY+15);
      }

      // ── VAGUS NERVE ──
      if(isActive&&(deity.id==="hanuman"||peaceScore>35)){
        const va=Math.min(0.25,peaceScore/250);
        ctx.strokeStyle="rgba(74,222,128,"+va+")"; ctx.lineWidth=1.8;
        for(let s of[-1,1]){
          ctx.beginPath(); ctx.moveTo(cx+s*4,bt+50);
          ctx.quadraticCurveTo(cx+s*18,bt+115,cx+s*13,bt+185);
          ctx.quadraticCurveTo(cx+s*9,bt+240,cx+s*4,bt+280);
          ctx.stroke();
        }
        ctx.fillStyle="rgba(74,222,128,"+(va+0.08)+")";
        ctx.font="600 7px 'JetBrains Mono',monospace";
        ctx.textAlign="left"; ctx.fillText("VAGUS",cx+22,bt+130);
      }

      // ── LUNGS ──
      const bS = phase===0?1+Math.sin(T*1.5)*0.12:1;
      for(let s of[-1,1]){
        ctx.save(); ctx.translate(cx+s*25,bt+120); ctx.scale(bS,bS);
        ctx.beginPath(); ctx.ellipse(0,0,16,28,0,0,Math.PI*2);
        ctx.fillStyle=phase===0?"rgba(91,141,239,0.05)":"rgba(255,255,255,0.015)";
        ctx.fill();
        ctx.strokeStyle=phase===0?"rgba(91,141,239,0.12)":"rgba(255,255,255,0.03)";
        ctx.lineWidth=0.6; ctx.stroke(); ctx.restore();
      }

      // ── HEART ──
      const hBeat=Math.abs(Math.sin(T*3));
      const hR=5+hBeat*2.5*(isActive?1:0.3);
      ctx.beginPath(); ctx.arc(cx,bt+135,hR,0,Math.PI*2);
      ctx.fillStyle=isActive?"rgba(239,68,68,"+(0.12+hBeat*0.12)+")":"rgba(239,68,68,0.04)";
      ctx.fill();

      // ── PRANA PARTICLES ──
      if(isActive){
        const targetY=bt+58+(CHAKRAS[activeChakra].y/100)*265;
        particles.current.forEach(p=>{
          p.life+=p.speed;
          if(p.life>1){p.life=0;p.y=bt+65+Math.random()*260;p.x=cx+(Math.random()-0.5)*40;}
          p.y+=(targetY-p.y)*0.003+p.vy;
          p.x+=p.vx+Math.sin(T+p.life*10)*0.25;
          const al=Math.sin(p.life*Math.PI)*0.35;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
          ctx.fillStyle=chakraColor+Math.round(al*255).toString(16).padStart(2,"0");
          ctx.fill();
        });
      }

      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[isActive,deity,phase,peaceScore]);

  return(
    <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <canvas ref={canvasRef} style={{width:340,height:520,display:"block"}}/>
      {isActive&&(
        <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",
          background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",padding:"5px 14px",borderRadius:99,
          fontSize:9,letterSpacing:2,color:deity.color,fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap"}}>
          {deity.chakra} · {deity.element} · {BRAIN_STATES[getBrainState(deity.freq)].state}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SESSION INSIGHTS
   ═══════════════════════════════════════════════════════════════════════ */
const SessionInsights = ({ session, onShare, onClose }) => {
  if(!session) return null;
  const { deity, peaceScore, duration, brainState, accuracyLog } = session;
  const effects = AFTEREFFECTS[brainState]||AFTEREFFECTS.alpha;
  const grade = peaceScore>=80?"S":peaceScore>=60?"A":peaceScore>=40?"B":peaceScore>=20?"C":"D";
  const noBoost = Math.round(1+peaceScore/100*14);

  return(
    <div style={{animation:"fadeIn 0.5s ease"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      <div style={{textAlign:"center",padding:"28px 20px",borderRadius:16,
        background:`linear-gradient(135deg,${deity.color}0A,rgba(255,255,255,0.02))`,
        border:`1px solid ${deity.color}18`,marginBottom:18}}>
        <div style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginBottom:6}}>Session Complete</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18}}>
          <div>
            <div style={{fontSize:56,fontWeight:200,color:deity.color,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{Math.round(peaceScore)}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2}}>PEACE SCORE</div>
          </div>
          <div style={{width:56,height:56,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            background:`${deity.color}12`,border:`2px solid ${deity.color}40`,fontSize:24,fontFamily:"'Cormorant Garamond',serif",
            fontWeight:600,color:deity.color}}>{grade}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:18,flexWrap:"wrap"}}>
          {[
            {l:"Duration",v:fmt(duration)},{l:"Deity",v:deity.name},{l:"Brain State",v:BRAIN_STATES[brainState].name},
            {l:"NO Boost",v:`~${noBoost}\u00d7`},{l:"Chakra",v:deity.chakra},
          ].map(i=>(
            <div key={i.l} style={{textAlign:"center"}}>
              <div style={{fontSize:8,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>{i.l}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{i.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:14,borderRadius:12,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",marginBottom:10}}>Resonance Accuracy Timeline</div>
        <div style={{height:50,display:"flex",alignItems:"flex-end",gap:1}}>
          {(accuracyLog||[]).map((v,i)=>(
            <div key={i} style={{flex:1,height:`${Math.max(2,v)}%`,borderRadius:"2px 2px 0 0",
              background:v>60?`rgba(123,232,123,${0.25+v/250})`:v>30?`rgba(240,192,64,${0.25+v/250})`:`rgba(232,93,58,${0.25+v/250})`}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
          <span style={{fontSize:7,color:"rgba(255,255,255,0.12)"}}>Start</span>
          <span style={{fontSize:7,color:"rgba(255,255,255,0.12)"}}>End</span>
        </div>
      </div>

      <div style={{padding:14,borderRadius:12,background:"rgba(91,212,168,0.04)",border:"1px solid rgba(91,212,168,0.08)",marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(91,212,168,0.55)",textTransform:"uppercase",marginBottom:8}}>Body Effects (Śarīra)</div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.75,fontFamily:"'Cormorant Garamond',serif",margin:0}}>{effects.body}</p>
      </div>

      <div style={{padding:14,borderRadius:12,background:"rgba(139,92,246,0.04)",border:"1px solid rgba(139,92,246,0.08)",marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(139,92,246,0.55)",textTransform:"uppercase",marginBottom:8}}>Mind Effects (Manas)</div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.75,fontFamily:"'Cormorant Garamond',serif",margin:0}}>{effects.mind}</p>
      </div>

      <div style={{padding:14,borderRadius:12,background:"rgba(212,168,67,0.04)",border:"1px solid rgba(212,168,67,0.08)",marginBottom:18}}>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(212,168,67,0.55)",textTransform:"uppercase",marginBottom:8}}>
          Post-Sādhanā Protocol · Āyurvedic Vidhi
        </div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.75,fontFamily:"'Cormorant Garamond',serif",margin:0}}>{effects.protocol}</p>
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={onShare} style={{flex:1,minWidth:130,padding:"13px 16px",borderRadius:99,border:"1px solid rgba(212,168,67,0.2)",
          cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,
          background:"rgba(212,168,67,0.07)",color:"#D4A843"}}>
          \u2197 Share Session
        </button>
        <button onClick={onClose} style={{flex:1,minWidth:130,padding:"13px 16px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",
          cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,
          background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.35)"}}>
          New Session
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════════════════════ */
const ShareModal = ({ session, onClose }) => {
  const [copied,setCopied]=useState(false);
  if(!session)return null;
  const txt=`\ud83d\udd49\ufe0f Anuswara \u2014 The Sonic Body\n\nDeity: ${session.deity.name} (${session.deity.mantra})\nPeace Score: ${Math.round(session.peaceScore)}/100\nDuration: ${fmt(session.duration)}\nBrain State: ${BRAIN_STATES[session.brainState].name}\nChakra: ${session.deity.chakra}\nFrequency: ${session.deity.freq}Hz (${session.deity.domain})\nNO Boost: ~${Math.round(1+session.peaceScore/100*14)}\u00d7\n\nJoin me \u2192 anuswara.vercel.app\n\n#Anuswara #MantraScience`;

  const doShare=async()=>{
    if(navigator.share){try{await navigator.share({title:"Anuswara Session",text:txt});}catch(_){}}else{doCopy();}
  };
  const doCopy=()=>{navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(5,5,10,0.92)",backdropFilter:"blur(16px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:460,width:"100%",maxHeight:"80vh",overflow:"auto",padding:"28px 22px",borderRadius:18,
        background:"linear-gradient(135deg,rgba(212,168,67,0.04),rgba(255,255,255,0.015))",border:"1px solid rgba(212,168,67,0.08)"}}>
        <div style={{fontSize:9,letterSpacing:3,color:"rgba(212,168,67,0.5)",textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>Share Your Session</div>
        <pre style={{background:"rgba(0,0,0,0.25)",borderRadius:10,padding:14,fontSize:11,color:"rgba(255,255,255,0.55)",
          fontFamily:"'JetBrains Mono',monospace",lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word",
          border:"1px solid rgba(255,255,255,0.03)",maxHeight:260,overflow:"auto"}}>{txt}</pre>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={doShare} style={{flex:1,padding:"11px 14px",borderRadius:99,border:"1px solid rgba(212,168,67,0.2)",
            cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,
            background:"rgba(212,168,67,0.08)",color:"#D4A843"}}>{navigator.share?"\ud83d\udce4 Share":"\ud83d\udccb Copy"}</button>
          <button onClick={doCopy} style={{flex:1,padding:"11px 14px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",
            cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,
            background:"rgba(255,255,255,0.02)",color:copied?"#7BE87B":"rgba(255,255,255,0.35)"}}>{copied?"\u2713 Copied":"\ud83d\udccb Copy"}</button>
          <button onClick={onClose} style={{padding:"11px 14px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",
            cursor:"pointer",fontSize:11,fontFamily:"'Cormorant Garamond',serif",background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.25)"}}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SANGHA — GROUP SADHNA
   ═══════════════════════════════════════════════════════════════════════ */
const SanghaModule = ({ deity, peaceScore }) => {
  const [roomCode,setRoomCode]=useState("");
  const [inRoom,setInRoom]=useState(false);
  const [participants,setParticipants]=useState([]);
  const [messages,setMessages]=useState([]);
  const [msgInput,setMsgInput]=useState("");
  const [myName,setMyName]=useState("Sādhaka");
  const [collectiveScore,setCollectiveScore]=useState(0);
  const simIv=useRef(null);
  const chatEndRef=useRef(null);

  const createRoom=()=>{
    const code=Math.random().toString(36).substring(2,8).toUpperCase();
    setRoomCode(code); joinRoom(code);
  };

  const joinRoom=(code)=>{
    const c=code||roomCode; setInRoom(true); setRoomCode(c);
    const shuffled=[...SIMULATED_USERS].sort(()=>Math.random()-0.5);
    const count=2+Math.floor(Math.random()*3);
    const sims=shuffled.slice(0,count).map(u=>({...u,peaceScore:0,phase:0}));
    setParticipants(sims);
    setMessages([
      {from:"System",text:`Room ${c} created \u00b7 Deity: ${deity.name} (${deity.mantra})`,time:Date.now(),system:true},
      ...sims.map(s=>({from:"System",text:`${s.name} from ${s.location} joined \ud83d\ude4f`,time:Date.now(),system:true})),
    ]);
    simIv.current=setInterval(()=>{
      setParticipants(prev=>prev.map(p=>({...p,peaceScore:Math.min(100,p.peaceScore+Math.random()*2.5),phase:Math.floor(Math.random()*3)})));
    },2500);
  };

  const leaveRoom=()=>{
    setInRoom(false);setParticipants([]);setMessages([]);
    if(simIv.current)clearInterval(simIv.current);
  };

  useEffect(()=>()=>{if(simIv.current)clearInterval(simIv.current);},[]);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  useEffect(()=>{
    if(!inRoom)return;
    const all=[peaceScore,...participants.map(p=>p.peaceScore)];
    setCollectiveScore(all.reduce((a,b)=>a+b,0)/all.length);
  },[peaceScore,participants,inRoom]);

  const sendMsg=()=>{
    if(!msgInput.trim())return;
    setMessages(prev=>[...prev,{from:myName,text:msgInput,time:Date.now()}]);
    setMsgInput("");
    setTimeout(()=>{
      const r=participants[Math.floor(Math.random()*participants.length)];
      if(r){
        const replies=["\ud83d\ude4f Om Shanti","Beautiful resonance!","I feel the collective energy \ud83d\udd49\ufe0f","Hari Om \ud83d\ude4f","The vibrations are powerful today","Namaste \ud83d\ude4f","Going deeper \u2728","Such stillness \u2728","Can feel the resonance field growing","Jai \ud83d\ude4f"];
        setMessages(prev=>[...prev,{from:r.name,text:replies[Math.floor(Math.random()*replies.length)],time:Date.now()}]);
      }
    },1500+Math.random()*3000);
  };

  if(!inRoom){
    return(
      <div style={{padding:24,borderRadius:16,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:10,letterSpacing:3,color:"rgba(212,168,67,0.5)",textTransform:"uppercase",marginBottom:8}}>Sangha \u00b7 Group Sadhana</div>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.35)",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.7,maxWidth:420,margin:"0 auto"}}>
            Practice together across distances. The Vedic tradition holds that group resonance amplifies individual sadhana by the square of participants (Maharishi Effect).
          </p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:300,margin:"0 auto"}}>
          <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder="Your name"
            style={{padding:"11px 14px",borderRadius:10,background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",
              color:"#E8E4DC",fontSize:14,fontFamily:"'Cormorant Garamond',serif",outline:"none"}}/>
          <button onClick={createRoom}
            style={{padding:"13px 18px",borderRadius:99,border:`1px solid ${deity.color}30`,cursor:"pointer",
              fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,
              background:`${deity.color}0C`,color:deity.color}}>
            \u25c9 Create Room
          </button>
          <div style={{display:"flex",gap:6}}>
            <input value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())} placeholder="Code"
              style={{flex:1,padding:"11px 14px",borderRadius:10,background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",
                color:"#E8E4DC",fontSize:14,fontFamily:"'JetBrains Mono',monospace",outline:"none",letterSpacing:3,textAlign:"center"}}/>
            <button onClick={()=>joinRoom()} disabled={roomCode.length<4}
              style={{padding:"11px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",cursor:roomCode.length<4?"not-allowed":"pointer",
                fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,
                background:"rgba(255,255,255,0.035)",color:"rgba(255,255,255,0.35)",opacity:roomCode.length<4?0.4:1}}>Join</button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Room Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:12,
        background:`${deity.color}06`,border:`1px solid ${deity.color}12`,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.25)",textTransform:"uppercase"}}>Room</div>
          <div style={{fontSize:16,fontFamily:"'JetBrains Mono',monospace",color:deity.color,letterSpacing:4}}>{roomCode}</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.25)",textTransform:"uppercase"}}>Collective</div>
          <div style={{fontSize:20,fontWeight:200,color:collectiveScore>50?"#7BE87B":"#F0C040",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(collectiveScore)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{participants.length+1} practitioners</div>
          <button onClick={leaveRoom} style={{fontSize:9,letterSpacing:1,color:"#E85D3A",background:"none",border:"none",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",padding:"3px 0"}}>Leave</button>
        </div>
      </div>

      {/* Participant Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
        <div style={{padding:10,borderRadius:8,background:`${deity.color}08`,border:`1px solid ${deity.color}18`,textAlign:"center"}}>
          <div style={{fontSize:18}}>🧘</div>
          <div style={{fontSize:11,fontWeight:600,color:deity.color,marginTop:2}}>{myName} (You)</div>
          <div style={{marginTop:5,height:3,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${peaceScore}%`,borderRadius:2,background:deity.color,transition:"width 0.5s"}}/>
          </div>
          <div style={{fontSize:9,color:deity.color,fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{Math.round(peaceScore)}</div>
        </div>
        {participants.map(p=>(
          <div key={p.id} style={{padding:10,borderRadius:8,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)",textAlign:"center"}}>
            <div style={{fontSize:18}}>{p.avatar}</div>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",marginTop:2}}>{p.name}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>{p.location}</div>
            <div style={{marginTop:5,height:3,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.peaceScore}%`,borderRadius:2,background:p.peaceScore>50?"#7BE87B":"#F0C040",transition:"width 0.5s"}}/>
            </div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{Math.round(p.peaceScore)}</div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={{borderRadius:12,background:"rgba(255,255,255,0.012)",border:"1px solid rgba(255,255,255,0.035)",overflow:"hidden"}}>
        <div style={{padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.03)",
          fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>Sangha Chat</div>
        <div style={{height:180,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:5}}>
          {messages.map((m,i)=>(
            <div key={i} style={{fontSize:13,lineHeight:1.5,color:m.system?"rgba(212,168,67,0.35)":"rgba(255,255,255,0.5)",
              fontStyle:m.system?"italic":"normal",fontFamily:"'Cormorant Garamond',serif"}}>
              {!m.system&&<span style={{fontWeight:600,color:m.from===myName?deity.color:"rgba(255,255,255,0.55)",marginRight:5}}>{m.from}:</span>}
              {m.text}
            </div>
          ))}
          <div ref={chatEndRef}/>
        </div>
        <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
          <input value={msgInput} onChange={e=>setMsgInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter")sendMsg();}} placeholder="Type a message..."
            style={{flex:1,padding:"10px 14px",background:"transparent",border:"none",color:"#E8E4DC",
              fontSize:13,fontFamily:"'Cormorant Garamond',serif",outline:"none"}}/>
          <button onClick={sendMsg}
            style={{padding:"10px 16px",background:"transparent",border:"none",color:deity.color,cursor:"pointer",
              fontSize:13,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>Send</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   CORE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */
const PeaceGauge = ({ score, size=170 }) => {
  const s=6,r=(size-s*2)/2,circ=2*Math.PI*r,off=circ-(score/100)*circ;
  const c=score<25?"#E85D3A":score<50?"#F0C040":score<75?"#5BD4A8":"#7BE87B";
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0,margin:"0 auto"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <defs>
          <filter id="gg"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="ggl"><stop offset="0%" stopColor={c}/><stop offset="100%" stopColor={c} stopOpacity="0.3"/></linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={s}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ggl)" strokeWidth={s}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" filter="url(#gg)"
          style={{transition:"stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,0.3)",fontFamily:"'Cormorant Garamond',serif"}}>PEACE</span>
        <span style={{fontSize:38,fontWeight:200,color:c,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{Math.round(score)}</span>
        <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:2}}>{score<25?"SEEKING":score<50?"ALIGNING":score<75?"RESONATING":"SAMADHI"}</span>
      </div>
    </div>
  );
};

const FreqDisplay = ({ analyserRef, isActive, targetFreq, targetRange, sampleRate }) => {
  const [det,setDet]=useState(null);
  const [acc,setAcc]=useState(0);
  useEffect(()=>{
    if(!isActive||!analyserRef.current){setDet(null);setAcc(0);return;}
    const iv=setInterval(()=>{
      const a=analyserRef.current;if(!a)return;
      const bl=a.frequencyBinCount,d=new Float32Array(bl);a.getFloatFrequencyData(d);
      let mv=-Infinity,mi=0;for(let i=1;i<bl;i++){if(d[i]>mv){mv=d[i];mi=i;}}
      if(mv>-80){
        const f=(mi*sampleRate)/(bl*2);setDet(f);const[lo,hi]=targetRange;
        if(f>=lo&&f<=hi)setAcc(Math.max(0,1-Math.abs(f-targetFreq)/(hi-lo)*2)*100);
        else setAcc(Math.max(0,100-Math.min(Math.abs(f-lo),Math.abs(f-hi))*2));
      }else{setDet(null);setAcc(0);}
    },120);
    return()=>clearInterval(iv);
  },[isActive,analyserRef,targetFreq,targetRange,sampleRate]);
  return(
    <div style={{display:"flex",gap:14,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
      {[{l:"DETECTED",v:det?det.toFixed(1)+" Hz":"\u2014",c:det?"#F0C040":"rgba(255,255,255,0.15)"},
        {l:"TARGET",v:targetFreq+" Hz",c:"rgba(255,255,255,0.35)"},
        {l:"ACCURACY",v:isActive&&det?Math.round(acc)+"%":"\u2014",c:acc>60?"#7BE87B":acc>30?"#F0C040":"rgba(255,255,255,0.18)"},
      ].map((item,i)=>(
        <div key={item.l} style={{display:"flex",alignItems:"center",gap:14}}>
          {i>0&&<div style={{width:1,height:24,background:"rgba(255,255,255,0.05)"}}/>}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:8,letterSpacing:2,color:"rgba(255,255,255,0.22)"}}>{item.l}</div>
            <div style={{fontSize:16,fontFamily:"'JetBrains Mono',monospace",color:item.c}}>{item.v}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BreathGuide = ({ isActive, mantra, onPhaseChange }) => {
  const [phase,setPhase]=useState(0);
  const [progress,setProgress]=useState(0);
  const [cycle,setCycle]=useState(0);
  const iv=useRef(null);
  const durs=[4000,2000,6000];
  const defs=[
    {label:"Inhale",icon:"\u2191",inst:"Deep breath through the nose"},
    {label:mantra.replace(/\u1e41$/,""),icon:"\u25c6",inst:"25% \u2014 voice the seed syllable"},
    {label:"\u1e41~ Hum",icon:"\u3030",inst:"75% \u2014 nasal resonance, feel sinus vibration"},
  ];
  useEffect(()=>{
    if(!isActive){setPhase(0);setProgress(0);setCycle(0);if(iv.current)clearInterval(iv.current);return;}
    let e=0,cp=0;
    iv.current=setInterval(()=>{
      e+=50;setProgress(Math.min(e/durs[cp],1));
      if(e>=durs[cp]){e=0;cp=(cp+1)%3;if(cp===0)setCycle(c=>c+1);setPhase(cp);onPhaseChange?.(cp);}
    },50);
    return()=>clearInterval(iv.current);
  },[isActive,mantra]);
  const cur=defs[phase];
  const bc=phase===0?"#5B8DEF":phase===1?"#F0C040":"#7BE87B";
  return(
    <div>
      <div style={{display:"flex",gap:2,marginBottom:8}}>
        {defs.map((_,i)=>(
          <div key={i} style={{flex:durs[i],height:4,borderRadius:2,background:"rgba(255,255,255,0.045)",overflow:"hidden",position:"relative"}}>
            {i===phase&&<div style={{position:"absolute",inset:0,borderRadius:2,background:bc,width:`${progress*100}%`,transition:"width 50ms linear"}}/>}
            {i<phase&&<div style={{position:"absolute",inset:0,borderRadius:2,background:bc,opacity:0.2}}/>}
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:22,color:bc,width:26,textAlign:"center"}}>{cur.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,color:bc,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>{cur.label}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>{cur.inst}</div>
        </div>
        {isActive&&<span style={{fontSize:9,color:"rgba(255,255,255,0.13)",fontFamily:"'JetBrains Mono',monospace"}}>Cycle {cycle+1}</span>}
      </div>
    </div>
  );
};

const MicOverlay = ({ status, onReq, onSkip }) => {
  if(status==="granted")return null;
  const d=status==="denied";
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(5,5,10,0.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:400,width:"100%",textAlign:"center",padding:"36px 24px",borderRadius:18,background:"linear-gradient(135deg,rgba(212,168,67,0.04),rgba(255,255,255,0.015))",border:"1px solid rgba(212,168,67,0.08)"}}>
        <div style={{width:60,height:60,borderRadius:"50%",margin:"0 auto 18px",display:"flex",alignItems:"center",justifyContent:"center",
          background:d?"rgba(232,93,58,0.1)":"rgba(212,168,67,0.07)",border:`1px solid ${d?"rgba(232,93,58,0.18)":"rgba(212,168,67,0.12)"}`,
          animation:d?"none":"micP 2.5s ease-in-out infinite"}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d?"#E85D3A":"#D4A843"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
        </div>
        <h2 style={{fontSize:18,fontWeight:300,margin:"0 0 6px",fontFamily:"'Cormorant Garamond',serif",color:d?"#E85D3A":"#D4A843"}}>
          {d?"Microphone Blocked":"Microphone Required"}</h2>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.38)",lineHeight:1.7,fontFamily:"'Cormorant Garamond',serif"}}>
          {d?"Click the lock icon in your address bar \u2192 Set Mic to Allow \u2192 Refresh.":"All analysis is local. No audio is recorded or transmitted."}</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:18}}>
          {!d&&<button onClick={onReq} style={{padding:"11px 24px",borderRadius:99,border:"1px solid rgba(212,168,67,0.2)",cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,background:"rgba(212,168,67,0.08)",color:"#D4A843"}}>Enable</button>}
          <button onClick={onSkip} style={{padding:"11px 18px",borderRadius:99,border:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif",background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.28)"}}>Skip</button>
        </div>
      </div>
      <style>{`@keyframes micP{0%,100%{box-shadow:0 0 0 0 rgba(212,168,67,0.12)}50%{box-shadow:0 0 0 14px rgba(212,168,67,0)}}`}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════ */
export default function App(){
  const [tab,setTab]=useState("sadhana");
  const [deity,setDeity]=useState(DEITIES[0]);
  const [isListening,setIsListening]=useState(false);
  const [peaceScore,setPeaceScore]=useState(0);
  const [sessionTime,setSessionTime]=useState(0);
  const [phase,setPhase]=useState(0);
  const [micPerm,setMicPerm]=useState("unknown");
  const [showMicOv,setShowMicOv]=useState(false);
  const [micErr,setMicErr]=useState(null);
  const [sampleRate,setSampleRate]=useState(44100);
  const [sessionResult,setSessionResult]=useState(null);
  const [showShare,setShowShare]=useState(false);
  const [accuracyLog,setAccuracyLog]=useState([]);
  const [showScience,setShowScience]=useState(false);
  const [sessionHistory,setSessionHistory]=useState([]);

  const audioCtxRef=useRef(null);
  const analyserRef=useRef(null);
  const streamRef=useRef(null);
  const sessIv=useRef(null);
  const scoreIv=useRef(null);

  useEffect(()=>{
    (async()=>{
      try{
        if(navigator.permissions?.query){
          const r=await navigator.permissions.query({name:"microphone"});
          setMicPerm(r.state);if(r.state!=="granted")setShowMicOv(true);
          r.addEventListener("change",()=>{setMicPerm(r.state);if(r.state==="granted")setShowMicOv(false);});
        }else{setMicPerm("prompt");setShowMicOv(true);}
      }catch(e){setMicPerm("prompt");setShowMicOv(true);}
    })();
  },[]);

  const requestMic=useCallback(async()=>{
    try{
      if(!navigator.mediaDevices?.getUserMedia){setMicErr("Browser doesn't support mic.");return;}
      const s=await navigator.mediaDevices.getUserMedia({audio:true});
      s.getTracks().forEach(t=>t.stop());setMicPerm("granted");setShowMicOv(false);setMicErr(null);
    }catch(e){if(e.name==="NotAllowedError")setMicPerm("denied");else setMicErr(e.message||"Mic unavailable");}
  },[]);

  const startSession=useCallback(async()=>{
    try{
      setMicErr(null);
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
        const bl=an.frequencyBinCount,d=new Float32Array(bl);an.getFloatFrequencyData(d);
        let mv=-Infinity,mi=0;for(let i=1;i<bl;i++){if(d[i]>mv){mv=d[i];mi=i;}}
        if(mv>-75){
          const f=(mi*actx.sampleRate)/(bl*2);const[lo,hi]=dr;let acc=0;
          if(f>=lo&&f<=hi)acc=Math.max(0,1-Math.abs(f-df)/((hi-lo)/2)*0.5);
          else acc=Math.max(0,1-Math.min(Math.abs(f-lo),Math.abs(f-hi))/100);
          setAccuracyLog(prev=>{const n=[...prev,Math.round(acc*100)];return n.length>60?n.slice(-60):n;});
          setPeaceScore(prev=>{const sf=1+Math.max(0,1-acc)*0.5;return Math.min(100,prev+(0.2*acc*2.5)/sf);});
        }
      },200);
    }catch(e){
      if(e.name==="NotAllowedError"){setMicPerm("denied");setShowMicOv(true);}
      else setMicErr(e.message||"Mic error");
    }
  },[deity]);

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

  const tabs=[{id:"sadhana",label:"Sadhana",icon:"\ud83d\udd49\ufe0f"},{id:"insights",label:"Insights",icon:"\ud83d\udcca"},{id:"sangha",label:"Sangha",icon:"\ud83d\ude4f"}];

  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",color:"#E8E4DC",fontFamily:"'Cormorant Garamond',Georgia,serif",position:"relative"}}>
      {showMicOv&&<MicOverlay status={micPerm} onReq={requestMic} onSkip={()=>setShowMicOv(false)}/>}
      {showShare&&<ShareModal session={sessionResult} onClose={()=>setShowShare(false)}/>}

      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:`radial-gradient(ellipse at 50% 0%,${deity.color}06 0%,transparent 60%)`}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:940,margin:"0 auto",padding:"18px 14px 90px"}}>
        {/* Header */}
        <header style={{textAlign:"center",marginBottom:20}}>
          <h1 style={{fontSize:26,fontWeight:300,margin:0,letterSpacing:2,color:"#D4A843"}}>अनुस्वार</h1>
          <div style={{fontSize:10,fontWeight:300,letterSpacing:4,color:"rgba(255,255,255,0.22)",marginTop:2}}>THE SONIC BODY</div>
        </header>

        {/* Tab Bar */}
        <div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:22}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:"8px 18px",borderRadius:99,border:tab===t.id?`1px solid ${deity.color}28`:"1px solid rgba(255,255,255,0.03)",
                background:tab===t.id?`${deity.color}0A`:"transparent",cursor:"pointer",
                fontSize:11,letterSpacing:2,color:tab===t.id?deity.color:"rgba(255,255,255,0.25)",
                fontFamily:"'Cormorant Garamond',serif",fontWeight:600,transition:"all 0.3s"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: SADHANA ═══ */}
        {tab==="sadhana"&&(
          <>
            <div style={{overflowX:"auto",marginBottom:16,paddingBottom:4}}>
              <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
                {DEITIES.map(d=>(
                  <button key={d.id} onClick={()=>{if(!isListening)setDeity(d);}}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 7px",borderRadius:8,minWidth:62,
                      border:deity.id===d.id?`1px solid ${d.color}40`:"1px solid rgba(255,255,255,0.025)",
                      background:deity.id===d.id?`${d.color}0A`:"transparent",cursor:"pointer",transition:"all 0.3s"}}>
                    <span style={{fontSize:16,filter:deity.id===d.id?"none":"grayscale(0.5)"}}>{d.glyph}</span>
                    <span style={{fontSize:8,letterSpacing:1,color:deity.id===d.id?d.color:"rgba(255,255,255,0.25)",fontWeight:600}}>{d.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deity Info */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:18,
              background:`${deity.color}05`,border:`1px solid ${deity.color}10`,flexWrap:"wrap"}}>
              <span style={{fontSize:24}}>{deity.glyph}</span>
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontSize:15,fontWeight:600,color:deity.color}}>{deity.name} <span style={{fontWeight:300,fontSize:13,color:"rgba(255,255,255,0.28)",fontStyle:"italic"}}>{deity.mantra}</span></div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:1}}>{deity.freq}Hz \u00b7 {deity.domain} \u00b7 {deity.chakra}</div>
              </div>
              <button onClick={()=>setShowScience(!showScience)} style={{fontSize:9,letterSpacing:1,color:"rgba(255,255,255,0.22)",background:"none",border:"1px solid rgba(255,255,255,0.05)",borderRadius:99,padding:"5px 10px",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif"}}>{showScience?"Hide":"Science"}</button>
            </div>
            {showScience&&(
              <div style={{padding:12,borderRadius:10,background:"rgba(91,141,239,0.03)",border:"1px solid rgba(91,141,239,0.06)",marginBottom:16}}>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.7,margin:0}}>{deity.desc}</p>
                <p style={{fontSize:11,color:"rgba(91,212,168,0.45)",lineHeight:1.7,margin:"6px 0 0"}}>The Anusvara nasal hum creates Helmholtz Resonance in paranasal sinuses, increasing Nitric Oxide ~15\u00d7 (Karolinska Institute), triggering vasodilation and parasympathetic activation.</p>
              </div>
            )}

            {/* Main Practice: Body + Controls */}
            <div style={{display:"flex",gap:18,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"center"}}>
              <div style={{flex:"0 0 auto",borderRadius:14,background:"rgba(255,255,255,0.008)",border:"1px solid rgba(255,255,255,0.025)",overflow:"hidden"}}>
                <BodyVisualization isActive={isListening} deity={deity} phase={phase} peaceScore={peaceScore}/>
              </div>

              <div style={{flex:1,minWidth:260,display:"flex",flexDirection:"column",gap:14}}>
                <PeaceGauge score={peaceScore}/>
                <FreqDisplay analyserRef={analyserRef} isActive={isListening} targetFreq={deity.freq} targetRange={deity.range} sampleRate={sampleRate}/>
                <BreathGuide isActive={isListening} mantra={deity.mantra} onPhaseChange={setPhase}/>
                {isListening&&<div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.18)",fontFamily:"'JetBrains Mono',monospace"}}>Session: {fmt(sessionTime)}</div>}

                <button
                  onClick={()=>{if(isListening){stopSession();}else if(micPerm==="denied"){setShowMicOv(true);}else{startSession();}}}
                  style={{padding:"13px 18px",borderRadius:99,cursor:"pointer",fontSize:12,letterSpacing:2,textTransform:"uppercase",
                    fontFamily:"'Cormorant Garamond',serif",fontWeight:600,transition:"all 0.3s",
                    background:isListening?"rgba(232,93,58,0.1)":`${deity.color}12`,
                    color:isListening?"#E85D3A":deity.color,
                    border:`1px solid ${isListening?"rgba(232,93,58,0.22)":deity.color+"28"}`}}>
                  {isListening?"\u25fc End Session":micPerm==="denied"?"\ud83c\udfa4 Enable Mic":"\u25c9 Begin Sadhana"}
                </button>

                {micErr&&<div style={{fontSize:11,color:"#E85D3A",padding:8,borderRadius:6,background:"rgba(232,93,58,0.05)",textAlign:"center"}}>{micErr}</div>}

                <div style={{display:"flex",gap:5}}>
                  {[{s:1,l:"Inhale",p:"",c:"#5B8DEF"},{s:2,l:"Syllable",p:"25%",c:"#F0C040"},{s:3,l:"Anusvara",p:"75%",c:"#7BE87B"}].map(({s,l,p,c})=>(
                    <div key={s} style={{flex:1,padding:"8px 6px",borderRadius:6,textAlign:"center",
                      background:phase===s-1&&isListening?`${c}0A`:"rgba(255,255,255,0.01)",
                      border:`1px solid ${phase===s-1&&isListening?c+"20":"rgba(255,255,255,0.025)"}`,transition:"all 0.3s"}}>
                      <div style={{fontSize:14,fontWeight:300,color:c,opacity:0.55}}>{s}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:1}}>{l}</div>
                      {p&&<div style={{fontSize:8,color:c,marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>{p}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ TAB: INSIGHTS ═══ */}
        {tab==="insights"&&(
          sessionResult ? (
            <SessionInsights session={sessionResult} onShare={()=>setShowShare(true)}
              onClose={()=>{setSessionResult(null);setTab("sadhana");}}/>
          ) : (
            <div style={{textAlign:"center",padding:"50px 18px"}}>
              <div style={{fontSize:42,marginBottom:14,opacity:0.25}}>\ud83d\udcca</div>
              <div style={{fontSize:16,color:"rgba(255,255,255,0.28)",fontFamily:"'Cormorant Garamond',serif"}}>
                Complete a session to see insights
              </div>
              {sessionHistory.length>0&&(
                <div style={{marginTop:28,maxWidth:460,margin:"28px auto 0"}}>
                  <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.18)",textTransform:"uppercase",marginBottom:10}}>Past Sessions</div>
                  {sessionHistory.map((s,i)=>(
                    <button key={i} onClick={()=>setSessionResult(s)}
                      style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",borderRadius:8,marginBottom:5,
                        background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.03)",cursor:"pointer",textAlign:"left"}}>
                      <span style={{fontSize:18}}>{s.deity.glyph}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{s.deity.name} \u00b7 {fmt(s.duration)}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.18)"}}>{s.timestamp.toLocaleString()}</div>
                      </div>
                      <div style={{fontSize:16,fontWeight:200,color:s.peaceScore>=50?"#7BE87B":"#F0C040",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(s.peaceScore)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* ═══ TAB: SANGHA ═══ */}
        {tab==="sangha"&&<SanghaModule deity={deity} peaceScore={peaceScore}/>}

        <footer style={{textAlign:"center",marginTop:36}}>
          <div style={{fontSize:8,letterSpacing:3,color:"rgba(255,255,255,0.06)"}}>ANUSWARA \u00b7 THE SONIC BODY \u00b7 BIO-ACOUSTIC MANTRA LAB</div>
        </footer>
      </div>
    </div>
  );
}
