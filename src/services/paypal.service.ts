import axios from "axios";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "production" ? ".production.env" : ".development.env";
dotenv.config({ path: envFile });

const PAYPAL_API = process.env.PAYPAL_API!;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

async function getAccessToken(): Promise<string> {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data.access_token;
}


// TODO Add real links, when frontend is ready

export async function createOrder(total: string, currency = "USD") {
  const accessToken = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
                purchase_units: [{
                    "amount": {
                        "currency_code": currency,
                        "value": total
                    }
                }],
                payment_source: {
                    paypal: {
                        experience_context: {
                            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                            brand_name: 'EstateFlow',
                            locale: 'en-US',
                            landing_page: 'LOGIN',
                            user_action: 'PAY_NOW',
                            return_url: 'https://yourwebsite.com/return',
                            cancel_url: 'https://yourwebsite.com/cancel'
                        }
                    }
                }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

export async function captureOrder(orderId: string) {
  const accessToken = await getAccessToken();

  try {
    const res = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("Failed to capture order:", error.response?.data || error.message);
    throw new Error("Failed to capture PayPal order");
  }
}

