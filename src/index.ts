import express from 'express';
import categoryRoutes from './categories/category.routes';
import postRoutes from './posts/post.routes';
import commentRoutes from './comments/comment.routes';
import tagRoutes from './tags/tag.routes';
import postTagRoutes from './post-tags/post-tag.routes';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/categories', categoryRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/tags', tagRoutes);
app.use('/posts', postTagRoutes); // dikkat! /posts/id/tags ile uyumlu olur

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
