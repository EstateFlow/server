import { InferSelectModel } from "drizzle-orm";
import { roleEnum, users } from "../db/schema/users.schema";

export type User = InferSelectModel<typeof users>;
export type Role = (typeof roleEnum.enumValues)[number];

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RegisterResult {
  userId: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResult {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface FacebookAuthResult {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}