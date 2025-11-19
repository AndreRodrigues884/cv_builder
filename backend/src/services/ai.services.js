// ai.services.js - Versão completa com debug e cache

import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

class AIService {
  constructor() {
    // Verificar se API key existe
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('❌ GOOGLE_AI_API_KEY não está definida no .env');
      console.error('📝 Adicione: GOOGLE_AI_API_KEY=sua-chave-aqui');
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }

    console.log('✅ GOOGLE_AI_API_KEY encontrada:', process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...');

    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    });

    // Cache simples em memória
    this.cache = new Map();
    this.cacheMaxSize = 100;
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Gera hash SHA256 de uma string
   */
  hashString(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Limpa resposta JSON da IA
   */
  cleanJSONResponse(text) {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Remove texto antes/depois do JSON
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    return cleaned.trim();
  }

  /**
   * Parse seguro de JSON
   */
  parseJSONResponse(text) {
    try {
      const cleaned = this.cleanJSONResponse(text);
      console.log('🧹 JSON limpo:', cleaned.substring(0, 200) + '...');
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error.message);
      console.error('📄 Texto recebido:', text.substring(0, 500));
      throw new Error('Resposta da IA não está em formato JSON válido');
    }
  }

  /**
   * Calcula tempo estimado de leitura (em segundos)
   */
  calculateReadTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60);
  }

  // ============================================
  // GEMINI API CALL
  // ============================================

  async callGeminiAPI(prompt, temperature = 0.3, useCache = true, maxRetries = 5, baseDelay = 1000, maxDelay = 10000) {
    console.log('\n🤖 === CHAMADA GEMINI API ===');
    console.log('📝 Prompt length:', prompt.length, 'chars');
    console.log('🌡️  Temperature:', temperature);
    console.log('💾 Cache:', useCache ? 'enabled' : 'disabled');

    // Verificar cache
    if (useCache) {
      const cacheKey = this.hashString(prompt + temperature);
      if (this.cache.has(cacheKey)) {
        console.log('✅ Resposta encontrada em cache');
        return this.cache.get(cacheKey);
      }
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        console.log(`🚀 Tentativa ${attempt} enviando request para Gemini...`);

        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const duration = Date.now() - startTime;
        console.log(`✅ Resposta recebida em ${duration}ms`);
        console.log('📊 Resposta length:', text.length, 'chars');
        console.log('📄 Primeiros 200 chars:', text.substring(0, 200));

        // Salvar em cache
        if (useCache) {
          const cacheKey = this.hashString(prompt + temperature);
          this.cache.set(cacheKey, text);
          if (this.cache.size > this.cacheMaxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
          }
        }

        return text;

      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error.message);

        // Retry apenas para erro 503 / overloaded
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          if (attempt === maxRetries) break;

          // Backoff exponencial com jitter
          const delay = Math.min(baseDelay * 2 ** (attempt - 1) + Math.random() * 500, maxDelay);
          console.log(`🔄 Model overload, aguardando ${Math.round(delay)}ms antes de tentar novamente...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          // Outros erros não fazem retry
          throw error;
        }
      }
    }

    throw new Error(`❌ Falha após ${maxRetries} tentativas devido a overload do modelo`);
  }


  // ============================================
  // PREPARAR CONTEXTO DO CV
  // ============================================

  prepareCVContext(cv) {
    const user = cv.user;
    const profile = user?.profile;

    if (!profile) {
      return 'CV sem perfil definido';
    }

    let context = `
=== INFORMAÇÕES PESSOAIS ===
Nome: ${user.name || 'Não definido'}
Email: ${user.email || 'Não definido'}
Telefone: ${profile.phone || 'Não definido'}
Localização: ${profile.location || 'Não definido'}

=== EXPERIÊNCIAS PROFISSIONAIS ===
`;

    if (profile.experiences?.length > 0) {
      profile.experiences.forEach((exp, index) => {
        context += `
${index + 1}. ${exp.jobTitle} na ${exp.company}
   Período: ${exp.startDate || 'N/A'} - ${exp.endDate || 'Atual'}
   Descrição: ${exp.description || 'Sem descrição'}
`;
      });
    } else {
      context += 'Nenhuma experiência registada\n';
    }

    context += '\n=== FORMAÇÃO ACADÉMICA ===\n';
    if (profile.educations?.length > 0) {
      profile.educations.forEach((edu, index) => {
        context += `
${index + 1}. ${edu.degree || 'Curso'} em ${edu.institution}
   Período: ${edu.startDate || 'N/A'} - ${edu.endDate || 'N/A'}
   ${edu.description ? 'Descrição: ' + edu.description : ''}
`;
      });
    } else {
      context += 'Nenhuma formação registada\n';
    }

    context += '\n=== COMPETÊNCIAS ===\n';
    if (profile.skills?.length > 0) {
      const skillsList = profile.skills
        .map(s => `${s.name} (${s.level || 'N/A'})`)
        .join(', ');
      context += skillsList;
    } else {
      context += 'Nenhuma competência registada';
    }

    return context;
  }

  // ============================================
  // ANALYZE CV
  // ============================================

  async analyzeCV(cv) {
    console.log('\n📋 === ANALYZE CV ===');
    console.log('CV ID:', cv.id);

    try {
      const cvContext = this.prepareCVContext(cv);
      console.log('📝 Contexto preparado:', cvContext.length, 'chars');

      const prompt = `És um especialista em análise de CVs e recrutamento. Analisa este CV e fornece pontuações detalhadas.

CV:
${cvContext}

TAREFA:
Fornece pontuações (0-100) para:
1. Overall (geral)
2. ATS (compatibilidade com sistemas de recrutamento)
3. Language (clareza e profissionalismo)
4. Impact (resultados e conquistas)
5. Clarity (estrutura e organização)

Identifica também:
- 3-5 palavras-chave em falta
- 2-3 pontos fortes
- 2-3 pontos a melhorar
- 3-5 recomendações práticas com prioridade

Responde APENAS com JSON válido (sem markdown, sem texto adicional):
{
  "scores": {
    "overall": 85,
    "ats": 80,
    "language": 90,
    "impact": 75,
    "clarity": 88
  },
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "improvements": ["melhoria 1", "melhoria 2"],
  "recommendations": [
    {
      "type": "improvement",
      "section": "experience",
      "message": "mensagem detalhada",
      "priority": "high"
    }
  ]
}`;

      console.log('🚀 Chamando Gemini API...');
      const response = await this.callGeminiAPI(prompt, 0.3);

      console.log('🔍 Fazendo parse da resposta...');
      const analysis = this.parseJSONResponse(response);

      console.log('✅ Análise completa:', {
        overallScore: analysis.scores?.overall,
        recommendations: analysis.recommendations?.length,
        keywords: analysis.missingKeywords?.length
      });

      return {
        ...analysis,
        estimatedReadTime: this.calculateReadTime(cvContext),
      };

    } catch (error) {
      console.error('❌ Erro ao analisar CV:', error.message);
      console.error('📍 Stack:', error.stack);
      console.log('⚠️  Retornando análise fallback...');

      return this.getFallbackAnalysis();
    }
  }

  // ============================================
  // FALLBACK ANALYSIS
  // ============================================

  getFallbackAnalysis() {
    console.log('🔄 Usando análise fallback (sem IA)');

    return {
      scores: {
        overall: 70,
        ats: 75,
        language: 68,
        impact: 72,
        clarity: 70,
      },
      missingKeywords: ['liderança', 'gestão de projetos', 'metodologias ágeis'],
      strengths: [
        'Experiência técnica sólida',
        'Formação académica relevante'
      ],
      improvements: [
        'Adicionar mais resultados quantificáveis',
        'Melhorar descrição de soft skills'
      ],
      recommendations: [
        {
          type: 'improvement',
          section: 'experience',
          message: 'Adiciona números e métricas nas tuas conquistas',
          priority: 'high',
        },
        {
          type: 'improvement',
          section: 'skills',
          message: 'Organiza competências por categorias',
          priority: 'medium',
        },
      ],
      estimatedReadTime: 45,
    };
  }

  // ============================================
  // OUTROS MÉTODOS (adicione os que faltam)
  // ============================================

  async generateSummary(profile, jobTitle, targetArea, tone = 'professional') {
    console.log('\n📝 === GENERATE SUMMARY ===');

    try {
      const context = `
Nome: ${profile.user?.name || 'N/A'}
Cargo Alvo: ${jobTitle}
Área: ${targetArea}
Tom: ${tone}

Experiências:
${profile.experiences?.map(e => `- ${e.jobTitle} na ${e.company}`).join('\n') || 'Nenhuma'}

Formação:
${profile.educations?.map(e => `- ${e.degree} em ${e.institution}`).join('\n') || 'Nenhuma'}

Skills:
${profile.skills?.map(s => s.name).join(', ') || 'Nenhuma'}
`;

      const prompt = `Cria um resumo profissional para CV baseado neste perfil:

${context}

O resumo deve:
- Ter 3-4 frases
- Destacar experiência e competências principais
- Ser impactante e objetivo
- Usar tom ${tone}

Responde APENAS com JSON:
{
  "summary": "texto do resumo aqui"
}`;

      const response = await this.callGeminiAPI(prompt, 0.7);
      const result = this.parseJSONResponse(response);

      return {
        summary: result.summary,
        variations: [],
        tips: []
      };

    } catch (error) {
      console.error('❌ Erro ao gerar resumo:', error.message);

      return {
        summary: `Profissional com experiência em ${targetArea}, focado em resultados e crescimento contínuo.`,
        variations: [],
        tips: []
      };
    }
  }

  async improveText(text, section, context) {
    console.log('\n✍️  === IMPROVE TEXT ===');

    try {
      const prompt = `Melhora este texto de CV:

Secção: ${section || 'geral'}
Contexto: ${context || 'N/A'}

Texto original:
"${text}"

Reescreve de forma mais profissional, usando:
- Verbos de ação
- Resultados quantificáveis quando possível
- Linguagem clara e impactante

Responde APENAS com JSON:
{
  "improved": "texto melhorado aqui"
}`;

      const response = await this.callGeminiAPI(prompt, 0.5);
      const result = this.parseJSONResponse(response);

      return {
        improved: result.improved,
        suggestions: []
      };

    } catch (error) {
      console.error('❌ Erro ao melhorar texto:', error.message);

      return {
        improved: text,
        suggestions: []
      };
    }
  }

  async suggestSkills(profile, jobTitle, jobArea) {
    console.log('\n💡 === SUGGEST SKILLS ===');

    try {
      const currentSkills = profile.skills?.map(s => s.name).join(', ') || 'Nenhuma';

      const prompt = `Sugere competências técnicas relevantes para:

Cargo: ${jobTitle}
Área: ${jobArea || 'Tecnologia'}
Skills atuais: ${currentSkills}

Sugere 5-8 skills que complementem o perfil e sejam valorizadas na área.

Responde APENAS com JSON:
{
  "suggestions": ["skill1", "skill2", "skill3"]
}`;

      const response = await this.callGeminiAPI(prompt, 0.6);
      const result = this.parseJSONResponse(response);

      return {
        suggestions: result.suggestions
      };

    } catch (error) {
      console.error('❌ Erro ao sugerir skills:', error.message);

      return {
        suggestions: ['TypeScript', 'Docker', 'CI/CD']
      };
    }
  }

  async optimizeForATS(cv) {
    console.log('\n🎯 === OPTIMIZE FOR ATS ===');

    try {
      // Preparar contexto do CV
      const cvContext = this.prepareCVContext(cv);
      console.log('📝 Contexto para ATS:', cvContext.length, 'chars');

      // Prompt para a IA
      const prompt = `
És um especialista em recrutamento e otimização de CVs para sistemas ATS (Applicant Tracking Systems).
Analisa este CV e fornece:

1. Pontuação ATS (0-100)
2. Recomendações práticas para aumentar compatibilidade com ATS
3. Sugestões de palavras-chave relevantes
4. Formatação ideal (datas, cargos, bullet points)

CV:
${cvContext}

Responde APENAS com JSON:
{
  "atsScore": 0,
  "improvements": ["..."],
  "keywords": ["..."],
  "formattingTips": ["..."]
}
`;

      // Chamada à Gemini AI
      const response = await this.callGeminiAPI(prompt, 0.4);

      // Parse seguro
      const result = this.parseJSONResponse(response);

      console.log('✅ ATS Analysis completo:', result);

      return result;

    } catch (error) {
      console.error('❌ Erro ao otimizar ATS:', error.message);
      console.log('⚠️  Retornando fallback ATS...');

      // Fallback se IA falhar
      return {
        atsScore: 70,
        improvements: ['Use palavras-chave da vaga', 'Formate datas consistentemente'],
        keywords: ['liderança', 'gestão de projetos', 'comunicação'],
        formattingTips: ['Use bullet points claros', 'Inclua datas completas']
      };
    }
  }

  async generateInterviewQuestions(cv, jobDescription) {
    console.log('\n💼 === GENERATE INTERVIEW QUESTIONS ===');

    try {
      // Preparar contexto do CV
      const cvContext = this.prepareCVContext(cv);
      console.log('📝 Contexto do CV para perguntas de entrevista:', cvContext.length, 'chars');

      // Prompt para a IA
      const prompt = `
És um especialista em recrutamento e preparação de entrevistas.
Com base neste CV e na descrição da vaga, gera:

1. 5-10 perguntas de entrevista relevantes (técnicas e comportamentais)
2. Dificuldade da pergunta (fácil, média, difícil)
3. Qual seção do CV ou experiência ela se baseia

CV:
${cvContext}

Descrição da vaga:
${jobDescription}

Responde APENAS com JSON:
{
  "questions": [
    {
      "category": "Technical",
      "question": "texto da pergunta",
      "difficulty": "easy|medium|hard",
      "basedOn": "experiência/cargo relevante"
    }
  ],
  "preparationTips": ["Dicas para se preparar para a entrevista"]
}
`;

      // Chamada à Gemini AI
      const response = await this.callGeminiAPI(prompt, 0.5);

      // Parse seguro
      const result = this.parseJSONResponse(response);

      console.log('✅ Perguntas de entrevista geradas:', result.questions.length);

      return result;

    } catch (error) {
      console.error('❌ Erro ao gerar perguntas de entrevista:', error.message);
      console.log('⚠️  Retornando fallback...');

      // Fallback se IA falhar
      return {
        questions: [
          {
            category: 'Technical',
            question: 'Como você implementaria autenticação JWT?',
            difficulty: 'medium',
            basedOn: 'Experiência com Node.js'
          }
        ],
        preparationTips: ['Revise conceitos de segurança']
      };
    }
  }

  async analyzeCareerPath(profile) {
    console.log('\n🚀 === ANALYZE CAREER PATH ===');

    try {
      // Preparar contexto do perfil
      const context = `
Nome: ${profile.user?.name || 'N/A'}
Cargo atual: ${profile.currentRole || 'N/A'}
Experiências:
${profile.experiences?.map(e => `- ${e.jobTitle} na ${e.company} (${e.startDate || 'N/A'} - ${e.endDate || 'Atual'})`).join('\n') || 'Nenhuma'}
Formação:
${profile.educations?.map(e => `- ${e.degree} em ${e.institution}`).join('\n') || 'Nenhuma'}
Competências:
${profile.skills?.map(s => `${s.name} (${s.level || 'N/A'})`).join(', ') || 'Nenhuma'}
`;

      const prompt = `
      ${context} 
És um especialista em desenvolvimento de carreira e mentoring profissional.
Analisa este perfil e fornece:

1. Cargo atual
2. Sugestões de próximos cargos possíveis
3. Probabilidade de sucesso em cada cargo (high, medium, low)
4. Skills e requisitos necessários para progredir
5. Salário estimado
6. Insights e recomendações de crescimento profissional

Responde APENAS com JSON:
{
  "currentRole": "cargo atual",
  "suggestedPaths": [
    {
      "role": "cargo futuro",
      "timeline": "tempo estimado",
      "probability": "high|medium|low",
      "requirements": ["skill1", "skill2"],
      "salary": "estimativa salarial"
    }
  ],
  "insights": ["mensagem de aconselhamento"]
}
`;

      // Chamada à Gemini AI
      const response = await this.callGeminiAPI(prompt, 0.5);

      // Parse seguro
      const result = this.parseJSONResponse(response);

      console.log('✅ Análise de carreira completa:', result.suggestedPaths.length, 'caminhos sugeridos');

      return result;

    } catch (error) {
      console.error('❌ Erro ao analisar carreira:', error.message);
      console.log('⚠️  Retornando fallback...');

      // Fallback se IA falhar
      return {
        currentRole: profile.currentRole || 'Developer',
        suggestedPaths: [
          {
            role: 'Senior Developer',
            timeline: '2-3 anos',
            probability: 'high',
            requirements: ['TypeScript', 'Arquitetura'],
            salary: '€45k - €60k'
          }
        ],
        insights: ['Foca em liderança técnica e aprimoramento contínuo']
      };
    }
  }
}

// Exportar instância única
export default new AIService();