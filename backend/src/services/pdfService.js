// src/services/pdf.service.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

class PDFService {
  /**
   * Gerar PDF a partir de um CV e Template
   */
  static async generatePDF(cv, profile) {
    try {
      console.log('📄 Gerando PDF para CV:', cv.id);

      // 1. Carregar template
      const template = cv.template;
      const templateHTML = await this.loadTemplate(template);

      // 2. Preparar dados do CV
      const cvData = this.prepareCVData(cv, profile);

      // 3. Compilar template com dados
      const html = this.compileTemplate(templateHTML, cvData, template);

      // 4. Gerar PDF com puppeteer
      const pdf = await this.convertHTMLToPDF(html);

      console.log('✅ PDF gerado com sucesso');
      return pdf;
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw new Error('Erro ao gerar PDF: ' + error.message);
    }
  }

  /**
   * Carregar template HTML/CSS
   */
  static async loadTemplate(template) {
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        template.slug
      );

      // Verificar se template existe em ficheiros
      const templateExists = await fs.access(templatePath)
        .then(() => true)
        .catch(() => false);

      if (templateExists) {
        // Carregar de ficheiro
        const htmlPath = path.join(templatePath, 'template.html');
        const cssPath = path.join(templatePath, 'styles.css');

        const html = await fs.readFile(htmlPath, 'utf-8');
        const css = await fs.readFile(cssPath, 'utf-8');

        return { html, css, metadata: template.metadata };
      } else {
        // Usar template da BD (metadata)
        if (template.metadata?.html && template.metadata?.css) {
          return {
            html: template.metadata.html,
            css: template.metadata.css,
            metadata: template.metadata,
          };
        } else {
          // Fallback: template genérico
          return this.getDefaultTemplate();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      return this.getDefaultTemplate();
    }
  }

  /**
   * Preparar dados do CV para o template
   */
  static prepareCVData(cv, profile) {
    return {
      // Informações Pessoais
      name: profile.user?.name || 'Nome',
      email: profile.user?.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      website: profile.website || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',

      // Perfil
      headline: profile.headline || '',
      summary: profile.summary || '',

      // CV Info
      title: cv.title || 'Curriculum Vitae',
      language: cv.language || 'PT',
      jobTargetTitle: cv.jobTargetTitle || '',
      jobTargetArea: cv.jobTargetArea || '',

      // Experiências
      experiences: (profile.experiences || []).map(exp => ({
        jobTitle: exp.jobTitle,
        company: exp.company,
        location: exp.location,
        startDate: this.formatDate(exp.startDate),
        endDate: exp.isCurrent ? 'Atual' : this.formatDate(exp.endDate),
        description: exp.description,
        achievements: exp.achievements || [],
        skills: exp.skills || [],
      })),

      // Educação
      educations: (profile.educations || []).map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        fieldOfStudy: edu.fieldOfStudy,
        location: edu.location,
        startDate: this.formatDate(edu.startDate),
        endDate: edu.isCurrent ? 'Atual' : this.formatDate(edu.endDate),
        grade: edu.grade,
        description: edu.description,
      })),

      // Competências
      skills: (profile.skills || []).map(skill => ({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        yearsOfExp: skill.yearsOfExp,
      })),

      // Certificações
      certifications: (profile.certifications || []).map(cert => ({
        name: cert.name,
        issuingOrg: cert.issuingOrg,
        issueDate: this.formatDate(cert.issueDate),
        expirationDate: cert.doesNotExpire ? 'Sem expiração' : this.formatDate(cert.expirationDate),
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
      })),

      // Projetos
      projects: (profile.projects || []).map(proj => ({
        name: proj.name,
        description: proj.description,
        role: proj.role,
        url: proj.url,
        technologies: proj.technologies || [],
        highlights: proj.highlights || [],
      })),

      // Idiomas
      languages: profile.languages || [],

      // Metadata do template (cores, fontes, etc)
      templateColors: cv.template.metadata?.colors || {},
      templateFonts: cv.template.metadata?.fonts || {},
    };
  }

  /**
   * Compilar template com Handlebars
   */
  static compileTemplate(templateData, cvData, template) {
    try {
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

      return fullHTML;
    } catch (error) {
      console.error('Erro ao compilar template:', error);
      throw error;
    }
  }

  /**
   * Converter HTML para PDF com Puppeteer
   */
  static async convertHTMLToPDF(html) {
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({
        width: 1200,
        height: 1600,
      });

      // Carregar HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Gerar PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm',
        },
        preferCSSPageSize: true,
      });

      return pdf;
    } catch (error) {
      console.error('Erro no Puppeteer:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Helpers do Handlebars
   */
  static registerHandlebarsHelpers() {
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
              {{#if email}}<p>✉️ {{email}}</p>{{/if}}
              {{#if phone}}<p>📱 {{phone}}</p>{{/if}}
              {{#if location}}<p>📍 {{location}}</p>{{/if}}
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
              <p class="company">{{company}} | {{startDate}} - {{endDate}}</p>
              {{#if description}}<p>{{description}}</p>{{/if}}
              {{#hasItems achievements}}
              <ul>
                {{#each achievements}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/hasItems}}
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
              <p class="company">{{institution}} | {{startDate}} - {{endDate}}</p>
              {{#if grade}}<p>Nota: {{grade}}</p>{{/if}}
            </div>
            {{/each}}
          </section>
          {{/hasItems}}

          {{#hasItems skills}}
          <section class="section">
            <h3>Competências</h3>
            <div class="skills-grid">
              {{#each skills}}
              <div class="skill-item">
                <span class="skill-name">{{name}}</span>
                {{#if level}}<span class="skill-level">{{skillStars level}}</span>{{/if}}
              </div>
              {{/each}}
            </div>
          </section>
          {{/hasItems}}
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
          gap: 2rem;
          flex-wrap: wrap;
          font-size: 10pt;
          color: #6B7280;
        }
        
        .section {
          margin-bottom: 2rem;
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
        }
        
        .item h4 {
          font-size: 12pt;
          color: #1F2937;
          margin-bottom: 0.25rem;
        }
        
        .company {
          font-size: 10pt;
          color: #6B7280;
          margin-bottom: 0.5rem;
        }
        
        .item p {
          font-size: 10pt;
          line-height: 1.6;
          color: #4B5563;
        }
        
        .item ul {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
        }
        
        .item li {
          font-size: 10pt;
          line-height: 1.6;
          color: #4B5563;
          margin-bottom: 0.25rem;
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        
        .skill-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #F3F4F6;
          border-radius: 0.25rem;
        }
        
        .skill-name {
          font-size: 10pt;
          color: #1F2937;
        }
        
        .skill-level {
          font-size: 10pt;
          color: #3B82F6;
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
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  }
}

module.exports = PDFService;