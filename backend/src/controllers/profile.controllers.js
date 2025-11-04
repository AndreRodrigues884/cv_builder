import { PrismaClient } from '@prisma/client';
import {validationResult} from 'express-validator';

const prisma = new PrismaClient();

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        certifications: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!profile || !user) {
      return res.status(404).json({ success: false, message: 'Perfil não encontrado' });
    }

    // Buscar billing associado
    const billing = await prisma.billing.findUnique({
      where: { userId },
      select: { plan: true, subscriptionStatus: true, cvGenerationLimit: true, cvGenerationCount: true },
    });

    return res.status(200).json({
      success: true,
      data: { user, profile, billing },
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro ao obter perfil' });
  }
};

/**
 * Atualizar perfil
 * PUT /api/profiles/me
 */
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const {
      headline,
      summary,
      location,
      phone,
      website,
      linkedin,
      github,
      languages,
      visibility,
      publicSlug,
    } = req.body;

    // Verificar se publicSlug já existe (se fornecido)
    if (publicSlug) {
      const existingSlug = await prisma.profile.findFirst({
        where: {
          publicSlug: publicSlug,
          userId: { not: userId },
        },
      });

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: 'Este slug já está em uso',
        });
      }
    }

    const updateData = {};
    if (headline !== undefined) updateData.headline = headline;
    if (summary !== undefined) updateData.summary = summary;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (languages !== undefined) updateData.languages = languages;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (publicSlug !== undefined) updateData.publicSlug = publicSlug;

    const profile = await prisma.profile.update({
      where: { userId: userId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: { profile },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
    });
  }
}

/**
 * Obter perfil público por slug
 * GET /api/profiles/slug/:slug
 */
export const getProfileBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { publicSlug: slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        experiences: {
          orderBy: { sortOrder: 'asc' },
        },
        educations: {
          orderBy: { sortOrder: 'asc' },
        },
        skills: {
          orderBy: { sortOrder: 'asc' },
        },
        certifications: {
          orderBy: { sortOrder: 'asc' },
        },
        projects: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!profile || profile.visibility === 'PRIVATE') {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado ou privado',
      });
    }

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error('Erro ao obter perfil público:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil',
    });
  }
}

// ========================================
// EXPERIÊNCIAS
// ========================================

/**
 * Adicionar experiência
 * POST /api/profiles/experiences
 */

export const addExperience = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado',
      });
    }

    const {
      jobTitle,
      company,
      location,
      startDate,
      endDate,
      isCurrent,
      description,
    } = req.body;

    const experience = await prisma.experience.create({
      data: {
        profileId: profile.id,
        jobTitle,
        company,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        description,
        sortOrder: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Experiência adicionada com sucesso',
      data: { experience },
    });
  } catch (error) {
    console.error('Erro ao adicionar experiência:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar experiência',
    });
  }
}

/**
 * Atualizar experiência
 * PUT /api/profiles/experiences/:id
 */
export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const experience = await prisma.experience.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experiência não encontrada',
      });
    }

    const {
      jobTitle,
      company,
      location,
      startDate,
      endDate,
      isCurrent,
      description,
    } = req.body;

    const updateData = {};
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isCurrent !== undefined) updateData.isCurrent = isCurrent;
    if (description !== undefined) updateData.description = description;

    const updatedExperience = await prisma.experience.update({
      where: { id: id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Experiência atualizada com sucesso',
      data: { experience: updatedExperience },
    });
  } catch (error) {
    console.error('Erro ao atualizar experiência:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar experiência',
    });
  }
}

/**
 * Apagar experiência
 * DELETE /api/profiles/experiences/:id
 */
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const experience = await prisma.experience.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experiência não encontrada',
      });
    }

    await prisma.experience.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Experiência removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar experiência:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar experiência',
    });
  }
}

// ========================================
// EDUCAÇÃO
// ========================================

/**
 * Adicionar formação
 * POST /api/profiles/education
 */
export const addEducation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const {
      degree,
      institution,
      fieldOfStudy,
      location,
      startDate,
      endDate,
      isCurrent,
      grade,
      description,
    } = req.body;

    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        degree,
        institution,
        fieldOfStudy,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        grade,
        description,
        sortOrder: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Formação adicionada com sucesso',
      data: { education },
    });
  } catch (error) {
    console.error('Erro ao adicionar formação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar formação',
    });
  }
}

/**
 * Atualizar formação
 * PUT /api/profiles/education/:id
 */
