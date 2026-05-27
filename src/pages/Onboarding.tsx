import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import { X, Plus, Terminal, User, ShieldCheck, Github, Linkedin, Info, Heart, Check, Ban } from "lucide-react";
import Avatar from "../components/ui/Avatar";
import { firestoreLog } from "../lib/logger";

const TAG_CATEGORIES = [
  {
    name: "Core Tech",
    color: "bg-neo-cyan",
    textColor: "text-neo-cyan",
    tags: ["React", "Next.js", "Vue", "Vite", "Tailwind", "Node.js", "Rust", "Go", "Java", "C++", "C#", "SQL", "NoSQL", "Firebase", "Supabase", "AWS", "Google Cloud", "Docker", "Kubernetes", "Redis", "MQTT"]
  },
  {
    name: "IA & Future",
    color: "bg-neo-pink",
    textColor: "text-neo-pink",
    tags: ["Vibe Coding", "LLMs", "RAG", "Vector DBs", "OpenCV", "Fine-tuning", "Python", "Data Pipeline", "Web3", "Blockchain"]
  },
  {
    name: "Hardware & IoT",
    color: "bg-neo-yellow",
    textColor: "text-neo-yellow",
    tags: ["Arduino", "ESP32", "Raspberry Pi", "Hardware", "IoT", "Edge Computing", "Android", "Swift", "Flutter"]
  },
  {
    name: "Design & UX",
    color: "bg-neo-lime",
    textColor: "text-neo-lime",
    tags: ["UI/UX", "Mobile First", "Data Viz", "Motion Design", "Shaders (GLSL)", "Cybersecurity", "DevOps", "Cloud Arch"]
  },
  {
    name: "Lifestyle",
    color: "bg-white",
    textColor: "text-white",
    tags: ["Café Preto", "Energético", "Noite Adentro", "Manhã Cedo", "Música Lofi", "Techno/Phonk", "Podcasts", "Action Figures", "Mechanical Keyboards", "Retro Gaming", "Cyberpunk", "D&D", "Pizzaria 24h", "Code Review"]
  },
  {
    name: "The Grunt Work (Vetos)",
    color: "bg-neo-pink",
    textColor: "text-neo-pink",
    tags: ["Documentação", "Servidores DNS", "CSS Puro", "Formulários", "Deploy Manual", "Reuniões", "PHP", "Legacy Code", "Excel", "Bitbucket", "SVN", "Vandalismo Visual", "Internet Lenta"]
  }
];

