import { config } from '@users/config';
import mongoose from 'mongoose';


const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    console.log('Users service successfully connected to database.');
  } catch (error) {
    console.log('error', 'UsersService databaseConnection() method error:', error);
  }
};

export { databaseConnection };