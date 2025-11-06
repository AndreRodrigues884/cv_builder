// src/services/storage.service.js
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';


class StorageService {
  constructor() {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.folders = {
      cvs: 'cvbuilder/cvs',
      templates: 'cvbuilder/templates',
      profiles: 'cvbuilder/profiles',
    };
  }

  /**
   * Upload de PDF do CV
   */
  async uploadCVPDF(pdfBuffer, userId, cvId, filename = 'cv.pdf') {
    try {
      console.log('📤 Uploading CV PDF to Cloudinary...');

      // Criar ficheiro temporário
      const tempPath = path.join('/tmp', `cv-${cvId}-${Date.now()}.pdf`);
      await fs.writeFile(tempPath, pdfBuffer);

      // Upload para Cloudinary
      const result = await cloudinary.uploader.upload(tempPath, {
        folder: `${this.folders.cvs}/${userId}`,
        public_id: `cv-${cvId}`,
        resource_type: 'raw', // Para PDFs
        format: 'pdf',
        overwrite: true,
        tags: ['cv', 'pdf', userId],
      });

      // Apagar ficheiro temporário
      await fs.unlink(tempPath);

      console.log('✅ CV PDF uploaded successfully:', result.secure_url);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error('❌ Error uploading CV PDF:', error);
      throw new Error('Failed to upload CV PDF: ' + error.message);
    }
  }

  /**
   * Upload de DOCX do CV
   */
  async uploadCVDOCX(docxBuffer, userId, cvId, filename = 'cv.docx') {
    try {
      console.log('📤 Uploading CV DOCX to Cloudinary...');

      const tempPath = path.join('/tmp', `cv-${cvId}-${Date.now()}.docx`);
      await fs.writeFile(tempPath, docxBuffer);

      const result = await cloudinary.uploader.upload(tempPath, {
        folder: `${this.folders.cvs}/${userId}`,
        public_id: `cv-${cvId}-docx`,
        resource_type: 'raw',
        overwrite: true,
        tags: ['cv', 'docx', userId],
      });

      await fs.unlink(tempPath);

      console.log('✅ CV DOCX uploaded successfully');

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('❌ Error uploading CV DOCX:', error);
      throw new Error('Failed to upload CV DOCX: ' + error.message);
    }
  }

