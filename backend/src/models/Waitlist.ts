import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWaitlist extends Document {
  _id: Types.ObjectId;
  eventId: string;
  userId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    eventId: {
      type: String,
      required: true,
      ref: 'Event',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WaitlistSchema.index({ eventId: 1, userId: 1 }, { unique: true });
WaitlistSchema.index({ eventId: 1, createdAt: 1 }); // FIFO ordering

export const Waitlist = mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);
export default Waitlist;
