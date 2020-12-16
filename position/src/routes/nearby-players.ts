import express, { Request, Response } from 'express';
import {
  BadRequestError,
  requireAuth,
  validateRequest,
} from '@alsafullstack/common';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Position } from '../models/position';

const router = express.Router();

router.post(
  '/api/position/nearbyplayers',
  requireAuth,
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage(
        'Latitude is required, and must be a number between -90 to 90'
      ),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage(
        'Longitude is required, and must be a number between -180 to 180'
      ),
    body('distance')
      .isFloat({ min: 1 })
      .withMessage(
        'Distance is required, must be a number, and minimum 1 meter'
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { longitude, latitude, distance } = req.body;

    const user = await User.findById(req.currentUser!.id);
    if (!user) throw new BadRequestError('User not found');

    const nearbyPlayers = await Position.findNearbyPlayers({
      longitude,
      latitude,
      distance,
      user,
    });
    res.status(200).send(nearbyPlayers);
  }
);

export { router as findNearbyPlayers };
