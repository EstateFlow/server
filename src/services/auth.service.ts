import { v4 as uuidv4 } from "uuid";
import {
  comparePassword,
  generateJwt,
  generateRefreshToken,
  hashPassword,
} from "../utils/auth.utils";
import { db } from "../db";
import { users, roleEnum } from "../db/schema/users.schema";
import { eq, gt, and, InferSelectModel } from "drizzle-orm";
import { emailVerificationTokens } from "../db/schema/email_verification_tokens.schema";
import { sendVerificationEmail } from "../services/email.service";
import { refreshTokens } from "../db/schema/refresh_tokens.schema";
import { googleOAuthCredentials } from "../db/schema/google_oauth_credentials.schema";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

type User = InferSelectModel<typeof users>;
type Role = (typeof roleEnum.enumValues)[number];

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RefreshTokenInput {
  refreshToken: string;
}

interface RegisterResult {
  userId: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

interface GoogleAuthInput {
  code: string;
}

interface GoogleAuthResult {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export const register = async ({
  username,
  email,
  password,
  role,
}: RegisterInput): Promise<RegisterResult> => {
  if (!roleEnum.enumValues.includes(role)) {
    throw new Error(
      `Invalid role. Must be one of: ${roleEnum.enumValues.join(", ")}`,
    );
  }
  const passwordHash = await hashPassword(password);
  const verificationToken = uuidv4();

  const userResult = await db
    .insert(users)
    .values({ username, email, passwordHash, role })
    .returning();

  const user: User = userResult[0];
  const userId = user.id;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (isNaN(expiresAt.getTime())) {
    throw new Error("Invalid email verification token expiration date");
  }

  await db.insert(emailVerificationTokens).values({
    userId,
    token: verificationToken,
    expiresAt,
  });

  await sendVerificationEmail(email, verificationToken);
  console.log(`Stored token for user ${userId}: ${verificationToken}`);

  return { userId };
};

export const verifyEmail = async (token: string): Promise<void> => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token format");
  }

  console.log(`Verifying token: ${token}`);

  const tokenResult = await db
    .select({ userId: emailVerificationTokens.userId })
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (tokenResult.length === 0) {
    const userResult = await db
      .select({ isEmailVerified: users.isEmailVerified })
      .from(users)
      .where(
        eq(
          users.id,
          db
            .select({ userId: emailVerificationTokens.userId })
            .from(emailVerificationTokens)
            .where(eq(emailVerificationTokens.token, token)),
        ),
      );

    if (userResult.length > 0 && userResult[0].isEmailVerified) {
      console.log(`User already verified for token: ${token}`);
      return;
    }

    console.log(`Token not found or expired: ${token}`);
    throw new Error("Invalid or expired token");
  }

  const userId = tokenResult[0].userId;

  await db
    .update(users)
    .set({ isEmailVerified: true })
    .where(eq(users.id, userId));

  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token));

  console.log(`Email verified for user ${userId}`);
};

export const login = async ({
  email,
  password,
}: LoginInput): Promise<LoginResult> => {
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  const user = userResult[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new Error("Please verify your email");
  }

  if (!(await comparePassword(password, user.passwordHash || ""))) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateJwt(user.id, email);
  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

export const refreshToken = async ({
  refreshToken,
}: RefreshTokenInput): Promise<RefreshTokenResult> => {
  const tokenResult = await db
    .select({ userId: refreshTokens.userId })
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token, refreshToken),
        gt(refreshTokens.expiresAt, new Date()),
        eq(refreshTokens.revoked, false),
      ),
    );

  if (!tokenResult.length) {
    throw new Error("Invalid or expired refresh token");
  }

  const userId = tokenResult[0].userId;
  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  if (!user.length) {
    throw new Error("User not found");
  }

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.token, refreshToken));

  const accessToken = generateJwt(userId, user[0].email);
  const newRefreshToken = await generateRefreshToken(userId);

  return { accessToken, refreshToken: newRefreshToken };
};

export const googleAuth = async (code: string): Promise<GoogleAuthResult> => {
  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      },
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const { id: google_id, email } = userInfoResponse.data;

    let userResult = await db
      .select({
        id: users.id,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.email, email));

    let userId: string;
    let isNewUser = false;

    if (userResult.length === 0) {
      const userResult = await db
        .insert(users)
        .values({
          email,
          isEmailVerified: true,
          username: email.split("@")[0],
          role: "renter_buyer",
        })
        .returning();
      userId = userResult[0].id;
      isNewUser = true;
    } else {
      userId = userResult[0].id;
      await db
        .update(users)
        .set({ isEmailVerified: true })
        .where(eq(users.id, userId));
    }

    await db
      .insert(googleOAuthCredentials)
      .values({
        userId,
        googleId: google_id,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: googleOAuthCredentials.userId,
        set: {
          googleId: google_id,
          accessToken: access_token,
          refreshToken: refresh_token || null,
          tokenExpiry: new Date(Date.now() + expires_in * 1000),
          updatedAt: new Date(),
        },
      });

    const accessToken = generateJwt(userId, email);
    const refreshToken = await generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
      isNewUser,
    };
  } catch (error) {
    console.error("Error in googleAuth:", error);
    throw new Error("Google authentication failed");
  }
};
