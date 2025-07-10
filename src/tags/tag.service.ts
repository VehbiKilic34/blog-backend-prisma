import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TagService {
  async create(data: { name: string }) {
    return await prisma.tag.create({ data });
  }

  async findAll() {
    return await prisma.tag.findMany();
  }

  async findOne(id: number) {
    return await prisma.tag.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string }) {
    return await prisma.tag.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await prisma.tag.delete({ where: { id } });
  }
}
