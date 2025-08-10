// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import categoryRoutes from './categories/category.routes';
import postRoutes from './posts/post.routes';
import commentRoutes from './comments/comment.routes';
import tagRoutes from './tags/tag.routes';
import postTagRoutes from './post-tags/post-tag.routes';
import userRoutes from './users/user.routes';
import authRoutes from './auth/auth.routes';

import { authenticateJWT } from './middleware/authenticateJWT.middleware';
import { authorize } from './middleware/auth.middleware';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Public erişim gereken rotalar (örneğin auth)
app.use('/auth', authRoutes);

// Diğer rotalarda önce token doğrula, sonra yetki kontrolü yap
app.use('/categories', authenticateJWT, authorize('category', 'read'), categoryRoutes);
app.use('/posts', authenticateJWT, authorize('post', 'read'), postRoutes);
app.use('/comments', authenticateJWT, authorize('comment', 'read'), commentRoutes);
app.use('/tags', authenticateJWT, authorize('tag', 'read'), tagRoutes);
app.use('/posts', authenticateJWT, authorize('post_tag', 'read'), postTagRoutes); // /posts/:id/tags ile uyumlu
app.use('/users', authenticateJWT, authorize('user', 'read'), userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
