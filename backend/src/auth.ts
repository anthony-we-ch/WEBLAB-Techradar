import { auth } from 'express-oauth2-jwt-bearer';
import { CONFIG } from './config';

export const jwtCheck = auth({
  audience: [CONFIG.AUTH0_AUDIENCE, `${CONFIG.AUTH0_ISSUER}userinfo`],
  issuerBaseURL: CONFIG.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256',
});
