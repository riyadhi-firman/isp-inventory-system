const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ISP Inventory System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // Low stock alert
  lowStockAlert: (items) => ({
    subject: '🚨 Low Stock Alert - ISP Inventory System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Low Stock Alert</h2>
        <p>The following items are running low on stock:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Current Stock</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Minimum Stock</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Location</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; color: #dc2626; font-weight: bold;">${item.quantity} ${item.unit}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.min_stock} ${item.unit}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.location}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="color: #6b7280;">Please restock these items as soon as possible.</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated message from ISP Inventory Management System.
        </p>
      </div>
    `
  }),

  // Transaction approval
  transactionApproval: (transaction, items) => ({
    subject: `📋 Transaction Approval Required - #${transaction.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Transaction Approval Required</h2>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Transaction Details</h3>
          <p><strong>ID:</strong> #${transaction.id}</p>
          <p><strong>Type:</strong> ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
          <p><strong>Staff:</strong> ${transaction.staff_name}</p>
          <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleDateString()}</p>
          <p><strong>Notes:</strong> ${transaction.notes}</p>
        </div>
        <h3>Items:</h3>
        <ul>
          ${items.map(item => `
            <li>${item.name} - Quantity: ${item.quantity} ${item.unit}</li>
          `).join('')}
        </ul>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/transactions" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Transaction
          </a>
        </div>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated message from ISP Inventory Management System.
        </p>
      </div>
    `
  }),

  // Welcome email
  welcomeEmail: (user, tempPassword) => ({
    subject: '🎉 Welcome to ISP Inventory System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to ISP Inventory System!</h2>
        <p>Hello ${user.name},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
        <p style="color: #dc2626; font-weight: bold;">
          ⚠️ Please change your password after your first login for security reasons.
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login Now
          </a>
        </div>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated message from ISP Inventory Management System.
        </p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};