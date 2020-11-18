import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/healthcheck', async (req: Request, res: Response) => {
  res.status(200);
});

export { router as healthCheckRouter };
