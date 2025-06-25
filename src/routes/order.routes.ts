import express from 'express';
import {
  createOrder,
  getOrdersByUser,
  getOrderById,
    getOrderDetailsById,
} from '../controllers/order.controller';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
router.post('/', createOrder);

// @route   GET /api/orders/user/:clerkId
// @desc    Get all orders for a user
router.get('/user/:clerkId', getOrdersByUser);

// @route   GET /api/orders/:orderId/user/:clerkId
// @desc    Get a specific order for a user
router.get('/:orderId/user/:clerkId', getOrderById);

router.get('/:orderId', getOrderDetailsById); //

export default router;
