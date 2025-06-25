import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  createdAt: Date;
  razorpayId: string;
  totalAmount: string;
  event: Types.ObjectId;
  buyer: Types.ObjectId;
  ticketCategory: {
    name: string;
    _id: Types.ObjectId;
  };
  CheckIn: boolean;
}

const OrderSchema = new Schema<IOrder>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  razorpayId: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: String,
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketCategory: {
    name: { type: String, required: true },
    _id: { type: Schema.Types.ObjectId, required: true },
  },
  CheckIn: {
    type: Boolean,
    default: false,
  },
});

const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;
