import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET!;

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Access token gerekli' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token gerekli' });
  }

  try {
    const payload = jwt.verify(token, accessSecret);
    // req.user tipi için global augmentation yapılmalı
    req.user = payload as JwtPayload; 
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
}
