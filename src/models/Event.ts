import { Document, Schema, model, models } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  location?: string;
  createdAt: number;
  imageUrl: string;
  startDateTime: number;
  endDateTime: number;
  isFree: boolean;
  url?: string;
  category: string;
  organizer: string;
  eventType: "private" | "public";
  ticketCategories: {
    _id: Schema.Types.ObjectId;
    name: string;
    price: number;
    totalTickets: number;
    remainingTickets: number;
  }[];
  approvalStatus: "pending" | "approved" | "rejected";
  promoCodes?: { code: string; discount: number }[];
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: String,
  location: String,
  createdAt: { type: Number, default: () => Date.now() },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Number, required: true },
  endDateTime: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
  url: String,
  category: { type: String },
  organizer: { type: String },
  eventType: { type: String, enum: ["private", "public"], required: true },
  ticketCategories: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      totalTickets: { type: Number, required: true },
      remainingTickets: { type: Number, required: true },
    },
  ],
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  promoCodes: [
    {
      code: { type: String, required: true },
      discount: { type: Number, required: true }, // percentage discount
    },
  ],
});

const Event = models.Event || model<IEvent>("Event", EventSchema);
export default Event;
