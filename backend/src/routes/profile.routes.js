import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { body, param  } from 'express-validator';
import * as profileController from '../controllers/profile.controllers.js';

const router = Router();

router.get('/me', authenticateToken, profileController.getMyProfile);

router.put('/update', authenticateToken, 
    [
    body('headline').optional().isString().isLength({ max: 150 }).withMessage('Headline demasiado longa'),
    body('summary').optional().isString().isLength({ max: 1000 }).withMessage('Resumo demasiado longo'),
    body('location').optional().isString().isLength({ max: 100 }).withMessage('Localização inválida'),
    body('phone').optional().isString().isLength({ max: 30 }).withMessage('Telefone inválido'),
    body('website').optional().isURL().withMessage('Website inválido'),
    body('linkedin').optional().isURL().withMessage('Link do LinkedIn inválido'),
    body('github').optional().isURL().withMessage('Link do GitHub inválido'),
    body('languages').optional().isArray().withMessage('Languages deve ser um array'),
    body('visibility').optional().isIn(['PUBLIC', 'PRIVATE']).withMessage('Valor de visibilidade inválido'),
    body('publicSlug')
      .optional()
      .isSlug()
      .withMessage('Slug público inválido — apenas letras, números e hífens.'),
],
  profileController.updateProfile
);
router.get('/:slug',
  [param('slug').isSlug().withMessage('Slug inválido')],
  profileController.getProfileBySlug
);
router.post('/experiences', authenticateToken,
  [
    body('jobTitle').notEmpty().withMessage('O cargo é obrigatório'),
    body('company').notEmpty().withMessage('A empresa é obrigatória'),
    body('location').optional().isString().withMessage('Localização inválida'),
    body('startDate').notEmpty().isISO8601().withMessage('Data de início inválida'),
    body('endDate').optional().isISO8601().withMessage('Data de fim inválida'),
    body('isCurrent').optional().isBoolean(),
    body('description').optional().isString(),
    body('achievements').optional().isArray(),
    body('skills').optional().isArray(),
  ],
  profileController.addExperience
);
router.put('/experiences/:id',authenticateToken,
  [
    param('id').notEmpty().withMessage('ID é obrigatório'),
    body('jobTitle').optional().trim().notEmpty(),
    body('company').optional().trim().notEmpty(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  profileController.updateExperience
);
router.delete('/experiences/:id', authenticateToken,
  [param('id').notEmpty().withMessage('ID é obrigatório')],
  profileController.deleteExperience
);
router.post('/education',authenticateToken,
  [
    body('degree').notEmpty().withMessage('O grau académico é obrigatório'),
    body('institution').notEmpty().withMessage('A instituição é obrigatória'),
    body('fieldOfStudy').optional().isString().withMessage('Campo de estudo inválido'),
    body('location').optional().isString().withMessage('Localização inválida'),
    body('startDate').notEmpty().isISO8601().withMessage('Data de início inválida'),
    body('endDate').optional().isISO8601().withMessage('Data de fim inválida'),
    body('isCurrent').optional().isBoolean(),
    body('grade').optional().isString(),
    body('description').optional().isString(),
    body('achievements').optional().isArray(),
  ],
  profileController.addEducation
);
router.put('/education/:id', authenticateToken,
  [
    param('id').notEmpty().isString().withMessage('ID inválido'),
    body('degree').optional().isString().withMessage('Grau inválido'),
    body('institution').optional().isString().withMessage('Instituição inválida'),
    body('fieldOfStudy').optional().isString().withMessage('Campo de estudo inválido'),
    body('location').optional().isString().withMessage('Localização inválida'),
    body('startDate').optional().isISO8601().withMessage('Data de início inválida'),
    body('endDate').optional().isISO8601().withMessage('Data de fim inválida'),
    body('isCurrent').optional().isBoolean(),
    body('grade').optional().isString(),
    body('description').optional().isString(),
    body('achievements').optional().isArray(),
  ],
  profileController.updateEducation
);
router.delete('/education/:id', authenticateToken,
  [param('id').notEmpty().isString().withMessage('ID inválido')],
  profileController.deleteEducation
);
router.post('/skills', authenticateToken,
  [
    body('name').notEmpty().withMessage('O nome da competência é obrigatório'),
    body('category').optional().isString().withMessage('Categoria inválida'),
    body('level').optional().isInt({ min: 1, max: 5 }).withMessage('Nível inválido'),
    body('yearsOfExp').optional().isInt({ min: 0 }).withMessage('Anos de experiência inválidos'),
  ],
  profileController.addSkill
);
router.put('/skills/:id', authenticateToken,
  [
    param('id').notEmpty().withMessage('ID da competência é obrigatório'),
    body('name').optional().isString().withMessage('Nome inválido'),
    body('category').optional().isString().withMessage('Categoria inválida'),
    body('level').optional().isInt({ min: 1, max: 5 }).withMessage('Nível inválido'),
    body('yearsOfExp').optional().isInt({ min: 0 }).withMessage('Anos de experiência inválidos'),
  ],
  profileController.updateSkill
);
router.delete('/skills/:id', authenticateToken,
  [
    param('id').notEmpty().withMessage('ID da competência é obrigatório'),
  ],
  profileController.deleteSkill
);
router.post('/certifications', authenticateToken,
  [
    body('name').notEmpty().withMessage('O nome da certificação é obrigatório'),
    body('issuingOrg').notEmpty().withMessage('Organização emissora é obrigatória'),
    body('issueDate').notEmpty().isISO8601().withMessage('Data de emissão inválida'),
    body('expirationDate').optional().isISO8601().withMessage('Data de expiração inválida'),
    body('credentialId').optional().isString(),
    body('credentialUrl').optional().isURL().withMessage('URL inválida'),
    body('doesNotExpire').optional().isBoolean(),
  ],
  profileController.addCertification
);
router.put('/certifications/:id', authenticateToken,
  [
    param('id').notEmpty().withMessage('ID da certificação é obrigatório'),
    body('name').optional().notEmpty().withMessage('O nome da certificação não pode estar vazio'),
    body('issuingOrg').optional().notEmpty().withMessage('Organização emissora não pode estar vazia'),
    body('issueDate').optional().isISO8601().withMessage('Data de emissão inválida'),
    body('expirationDate').optional().isISO8601().withMessage('Data de expiração inválida'),
    body('credentialId').optional().isString(),
    body('credentialUrl').optional().isURL().withMessage('URL inválida'),
    body('doesNotExpire').optional().isBoolean(),
  ],
  profileController.updateCertification
);
router.delete('/certifications/:id', authenticateToken,
  [
    param('id').notEmpty().withMessage('ID da certificação é obrigatório'),
  ],
  profileController.deleteCertification
);
router.post('/projects', authenticateToken, profileController.addProject);
router.put('/projects/:id', authenticateToken,
  [
    param('id').notEmpty().withMessage('ID do projeto é obrigatório'),
  ],
  profileController.updateProject
);
router.delete('/projects/:id', authenticateToken,
  [
    param('id').notEmpty().withMessage('ID do projeto é obrigatório'),
  ],
  profileController.deleteProject
);



export default router;
