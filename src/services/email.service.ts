import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { transform } from "typescript";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { properties } from "../db/schema/properties.schema";
import { users } from "../db/schema/users.schema";
import { documents } from "../db/schema/documents.schema";
import { subscriptionPlans } from "../db/schema/subscription_plans.schema";
import { subscriptions } from "../db/schema/subscriptions.schema";

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

export const sendOrderSuccessEmail = async (
  buyerEmail: string,
  orderDetails: any,
  propertyId: string
) => {
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) {
    throw new Error(`Property with ID ${propertyId} not found`);
  }

  const [owner, buyer] = await Promise.all([
    db.select().from(users).where(eq(users.id, property.ownerId)).then((rows) => rows[0]),
    db.select().from(users).where(eq(users.email, buyerEmail)).then((rows) => rows[0]),
  ]);

  const documentType =
    property.transactionType === "rent" ? "rental_agreement" : "deposit_receipt";

  const documentData = {
    orderId: orderDetails.id,
    status: orderDetails.status,
    created: orderDetails.createTime,
    transactionType: property.transactionType,
    property: {
      title: property.title,
      price: property.price,
      currency: property.currency,
      size: property.size,
      rooms: property.rooms,
      address: property.address,
      type: property.propertyType,
    },
    seller: {
      username: owner?.username,
      email: owner?.email,
      role: owner?.role,
    },
    buyer: {
      username: buyer?.username,
      email: buyer?.email,
    },
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: buyerEmail,
    subject: `Confirmation of ${property.transactionType} - ${property.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 8px;">
        <h1 style="color: #2e6da4;">${property.transactionType === 'sale' ? 'Sale' : 'Rental'} Agreement Confirmation</h1>
        
        <p>Dear ${buyer?.username || 'Customer'},</p>
        <p>This is to confirm that the transaction for the following property has been successfully completed.</p>

        <hr>

        <h2>🧾 Transaction Details</h2>
        <ul>
          <li><strong>Order ID:</strong> ${orderDetails.id}</li>
          <li><strong>Status:</strong> ${orderDetails.status}</li>
          <li><strong>Date:</strong> ${new Date(orderDetails.createTime).toLocaleString()}</li>
          <li><strong>Transaction Type:</strong> ${property.transactionType}</li>
        </ul>

        <h2>🏠 Property Information</h2>
        <ul>
          <li><strong>Title:</strong> ${property.title}</li>
          <li><strong>Price:</strong> ${property.price} ${property.currency}</li>
          <li><strong>Size:</strong> ${property.size || 'N/A'} m²</li>
          <li><strong>Rooms:</strong> ${property.rooms || 'N/A'}</li>
          <li><strong>Type:</strong> ${property.propertyType}</li>
          <li><strong>Address:</strong> ${property.address}</li>
        </ul>

        <h2>👤 Seller Information</h2>
        <ul>
          <li><strong>Name:</strong> ${owner?.username || 'N/A'}</li>
          <li><strong>Email:</strong> ${owner?.email || 'N/A'}</li>
        </ul>

        <h2>🧍 Buyer Information</h2>
        <ul>
          <li><strong>Name:</strong> ${buyer?.username || 'N/A'}</li>
          <li><strong>Email:</strong> ${buyer?.email || 'N/A'}</li>
        </ul>

        <hr>

        <p style="margin-top: 20px;">Please keep this confirmation for your records. Thank you for choosing our platform!</p>

        <p>Best regards,<br/>The EstateFlow Team</p>
      </div>
    `,
  };

  if (buyer?.id) {
    await db.insert(documents).values({
      user_id: buyer.id,
      payment_id: orderDetails.id,
      document_type: documentType,
      document_data: documentData,
    });
  }

  await transporter.sendMail(mailOptions);
};

export const sendSubscriptionSuccessEmail = async (
  to: string,
  orderDetails: any,
  subscriptionPlanId: string
) => {
  const [plan, subscription] = await Promise.all([
    db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, subscriptionPlanId)).then(rows => rows[0]),
    db.select().from(subscriptions).where(eq(subscriptions.paypalSubscriptionId, orderDetails.id)).then(rows => rows[0]),
  ]);

  if (!plan || !subscription) {
    console.warn("Plan or subscription not found for email:", { subscriptionPlanId, orderId: orderDetails.id });
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `🎉 Subscription Activated - ${plan.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 8px;">
        <h1 style="color: #2e6da4;">Subscription Successfully Activated</h1>
        <p>Hi there,</p>
        <p>Thank you for purchasing the <strong>${plan.name}</strong> plan.</p>

        <h2>🧾 Order Info</h2>
        <ul>
          <li><strong>Order ID:</strong> ${orderDetails.id}</li>
          <li><strong>Status:</strong> ${orderDetails.status}</li>
          <li><strong>Date:</strong> ${new Date(orderDetails.createTime).toLocaleString()}</li>
        </ul>

        <h2>📋 Plan Details</h2>
        <ul>
          <li><strong>Name:</strong> ${plan.name}</li>
          <li><strong>Description:</strong> ${plan.description || "No description"}</li>
          <li><strong>Price:</strong> ${plan.price} ${plan.currency}</li>
          <li><strong>Duration:</strong> ${plan.durationDays} days</li>
        </ul>

        <h2>📆 Subscription Info</h2>
        <ul>
          <li><strong>Status:</strong> ${subscription.status}</li>
          <li><strong>Start Date:</strong> ${new Date(subscription.startDate).toLocaleDateString()}</li>
          <li><strong>End Date:</strong> ${new Date(subscription.endDate).toLocaleDateString()}</li>
        </ul>

        <p>If you have any questions, feel free to contact our support.</p>
        <p>Best regards,<br/>The EstateFlow Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
