
import { config } from '@gateway/config';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { Client } from '@elastic/elasticsearch';

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while(!isConnected) {
      console.log('GatewayService Connecting to ElasticSearch');
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        console.log(`GatewayService ElasticSearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        console.log('Connection to ElasticSearch failed, Retrying...');
        console.log('error', 'GatewayService checkConnection() method error:', error);
      }
    }
  }
}

export const elasticSearch: ElasticSearch = new ElasticSearch();