const ROLES_LIST = [
  "Frontend Infiltrator", "Backend Architect", "Data Scientist", 
  "Hardware Operator", "Vibe Coder / AI Master", "UI/UX Designer", 
  "DevOps Engineer", "Cyber Security", "Fullstack Generalist"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, signIn, sendMagicLink, magicLinkSent, magicLinkEmail, completingMagicLink, resetMagicLinkState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  // Skills State
  const [skills, setSkills] = useState({
    frontend: 7,
    backend: 4,
    ux_ui: 8,
    dados: 2,
    hardware_android: 5,
    vibe_coding: 9,
  });

  // Form State
  const [form, setForm] = useState({
    name: user?.displayName || "",
    github: "",
    linkedin: "",
    bio: "",
    loves: [] as string[],
    comfort: [] as string[],
    veto: [] as string[],
    primaryRole: "" as string,
    secondaryRoles: [] as string[],
    status: "looking" as "looking" | "open" | "complete",
    createdAt: null as any,
  });

  React.useEffect(() => {
    const fetchMemberData = async () => {
      // Aguarda o usuário estar completamente autenticado antes de acessar o Firestore
      // Isso evita o erro "Missing or insufficient permissions" por race condition
      if (!user) {
        setInitializing(false);
        return;
      }

      // Aguarda o token de ID ser resolvido para garantir que o Firestore receba as credenciais
      try {
        await user.getIdToken();
      } catch {
        setInitializing(false);
        return;
      }
      
      try {
        // Tentar obter da coleção nova 'profiles'
        const profileRef = doc(db, "profiles", user.uid);
        let docSnap = await getDoc(profileRef);
        let fromMembersFallback = false;

        // Se não existir, tentar fallback na coleção antiga 'members' para auto-migração
        if (!docSnap.exists()) {
          const memberRef = doc(db, "members", user.uid);
          docSnap = await getDoc(memberRef);
          if (docSnap.exists()) {
            fromMembersFallback = true;
          }
        }
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.name || user.displayName || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
            bio: data.bio || "",
            loves: data.loves || data.canvas?.loves || [],
            comfort: data.comfort || data.canvas?.comfort || [],
            veto: data.veto || data.canvas?.veto || [],
            primaryRole: data.primaryRole || "",
            secondaryRoles: data.secondaryRoles || [],
            status: data.status || "looking",
            createdAt: fromMembersFallback ? null : (data.createdAt || null),
          });
          if (data.skills) {
            setSkills(data.skills);
          }
        } else {
          // If no doc exists, still try to populate name from user auth
          setForm(prev => ({ 
            ...prev, 
            name: prev.name || user.displayName || "" 
          }));
        }
      } catch (error) {
        firestoreLog.error("Erro ao buscar dados do membro:", error);
      } finally {
        setInitializing(false);
      }
    };

    fetchMemberData();
  }, [user]);

  const radarData = useMemo(() => [
    { subject: 'Frontend', A: skills.frontend, fullMark: 10 },
    { subject: 'Backend', A: skills.backend, fullMark: 10 },
    { subject: 'UX/UI', A: skills.ux_ui, fullMark: 10 },
    { subject: 'Dados', A: skills.dados, fullMark: 10 },
    { subject: 'Hardware', A: skills.hardware_android, fullMark: 10 },
    { subject: 'Vibe AI', A: skills.vibe_coding, fullMark: 10 },
  ], [skills]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-neo-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Terminal className="w-12 h-12 text-neo-cyan mx-auto animate-pulse" />
          <p className="font-heading text-xl uppercase animate-pulse">Sincronizando Dados...</p>
        </div>
      </div>
    );
  }

  const toggleRole = (role: string) => {
    setForm(prev => {
      if (prev.primaryRole === role) return { ...prev, primaryRole: "" };
      if (prev.secondaryRoles.includes(role)) {
        return { ...prev, secondaryRoles: prev.secondaryRoles.filter(r => r !== role) };
      }
      if (!prev.primaryRole) return { ...prev, primaryRole: role };
      if (prev.secondaryRoles.length < 2) {
        return { ...prev, secondaryRoles: [...prev.secondaryRoles, role] };
      }
      return prev;
    });
  };

  const setTagSentiment = (tag: string, sentiment: "loves" | "comfort" | "veto" | null) => {
    setForm(prev => {
      // Remove tag from all arrays first
      const newLoves = prev.loves.filter(t => t !== tag);
      const newComfort = prev.comfort.filter(t => t !== tag);
      const newVeto = prev.veto.filter(t => t !== tag);

      // Add to selected sentiment if not clearing
      if (sentiment === "loves") newLoves.push(tag);
      else if (sentiment === "comfort") newComfort.push(tag);
      else if (sentiment === "veto") newVeto.push(tag);

      return { ...prev, loves: newLoves, comfort: newComfort, veto: newVeto };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillChange = (key: string, value: number) => {
    setSkills(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signIn();
      return;
    }

    setLoading(true);
    try {
      // Normalize social links by stripping URLs if provided
      // Handles: https://github.com/user, github.com/user, @user, user/
      const cleanGithub = (form.github || "")
        .trim()
        .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "")
        .replace(/\/$/, "")
        .replace(/^@/, "");
      
      // Handles: https://br.linkedin.com/in/user, linkedin.com/in/user, user/, www.linkedin...
      const cleanLinkedin = (form.linkedin || "")
        .trim()
        .replace(/^(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/(?:in|profile)\//i, "")
        .replace(/\/$/, "")
        .replace(/^@/, "");

      const profileData: any = {
        userId: user.uid,
        name: form.name.trim(),
        photoURL: user.photoURL || null,
        github: cleanGithub,
        linkedin: cleanLinkedin,
        bio: form.bio.trim(),
        primaryRole: form.primaryRole,
        secondaryRoles: form.secondaryRoles,
        skills,
        canvas: {
          loves: form.loves,
          comfort: form.comfort,
          veto: form.veto,
        },
        status: form.status,
        eventId: "tech_floripa_2026",
        updatedAt: serverTimestamp(),
      };

      if (!form.createdAt) {
        profileData.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, "profiles", user.uid), profileData, { merge: true });
      navigate("/discover");
    } catch (err) {
      firestoreLog.error("Erro ao registrar perfil:", err);
      alert("Erro ao registrar perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    // Estado: Completando login via Magic Link (usuário acabou de clicar no link do email)
    if (completingMagicLink) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neo-bg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]"></div>
          <Card variant="white" padding="none" className="max-w-md w-full border-8 border-neo-black overflow-hidden shadow-[20px_20px_0_0_#000] relative z-10">
            <div className="bg-neo-black p-8 text-center space-y-6">
              <div className="bg-neo-lime text-neo-black p-6 inline-block rounded-full neo-border border-4 animate-pulse">
                <Terminal className="w-16 h-16" />
              </div>
              <h1 className="text-3xl font-heading text-white uppercase tracking-tighter leading-none">VALIDANDO LINK_</h1>
            </div>
            <div className="p-10 text-center space-y-6 bg-white">
              <div className="flex justify-center gap-4">
                <div className="w-3 h-3 bg-neo-lime animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-neo-pink animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-neo-cyan animate-bounce"></div>
              </div>
              <p className="font-black uppercase text-sm text-neo-black/70">
                Completando seu login via Magic Link...
              </p>
              <div className="font-mono text-[9px] opacity-40 uppercase tracking-widest">
                Decifrando credenciais criptografadas...
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Estado: Magic Link enviado com sucesso — aguardando usuário abrir email
    if (magicLinkSent) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neo-bg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]"></div>
          <motion.div
            animate={{ x: [20, -20, 20], y: [20, -20, 20] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neo-lime/20 rounded-full blur-3xl"
          />
          <Card variant="white" padding="none" className="max-w-md w-full border-8 border-neo-black overflow-hidden shadow-[20px_20px_0_0_#000] relative z-10">
            <div className="bg-neo-lime p-8 text-center space-y-4 border-b-[4px] border-neo-black">
              <div className="bg-white text-neo-black p-5 inline-block rounded-full neo-border border-4">
                <span className="text-5xl">📧</span>
              </div>
              <h1 className="text-3xl font-heading text-neo-black uppercase tracking-tighter leading-none">LINK ENVIADO_</h1>
            </div>
            <div className="p-8 text-center space-y-6 bg-white">
              <p className="font-bold text-base">
                Mandamos um link mágico para:
              </p>
              <div className="bg-neo-bg neo-border p-4 font-mono text-sm font-bold break-all">
                {magicLinkEmail}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neo-black/70 font-bold">
                  Abra seu email e clique no link para entrar.
                </p>
                <p className="text-xs text-neo-black/50 font-bold">
                  Não achou? Verifique a pasta de spam.
                </p>
              </div>

              <div className="border-t-[3px] border-neo-black pt-6 space-y-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={async () => {
                    if (magicLinkEmail) {
                      setMagicLinkLoading(true);
                      try {
                        await sendMagicLink(magicLinkEmail);
                      } catch {
                        // erro já logado
                      } finally {
                        setMagicLinkLoading(false);
                      }
                    }
                  }}
                  disabled={magicLinkLoading}
                >
                  {magicLinkLoading ? 'REENVIANDO...' : 'REENVIAR LINK'}
                </Button>
                <button
                  onClick={resetMagicLinkState}
                  className="text-neo-pink font-heading font-bold text-sm uppercase underline underline-offset-4 hover:text-neo-black transition-colors"
                >
                  ← VOLTAR E USAR OUTRO MÉTODO
                </button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Estado: Tela de login principal — duas opções (Google + Magic Link)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-neo-bg relative overflow-hidden">
        {/* Decorative Background for Login */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]"></div>
        <motion.div
          animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-neo-pink/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [20, -20, 20], y: [20, -20, 20] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neo-lime/20 rounded-full blur-3xl"
        />

        <Card variant="white" padding="none" className="max-w-md w-full border-8 border-neo-black overflow-hidden shadow-[20px_20px_0_0_#000] relative z-10">
          {/* Header */}
          <div className="bg-neo-black p-8 text-center space-y-6">
            <div className="bg-neo-lime text-neo-black p-6 inline-block rounded-full neo-border border-4">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <h1 className="text-4xl font-heading text-white uppercase tracking-tighter leading-none">ACESSO_RESTRITO</h1>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <p className="font-black uppercase text-sm leading-relaxed text-neo-black/70 text-center">
              O Protocolo de Segurança Tech Floripa exige autenticação de nível 1 antes do mapeamento de arsenal. Conecte sua identidade para prosseguir.
            </p>

            {/* OPÇÃO 1: Google */}
            <Button
              onClick={signIn}
              variant="primary"
              size="xl"
              className="w-full text-lg relative overflow-hidden"
              disabled={loading}
            >
              {loading ? 'VALIDANDO...' : 'AUTENTICAR VIA GOOGLE'}
            </Button>

            {/* Separador */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[3px] bg-neo-black"></div>
              <span className="font-heading font-black text-sm uppercase text-neo-black/50">OU</span>
              <div className="flex-1 h-[3px] bg-neo-black"></div>
            </div>

            {/* OPÇÃO 2: Magic Link */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const email = magicEmail.trim();
                if (!email) {
                  setMagicLinkError('Digite seu email.');
                  return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  setMagicLinkError('Email inválido.');
                  return;
                }
                setMagicLinkError(null);
                setMagicLinkLoading(true);
                try {
                  await sendMagicLink(email);
                } catch (err: any) {
                  setMagicLinkError(err?.message || 'Erro ao enviar link. Tente novamente.');
                } finally {
                  setMagicLinkLoading(false);
                }
              }}
              className="space-y-3"
            >
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-neo-black/60 block">
                Login via Link Mágico
              </label>
              <input
                type="email"
                value={magicEmail}
                onChange={(e) => { setMagicEmail(e.target.value); setMagicLinkError(null); }}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-neo-bg font-mono font-bold text-sm border-[3px] border-neo-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#B8FF29] focus:outline-none transition-shadow placeholder:text-neo-black/30"
              />
              {magicLinkError && (
                <p className="text-neo-pink font-bold text-xs uppercase">{magicLinkError}</p>
              )}
              <Button
                type="submit"
                variant="accent-cyan"
                size="lg"
                className="w-full"
                disabled={magicLinkLoading}
              >
                {magicLinkLoading ? 'ENVIANDO...' : 'ENVIAR LINK MÁGICO ✉️'}
              </Button>
            </form>

            {/* Footer decorativo */}
            <div className="flex justify-center gap-4 opacity-50 pt-2">
              <div className="w-2 h-2 bg-neo-black animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-neo-black animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-neo-black animate-bounce"></div>
            </div>

            <div className="font-mono text-[9px] opacity-40 uppercase tracking-widest text-center">
              Escolha seu protocolo de autenticação...
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-neo-bg relative overflow-hidden"
    >
      {/* Background Decorations - Brand Style */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
        className="absolute -top-60 -right-40 w-120 h-120 bg-neo-lime border-[4px] border-neo-black opacity-10 hidden lg:block" 
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
        className="absolute -bottom-60 -left-40 w-140 h-140 bg-neo-cyan rounded-full border-[4px] border-neo-black opacity-10 hidden lg:block" 
      />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:32px_32px]"></div>
      
      <div className="max-w-7xl mx-auto py-12 px-6 relative z-10">
        <div className="mb-12 border-b-8 border-neo-black pb-8 flex flex-col md:flex-row justify-between items-end gap-6 bg-white/40 p-8 neo-border backdrop-blur-md shadow-[12px_12px_0_0_#000]">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-9xl font-heading mb-2 tracking-tighter text-neo-black drop-shadow-sm">MAPEAR MEMBRO_</h1>
            <div className="flex flex-wrap gap-2">
              <p className="text-xl font-bold uppercase bg-neo-black text-white px-3 py-1 inline-block">Protocolo Floripa 2026</p>
              <p className="text-xl font-bold uppercase bg-neo-lime text-neo-black px-3 py-1 neo-border inline-block">Nível 01: Identificação</p>
            </div>
          </div>
          {!user && <p className="text-neo-pink font-extrabold animate-pulse text-2xl tracking-tighter bg-white px-4 py-1 neo-border">[ REQUER_AUTENTICAÇÃO ]</p>}
        </div>

        <form onSubmit={handleSubmit} className="gap-8 grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left: Input Areas */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Identity Card - Using Cyan/Yellow Mixed Style */}
              <Card variant="white" padding="none" className="border-4 shadow-[12px_12px_0_0_#000] overflow-hidden">
                <div className="bg-neo-cyan p-4 border-b-4 border-neo-black">
                  <h2 className="text-2xl font-heading text-neo-black flex items-center gap-2">
                    <User className="w-6 h-6" /> 01. IDENTIDADE
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="bg-neo-yellow/20 p-4 neo-border border-2 flex gap-4 items-center">
                    <div className="bg-neo-black p-2 rounded-full ring-2 ring-neo-yellow">
                      <ShieldCheck className="w-6 h-6 text-neo-yellow" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase leading-tight italic">PONTE DE CONFIANÇA:</p>
                      <p className="text-[10px] font-bold uppercase opacity-70">
                        O algoritmo da guilda cruza dados do GitHub e LinkedIn para validar xp e sugerir missões de alto impacto. Sem pontes, você é um fantasma.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold mb-1 text-xs text-gray-500 uppercase tracking-widest">Codinome / Nome de Guerra</label>
                      <input 
                        required 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        type="text" 
                        className="w-full neo-border p-4 bg-neo-bg font-black focus:bg-white transition-all focus:ring-8 focus:ring-neo-cyan/20 outline-none text-lg" 
                        placeholder="EX: CYBER_KUN" 
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-xs text-gray-500 uppercase tracking-widest">Bio / Pitch Pessoal (Max 280 caracteres)</label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value.slice(0, 280) }))}
                        className="w-full neo-border p-4 bg-neo-bg font-bold focus:bg-white transition-all focus:ring-8 focus:ring-neo-cyan/20 outline-none text-sm resize-none h-24"
                        placeholder="Ex: Desenvolvedor Android embarcado focado em CD e coletores industriais..."
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-xs text-gray-500 uppercase tracking-widest">Status de Matchmaking</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full neo-border p-4 bg-neo-bg font-black focus:bg-white transition-all focus:ring-8 focus:ring-neo-cyan/20 outline-none text-sm"
                      >
                        <option value="looking">BUSCANDO EQUIPE</option>
                        <option value="open">ABERTO A PROPOSTAS</option>
                        <option value="complete">EQUIPE FORMADA</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-xs text-gray-500 uppercase flex items-center gap-1">
                          <Github className="w-4 h-4" /> GitHub / Terminal
                        </label>
                        <input 
                          name="github" 
                          value={form.github} 
                          onChange={handleChange} 
                          type="text" 
                          className="w-full neo-border p-3 bg-neo-bg font-bold focus:bg-white transition-all focus:ring-4 focus:ring-neo-black/10 outline-none" 
                          placeholder="@username" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-xs text-gray-500 uppercase flex items-center gap-1">
                          <Linkedin className="w-4 h-4 text-[#0077b5]" /> LinkedIn / Rede
                        </label>
                        <input 
                          name="linkedin" 
                          value={form.linkedin} 
                          onChange={handleChange} 
                          type="text" 
                          className="w-full neo-border p-3 bg-neo-bg font-bold focus:bg-white transition-all focus:ring-4 focus:ring-blue-500/10 outline-none" 
                          placeholder="in/perfil" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

            {/* Class Selection Card - Using Lime Style */}
            <Card variant="white" padding="none" className="border-4 shadow-[12px_12px_0_0_#B8FF29] overflow-hidden">
              <div className="bg-neo-lime p-4 border-b-4 border-neo-black">
                <h2 className="text-2xl font-heading text-neo-black flex items-center gap-2">
                  <Terminal className="w-6 h-6" /> 02. CLASSES (1st / 2nd)
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {ROLES_LIST.map(role => {
                    const isPrimary = form.primaryRole === role;
                    const isSecondary = form.secondaryRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`neo-border px-4 py-2 font-black text-[10px] uppercase transition-all flex items-center gap-2 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 ${
                          isPrimary ? 'bg-neo-black text-neo-lime shadow-[6px_6px_0_0_#B8FF29]' : 
                          isSecondary ? 'bg-neo-cyan text-neo-black shadow-[6px_6px_0_0_#000]' : 
                          'bg-white text-neo-black hover:bg-neo-lime/30'
                        }`}
                      >
                        {role}
                        {isPrimary && <span className="text-[10px] bg-neo-lime text-black px-2 py-0.5 rounded-sm">PRIMARY</span>}
                        {isSecondary && <span className="text-[10px] bg-neo-black text-white px-2 py-0.5 rounded-sm">SEC</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Arsenal Master Pool */}
          <div className="space-y-10">
            {/* Calibration Section - Redesigned to be more colorful and clear */}
            <div className="bg-white neo-border border-4 shadow-[12px_12px_0_0_#000] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neo-cyan/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-neo-cyan neo-border border-2">
                      <ShieldCheck className="w-6 h-6 text-neo-black" />
                    </div>
                    <h3 className="text-neo-black font-heading text-2xl uppercase tracking-tighter">
                      CALIBRAGEM DO ARSENAL
                    </h3>
                  </div>
                  <p className="text-[11px] text-neo-black/60 font-black uppercase tracking-widest pl-12">
                    Precisamos conhecer seu perfil para gerar sua ID única.
                  </p>
                </div>
                
                <div className="bg-neo-black text-white px-4 py-2 neo-border border-2 self-end md:self-auto">
                   <span className={`text-2xl font-heading leading-none ${ (form.loves.length + form.veto.length) >= 10 ? 'text-neo-lime' : 'text-neo-pink'}`}>
                    {Math.min(form.loves.length + form.veto.length, 10)} / 10
                  </span>
                </div>
              </div>

              <div className="relative h-8 bg-neo-bg neo-border border-4 overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((form.loves.length + form.veto.length) / 10) * 100, 100)}%` }}
                  className={`h-full transition-colors ${ (form.loves.length + form.veto.length) >= 10 ? 'bg-neo-lime' : 'bg-neo-pink'}`}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-neo-cyan/10 p-4 neo-border border-2">
                  <Info className="w-6 h-6 text-neo-cyan shrink-0" />
                  <p className="text-[10px] text-neo-black font-bold uppercase leading-tight">
                    <span className="text-neo-cyan block mb-1">POR QUE ISSO?</span>
                    Para que nossa IA crie um mapeamento justo e te conecte às melhores missões, precisamos de pelo menos 10 opiniões (Amo ou Veto) sobre as tecnologias abaixo.
                  </p>
                </div>
                <div className={`flex items-center gap-3 p-4 neo-border border-2 transition-all ${ (form.loves.length + form.veto.length) >= 10 ? 'bg-neo-lime/10 border-neo-lime' : 'bg-neo-pink/10 border-neo-pink animate-pulse'}`}>
                  <div className={`w-3 h-3 rounded-full ${ (form.loves.length + form.veto.length) >= 10 ? 'bg-neo-lime' : 'bg-neo-pink'}`}></div>
                  <p className="text-[10px] text-neo-black font-bold uppercase leading-tight">
                    <span className="block mb-1">STATUS DO SISTEMA:</span>
                    {(form.loves.length + form.veto.length) < 10 
                      ? `AGUARDANDO DADOS: MARQUE MAIS ${10 - (form.loves.length + form.veto.length)} TAGS.` 
                      : "SISTEMA CALIBRADO! VOCÊ JÁ PODE ENTRAR, MAS QUANTO MAIS TAGS MARCAR, MELHOR SERÁ SEU MATCH COM A GUILDA."}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-12 border-neo-black pl-6 py-2">
              <h2 className="text-5xl font-heading uppercase text-neo-black tracking-tighter">ARSENAL_DE_SKILLS</h2>
              <p className="font-black text-sm uppercase opacity-50 tracking-widest mt-1">Defina seu arsenal: [ ❤️ MEU_FOCO | ✅ OPERO_BEM | 🚫 NEM_FUDENDO ]</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {TAG_CATEGORIES.map(category => (
                <Card key={category.name} variant="white" padding="none" className="border-4 shadow-[10px_10px_0_0_#000] overflow-hidden flex flex-col group hover:shadow-[14px_14px_0_0_#000] transition-all">
                  <div className="bg-neo-black p-3 flex justify-between items-center group-hover:bg-neo-black/90 transition-colors">
                    <h3 className={`font-heading text-xl ${category.textColor} uppercase italic tracking-tighter`}>
                      {category.name}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${category.color} animate-pulse`}></div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 bg-neo-bg/30">
                    {category.tags.map(tag => {
                      const isLoves = form.loves.includes(tag);
                      const isComfort = form.comfort.includes(tag);
                      const isVeto = form.veto.includes(tag);

                      return (
                        <div key={tag} className="flex items-center neo-border bg-white overflow-hidden h-12 group/row hover:border-neo-black transition-all hover:bg-white/80">
                          <span className="flex-1 px-4 font-black text-xs uppercase truncate text-neo-black/80">{tag}</span>
                          <div className="flex h-full border-l-4 border-neo-black bg-neo-bg">
                            <button 
                              type="button" 
                              title="Amo"
                              onClick={() => setTagSentiment(tag, isLoves ? null : "loves")} 
                              className={`w-12 h-full flex items-center justify-center border-r-2 border-black transition-all group/btn ${isLoves ? 'bg-neo-pink text-white pointer-events-auto' : 'bg-white hover:bg-neo-pink/20'}`}
                            >
                              <motion.div 
                                whileHover={{ scale: 1.4, rotate: [0, 15, -15, 0] }}
                                animate={isLoves ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                                transition={{ repeat: isLoves ? 1 : 0 }}
                              >
                                <Heart className={`w-5 h-5 ${isLoves ? 'fill-current' : 'text-neo-black/20 group-hover/btn:text-neo-pink'}`} />
                              </motion.div>
                            </button>
                            <button 
                              type="button" 
                              title="Conforto"
                              onClick={() => setTagSentiment(tag, isComfort ? null : "comfort")} 
                              className={`w-12 h-full flex items-center justify-center border-r-2 border-black transition-all group/btn ${isComfort ? 'bg-neo-lime text-black' : 'bg-white hover:bg-neo-lime/20'}`}
                            >
                              <motion.div 
                                whileHover={{ scale: 1.4, rotate: 360 }}
                                animate={isComfort ? { rotate: [0, 360], scale: [1, 1.4, 1] } : {}}
                              >
                                <Check className={`w-5 h-5 ${isComfort ? 'text-black' : 'text-neo-black/20 group-hover/btn:text-neo-lime'}`} />
                              </motion.div>
                            </button>
                            <button 
                              type="button" 
                              title="Veto"
                              onClick={() => setTagSentiment(tag, isVeto ? null : "veto")} 
                              className={`w-12 h-full flex items-center justify-center transition-all group/btn ${isVeto ? 'bg-neo-black text-neo-pink shadow-inner' : 'bg-white hover:bg-neo-pink/10'}`}
                            >
                              <motion.div 
                                whileHover={{ x: [-2, 2, -2, 2, 0], scale: 1.1 }}
                                animate={isVeto ? { x: [-1, 1, -1, 1, 0] } : {}}
                              >
                                <Ban className={`w-5 h-5 ${isVeto ? 'text-neo-pink' : 'text-neo-black/20 group-hover/btn:text-neo-pink'}`} />
                              </motion.div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Level Sliders */}
          <Card variant="white" padding="none" className="border-4 shadow-[16px_16px_0_0_#FFC900] overflow-hidden">
            <div className="bg-neo-yellow p-6 border-b-4 border-neo-black flex justify-between items-center">
              <h2 className="text-3xl font-heading text-neo-black uppercase tracking-tighter">03. NÍVEL_DE_SINC</h2>
              <div className="bg-neo-black text-neo-yellow text-[10px] font-black px-2 py-1 neo-border">STATUS: CALIBRANDO</div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 bg-white/30 backdrop-blur-sm">
              {[
                { label: "Frontend / Visual", key: "frontend" },
                { label: "Backend / Infra", key: "backend" },
                { label: "UX / Psicologia", key: "ux_ui" },
                { label: "Dados / Lógica", key: "dados" },
                { label: "Hardware / IoT", key: "hardware_android" },
                { label: "IA / Vibe Coding", key: "vibe_coding" },
              ].map((skill) => (
                <div key={skill.key} className="space-y-4">
                  <div className="flex justify-between font-black uppercase text-[10px] tracking-widest">
                    <span className="bg-neo-black text-white px-2 py-0.5">{skill.label}</span>
                    <span className="text-neo-black text-lg">{skills[skill.key as keyof typeof skills]} / 10</span>
                  </div>
                  <div className="relative pt-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={skills[skill.key as keyof typeof skills]}
                      onChange={(e) => handleSkillChange(skill.key, parseInt(e.target.value))}
                      className="w-full appearance-none h-6 bg-neo-black neo-border cursor-pointer slider-thumb-neo outline-none" 
                    />
                    <div className="flex justify-between mt-2 px-1 text-[8px] font-black opacity-30">
                      <span>MIN</span>
                      <span>MAX_CAPACITY</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Right: PASAPORTE / PREVIEW */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-max space-y-6">
          <Card variant="white" padding="none" className="border-8 border-neo-black overflow-hidden shadow-[16px_16px_0_0_#000] group">
            <div className="bg-neo-black text-neo-lime p-5 flex justify-between items-center border-b-4 border-neo-black">
              <div className="flex flex-col">
                <span className="font-heading text-lg leading-none">PASAPORTE_GUILDA</span>
                <span className="text-[8px] font-mono opacity-50 uppercase tracking-[0.2em]">Tech_Floripa_2026</span>
              </div>
              <ShieldCheck className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            </div>
            
            <div className="p-8 space-y-8 h-full bg-white relative">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neo-black/10"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neo-black/10"></div>

              <div className="flex gap-6">
                <div className="w-28 h-28 flex items-center justify-center overflow-hidden rotate-2">
                  <Avatar user={{ photoURL: user.photoURL, github: form.github, name: form.name }} size="lg" className="shadow-none border-4 w-full h-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">NOME_OPERADOR:</p>
                    <p className="text-2xl font-black uppercase truncate leading-none tracking-tight">{form.name || "Aguardando..."}</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">CLASSE_PRIMÁRIA:</p>
                    <p className="text-[11px] font-black leading-tight bg-neo-lime p-1 neo-border border-2 uppercase inline-block">{form.primaryRole || "AGUARDANDO..."}</p>
                  </div>
                  {form.secondaryRoles.length > 0 && (
                    <div>
                      <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">CLASSES_SEC:</p>
                      <div className="flex flex-wrap gap-1">
                        {form.secondaryRoles.map(r => (
                          <span key={r} className="text-[9px] bg-neo-cyan px-2 py-0.5 neo-border border-2 font-black uppercase">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spider Chart Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase bg-neo-black text-white px-2">Análise de Campo</p>
                  <p className="text-[8px] font-mono opacity-50 uppercase">Vibe: {skills.vibe_coding}/10</p>
                </div>
                <div className="neo-border border-4 bg-neo-bg flex items-center justify-center relative overflow-hidden group/chart cursor-crosshair" style={{ height: '256px', minHeight: '256px' }}>
                   <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>
                   
                   <RadarChart cx="50%" cy="50%" outerRadius="75%" width={256} height={256} data={radarData}>
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t-4 border-neo-black pt-6">
                <div>
                  <p className="text-[9px] font-black opacity-40 uppercase">ID_OPERADOR</p>
                  <p className="text-[10px] font-mono font-bold uppercase truncate">{user?.uid.slice(0, 10).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black opacity-40 uppercase text-right">ORIGEM</p>
                  <p className="text-[10px] font-mono font-bold uppercase text-right truncate">FLN_BRAZIL</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neo-black p-6">
              <Button 
                onClick={handleSubmit} 
                variant={(form.loves.length + form.veto.length) >= 10 ? "accent-lime" : "primary"} 
                size="xl" 
                className={`w-full text-xl py-6 transition-all ${ (form.loves.length + form.veto.length) >= 10 ? 'scale-105 shadow-[0_0_20px_#B8FF29]/30' : 'opacity-50 grayscale cursor-not-allowed'}`} 
                disabled={loading || (form.loves.length + form.veto.length) < 10}
              >
                {loading ? "PROCESSANDO..." : (form.loves.length + form.veto.length) < 10 ? "BLOQUEADO" : "REGISTRAR OPERADOR"}
              </Button>
            </div>
          </Card>
          
          <div className="bg-neo-pink text-white p-5 neo-border border-4 shadow-[8px_8px_0_0_#000] font-mono text-[10px] space-y-2 relative overflow-hidden group">
            <p className="font-black text-white">&gt; MONITORAMENTO_STATUS:</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="opacity-80">LOVES: {form.loves.length}</p>
              <p className="opacity-80">CONFORT: {form.comfort.length}</p>
              <p className="opacity-80">VETOS: {form.veto.length}</p>
              <p className="opacity-80 underline">ROLES: {form.primaryRole ? 1 : 0}/1</p>
            </div>
            {form.loves.length < 3 && <p className="text-white bg-black px-1 animate-pulse">ALERTA: Adicione mais PAIXÕES para calibragem total.</p>}
          </div>
        </div>
      </form>
    </div>
  </motion.div>
  );
}

