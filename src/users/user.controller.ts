import { Request, Response } from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from './user.service';

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Eksik alan var' });
    }

    const user = await createUser({ name, username, password, role });

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

export const listUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const user = await getUser(id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, username, password, role } = req.body;

  try {
    const updatedUser = await updateUser(id, { name, username, password, role });

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

export const deleteUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await deleteUser(id);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    return res.status(500).json({ message: error.message });
  }
};
