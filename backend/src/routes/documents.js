import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { scanFileForThreats } from '../utils/fileScan.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// Upload document
router.post('/upload', authenticate, upload.single('document'), logActivity, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;
    
    if (!type || !['ID_PROOF', 'ADDRESS_PROOF', 'LAND_RECORDS', 'BUSINESS_LICENSE', 'OTHER'].includes(type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const scanResult = await scanFileForThreats(req.file.path);
    if (scanResult.status === 'infected') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Malware detected in uploaded file.' });
    }
    if (scanResult.status === 'failed') {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'File scan failed. Please try again later.' });
    }

    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        type,
        fileName: req.file.filename,
        filePath: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        type: document.type,
        originalName: document.originalName,
        size: document.size,
        isVerified: document.isVerified,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    logger.error('Document upload error:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get user documents
router.get('/my-documents', authenticate, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        type: true,
        originalName: true,
        size: true,
        isVerified: true,
        verifiedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ documents });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Download document
router.get('/download/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    logger.error('Document download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete document
router.delete('/:id', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Document delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Admin routes for document verification
router.get('/pending-verification', authenticate, authorize('ADMIN', 'EXPERT'), async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ documents });
  } catch (error) {
    logger.error('Get pending documents error:', error);
    res.status(500).json({ error: 'Failed to fetch pending documents' });
  }
});

// Verify/reject document
router.patch('/:id/verify', authenticate, authorize('ADMIN', 'EXPERT'), logActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, rejectionReason } = req.body;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        isVerified: isVerified === true,
        verifiedAt: isVerified === true ? new Date() : null
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: document.userId,
        title: isVerified ? 'Document Verified' : 'Document Rejected',
        message: isVerified 
          ? `Your ${document.type} document has been verified successfully.`
          : `Your ${document.type} document was rejected. ${rejectionReason || ''}`,
        type: isVerified ? 'SUCCESS' : 'WARNING'
      }
    });

    res.json({
      message: `Document ${isVerified ? 'verified' : 'rejected'} successfully`,
      document: updatedDocument
    });
  } catch (error) {
    logger.error('Document verification error:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
});

export default router;
