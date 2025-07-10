import { Request, Response } from 'express';
import { PostService } from './post.service';

const service = new PostService();

export class PostController {
  async create(req: Request, res: Response) {
    const post = await service.create(req.body);
    res.status(201).json(post);
  }

  async findAll(req: Request, res: Response) {
    const tagsParam = req.query.tags as string;
    const tagIds = tagsParam ? tagsParam.split(',').map(Number) : undefined;
    const posts = await service.findAll(tagIds);
    res.json(posts);
  }

  async findOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const post = await service.findOne(id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  }

async update(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Geçersiz ID!' });
  }

  const post = await service.update(id, req.body);
  res.json(post);
}

async delete(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const post = await service.softDelete(id);
  res.json({ message: 'Deleted', post });
}

}
