import express from 'express';
import {
  createOrder,
  validatePromo,
  getOrdersByUser,
  getOrderById,
  getOrderDetailsById,
} from '../controllers/order.controller';

const router = express.Router();

router.post('/validate-promo', validatePromo);
router.post('/', createOrder);
router.get('/user/:clerkId', getOrdersByUser);
router.get('/:orderId/user/:clerkId', getOrderById);
router.get('/:orderId', getOrderDetailsById);

export default router;
