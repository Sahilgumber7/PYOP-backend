import express from 'express';
import { getUserByClerkId } from '../controllers/user.controller';

const router = express.Router();

router.get('/:clerkId', getUserByClerkId);

export default router;