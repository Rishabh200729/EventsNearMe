import { Collection, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const client = new MongoClient(uri);

export const db = client.db("auth");
export const UserCollection = db.collection("users") as Collection<UserDoc>;
export const SessionCollection = db.collection("sessions") as Collection<SessionDoc>;
export const EventCollection = db.collection("events") as Collection<EventDoc>;
export const RSVPCollection = db.collection("rsvps") as Collection<RSVPDoc>;

// Ensure geospatial index
EventCollection.createIndex({ location: "2dsphere" }).catch(err => {
  console.error("Failed to create geospatial index:", err);
});

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

interface SessionDoc {
  _id: string;
  expires_at: Date;
  user_id: string;
}

interface EventDoc {
  _id: string;
  userId: string;
  name: string;
  description: string;
  date: string;
  category?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  organizerId?: string;
  maxAttendees?: number;
  attendeesCount?: number;
}

interface RSVPDoc {
  _id: string;
  eventId: string;
  userId: string;
  timestamp: Date;
}

export const findEventsFromUserID = async (category?: string) => {
  const query = category ? { category } : {};
  const events = await EventCollection.find(query).toArray();
  const users = await UserCollection.find({}).toArray();
  const rsvps = await RSVPCollection.find({}).toArray();
  return { events, users, rsvps };
}

export const findEventById = async (id: string) => {
  const event = await EventCollection.findOne({ _id: id });
  if (!event) return null;
  const organizer = await UserCollection.findOne({ _id: event.organizerId });
  const rsvps = await RSVPCollection.find({ eventId: id }).toArray();
  return { event, organizer, rsvps };
}