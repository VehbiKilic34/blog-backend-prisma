import dotenv from 'dotenv';
dotenv.config();

import jwt, { SignOptions } from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;

// Tip olarak SignOptions['expiresIn'] kullanıyoruz, string veya number olabilir
const accessExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m';
const refreshExpiresDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;

export function createAccessToken(userId: number, role: string): string {
  const payload = { userId, role };
  const options: SignOptions = { expiresIn: accessExpiresIn as jwt.SignOptions['expiresIn'] };

  return jwt.sign(payload, accessSecret, options);
}

export function createRefreshToken(userId: number): string {
  const payload = { userId };
  const options: SignOptions = { expiresIn: `${refreshExpiresDays}d` };

  return jwt.sign(payload, refreshSecret, options);
}
