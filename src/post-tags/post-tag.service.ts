import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostTagService {
  async addTagToPost(post_id: number, tag_id: number) {
    return await prisma.post_tag.create({
      data: { post_id, tag_id }
    });
  }

  async removeTagFromPost(post_id: number, tag_id: number) {
    return await prisma.post_tag.delete({
      where: {
        post_id_tag_id: {
          post_id,
          tag_id
        }
      }
    });
  }
}
