const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Upload single file
router.post('/single', authenticateToken, upload.single('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { entity_type, entity_id } = req.body;
    const fileId = uuidv4();

    // Save file info to database
    await pool.execute(
      `INSERT INTO file_uploads (id, original_name, filename, path, mimetype, size, uploaded_by, entity_type, entity_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileId,
        req.file.originalname,
        req.file.filename,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        req.user.id,
        entity_type || null,
        entity_id || null
      ]
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: fileId,
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/api/uploads/file/${req.file.filename}`
      }
    });

  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload multiple files
router.post('/multiple', authenticateToken, upload.array('files', 10), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { entity_type, entity_id } = req.body;
    const uploadedFiles = [];

    // Save each file info to database
    for (const file of req.files) {
      const fileId = uuidv4();
      
      await pool.execute(
        `INSERT INTO file_uploads (id, original_name, filename, path, mimetype, size, uploaded_by, entity_type, entity_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fileId,
          file.originalname,
          file.filename,
          file.path,
          file.mimetype,
          file.size,
          req.user.id,
          entity_type || null,
          entity_id || null
        ]
      );

      uploadedFiles.push({
        id: fileId,
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: `/api/uploads/file/${file.filename}`
      });
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });

  } catch (error) {
    // Clean up uploaded files if database save fails
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    console.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get file by filename
router.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Send file
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get file info by ID
router.get('/info/:id', authenticateToken, async (req, res) => {
  try {
    const [files] = await pool.execute(
      'SELECT * FROM file_uploads WHERE id = ?',
      [req.params.id]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];

    res.json({
      success: true,
      data: {
        id: file.id,
        originalName: file.original_name,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        entityType: file.entity_type,
        entityId: file.entity_id,
        uploadedAt: file.created_at,
        url: `/api/uploads/file/${file.filename}`
      }
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get files by entity
router.get('/entity/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;

    const [files] = await pool.execute(
      'SELECT * FROM file_uploads WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC',
      [type, id]
    );

    const fileList = files.map(file => ({
      id: file.id,
      originalName: file.original_name,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: file.created_at,
      url: `/api/uploads/file/${file.filename}`
    }));

    res.json({
      success: true,
      data: fileList
    });

  } catch (error) {
    console.error('Get entity files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete file
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get file info
    const [files] = await pool.execute(
      'SELECT * FROM file_uploads WHERE id = ?',
      [req.params.id]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];

    // Check if user owns the file or is admin
    if (file.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await pool.execute(
      'DELETE FROM file_uploads WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get upload statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_files,
        SUM(size) as total_size,
        COUNT(DISTINCT entity_type) as entity_types,
        AVG(size) as average_size
      FROM file_uploads
    `);

    const [typeStats] = await pool.execute(`
      SELECT 
        mimetype,
        COUNT(*) as count,
        SUM(size) as total_size
      FROM file_uploads
      GROUP BY mimetype
      ORDER BY count DESC
    `);

    const [entityStats] = await pool.execute(`
      SELECT 
        entity_type,
        COUNT(*) as count
      FROM file_uploads
      WHERE entity_type IS NOT NULL
      GROUP BY entity_type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        types: typeStats,
        entities: entityStats
      }
    });

  } catch (error) {
    console.error('Get upload statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;