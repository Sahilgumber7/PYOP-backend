import { Schema, model, models, Document, Types } from "mongoose";

interface TicketCategory {
  name: string;
  price: string;
  totalTickets: string;
  remainingTickets: string;
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  location?: string;
  createdAt: Date;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  isFree: boolean;
  url?: string;

  category: Types.ObjectId;
  organizer: Types.ObjectId;

  eventType: "private" | "public";
  ticketCategories: TicketCategory[];
  approvalStatus: "pending" | "approved" | "rejected";
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: () => new Date() },
    imageUrl: { type: String, required: true },

    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    isFree: { type: Boolean, default: false },
    url: { type: String },

    // References to Category and User models
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },

    eventType: {
      type: String,
      enum: ["private", "public"],
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Event = models.Event || model<IEvent>("Event", EventSchema);
export default Event;
