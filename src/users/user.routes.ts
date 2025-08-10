import { Router } from 'express';
import {
  createUserController as createUser,
  listUsersController as listUsers,
  getUserController as getUser,
  updateUserController as updateUser,
  deleteUserController as deleteUser,
} from './user.controller';

import { authenticateJWT } from '../middleware/authenticateJWT.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

// Sadece adminlerin kullanıcı oluşturabileceği rota
router.post('/', authenticateJWT, authorize('user', 'create'), createUser);

// Herkes kullanıcıları listeleyebilir ve görüntüleyebilir
router.get('/', listUsers);
router.get('/:id', getUser);

// Güncelleme ve silme için önce kimlik doğrulama, sonra yetkilendirme
router.patch('/:id', authenticateJWT, authorize('user', 'update'), updateUser);
router.delete('/:id', authenticateJWT, authorize('user', 'delete'), deleteUser);

export default router;
