import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Category from '../models/Category';

// GET ALL CATEGORIES
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 }); // optional sort
  res.status(200).json(categories);
});
