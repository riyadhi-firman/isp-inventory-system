const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { sendEmail, emailTemplates } = require('../utils/email');

const router = express.Router();

// Get all stock items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM stock_items WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR brand LIKE ? OR model LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [items] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM stock_items WHERE 1=1';
    const countParams = [];

    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR brand LIKE ? OR model LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single stock item
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT * FROM stock_items WHERE id = ?',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      data: items[0]
    });

  } catch (error) {
    console.error('Get stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create stock item
router.post('/', authenticateToken, authorizeRoles('admin', 'supervisor'), validateRequest(schemas.stockItem), async (req, res) => {
  try {
    const itemId = uuidv4();
    const { name, category, brand, model, quantity, min_stock, unit, location, price, description } = req.body;

    await pool.execute(
      `INSERT INTO stock_items (id, name, category, brand, model, quantity, min_stock, unit, location, price, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, name, category, brand, model, quantity, min_stock, unit, location, price, description || '']
    );

    // Get the created item
    const [items] = await pool.execute(
      'SELECT * FROM stock_items WHERE id = ?',
      [itemId]
    );

    res.status(201).json({
      success: true,
      message: 'Stock item created successfully',
      data: items[0]
    });

  } catch (error) {
    console.error('Create stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update stock item
router.put('/:id', authenticateToken, authorizeRoles('admin', 'supervisor'), validateRequest(schemas.stockItem), async (req, res) => {
  try {
    const { name, category, brand, model, quantity, min_stock, unit, location, price, description } = req.body;

    const [result] = await pool.execute(
      `UPDATE stock_items 
       SET name = ?, category = ?, brand = ?, model = ?, quantity = ?, min_stock = ?, 
           unit = ?, location = ?, price = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, category, brand, model, quantity, min_stock, unit, location, price, description || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    // Get updated item
    const [items] = await pool.execute(
      'SELECT * FROM stock_items WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Stock item updated successfully',
      data: items[0]
    });

  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete stock item
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM stock_items WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock item deleted successfully'
    });

  } catch (error) {
    console.error('Delete stock item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get low stock items
router.get('/alerts/low-stock', authenticateToken, async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT * FROM stock_items WHERE quantity <= min_stock ORDER BY (quantity - min_stock) ASC'
    );

    res.json({
      success: true,
      data: items
    });

  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send low stock alert email
router.post('/alerts/send-email', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    // Get low stock items
    const [items] = await pool.execute(
      'SELECT * FROM stock_items WHERE quantity <= min_stock ORDER BY (quantity - min_stock) ASC'
    );

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No low stock items found'
      });
    }

    // Get admin emails
    const [admins] = await pool.execute(
      'SELECT email FROM users WHERE role IN ("admin", "supervisor") AND is_active = true'
    );

    const emailContent = emailTemplates.lowStockAlert(items);

    // Send emails to all admins
    const emailPromises = admins.map(admin => 
      sendEmail({
        to: admin.email,
        subject: emailContent.subject,
        html: emailContent.html
      })
    );

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Low stock alert sent to ${admins.length} administrators`,
      data: {
        itemsCount: items.length,
        recipientsCount: admins.length
      }
    });

  } catch (error) {
    console.error('Send low stock alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update stock quantity (for transactions)
router.patch('/:id/quantity', authenticateToken, async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "subtract"'
      });
    }

    // Get current quantity
    const [items] = await pool.execute(
      'SELECT quantity FROM stock_items WHERE id = ?',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    const currentQuantity = items[0].quantity;
    let newQuantity;

    if (operation === 'add') {
      newQuantity = currentQuantity + quantity;
    } else {
      newQuantity = currentQuantity - quantity;
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock quantity'
        });
      }
    }

    // Update quantity
    await pool.execute(
      'UPDATE stock_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, req.params.id]
    );

    res.json({
      success: true,
      message: 'Stock quantity updated successfully',
      data: {
        previousQuantity: currentQuantity,
        newQuantity,
        operation,
        change: quantity
      }
    });

  } catch (error) {
    console.error('Update stock quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;