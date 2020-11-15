import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { body } from 'express-validator';
// import { validateRequest } from '../middlewares/validate-request';
// import { NotFoundError } from '../errors/not-found-error';
// import { requireAuth } from '../middlewares/require-auth';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  BadRequestError,
} from '@alsafullstack/common';

const router = express.Router();

router.delete(
  '/api/users',
  requireAuth,
  [body('userName').not().isEmpty().withMessage('Username is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { userName } = req.body;
    const user = await User.findOne({ userName });

    if (!user) throw new BadRequestError('No user with that username');

    await user.deleteOne();

    res.status(200).send(user);
  }
);

export { router as deleteUserRouter };
