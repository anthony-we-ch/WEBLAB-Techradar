import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3000),
  MONGODB_URI: required('MONGODB_URI'),
  AUTH0_AUDIENCE: required('AUTH0_AUDIENCE'),
  AUTH0_ISSUER: required('AUTH0_ISSUER'),
} as const;