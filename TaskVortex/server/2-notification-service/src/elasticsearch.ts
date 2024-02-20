import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@notifications/config';


const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

export async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      console.log(`NotificationService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
        console.log('Connection to Elasticsearch failed. Retrying...');
        console.log('error', 'NotificationService checkConnection() method:', error);
    }
  }
}