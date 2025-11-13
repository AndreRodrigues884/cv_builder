// backend/src/services/pdf.service.js
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  /**
   * Gera PDF a partir de HTML pronto
   */
  static async generatePDF(htmlContent, options = {}) {
    let browser;
    try {
      console.log('🚀 Iniciando Puppeteer...')
      console.log('📝 Tamanho do HTML:', htmlContent.length, 'caracteres')

      // Log do HTML (primeiros 500 chars)
      console.log('HTML preview:', htmlContent.substring(0, 500))

      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      console.log('✅ Browser iniciado')

      const page = await browser.newPage();

      console.log('📄 Setando conteúdo HTML...')
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      console.log('🖨️ Gerando PDF...')
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        ...options,
      });

      console.log('✅ PDF gerado! Tamanho:', pdfBuffer.length, 'bytes')

      await browser.close();

      // Verificar se o buffer não está vazio
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF buffer está vazio!')
      }

      return pdfBuffer;
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error)
      console.error('Stack:', error.stack)
      if (browser) {
        try {
          await browser.close()
        } catch (e) {
          console.error('Erro ao fechar browser:', e)
        }
      }
      throw error;
    }
  }

  /**
   * Carrega HTML/CSS do template
   */
  static async loadTemplate(template) {
    if (!template) return this.getDefaultTemplate();

    if (template.generatedHTML && template.generatedCSS) {
      console.log('🟢 Usando template gerado');
      return { html: template.generatedHTML, css: template.generatedCSS };
    }
    if (template.metadata?.html && template.metadata?.css) {
      console.log('🟡 Usando template via metadata');
      return { html: template.metadata.html, css: template.metadata.css };
    }
    if (template.slug) {
      console.log('🟠 Tentando carregar template do filesystem');
    }
    console.log('🔴 Usando template default');

    // 3️⃣ Fallback para arquivo
    if (template.slug) {
      try {
        const templatePath = path.join(__dirname, '..', 'templates', template.slug);
        await fs.access(templatePath);
        const html = await fs.readFile(path.join(templatePath, 'template.html'), 'utf-8');
        const css = await fs.readFile(path.join(templatePath, 'styles.css'), 'utf-8');
        return { html, css };
      } catch {
        console.warn('⚠️ Template de arquivo não encontrado, usando default');
      }
    }

    return this.getDefaultTemplate();
  }

  /**
   * Prepara dados do CV + profile para Handlebars
   */
  static prepareCVData(cv, profile) {
    try {
      console.log('📊 Preparando dados do CV...')
      console.log('CV ID:', cv?.id)
      console.log('Profile ID:', profile?.id)

      const content = cv?.contentJson || {};

      const cvData = {
        name: content.personalInfo?.name || profile?.user?.name || profile?.name || 'Nome Não Definido',
        email: content.personalInfo?.email || profile?.user?.email || profile?.email || '',
        phone: content.personalInfo?.phone || profile?.phone || '',
        location: content.personalInfo?.location || profile?.location || '',
        linkedin: content.personalInfo?.linkedin || profile?.linkedin || '',
        github: content.personalInfo?.github || profile?.github || '',
        website: content.personalInfo?.website || profile?.website || '',

        summary: content.summary || profile?.summary || '',

        experiences: (content.experiences || profile?.experiences || []).map(exp => ({
          jobTitle: exp.jobTitle || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: this.formatDate(exp.startDate),
          endDate: exp.isCurrent ? 'Atual' : this.formatDate(exp.endDate),
          description: exp.description || '',
          achievements: exp.achievements || [],
          skills: exp.skills || []
        })),

        educations: (content.educations || profile?.educations || []).map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          location: edu.location || '',
          startDate: this.formatDate(edu.startDate),
          endDate: edu.isCurrent ? 'Atual' : this.formatDate(edu.endDate),
          grade: edu.grade || '',
          description: edu.description || ''
        })),

        skills: (content.skills || profile?.skills || []).map(skill => ({
          name: typeof skill === 'string' ? skill : (skill.name || ''),
          category: typeof skill === 'object' ? skill.category : '',
          level: typeof skill === 'object' ? skill.level : 0
        })),

        projects: (content.projects || profile?.projects || []).map(proj => ({
          name: proj.name || '',
          description: proj.description || '',
          role: proj.role || '',
          url: proj.url || '',
          technologies: proj.technologies || []
        })),

        certifications: (content.certifications || profile?.certifications || []).map(cert => ({
          name: cert.name || '',
          issuingOrg: cert.issuingOrg || '',
          issueDate: this.formatDate(cert.issueDate),
          expirationDate: cert.doesNotExpire ? 'Sem expiração' : this.formatDate(cert.expirationDate)
        })),

        title: cv?.title || 'Curriculum Vitae',
        language: cv?.language || 'PT',
        jobTargetTitle: cv?.jobTargetTitle || cv?.targetRole || '',
        jobTargetArea: cv?.jobTargetArea || '',

        templateColors: cv?.template?.layoutData?.colors || cv?.template?.metadata?.colors || {
          primary: '#2563eb',
          text: '#1e293b',
          background: '#ffffff'
        },
        templateFonts: cv?.template?.layoutData?.fonts || cv?.template?.metadata?.fonts || {
          body: 'Arial, sans-serif',
          heading: 'Arial, sans-serif'
        },
      };

      console.log('✅ Dados preparados:', {
        name: cvData.name,
        email: cvData.email,
        experiencesCount: cvData.experiences.length,
        educationsCount: cvData.educations.length,
        skillsCount: cvData.skills.length,
      })

      return cvData;
    } catch (error) {
      console.error('❌ Erro ao preparar dados do CV:', error)
      throw error
    }
  }

  // Helper para formatar datas
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

  /**
   * Compila template com Handlebars e injeta CSS
   */
  static compileTemplate(templateData, cvData) {
    try {
      console.log('🔧 Compilando template...')
      console.log('📊 Dados do CV:', {
        name: cvData.name,
        email: cvData.email,
        experiencesCount: cvData.experiences?.length || 0,
        educationsCount: cvData.educations?.length || 0,
        skillsCount: cvData.skills?.length || 0,
      })

      if (!handlebars.helpers.hasItems) {
        this.registerHandlebarsHelpers()
      }

      const htmlTemplate = handlebars.compile(templateData.html);
      const compiledHTML = htmlTemplate(cvData);

      console.log('✅ HTML compilado, tamanho:', compiledHTML.length, 'caracteres')

      const fullHTML = `
      <!DOCTYPE html>
      <html lang="${cvData.language || 'PT'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${cvData.title || 'CV'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: ${cvData.templateFonts?.body || 'Arial, sans-serif'};
            color: ${cvData.templateColors?.text || '#000000'};
            background: ${cvData.templateColors?.background || '#ffffff'};
            padding: 20px;
          }
          ${templateData.css || ''}
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

      console.log('✅ HTML final gerado, tamanho:', fullHTML.length, 'caracteres')

      return fullHTML;
    } catch (error) {
      console.error('❌ Erro ao compilar template:', error)
      console.error('Stack:', error.stack)
      throw error
    }
  }

  /**
   * Helpers Handlebars
   */
  static registerHandlebarsHelpers() {
    handlebars.registerHelper('hasItems', arr => Array.isArray(arr) && arr.length > 0);
    handlebars.registerHelper('eachWithIndex', (arr, options) => {
      if (!Array.isArray(arr)) return '';
      return arr.map((item, i) => options.fn({ ...item, index: i })).join('');
    });
    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('capitalize', str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '');
  }

  /**
   * Template padrão
   */
  static getDefaultTemplate() {
    return {
      html: `<div><h1>{{name}}</h1><p>{{summary}}</p></div>`,
      css: '',
    };
  }

  /**
   * Gerar HTML renderizado do CV (para preview)
   * Retorna HTML string pronto para exibição
   */
  static async generateHTMLForCV(cv, profile) {
    try {
      console.log('🎨 [Preview] Carregando template:', cv.template?.name);

      const templateData = await this.loadTemplate(cv.template);

      console.log('📊 [Preview] Preparando dados do CV...');
      const cvData = this.prepareCVData(cv, profile);

      console.log('🔧 [Preview] Compilando HTML com Handlebars...');
      const html = this.compileTemplate(templateData, cvData);

      console.log('✅ [Preview] HTML gerado com sucesso');
      return html;
    } catch (error) {
      console.error('❌ Erro em generateHTMLForCV:', error);
      throw error;
    }
  }

  /**
   * Função principal para gerar PDF de um CV com template
   * Retorna Buffer pronto para upload ou envio
   */
  static async generatePDFBufferForCV(cv, profile) {
    try {
      console.log('🎨 Carregando template:', cv.template?.name);

      const templateData = await this.loadTemplate(cv.template);

      console.log('📊 Preparando dados do CV...');
      const cvData = this.prepareCVData(cv, profile);

      // LOG ADICIONAL: verificar todos os dados do CV
      console.log('📌 DADOS COMPLETOS DO CV:', JSON.stringify(cvData, null, 2));
      console.log('📌 Template do CV:', cv.template);

      console.log('📌 TEMPLATE DATA RECEBIDO PARA COMPILAÇÃO:', {
        htmlLength: templateData?.html?.length,
        cssLength: templateData?.css?.length,
        htmlPreview: templateData?.html?.substring(0, 200),
      });



      console.log('🔧 Compilando HTML com Handlebars...');
      const html = this.compileTemplate(templateData, cvData);

      // LOG ADICIONAL: verificar HTML final
      console.log('📌 HTML FINAL PARA PDF:', html.substring(0, 1000), '...'); // Limita a 1000 chars para não poluir logs

      console.log('🖨️ Gerando PDF com Puppeteer...');
      const pdfBuffer = await this.generatePDF(html);

      console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

      return pdfBuffer;
    } catch (error) {
      console.error('❌ Erro em generatePDFBufferForCV:', error);
      throw error;
    }
  }
}

export default PDFService;
