// src/services/ai.service.js
const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseURL = 'https://api-inference.huggingface.co/models';
    
    // Modelos que vamos usar
    this.models = {
      textGeneration: 'mistralai/Mistral-7B-Instruct-v0.2', // Para gerar texto
      textAnalysis: 'facebook/bart-large-mnli', // Para análise
      embeddings: 'sentence-transformers/all-MiniLM-L6-v2', // Para comparações
    };
  }

  /**
   * Fazer chamada à API do Hugging Face
   */
  async callHuggingFace(model, payload, retries = 3) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${model}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos
        }
      );

      return response.data;
    } catch (error) {
      // Se modelo está carregando, retry
      if (error.response?.status === 503 && retries > 0) {
        console.log(`Modelo carregando, tentando novamente em 5s... (${retries} tentativas restantes)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.callHuggingFace(model, payload, retries - 1);
      }

      console.error('Erro ao chamar Hugging Face:', error.message);
      throw error;
    }
  }

  /**
   * Gerar texto com IA
   */
  async generateText(prompt, maxTokens = 500, temperature = 0.7) {
    try {
      const response = await this.callHuggingFace(
        this.models.textGeneration,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: temperature,
            return_full_text: false,
          },
        }
      );

      return response[0]?.generated_text || '';
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      throw new Error('Erro ao gerar texto com IA');
    }
  }

  /**
   * Analisar CV e gerar pontuação
   */
  async analyzeCV(cv) {
    try {
      // Preparar contexto do CV
      const cvContext = this.prepareCVContext(cv);

      const prompt = `[INST] Você é um especialista em análise de currículos e recrutamento. Analise o seguinte CV e forneça:

1. Pontuação geral (0-100)
2. Pontuação ATS (compatibilidade com sistemas de recrutamento) (0-100)
3. Pontuação de linguagem (clareza e profissionalismo) (0-100)
4. Pontuação de impacto (resultados e conquistas) (0-100)
5. Pontuação de clareza (estrutura e organização) (0-100)
6. Lista de 3-5 palavras-chave que faltam
7. 2-3 pontos fortes
8. 2-3 pontos a melhorar
9. 3-5 recomendações práticas

CV:
${cvContext}

Responda no formato JSON:
{
  "scores": {
    "overall": 0,
    "ats": 0,
    "language": 0,
    "impact": 0,
    "clarity": 0
  },
  "missingKeywords": [],
  "strengths": [],
  "improvements": [],
  "recommendations": [
    {
      "type": "improvement",
      "section": "string",
      "message": "string",
      "priority": "high|medium|low"
    }
  ]
}
[/INST]`;

      const response = await this.generateText(prompt, 1000, 0.3);
      
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          estimatedReadTime: this.calculateReadTime(cvContext),
        };
      }

      // Fallback se não conseguir parsear JSON
      return this.getFallbackAnalysis();
    } catch (error) {
      console.error('Erro ao analisar CV:', error);
      // Retornar análise básica em caso de erro
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Melhorar texto de uma secção
   */
  async improveText(text, section, context = {}) {
    try {
      const sectionTips = {
        summary: 'Seja conciso, destaque resultados e use verbos de ação.',
        experience: 'Use verbos de ação, quantifique resultados, destaque impacto.',
        education: 'Seja direto, mencione conquistas académicas relevantes.',
        skills: 'Organize por categorias, priorize as mais relevantes.',
      };

      const prompt = `[INST] Você é um especialista em redação de currículos. Melhore o seguinte texto da secção "${section}" de um CV:

Texto original:
"${text}"

Dicas para ${section}: ${sectionTips[section] || 'Seja claro e profissional.'}

Forneça:
1. Versão melhorada do texto
2. 3 sugestões de melhoria específicas

Responda no formato JSON:
{
  "improved": "texto melhorado aqui",
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"]
}
[/INST]`;

      const response = await this.generateText(prompt, 500, 0.5);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        improved: text,
        suggestions: [
          'Adicione mais detalhes quantificáveis',
          'Use verbos de ação mais impactantes',
          'Torne o texto mais conciso',
        ],
      };
    } catch (error) {
      console.error('Erro ao melhorar texto:', error);
      throw new Error('Erro ao melhorar texto');
    }
  }

  /**
   * Sugerir competências
   */
  async suggestSkills(profile, jobTitle, jobArea) {
    try {
      const currentSkills = profile.skills?.map(s => s.name).join(', ') || 'Nenhuma';
      const experiences = profile.experiences?.map(e => e.jobTitle).join(', ') || 'Nenhuma';

      const prompt = `[INST] Você é um consultor de carreira especializado em ${jobArea || 'tecnologia'}. 

Perfil atual:
- Cargo alvo: ${jobTitle || 'Não especificado'}
- Competências atuais: ${currentSkills}
- Experiências: ${experiences}

Sugira 5-8 competências que este profissional deveria adicionar ao CV, organizadas por prioridade.

Responda no formato JSON:
{
  "suggestions": [
    {
      "skill": "nome da competência",
      "category": "Frontend|Backend|DevOps|Soft Skills|etc",
      "priority": "high|medium|low",
      "reason": "por que é importante"
    }
  ]
}
[/INST]`;

      const response = await this.generateText(prompt, 800, 0.6);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackSkillSuggestions(jobArea);
    } catch (error) {
      console.error('Erro ao sugerir skills:', error);
      return this.getFallbackSkillSuggestions(jobArea);
    }
  }

  /**
   * Gerar sumário profissional
   */
  async generateSummary(profile, jobTitle, targetArea, tone = 'professional') {
    try {
      const experiences = profile.experiences?.map(e => 
        `${e.jobTitle} na ${e.company} (${e.isCurrent ? 'atual' : 'anterior'})`
      ).join(', ') || 'sem experiência listada';

      const skills = profile.skills?.slice(0, 10).map(s => s.name).join(', ') || 'não especificadas';
      const education = profile.educations?.[0]?.degree || 'formação não especificada';

      const toneInstructions = {
        professional: 'formal e profissional',
        casual: 'amigável mas profissional',
        confident: 'assertivo e confiante',
      };

      const prompt = `[INST] Crie um sumário profissional conciso (3-4 linhas) para um CV com tom ${toneInstructions[tone] || 'professional'}:

Informações:
- Cargo desejado: ${jobTitle || 'não especificado'}
- Área: ${targetArea || 'não especificada'}
- Formação: ${education}
- Experiências: ${experiences}
- Principais competências: ${skills}

O sumário deve:
- Ser objetivo e impactante
- Destacar pontos fortes
- Mencionar experiência relevante
- Incluir competências-chave
- Ter 3-4 linhas no máximo

Forneça também 2 variações alternativas do sumário.

Responda no formato JSON:
{
  "summary": "sumário principal",
  "variations": ["variação 1", "variação 2"]
}
[/INST]`;

      const response = await this.generateText(prompt, 600, 0.7);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          ...result,
          tips: [
            'Personalize o sumário para cada vaga',
            'Destaque as competências mais relevantes',
            'Mantenha entre 3-5 linhas',
          ],
        };
      }

      return this.getFallbackSummary(jobTitle, targetArea);
    } catch (error) {
      console.error('Erro ao gerar sumário:', error);
      return this.getFallbackSummary(jobTitle, targetArea);
    }
  }

  /**
   * Otimizar para ATS
   */
  async optimizeForATS(cv) {
    try {
      const cvContext = this.prepareCVContext(cv);

      const prompt = `[INST] Você é um especialista em ATS (Applicant Tracking Systems). Analise este CV e identifique problemas que podem impedir a aprovação em sistemas de recrutamento automáticos:

${cvContext}

Identifique:
1. Problemas de formatação
2. Palavras-chave faltantes
3. Problemas de estrutura
4. Score ATS atual (0-100)

Responda no formato JSON:
{
  "atsScore": 0,
  "optimizations": [
    {
      "section": "format|keywords|structure",
      "issue": "descrição do problema",
      "fix": "como corrigir",
      "applied": false
    }
  ],
  "improvements": "texto explicativo"
}
[/INST]`;

      const response = await this.generateText(prompt, 800, 0.3);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackATSOptimization();
    } catch (error) {
      console.error('Erro ao otimizar ATS:', error);
      return this.getFallbackATSOptimization();
    }
  }

  /**
   * Gerar perguntas de entrevista
   */
  async generateInterviewQuestions(cv, jobDescription = '') {
    try {
      const cvContext = this.prepareCVContext(cv);

      const prompt = `[INST] Você é um recrutador experiente. Baseado neste CV, gere 6-8 perguntas que provavelmente serão feitas numa entrevista:

CV:
${cvContext}

${jobDescription ? `Descrição da vaga:\n${jobDescription}` : ''}

Gere perguntas de diferentes categorias:
- Técnicas (sobre competências específicas)
- Comportamentais (situações passadas)
- Situacionais (cenários hipotéticos)

Responda no formato JSON:
{
  "questions": [
    {
      "category": "Técnica|Comportamental|Situacional",
      "question": "texto da pergunta",
      "difficulty": "easy|medium|hard",
      "basedOn": "que parte do CV motivou esta pergunta"
    }
  ],
  "preparationTips": ["dica 1", "dica 2", "dica 3"]
}
[/INST]`;

      const response = await this.generateText(prompt, 1200, 0.6);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackInterviewQuestions();
    } catch (error) {
      console.error('Erro ao gerar perguntas:', error);
      return this.getFallbackInterviewQuestions();
    }
  }

  /**
   * Analisar caminho de carreira
   */
  async analyzeCareerPath(profile) {
    try {
      const currentRole = profile.headline || 'Profissional';
      const experiences = profile.experiences?.map(e => e.jobTitle).join(' -> ') || 'Sem experiências';
      const skills = profile.skills?.map(s => s.name).join(', ') || 'Sem competências';
      const yearsExp = this.calculateYearsOfExperience(profile.experiences);

      const prompt = `[INST] Você é um consultor de carreira. Analise este perfil e sugira 3 caminhos de carreira realistas:

Perfil:
- Cargo atual: ${currentRole}
- Progressão: ${experiences}
- Anos de experiência: ${yearsExp}
- Competências: ${skills}

Para cada caminho, forneça:
- Nome do cargo
- Timeline estimado
- Probabilidade de sucesso
- Requisitos necessários
- Faixa salarial estimada (Portugal/Europa)

Responda no formato JSON:
{
  "currentRole": "${currentRole}",
  "suggestedPaths": [
    {
      "role": "nome do cargo",
      "timeline": "X-Y anos",
      "probability": "high|medium|low",
      "requirements": ["requisito 1", "requisito 2"],
      "salary": "faixa salarial"
    }
  ],
  "insights": ["insight 1", "insight 2"]
}
[/INST]`;

      const response = await this.generateText(prompt, 1000, 0.5);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackCareerPath(currentRole);
    } catch (error) {
      console.error('Erro ao analisar carreira:', error);
      return this.getFallbackCareerPath(profile.headline);
    }
  }

  /**
   * Analisar lacunas de competências
   */
  async analyzeSkillGaps(profile, targetRole) {
    try {
      const currentSkills = profile.skills?.map(s => `${s.name} (nível ${s.level || 3})`).join(', ') || 'Nenhuma';

      const prompt = `[INST] Você é um especialista em desenvolvimento de carreira. Analise as lacunas de competências para atingir o cargo de "${targetRole}":

Competências atuais: ${currentSkills}
Cargo alvo: ${targetRole}

Identifique 4-6 lacunas críticas e forneça:
- Nome da competência
- Importância (high/medium/low)
- Nível atual (0-5)
- Nível requerido (0-5)
- Razão da importância
- Caminho de aprendizagem sugerido

Responda no formato JSON:
{
  "skillGaps": [
    {
      "skill": "nome",
      "importance": "high|medium|low",
      "currentLevel": 0,
      "requiredLevel": 0,
      "reason": "explicação",
      "learningPath": "como aprender"
    }
  ],
  "priorityActions": ["ação 1", "ação 2", "ação 3"]
}
[/INST]`;

      const response = await this.generateText(prompt, 1000, 0.4);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackSkillGaps(targetRole);
    } catch (error) {
      console.error('Erro ao analisar gaps:', error);
      return this.getFallbackSkillGaps(targetRole);
    }
  }

  /**
   * Recomendar cursos
   */
  async recommendCourses(skillGaps, budget = 100, timeAvailable = '10h/semana') {
    try {
      const gapsText = skillGaps?.map(g => `${g.skill} (${g.importance})`).join(', ') || 'não especificado';

      const prompt = `[INST] Você é um consultor de educação profissional. Recomende 4-6 cursos online para desenvolver estas competências:

Competências a desenvolver: ${gapsText}
Orçamento: €${budget}
Tempo disponível: ${timeAvailable}

Para cada curso, forneça:
- Título do curso
- Plataforma (Udemy, Coursera, Pluralsight, etc)
- Duração estimada
- Preço
- Nível (Beginner/Intermediate/Advanced)
- Competências que desenvolve
- Rating estimado (4.0-5.0)

Responda no formato JSON:
{
  "recommendations": [
    {
      "title": "nome do curso",
      "provider": "plataforma",
      "duration": "X horas",
      "price": "€X",
      "rating": 4.5,
      "level": "Beginner|Intermediate|Advanced",
      "skills": ["skill1", "skill2"]
    }
  ],
  "learningPlan": {
    "week1": "atividade",
    "week2": "atividade",
    "week3": "atividade",
    "week4": "atividade"
  }
}
[/INST]`;

      const response = await this.generateText(prompt, 1200, 0.5);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const totalCost = result.recommendations.reduce((sum, course) => {
          const price = parseFloat(course.price.replace(/[€,]/g, ''));
          return sum + (isNaN(price) ? 0 : price);
        }, 0);
        
        return {
          ...result,
          totalCost: `€${totalCost.toFixed(2)}`,
        };
      }

      return this.getFallbackCourseRecommendations();
    } catch (error) {
      console.error('Erro ao recomendar cursos:', error);
      return this.getFallbackCourseRecommendations();
    }
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Preparar contexto do CV para enviar à IA
   */
  prepareCVContext(cv) {
    const profile = cv.user?.profile;
    let context = `Título do CV: ${cv.title}\n`;
    context += `Cargo alvo: ${cv.jobTargetTitle || 'Não especificado'}\n`;
    context += `Área: ${cv.jobTargetArea || 'Não especificada'}\n\n`;

    if (profile) {
      context += `Perfil:\n`;
      context += `- Headline: ${profile.headline || 'Não especificado'}\n`;
      context += `- Sumário: ${profile.summary || 'Não especificado'}\n`;
      context += `- Localização: ${profile.location || 'Não especificada'}\n\n`;

      if (profile.experiences?.length > 0) {
        context += `Experiências:\n`;
        profile.experiences.forEach((exp, i) => {
          context += `${i + 1}. ${exp.jobTitle} - ${exp.company}\n`;
          context += `   ${exp.description || ''}\n`;
          if (exp.achievements?.length > 0) {
            context += `   Conquistas: ${exp.achievements.join('; ')}\n`;
          }
        });
        context += '\n';
      }

      if (profile.education?.length > 0) {
        context += `Formação:\n`;
        profile.education.forEach((edu, i) => {
          context += `${i + 1}. ${edu.degree} - ${edu.institution}\n`;
        });
        context += '\n';
      }

      if (profile.skills?.length > 0) {
        context += `Competências:\n`;
        context += profile.skills.map(s => `- ${s.name} (nível ${s.level || 3})`).join('\n');
        context += '\n';
      }
    }

    return context;
  }

  /**
   * Calcular tempo de leitura estimado
   */
  calculateReadTime(text) {
    const words = text.split(/\s+/).length;
    const wordsPerSecond = 3; // Velocidade média de leitura
    return Math.ceil(words / wordsPerSecond);
  }

  /**
   * Calcular anos de experiência
   */
  calculateYearsOfExperience(experiences) {
    if (!experiences || experiences.length === 0) return 0;
    
    const totalMonths = experiences.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);

    return Math.round(totalMonths / 12);
  }

  // ========================================
  // FALLBACKS (caso a IA falhe)
  // ========================================

  getFallbackAnalysis() {
    return {
      scores: {
        overall: 70,
        ats: 75,
        language: 68,
        impact: 72,
        clarity: 70,
      },
      missingKeywords: ['liderança', 'gestão de projetos', 'metodologias ágeis'],
      strengths: ['Experiência técnica sólida', 'Formação académica relevante'],
      improvements: ['Adicionar mais resultados quantificáveis', 'Melhorar descrição de soft skills'],
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

  getFallbackSkillSuggestions(jobArea) {
    const suggestions = {
      tecnologia: [
        { skill: 'Docker', category: 'DevOps', priority: 'high', reason: 'Essencial para desenvolvimento moderno' },
        { skill: 'Kubernetes', category: 'DevOps', priority: 'medium', reason: 'Importante para orquestração' },
        { skill: 'CI/CD', category: 'DevOps', priority: 'high', reason: 'Standard da indústria' },
      ],
      design: [
        { skill: 'Figma', category: 'Design Tools', priority: 'high', reason: 'Ferramenta mais usada' },
        { skill: 'User Research', category: 'UX', priority: 'high', reason: 'Fundamental para UX' },
      ],
    };

    return {
      suggestions: suggestions[jobArea?.toLowerCase()] || suggestions.tecnologia,
    };
  }

  getFallbackSummary(jobTitle, targetArea) {
    return {
      summary: `Profissional de ${targetArea || 'tecnologia'} com experiência em ${jobTitle || 'desenvolvimento'}. Especialista em resolver problemas complexos e entregar soluções de alta qualidade. Forte capacidade de trabalho em equipa e comunicação eficaz.`,
      variations: [
        `Profissional dedicado com foco em ${targetArea || 'inovação'} e resultados mensuráveis.`,
        `${jobTitle || 'Profissional'} com experiência comprovada em projetos desafiadores.`,
      ],
      tips: [
        'Personalize o sumário para cada vaga',
        'Destaque as competências mais relevantes',
        'Mantenha entre 3-5 linhas',
      ],
    };
  }

  getFallbackATSOptimization() {
    return {
      atsScore: 75,
      optimizations: [
        {
          section: 'format',
          issue: 'Formato de data inconsistente',
          fix: 'Padronizar para MM/YYYY',
          applied: false,
        },
        {
          section: 'keywords',
          issue: 'Faltam palavras-chave da área',
          fix: 'Adicionar: agile, scrum, CI/CD',
          applied: false,
        },
      ],
      improvements: 'Aplicar as sugestões aumentará o score ATS em ~15 pontos',
    };
  }

  getFallbackInterviewQuestions() {
    return {
      questions: [
        {
          category: 'Técnica',
          question: 'Como abordas a resolução de problemas complexos?',
          difficulty: 'medium',
          basedOn: 'Experiência geral',
        },
        {
          category: 'Comportamental',
          question: 'Descreve uma situação em que tiveste que trabalhar sob pressão.',
          difficulty: 'medium',
          basedOn: 'Contexto profissional',
        },
      ],
      preparationTips: [
        'Prepara exemplos STAR',
        'Revê os projetos mencionados',
        'Pesquisa sobre a empresa',
      ],
    };
  }

  getFallbackCareerPath(currentRole) {
    return {
      currentRole: currentRole || 'Profissional',
      suggestedPaths: [
        {
          role: 'Senior ' + (currentRole || 'Professional'),
          timeline: '1-2 anos',
          probability: 'high',
          requirements: ['Experiência técnica', 'Liderança'],
          salary: '€40k - €60k',
        },
      ],
      insights: ['Continua a desenvolver competências técnicas', 'Procura oportunidades de mentoria'],
    };
  }

  getFallbackSkillGaps(targetRole) {
    return {
      skillGaps: [
        {
          skill: 'Liderança',
          importance: 'high',
          currentLevel: 2,
          requiredLevel: 4,
          reason: 'Essencial para ' + targetRole,
          learningPath: 'Cursos + experiência prática',
        },
      ],
      priorityActions: ['Focar em desenvolvimento de liderança', 'Procurar projetos desafiadores'],
    };
  }

  getFallbackCourseRecommendations() {
    return {
      recommendations: [
        {
          title: 'Professional Development Course',
          provider: 'Udemy',
          duration: '20 horas',
          price: '€49.99',
          rating: 4.5,
          level: 'Intermediate',
          skills: ['Liderança', 'Comunicação'],
        },
      ],
      totalCost: '€49.99',
      learningPlan: {
        week1: 'Fundamentos',
        week2: 'Prática',
        week3: 'Projetos',
        week4: 'Revisão',
      },
    };
  }
}

module.exports = new AIService();