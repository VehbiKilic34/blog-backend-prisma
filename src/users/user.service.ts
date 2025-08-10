import prisma from '../prismaClient';
import { Role } from '../types/role';
import argon2 from 'argon2';

interface CreateUserInput {
  name: string;
  username: string;
  password: string;
  role?: Role;
}

interface UpdateUserInput {
  name?: string;
  username?: string;
  password?: string;
  role?: Role;
}

export async function createUser(data: CreateUserInput) {
  const { name, username, password, role } = data;
  const hashedPassword = await argon2.hash(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      username,
      hashed_password: hashedPassword,
      role: role || Role.member,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      created_at: true,
    },
  });

  return newUser;
}

export async function listUsers() {
  return await prisma.user.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      created_at: true,
    },
  });
}

export async function getUser(id: number) {
  return await prisma.user.findFirst({
    where: { id, deleted_at: null },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      created_at: true,
    },
  });
}

export async function updateUser(id: number, data: UpdateUserInput) {
  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.username) updateData.username = data.username;
  if (data.password) updateData.hashed_password = await argon2.hash(data.password);
  if (data.role) updateData.role = data.role;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      created_at: true,
    },
  });

  return updatedUser;
}

export async function deleteUser(id: number) {
  await prisma.user.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}
