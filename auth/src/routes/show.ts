import express, { Request, Response } from 'express';
import { NotFoundError } from '@alsafullstack/common';

import { User } from '../models/user';

const router = express.Router();

router.get('/api/users/:username', async (req: Request, res: Response) => {
  const user = await User.findOne({ userName: req.params.username });

  if (!user) throw new NotFoundError();

  res.status(200).send(user);
});

export { router as showUserRouter };
