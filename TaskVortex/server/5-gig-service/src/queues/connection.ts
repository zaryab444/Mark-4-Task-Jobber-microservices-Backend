import { config } from '@gig/config';
import client, { Channel, Connection } from 'amqplib';


async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
   console.log('Gig server connected to queue successfully...');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    console.log('error', 'GigService createConnection() method error:', error);
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