const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get stock statistics
    const [stockStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_stock,
        COUNT(CASE WHEN quantity <= min_stock THEN 1 END) as low_stock_items,
        SUM(quantity * price) as total_stock_value
      FROM stock_items
    `);

    // Get transaction statistics
    const [transactionStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN type = 'installation' AND DATE(created_at) = CURDATE() THEN 1 END) as today_installations
      FROM transactions
    `);

    // Get customer statistics
    const [customerStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN DATE(installation_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as monthly_installations
      FROM customers
    `);

    // Get staff statistics
    const [staffStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        AVG(rating) as average_rating,
        AVG(efficiency) as average_efficiency
      FROM staff 
      WHERE is_active = true
    `);

    // Get recent activities (transactions)
    const [recentActivities] = await pool.execute(`
      SELECT 
        t.id,
        t.type,
        t.status,
        t.notes,
        t.created_at,
        s.name as staff_name
      FROM transactions t
      LEFT JOIN staff s ON t.staff_id = s.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    // Get low stock items
    const [lowStockItems] = await pool.execute(`
      SELECT 
        id,
        name,
        quantity,
        min_stock,
        unit,
        location
      FROM stock_items 
      WHERE quantity <= min_stock
      ORDER BY (quantity - min_stock) ASC
      LIMIT 5
    `);

    // Calculate team performance (average of all staff ratings)
    const teamPerformance = Math.round(staffStats[0].average_rating * 20); // Convert 5-star to percentage

    const dashboardData = {
      totalStock: stockStats[0].total_stock,
      lowStockItems: stockStats[0].low_stock_items,
      pendingTransactions: transactionStats[0].pending_transactions,
      activeCustomers: customerStats[0].active_customers,
      monthlyInstallations: customerStats[0].monthly_installations,
      teamPerformance: teamPerformance,
      totalStockValue: stockStats[0].total_stock_value,
      todayInstallations: transactionStats[0].today_installations,
      totalTransactions: transactionStats[0].total_transactions,
      completedTransactions: transactionStats[0].completed_transactions,
      totalStaff: staffStats[0].total_staff,
      averageRating: parseFloat(staffStats[0].average_rating || 0).toFixed(1),
      averageEfficiency: Math.round(staffStats[0].average_efficiency || 0),
      recentActivities,
      lowStockAlerts: lowStockItems
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get monthly trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    // Get monthly transaction trends
    const [transactionTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'installation' THEN 1 END) as installations,
        COUNT(CASE WHEN type = 'maintenance' THEN 1 END) as maintenance
      FROM transactions 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get monthly customer growth
    const [customerTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(installation_date, '%Y-%m') as month,
        COUNT(*) as new_customers
      FROM customers 
      WHERE installation_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(installation_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get stock value trends (monthly snapshots would need historical data)
    // For now, we'll return current stock value by category
    const [stockTrends] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as items,
        SUM(quantity * price) as value
      FROM stock_items
      GROUP BY category
      ORDER BY value DESC
    `);

    res.json({
      success: true,
      data: {
        transactions: transactionTrends,
        customers: customerTrends,
        stock: stockTrends
      }
    });

  } catch (error) {
    console.error('Get dashboard trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    // Get staff performance by team
    const [teamPerformance] = await pool.execute(`
      SELECT 
        team,
        COUNT(*) as members,
        AVG(rating) as avg_rating,
        AVG(efficiency) as avg_efficiency,
        SUM(completed_jobs) as total_jobs
      FROM staff 
      WHERE is_active = true
      GROUP BY team
      ORDER BY avg_rating DESC
    `);

    // Get top performing staff
    const [topStaff] = await pool.execute(`
      SELECT 
        name,
        team,
        rating,
        efficiency,
        completed_jobs
      FROM staff 
      WHERE is_active = true
      ORDER BY rating DESC, efficiency DESC
      LIMIT 10
    `);

    // Get transaction completion rates
    const [completionRates] = await pool.execute(`
      SELECT 
        type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*)) * 100, 2) as completion_rate
      FROM transactions
      GROUP BY type
    `);

    res.json({
      success: true,
      data: {
        teams: teamPerformance,
        topStaff,
        completionRates
      }
    });

  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;