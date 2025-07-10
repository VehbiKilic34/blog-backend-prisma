import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentService {
  async create(data: {
    post_id: number;
    content: string;
    commenter_name: string;
  }) {
    return await prisma.comment.create({ data });
  }

  async findAll() {
    return await prisma.comment.findMany();
  }

  async findOne(id: number) {
    return await prisma.comment.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<{ content: string; commenter_name: string }>) {
    return await prisma.comment.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await prisma.comment.delete({ where: { id } });
  }
}
