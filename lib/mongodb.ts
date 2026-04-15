// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;


export default dbConnect;

async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }



  if(mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  await mongoose.connect(MONGODB_URI);
  return mongoose;
}