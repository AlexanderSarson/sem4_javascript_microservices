import express, { Request, Response } from 'express';
import {
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@alsafullstack/common';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Position } from '../models/position';
import { PositionCreatedPublisher } from '../events/publishers/position-created-publisher';
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
    if (!user) throw new NotFoundError();

    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + Number(process.env.EXPIRATION_WINDOW_SECONDS)
    );

    const position = await Position.build({
      latitude,
      longitude,
      expiresAt: expiration,
      user,
    });

    new PositionCreatedPublisher(natsWrapper.client).publish({
      id: position.id,
      location: position.location,
      userId: user.id,
      expiresAt: position.expiresAt.toISOString(),
      version: position.version,
    });

    res.status(201).send(position);
  }
);

export { router as newPositionRouter };
