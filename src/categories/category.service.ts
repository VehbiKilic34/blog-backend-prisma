import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  async create(data: { name: string }) {
    return await prisma.category.create({ data });
  }

  async findAll() {
    return await prisma.category.findMany({
      where: { deleted_at: null }
    });
  }

  async findOne(id: number) {
    return await prisma.category.findUnique({
      where: { id }
    });
  }

  async update(id: number, data: { name?: string }) {
    return await prisma.category.update({
      where: { id },
      data
    });
  }

  async softDelete(id: number) {
    return await prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}
