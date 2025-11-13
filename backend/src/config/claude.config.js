/**
 * ⚙️ Configuração da Claude API
 * backend/src/config/claude.config.js
 */

export const claudeConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514',
  apiVersion: '2023-06-01',
  baseURL: 'https://api.anthropic.com/v1/messages',
  
  // Rate limits
  maxTokens: {
    improveText: 800,
    suggestSkills: 1200,
    generateSummary: 1000,
    reviewCV: 1500,
    jobMatch: 2000
  },
  
  // Custos estimados (USD por 1M tokens)
  pricing: {
    input: 3.00,   // $3 por 1M input tokens
    output: 15.00  // $15 por 1M output tokens
  },
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hora
    maxSize: 100  // máximo 100 entradas
  },
  
  // Retry settings
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000
  }
};

// Validação da API key
export const validateConfig = () => {
  if (!claudeConfig.apiKey) {
    throw new Error(
      '❌ ANTHROPIC_API_KEY não configurada! ' +
      'Adicione ao .env: ANTHROPIC_API_KEY=sk-ant-...'
    );
  }
  
  if (!claudeConfig.apiKey.startsWith('sk-ant-')) {
    throw new Error('❌ ANTHROPIC_API_KEY inválida! Deve começar com sk-ant-');
  }
  
  console.log('✅ Claude API configurada corretamente');
  return true;
};

export default claudeConfig;