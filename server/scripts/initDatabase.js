const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password'
    });

    console.log('🔗 Connected to MySQL server');

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'isp_inventory'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'isp_inventory'}' created/verified`);

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'isp_inventory'}`);

    // Create tables
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'supervisor', 'technician') DEFAULT 'technician',
        phone VARCHAR(20),
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Stock items table
      `CREATE TABLE IF NOT EXISTS stock_items (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('router', 'switch', 'cable', 'modem', 'antenna', 'accessory') NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        min_stock INT NOT NULL DEFAULT 0,
        unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
        location VARCHAR(255) NOT NULL,
        price DECIMAL(15,2) NOT NULL DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_brand (brand),
        INDEX idx_quantity (quantity)
      )`,

      // Staff table
      `CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('technician', 'supervisor', 'admin') NOT NULL,
        team VARCHAR(100) NOT NULL,
        area VARCHAR(255) NOT NULL,
        skills JSON,
        join_date DATE NOT NULL,
        completed_jobs INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 5.0,
        efficiency INT DEFAULT 100,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_team (team)
      )`,

      // Customers table
      `CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        service_type ENUM('residential', 'business') NOT NULL,
        package_type VARCHAR(100) NOT NULL,
        status ENUM('active', 'suspended', 'terminated') DEFAULT 'active',
        installation_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_service_type (service_type),
        INDEX idx_status (status)
      )`,

      // Customer devices table
      `CREATE TABLE IF NOT EXISTS customer_devices (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        stock_id VARCHAR(36) NOT NULL,
        serial_number VARCHAR(100) NOT NULL UNIQUE,
        install_date DATE NOT NULL,
        location VARCHAR(255) NOT NULL,
        status ENUM('active', 'maintenance', 'replaced') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stock_items(id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_serial_number (serial_number)
      )`,

      // Service history table
      `CREATE TABLE IF NOT EXISTS service_history (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        type ENUM('installation', 'maintenance', 'repair', 'upgrade') NOT NULL,
        description TEXT NOT NULL,
        technician VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status ENUM('completed', 'pending', 'cancelled') DEFAULT 'pending',
        cost DECIMAL(15,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_type (type),
        INDEX idx_status (status)
      )`,

      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('installation', 'maintenance', 'return', 'borrow') NOT NULL,
        staff_id VARCHAR(36) NOT NULL,
        customer_id VARCHAR(36),
        status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
        notes TEXT NOT NULL,
        approved_by VARCHAR(36),
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_staff_id (staff_id)
      )`,

      // Transaction items table
      `CREATE TABLE IF NOT EXISTS transaction_items (
        id VARCHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(36) NOT NULL,
        stock_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES stock_items(id),
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_stock_id (stock_id)
      )`,

      // File uploads table
      `CREATE TABLE IF NOT EXISTS file_uploads (
        id VARCHAR(36) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        uploaded_by VARCHAR(36),
        entity_type VARCHAR(50),
        entity_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id),
        INDEX idx_entity (entity_type, entity_id)
      )`
    ];

    // Execute table creation
    for (const table of tables) {
      await connection.execute(table);
    }

    console.log('✅ All tables created successfully');

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(
      `INSERT IGNORE INTO users (id, name, email, password, role, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'Admin User', 'admin@isp.com', hashedPassword, 'admin', '+62812345678']
    );

    console.log('✅ Default admin user created (email: admin@isp.com, password: admin123)');

    // Insert sample data
    await insertSampleData(connection);

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const insertSampleData = async (connection) => {
  const { v4: uuidv4 } = require('uuid');

  try {
    // Sample stock items
    const stockItems = [
      {
        id: uuidv4(),
        name: 'Cisco RV160 Router',
        category: 'router',
        brand: 'Cisco',
        model: 'RV160',
        quantity: 15,
        min_stock: 10,
        unit: 'pcs',
        location: 'Warehouse A-1',
        price: 1500000,
        description: 'VPN Router with 4 Gigabit Ethernet ports'
      },
      {
        id: uuidv4(),
        name: 'UTP Cable Cat6',
        category: 'cable',
        brand: 'Belden',
        model: 'Cat6',
        quantity: 500,
        min_stock: 100,
        unit: 'meters',
        location: 'Warehouse B-2',
        price: 12000,
        description: 'High-quality UTP cable for network installations'
      },
      {
        id: uuidv4(),
        name: 'Mikrotik hEX S',
        category: 'router',
        brand: 'Mikrotik',
        model: 'hEX S',
        quantity: 8,
        min_stock: 15,
        unit: 'pcs',
        location: 'Warehouse A-2',
        price: 800000,
        description: 'Gigabit Ethernet router with SFP port'
      }
    ];

    for (const item of stockItems) {
      await connection.execute(
        `INSERT IGNORE INTO stock_items (id, name, category, brand, model, quantity, min_stock, unit, location, price, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.category, item.brand, item.model, item.quantity, item.min_stock, item.unit, item.location, item.price, item.description]
      );
    }

    // Sample staff
    const staff = [
      {
        id: uuidv4(),
        name: 'Ahmad Rizki',
        email: 'ahmad.rizki@isp.com',
        phone: '+62812345678',
        role: 'technician',
        team: 'Team Alpha',
        area: 'Jakarta Pusat',
        skills: JSON.stringify(['Network Configuration', 'Fiber Installation', 'Troubleshooting']),
        join_date: '2023-06-15',
        completed_jobs: 45,
        rating: 4.8,
        efficiency: 92
      },
      {
        id: uuidv4(),
        name: 'Sari Dewi',
        email: 'sari.dewi@isp.com',
        phone: '+62812345679',
        role: 'technician',
        team: 'Team Beta',
        area: 'Jakarta Selatan',
        skills: JSON.stringify(['Router Configuration', 'Customer Support', 'Network Security']),
        join_date: '2023-03-10',
        completed_jobs: 38,
        rating: 4.6,
        efficiency: 87
      }
    ];

    for (const member of staff) {
      await connection.execute(
        `INSERT IGNORE INTO staff (id, name, email, phone, role, team, area, skills, join_date, completed_jobs, rating, efficiency) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [member.id, member.name, member.email, member.phone, member.role, member.team, member.area, member.skills, member.join_date, member.completed_jobs, member.rating, member.efficiency]
      );
    }

    console.log('✅ Sample data inserted successfully');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// Run initialization
initDatabase();