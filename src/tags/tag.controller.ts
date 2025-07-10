import { Request, Response } from 'express';
import { TagService } from './tag.service';

const service = new TagService();

export class TagController {

 async create(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Etiket ismi gereklidir.' });
  }

  const tag = await service.create({ name });
  res.status(201).json(tag);
}


  async findAll(_req: Request, res: Response) {
    const tags = await service.findAll();
    res.json(tags);
  }

  async findOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const tag = await service.findOne(id);
    if (!tag) return res.status(404).json({ message: 'Not found' });
    res.json(tag);
  }

async update(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Geçersiz ID' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Güncellenecek alan (name) eksik.' });
  }

  const tag = await service.update(id, { name });
  res.json(tag);
}


  async delete(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const tag = await service.delete(id);
    res.json({ message: 'Tag deleted', tag });
  } catch (err: any) {
    if (err.code === 'P2003') {
      res.status(409).json({
        message: 'Bu etiket hâlâ gönderilerle ilişkili. Önce bağlantıyı kaldırmalısın.'
      });
    } else {
      res.status(500).json({ message: 'Bilinmeyen hata', detay: err });
    }
  }
}

}
