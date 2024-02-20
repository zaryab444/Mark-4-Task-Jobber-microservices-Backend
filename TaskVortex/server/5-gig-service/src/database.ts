import { config } from '@gig/config';
import mongoose from 'mongoose';


const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    console.log('Gig service successfully connected to database.');
  } catch (error) {
    console.log('error', 'GigService databaseConnection() method error:', error);
  }
};

export { databaseConnection };
