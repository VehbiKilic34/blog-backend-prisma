import { Request, Response } from 'express';
import { CommentService } from './comment.service';

const service = new CommentService();

export class CommentController {
  async create(req: Request, res: Response) {
    const comment = await service.create(req.body);
    res.status(201).json(comment);
  }

  async findAll(_req: Request, res: Response) {
    const comments = await service.findAll();
    res.json(comments);
  }

  async findOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const comment = await service.findOne(id);
    if (!comment) return res.status(404).json({ message: 'Not found' });
    res.json(comment);
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const comment = await service.update(id, req.body);
    res.json(comment);
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await service.delete(id);
    res.json({ message: 'Deleted' });
  }
}
