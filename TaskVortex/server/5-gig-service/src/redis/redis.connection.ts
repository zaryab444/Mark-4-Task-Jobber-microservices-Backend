import { config } from '@gig/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

const client: RedisClient = createClient({ url: `${config.REDIS_HOST}`});

const redisConnect = async (): Promise<void> => {
  try {
    await client.connect();
    console.log(`GigService Redis Connection: ${await client.ping()}`);
    cacheError();
  } catch (error) {
    console.log('error', 'GigService redisConnect() method error:', error);
  }
};

const cacheError = (): void => {
  client.on('error', (error: unknown) => {
    console.log(error);
  });
};

export { redisConnect, client };
