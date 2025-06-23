import { Document, Schema, model, models } from "mongoose";

export interface IEvent extends Document {
  price: any;
  _id: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: number;
  imageUrl: string;
  startDateTime: number;
  endDateTime: number;
  isFree: boolean;
  url?: string;
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string };
  eventType: 'private' | 'public';
  ticketCategories: {
    name: string;
    price: string;
    totalTickets: string;
    remainingTickets: string;
  }[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  createdAt: { type: Number, default: () => Date.now() },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Number, default: () => Date.now() },
  endDateTime: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
  url: { type: String },

  category: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
  },

  organizer: {
    _id: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },

  eventType: {
    type: String,
    enum: ['private', 'public'],
    required: true,
  },

  ticketCategories: [
    {
      name: { type: String, required: true },
      price: { type: String, required: true },
      totalTickets: { type: String, required: true },
      remainingTickets: { type: String, required: true },
    },
  ],

  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
});

const Event = models.Event || model<IEvent>('Event', EventSchema);
export default Event;
