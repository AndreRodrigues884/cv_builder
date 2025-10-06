const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  generateCV(cvData) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `cv-${cvData.id}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../temp', fileName);
      
      // Criar stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Header
      doc.fontSize(24).font('Helvetica-Bold').text(cvData.fullName, { align: 'center' });
      doc.moveDown(0.5);
      
      // Contactos
      doc.fontSize(10).font('Helvetica');
      const contacts = [cvData.email, cvData.phone, cvData.location].filter(Boolean).join(' • ');
      doc.text(contacts, { align: 'center' });
      
      if (cvData.linkedIn || cvData.portfolio) {
        doc.moveDown(0.3);
        const links = [cvData.linkedIn, cvData.portfolio].filter(Boolean).join(' • ');
        doc.fillColor('blue').text(links, { align: 'center', link: cvData.linkedIn || cvData.portfolio });
        doc.fillColor('black');
      }
      
      doc.moveDown(1);
      
      // Resumo Profissional
      if (cvData.summary) {
        this.addSection(doc, 'Perfil Profissional');
        doc.fontSize(10).font('Helvetica').text(cvData.summary, { align: 'justify' });
        doc.moveDown(1);
      }
      
      // Experiência Profissional
      if (cvData.experiences && cvData.experiences.length > 0) {
        this.addSection(doc, 'Experiência Profissional');
        
        cvData.experiences.forEach((exp, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(exp.position);
          doc.fontSize(10).font('Helvetica-Oblique').text(`${exp.company} | ${this.formatDate(exp.startDate)} - ${exp.endDate ? this.formatDate(exp.endDate) : 'Presente'}`);
          doc.moveDown(0.3);
          doc.font('Helvetica').text(exp.description, { align: 'justify' });
          
          if (index < cvData.experiences.length - 1) {
            doc.moveDown(0.8);
          }
        });
        doc.moveDown(1);
      }
      
      // Formação Académica
      if (cvData.education && cvData.education.length > 0) {
        this.addSection(doc, 'Formação Académica');
        
        cvData.education.forEach((edu) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`${edu.degree} em ${edu.field}`);
          doc.fontSize(10).font('Helvetica').text(`${edu.institution} | ${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}`);
          doc.moveDown(0.5);
        });
        doc.moveDown(0.5);
      }
      
      // Competências
      if (cvData.skills && cvData.skills.length > 0) {
        this.addSection(doc, 'Competências');
        const skillsText = cvData.skills.join(' • ');
        doc.fontSize(10).font('Helvetica').text(skillsText);
        doc.moveDown(1);
      }
      
      // Idiomas
      if (cvData.languages && cvData.languages.length > 0) {
        this.addSection(doc, 'Idiomas');
        cvData.languages.forEach((lang) => {
          doc.fontSize(10).font('Helvetica').text(`${lang.language}: ${lang.level}`);
        });
      }
      
      // Finalizar
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', reject);
    });
  }
  
  addSection(doc, title) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2C3E50')
       .text(title.toUpperCase());
    
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke('#3498DB');
    
    doc.moveDown(0.7);
    doc.fillColor('black');
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
  }
}

module.exports = new PDFService();