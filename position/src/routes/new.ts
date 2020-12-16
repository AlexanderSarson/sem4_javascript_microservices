import express, { Request, Response } from 'express';
import {
  BadRequestError,
  requireAuth,
  validateRequest,
} from '@alsafullstack/common';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Position } from '../models/position';
import { PositionUpdatedPublisher } from '../events/publishers/position-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/position',
  requireAuth,
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 to 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 to 180'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;

    const user = await User.findById(req.currentUser?.id);
    if (!user) throw new BadRequestError('User not found');

    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + Number(process.env.EXPIRATION_WINDOW_SECONDS)
    );
    const position = await Position.updatePosition(
      user,
      [latitude, longitude],
      true,
      expiration
    );

    new PositionUpdatedPublisher(natsWrapper.client).publish({
      // @ts-ignore
      id: position.id,
      coordinates: position.location.coordinates,
      // @ts-ignore
      userId: user.id,
      version: position.version,
      expiresAt: position.expiresAt.toISOString(),
      isActive: position.isActive,
    });

    res.status(201).send(position);
  }
);

export { router as newPositionRouter };
