import { config } from '@order/config';
import mongoose from 'mongoose';


const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    console.log('Order service successfully connected to database.');
  } catch (error) {
    console.log('error', 'OrderService databaseConnection() method error:', error);
  }
};

export { databaseConnection };
