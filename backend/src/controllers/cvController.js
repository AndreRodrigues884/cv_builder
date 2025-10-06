// backend/src/controllers/cvController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCV = async (req, res) => {
  try {
    const cvData = req.body;
    
    const cv = await prisma.cV.create({
      data: {
        ...cvData,
        userId: req.userId,
      },
    });
    
    res.status(201).json(cv);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar CV' });
  }
};

exports.getUserCVs = async (req, res) => {
  try {
    const cvs = await prisma.cV.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
    });
    
    res.json(cvs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar CVs' });
  }
};

exports.getCVById = async (req, res) => {
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
    
    res.json(cv);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar CV' });
  }
};

exports.updateCV = async (req, res) => {
  try {
    const cv = await prisma.cV.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      data: req.body,
    });
    
    res.json(cv);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar CV' });
  }
};

exports.deleteCV = async (req, res) => {
  try {
    await prisma.cV.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar CV' });
  }
};