import {env} from './environment.js';
import mongoose from 'mongoose';

const MONGODB_URL = env.MONGODB_URL;
const DATABASE_NAME = env.DATABASE_NAME;
export const connectDB = async () => {
  await mongoose.connect(MONGODB_URL, {
    dbName: DATABASE_NAME
  });
  console.log('MongoDB connected');
  console.log(`Database Name: ${DATABASE_NAME}`);
};