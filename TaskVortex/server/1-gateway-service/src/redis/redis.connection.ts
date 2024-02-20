import { config } from '@gateway/config';
import { createClient } from 'redis';


type RedisClient = ReturnType<typeof createClient>;


class RedisConnection {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: `${config.REDIS_HOST}`});
  }

  async redisConnect(): Promise<void> {
    try {
      await this.client.connect();
      console.log(`GatewayService Redis Connection: ${await this.client.ping()}`);
      this.cacheError();
    } catch (error) {
        console.log('error', 'GatewayService redisConnect() method error:', error);
    }
  };

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
        console.log(error);
    });
  };
}

export const redisConnection: RedisConnection = new RedisConnection();