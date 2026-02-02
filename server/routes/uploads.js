// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Local Storage (Temporary)
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 3. The Upload Route
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Path to the file temporarily saved on your server
    const localFilePath = req.file.path;

    // === A. UPLOAD TO CLOUDINARY ===
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "form_uploads", // Optional: organize in a folder on Cloudinary
      resource_type: "auto"   // Auto-detects if it's an image, pdf, or raw file
    });

    // === B. DELETE FILE FROM LOCAL SERVER ===
    // This removes the file from your 'uploads' folder to save space
    fs.unlinkSync(localFilePath);

    // === C. RETURN THE CLOUD URL ===
    res.json({ 
      url: result.secure_url, // This is the persistent link (e.g., https://res.cloudinary...)
      filename: result.original_filename,
      format: result.format
    });

  } catch (error) {
    // If upload fails, try to delete the local file anyway so it doesn't clutter
    if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
