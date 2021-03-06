import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@alsafullstack/common';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/users',
  [
    body('userName').not().isEmpty().withMessage('UserName is required'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
    body('name').not().isEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { userName, password, name } = req.body;
    const role = 'User';

    const existingUser = await User.findOne({
      userName,
    });

    if (existingUser) throw new BadRequestError('Username already in use');

    const user = User.build({ userName, password, name, role });
    await user.save();

    await new UserCreatedPublisher(natsWrapper.client).publish({
      id: user.id!,
      userName: user.userName!,
      name: user.name!,
    });

    // Generate json webtoken
    const userJwt = jwt.sign(
      {
        id: user.id,
        userName: user.userName,
      },
      process.env.JWT_KEY!
    );
    // Store it on the session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as newUserRouter };
