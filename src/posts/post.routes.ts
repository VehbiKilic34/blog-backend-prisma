import { Router } from 'express';
import { PostController } from './post.controller';

const router = Router();
const controller = new PostController();

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
