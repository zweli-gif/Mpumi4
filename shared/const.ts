export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
export const ALLOWED_SIGN_IN_EMAIL_DOMAINS = [
  "thirdspace.africa",
  "growthfarm.co",
] as const;

export function isAllowedSignInEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  return ALLOWED_SIGN_IN_EMAIL_DOMAINS.some(domain =>
    normalizedEmail.endsWith(`@${domain}`)
  );
}
