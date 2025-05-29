import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { transform } from "typescript";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify Your Email",
    html: `
      <h1>Verify Your Email</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPriceChangeNotification = async (
  to: string,
  property: any,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || "default@example.com",
    to,
    subject: `Price Change Notification for ${property.name || "Property"}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Price Change Notification</h1>
          <p>Dear User,</p>
          <p>We have detected a price change for the following property:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Property Name</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${property.name || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Address</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${property.address || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>New Price</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${Number(property.newPrice || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Previous Price</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${Number(property.oldPrice || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Change</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; color: ${property.newPrice > property.oldPrice ? "#e74c3c" : "#27ae60"};">
                ${property.newPrice > property.oldPrice ? "Increased" : "Decreased"} by $${Math.abs(property.newPrice - property.oldPrice).toLocaleString()}
              </td>
            </tr>
          </table>
          <p>For more details, please visit our website.</p>
          <p style="margin-top: 20px;">Best regards,<br>Your Company Name</p>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Price change notification sent to ${to}`);
};

export const sendChangeConfirmationEmail = async (
  to: string,
  token: string,
  type: "email" | "password"
) => {
  const url =
  type === "email"
    ? `${process.env.FRONTEND_URL}/confirm-change/${token}/email`
    : `${process.env.FRONTEND_URL}/confirm-change/${token}/password`;
  const subject =
    type === "email" ? "Confirm Email Change" : "Confirm Password Change";
  const message =
    type === "email"
      ? "Click the link below to confirm your new email address:"
      : "Click the link below to confirm your new password:";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
      <h1>${subject}</h1>
      <p>${message}</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetConfirmationEmail = async (
  to: string,
  token: string,
  type: "email" | "password"
) => {
  const url = `${process.env.FRONTEND_URL}/password-reset/${token}`;
  const subject =
    type === "email" ? "Confirm Email Reset" : "Confirm Password Reset";
  const message =
    type === "email"
      ? "Click the link below to confirm your new email address:"
      : "Click the link below to create your new password:";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
      <h1>${subject}</h1>
      <p>${message}</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderSuccessEmail = async (to: string, orderDetails: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Order Confirmation - ${orderDetails.id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order has been successfully completed.</p>
      <p><strong>Order ID:</strong> ${orderDetails.id}</p>
      <p><strong>Status:</strong> ${orderDetails.status}</p>
      <p><strong>Created:</strong> ${new Date(orderDetails.createTime).toLocaleString()}</p>
      ${orderDetails.items ? `
        <h3>Items:</h3>
        <ul>
          ${orderDetails.items.map((item: any) => `
            <li>
              ${item.name || 'Unnamed item'} - ${item.quantity} x ${item.unit_amount?.value} ${item.unit_amount?.currency_code}
            </li>
          `).join('')}
        </ul>
      ` : ''}
      <p>We appreciate your business!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};