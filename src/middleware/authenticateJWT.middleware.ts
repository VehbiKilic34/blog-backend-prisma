// src/middleware/authenticateJWT.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    // İstersen TypeScript için req.user tipi tanımlanabilir
    // Burada @ts-ignore ile uyarıyı geçici kapatıyoruz:
    // @ts-ignore
    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
}
