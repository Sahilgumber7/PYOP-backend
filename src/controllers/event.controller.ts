import { Request, Response } from 'express';
import Event from '../models/Event';
import Category from '../models/Category';
import User from '../models/User';
import { populateEvent } from '../utils/populateEvent';

/* ──────────────────────────────────────*/
/* Helper: delete events whose endDateTime
   is 4 days in the past                               */
export const deleteExpiredEvents = async () => {
  const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
  const res = await Event.deleteMany({ endDateTime: { $lt: fourDaysAgo } });
  return res.deletedCount;
};

/* ──────────────────────────────────────*/
/*  POST /api/events
    Expected body:
    {
      userId: <ClerkID>,
      categoryId: <MongoCatID>,
      title, description, location, startDateTime, endDateTime,
      imageUrl, eventType, ticketCategories: [...]
    }
*/
export const createEvent = async (req: Request, res: Response) => {
  const { userId: clerkId, categoryId, ...event } = req.body;

  // Find organizer by Clerk ID
  const organizer = await User.findOne({ clerkId });
  if (!organizer) return res.status(404).json({ error: 'User not found' });

  // Find category by ID
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  // Pre‑compute remaining tickets
  const ticketCategories = event.ticketCategories.map((c: any) => ({
    ...c,
    remainingTickets: c.totalTickets,
  }));

  const newEvent = await Event.create({
    ...event,
    organizer,
    category,
    ticketCategories,
    approvalStatus: 'pending',
  });

  res.status(201).json(newEvent);
};

/* ──────────────────────────────────────*/
export const getEventById = async (req: Request, res: Response) => {
  const event = await populateEvent(Event.findById(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
};

/* ──────────────────────────────────────*/
export const getAllEvents = async (req: Request, res: Response) => {
  const { query, limit = 6, page = 1, category } = req.query;

  await deleteExpiredEvents(); // optional house‑keeping

  const titleCond = query ? { title: { $regex: query, $options: 'i' } } : {};
  const categoryDoc = category
    ? await Category.findOne({ name: { $regex: category, $options: 'i' } })
    : null;
  const catCond = categoryDoc ? { category: categoryDoc._id } : {};

  const conditions = { ...titleCond, ...catCond };
  const lim  = Number(limit);
  const skip = (Number(page) - 1) * lim;

  const eventsQuery = Event.find(conditions).sort({ createdAt: -1 }).skip(skip).limit(lim);
  const events      = await populateEvent(eventsQuery);
  const total       = await Event.countDocuments(conditions);

  res.json({ data: events, totalPages: Math.ceil(total / lim) });
};

/* ──────────────────────────────────────*/
export const updateEvent = async (req: Request, res: Response) => {
  const { userId: clerkId, categoryId, ...eventData } = req.body;
  const eventId = req.params.id;

  const organizer = await User.findOne({ clerkId });
  if (!organizer) return res.status(404).json({ error: 'User not found' });

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.organizer.toString() !== organizer._id.toString())
    return res.status(403).json({ error: 'Unauthorized' });

  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const updated = await Event.findByIdAndUpdate(
    eventId,
    { ...eventData, category },
    { new: true }
  );

  res.json(updated);
};

/* ──────────────────────────────────────*/
export const deleteEvent = async (req: Request, res: Response) => {
  await Event.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

/* ──────────────────────────────────────*/
export const getEventsByUser = async (req: Request, res: Response) => {
  const { page = 1, limit = 6 } = req.query;
  const clerkId = req.params.clerkId;

  const user = await User.findOne({ clerkId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const skip = (Number(page) - 1) * Number(limit);
  const eventsQuery = Event.find({ organizer: user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const events = await populateEvent(eventsQuery);
  const total  = await Event.countDocuments({ organizer: user._id });
  res.json({ data: events, totalPages: Math.ceil(total / Number(limit)) });
};

/* ──────────────────────────────────────*/
export const getRelatedEventsByCategory = async (req: Request, res: Response) => {
  const { page = 1, limit = 3 } = req.query;
  const { categoryId, eventId } = req.params;

  const skip = (Number(page) - 1) * Number(limit);
  const conditions = {
    category: categoryId,
    _id: { $ne: eventId },
    approvalStatus: 'approved',
  };

  const eventsQuery = Event.find(conditions)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const events = await populateEvent(eventsQuery);
  const total  = await Event.countDocuments(conditions);
  res.json({ data: events, totalPages: Math.ceil(total / Number(limit)) });
};
