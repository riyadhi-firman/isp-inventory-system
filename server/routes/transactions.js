const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { sendEmail, emailTemplates } = require('../utils/email');

const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, staff_id, search, page = 1, limit = 50 } = req.query;
    
    let query = `
      SELECT t.*, s.name as staff_name, c.name as customer_name, u.name as approved_by_name
      FROM transactions t
      LEFT JOIN staff s ON t.staff_id = s.id
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.approved_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'all') {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (staff_id) {
      query += ' AND t.staff_id = ?';
      params.push(staff_id);
    }

    if (search) {
      query += ' AND (t.notes LIKE ? OR t.id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY t.created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [transactions] = await pool.execute(query, params);

    // Get transaction items for each transaction
    const transactionsWithItems = await Promise.all(
      transactions.map(async (transaction) => {
        const [items] = await pool.execute(`
          SELECT ti.*, si.name as stock_name, si.unit
          FROM transaction_items ti
          LEFT JOIN stock_items si ON ti.stock_id = si.id
          WHERE ti.transaction_id = ?
        `, [transaction.id]);

        return {
          ...transaction,
          items
        };
      })
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM transactions t WHERE 1=1';
    const countParams = [];

    if (type && type !== 'all') {
      countQuery += ' AND t.type = ?';
      countParams.push(type);
    }

    if (status && status !== 'all') {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }

    if (staff_id) {
      countQuery += ' AND t.staff_id = ?';
      countParams.push(staff_id);
    }

    if (search) {
      countQuery += ' AND (t.notes LIKE ? OR t.id LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        transactions: transactionsWithItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single transaction
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [transactions] = await pool.execute(`
      SELECT t.*, s.name as staff_name, c.name as customer_name, u.name as approved_by_name
      FROM transactions t
      LEFT JOIN staff s ON t.staff_id = s.id
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.approved_by = u.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactions[0];

    // Get transaction items
    const [items] = await pool.execute(`
      SELECT ti.*, si.name as stock_name, si.unit
      FROM transaction_items ti
      LEFT JOIN stock_items si ON ti.stock_id = si.id
      WHERE ti.transaction_id = ?
    `, [transaction.id]);

    res.json({
      success: true,
      data: {
        ...transaction,
        items
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create transaction
router.post('/', authenticateToken, validateRequest(schemas.transaction), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const transactionId = uuidv4();
    const { type, staff_id, customer_id, notes, items } = req.body;

    // Validate staff exists
    const [staff] = await connection.execute(
      'SELECT name FROM staff WHERE id = ? AND is_active = true',
      [staff_id]
    );

    if (staff.length === 0) {
      throw new Error('Staff member not found');
    }

    // Validate customer exists (if provided)
    if (customer_id) {
      const [customers] = await connection.execute(
        'SELECT id FROM customers WHERE id = ?',
        [customer_id]
      );

      if (customers.length === 0) {
        throw new Error('Customer not found');
      }
    }

    // Validate stock items and check availability
    for (const item of items) {
      const [stockItems] = await connection.execute(
        'SELECT quantity FROM stock_items WHERE id = ?',
        [item.stock_id]
      );

      if (stockItems.length === 0) {
        throw new Error(`Stock item ${item.stock_id} not found`);
      }

      if (type !== 'return' && stockItems[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ${item.stock_id}`);
      }
    }

    // Create transaction
    await connection.execute(
      `INSERT INTO transactions (id, type, staff_id, customer_id, notes, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [transactionId, type, staff_id, customer_id || null, notes]
    );

    // Create transaction items
    for (const item of items) {
      const itemId = uuidv4();
      await connection.execute(
        `INSERT INTO transaction_items (id, transaction_id, stock_id, quantity, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [itemId, transactionId, item.stock_id, item.quantity, item.notes || '']
      );
    }

    await connection.commit();

    // Send notification email to supervisors/admins
    try {
      const [admins] = await pool.execute(
        'SELECT email FROM users WHERE role IN ("admin", "supervisor") AND is_active = true'
      );

      if (admins.length > 0) {
        const transactionData = {
          id: transactionId,
          type,
          staff_name: staff[0].name,
          created_at: new Date(),
          notes
        };

        const emailContent = emailTemplates.transactionApproval(transactionData, items);

        const emailPromises = admins.map(admin => 
          sendEmail({
            to: admin.email,
            subject: emailContent.subject,
            html: emailContent.html
          })
        );

        await Promise.all(emailPromises);
      }
    } catch (emailError) {
      console.error('Failed to send transaction notification email:', emailError);
    }

    // Get the created transaction with details
    const [createdTransaction] = await pool.execute(`
      SELECT t.*, s.name as staff_name, c.name as customer_name
      FROM transactions t
      LEFT JOIN staff s ON t.staff_id = s.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = ?
    `, [transactionId]);

    const [transactionItems] = await pool.execute(`
      SELECT ti.*, si.name as stock_name, si.unit
      FROM transaction_items ti
      LEFT JOIN stock_items si ON ti.stock_id = si.id
      WHERE ti.transaction_id = ?
    `, [transactionId]);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        ...createdTransaction[0],
        items: transactionItems
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  } finally {
    connection.release();
  }
});

// Approve transaction
router.patch('/:id/approve', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get transaction details
    const [transactions] = await connection.execute(
      'SELECT * FROM transactions WHERE id = ? AND status = "pending"',
      [req.params.id]
    );

    if (transactions.length === 0) {
      throw new Error('Transaction not found or already processed');
    }

    const transaction = transactions[0];

    // Get transaction items
    const [items] = await connection.execute(
      'SELECT * FROM transaction_items WHERE transaction_id = ?',
      [req.params.id]
    );

    // Update stock quantities based on transaction type
    for (const item of items) {
      if (transaction.type === 'installation' || transaction.type === 'borrow') {
        // Subtract from stock
        await connection.execute(
          'UPDATE stock_items SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [item.quantity, item.stock_id]
        );
      } else if (transaction.type === 'return') {
        // Add to stock
        await connection.execute(
          'UPDATE stock_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [item.quantity, item.stock_id]
        );
      }
      // For maintenance, no stock change needed
    }

    // Update transaction status
    await connection.execute(
      `UPDATE transactions 
       SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [req.user.id, req.params.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Transaction approved successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Approve transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  } finally {
    connection.release();
  }
});

// Reject transaction
router.patch('/:id/reject', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE transactions 
       SET status = 'rejected', approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = 'pending'`,
      [req.user.id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or already processed'
      });
    }

    res.json({
      success: true,
      message: 'Transaction rejected successfully'
    });

  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Complete transaction
router.patch('/:id/complete', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      `UPDATE transactions 
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = 'approved'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or not approved'
      });
    }

    res.json({
      success: true,
      message: 'Transaction completed successfully'
    });

  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_transactions,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_transactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN type = 'installation' THEN 1 END) as installations,
        COUNT(CASE WHEN type = 'maintenance' THEN 1 END) as maintenance,
        COUNT(CASE WHEN type = 'return' THEN 1 END) as returns,
        COUNT(CASE WHEN type = 'borrow' THEN 1 END) as borrows
      FROM transactions
    `);

    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        type
      FROM transactions 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), type
      ORDER BY month DESC
    `);

    const [staffStats] = await pool.execute(`
      SELECT 
        s.name as staff_name,
        COUNT(t.id) as transaction_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count
      FROM staff s
      LEFT JOIN transactions t ON s.id = t.staff_id
      WHERE s.is_active = true
      GROUP BY s.id, s.name
      ORDER BY transaction_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        monthly: monthlyStats,
        staff: staffStats
      }
    });

  } catch (error) {
    console.error('Get transaction statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;