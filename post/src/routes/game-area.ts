import express, { Request, Response } from 'express';
import { requireAuth } from '@alsafullstack/common';
import { gameArea } from '../data/game-data';

const router = express.Router();
const polygonForClient = {
  coordinates: gameArea.coordinates[0].map((point) => {
    return { latitude: point[1], longitude: point[0] };
  }),
};
router.get(
  '/api/post/game/area',
  requireAuth,
  async (req: Request, res: Response) => {
    res.status(200).send(polygonForClient);
  }
);

export { router as gameAreaRouter };
