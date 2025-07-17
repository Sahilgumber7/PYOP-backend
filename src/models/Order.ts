import { Schema, model, models, Document, Types } from "mongoose";

export interface IOrder extends Document {
  createdAt: Date;
  razorpayId: string;
  totalAmount: number; // before discount
  finalAmount: number; // after discount
  discountAmount: number;
  promoCode?: string;
  event: Types.ObjectId;
  buyer: Types.ObjectId;
  tickets: {
    categoryId: Types.ObjectId;
    name: string;
    quantity: number;
    price: number; // per ticket price
  }[];
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
  totalAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  promoCode: { type: String, default: null },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tickets: [
    {
      categoryId: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  CheckIn: {
    type: Boolean,
    default: false,
  },
});

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
