import express from  'express';

import { handleUploadFile } from '../controllers/upload.controllers.js';
import upload from '../config/multer.config.js';
import { checkCookies, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', checkCookies, requireAdmin, upload.single('file'), handleUploadFile);

export default router;




