import { auth } from 'express-oauth2-jwt-bearer';

export const jwtCheck = auth({
  audience: 'https://tech-radar.api',
  issuerBaseURL: 'https://dev-6jjybpjc1o3rkh2v.eu.auth0.com',// deine Auth0-Domain + abschließender /
  tokenSigningAlg: 'RS256',
});
