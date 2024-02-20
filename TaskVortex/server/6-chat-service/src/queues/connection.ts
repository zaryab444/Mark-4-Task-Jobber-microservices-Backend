import { config } from '@chat/config';
import client, { Channel, Connection } from 'amqplib';

//when a offer is send by the seller to buyer they produce queue in notification service and email sent to buyer
async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    console.log('Chat server connected to queue successfully...');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    console.log('error', 'ChatService createConnection() method error:', error);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}

export { createConnection } ;
