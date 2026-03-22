import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  eventId: string;
  userId: string;
  status: 'reserved' | 'confirmed' | 'cancelled' | 'refunded';
  quantity: number;
  totalAmount: number;
  reservedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  paymentId?: string;
  expiresAt?: Date; // For reservation timeout
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  eventId: {
    type: String,
    required: true,
    ref: 'Event'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['reserved', 'confirmed', 'cancelled', 'refunded'],
    default: 'reserved',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  reservedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  cancelledAt: Date,
  paymentId: String,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  }
}, {
  timestamps: true
});

// Indexes
BookingSchema.index({ eventId: 1, userId: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ status: 1, expiresAt: 1 });
BookingSchema.index({ createdAt: -1 });

// Instance method to check if booking is expired
BookingSchema.methods.isExpired = function(): boolean {
  return this.expiresAt && this.expiresAt < new Date();
};

// Instance method to confirm booking
BookingSchema.methods.confirm = function(): void {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  this.expiresAt = undefined;
};

// Instance method to cancel booking
BookingSchema.methods.cancel = function(): void {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
};

// Static method to find expired reservations
BookingSchema.statics.findExpiredReservations = function() {
  return this.find({
    status: 'reserved',
    expiresAt: { $lt: new Date() }
  });
};

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;