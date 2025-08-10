import { Router } from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from './user.controller';

const router = Router();

router.post('/', createUser);
router.get('/', listUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
