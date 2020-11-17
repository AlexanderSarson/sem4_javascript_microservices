import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { bryptCheckAsync } from '../services/bcrypt-async-helper';
import { validateRequest, BadRequestError } from '@alsafullstack/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('userName').not().isEmpty().withMessage('UserName is required'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { userName, password } = req.body;

    const existingUser = await User.findOne({ userName });

    if (!existingUser) throw new BadRequestError('Invalid credentials');

    const passwordsMatch = await bryptCheckAsync(
      password,
      existingUser.password
    );

    if (!passwordsMatch) throw new BadRequestError('Invalid credentials');

    // Generate json webtoken
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        userName: existingUser.userName,
      },
      process.env.JWT_KEY!
    );
    // Store it on the session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinUserRouter };
