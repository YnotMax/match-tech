import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { FileWarning, Skull, Terminal, Zap, Github, Linkedin } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const Avatar = ({ member, getGithubUrl, currentUser }: { member: any, getGithubUrl: (v: string) => string, currentUser: any }) => {
  const [imageIndex, setImageIndex] = useState(0);
  
  const sources = [];
  
  // Prefer member.photoURL from database, fallback to currentUser.photoURL if looking at own profile
  const photoUrlToUse = member.photoURL || (currentUser && currentUser.uid === member.id ? currentUser.photoURL : null);

  if (photoUrlToUse) {
    // googleusercontent URLs default to 96x96, replace with 400x400 for better quality
    let photo = photoUrlToUse;
    if (photo.includes('googleusercontent.com') && photo.includes('=s96-c')) {
      photo = photo.replace('=s96-c', '=s400-c');
    } else if (photo.includes('googleusercontent.com') && !photo.includes('=')) { // some urls don't have the size param
      photo = `${photo}=s400-c`;
    }
    sources.push(photo);
  }
  if (member.github) {
    sources.push(`${getGithubUrl(member.github)}.png`);
  }

  const currentSrc = sources[imageIndex];

  if (!currentSrc) {
    return <div className="w-full h-full flex items-center justify-center font-black">{member.name?.[0] || "?"}</div>;
  }

  return (
    <img 
      src={currentSrc} 
      alt={member.name} 
      className="w-full h-full object-cover" 
      referrerPolicy="no-referrer"
      onError={() => setImageIndex(i => i + 1)}
    />
  );
};

