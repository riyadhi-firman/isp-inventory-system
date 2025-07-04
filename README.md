# ISP Inventory Management System

A comprehensive inventory management system designed specifically for Internet Service Providers (ISPs) with full-stack capabilities including frontend React application and backend Node.js API.

## 🚀 Features

### Frontend (React + TypeScript + Tailwind CSS)
- **Dashboard**: Real-time overview of inventory, transactions, and performance metrics
- **Stock Management**: Complete CRUD operations for inventory items with low stock alerts
- **Transaction Management**: Handle installations, maintenance, returns, and borrowing
- **Team Management**: Staff management with performance tracking
- **Customer Management**: Customer profiles with service history and device tracking
- **Reports & Analytics**: Comprehensive reporting with export capabilities
- **Settings**: System configuration and user preferences

### Backend (Node.js + Express + MySQL)
- **RESTful API**: Complete REST API with proper HTTP status codes
- **JWT Authentication**: Secure authentication with role-based access control
- **MySQL Database**: Robust relational database with proper relationships
- **File Upload**: Secure file upload handling with validation
- **Email Service**: Automated email notifications for alerts and approvals
- **Rate Limiting**: API protection against abuse
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Proper error handling and logging

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Nodemailer** for email service
- **Joi** for validation
- **Helmet** for security

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd isp-inventory-management

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

```bash
# Start MySQL service
# On Windows: net start mysql
# On macOS: brew services start mysql
# On Linux: sudo systemctl start mysql

# Create database and tables
npm run server:init
```

### 3. Environment Configuration

Create `server/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=isp_inventory
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Application

```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
# Frontend: npm run dev
# Backend: npm run server:dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

### 6. Default Login Credentials

```
Email: admin@isp.com
Password: admin123
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Stock Management Endpoints
- `GET /api/stock` - Get all stock items
- `POST /api/stock` - Create stock item
- `PUT /api/stock/:id` - Update stock item
- `DELETE /api/stock/:id` - Delete stock item
- `GET /api/stock/alerts/low-stock` - Get low stock alerts

### Staff Management Endpoints
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `GET /api/staff/stats/overview` - Get staff statistics

### Customer Management Endpoints
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `PATCH /api/customers/:id/status` - Update customer status

### Transaction Management Endpoints
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id/approve` - Approve transaction
- `PATCH /api/transactions/:id/reject` - Reject transaction
- `PATCH /api/transactions/:id/complete` - Complete transaction

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get monthly trends
- `GET /api/dashboard/performance` - Get performance metrics

### File Upload Endpoints
- `POST /api/uploads/single` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files
- `GET /api/uploads/file/:filename` - Get file by filename
- `DELETE /api/uploads/:id` - Delete file

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Role-based Access Control** (Admin, Supervisor, Technician)
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent API abuse
- **Input Validation** using Joi schemas
- **File Upload Security** with type and size validation
- **CORS Protection** with configurable origins
- **Helmet.js** for security headers

## 📧 Email Notifications

The system automatically sends email notifications for:
- **Low Stock Alerts** to administrators
- **Transaction Approvals** to supervisors
- **Welcome Emails** for new users

Configure email settings in the `.env` file using Gmail SMTP or your preferred email service.

## 🗄️ Database Schema

The system uses MySQL with the following main tables:
- `users` - System users and authentication
- `stock_items` - Inventory items
- `staff` - Team members and performance data
- `customers` - Customer information and service details
- `transactions` - Transaction records
- `transaction_items` - Items involved in transactions
- `customer_devices` - Devices installed for customers
- `service_history` - Customer service records
- `file_uploads` - File upload metadata

## 🔧 Development

### Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── data/              # Mock data (for development)
├── server/                # Backend source code
│   ├── config/            # Database and app configuration
│   ├── middleware/        # Express middleware
│   ├── routes/            # API route handlers
│   ├── utils/             # Utility functions
│   └── scripts/           # Database initialization scripts
└── public/                # Static assets
```

### Adding New Features

1. **Frontend**: Add components in `src/components/`
2. **Backend**: Add routes in `server/routes/`
3. **Database**: Update schema in `server/scripts/initDatabase.js`
4. **Types**: Update TypeScript types in `src/types/`

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
cd server
NODE_ENV=production npm start
```

### Environment Variables for Production

Update the `.env` file with production values:
- Use strong JWT secrets
- Configure production database
- Set up production email service
- Update CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API health endpoint: `/health`
- Review the console logs for detailed error messages
- Ensure all environment variables are properly configured
- Verify database connection and permissions

## 🔄 Updates and Maintenance

- Regularly update dependencies for security
- Monitor database performance and optimize queries
- Review and rotate JWT secrets periodically
- Backup database regularly
- Monitor file upload storage usage