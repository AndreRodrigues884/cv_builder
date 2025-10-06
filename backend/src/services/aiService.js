const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  async improveDescription(description, position, company) {
    const prompt = `
Melhora esta descrição de experiência profissional para um currículo:

Cargo: ${position}
Empresa: ${company}
Descrição atual: ${description}

Requisitos:
- Usa verbos de ação no início de cada frase
- Máximo 4 linhas
- Foca em resultados concretos e impacto
- Inclui dados quantificáveis quando possível
- Tom profissional mas direto
- Otimiza para ATS (Applicant Tracking Systems)

Responde apenas com a descrição melhorada, sem explicações adicionais.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  }

  async suggestSkills(targetPosition, experiences) {
    const experiencesText = experiences
      .map(exp => `${exp.position} na ${exp.company}: ${exp.description}`)
      .join('\n');

    const prompt = `
Com base no cargo desejado "${targetPosition}" e nestas experiências profissionais:

${experiencesText}

Sugere 10 competências técnicas e soft skills mais relevantes para este perfil.
Prioriza competências que:
- Sejam procuradas no mercado para este cargo
- Estejam alinhadas com as experiências descritas
- Sejam específicas (evita termos muito genéricos)

Responde apenas com as competências separadas por vírgula, sem numeração ou explicações.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    const skillsText = response.choices[0].message.content.trim();
    return skillsText.split(',').map(skill => skill.trim());
  }

  async generateSummary(fullName, targetPosition, experiences, skills) {
    const experiencesText = experiences
      .map(exp => `${exp.position} na ${exp.company}`)
      .join(', ');

    const prompt = `
Cria um resumo profissional para um CV com estas informações:

Nome: ${fullName}
Cargo desejado: ${targetPosition}
Experiências: ${experiencesText}
Competências principais: ${skills.slice(0, 5).join(', ')}

Requisitos:
- Máximo 4 linhas
- Tom profissional e confiante
- Destaca valor único do candidato
- Menciona anos de experiência se relevante
- Foca em resultados e competências-chave

Responde apenas com o resumo, sem título ou formatação adicional.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  }

  async optimizeForATS(cvData) {
    // Análise de keywords e sugestões de otimização
    const prompt = `
Analisa este CV e sugere melhorias para otimização ATS:

Cargo desejado: ${cvData.targetPosition}
Competências: ${cvData.skills.join(', ')}
Experiências: ${JSON.stringify(cvData.experiences)}

Identifica:
1. Keywords importantes que faltam
2. Competências a adicionar
3. Termos a substituir para melhor match com ATS

Responde em formato JSON:
{
  "missingKeywords": [],
  "suggestedSkills": [],
  "improvements": []
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  }
}

module.exports = new AIService();