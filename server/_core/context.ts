import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import { isAllowedSignInEmail } from "@shared/const";
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
        if (!isAllowedSignInEmail(email)) {
          return { req, res, user: null };
        }
        user = (await db.getUserByOpenId(supabaseUser.id)) ?? null;
        if (!user) {
          await db.upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || null,
            email: email,
            loginMethod: supabaseUser.app_metadata?.provider || null,
            lastSignedIn: new Date(),
          });
          user = (await db.getUserByOpenId(supabaseUser.id)) ?? null;
        }
        // Ensure designated admin accounts always have admin role
        const ADMIN_EMAILS = ['albert@thirdspace.africa'];
        if (user && ADMIN_EMAILS.includes(email) && user.role !== 'admin') {
          try {
            await db.updateUser(user.id, { role: 'admin' });
            user = { ...user, role: 'admin' };
          } catch (adminErr) {
            // Don't fail the whole request if admin promotion fails;
            // user still gets their current role
            console.error('[Auth] Failed to auto-promote admin:', adminErr);
          }
        }
      }
    }
  } catch (error) {
    user = null;
  }
  return { req, res, user };
}
