
// src/controllers/ai.controller.js
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const AIService = require('../services/ai.service');

const prisma = new PrismaClient();

class AIController {
  /**
   * AI Review - Analisar e pontuar CV
   * POST /api/ai/review
   */
  static async reviewCV(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { cvId } = req.body;
      const userId = req.user.id;

      // Verificar se CV existe e pertence ao utilizador
      const cv = await prisma.cV.findFirst({
        where: {
          id: cvId,
          userId: userId,
        },
        include: {
          user: {
            include: {
              profile: {
                include: {
                  experiences: true,
                  education: true,
                  skills: true,
                },
              },
            },
          },
        },
      });

      if (!cv) {
        return res.status //claude para acabar
      }
    }

  }
}