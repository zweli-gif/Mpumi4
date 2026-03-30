import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const userId = (req as any).auth?.userId;
    if (userId) {
      user = await db.getUserByOpenId(userId);
    }
  } catch (error) {
    user = null;
  }
  return { req, res, user };
}