// backend/src/services/aiServiceHuggingFace.js
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

class AIServiceHuggingFace {
  async improveDescription(description, position, company) {
    const prompt = `Você é um especialista em currículos profissionais. Melhore esta descrição:

Cargo: ${position}
Empresa: ${company}
Descrição atual: ${description}

Requisitos:
- Use verbos de ação
- Máximo 4 linhas
- Foque em resultados
- Tom profissional

Descrição melhorada:`;

    try {
      const result = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        }
      });

      return result.generated_text.trim();
    } catch (error) {
      console.error('Erro Hugging Face:', error);
      
      // Fallback se API falhar
      return this.fallbackImprove(description);
    }
  }

  async suggestSkills(targetPosition, experiences) {
    const experiencesText = experiences
      .map(exp => `${exp.position} na ${exp.company}`)
      .join(', ');

    const prompt = `Liste 10 competências técnicas relevantes para:

Cargo desejado: ${targetPosition}
Experiências: ${experiencesText}

Competências (separadas por vírgula):`;

    try {
      const result = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false,
        }
      });

      const skillsText = result.generated_text.trim();
      const skills = skillsText
        .split(/[,\n]/)
        .map(s => s.trim().replace(/^\d+\.\s*/, ''))
        .filter(s => s.length > 2 && s.length < 50)
        .slice(0, 10);

      return skills.length > 0 ? skills : this.fallbackSkills(targetPosition);
    } catch (error) {
      console.error('Erro Hugging Face:', error);
      return this.fallbackSkills(targetPosition);
    }
  }

  async generateSummary(fullName, targetPosition, experiences, skills) {
    const experiencesText = experiences
      .map(exp => `${exp.position} na ${exp.company}`)
      .join(', ');

    const prompt = `Crie um resumo profissional (máximo 4 linhas):

Nome: ${fullName}
Cargo desejado: ${targetPosition}
Experiências: ${experiencesText}
Competências: ${skills.slice(0, 5).join(', ')}

Resumo profissional:`;

    try {
      const result = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false,
        }
      });

      return result.generated_text.trim();
    } catch (error) {
      console.error('Erro Hugging Face:', error);
      return this.fallbackSummary(fullName, targetPosition, experiences, skills);
    }
  }

  async optimizeForATS(cvData) {
    return {
      missingKeywords: ['ATS', 'Tracking System', 'Keywords'],
      suggestedSkills: ['Otimização ATS', 'SEO Currículo'],
      improvements: ['Use palavras-chave do anúncio', 'Evite imagens e tabelas complexas']
    };
  }

  // Fallbacks se API falhar
  fallbackImprove(description) {
    const verbs = ['Desenvolvi', 'Implementei', 'Geri', 'Criei', 'Otimizei', 'Colaborei'];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    return `${verb} ${description}. Foquei em resultados mensuráveis e trabalho em equipa para atingir objetivos.`;
  }

  fallbackSkills(targetPosition) {
    const skillsDB = {
      'desenvolvedor': ['JavaScript', 'Python', 'Git', 'Docker', 'SQL', 'React', 'Node.js', 'API REST', 'Agile', 'TypeScript'],
      'designer': ['Figma', 'Adobe XD', 'Photoshop', 'UI/UX', 'Prototipagem', 'Design System', 'HTML/CSS', 'Wireframing'],
      'marketing': ['SEO', 'Google Analytics', 'Social Media', 'Content Marketing', 'Email Marketing', 'Copywriting', 'CRM'],
      'gestor': ['Liderança', 'Gestão de Projetos', 'Planeamento Estratégico', 'Budget', 'KPIs', 'Scrum', 'Comunicação'],
    };

    const position = targetPosition.toLowerCase();
    for (const [key, skills] of Object.entries(skillsDB)) {
      if (position.includes(key)) return skills;
    }
    
    return ['Comunicação', 'Trabalho em Equipa', 'Resolução de Problemas', 'Organização', 'Adaptabilidade'];
  }

  fallbackSummary(fullName, targetPosition, experiences, skills) {
    const yearsExp = experiences.length;
    const mainSkills = skills.slice(0, 3).join(', ');
    
    return `Profissional com ${yearsExp}+ anos de experiência como ${targetPosition}, especializado em ${mainSkills}. Histórico comprovado em desenvolvimento de soluções e trabalho colaborativo. Focado em resultados e melhoria contínua.`;
  }
}

module.exports = new AIServiceHuggingFace();