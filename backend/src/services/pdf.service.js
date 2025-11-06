// backend/src/services/pdf.service.js - ATUALIZADO PARA TEMPLATES

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {

  static async generatePDF(htmlContent, options = {}) {
    let browser;
    try {
      console.log('🚀 Iniciando geração de PDF...');

      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--force-color-profile=srgb',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--no-default-browser-check',
          '--no-zygote',
          '--single-process',
        ],
      });

      console.log('✅ Browser iniciado');

      const page = await browser.newPage();
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      console.log('📄 Gerando PDF...');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        ...options,
      });

      console.log('✅ PDF gerado com sucesso');
      
      await browser.close();
      return pdfBuffer;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error('Erro ao fechar browser:', e);
        }
      }
      throw error;
    }
  }

  /**
   * Carregar template HTML/CSS da BD
   */
  static async loadTemplate(template) {
    try {
      console.log('📁 [PDFService] Carregando template...');
      
      // Prioridade 1: HTML/CSS gerado automaticamente (da imagem)
      if (template?.generatedHTML && template?.generatedCSS) {
        console.log('✅ [PDFService] Usando template gerado da imagem');
        return {
          html: template.generatedHTML,
          css: template.generatedCSS,
          metadata: template.layoutData || template.metadata || {},
        };
      }

      // Prioridade 2: HTML/CSS manual (metadata)
      if (template?.metadata?.html && template?.metadata?.css) {
        console.log('✅ [PDFService] Usando template do metadata');
        return {
          html: template.metadata.html,
          css: template.metadata.css,
          metadata: template.metadata,
        };
      }

      // Prioridade 3: Template de ficheiro (legado)
      if (template?.slug) {
        const templatePath = path.join(__dirname, '..', 'templates', template.slug);
        
        try {
          await fs.access(templatePath);
          const htmlPath = path.join(templatePath, 'template.html');
          const cssPath = path.join(templatePath, 'styles.css');

          const html = await fs.readFile(htmlPath, 'utf-8');
          const css = await fs.readFile(cssPath, 'utf-8');

          console.log('✅ [PDFService] Template carregado de ficheiro');
          return { html, css, metadata: template.metadata || {} };
        } catch (err) {
          console.log('⚠️ [PDFService] Template de ficheiro não encontrado');
        }
      }

      // Fallback: template genérico
      console.log('📄 [PDFService] Usando template default');
      return this.getDefaultTemplate();
    } catch (error) {
      console.error('❌ [PDFService] Erro ao carregar template:', error);
      return this.getDefaultTemplate();
    }
  }

  /**
   * Preparar dados do CV para o template
   */
  static prepareCVData(cv, profile) {
    const contentJson = cv?.contentJson || {};
    
    const cvData = {
      // Informações Pessoais
      name: contentJson?.personalInfo?.name || profile?.user?.name || profile?.name || 'Nome',
      email: contentJson?.personalInfo?.email || profile?.user?.email || profile?.email || '',
      phone: contentJson?.personalInfo?.phone || profile?.phone || '',
      location: contentJson?.personalInfo?.location || profile?.location || '',
      website: contentJson?.personalInfo?.website || profile?.website || '',
      linkedin: contentJson?.personalInfo?.linkedin || profile?.linkedin || '',
      github: contentJson?.personalInfo?.github || profile?.github || '',

      // Perfil
      headline: profile?.headline || contentJson?.headline || '',
      summary: contentJson?.summary || profile?.summary || cv?.summary || '',

      // CV Info
      title: cv?.title || 'Curriculum Vitae',
      language: cv?.language || 'PT',
      jobTargetTitle: cv?.jobTargetTitle || cv?.targetRole || '',
      jobTargetArea: cv?.jobTargetArea || '',

      // Experiências
      experiences: (contentJson?.experiences || profile?.experiences || []).map(exp => ({
        jobTitle: exp.jobTitle || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: this.formatDate(exp.startDate),
        endDate: exp.isCurrent ? 'Atual' : this.formatDate(exp.endDate),
        description: exp.description || '',
        achievements: exp.achievements || [],
        skills: exp.skills || [],
      })),

      // Educação
      educations: (contentJson?.educations || profile?.educations || []).map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        location: edu.location || '',
        startDate: this.formatDate(edu.startDate),
        endDate: edu.isCurrent ? 'Atual' : this.formatDate(edu.endDate),
        grade: edu.grade || '',
        description: edu.description || '',
      })),

      // Competências
      skills: (contentJson?.skills || profile?.skills || []).map(skill => ({
        name: skill.name || skill,
        category: skill.category || '',
        level: skill.level || 0,
        yearsOfExp: skill.yearsOfExp || 0,
      })),

      // Certificações
      certifications: (contentJson?.certifications || profile?.certifications || []).map(cert => ({
        name: cert.name || '',
        issuingOrg: cert.issuingOrg || '',
        issueDate: this.formatDate(cert.issueDate),
        expirationDate: cert.doesNotExpire ? 'Sem expiração' : this.formatDate(cert.expirationDate),
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
      })),

      // Projetos
      projects: (contentJson?.projects || profile?.projects || []).map(proj => ({
        name: proj.name || '',
        description: proj.description || '',
        role: proj.role || '',
        url: proj.url || '',
        technologies: proj.technologies || [],
        highlights: proj.highlights || [],
      })),

      // Idiomas
      languages: contentJson?.languages || profile?.languages || [],

      // Metadata do template (cores, fontes do layoutData)
      templateColors: cv?.template?.layoutData?.colors || cv?.template?.metadata?.colors || {},
      templateFonts: cv?.template?.layoutData?.fonts || cv?.template?.metadata?.fonts || {},
    };

    console.log('📋 [PDFService] cvData preparado:', {
      name: cvData.name,
      experiencesCount: cvData.experiences.length,
      educationsCount: cvData.educations.length,
      skillsCount: cvData.skills.length,
      hasColors: !!Object.keys(cvData.templateColors).length,
      hasFonts: !!Object.keys(cvData.templateFonts).length,
    });

    return cvData;
  }

  /**
   * Compilar template com Handlebars
   */
  static compileTemplate(templateData, cvData, template) {
    try {
      console.log('🔧 [PDFService] Compilando template...');
      
      // Registar helpers do Handlebars
      this.registerHandlebarsHelpers();

      // Compilar HTML
      const htmlTemplate = handlebars.compile(templateData.html);
      const compiledHTML = htmlTemplate(cvData);

      // Injetar CSS
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="${cvData.language}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${cvData.title}</title>
          <style>
            /* Reset CSS */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: ${cvData.templateFonts?.body || 'Inter, Arial, sans-serif'};
              font-size: 11pt;
              line-height: 1.5;
              color: ${cvData.templateColors?.text || '#1F2937'};
              background: ${cvData.templateColors?.background || 'white'};
            }
            
            /* Template CSS */
            ${templateData.css}
            
            /* Print-specific styles */
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${compiledHTML}
        </body>
        </html>
      `;

      console.log('✅ [PDFService] HTML compilado com sucesso');
      return fullHTML;
    } catch (error) {
      console.error('❌ [PDFService] Erro ao compilar template:', error);
      throw error;
    }
  }

  /**
   * Helpers do Handlebars
   */
  static registerHandlebarsHelpers() {
    if (handlebars.helpers.hasItems) return;

    handlebars.registerHelper('hasItems', function (array) {
      return Array.isArray(array) && array.length > 0;
    });

    handlebars.registerHelper('eachWithIndex', function (array, options) {
      let result = '';
      if (Array.isArray(array)) {
        array.forEach((item, index) => {
          result += options.fn({ ...item, index });
        });
      }
      return result;
    });

    handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    handlebars.registerHelper('skillStars', function (level) {
      const stars = '★'.repeat(level || 0) + '☆'.repeat(5 - (level || 0));
      return new handlebars.SafeString(stars);
    });

    handlebars.registerHelper('capitalize', function (str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
  }

  /**
   * Template padrão (fallback)
   */
  static getDefaultTemplate() {
    return {
      html: `
        <div class="cv-container">
          <header class="cv-header">
            <h1>{{name}}</h1>
            {{#if jobTargetTitle}}<h2>{{jobTargetTitle}}</h2>{{/if}}
            <div class="contact">
              {{#if email}}<span>✉️ {{email}}</span>{{/if}}
              {{#if phone}}<span>📱 {{phone}}</span>{{/if}}
              {{#if location}}<span>📍 {{location}}</span>{{/if}}
            </div>
          </header>

          {{#if summary}}
          <section class="section">
            <h3>Sobre Mim</h3>
            <p>{{summary}}</p>
          </section>
          {{/if}}

          {{#if experiences}}
          {{#if experiences.length}}
          <section class="section">
            <h3>Experiência Profissional</h3>
            {{#each experiences}}
            <div class="item">
              <h4>{{this.jobTitle}}</h4>
              <p class="meta">{{this.company}} | {{this.startDate}} - {{this.endDate}}</p>
              {{#if this.description}}<p class="description">{{this.description}}</p>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          {{/if}}

          {{#if educations}}
          {{#if educations.length}}
          <section class="section">
            <h3>Formação Académica</h3>
            {{#each educations}}
            <div class="item">
              <h4>{{this.degree}}</h4>
              <p class="meta">{{this.institution}} | {{this.startDate}} - {{this.endDate}}</p>
            </div>
            {{/each}}
          </section>
          {{/if}}
          {{/if}}

          {{#if skills}}
          {{#if skills.length}}
          <section class="section">
            <h3>Competências</h3>
            <div class="skills-grid">
              {{#each skills}}
              <span class="skill-item">{{this.name}}</span>
              {{/each}}
            </div>
          </section>
          {{/if}}
          {{/if}}
        </div>
      `,
      css: `
        .cv-container {
          max-width: 21cm;
          margin: 0 auto;
          padding: 2cm;
          background: white;
        }
        
        .cv-header {
          text-align: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .cv-header h1 {
          font-size: 28pt;
          color: #1F2937;
          margin-bottom: 0.5rem;
        }
        
        .contact {
          display: flex;
          justify-content: center;
          gap: 1rem;
          font-size: 9pt;
          color: #6B7280;
        }
        
        .section {
          margin-bottom: 1.5rem;
        }
        
        .section h3 {
          font-size: 14pt;
          color: #3B82F6;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 0.4rem;
          margin-bottom: 1rem;
        }
        
        .item {
          margin-bottom: 1.2rem;
        }
        
        .item h4 {
          font-size: 11pt;
          color: #1F2937;
          margin-bottom: 0.2rem;
        }
        
        .meta {
          font-size: 9pt;
          color: #6B7280;
          margin-bottom: 0.4rem;
        }
        
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        
        .skill-item {
          padding: 0.4rem 0.8rem;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 0.3rem;
          font-size: 9pt;
          color: #1E40AF;
        }
      `,
      metadata: {},
    };
  }

  /**
   * Formatar data
   */
  static formatDate(date) {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${year}`;
    } catch {
      return '';
    }
  }
}

export default PDFService;