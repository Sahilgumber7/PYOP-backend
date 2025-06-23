import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  getEventsByUser,
  getRelatedEventsByCategory,
} from '../controllers/event.controller';

const router = express.Router();

// Create a new event
router.post('/', createEvent);

// Get all events (with optional filters)
router.get('/', getAllEvents);

// Get a single event by ID
router.get('/:id', getEventById);


// Get events by user (organizer)
router.get('/user/:userId', getEventsByUser);

// Get related events by category (excluding one event)
router.get('/related/:categoryId/:eventId', getRelatedEventsByCategory);

export default router;
