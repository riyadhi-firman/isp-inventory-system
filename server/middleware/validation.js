const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'supervisor', 'technician').default('technician'),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Stock item schema
  stockItem: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    category: Joi.string().valid('router', 'switch', 'cable', 'modem', 'antenna', 'accessory').required(),
    brand: Joi.string().min(1).max(100).required(),
    model: Joi.string().min(1).max(100).required(),
    quantity: Joi.number().integer().min(0).required(),
    min_stock: Joi.number().integer().min(0).required(),
    unit: Joi.string().min(1).max(20).required(),
    location: Joi.string().min(1).max(255).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().max(1000).optional().allow('')
  }),

  // Staff schema
  staff: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    role: Joi.string().valid('technician', 'supervisor', 'admin').required(),
    team: Joi.string().min(1).max(100).required(),
    area: Joi.string().min(1).max(255).required(),
    skills: Joi.array().items(Joi.string()).default([]),
    completed_jobs: Joi.number().integer().min(0).default(0),
    rating: Joi.number().min(1).max(5).default(5.0),
    efficiency: Joi.number().integer().min(0).max(100).default(100)
  }),

  // Customer schema
  customer: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    address: Joi.string().min(5).required(),
    service_type: Joi.string().valid('residential', 'business').required(),
    package_type: Joi.string().min(1).max(100).required(),
    status: Joi.string().valid('active', 'suspended', 'terminated').default('active')
  }),

  // Transaction schema
  transaction: Joi.object({
    type: Joi.string().valid('installation', 'maintenance', 'return', 'borrow').required(),
    staff_id: Joi.string().uuid().required(),
    customer_id: Joi.string().uuid().optional().allow(''),
    notes: Joi.string().min(5).required(),
    items: Joi.array().items(
      Joi.object({
        stock_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        notes: Joi.string().optional().allow('')
      })
    ).min(1).required()
  })
};

module.exports = {
  validateRequest,
  schemas
};