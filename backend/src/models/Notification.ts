import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'event_updated' | 'event_deleted' | 'event_reminder' | 'event_completed' | 'organizer_event_completed' | 'waitlist_joined' | 'waitlist_promoted';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['booking_confirmed', 'booking_cancelled', 'event_updated', 'event_deleted', 'event_reminder', 'event_completed', 'organizer_event_completed', 'waitlist_joined', 'waitlist_promoted'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
