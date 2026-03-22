import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  organizerId: string;
  capacity: number;
  availableSeats: number;
  price: number;
  views: number;
  bookmarks: number;
  recentBookings: number;
  tags?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: Date) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['community', 'music', 'sports', 'tech', 'food', 'art', 'business', 'education']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (coords: number[]) {
          return coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 && // longitude
            coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    },
    address: String
  },
  organizerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100000
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function (this: IEvent, value: number) {
        return value <= this.capacity;
      },
      message: 'Available seats cannot exceed capacity'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  bookmarks: {
    type: Number,
    default: 0,
    min: 0
  },
  recentBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [String],
  images: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
EventSchema.index({ location: '2dsphere' });
EventSchema.index({ date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ organizerId: 1 });
EventSchema.index({ createdAt: -1 });

// Virtual for booking percentage
EventSchema.virtual('bookingPercentage').get(function () {
  return ((this.capacity - this.availableSeats) / this.capacity) * 100;
});

// Instance method to check if event is full
EventSchema.methods.isFull = function (): boolean {
  return this.availableSeats === 0;
};

// Instance method to check if event is upcoming
EventSchema.methods.isUpcoming = function (): boolean {
  return this.date > new Date();
};

export const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;