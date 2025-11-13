import { defineStore } from 'pinia';
import * as profileApi from '../api/profile';
import { AuthState } from '../types/authInterface';
import { Certification, Education, Experience, Project, Skill } from '../types/profileInterface';
import { Profile } from '../types/userInterface';

export const useProfileStore = defineStore('user', {
  state: (): AuthState => ({
    user: null,
    profile: null, // 👈 adiciona isto
    billing: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),

  actions: {
    async getMe() {
      try {
        if (!this.accessToken) {
          this.user = null;
          this.profile = null;
          this.billing = null;
          return null;
        }

        const response = await profileApi.getMe(this.accessToken);
        const data = response.data.data;

        // 👇 guarda todos os dados recebidos
        this.user = data.user;
        this.profile = data.profile;
        this.billing = data.billing ?? null;

        return data;
      } catch (error) {
        console.error('Erro ao buscar utilizador logado:', error);
        this.user = null;
        this.profile = null;
        this.billing = null;
        return null;
      }
    },
    async updateProfile(profileData: Partial<Profile>) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.updateProfile(this.accessToken, profileData);

        if (!response.data.success) {
          console.warn('Falha ao atualizar perfil:', response.data.errors);

          const errors: { type: string; value: any; msg: string; path: string; location: string }[] =
            response.data.errors;

          alert(
            'Não foi possível atualizar o perfil:\n' +
            errors.map(e => `${e.path}: ${e.msg}`).join('\n')
          );
        } else {
          this.profile = response.data.data.profile;
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async addExperience(experienceData: Experience) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.addExperience(this.accessToken, experienceData);

        if (response.data.success) {
          // Atualiza o profile local adicionando a nova experiência
          if (this.profile && this.profile.experiences) {
            this.profile.experiences.push(response.data.data.experience);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao adicionar experiência:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async updateExperience(id: string, experienceData: Partial<Experience>) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.updateExperience(
          this.accessToken,
          id,
          experienceData
        );

        if (response.data.success) {
          // Atualiza a experiência no profile local
          if (this.profile && this.profile.experiences) {
            const index = this.profile.experiences.findIndex(
              (exp: any) => exp.id === id
            );
            if (index !== -1) {
              this.profile.experiences[index] = response.data.data.experience;
            }
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao atualizar experiência:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async deleteExperience(id: string) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.deleteExperience(this.accessToken, id);

        if (response.data.success) {
          // Remove a experiência do profile local
          if (this.profile && this.profile.experiences) {
            this.profile.experiences = this.profile.experiences.filter(
              (exp: any) => exp.id !== id
            );
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao apagar experiência:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async addEducation(educationData: Education) {
      try {
        if (!this.accessToken) throw new Error('utilizador não autenticado');

        const response = await profileApi.addEducation(this.accessToken, educationData);

        if (response.data.success) {
          if (this.profile && this.profile.educations) {
            this.profile.educations.push(response.data.data.education);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao adicionar formação:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async updateEducation(id: string, educationData: Partial<Education>) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.updateEducation(
          this.accessToken,
          id,
          educationData
        );

        if (response.data.success) {
          // Atualiza a educação no profile local
          if (this.profile && this.profile.educations) {
            const index = this.profile.educations.findIndex(
              (edu: any) => edu.id === id
            );
            if (index !== -1) {
              this.profile.educations[index] = response.data.data.education;
            }
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao atualizar formação:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async deleteEducation(id: string) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.deleteEducation(this.accessToken, id);

        if (response.data.success) {
          // Remove a educação do profile local
          if (this.profile && this.profile.educations) {
            this.profile.educations = this.profile.educations.filter(
              (edu: any) => edu.id !== id
            );
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao apagar formação:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async addSkill(skillData: Skill) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.addSkill(this.accessToken, skillData);

        if (response.data.success) {
          // Atualiza o profile local adicionando a nova skill
          if (this.profile && this.profile.skills) {
            this.profile.skills.push(response.data.data.skill);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao adicionar competência:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    async updateSkill(id: string, skillData: Partial<Skill>) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.updateSkill(this.accessToken, id, skillData);

        if (response.data.success) {
          // Atualiza a skill no profile local
          if (this.profile && this.profile.skills) {
            const index = this.profile.skills.findIndex((s: any) => s.id === id);
            if (index !== -1) {
              this.profile.skills[index] = response.data.data.skill;
            }
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao atualizar competência:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async deleteSkill(id: string) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.deleteSkill(this.accessToken, id);

        if (response.data.success) {
          // Remove a skill do profile local
          if (this.profile && this.profile.skills) {
            this.profile.skills = this.profile.skills.filter((s: any) => s.id !== id);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao apagar competência:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async addCertification(certificationData: Certification) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.addCertification(this.accessToken, certificationData);

        if (response.data.success) {
          // Atualiza o profile local adicionando a nova certificação
          if (this.profile && this.profile.certifications) {
            this.profile.certifications.push(response.data.data.certification);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao adicionar certificação:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async updateCertification(id: string, certificationData: Certification) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.updateCertification(
          this.accessToken,
          id,
          certificationData
        );

        if (response.data.success) {
          // Atualiza a certificação no profile local
          if (this.profile && this.profile.certifications) {
            const index = this.profile.certifications.findIndex(
              (c: any) => c.id === id
            );
            if (index !== -1) {
              this.profile.certifications[index] = response.data.data.certification;
            }
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao atualizar certificação:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async deleteCertification(id: string) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.deleteCertification(this.accessToken, id);

        if (response.data.success) {
          // Remove a certificação do profile local
          if (this.profile && this.profile.certifications) {
            this.profile.certifications = this.profile.certifications.filter(
              (c: any) => c.id !== id
            );
          }
        }

        return response.data;
      } catch (error: any) {
        console.error(
          'Erro ao apagar certificação:',
          error.response?.data || error.message
        );
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async addProject(projectData: Project) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.addProject(this.accessToken, projectData);

        if (response.data.success) {
          // Atualiza o profile local adicionando o novo projeto
          if (this.profile && this.profile.projects) {
            this.profile.projects.push(response.data.data.project);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao adicionar projeto:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
    async updateProject(id: string, projectData: Project) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.updateProject(
          this.accessToken,
          id,
          projectData
        );

        if (response.data.success) {
          // Atualiza o projeto no profile local
          if (this.profile && this.profile.projects) {
            const index = this.profile.projects.findIndex((p: any) => p.id === id);
            if (index !== -1) {
              this.profile.projects[index] = response.data.data.project;
            }
          }
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao atualizar projeto:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    async deleteProject(id: string) {
      try {
        if (!this.accessToken) throw new Error('Utilizador não autenticado');

        const response = await profileApi.deleteProject(this.accessToken, id);

        if (response.data.success) {
          // Remove o projeto do profile local
          if (this.profile && this.profile.projects) {
            this.profile.projects = this.profile.projects.filter((p: any) => p.id !== id);
          }
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao apagar projeto:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },
  },
});
