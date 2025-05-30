import axios from "axios";
import dotenv from "dotenv";
import { sendOrderSuccessEmail, sendSubscriptionSuccessEmail } from "./email.service";
import { db } from "../db";
import { properties } from "../db/schema/properties.schema";
import { subscriptions } from "../db/schema/subscriptions.schema";
import { subscriptionPlans } from "../db/schema/subscription_plans.schema";
import { users } from "../db/schema/users.schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".production.env"
    : ".development.env";
dotenv.config({ path: envFile });

const PAYPAL_API = process.env.PAYPAL_API!;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

const paypalClient = axios.create({
  headers: {
    "Accept-Encoding": "gzip, deflate",
  },
});

async function getAccessToken(): Promise<string> {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64",
  );

  const res = await paypalClient.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return res.data.access_token;
}

export async function createOrder(
  amount: string,
  item: {
    name: string;
    description?: string;
    sku: string;
    category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
  },
  currency = "USD",
) {
  const accessToken = await getAccessToken();

  const res = await paypalClient.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount,
              },
            },
          },
          items: [
            {
              name: item.name,
              unit_amount: {
                currency_code: currency,
                value: amount,
              },
              quantity: "1",
              description: item.description,
              sku: item.sku,
              category: item.category || "PHYSICAL_GOODS",
            },
          ],
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "EstateFlow",
            locale: "en-US",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.FRONTEND_URL}/complete-payment`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel-payment`,
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return res.data;
}

export async function captureOrder(orderId: string, propertyId: string, email?: string) {
  const accessToken = await getAccessToken();

  try {
    const res = await paypalClient.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const orderDetails = {
      id: res.data.id,
      status: res.data.status,
      createTime: res.data.create_time,
      updateTime: res.data.update_time,
    };

    const customerEmail = email || res.data.payer?.email_address;

    if (orderDetails.status === "COMPLETED" && customerEmail) {
      await updatePropertyStatus(propertyId);
      await sendOrderSuccessEmail(customerEmail, orderDetails, propertyId);
    }

    return orderDetails;
  } catch (error: any) {
    console.error("Failed to capture order:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to capture PayPal order");
  }
}


export async function updatePropertyStatus(propertyId: string) {
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) return;

  const status =
    property.transactionType === "sale"
      ? "sold"
      : property.transactionType === "rent"
        ? "rented"
        : undefined;

  if (!status) return;

  await db
    .update(properties)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(properties.id, propertyId));
}

export async function createSubscriptionOrder(
  amount: string,
  item: {
    name: string;
    description?: string;
    category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
  },
  currency = "USD",
) {
  const accessToken = await getAccessToken();

  const res = await paypalClient.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount,
              },
            },
          },
          items: [
            {
              name: item.name,
              unit_amount: {
                currency_code: currency,
                value: amount,
              },
              quantity: "1",
              description: item.description,
              category: item.category || "DIGITAL_GOODS",
            },
          ],
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "EstateFlow",
            locale: "en-US",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.FRONTEND_URL}/complete-subscription`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel-subscription`,
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return res.data;
}

export async function captureSubscriptionOrder(
  orderId: string,
  userId: string,
  subscriptionPlanId: string,
  email?: string
) {
  const accessToken = await getAccessToken();

  try {
    const res = await paypalClient.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const orderDetails = {
      id: res.data.id,
      status: res.data.status,
      createTime: res.data.create_time,
      updateTime: res.data.update_time,
    };

    const customerEmail = email || res.data.payer?.email_address;

    if (orderDetails.status === "COMPLETED" && customerEmail) {
      await createSubscription(userId, subscriptionPlanId, orderDetails.id);
      await sendSubscriptionSuccessEmail(customerEmail, orderDetails, subscriptionPlanId);
    }

    return orderDetails;
  } catch (error: any) {
    console.error("Failed to capture subscription order:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to capture PayPal subscription order");
  }
}

async function createSubscription(
  userId: string,
  subscriptionPlanId: string,
  paypalSubscriptionId: string
) {
  const plan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, subscriptionPlanId))
    .then((rows) => rows[0]);

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + Number(plan.durationDays));

  await db.insert(subscriptions).values({
    id: uuidv4(),
    userId,
    subscriptionPlanId,
    paypalSubscriptionId,
    status: "active",
    startDate: now,
    endDate,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(users)
    .set({
      role: "agency",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