export default function Guilda() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const { user } = useAuth();
  
  const [roastActiveMember, setRoastActiveMember] = useState<string | null>(null);
  const [roastStep, setRoastStep] = useState<'selecting' | 'loading' | null>(null);
  const [roastLogs, setRoastLogs] = useState<string[]>([]);
  const [activePersonaView, setActivePersonaView] = useState<'brutal' | 'mild' | null>(null);

  useEffect(() => {
    if (!user) return; // Note we only fetch if logged in

    const q = query(collection(db, "members"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort so current user is always first
      data.sort((a, b) => {
        if (a.id === user.uid) return -1;
        if (b.id === user.uid) return 1;
        return (a.name || "").localeCompare(b.name || "");
      });
      
      setMembers(data);
    });

    return () => unsub();
  }, [user]);

  const getColor = (index: number) => {
    const palletes = [
      { bg: "bg-neo-lime", accent: "bg-neo-pink", text: "text-neo-black" },
      { bg: "bg-neo-pink", accent: "bg-neo-cyan", text: "text-white" },
      { bg: "bg-neo-cyan", accent: "bg-neo-yellow", text: "text-neo-black" },
      { bg: "bg-neo-yellow", accent: "bg-neo-lime", text: "text-neo-black" },
    ];
    return palletes[index % palletes.length];
  };

  const getRadarData = (skills: any) => {
    if (!skills) return [];
    return [
      { subject: 'Front', A: skills.frontend || 0, fullMark: 10 },
      { subject: 'Back', A: skills.backend || 0, fullMark: 10 },
      { subject: 'UX', A: skills.ux_ui || 0, fullMark: 10 },
      { subject: 'Dados', A: skills.dados || 0, fullMark: 10 },
      { subject: 'Hard', A: skills.hardware_android || 0, fullMark: 10 },
      { subject: 'AI', A: skills.vibe_coding || 0, fullMark: 10 },
    ];
  };

  const getGithubUrl = (val: string) => {
    if (!val) return "";
    const clean = val.trim()
      .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "")
      .replace(/\/$/, "")
      .replace(/^@/, "");
    return `https://github.com/${clean}`;
  };

  const getLinkedinUrl = (val: string) => {
    if (!val) return "";
    const clean = val.trim()
      .replace(/^(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/(?:in|profile)\//i, "")
      .replace(/\/$/, "")
      .replace(/^@/, "");
    return `https://linkedin.com/in/${clean}`;
  };

  const executeRoast = async (m: any, persona: 'brutal' | 'mild') => {
    setActivePersonaView(persona);
    const existingField = persona === 'brutal' ? m.roastBrutal : m.roastMild;
    
    if (existingField) {
      setSelectedMember(m);
      return;
    }

    setRoastStep('loading');
    
    const logsSequence = [
        "Iniciando conexão neural...",
        `Selecionando persona: ${persona.toUpperCase()}...`,
        "Lendo vetos e paixões...",
        "Avaliando nível de vibração AI...",
        "Preparando o veredito final..."
    ];
    
    let currentLog = 0;
    setRoastLogs([logsSequence[0]]);
    
    const interval = setInterval(() => {
        currentLog++;
        if (currentLog < logsSequence.length) {
            setRoastLogs(prev => [...prev, logsSequence[currentLog]].slice(-3));
        }
    }, 1500);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: m.id, memberData: m, persona })
      });
      const data = await res.json();
      
      if (data.roast) {
        const updateData: any = { updatedAt: new Date() };
        if (persona === 'brutal') {
           updateData.roastBrutal = data.roast;
        } else {
           updateData.roastMild = data.roast;
        }
        
        try {
          await updateDoc(doc(db, "members", m.id), updateData);
        } catch (dbErr) {
          console.error("Erro ao salvar sina no banco:", dbErr);
          // Mesmo se falhar, mostramos para o usuario
        }
        setSelectedMember({ ...m, ...updateData });
      } else {
        alert("Erro no backend: " + JSON.stringify(data));
      }
    } catch (e: any) {
      console.error(e);
      alert("Erro ao chamar o roast.");
    } finally {
      clearInterval(interval);
      setRoastStep(null);
      setRoastActiveMember(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-12 px-6"
    >
      <div className="mb-12 border-b-[6px] border-neo-black pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-heading mb-4 text-neo-black uppercase tracking-tighter">A Guilda_</h1>
          <div className="flex flex-wrap items-center gap-3">
             <p className="text-xl font-bold bg-white inline-block px-4 py-2 neo-border">Esquadrão Operacional Tech Floripa '26</p>
             <div className="bg-neo-black text-white px-4 py-2 text-sm font-mono flex items-center gap-2">
                <span className="w-2 h-2 bg-neo-lime rounded-full animate-pulse"></span>
                <span>STATUS: PRONTO PARA COMBATE</span>
             </div>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="bg-neo-black text-neo-lime neo-border shadow-[4px_4px_0_0_#B8FF29] px-6 py-4 font-heading text-3xl flex items-center justify-between w-full md:w-auto min-w-[200px]">
             <span>OPERADORES</span>
             <span>[{members.length}]</span>
           </div>
        </div>
      </div>

      {!user ? (
        <div className="text-center p-16 bg-white neo-border border-[6px] shadow-[12px_12px_0_0_#FF2E93]">
           <div className="w-24 h-24 bg-neo-pink neo-border rotate-12 flex items-center justify-center mx-auto mb-8 shadow-[4px_4px_0_0_#000]">
              <FileWarning className="w-12 h-12 text-white" />
           </div>
           <h2 className="text-4xl md:text-5xl font-heading text-neo-black uppercase mb-4 tracking-tighter">ACESSO NEGADO</h2>
           <p className="font-bold text-xl text-gray-700 bg-neo-bg inline-block px-6 py-4 neo-border">Protocolo de segurança exige que você se cadastre no Onboarding primeiro.</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center p-16 bg-white neo-border border-[6px] shadow-[12px_12px_0_0_#000]">
           <h2 className="text-4xl font-heading text-neo-black uppercase animate-pulse flex items-center justify-center gap-4">
              <Zap className="w-10 h-10 text-neo-yellow" /> AGUARDANDO OPERADORES...
           </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {members.map((m, i) => {
            const colors = getColor(i);
            
            return (
              <div key={m.id} className="flex flex-col bg-white neo-border border-4 shadow-[8px_8px_0_0_#000] overflow-hidden group">
                
                {/* Header: Roles & ID */}
                <div className={`p-4 md:p-6 border-b-4 border-neo-black ${colors.bg} ${colors.text} flex flex-wrap justify-between items-center gap-4`}>
                    <div className="flex items-center gap-3">
                       <span className="font-heading font-black text-2xl md:text-3xl uppercase tracking-widest">{m.primaryRole || 'OPERADOR'}</span>
                       {m.secondaryRoles?.length > 0 && (
                          <div className="hidden sm:flex gap-2">
                             {m.secondaryRoles.map((r: string) => (
                                <span key={r} className="text-[10px] font-black border-2 border-current px-2 py-1 uppercase">{r}</span>
                             ))}
                          </div>
                       )}
                    </div>
                    <span className="font-mono text-sm uppercase bg-black text-white px-3 py-1 font-bold">
                       ID_{m.id.slice(0,5)}
                    </span>
                 </div>

                 {/* Body: 2 Columns */}
                 <div className="flex flex-col sm:flex-row flex-1 p-0">
                    
                    {/* Left: Avatar & Links */}
                    <div className="w-full sm:w-1/3 p-6 border-b-4 sm:border-b-0 sm:border-r-4 border-neo-black bg-neo-bg flex flex-col items-center justify-center relative">
                       {/* Floating Accents */}
                       <div className={`absolute top-4 left-4 w-4 h-4 ${colors.accent} border-2 border-black rotate-12`}></div>
                       <div className="absolute bottom-4 right-4 w-3 h-3 bg-black rounded-full"></div>
                       
                       <div className={`w-32 h-32 md:w-40 md:h-40 rounded-none border-[5px] border-black bg-white overflow-hidden shadow-[6px_6px_0_0_#000] rotate-[-2deg] transition-transform group-hover:rotate-0 group-hover:scale-105 duration-300 z-10`}>
                          <Avatar member={m} getGithubUrl={getGithubUrl} currentUser={user} />
                       </div>
                       
                       <h2 className="text-xl md:text-2xl font-black font-heading uppercase text-center mt-6 break-words leading-none bg-white px-3 py-2 neo-border -rotate-1 relative z-20 shadow-[4px_4px_0_0_#000]">
                          {m.name || "NOME_NULO"}
                       </h2>
                       
                       <div className="flex gap-3 mt-6 w-full justify-center">
                           {m.github && <a href={getGithubUrl(m.github)} target="_blank" rel="noreferrer" className="flex-1 flex gap-2 items-center justify-center text-xs font-black bg-white border-2 border-neo-black hover:bg-neo-lime py-2 uppercase shadow-[3px_3px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"><Github className="w-4 h-4"/> HUB</a>}
                           {m.linkedin && <a href={getLinkedinUrl(m.linkedin)} target="_blank" rel="noreferrer" className="flex-1 flex gap-2 items-center justify-center text-xs font-black bg-[#0077b5] border-2 border-neo-black text-white hover:bg-white hover:text-[#0077b5] py-2 uppercase shadow-[3px_3px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"><Linkedin className="w-4 h-4"/> IN</a>}
                       </div>
                    </div>

                    {/* Right: Skills & Canvas */}
                    <div className="flex-1 flex flex-col pt-6 sm:pt-0">
                       
                       {/* Top Skills Rows - Replaced with Radar */}
                       <div className="p-4 border-b-4 border-neo-black h-64 bg-neo-bg relative overflow-hidden group/chart cursor-crosshair">
                          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData(m.skills)}>
                                <PolarGrid stroke="#000" strokeWidth={1} strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: '900', textAnchor: 'middle' }} />
                                <Radar
                                  name="Skill"
                                  dataKey="A"
                                  stroke="#FF2E93"
                                  strokeWidth={4}
                                  fill="#FF2E93"
                                  fillOpacity={0.4}
                                />
                              </RadarChart>
                          </ResponsiveContainer>
                       </div>

                       {/* Canvas (Loves / Vetoes / Comfort) */}
                       <div className="p-4 flex-1 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                          <div className="flex flex-col gap-3">
                              <span className="text-[10px] font-black uppercase text-neo-black bg-neo-lime border-2 border-black px-1.5 py-0.5 w-fit shadow-[2px_2px_0_0_#000] -rotate-2">
                                 PAIXÕES (LOVES)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                  {m.canvas?.loves?.length > 0 ? m.canvas.loves.map((item: string) => (
                                     <span key={item} className="text-[9px] font-bold bg-white border border-black px-1.5 py-0.5 shadow-[1px_1px_0_0_#EDEDED]">{item}</span>
                                  )) : <span className="text-xs italic text-gray-400">Mistério.</span>}
                              </div>
                          </div>

                          <div className="flex flex-col gap-3">
                              <span className="text-[10px] font-black uppercase text-neo-black bg-neo-cyan border-2 border-black px-1.5 py-0.5 w-fit shadow-[2px_2px_0_0_#000]">
                                 OPERO BEM
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                  {m.canvas?.comfort?.length > 0 ? m.canvas.comfort.map((item: string) => (
                                     <span key={item} className="text-[9px] font-bold bg-white border border-neo-cyan px-1.5 py-0.5 shadow-[1px_1px_0_0_#00E5FF]">{item}</span>
                                  )) : <span className="text-[9px] italic text-gray-400">Neutro.</span>}
                              </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                              <span className="text-[10px] font-black uppercase text-white bg-neo-pink border-2 border-black px-1.5 py-0.5 w-fit shadow-[2px_2px_0_0_#000] rotate-2">
                                 NEM F*DENDO
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                  {m.canvas?.veto?.length > 0 ? m.canvas.veto.map((item: string) => (
                                     <span key={item} className="text-[9px] font-bold bg-neo-bg border border-black px-1.5 py-0.5">{item}</span>
                                  )) : <span className="text-[9px] italic text-gray-400">Faz qualquer jogo.</span>}
                              </div>
                          </div>
                       </div>

                    </div>
                 </div>

                 {/* Action Button: LER MINHA SINA */}
                 {user && user.uid === m.id && (
                   <div className="bg-neo-black p-4 z-10 w-full relative min-h-[96px] flex flex-col justify-center">
                      {roastActiveMember !== m.id ? (
                          <button 
                             className={`w-full py-4 px-6 border-4 border-transparent hover:border-neo-lime text-white font-heading font-black text-xl uppercase tracking-widest transition-all hover:bg-neo-lime hover:text-neo-black active:translate-y-1`}
                             onClick={() => {
                                setRoastActiveMember(m.id);
                                setRoastStep('selecting');
                             }}
                          >
                             <span className="flex items-center justify-center gap-3">
                                <Skull className="w-6 h-6 group-hover:rotate-12 transition-transform" /> 
                                {m.roastBrutal || m.roastMild || m.roast ? "VER SINA REGISTRADA" : "LER MINHA SINA"}
                             </span>
                          </button>
                      ) : roastStep === 'selecting' ? (
                          <div className="flex gap-2 w-full">
                              <button 
                                  className="flex-1 py-3 px-2 border-2 border-neo-pink bg-neo-black hover:bg-neo-pink text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-[2px_2px_0_0_#FF2E93] hover:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-1 transition-all"
                                  onClick={() => executeRoast(m, 'brutal')}
                              >
                                  TECH LEAD BRUTAL (SARCÁSTICO)
                              </button>
                              <button 
                                  className="flex-1 py-3 px-2 border-2 border-neo-cyan bg-neo-black hover:bg-neo-cyan text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-[2px_2px_0_0_#00E5FF] hover:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-1 transition-all"
                                  onClick={() => executeRoast(m, 'mild')}
                              >
                                  MENTOR BONZINHO (SUAVE)
                              </button>
                          </div>
                      ) : (
                          <div className="w-full font-mono text-[10px] sm:text-xs text-neo-lime h-full flex flex-col justify-center gap-1 overflow-hidden opacity-80">
                             {roastLogs.map((log, lidx) => (
                                 <motion.span 
                                    key={lidx} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                 >
                                    &gt; {log}
                                 </motion.span>
                             ))}
                             <motion.span 
                                animate={{ opacity: [1, 0, 1] }} 
                                transition={{ repeat: Infinity, duration: 0.8 }}
                             >
                                <span className="inline-block w-2 h-3 bg-neo-lime ml-1"></span>
                             </motion.span>
                          </div>
                      )}
                   </div>
                 )}
                 
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Roast */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-neo-black/90 backdrop-blur-md"
               onClick={() => setSelectedMember(null)}
            />
            <div className="flex min-h-full items-start justify-center p-4 pt-24 pb-20 sm:p-8 sm:pt-28">
               <motion.div 
                 initial={{ scale: 0.9, y: 50, rotate: -2 }}
                 animate={{ scale: 1, y: 0, rotate: 0 }}
                 exit={{ scale: 0.9, y: 50, rotate: 2 }}
                 className="relative max-w-3xl w-full mx-auto"
               >
                 <div className="absolute -top-6 -right-4 sm:-right-6 z-10">
                    <button 
                     onClick={() => setSelectedMember(null)}
                     className="bg-neo-pink text-white border-[4px] border-neo-black w-14 h-14 sm:w-16 sm:h-16 rounded-full font-black text-xl sm:text-2xl shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center"
                    >
                       X
                    </button>
                 </div>
                 
                 <div className="bg-white border-[6px] border-neo-black shadow-[12px_12px_0_0_#B8FF29] sm:shadow-[16px_16px_0_0_#B8FF29] flex flex-col">
                   
                   {/* Modal Header */}
                   <div className="bg-neo-black p-6 sm:p-8 flex items-center gap-4 text-neo-lime relative overflow-hidden">
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#B8FF29_1px,transparent_1px)] [background-size:12px_12px]"></div>
                     <Terminal className="w-10 h-10 sm:w-12 sm:h-12 relative z-10 shrink-0" />
                     <div className="relative z-10">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading uppercase m-0 leading-none truncate">O Veredito_</h2>
                        <p className="text-white font-mono mt-1 sm:mt-2 text-xs sm:text-sm truncate">ALVO: {selectedMember.name}</p>
                     </div>
                   </div>
                   
                   {/* Modal Content */}
                   <div className="p-6 sm:p-10 md:p-12 format-roast">
                     <div className="text-base sm:text-lg md:text-xl font-bold font-sans whitespace-pre-wrap leading-relaxed text-neo-black bg-neo-bg p-6 sm:p-8 neo-border border-4 relative">
                       {/* Decorative pin */}
                       <div className="absolute -top-4 -left-4 w-8 h-8 bg-neo-pink rounded-full border-4 border-black shadow-[2px_2px_0_0_#000] hidden sm:block"></div>
                       <div className="absolute -top-3 -left-3 w-6 h-6 bg-neo-pink rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] sm:hidden"></div>
                       {activePersonaView === 'brutal' ? (selectedMember.roastBrutal || selectedMember.roast) : (selectedMember.roastMild || selectedMember.roastBrutal || selectedMember.roast)}
                     </div>
                     
                     {(user?.uid === selectedMember.id || true) && (
                       <div className="mt-8 pt-6 border-t-[4px] border-black border-dashed flex flex-col md:flex-row gap-4">
                          <button 
                              className={`flex-1 py-4 px-3 border-[3px] border-black bg-neo-black hover:bg-white text-neo-pink hover:text-black text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activePersonaView === 'brutal' ? 'opacity-50 cursor-not-allowed border-dashed' : 'shadow-[4px_4px_0_0_#000] hover:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-1'}`}
                              disabled={activePersonaView === 'brutal'}
                              onClick={() => { setSelectedMember(null); executeRoast(selectedMember, 'brutal'); }}
                          >
                              {selectedMember.roastBrutal ? 'VER TECH LEAD (BRUTAL)' : 'GERAR TECH LEAD (BRUTAL)'}
                          </button>
                          <button 
                              className={`flex-1 py-4 px-3 border-[3px] border-black bg-neo-black hover:bg-white text-neo-cyan hover:text-black text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activePersonaView === 'mild' ? 'opacity-50 cursor-not-allowed border-dashed' : 'shadow-[4px_4px_0_0_#000] hover:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-1'}`}
                              disabled={activePersonaView === 'mild'}
                              onClick={() => { setSelectedMember(null); executeRoast(selectedMember, 'mild'); }}
                          >
                              {selectedMember.roastMild ? 'VER MENTOR (SUAVE)' : 'GERAR MENTOR (SUAVE)'}
                          </button>
                       </div>
                     )}
                   </div>
  
                   {/* Modal Footer */}
                   <div className="bg-neo-black text-white p-4 sm:p-6 font-heading tracking-widest text-[10px] sm:text-xs flex flex-wrap justify-between items-center gap-2 border-t-[6px] border-neo-black">
                     <span>[SISTEMA ROASTED & TOASTED] &copy; 2026</span>
                     <span className="bg-neo-pink px-2 py-1 border-2 border-white">STRICTLY CONFIDENTIAL</span>
                   </div>
  
                 </div>
               </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
