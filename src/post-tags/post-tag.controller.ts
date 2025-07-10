import { Request, Response } from 'express';
import { PostTagService } from './post-tag.service';

const service = new PostTagService();

export class PostTagController {
  async addTag(req: Request, res: Response) {
    const post_id = parseInt(req.params.id);
    const { tag_id } = req.body;
    
    if (isNaN(post_id) || !tag_id) {
    return res.status(400).json({ message: 'post_id veya tag_id eksik ya da geçersiz!' });
  }

  const result = await service.addTagToPost(post_id, tag_id);
  res.status(201).json(result);
  }

  async removeTag(req: Request, res: Response) {
    const post_id = parseInt(req.params.id);
    const { tag_id } = req.body;
    await service.removeTagFromPost(post_id, tag_id);
    res.json({ message: 'Tag removed from post' });
  }
}
