import express from 'express';
import { getAllCategories } from '../controllers/category.controller';

const router = express.Router();

router.get('/', getAllCategories); // GET /api/categories

export default router;
