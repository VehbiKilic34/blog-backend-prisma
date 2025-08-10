import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET!;

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token gerekli.' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token gerekli.' });

  try {
    const payload = jwt.verify(token, accessSecret) as { userId: number; role: string };
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(403).json({ message: 'Geçersiz token.' });
  }
}
