import { config } from '@chat/config';
import mongoose from 'mongoose';


const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    console.log('Chat service successfully connected to database.');
  } catch (error) {
    console.log('error', 'ChatService databaseConnection() method error:', error);
  }
};

export { databaseConnection };
