# Estratégia e Contexto: Hackathon Tech Floripa 2026

Este documento reúne todo o contexto estratégico, as regras do evento e as "dicas de ouro" discutidas para a participação no **Hackathon Tech Floripa 2026**. O objetivo deste material é servir como base de conhecimento para treinar ou alinhar IAs sobre o meu perfil, os meus objetivos e a lógica por trás da minha estratégia na competição.

---

## 1. O Evento: Hackathon Tech Floripa 2026

*   **Duração:** 28 dias de desenvolvimento (27 de Junho a 25 de Julho de 2026).
*   **Parceiros Fundadores:** Tech Floripa, Incubintech/IFSC e Python Floripa.
*   **Formato:** Remoto na fase de desenvolvimento, com final presencial em Florianópolis (junto ao encerramento do The Developer Conference - TDC).
*   **Objetivo Final:** Entregar um **protótipo funcional (TRL3)** validado em ambiente controlado.
*   **Metodologia:** **Problem-First** (Primeiro o Problema). Os participantes não podem chegar com ideias prontas; devem escolher resolver desafios reais propostos por empresas e órgãos públicos (ex: Receita Federal).
*   **Premiação:** Conexão com o mercado, possibilidade de pré-incubação, hardware, licenças e networking direto com o ecossistema tech.

---

## 2. As "Dicas de Ouro" (O Vazamento de Informações)

Um administrador da comunidade Python Floripa (parceira do evento) revelou informalmente as duas tecnologias centrais que os patrocinadores estão buscando nas soluções:

1.  **Android Embarcado:** Foco em operações industriais, logística e auditoria (coletores de dados, totens, terminais POS).
2.  **Baterias Compactas de Alto Desempenho:** Foco em mobilidade elétrica, drones operacionais e IoT de longa duração.

Essas informações são cruciais, pois direcionam o escopo do que os avaliadores considerarão valioso.

---

## 3. O Meu Perfil e Diferencial Competitivo

*   **Background Profissional:** Atuo na área de logística, especificamente em funções de supervisão e abastecimento em um Centro de Distribuição (ex: Henry Schein).
*   **Visão de Negócio:** Conheço intimamente as "dores" reais de uma operação logística (erros de inventário, gargalos de reabastecimento, falha humana).
*   **Habilidades Técnicas (Full-Stack/Vibe Coding):** Capacidade de integrar hardware (Android) com interfaces modernas e funcionais (Python, Next.js/React, bancos de dados e dashboards).

Ao contrário de desenvolvedores genéricos que tentarão criar aplicativos B2C comuns, minha abordagem é focada em **B2B, automação industrial e eficiência de processos**.

---

## 4. A Estratégia Principal: O "Pulo do Gato"

A estratégia central gira em torno de conectar o **Android Embarcado** com a **dor real da logística**, utilizando a minha própria empresa como laboratório/apoiadora.

**A Solução Proposta:**
Desenvolver um sistema de automação de abastecimento e inventário para Centros de Distribuição.

**O Diferencial Competitivo:**
Em vez de simular hardware ou usar smartphones comuns, o objetivo é conseguir o **apoio institucional da minha empresa** para o empréstimo de **Coletores de Dados Industriais reais** (que rodam Android Embarcado) durante os 28 dias.

**Por que isso é imbatível?**
1.  **Validação Real:** O hardware é o equipamento definitivo usado pela indústria.
2.  **Adequação Perfeita:** Coletores de dados *são* dispositivos Android Embarcado.
3.  **Autoridade:** Apresentar o pitch na final presencial com um equipamento industrial real rodando um software próprio transmuta o projeto de uma "ideia acadêmica" para um "projeto piloto viável para o mercado".

---

## 5. Cenários e Desafios Previstos (Mapeamento do Terreno)

Com base nos patrocinadores (como a Receita Federal) e no foco em Android e Baterias, os desafios revelados no Kickoff muito provavelmente estarão dentro destes cenários:

*   **Logística e Fiscalização (Eixo Android):**
    *   *Smart Scanners:* Coletores industriais usando IA/Visão Computacional para ler códigos e validar cargas em tempo real.
    *   *Sistemas Offline-First:* Coletores de dados para fiscais que trabalham em áreas sem internet (fronteiras/galpões), com sincronização automática de dados.
*   **Mobilidade e Hardware (Eixo Baterias):**
    *   *Telemetria de Frotas/Micromobilidade:* Dashboards recebendo dados (via MQTT) sobre a saúde de baterias de patinetes/scooters.
    *   *Drones de Inspeção:* Gerenciamento da operação autônoma em pátios.

*Minha escolha tática é focar pesadamente no eixo da Logística e Fiscalização com Android Embarcado, usando a minha expertise logística.*

---

## 6. Plano de Ação Imediato (Pré-Hackathon)

Como não podemos fechar a ideia do projeto antes do dia 27 de Junho (regras Problem-First), a preparação atual é de "afiar o machado":

1.  **Templates de Software Engatilhados:** Deixar repositórios base preparados (Next.js para o frontend, Python para automação/backend, scripts de comunicação prontos).
2.  **Negociação do Hardware:** Conversar com o TI/Supervisão da empresa para garantir o empréstimo dos coletores Android sob o argumento de inovação corporativa a custo zero.
3.  **Estudo de Integração:** Revisar como integrar a leitura do scanner (hardware do coletor) com as aplicações web/Python (PWAs, bibliotecas Android).

---

## 7. Estética e UI: Neubrutalism (Neo-Brutalismo)

Para garantir que o projeto não pareça "feito por IA" e transmita uma identidade de software industrial moderno e robusto, a estética escolhida é o **Neubrutalism**.

*   **Identidade Visual:** Bordas pretas grossas (2px a 4px), sombras sólidas e deslocadas (sem blur), e cores de alto contraste (off-white no fundo com detalhes em verde limão ou amarelo mostarda).
*   **Usabilidade Industrial:** Botões grandes com feedback visual de clique (efeito de "afundar" ao remover a sombra). Tipografia forte e legível (ex: Space Grotesk ou Archivo Black).
*   **Justificativa:** Essa estética é perfeita para ambientes de logística (coletores), pois é clara, direta e visualmente impactante para a banca examinadora.

---

## 8. Gestão de Equipe e Matriz de Competências

A estratégia para maximizar a eficiência da equipe nos 28 dias baseia-se no mapeamento prévio de habilidades e afinidades (Team Canvas / Matriz de Competências).

*   **Mapeamento de Quadrantes (Membros):**
    *   *Hard Skills:* Domínio técnico real (React, Python, SQL, Pitch).
    *   *Paixões:* O que o membro deseja muito desenvolver no evento.
    *   *Zona de Conforto:* Tarefas que executa bem, mas não são prioridade.
    *   *Veto Total:* O que o membro **não faria de jeito nenhum** (essencial para evitar desmotivação).
*   **O Algoritmo do Kickoff (27/06):**
    No dia em que os problemas forem liberados, os desafios do GitHub serão cruzados com essa matriz através de uma IA para identificar qual problema oferece o melhor "match" com o DNA da equipe, exigindo menos esforço em áreas vetadas.

---
*Este documento consolida a estratégia completa: do hardware industrial à gestão de talentos. O foco é entregar um protótipo funcional TRL3 com alta percepção de valor e execução técnica impecável.*
