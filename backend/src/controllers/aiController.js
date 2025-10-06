const aiService = require('../services/aiService');

exports.improveDescription = async (req, res) => {
  try {
    const { description, position, company } = req.body;
    
    const improved = await aiService.improveDescription(description, position, company);
    
    res.json({ improved });
  } catch (error) {
    console.error('Erro AI:', error);
    res.status(500).json({ error: 'Erro ao melhorar descrição' });
  }
};

exports.suggestSkills = async (req, res) => {
  try {
    const { targetPosition, experiences } = req.body;
    
    const skills = await aiService.suggestSkills(targetPosition, experiences);
    
    res.json({ skills });
  } catch (error) {
    console.error('Erro AI:', error);
    res.status(500).json({ error: 'Erro ao sugerir competências' });
  }
};

exports.generateSummary = async (req, res) => {
  try {
    const { fullName, targetPosition, experiences, skills } = req.body;
    
    const summary = await aiService.generateSummary(fullName, targetPosition, experiences, skills);
    
    res.json({ summary });
  } catch (error) {
    console.error('Erro AI:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
};

exports.optimizeForATS = async (req, res) => {
  try {
    const cvData = req.body;
    
    const analysis = await aiService.optimizeForATS(cvData);
    
    res.json(analysis);
  } catch (error) {
    console.error('Erro AI:', error);
    res.status(500).json({ error: 'Erro ao analisar CV' });
  }
};