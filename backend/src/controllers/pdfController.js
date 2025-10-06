const pdfService = require('../services/pdfService');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

exports.generatePDF = async (req, res) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });
    
    if (!cv) {
      return res.status(404).json({ error: 'CV não encontrado' });
    }
    
    const filePath = await pdfService.generateCV(cv);
    
    res.download(filePath, `${cv.fullName}-CV.pdf`, (err) => {
      // Limpar ficheiro temporário
      fs.unlinkSync(filePath);
      
      if (err) {
        console.error('Erro ao enviar PDF:', err);
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};