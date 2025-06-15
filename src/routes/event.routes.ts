import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByUser,
  getRelatedEventsByCategory,
} from '../controllers/event.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

router.post('/', asyncHandler(createEvent));
router.get('/', asyncHandler(getAllEvents));
router.get('/:id', asyncHandler(getEventById));
router.put('/:id', asyncHandler(updateEvent));
router.delete('/:id', asyncHandler(deleteEvent));
router.get('/user/:userId', asyncHandler(getEventsByUser));
router.get('/related/:categoryId/:eventId', asyncHandler(getRelatedEventsByCategory));

export default router;
