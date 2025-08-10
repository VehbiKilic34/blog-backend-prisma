import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

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

// Public routes
app.use('/auth', authRoutes);

// Protected routes with authentication and authorization
app.use('/categories', authenticateJWT, authorize('category', 'read'), categoryRoutes);
app.use('/posts', authenticateJWT, authorize('post', 'read'), postRoutes);
app.use('/posts/:postId/tags', authenticateJWT, authorize('post_tag', 'read'), postTagRoutes);
app.use('/comments', authenticateJWT, authorize('comment', 'read'), commentRoutes);
app.use('/tags', authenticateJWT, authorize('tag', 'read'), tagRoutes);
app.use('/users', authenticateJWT, authorize('user', 'read'), userRoutes);

// 404 handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Hata:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