export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const education = await prisma.education.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Formação não encontrada',
      });
    }

    const {
      degree,
      institution,
      fieldOfStudy,
      location,
      startDate,
      endDate,
      isCurrent,
      grade,
      description,
    } = req.body;

    const updateData = {};
    if (degree !== undefined) updateData.degree = degree;
    if (institution !== undefined) updateData.institution = institution;
    if (fieldOfStudy !== undefined) updateData.fieldOfStudy = fieldOfStudy;
    if (location !== undefined) updateData.location = location;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isCurrent !== undefined) updateData.isCurrent = isCurrent;
    if (grade !== undefined) updateData.grade = grade;
    if (description !== undefined) updateData.description = description;

    const updatedEducation = await prisma.education.update({
      where: { id: id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Formação atualizada com sucesso',
      data: { education: updatedEducation },
    });
  } catch (error) {
    console.error('Erro ao atualizar formação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar formação',
    });
  }
}

/**
 * Apagar formação
 * DELETE /api/profiles/education/:id
 */
export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const education = await prisma.education.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Formação não encontrada',
      });
    }

    await prisma.education.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Formação removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar formação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar formação',
    });
  }
}

// ========================================
// COMPETÊNCIAS
// ========================================

/**
 * Adicionar competência
 * POST /api/profiles/skills
 */
export const addSkill = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const { name, category, level, yearsOfExp } = req.body;

    const skill = await prisma.skill.create({
      data: {
        profileId: profile.id,
        name,
        category,
        level: level || 3,
        yearsOfExp,
        sortOrder: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Competência adicionada com sucesso',
      data: { skill },
    });
  } catch (error) {
    console.error('Erro ao adicionar competência:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar competência',
    });
  }
}

/**
 * Atualizar competência
 * PUT /api/profiles/skills/:id
 */
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const skill = await prisma.skill.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Competência não encontrada',
      });
    }

    const { name, category, level, yearsOfExp } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (yearsOfExp !== undefined) updateData.yearsOfExp = yearsOfExp;

    const updatedSkill = await prisma.skill.update({
      where: { id: id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Competência atualizada com sucesso',
      data: { skill: updatedSkill },
    });
  } catch (error) {
    console.error('Erro ao atualizar competência:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar competência',
    });
  }
}

/**
 * Apagar competência
 * DELETE /api/profiles/skills/:id
 */
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const skill = await prisma.skill.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Competência não encontrada',
      });
    }

    await prisma.skill.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Competência removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar competência:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar competência',
    });
  }
}

// ========================================
// CERTIFICAÇÕES
// ========================================

/**
 * Adicionar certificação
 * POST /api/profiles/certifications
 */
export const addCertification = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const {
      name,
      issuingOrg,
      issueDate,
      expirationDate,
      credentialId,
      credentialUrl,
      doesNotExpire,
    } = req.body;

    const certification = await prisma.certification.create({
      data: {
        profileId: profile.id,
        name,
        issuingOrg,
        issueDate: new Date(issueDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        credentialId,
        credentialUrl,
        doesNotExpire: doesNotExpire || false,
        sortOrder: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Certificação adicionada com sucesso',
      data: { certification },
    });
  } catch (error) {
    console.error('Erro ao adicionar certificação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar certificação',
    });
  }
}

/**
 * Atualizar certificação
 * PUT /api/profiles/certifications/:id
 */
export const updateCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const certification = await prisma.certification.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certificação não encontrada',
      });
    }

    const updatedCertification = await prisma.certification.update({
      where: { id: id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Certificação atualizada com sucesso',
      data: { certification: updatedCertification },
    });
  } catch (error) {
    console.error('Erro ao atualizar certificação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar certificação',
    });
  }
}

/**
 * Apagar certificação
 * DELETE /api/profiles/certifications/:id
 */
export const deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const certification = await prisma.certification.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certificação não encontrada',
      });
    }

    await prisma.certification.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Certificação removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar certificação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar certificação',
    });
  }
}

// ========================================
// PROJETOS
// ========================================

/**
 * Adicionar projeto
 * POST /api/profiles/projects
 */
export const addProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const {
      name,
      description,
      role,
      startDate,
      endDate,
      isCurrent,
      url,
      technologies,
      highlights,
    } = req.body;

    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        name,
        description,
        role,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        url,
        technologies: technologies || [],
        highlights: highlights || [],
        sortOrder: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Projeto adicionado com sucesso',
      data: { project },
    });
  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar projeto',
    });
  }
}

/**
 * Atualizar projeto
 * PUT /api/profiles/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const project = await prisma.project.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: { project: updatedProject },
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar projeto',
    });
  }
}

/**
 * Apagar projeto
 * DELETE /api/profiles/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const project = await prisma.project.findFirst({
      where: {
        id: id,
        profileId: profile.id,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
      });
    }

    await prisma.project.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Projeto removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar projeto',
    });
  }
}


