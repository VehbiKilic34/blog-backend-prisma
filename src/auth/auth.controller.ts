import { Request, Response } from 'express';
import argon2 from 'argon2';
import prisma from '../prismaClient';
import jwt from 'jsonwebtoken';
import { createAccessToken, createRefreshToken } from './jwt';

const refreshSecret = process.env.JWT_REFRESH_SECRET!;
const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshExpiresDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;

function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, refreshSecret) as { userId: number; iat: number; exp: number };
  } catch {
    return null;
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Eksik alan var.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Kullanıcı adı zaten var.' });
    }

    const hashed_password = await argon2.hash(password);

    const user = await prisma.user.create({
      data: { name, username, hashed_password, role: 'member' },
    });

    const accessToken = createAccessToken(user.id, user.role);
    const refreshToken = createRefreshToken(user.id);

    await prisma.refresh_session.create({
      data: {
        user_id: user.id,
        expires_at: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({ accessToken, refreshToken });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("Gelen body:", req.body)
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Eksik alan var' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.deleted_at) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya parola' });
    }

    const valid = await argon2.verify(user.hashed_password, password);
    if (!valid) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya parola' });
    }

    const accessToken = createAccessToken(user.id, user.role);
    const refreshToken = createRefreshToken(user.id);

    await prisma.refresh_session.create({
      data: {
        user_id: user.id,
        expires_at: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({ accessToken, refreshToken });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Refresh token gerekli.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Refresh token gerekli.' });

    const payload = verifyRefreshToken(token);
    if (!payload) return res.status(401).json({ message: 'Geçersiz refresh token.' });

    const session = await prisma.refresh_session.findFirst({
      where: {
        user_id: payload.userId,
        expires_at: { gt: new Date() },
        revoked_at: null,
      },
      orderBy: { created_at: 'desc' },
    });
    if (!session) return res.status(401).json({ message: 'Refresh token geçersiz veya iptal edilmiş.' });

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });

    const accessToken = createAccessToken(user.id, user.role);
    const newRefreshToken = createRefreshToken(user.id);

    await prisma.refresh_session.create({
      data: {
        user_id: user.id,
        expires_at: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Refresh token gerekli.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Refresh token gerekli.' });

    const payload = verifyRefreshToken(token);
    if (!payload) return res.status(401).json({ message: 'Geçersiz refresh token.' });

    await prisma.refresh_session.updateMany({
      where: {
        user_id: payload.userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    return res.json({ message: 'Başarıyla çıkış yapıldı.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access token gerekli.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token gerekli.' });

    const payload = jwt.verify(token, accessSecret) as { userId: number; role: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    return res.json({ user });
  } catch (error: any) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş access token.' });
  }
};