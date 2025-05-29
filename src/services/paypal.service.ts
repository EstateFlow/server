import axios from "axios";
import dotenv from "dotenv";
import { sendOrderSuccessEmail } from "./email.service";
import { db } from "../db";
import { properties } from "../db/schema/properties.schema";
import { eq } from "drizzle-orm";

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

export async function captureOrder(orderId: string, email?: string) {
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
      items: res.data.purchase_units[0]?.items,
    };

    const customerEmail = email || res.data.payer?.email_address;

    if (orderDetails.status === "COMPLETED" && customerEmail) {
      await updatePropertyStatusFromOrder(res.data);
      await sendOrderSuccessEmail(customerEmail, orderDetails);
    }

    return orderDetails;
  } catch (error: any) {
    console.error(
      "Failed to capture order:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to capture PayPal order",
    );
  }
}

export async function updatePropertyStatusFromOrder(orderData: any) {
  const item = orderData.purchase_units?.[0]?.items?.[0];
  const sku = item?.sku;
  if (!sku) return;

  const propertyId = sku;

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
