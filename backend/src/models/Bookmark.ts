import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  eventId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
export default Bookmark;
