import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Users, Zap, Target, ArrowRight } from "lucide-react";

// --- NEO-BRUTALIST PARTICLES (reaproveitado do Bunker) ---
const NeoParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number, y: number, size: number, speedX: number, speedY: number, color: string, rotation: number, rotationSpeed: number, type: 'square' | 'triangle' | 'cross' }> = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const colors = ["#B8FF29", "#FF2E93", "#00E5FF", "#FFE600", "#1A1A1A"];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      particles = [];
      const numParticles = Math.min(window.innerWidth / 30, 40);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 20 + 10,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          type: Math.random() > 0.6 ? 'square' : (Math.random() > 0.5 ? 'triangle' : 'cross')
        });
      }
    };

    const drawSquare = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeRect(-size / 2, -size / 2, size, size);
    };

    const drawTriangle = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    const drawCross = (ctx: CanvasRenderingContext2D, size: number) => {
      const ts = size / 3;
      ctx.beginPath();
      ctx.moveTo(-ts, -size/2); ctx.lineTo(ts, -size/2); ctx.lineTo(ts, -ts);
      ctx.lineTo(size/2, -ts); ctx.lineTo(size/2, ts); ctx.lineTo(ts, ts);
      ctx.lineTo(ts, size/2); ctx.lineTo(-ts, size/2); ctx.lineTo(-ts, ts);
      ctx.lineTo(-size/2, ts); ctx.lineTo(-size/2, -ts); ctx.lineTo(-ts, -ts);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.x < -p.size) p.x = width + p.size;
        if (p.x > width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = height + p.size;
        if (p.y > height + p.size) p.y = -p.size;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        if (p.type === 'square') drawSquare(ctx, p.size);
        else if (p.type === 'triangle') drawTriangle(ctx, p.size);
        else drawCross(ctx, p.size);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply"
    />
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      icon: Target,
      title: "MAPEIE_",
      desc: "Registre suas skills, paixões e vetos. Sem currículo genérico — só verdade.",
      color: "lime" as const,
      accent: "bg-neo-pink"
    },
    {
      icon: Users,
      title: "DESCUBRA_",
      desc: "Explore perfis complementares ao seu. Filtre por role, stack ou afinidade.",
      color: "yellow" as const,
      accent: "bg-neo-cyan"
    },
    {
      icon: Zap,
      title: "CONECTE_",
      desc: "Forme sua equipe ideal antes do kickoff. Sem surpresas no dia D.",
      color: "pink" as const,
      accent: "bg-neo-lime"
    }
  ];

  return (
    <div className="relative min-h-screen">
      <NeoParticles />

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-block mb-8">
            <span className="font-mono text-xs font-black uppercase bg-neo-black text-neo-lime px-4 py-2 border-[3px] border-neo-black shadow-[4px_4px_0_0_#B8FF29]">
              HACKATHON TECH FLORIPA 2026
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black uppercase leading-none tracking-tighter mb-6">
            ENCONTRE SUA
            <br />
            <span className="inline-block bg-neo-lime neo-border px-4 py-2 -rotate-1 shadow-[6px_6px_0_0_#000] mt-2">
              EQUIPE IDEAL_
            </span>
          </h1>

          <p className="text-lg md:text-xl font-bold max-w-2xl mx-auto mb-10 bg-white inline-block px-6 py-4 neo-border">
            Mapeie suas skills reais. Descubra perfis complementares.
            <br className="hidden md:block" />
            Monte seu time <span className="bg-neo-yellow px-1">antes do kickoff</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="accent-lime"
              size="xl"
              onClick={() => navigate("/onboarding")}
            >
              <span className="flex items-center gap-3">
                CRIAR MEU PERFIL
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>

            {user && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/guilda")}
              >
                VER PERFIS
              </Button>
            )}
          </div>

          {!user && (
            <p className="mt-6 font-mono text-sm font-bold">
              Já tem conta?{" "}
              <button 
                onClick={() => navigate("/onboarding")}
                className="text-neo-pink underline underline-offset-4 hover:text-neo-black transition-colors"
              >
                ENTRAR
              </button>
            </p>
          )}
        </motion.div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter">
              COMO FUNCIONA_
            </h2>
            <div className="w-24 h-2 bg-neo-black mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className={`bg-neo-${step.color} neo-border border-4 neo-shadow p-6 md:p-8 relative group hover:neo-shadow-hover hover:-translate-y-2 transition-all duration-200`}>
                    {/* Step Number */}
                    <div className="absolute -top-5 -left-3 bg-neo-black text-white w-12 h-12 flex items-center justify-center font-heading font-black text-2xl border-[3px] border-neo-black shadow-[3px_3px_0_0_#000]">
                      {i + 1}
                    </div>

                    {/* Decorative accent */}
                    <div className={`absolute top-4 right-4 w-5 h-5 ${step.accent} border-2 border-black rotate-12 group-hover:rotate-45 transition-transform`}></div>

                    <div className="mt-4">
                      <Icon className="w-10 h-10 mb-4" strokeWidth={2.5} />
                      <h3 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight mb-3">
                        {step.title}
                      </h3>
                      <p className="font-bold text-sm md:text-base">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-neo-black neo-border border-[6px] p-8 md:p-12 text-center relative overflow-hidden group"
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B8FF29_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <h2 className="text-3xl md:text-5xl font-heading font-black text-neo-lime uppercase tracking-tighter relative z-10 mb-4" style={{ textShadow: '3px 3px 0 #000' }}>
            NÃO CHEGUE SOZINHO_
          </h2>
          <p className="text-white font-bold text-lg md:text-xl mb-8 relative z-10 max-w-xl mx-auto">
            40% dos participantes de hackathons desistem por falta de equipe. Não seja esse.
          </p>
          <div className="relative z-10">
            <Button
              variant="accent-lime"
              size="xl"
              onClick={() => navigate("/onboarding")}
            >
              <span className="flex items-center gap-3">
                CRIAR MEU PERFIL AGORA
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t-[4px] border-neo-black bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-neo-black p-2">
              <Zap className="text-neo-lime w-5 h-5" />
            </div>
            <span className="font-heading font-black text-lg uppercase tracking-tighter">MATCH_TECH</span>
          </div>
          <p className="font-mono text-xs font-bold text-center md:text-right">
            Feito com ☕ por Tony Max & Squad • Hackathon Tech Floripa 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
