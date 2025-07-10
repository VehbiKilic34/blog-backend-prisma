import { Router } from 'express';
import { PostTagController } from './post-tag.controller';

const router = Router();
const controller = new PostTagController();

// /posts/:id/tags
router.post('/:id/tags', controller.addTag);
router.delete('/:id/tags', controller.removeTag);

export default router;
