import express, { Request, Response } from 'express';
import { requireAuth } from '@alsafullstack/common';
import { Post } from '../models/post';

const router = express.Router();

router.get('/api/post', requireAuth, async (req: Request, res: Response) => {
  const posts = await Post.find({});

  res.status(200).send(posts);
});

export { router as allPostRouter };
