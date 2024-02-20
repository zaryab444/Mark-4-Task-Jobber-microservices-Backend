import { Channel } from 'amqplib';;
import { createConnection } from '@users/queues/connection';


const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = await createConnection() as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    console.log(logMessage);
  } catch (error) {
    console.log('error', 'UsersService publishDirectMessage() method error:', error);
  }
};

export { publishDirectMessage };