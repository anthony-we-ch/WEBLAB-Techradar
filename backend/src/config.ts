import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const raw = process.env[name];
  if (!raw) throw new Error(`Missing required env var: ${name}`);
  return raw.trim();
}

function withTrailingSlash(u: string) {
  return u.endsWith('/') ? u : u + '/';
}

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3000),
  MONGODB_URI: required('MONGODB_URI'),
  AUTH0_AUDIENCE: required('AUTH0_AUDIENCE'),
  AUTH0_ISSUER: withTrailingSlash(required('AUTH0_ISSUER')),
} as const;

if (process.env.NODE_ENV !== 'production') {
  console.log('[AUTH0] issuer:', CONFIG.AUTH0_ISSUER);
  console.log('[AUTH0] audience:', CONFIG.AUTH0_AUDIENCE);
}