import { Collection, MongoClient } from "mongodb";

const client = new MongoClient("mongodb+srv://duttrishabh26:YkzuoQKv41f07nDB@cluster0.e5boqid.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

client.connect();
export const db = client.db("auth");
export const UserCollection = db.collection("users") as Collection<UserDoc>;
export const SessionCollection = db.collection("sessions") as Collection<SessionDoc>;
export const EventCollection = db.collection("events") as Collection<EventDoc>;

interface UserDoc {
  _id: string;
  name : string;
  email: string;
  password: string;
  role : string;
}

interface SessionDoc {
  _id: string;
  expires_at: Date;
  user_id: string;
}

interface EventDoc{
  _id : string;
  userId: string;
  name : string;
  description : string;
  date : string;
}

export const findEventsFromUserID =  async ()=>{
  const events = await EventCollection.find({}).toArray();
  const users = await UserCollection.find({}).toArray();
  return {events, users};
}