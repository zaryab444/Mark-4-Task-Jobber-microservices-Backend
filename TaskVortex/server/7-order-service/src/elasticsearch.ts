import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@order/config';


const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      console.log(`OrderService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      console.log('Connection to Elasticsearch failed. Retrying...');
      console.log('error', 'OrderService checkConnection() method:', error);
    }
  }
};

export {
  checkConnection
};
