import express, { Request, Response } from 'express';
import { NotFoundError } from '@alsafullstack/common';
import { Post } from '../models/post';

const router = express.Router();

router.get('/api/post/:postname', async (req: Request, res: Response) => {
  const post = await Post.findOne({ name: req.params.postname });
  if (!post) throw new NotFoundError();

  res.status(200).send(post);
});

export { router as showPostRouter };
