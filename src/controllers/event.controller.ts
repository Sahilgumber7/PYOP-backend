import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Event from '../models/Event';
import Category from '../models/Category';
import User from '../models/User';

// CREATE EVENT
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const {
    clerkId,
    title,
    description,
    location,
    startDateTime,
    endDateTime,
    imageUrl,
    eventType,
    categoryId,
    ticketCategories,
    url,
  } = req.body;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404);
    throw new Error('Organizer (user) not found');
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const enrichedTickets = ticketCategories.map((ticket: {
    name: string;
    price: string;
    totalTickets: string;
  }) => ({
    ...ticket,
    remainingTickets: ticket.totalTickets,
  }));

  const isFree = enrichedTickets.every((t: { price: string }) => t.price === "0");

  const newEvent = await Event.create({
    title,
    description,
    location,
    startDateTime: new Date(startDateTime).getTime(), // ✅ convert to timestamp
    endDateTime: new Date(endDateTime).getTime(),     // ✅ convert to timestamp
    imageUrl,
    url,
    eventType,
    isFree,
    organizer: user._id,
    category: category._id,
    ticketCategories: enrichedTickets,
    approvalStatus: 'pending',
  });

  res.status(201).json(newEvent);
});

// GET ALL EVENTS
export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const { query, category, limit = 6, page = 1 } = req.query;

  const titleFilter = query ? { title: { $regex: query, $options: 'i' } } : {};
  const categoryDoc = category
    ? await Category.findOne({ name: { $regex: category.toString(), $options: 'i' } })
    : null;

  const filter: any = {
    ...titleFilter,
    ...(categoryDoc ? { category: categoryDoc._id } : {}),
  };

  const skip = (Number(page) - 1) * Number(limit);

  const events = await Event.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('organizer', 'firstName lastName')
    .populate('category', 'name');

  const count = await Event.countDocuments(filter);

  res.json({ data: events, totalPages: Math.ceil(count / Number(limit)) });
});

// GET EVENT BY ID
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'firstName lastName')
    .populate('category', 'name');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json(event);
});

// UPDATE EVENT
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { clerkId, ...eventData } = req.body;
  const eventId = req.params.id;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.organizer.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized');
  }

  const updated = await Event.findByIdAndUpdate(
    eventId,
    {
      ...eventData,
      startDateTime: new Date(eventData.startDateTime).getTime(), // ✅ timestamp
      endDateTime: new Date(eventData.endDateTime).getTime(),     // ✅ timestamp
      category: eventData.categoryId,
    },
    { new: true }
  );

  res.json(updated);
});

// GET EVENTS BY USER
export const getEventsByUser = asyncHandler(async (req: Request, res: Response) => {
  const { clerkId } = req.params;
  const { page = 1, limit = 6 } = req.query;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const skip = (Number(page) - 1) * Number(limit);

  const events = await Event.find({ organizer: user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('category', 'name');

  const count = await Event.countDocuments({ organizer: user._id });

  res.json({ data: events, totalPages: Math.ceil(count / Number(limit)) });
});

// RELATED EVENTS
export const getRelatedEventsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, eventId } = req.params;
  const { page = 1, limit = 3 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const events = await Event.find({
    category: categoryId,
    _id: { $ne: eventId },
    approvalStatus: 'approved',
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('organizer', 'firstName lastName');

  const count = await Event.countDocuments({
    category: categoryId,
    _id: { $ne: eventId },
    approvalStatus: 'approved',
  });

  res.json({ data: events, totalPages: Math.ceil(count / Number(limit)) });
});
