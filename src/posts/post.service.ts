import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  async create(data: {
    category_id: number;
    title: string;
    content: string;
    published_at?: Date | null;
  }) {
    return await prisma.post.create({ data });
  }

  async findAll(tagIds?: number[]) {
    if (tagIds && tagIds.length > 0) {
      return await prisma.post.findMany({
        where: {
          deleted_at: null,
          post_tags: {
            some: {
              tag_id: { in: tagIds }
            }
          }
        }
      });
    }

    return await prisma.post.findMany({
      where: { deleted_at: null }
    });
  }

  async findOne(id: number) {
    return await prisma.post.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<{ title: string; content: string; published_at: Date }>) {
    return await prisma.post.update({ where: { id }, data });
  }

  async softDelete(id: number) {
    return await prisma.post.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}
