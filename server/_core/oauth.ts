import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      if (!userInfo.email) {
        res.status(403).json({ error: "Email is required to access this application" });
        return;
      }

      // Check if a user with this email already exists (invited team member)
      const existingUserByEmail = await db.getUserByEmail(userInfo.email);
      
      if (!existingUserByEmail) {
        // User's email is not in the system - they are not an invited team member
        console.log(`[OAuth] Access denied for ${userInfo.email} - not an invited team member`);
        res.status(403).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Access Denied - Growth Farm</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fef7f7; }
              .container { text-align: center; padding: 2rem; max-width: 400px; }
              h1 { color: #991b1b; margin-bottom: 1rem; }
              p { color: #6b7280; line-height: 1.6; }
              .email { font-weight: bold; color: #374151; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Access Denied</h1>
              <p>Sorry, <span class="email">${userInfo.email}</span> is not authorized to access Growth Farm.</p>
              <p>Please contact your administrator to request access.</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      // User exists - update their openId if it's different (linking invited user to real account)
      if (existingUserByEmail.openId !== userInfo.openId) {
        console.log(`[OAuth] Linking invited user ${existingUserByEmail.email} to openId ${userInfo.openId}`);
        await db.updateUserOpenId(existingUserByEmail.id, userInfo.openId);
      }

      // Update user info (name, last signed in, etc.)
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || existingUserByEmail.name || null,
        email: userInfo.email,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
