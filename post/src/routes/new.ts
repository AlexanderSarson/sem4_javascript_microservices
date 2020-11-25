import express, { Request, Response } from 'express';
import {
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@alsafullstack/common';
import { body } from 'express-validator';
import { Post } from '../models/post';

const router = express.Router();

router.post(
  '/api/post',
  requireAuth,
  [
    body('name').not().isEmpty().withMessage('name is required'),
    body('text').not().isEmpty().withMessage('text is required'),
    body('taskSolution')
      .not()
      .isEmpty()
      .withMessage('taskSolution is required'),
    body('isUrl')
      .isBoolean()
      .withMessage('isUrl is required and must be in boolean'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 to 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 to 180'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, text, isUrl, taskSolution, longitude, latitude } = req.body;

    const post = Post.build({
      name,
      text,
      isUrl,
      taskSolution,
      latitude,
      longitude,
    });
    await post.save();

    res.status(201).send(post);
  }
);

export { router as newPostRouter };
