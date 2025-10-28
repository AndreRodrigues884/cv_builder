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
    return {
      // Informações Pessoais
      name: profile?.user?.name || profile?.name || 'Nome',
      email: profile?.user?.email || profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',

      // Perfil
      headline: profile?.headline || '',
      summary: profile?.summary || cv?.summary || '',

      // CV Info
      title: cv?.title || 'Curriculum Vitae',
      language: cv?.language || 'PT',
      jobTargetTitle: cv?.jobTargetTitle || cv?.targetRole || '',
      jobTargetArea: cv?.jobTargetArea || '',

      // Experiências
      experiences: (profile?.experiences || []).map(exp => ({
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
      educations: (profile?.educations || []).map(edu => ({
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
      skills: (profile?.skills || []).map(skill => ({
        name: skill.name || skill,
        category: skill.category || '',
        level: skill.level || 0,
        yearsOfExp: skill.yearsOfExp || 0,
      })),

      // Certificações
      certifications: (profile?.certifications || []).map(cert => ({
        name: cert.name || '',
        issuingOrg: cert.issuingOrg || '',
        issueDate: this.formatDate(cert.issueDate),
        expirationDate: cert.doesNotExpire ? 'Sem expiração' : this.formatDate(cert.expirationDate),
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
      })),

      // Projetos
      projects: (profile?.projects || []).map(proj => ({
        name: proj.name || '',
        description: proj.description || '',
        role: proj.role || '',
        url: proj.url || '',
        technologies: proj.technologies || [],
        highlights: proj.highlights || [],
      })),

      // Idiomas
      languages: profile?.languages || [],

      // Metadata do template (cores, fontes, etc)
      templateColors: cv?.template?.metadata?.colors || {},
      templateFonts: cv?.template?.metadata?.fonts || {},
    };
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
            {{#if headline}}<h2>{{headline}}</h2>{{/if}}
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

          {{#hasItems experiences}}
          <section class="section">
            <h3>Experiência Profissional</h3>
            {{#each experiences}}
            <div class="item">
              <h4>{{jobTitle}}</h4>
              <p class="meta">{{company}} | {{startDate}} - {{endDate}}</p>
              {{#if description}}<p class="description">{{description}}</p>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/hasItems}}

          {{#hasItems educations}}
          <section class="section">
            <h3>Formação Académica</h3>
            {{#each educations}}
            <div class="item">
              <h4>{{degree}}</h4>
              <p class="meta">{{institution}} | {{startDate}} - {{endDate}}</p>
            </div>
            {{/each}}
          </section>
          {{/hasItems}}

          {{#hasItems skills}}
          <section class="section">
            <h3>Competências</h3>
            <div class="skills-grid">
              {{#each skills}}
              <span class="skill-item">{{name}}</span>
              {{/each}}
            </div>
          </section>
          {{/hasItems}}
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
          font-size: 32pt;
          color: #1F2937;
          margin-bottom: 0.5rem;
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
          gap: 1.5rem;
          flex-wrap: wrap;
          font-size: 10pt;
          color: #6B7280;
        }
        
        .section {
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }
        
        .section h3 {
          font-size: 16pt;
          color: #3B82F6;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .item {
          margin-bottom: 1.5rem;
          page-break-inside: avoid;
        }
        
        .item h4 {
          font-size: 12pt;
          color: #1F2937;
          margin-bottom: 0.25rem;
        }
        
        .meta {
          font-size: 10pt;
          color: #6B7280;
          margin-bottom: 0.5rem;
        }
        
        .description {
          font-size: 10pt;
          line-height: 1.6;
          color: #4B5563;
        }
        
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .skill-item {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #F3F4F6;
          border-radius: 0.25rem;
          font-size: 10pt;
          color: #1F2937;
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