  /**
   * Upload de imagem de template (design/preview) - NOVO
   */
  async uploadTemplateImage(imageBuffer, templateSlug) {
    try {
      console.log('📤 Uploading template design image...');

      const tempPath = path.join('/tmp', `template-${templateSlug}-${Date.now()}.png`);
      await fs.writeFile(tempPath, imageBuffer);

      // Upload da imagem original (para análise)
      const originalResult = await cloudinary.uploader.upload(tempPath, {
        folder: `${this.folders.templates}/originals`,
        public_id: `template-${templateSlug}-original`,
        resource_type: 'image',
        overwrite: true,
        tags: ['template', 'original', templateSlug],
      });

      // Upload da preview otimizada (para mostrar aos users)
      const previewResult = await cloudinary.uploader.upload(tempPath, {
        folder: `${this.folders.templates}/previews`,
        public_id: `template-${templateSlug}-preview`,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { width: 800, height: 1200, crop: 'fill' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        tags: ['template', 'preview', templateSlug],
      });

      await fs.unlink(tempPath);

      console.log('✅ Template images uploaded');

      return {
        original: {
          url: originalResult.secure_url,
          publicId: originalResult.public_id,
          width: originalResult.width,
          height: originalResult.height,
        },
        preview: {
          url: previewResult.secure_url,
          publicId: previewResult.public_id,
          width: previewResult.width,
          height: previewResult.height,
        },
      };
    } catch (error) {
      console.error('❌ Error uploading template image:', error);
      throw new Error('Failed to upload template image: ' + error.message);
    }
  }

  /**
   * Upload de foto de perfil
   */
  async uploadProfilePhoto(imageBuffer, userId) {
    try {
      console.log('📤 Uploading profile photo...');

      const tempPath = path.join('/tmp', `profile-${userId}-${Date.now()}.jpg`);
      await fs.writeFile(tempPath, imageBuffer);

      const result = await cloudinary.uploader.upload(tempPath, {
        folder: this.folders.profiles,
        public_id: `profile-${userId}`,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
        tags: ['profile', 'photo', userId],
      });

      await fs.unlink(tempPath);

      console.log('✅ Profile photo uploaded');

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('❌ Error uploading profile photo:', error);
      throw new Error('Failed to upload profile photo: ' + error.message);
    }
  }

  /**
   * Download de imagem do Cloudinary para análise local - NOVO
   */
  async downloadTemplateImage(publicId) {
    try {
      console.log('⬇️ Downloading template image for analysis...');

      const imageUrl = cloudinary.url(publicId, {
        resource_type: 'image',
        secure: true,
      });

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Salvar temporariamente para análise
      const tempPath = path.join('/tmp', `template-analysis-${Date.now()}.png`);
      await fs.writeFile(tempPath, buffer);

      console.log('✅ Template image downloaded:', tempPath);
      return tempPath;
    } catch (error) {
      console.error('❌ Error downloading template image:', error);
      throw new Error('Failed to download template image: ' + error.message);
    }
  }

  /**
   * Apagar ficheiro por publicId
   */
  async deleteFile(publicId, resourceType = 'raw') {
    try {
      console.log('🗑️ Deleting file from Cloudinary:', publicId);

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result === 'ok') {
        console.log('✅ File deleted successfully');
        return true;
      } else {
        console.warn('⚠️ File not found or already deleted');
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw new Error('Failed to delete file: ' + error.message);
    }
  }

  /**
   * Apagar imagens do template - NOVO
   */
  async deleteTemplateImages(templateSlug) {
    try {
      console.log('🗑️ Deleting template images...');

      const originalPublicId = `${this.folders.templates}/originals/template-${templateSlug}-original`;
      const previewPublicId = `${this.folders.templates}/previews/template-${templateSlug}-preview`;

      await Promise.all([
        this.deleteFile(originalPublicId, 'image').catch(() => {}),
        this.deleteFile(previewPublicId, 'image').catch(() => {}),
      ]);

      console.log('✅ Template images deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting template images:', error);
      return false;
    }
  }

  /**
   * Apagar CV (PDF e DOCX)
   */
  async deleteCVFiles(userId, cvId) {
    try {
      console.log('🗑️ Deleting CV files...');

      const pdfPublicId = `${this.folders.cvs}/${userId}/cv-${cvId}`;
      const docxPublicId = `${this.folders.cvs}/${userId}/cv-${cvId}-docx`;

      await Promise.all([
        this.deleteFile(pdfPublicId, 'raw').catch(() => {}),
        this.deleteFile(docxPublicId, 'raw').catch(() => {}),
      ]);

      console.log('✅ CV files deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting CV files:', error);
      return false;
    }
  }

  /**
   * Gerar URL assinada (com expiração)
   */
  generateSignedUrl(publicId, expiresIn = 3600) {
    try {
      const timestamp = Math.round(Date.now() / 1000) + expiresIn;

      const signedUrl = cloudinary.url(publicId, {
        type: 'authenticated',
        sign_url: true,
        expires_at: timestamp,
        resource_type: 'raw',
      });

      return signedUrl;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Listar ficheiros de um user
   */
  async listUserFiles(userId, resourceType = 'raw') {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: `${this.folders.cvs}/${userId}`,
        max_results: 100,
      });

      return result.resources.map(file => ({
        publicId: file.public_id,
        url: file.secure_url,
        format: file.format,
        bytes: file.bytes,
        createdAt: file.created_at,
      }));
    } catch (error) {
      console.error('❌ Error listing user files:', error);
      return [];
    }
  }

  /**
   * Listar todos os templates - NOVO
   */
  async listTemplates() {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        prefix: `${this.folders.templates}/previews`,
        max_results: 100,
      });

      return result.resources.map(file => ({
        publicId: file.public_id,
        url: file.secure_url,
        width: file.width,
        height: file.height,
        createdAt: file.created_at,
      }));
    } catch (error) {
      console.error('❌ Error listing templates:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas de storage
   */
  async getStorageStats() {
    try {
      const usage = await cloudinary.api.usage();

      return {
        used: usage.storage.usage,
        limit: usage.storage.limit,
        percentage: ((usage.storage.usage / usage.storage.limit) * 100).toFixed(2),
        bandwidth: usage.bandwidth.usage,
        transformations: usage.transformations.usage,
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return null;
    }
  }

  /**
   * Limpar ficheiros antigos (cleanup)
   */
  async cleanupOldFiles(days = 30) {
    try {
      console.log(`🧹 Cleaning up files older than ${days} days...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Buscar ficheiros antigos
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix: this.folders.cvs,
        max_results: 500,
      });

      let deletedCount = 0;

      for (const file of result.resources) {
        const fileDate = new Date(file.created_at);
        if (fileDate < cutoffDate) {
          await this.deleteFile(file.public_id, 'raw');
          deletedCount++;
        }
      }

      console.log(`✅ Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up files:', error);
      return 0;
    }
  }

  /**
   * Verificar se Cloudinary está configurado
   */
  isConfigured() {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Testar conexão com Cloudinary
   */
  async testConnection() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'Cloudinary não está configurado. Verifica as variáveis de ambiente.',
        };
      }

      const result = await cloudinary.api.ping();

      if (result.status === 'ok') {
        return {
          success: true,
          message: 'Conexão com Cloudinary OK',
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        };
      }

      return {
        success: false,
        message: 'Falha na conexão com Cloudinary',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao conectar com Cloudinary: ' + error.message,
      };
    }
  }
}

export default StorageService;