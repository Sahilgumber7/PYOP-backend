
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import User from '../models/User';

// GET /api/users/:clerkId
export const getUserByClerkId = asyncHandler(async (req: Request, res: Response) => {
  const { clerkId } = req.params;
  const user = await User.findOne({ clerkId });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});
