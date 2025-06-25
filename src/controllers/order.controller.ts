
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import User from '../models/User';
import Event from '../models/Event';
import { v4 as uuidv4 } from 'uuid';

// @desc Create a new order (Free or Paid, simple method)
// @route POST /api/orders
// @access Public
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    clerkId,
    razorpayId,
    totalAmount,
    eventId,
    ticketCategory,
  } = req.body;

  // 🔍 Validate user
  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 🔍 Validate event
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // 🎟️ Find selected ticket category
  const selectedTicket = event.ticketCategories.find(
    (t: any) => t.name === ticketCategory.name
  );

  if (!selectedTicket) {
    res.status(404);
    throw new Error('Ticket category not found');
  }

  // 🆓 If free ticket, generate dummy Razorpay ID
  const finalRazorpayId = Number(selectedTicket.price) === 0
    ? uuidv4()
    : razorpayId;

  // 📦 Create the order
  const newOrder = await Order.create({
    razorpayId: finalRazorpayId,
    totalAmount,
    event: event._id,
    buyer: user._id,
    ticketCategory: {
      name: selectedTicket.name,
      _id: selectedTicket._id,
    },
    createdAt: new Date(),
  });

  // 🔽 Decrement remaining tickets (if limited)
  if (selectedTicket.remainingTickets && Number(selectedTicket.remainingTickets) > 0) {
    selectedTicket.remainingTickets = (Number(selectedTicket.remainingTickets) - 1).toString();
    await event.save();
  }

  // ✅ Return the new order
  res.status(201).json(newOrder);
});



// @desc    Get all orders of a user by clerkId
// @route   GET /api/orders/user/:clerkId
// @access  Public
export const getOrdersByUser = asyncHandler(async (req: Request, res: Response) => {
  const { clerkId } = req.params;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const orders = await Order.find({ buyer: user._id })
    .populate('event', 'title')
    .populate('buyer', 'firstName lastName');

  res.json(orders);
});


// @desc    Get a specific order by ID for a user (validate ownership)
// @route   GET /api/orders/:orderId/user/:clerkId
// @access  Public
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, clerkId } = req.params;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const order = await Order.findById(orderId)
    .populate('event', 'title')
    .populate('buyer', 'firstName lastName');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.buyer.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized: Order does not belong to this user');
  }

  res.json(order);
});


export const getOrderDetailsById = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate('event', 'title')
    .populate('buyer', 'firstName lastName');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});