import { Request, Response } from 'express';
import { CategoryService } from './category.service';

const service = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response) {
    const { name } = req.body;
    const category = await service.create({ name });
    res.status(201).json(category);
  }

  async findAll(_req: Request, res: Response) {
    const categories = await service.findAll();
    res.json(categories);
  }

  async findOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const category = await service.findOne(id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const category = await service.update(id, req.body);
    res.json(category);
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const category = await service.softDelete(id);
    res.json({ message: 'Deleted', category });
  }
}
