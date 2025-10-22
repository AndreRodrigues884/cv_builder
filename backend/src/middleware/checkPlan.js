import prisma from "../lib/prisma.js";

export const checkPlan = (requiredPlans = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Não autenticado." });

      // Buscar plano do utilizador
      const billing = await prisma.billing.findUnique({ where: { userId } });
      if (!billing)
        return res.status(403).json({ success: false, message: "Plano de subscrição não encontrado." });

      const userPlan = billing.plan;

      // Se o plano do user estiver incluído nos planos permitidos, continua
      if (requiredPlans.includes(userPlan)) return next();

      return res.status(403).json({
        success: false,
        message: `Acesso negado. Esta funcionalidade requer um plano ${requiredPlans.join(" ou ")}.`,
      });
    } catch (err) {
      console.error("Erro em checkPlan:", err);
      return res.status(500).json({ success: false, message: "Erro interno no controlo de plano." });
    }
  };
};