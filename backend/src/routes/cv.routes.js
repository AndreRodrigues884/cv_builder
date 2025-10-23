import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { body, param, query  } from 'express-validator';
import * as CVController from '../controllers/cv.controllers.js';

const router = Router();

router.post("/", authenticateToken,
  [
    body("title").notEmpty().withMessage("O título do CV é obrigatório."),
    body("templateId").notEmpty().withMessage("O ID do template é obrigatório."),
    body("language")
      .optional()
      .isIn(["PT", "EN", "ES", "FR"])
      .withMessage("Idioma inválido."),
    body("jobTargetTitle")
      .optional()
      .isString()
      .withMessage("Cargo alvo deve ser um texto."),
    body("jobTargetArea")
      .optional()
      .isString()
      .withMessage("Área alvo deve ser um texto."),
    body("contentJson")
      .optional()
      .isObject()
      .withMessage("O conteúdo do CV deve ser um objeto JSON válido."),
  ],
  CVController.createCV
);

router.get("/", authenticateToken,
  [
    query("status")
      .optional()
      .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .withMessage("Status inválido."),
    query("search").optional().isString().withMessage("O parâmetro search deve ser texto."),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "updatedAt", "title"])
      .withMessage("Campo de ordenação inválido."),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Ordem inválida (use 'asc' ou 'desc')."),
  ],
  CVController.getCVs
);

router.get("/:id", authenticateToken,
  [
    param("id")
      .notEmpty()
      .isString()
      .withMessage("O ID do CV é obrigatório e deve ser uma string."),
  ],
  CVController.getCVById
);

router.put("/:id", authenticateToken,
  [
    param("id")
      .notEmpty()
      .isString()
      .withMessage("O ID do CV é obrigatório e deve ser uma string."),
    body("title")
      .optional()
      .isString()
      .withMessage("O título deve ser um texto válido."),
    body("templateId")
      .optional()
      .isString()
      .withMessage("O ID do template deve ser uma string."),
    body("language")
      .optional()
      .isIn(["PT", "EN", "ES", "FR"])
      .withMessage("Idioma inválido."),
    body("jobTargetTitle")
      .optional()
      .isString()
      .withMessage("O cargo alvo deve ser um texto."),
    body("jobTargetArea")
      .optional()
      .isString()
      .withMessage("A área alvo deve ser um texto."),
    body("contentJson")
      .optional()
      .isObject()
      .withMessage("O conteúdo do CV deve ser um objeto JSON válido."),
    body("status")
      .optional()
      .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .withMessage("Status inválido."),
  ],
  CVController.updateCV
);

router.delete("/:id", authenticateToken,
  [
    param("id")
      .notEmpty()
      .isString()
      .withMessage("O ID do CV é obrigatório e deve ser uma string válida."),
  ],
  CVController.deleteCV
);

router.post("/:id/duplicate", authenticateToken,
  [
    param("id")
      .notEmpty()
      .isString()
      .withMessage("O ID do CV é obrigatório e deve ser uma string válida."),
  ],
  CVController.duplicateCV
);

router.patch("/:id/status", authenticateToken,
  [
    param("id")
      .notEmpty()
      .isString()
      .withMessage("O ID do CV é obrigatório e deve ser uma string válida."),
    body("status")
      .notEmpty()
      .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .withMessage("Status inválido. Valores permitidos: DRAFT, PUBLISHED, ARCHIVED."),
  ],
  CVController.updateStatus
);

router.patch("/:id/template", authenticateToken,
  [
    param("id")
      .notEmpty()
      .isString()
      .withMessage("O ID do CV é obrigatório e deve ser uma string válida."),
    body("templateId")
      .notEmpty()
      .isString()
      .withMessage("O ID do template é obrigatório e deve ser uma string válida."),
  ],
  CVController.changeTemplate
);

router.post('/:id/generate/pdf', CVController.generatePDF);

router.get('/:id/download/pdf', CVController.downloadPDF);

export default router;



//Logica de permissoes no futuro
/* import { checkPlan } from "../middlewares/checkPlan.js";

// Criar CV (disponível para todos os planos)
router.post("/", authenticateToken, CVController.createCV);

// Duplicar CV (disponível para PRO e CAREER_PLUS)
router.post("/:id/duplicate", authenticateToken, checkPlan(["PRO", "CAREER_PLUS"]), CVController.duplicateCV);

// Usar templates premium (apenas PRO e CAREER_PLUS)
router.put("/:id/change-template", authenticateToken, checkPlan(["PRO", "CAREER_PLUS"]), CVController.changeTemplate);
 */