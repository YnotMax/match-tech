import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import TagBadge from "../components/ui/TagBadge";
import ProfileCard from "../components/ui/ProfileCard";
import { FileWarning, Skull, Terminal, Zap, Github, Linkedin, Search, Filter } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Discover() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const { user } = useAuth();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("");

  // Roast / IA State
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [roastActiveMember, setRoastActiveMember] = useState<string | null>(null);
  const [roastStep, setRoastStep] = useState<'selecting' | 'loading' | null>(null);
  const [roastLogs, setRoastLogs] = useState<string[]>([]);
  const [activePersonaView, setActivePersonaView] = useState<'brutal' | 'mild' | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch profiles collection in real-time
    const q = query(collection(db, "profiles"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort: current logged in user first, then alphabetically
      data.sort((a, b) => {
        if (a.id === user.uid) return -1;
        if (b.id === user.uid) return 1;
        return (a.name || "").localeCompare(b.name || "");
      });
      
      setProfiles(data);
    });

    return () => unsub();
  }, [user]);

  // Roles list derived from blueprints
  const rolesList = [
    "ALL",
    "Frontend Infiltrator", 
    "Backend Architect", 
    "Data Scientist", 
    "Hardware Operator", 
    "Vibe Coder / AI Master", 
    "UI/UX Designer", 
    "DevOps Engineer", 
    "Cyber Security", 
    "Fullstack Generalist"
  ];

  // Derive popular tags for quick filter click
  const popularTags = useMemo(() => {
    const counts: { [key: string]: number } = {};
    profiles.forEach(p => {
      const loves = p.canvas?.loves || [];
      loves.forEach((t: string) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(entry => entry[0]);
  }, [profiles]);

  // Filter logic
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesSearch = 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.github?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = 
        selectedRole === "ALL" || 
        p.primaryRole === selectedRole || 
        p.secondaryRoles?.includes(selectedRole);

      const matchesStatus = 
        selectedStatus === "ALL" || 
        p.status === selectedStatus;

      const matchesTag = 
        !selectedTag || 
        p.canvas?.loves?.includes(selectedTag) || 
        p.canvas?.comfort?.includes(selectedTag);

      return matchesSearch && matchesRole && matchesStatus && matchesTag;
    });
  }, [profiles, searchQuery, selectedRole, selectedStatus, selectedTag]);

  const executeRoast = async (m: any, persona: 'brutal' | 'mild') => {
    setActivePersonaView(persona);
    const existingField = persona === 'brutal' ? m.roastBrutal : m.roastMild;
    
    if (existingField) {
      setSelectedProfile(m);
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
    }, 1200);

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
          await updateDoc(doc(db, "profiles", m.id), updateData);
        } catch (dbErr) {
          console.error("Erro ao salvar sina no banco:", dbErr);
        }
        setSelectedProfile({ ...m, ...updateData });
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

  const radarData = (m: any) => {
    const skills = m.skills || {};
    return [
      { subject: 'Front', A: skills.frontend || 0 },
      { subject: 'Back', A: skills.backend || 0 },
      { subject: 'UX', A: skills.ux_ui || 0 },
      { subject: 'Dados', A: skills.dados || 0 },
      { subject: 'Hard', A: skills.hardware_android || 0 },
      { subject: 'AI', A: skills.vibe_coding || 0 },
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-12 px-6"
    >
      {/* Page Header */}
      <div className="mb-12 border-b-[6px] border-neo-black pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-heading mb-4 text-neo-black uppercase tracking-tighter">DESCOBRIR_</h1>
          <div className="flex flex-wrap items-center gap-3">
             <p className="text-xl font-bold bg-white inline-block px-4 py-2 neo-border">MATCHMAKING DA COMUNIDADE TECH FLORIPA '26</p>
             <div className="bg-neo-black text-white px-4 py-2 text-sm font-mono flex items-center gap-2">
                <span className="w-2 h-2 bg-neo-lime rounded-full animate-pulse"></span>
                <span>STATUS: OPERAÇÕES ABERTAS</span>
             </div>
          </div>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
           <div className="bg-neo-black text-neo-lime neo-border shadow-[4px_4px_0_0_#B8FF29] px-6 py-4 font-heading text-3xl flex items-center justify-between w-full lg:w-auto min-w-[200px]">
             <span>OPERADORES</span>
             <span>[{filteredProfiles.length}]</span>
           </div>
        </div>
      </div>

      {!user ? (
        <div className="text-center p-16 bg-white neo-border border-[6px] shadow-[12px_12px_0_0_#FF2E93]">
           <div className="w-24 h-24 bg-neo-pink neo-border rotate-12 flex items-center justify-center mx-auto mb-8 shadow-[4px_4px_0_0_#000]">
              <FileWarning className="w-12 h-12 text-white" />
           </div>
           <h2 className="text-4xl md:text-5xl font-heading text-neo-black uppercase mb-4 tracking-tighter">ACESSO NEGADO</h2>
           <p className="font-bold text-xl text-gray-700 bg-neo-bg inline-block px-6 py-4 neo-border">Você precisa completar o onboarding para acessar o feed de matches.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Bento-style Filters Panel */}
          <div className="bg-white border-4 border-neo-black p-6 shadow-[8px_8px_0_0_#000] space-y-6">
            <h3 className="font-heading font-black text-2xl uppercase tracking-tight flex items-center gap-2">
              <Filter className="w-6 h-6 text-neo-cyan" /> FILTRAR OPERADORES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search text */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-neo-black/60 tracking-wider">Busca livre (nome, github, bio)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-neo-black/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar operador..."
                    className="w-full pl-12 pr-4 py-3 neo-border bg-neo-bg font-bold focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-neo-black/60 tracking-wider">Classe Principal</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3.5 neo-border bg-neo-bg font-black focus:bg-white transition-all outline-none text-xs"
                >
                  {rolesList.map(role => (
                    <option key={role} value={role}>
                      {role === "ALL" ? "TODAS AS CLASSES" : role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-neo-black/60 tracking-wider">Disponibilidade</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3.5 neo-border bg-neo-bg font-black focus:bg-white transition-all outline-none text-xs"
                >
                  <option value="ALL">TODAS AS DISPONIBILIDADES</option>
                  <option value="looking">BUSCANDO EQUIPE</option>
                  <option value="open">ABERTO A PROPOSTAS</option>
                  <option value="complete">EQUIPE FORMADA</option>
                </select>
              </div>
            </div>

            {/* Quick Tag Filtering */}
            {popularTags.length > 0 && (
              <div className="pt-4 border-t-2 border-dashed border-neo-black flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase text-neo-black/60">Filtrar por Paixão:</span>
                {popularTags.map(tag => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? "" : tag)}
                      className={`px-3 py-1 text-[10px] font-heading font-black uppercase border-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0_0_#000] active:shadow-none ${
                        isSelected 
                          ? "bg-neo-cyan text-neo-black" 
                          : "bg-white text-neo-black hover:bg-neo-bg-alt"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag("")}
                    className="text-[9px] font-black text-neo-pink uppercase hover:underline"
                  >
                    [Limpar Tag]
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bento-grid list of ProfileCards */}
          {filteredProfiles.length === 0 ? (
            <div className="text-center p-16 bg-white neo-border border-[6px] shadow-[12px_12px_0_0_#000] space-y-4">
              <Zap className="w-12 h-12 text-neo-yellow mx-auto animate-pulse" />
              <h2 className="text-3xl font-heading text-neo-black uppercase tracking-tighter">NENHUM OPERADOR COMPATÍVEL</h2>
              <p className="font-bold text-gray-500 max-w-md mx-auto">Tente ajustar seus filtros de busca para encontrar perfis correspondentes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProfiles.map((p, idx) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  colorIndex={idx}
                  onClick={() => {
                    setSelectedProfile(p);
                    setActivePersonaView(p.roastBrutal ? 'brutal' : p.roastMild ? 'mild' : 'brutal');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for Roast */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-neo-black/95 backdrop-blur-md"
               onClick={() => setSelectedProfile(null)}
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
                      onClick={() => setSelectedProfile(null)}
                      className="bg-neo-pink text-white border-[4px] border-neo-black w-14 h-14 sm:w-16 sm:h-16 rounded-full font-black text-xl sm:text-2xl shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center cursor-pointer"
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
                        <p className="text-white font-mono mt-1 sm:mt-2 text-xs sm:text-sm truncate">ALVO: {selectedProfile.name}</p>
                     </div>
                   </div>
                   
                   {/* Modal Content */}
                   <div className="p-6 sm:p-10 md:p-12">
                     <div className="text-base sm:text-lg md:text-xl font-bold font-sans whitespace-pre-wrap leading-relaxed text-neo-black bg-neo-bg p-6 sm:p-8 neo-border border-4 relative">
                       {/* Decorative pin */}
                       <div className="absolute -top-4 -left-4 w-8 h-8 bg-neo-pink rounded-full border-4 border-black shadow-[2px_2px_0_0_#000] hidden sm:block"></div>
                       <div className="absolute -top-3 -left-3 w-6 h-6 bg-neo-pink rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] sm:hidden"></div>
                       {activePersonaView === 'brutal' ? (selectedProfile.roastBrutal || selectedProfile.roast) : (selectedProfile.roastMild || selectedProfile.roastBrutal || selectedProfile.roast)}
                     </div>
                     
                     <div className="mt-8 pt-6 border-t-[4px] border-black border-dashed flex flex-col md:flex-row gap-4">
                        <button 
                            className={`flex-1 py-4 px-3 border-[3px] border-black bg-neo-black hover:bg-white text-neo-pink hover:text-black text-xs md:text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${activePersonaView === 'brutal' ? 'opacity-50 cursor-not-allowed border-dashed shadow-none translate-y-0' : 'shadow-[4px_4px_0_0_#000] hover:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-1'}`}
                            disabled={activePersonaView === 'brutal'}
                            onClick={() => { setSelectedProfile(null); executeRoast(selectedProfile, 'brutal'); }}
                        >
                            {selectedProfile.roastBrutal ? 'VER TECH LEAD (BRUTAL)' : 'GERAR TECH LEAD (BRUTAL)'}
                        </button>
                        <button 
                            className={`flex-1 py-4 px-3 border-[3px] border-black bg-neo-black hover:bg-white text-neo-cyan hover:text-black text-xs md:text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${activePersonaView === 'mild' ? 'opacity-50 cursor-not-allowed border-dashed shadow-none translate-y-0' : 'shadow-[4px_4px_0_0_#000] hover:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-1'}`}
                            disabled={activePersonaView === 'mild'}
                            onClick={() => { setSelectedProfile(null); executeRoast(selectedProfile, 'mild'); }}
                        >
                            {selectedProfile.roastMild ? 'VER MENTOR (SUAVE)' : 'GERAR MENTOR (SUAVE)'}
                        </button>
                     </div>
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
