import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order";
import User from "../models/User";
import Event from "../models/Event";

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
const toNum = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

type IncomingTicket = {
  categoryId: string; // ObjectId string from Event.ticketCategories._id
  quantity: number; // number of tickets requested
};

/** Build normalized ticket line items from the event doc + incoming tickets. */
function buildLineItems(event: any, tickets: IncomingTicket[]) {
  const lineItems: {
    categoryId: any;
    name: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const reqT of tickets) {
    const cat = event.ticketCategories.find(
      (c: any) => c._id.toString() === reqT.categoryId
    );
    if (!cat) {
      throw new Error(`Ticket category not found: ${reqT.categoryId}`);
    }

    const price = toNum(cat.price);
    const remaining = toNum(cat.remainingTickets);
    const qty = toNum(reqT.quantity);

    if (qty <= 0) {
      throw new Error(`Invalid quantity for category ${cat.name}.`);
    }
    if (remaining >= 0 && qty > remaining) {
      throw new Error(
        `Requested ${qty} tickets exceeds remaining (${remaining}) for category ${cat.name}.`
      );
    }

    lineItems.push({
      categoryId: cat._id,
      name: cat.name,
      price,
      quantity: qty,
    });
  }

  return lineItems;
}

/** Compute order totals. Discount is % from event.promoCodes[]. */
function computeTotals(
  lineItems: { price: number; quantity: number }[],
  promoPercent?: number
) {
  const totalAmount = lineItems.reduce(
    (sum, t) => sum + t.price * t.quantity,
    0
  );
  const discountAmount =
    promoPercent && promoPercent > 0
      ? (totalAmount * promoPercent) / 100
      : 0;
  const finalAmount = Math.max(totalAmount - discountAmount, 0);
  return { totalAmount, discountAmount, finalAmount };
}

/* -------------------------------------------------
   POST /api/orders/validate-promo
   Validate promo & return totals (no order created).
-------------------------------------------------- */
export const validatePromo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { eventId, promoCode, tickets } = req.body as {
    eventId: string;
    promoCode: string;
    tickets: IncomingTicket[];
  };

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  let lineItems;
  try {
    lineItems = buildLineItems(event, tickets);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    return;
  }

  const promo = promoCode
    ? event.promoCodes?.find((p: any) => p.code === promoCode)
    : null;

  const { totalAmount, discountAmount, finalAmount } = computeTotals(
    lineItems,
    promo?.discount
  );

  if (!promo) {
    res.json({
      valid: false,
      message: "Invalid promo code",
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
    });
    return;
  }

  res.json({
    valid: true,
    discountPercent: promo.discount,
    discountAmount,
    totalAmount,
    finalAmount,
  });
});

/* -------------------------------------------------
   POST /api/orders
   Create order (multi-ticket, optional promo).
-------------------------------------------------- */
export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { clerkId, eventId, tickets, razorpayId } = req.body as {
    clerkId: string;
    eventId: string;
    tickets: IncomingTicket[];
    razorpayId: string;
  };

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  let lineItems;
  try {
    if (!Array.isArray(tickets) || tickets.length !== 1) {
      throw new Error("Only one ticket category is allowed per order.");
    }

    lineItems = buildLineItems(event, tickets);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    return;
  }

  const { totalAmount } = computeTotals(lineItems);
  const finalAmount = totalAmount; // No promo, so final = total
  const discountAmount = 0;

  const newOrder = await Order.create({
    razorpayId: razorpayId || uuidv4(),
    event: event._id,
    buyer: user._id,
    tickets: lineItems.map((t) => ({
      categoryId: t.categoryId,
      name: t.name,
      price: t.price,
      quantity: t.quantity,
    })),
    discountAmount,
    totalAmount,
    finalAmount,
  });

  for (const li of lineItems) {
    const cat = event.ticketCategories.find(
      (c: any) => c._id.toString() === li.categoryId.toString()
    );
    if (cat) {
      const current = toNum(cat.remainingTickets);
      const next = current - li.quantity;
      cat.remainingTickets = String(Math.max(next, 0));
    }
  }
  await event.save();

  res.status(201).json({
    success: true,
    order: newOrder,
    amountToPay: finalAmount,
  });
});


/* -------------------------------------------------
   GET /api/orders/user/:clerkId
-------------------------------------------------- */
export const getOrdersByUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { clerkId } = req.params;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const orders = await Order.find({ buyer: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "event",
      select: "title imageUrl location startDateTime endDateTime",
    })
    .populate({
      path: "buyer",
      select: "firstName lastName",
    });

  res.json(orders);
});

/* -------------------------------------------------
   GET /api/orders/:orderId/user/:clerkId
-------------------------------------------------- */
export const getOrderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId, clerkId } = req.params;

  const user = await User.findOne({ clerkId });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const order = await Order.findById(orderId)
    .populate({
      path: "event",
      select: "title imageUrl location startDateTime endDateTime",
    })
    .populate({
      path: "buyer",
      select: "firstName lastName",
    });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  if (order.buyer.toString() !== user._id.toString()) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  res.json(order);
});

/* -------------------------------------------------
   GET /api/orders/:orderId
-------------------------------------------------- */
export const getOrderDetailsById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate({
      path: "event",
      select: "title imageUrl location startDateTime endDateTime",
    })
    .populate({
      path: "buyer",
      select: "firstName lastName",
    });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json(order);
});
