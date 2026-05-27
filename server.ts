import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Logger simples para o servidor (não usa o logger do frontend)
const serverLog = {
  info: (msg: string, data?: any) => console.log(`ℹ️ [Server] ${msg}`, data ?? ''),
  error: (msg: string, data?: any) => console.error(`❌ [Server] ${msg}`, data ?? ''),
  warn: (msg: string, data?: any) => console.warn(`⚠️ [Server] ${msg}`, data ?? ''),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/roast", async (req, res) => {
    try {
      const { memberId, memberData, persona } = req.body;
      if (!memberId || !memberData) return res.status(400).json({ error: "Missing memberId or memberData" });
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let systemInstruction = 'Aja como um tech lead sênior sarcástico, brutal e extremamente exigente no meio de um hackathon. Analise as skills e os inputs deste membro. Critique sem dó suas piores habilidades, faça piada onde ele diz que "se garante", e traga realismo se os vetos ("nem fudendo") forem exatamente o que precisamos. NÃO seja polido. Seja irônico e direto. Máximo de 3 parágrafos.';
      
      if (persona === 'mild') {
        systemInstruction = 'Aja como um mentor técnico experiente, paciente e encorajador. Analise as habilidades e inputs (paixões, opero bem e vetos) deste membro de forma construtiva. Destaque seus pontos fortes e dê conselhos gentis sobre como melhorar nas áreas mais fracas e como aproveitar aquilo que operam bem. Seja inspirador e amigável. Máximo de 3 parágrafos.';
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analise este membro. DADOS DO MEMBRO: \n${JSON.stringify(memberData, null, 2)}`,
        config: {
          systemInstruction
        }
      });
      const roastText = response.text;
      // Persist to DB using Admin SDK (Server-side bypasses rules)
      const { db: adminDb } = await import("./src/lib/firebase-admin.ts");
      
      const updateData: any = { updatedAt: new Date() };
      if (persona === 'brutal') {
        updateData.roastBrutal = roastText;
      } else if (persona === 'mild') {
        updateData.roastMild = roastText;
      } else {
        updateData.roast = roastText;
      }
      
      await adminDb.collection("profiles").doc(memberId).update(updateData);

      res.json({ roast: roastText });
    } catch (e: any) {
      serverLog.error('Erro na rota /api/roast:', e.message);
      const errorMessage = e.message?.includes('API key not valid') 
        ? "Chave da API do Gemini inválida ou não configurada. Por favor, adicione uma chave válida no painel de configurações."
        : e.message;
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/oraculo/match", async (req, res) => {
    try {
      const { challengeDesc, members } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({ 
        model: "gemini-2.5-flash",
        contents: `Contexto do Hackathon Tech Floripa:\n${challengeDesc}\n\nMembros da Equipe:\n${JSON.stringify(members, null, 2)}`,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: `Sua Tarefa (A Inteligência do Oráculo):
Gere três opções estratégicas de projetos para o hackathon:
1. Uma Escolha Segura (Viabilidade altíssima, risco baixo, foco no que a equipe domina).
2. Uma Escolha de Inovação (Viabilidade média, risco alto, usa as vontades/paixões da equipe em coisas novas).
3. A Carta na Manga / Surpresa (Baixa viabilidade, altíssimo risco operacional, inovação louca arrastando as pessoas pro limite).

IMPORTANTE: 
Para cada estratégia, indique o nível de "Match" com a equipe em porcentagem e liste precisamente quais membros estarão alocados nela (nunca aloque alguém no que eles deram 'veto').

Responda OBRIGATORIAMENTE em JSON no formato:
{
  "seguro": { "title": "STRING", "match": "NUMBER", "reason": "STRING", "allocation": "STRING", "viability": "STRING", "risk": "STRING", "banca": "STRING" },
  "inovacao": { "title": "STRING", "match": "NUMBER", "reason": "STRING", "allocation": "STRING", "viability": "STRING", "risk": "STRING", "banca": "STRING" },
  "surpresa": { "title": "STRING", "match": "NUMBER", "reason": "STRING", "allocation": "STRING", "viability": "STRING", "risk": "STRING", "banca": "STRING" }
}`
        }
      });
      
      const responseText = response.text;
      
      try {
        const parsed = JSON.parse(responseText);
        if (!parsed.seguro || !parsed.inovacao || !parsed.surpresa) {
          throw new Error("Invalid schema from AI");
        }
        res.json(parsed);
      } catch (parseError) {
        serverLog.error('AI JSON Parse Error:', responseText);
        res.status(500).json({ error: "O Oráculo alucinou um formato inválido. Tente novamente." });
      }
    } catch (e: any) {
      serverLog.error('Erro na rota /api/oraculo/match:', e.message);
      const errorMessage = e.message?.includes('API key not valid') 
        ? "Chave da API do Gemini inválida ou não configurada. Por favor, adicione uma chave válida no painel de configurações."
        : e.message;
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
