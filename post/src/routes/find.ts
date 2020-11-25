import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@alsafullstack/common';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Post } from '../models/post';

const router = express.Router();

router.post(
  '/api/post/find',
  requireAuth,
  [
    body('distance')
      .isFloat({ min: 0, max: 99999 })
      .withMessage(
        'distance is required, and must be a number between 0 to 99999'
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { distance } = req.body;
    const user = await User.findById(req.currentUser!.id);
    if (!user) throw new Error('User not found');
    const post = await Post.findNearbyPost(user, distance);

    if (post) {
      res.status(200).send(post);
    } else {
      res.status(400).send({ message: 'Post not reached', code: 400 });
    }
  }
);

export { router as findPostRouter };
