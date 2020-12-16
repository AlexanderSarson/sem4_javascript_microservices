import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { body } from 'express-validator';
import {
  validateRequest,
  requireAuth,
  BadRequestError,
} from '@alsafullstack/common';
import { natsWrapper } from '../nats-wrapper';
import { UserDeletedPublisher } from '../events/publishers/user-deleted-publisher';

const router = express.Router();

router.delete(
  '/api/users',
  requireAuth,
  [body('userName').not().isEmpty().withMessage('Username is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { userName } = req.body;
    const user = await User.findOne({ userName: userName });

    if (!user) throw new BadRequestError('No user with that username');

    await user.deleteOne();
    await new UserDeletedPublisher(natsWrapper.client).publish({
      id: user.id!,
      userName: user.userName,
    });

    res.status(200).send(user);
  }
);

export { router as deleteUserRouter };
