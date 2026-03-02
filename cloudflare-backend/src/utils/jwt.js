import { sign as jwtSign, verify as jwtVerify } from '@tsndr/cloudflare-worker-jwt';

export const sign = async (payload, secret) => {
  return await jwtSign(payload, secret);
};

export const verify = async (token, secret) => {
  const isValid = await jwtVerify(token, secret);
  if (!isValid) {
    throw new Error('Invalid token');
  }
  // Decode payload
  const decoded = JSON.parse(atob(token.split('.')[1]));
  return decoded;
};
