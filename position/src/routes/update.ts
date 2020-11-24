import express, { Request, Response } from 'express';
import {
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@alsafullstack/common';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Position } from '../models/position';
import { PositionUpdatedPublisher } from '../events/publishers/position-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/position/:id',
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
    const position = await Position.findById(req.params.id);

    if (!position)
      throw new NotFoundError('Position not found with id: ' + req.params.id);

    const user = await User.findById(req.currentUser?.id);
    if (!user) throw new NotFoundError('User not found');

    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + Number(process.env.EXPIRATION_WINDOW_SECONDS)
    );

    position.set({
      coordinates: [longitude, latitude],
      expiresAt: expiration,
    });
    await position.save();

    new PositionUpdatedPublisher(natsWrapper.client).publish({
      id: position.id,
      coordinates: position.location.coordinates,
      userId: String(req.currentUser?.id),
      version: position.version,
      expiresAt: position.expiresAt.toISOString(),
    });

    res.send(position);
  }
);

export { router as updatePositionRouter };
