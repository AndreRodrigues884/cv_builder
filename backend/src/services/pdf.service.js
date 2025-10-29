// backend/src/services/pdf.service.js - CORRIGIDO

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  /**
   * Gerar PDF a partir de um CV e Template
   */
  static async generatePDF(cv, profile) {
    try {
      console.log('📄 [PDFService] Gerando PDF para CV:', cv.id);
      console.log('📦 [PDFService] Profile:', {
        hasUser: !!profile?.user,
        userName: profile?.user?.name,
        hasExperiences: !!profile?.experiences,
        experiencesCount: profile?.experiences?.length || 0,
      });

      // 1. Carregar template
      const template = cv.template;
      console.log('🎨 [PDFService] Template:', template?.name || 'default');
      
      const templateHTML = await this.loadTemplate(template);

      // 2. Preparar dados do CV
      const cvData = this.prepareCVData(cv, profile);
      console.log('📋 [PDFService] Dados preparados:', {
        name: cvData.name,
        hasExperiences: cvData.experiences?.length > 0,
        hasEducations: cvData.educations?.length > 0,
      });

      // 3. Compilar template com dados
      const html = this.compileTemplate(templateHTML, cvData, template);
      console.log('✅ [PDFService] HTML compilado, tamanho:', html.length);

      // 4. Gerar PDF com puppeteer
      const pdf = await this.convertHTMLToPDF(html);
      console.log('✅ [PDFService] PDF gerado, tamanho:', pdf.length, 'bytes');

      return pdf;
    } catch (error) {
      console.error('❌ [PDFService] Erro ao gerar PDF:', error);
      throw new Error('Erro ao gerar PDF: ' + error.message);
    }
  }

  /**
   * Carregar template HTML/CSS
   */
  static async loadTemplate(template) {
    try {
      console.log('📁 [PDFService] Carregando template...');
      
      // Se template existe e tem metadata
      if (template?.metadata?.html && template?.metadata?.css) {
        console.log('✅ [PDFService] Usando template do BD');
        return {
          html: template.metadata.html,
          css: template.metadata.css,
          metadata: template.metadata,
        };
      }

      // Tentar carregar de ficheiro
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
          console.log('⚠️ [PDFService] Template de ficheiro não encontrado, usando default');
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
    // Usar contentJson se existir, senão usar dados do profile
    const contentJson = cv?.contentJson || {};
    
    const cvData = {
      // Informações Pessoais (prioriza contentJson, depois profile, depois user)
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

      // Experiências (prioriza contentJson)
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

      // Educação (prioriza contentJson)
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

      // Competências (prioriza contentJson)
      skills: (contentJson?.skills || profile?.skills || []).map(skill => ({
        name: skill.name || skill,
        category: skill.category || '',
        level: skill.level || 0,
        yearsOfExp: skill.yearsOfExp || 0,
      })),

      // Certificações (prioriza contentJson)
      certifications: (contentJson?.certifications || profile?.certifications || []).map(cert => ({
        name: cert.name || '',
        issuingOrg: cert.issuingOrg || '',
        issueDate: this.formatDate(cert.issueDate),
        expirationDate: cert.doesNotExpire ? 'Sem expiração' : this.formatDate(cert.expirationDate),
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
      })),

      // Projetos (prioriza contentJson)
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

      // Metadata do template (cores, fontes, etc)
      templateColors: cv?.template?.metadata?.colors || {},
      templateFonts: cv?.template?.metadata?.fonts || {},
    };

    console.log('📋 [PDFService] cvData final:', {
      name: cvData.name,
      email: cvData.email,
      phone: cvData.phone,
      summary: cvData.summary,
      experiencesCount: cvData.experiences.length,
      educationsCount: cvData.educations.length,
      skillsCount: cvData.skills.length,
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
              font-family: ${cvData.templateFonts?.body || 'Arial, sans-serif'};
              font-size: 11pt;
              line-height: 1.5;
              color: ${cvData.templateColors?.text || '#1F2937'};
              background: white;
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

      console.log('✅ [PDFService] HTML final compilado');
      return fullHTML;
    } catch (error) {
      console.error('❌ [PDFService] Erro ao compilar template:', error);
      throw error;
    }
  }

  /**
   * Converter HTML para PDF com Puppeteer
   */
  static async convertHTMLToPDF(html) {
    let browser;

    try {
      console.log('🚀 [PDFService] Iniciando Puppeteer...');
      
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      console.log('✅ [PDFService] Puppeteer iniciado');

      const page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({
        width: 1200,
        height: 1600,
      });

      console.log('📄 [PDFService] Carregando HTML...');
      
      // Carregar HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      console.log('🖨️ [PDFService] Gerando PDF...');

      // Gerar PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
        preferCSSPageSize: false,
      });

      console.log('✅ [PDFService] PDF gerado com sucesso');

      return pdf;
    } catch (error) {
      console.error('❌ [PDFService] Erro no Puppeteer:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 [PDFService] Puppeteer fechado');
      }
    }
  }

  /**
   * Helpers do Handlebars
   */
  static registerHandlebarsHelpers() {
    // Evitar registar múltiplas vezes
    if (handlebars.helpers.hasItems) return;

    // Helper para verificar se array tem items
    handlebars.registerHelper('hasItems', function (array) {
      return Array.isArray(array) && array.length > 0;
    });

    // Helper para loop com index
    handlebars.registerHelper('eachWithIndex', function (array, options) {
      let result = '';
      if (Array.isArray(array)) {
        array.forEach((item, index) => {
          result += options.fn({ ...item, index });
        });
      }
      return result;
    });

    // Helper para comparação
    handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    // Helper para skill level (estrelas)
    handlebars.registerHelper('skillStars', function (level) {
      const stars = '★'.repeat(level || 0) + '☆'.repeat(5 - (level || 0));
      return new handlebars.SafeString(stars);
    });

    // Helper para primeira letra maiúscula
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
              {{#if linkedin}}<span>🔗 {{linkedin}}</span>{{/if}}
              {{#if github}}<span>💻 {{github}}</span>{{/if}}
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
              <p class="meta">{{this.company}}{{#if this.location}} • {{this.location}}{{/if}}{{#if this.startDate}} | {{this.startDate}}{{/if}}{{#if this.endDate}} - {{this.endDate}}{{/if}}</p>
              {{#if this.description}}<p class="description">{{this.description}}</p>{{/if}}
              {{#if this.achievements}}
              {{#if this.achievements.length}}
              <ul class="achievements">
                {{#each this.achievements}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}
              {{/if}}
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
              <p class="meta">{{this.institution}}{{#if this.location}} • {{this.location}}{{/if}}{{#if this.startDate}} | {{this.startDate}}{{/if}}{{#if this.endDate}} - {{this.endDate}}{{/if}}</p>
              {{#if this.grade}}<p class="grade">Nota: {{this.grade}}</p>{{/if}}
              {{#if this.description}}<p class="description">{{this.description}}</p>{{/if}}
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

          {{#if certifications}}
          {{#if certifications.length}}
          <section class="section">
            <h3>Certificações</h3>
            {{#each certifications}}
            <div class="item">
              <h4>{{this.name}}</h4>
              <p class="meta">{{this.issuingOrg}}{{#if this.issueDate}} | {{this.issueDate}}{{/if}}{{#if this.expirationDate}} - {{this.expirationDate}}{{/if}}</p>
              {{#if this.credentialId}}<p class="description">ID: {{this.credentialId}}</p>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          {{/if}}

          {{#if projects}}
          {{#if projects.length}}
          <section class="section">
            <h3>Projetos</h3>
            {{#each projects}}
            <div class="item">
              <h4>{{this.name}}</h4>
              <p class="meta">{{this.role}}{{#if this.url}} • {{this.url}}{{/if}}</p>
              {{#if this.description}}<p class="description">{{this.description}}</p>{{/if}}
              {{#if this.technologies}}
              {{#if this.technologies.length}}
              <p class="tech"><strong>Tecnologias:</strong> {{#each this.technologies}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>
              {{/if}}
              {{/if}}
            </div>
            {{/each}}
          </section>
          {{/if}}
          {{/if}}
        </div>
      `,
      css: `
        @page {
          size: A4;
          margin: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
        }
        
        .cv-container {
          width: 21cm;
          min-height: 29.7cm;
          margin: 0 auto;
          padding: 1.5cm 2cm;
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
          font-weight: bold;
        }
        
        .cv-header h2 {
          font-size: 14pt;
          color: #3B82F6;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        
        .contact {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 9pt;
          color: #6B7280;
        }
        
        .contact span {
          white-space: nowrap;
        }
        
        .section {
          margin-bottom: 1.5rem;
          page-break-inside: avoid;
        }
        
        .section h3 {
          font-size: 14pt;
          color: #3B82F6;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 0.4rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        
        .item {
          margin-bottom: 1.2rem;
          page-break-inside: avoid;
        }
        
        .item h4 {
          font-size: 11pt;
          color: #1F2937;
          margin-bottom: 0.2rem;
          font-weight: bold;
        }
        
        .meta {
          font-size: 9pt;
          color: #6B7280;
          margin-bottom: 0.4rem;
          font-style: italic;
        }
        
        .grade {
          font-size: 9pt;
          color: #059669;
          margin-bottom: 0.4rem;
        }
        
        .description {
          font-size: 9.5pt;
          line-height: 1.5;
          color: #4B5563;
          margin-bottom: 0.4rem;
          text-align: justify;
        }
        
        .achievements {
          margin-left: 1.2rem;
          margin-top: 0.4rem;
          margin-bottom: 0.4rem;
        }
        
        .achievements li {
          font-size: 9.5pt;
          line-height: 1.5;
          color: #4B5563;
          margin-bottom: 0.2rem;
        }
        
        .tech {
          font-size: 9pt;
          color: #6B7280;
          margin-top: 0.3rem;
        }
        
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        
        .skill-item {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 0.3rem;
          font-size: 9pt;
          color: #1E40AF;
          font-weight: 500;
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