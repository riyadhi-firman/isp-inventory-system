const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { service_type, status, search, page = 1, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (service_type && service_type !== 'all') {
      query += ' AND service_type = ?';
      params.push(service_type);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [customers] = await pool.execute(query, params);

    // Get devices and service history for each customer
    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        // Get devices
        const [devices] = await pool.execute(`
          SELECT cd.*, si.name as stock_name 
          FROM customer_devices cd
          LEFT JOIN stock_items si ON cd.stock_id = si.id
          WHERE cd.customer_id = ?
        `, [customer.id]);

        // Get service history
        const [serviceHistory] = await pool.execute(
          'SELECT * FROM service_history WHERE customer_id = ? ORDER BY date DESC',
          [customer.id]
        );

        return {
          ...customer,
          devices,
          serviceHistory
        };
      })
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
    const countParams = [];

    if (service_type && service_type !== 'all') {
      countQuery += ' AND service_type = ?';
      countParams.push(service_type);
    }

    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        customers: customersWithDetails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single customer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [customers] = await pool.execute(
      'SELECT * FROM customers WHERE id = ?',
      [req.params.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = customers[0];

    // Get devices
    const [devices] = await pool.execute(`
      SELECT cd.*, si.name as stock_name 
      FROM customer_devices cd
      LEFT JOIN stock_items si ON cd.stock_id = si.id
      WHERE cd.customer_id = ?
    `, [customer.id]);

    // Get service history
    const [serviceHistory] = await pool.execute(
      'SELECT * FROM service_history WHERE customer_id = ? ORDER BY date DESC',
      [customer.id]
    );

    res.json({
      success: true,
      data: {
        ...customer,
        devices,
        serviceHistory
      }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create customer
router.post('/', authenticateToken, authorizeRoles('admin', 'supervisor'), validateRequest(schemas.customer), async (req, res) => {
  try {
    const customerId = uuidv4();
    const { name, email, phone, address, service_type, package_type, status } = req.body;
    const installationDate = new Date().toISOString().split('T')[0];

    await pool.execute(
      `INSERT INTO customers (id, name, email, phone, address, service_type, package_type, status, installation_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, name, email, phone, address, service_type, package_type, status || 'active', installationDate]
    );

    // Get the created customer
    const [customers] = await pool.execute(
      'SELECT * FROM customers WHERE id = ?',
      [customerId]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        ...customers[0],
        devices: [],
        serviceHistory: []
      }
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update customer
router.put('/:id', authenticateToken, authorizeRoles('admin', 'supervisor'), validateRequest(schemas.customer), async (req, res) => {
  try {
    const { name, email, phone, address, service_type, package_type, status } = req.body;

    const [result] = await pool.execute(
      `UPDATE customers 
       SET name = ?, email = ?, phone = ?, address = ?, service_type = ?, package_type = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, email, phone, address, service_type, package_type, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get updated customer with details
    const [customers] = await pool.execute(
      'SELECT * FROM customers WHERE id = ?',
      [req.params.id]
    );

    const customer = customers[0];

    // Get devices and service history
    const [devices] = await pool.execute(`
      SELECT cd.*, si.name as stock_name 
      FROM customer_devices cd
      LEFT JOIN stock_items si ON cd.stock_id = si.id
      WHERE cd.customer_id = ?
    `, [customer.id]);

    const [serviceHistory] = await pool.execute(
      'SELECT * FROM service_history WHERE customer_id = ? ORDER BY date DESC',
      [customer.id]
    );

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        ...customer,
        devices,
        serviceHistory
      }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM customers WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update customer status
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended', 'terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, suspended, or terminated'
      });
    }

    const [result] = await pool.execute(
      'UPDATE customers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer status updated successfully'
    });

  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add device to customer
router.post('/:id/devices', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const { stock_id, serial_number, location } = req.body;
    const deviceId = uuidv4();
    const installDate = new Date().toISOString().split('T')[0];

    // Check if serial number already exists
    const [existingDevices] = await pool.execute(
      'SELECT id FROM customer_devices WHERE serial_number = ?',
      [serial_number]
    );

    if (existingDevices.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Device with this serial number already exists'
      });
    }

    await pool.execute(
      `INSERT INTO customer_devices (id, customer_id, stock_id, serial_number, install_date, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [deviceId, req.params.id, stock_id, serial_number, installDate, location]
    );

    // Get the created device with stock info
    const [devices] = await pool.execute(`
      SELECT cd.*, si.name as stock_name 
      FROM customer_devices cd
      LEFT JOIN stock_items si ON cd.stock_id = si.id
      WHERE cd.id = ?
    `, [deviceId]);

    res.status(201).json({
      success: true,
      message: 'Device added to customer successfully',
      data: devices[0]
    });

  } catch (error) {
    console.error('Add customer device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add service history
router.post('/:id/service-history', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const { type, description, technician, cost } = req.body;
    const serviceId = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    await pool.execute(
      `INSERT INTO service_history (id, customer_id, type, description, technician, date, cost) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [serviceId, req.params.id, type, description, technician, date, cost || 0]
    );

    // Get the created service record
    const [services] = await pool.execute(
      'SELECT * FROM service_history WHERE id = ?',
      [serviceId]
    );

    res.status(201).json({
      success: true,
      message: 'Service history added successfully',
      data: services[0]
    });

  } catch (error) {
    console.error('Add service history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get customer statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_customers,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_customers,
        COUNT(CASE WHEN service_type = 'residential' THEN 1 END) as residential_customers,
        COUNT(CASE WHEN service_type = 'business' THEN 1 END) as business_customers
      FROM customers
    `);

    const [packageStats] = await pool.execute(`
      SELECT 
        package_type,
        COUNT(*) as count,
        service_type
      FROM customers 
      GROUP BY package_type, service_type
      ORDER BY count DESC
    `);

    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(installation_date, '%Y-%m') as month,
        COUNT(*) as installations
      FROM customers 
      WHERE installation_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(installation_date, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        packages: packageStats,
        monthly: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get customer statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;