import { Request, Response } from 'express';
import argon2 from 'argon2';
import prisma from '../prismaClient';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Eksik alan var' });
    }

    const hashed_password = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        hashed_password,
        role: role || 'member',
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Kullanıcı adı zaten var' });
    }
    return res.status(500).json({ message: error.message });
  }
};


export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        created_at: true,
      },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, username, password } = req.body;

  try {
    const data: any = {};

    if (name) data.name = name;
    if (username) data.username = username;
    if (password) {
      data.hashed_password = await argon2.hash(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    return res.json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Kullanıcı adı zaten var' });
    }
    return res.status(500).json({ message: error.message });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    return res.status(500).json({ message: error.message });
  }
};
