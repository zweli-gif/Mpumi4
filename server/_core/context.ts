import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { createClient } from "@supabase/supabase-js";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (token) {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: { user: supabaseUser } } = await supabase.auth.getUser(token);
      if (supabaseUser) {
        const email = supabaseUser.email || "";
        if (!email.endsWith("@thirdspace.africa")) {
          return { req, res, user: null };
        }
        user = await db.getUserByOpenId(supabaseUser.id);
        if (!user) {
          await db.upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || null,
            email: email,
            loginMethod: supabaseUser.app_metadata?.provider || null,
            lastSignedIn: new Date(),
          });
          user = await db.getUserByOpenId(supabaseUser.id);
        }
      }
    }
  } catch (error) {
    user = null;
  }
  return { req, res, user };
}