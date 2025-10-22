// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;

// Exemplo rápido:
/* {
  "name": "Modern Professional",
  "previewUrl": "https://placehold.co/400x600/4F46E5/ffffff?text=Modern"
}

{
  "name": "Creative Designer", 
  "previewUrl": "https://images.unsplash.com/photo-template-cv"
} */