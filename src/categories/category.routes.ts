import { Router } from 'express';
import { CategoryController } from './category.controller';

const router = Router();
const controller = new CategoryController();

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
