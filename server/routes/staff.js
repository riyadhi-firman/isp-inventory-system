const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all staff
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, team, search, page = 1, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM staff WHERE is_active = true';
    const params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (team && team !== 'all') {
      query += ' AND team = ?';
      params.push(team);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR area LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [staff] = await pool.execute(query, params);

    // Parse skills JSON for each staff member
    const staffWithParsedSkills = staff.map(member => ({
      ...member,
      skills: member.skills ? JSON.parse(member.skills) : []
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM staff WHERE is_active = true';
    const countParams = [];

    if (role && role !== 'all') {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (team && team !== 'all') {
      countQuery += ' AND team = ?';
      countParams.push(team);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR area LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        staff: staffWithParsedSkills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single staff member
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [staff] = await pool.execute(
      'SELECT * FROM staff WHERE id = ? AND is_active = true',
      [req.params.id]
    );

    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const staffMember = {
      ...staff[0],
      skills: staff[0].skills ? JSON.parse(staff[0].skills) : []
    };

    res.json({
      success: true,
      data: staffMember
    });

  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create staff member
router.post('/', authenticateToken, authorizeRoles('admin', 'supervisor'), validateRequest(schemas.staff), async (req, res) => {
  try {
    const staffId = uuidv4();
    const { 
      name, email, phone, role, team, area, skills, 
      completed_jobs, rating, efficiency 
    } = req.body;

    // Check if email already exists
    const [existingStaff] = await pool.execute(
      'SELECT id FROM staff WHERE email = ?',
      [email]
    );

    if (existingStaff.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Staff member with this email already exists'
      });
    }

    const skillsJson = JSON.stringify(skills || []);
    const joinDate = new Date().toISOString().split('T')[0];

    await pool.execute(
      `INSERT INTO staff (id, name, email, phone, role, team, area, skills, join_date, completed_jobs, rating, efficiency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffId, name, email, phone, role, team, area, skillsJson, joinDate, completed_jobs || 0, rating || 5.0, efficiency || 100]
    );

    // Get the created staff member
    const [staff] = await pool.execute(
      'SELECT * FROM staff WHERE id = ?',
      [staffId]
    );

    const staffMember = {
      ...staff[0],
      skills: staff[0].skills ? JSON.parse(staff[0].skills) : []
    };

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staffMember
    });

  } catch (error) {
    console.error('Create staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update staff member
router.put('/:id', authenticateToken, authorizeRoles('admin', 'supervisor'), validateRequest(schemas.staff), async (req, res) => {
  try {
    const { 
      name, email, phone, role, team, area, skills, 
      completed_jobs, rating, efficiency 
    } = req.body;

    // Check if email already exists for other staff
    const [existingStaff] = await pool.execute(
      'SELECT id FROM staff WHERE email = ? AND id != ?',
      [email, req.params.id]
    );

    if (existingStaff.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Another staff member with this email already exists'
      });
    }

    const skillsJson = JSON.stringify(skills || []);

    const [result] = await pool.execute(
      `UPDATE staff 
       SET name = ?, email = ?, phone = ?, role = ?, team = ?, area = ?, skills = ?, 
           completed_jobs = ?, rating = ?, efficiency = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND is_active = true`,
      [name, email, phone, role, team, area, skillsJson, completed_jobs || 0, rating || 5.0, efficiency || 100, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Get updated staff member
    const [staff] = await pool.execute(
      'SELECT * FROM staff WHERE id = ?',
      [req.params.id]
    );

    const staffMember = {
      ...staff[0],
      skills: staff[0].skills ? JSON.parse(staff[0].skills) : []
    };

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staffMember
    });

  } catch (error) {
    console.error('Update staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete staff member (soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE staff SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });

  } catch (error) {
    console.error('Delete staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update staff performance
router.patch('/:id/performance', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const { completed_jobs, rating, efficiency } = req.body;

    const [result] = await pool.execute(
      `UPDATE staff 
       SET completed_jobs = ?, rating = ?, efficiency = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND is_active = true`,
      [completed_jobs, rating, efficiency, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff performance updated successfully'
    });

  } catch (error) {
    console.error('Update staff performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get staff statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        COUNT(CASE WHEN role = 'technician' THEN 1 END) as technicians,
        COUNT(CASE WHEN role = 'supervisor' THEN 1 END) as supervisors,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        AVG(rating) as average_rating,
        AVG(efficiency) as average_efficiency,
        SUM(completed_jobs) as total_completed_jobs
      FROM staff 
      WHERE is_active = true
    `);

    const [teamStats] = await pool.execute(`
      SELECT 
        team,
        COUNT(*) as members,
        AVG(rating) as avg_rating,
        AVG(efficiency) as avg_efficiency,
        SUM(completed_jobs) as total_jobs
      FROM staff 
      WHERE is_active = true 
      GROUP BY team
      ORDER BY members DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        teams: teamStats
      }
    });

  } catch (error) {
    console.error('Get staff statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;