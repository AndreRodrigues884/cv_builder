// backend/test-huggingface.js
require('dotenv').config();
const aiService = require('./src/services/aiServiceHuggingFace');

async function test() {
  console.log('🧪 A testar Hugging Face...');
  console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? '✅ Configurada' : '❌ Não encontrada');
  
  try {
    console.log('\n1️⃣ Testando melhorar descrição...');
    const improved = await aiService.improveDescription(
      'Trabalhei no desenvolvimento de aplicações web',
      'Desenvolvedor Full-Stack',
      'Tech Company'
    );
    console.log('✅ Resultado:', improved);

    console.log('\n2️⃣ Testando sugestão de skills...');
    const skills = await aiService.suggestSkills('Desenvolvedor', [
      { position: 'Dev', company: 'ABC', description: 'Web dev' }
    ]);
    console.log('✅ Skills:', skills);

    console.log('\n3️⃣ Testando gerar resumo...');
    const summary = await aiService.generateSummary(
      'João Silva',
      'Desenvolvedor',
      [{ position: 'Dev', company: 'ABC' }],
      ['JavaScript', 'React', 'Node.js']
    );
    console.log('✅ Summary:', summary);

    console.log('\n✅ Todos os testes passaram!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();