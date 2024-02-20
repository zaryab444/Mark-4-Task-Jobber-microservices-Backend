import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';

import { ISellerGig } from './interfaces/gig.interface';


const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    console.log('AuthService connecting to ElasticSearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      console.log(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
        console.log('Connection to Elasticsearch failed. Retrying...');
        console.log('error', 'AuthService checkConnection() method:', error);
    }
  }
}

async function checkIfIndexExist(indexName: string): Promise<boolean> {
  const result: boolean = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await checkIfIndexExist(indexName);
    if (result) {
        console.log(`Index "${indexName}" already exist.`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      console.log(`Created index ${indexName}`);
    }
  } catch (error) {
    console.log(`An error occurred while creating the index ${indexName}`);
    console.log('error', 'AuthService createIndex() method error:', error);
  }
}

async function getDocumentById(index: string, gigId: string): Promise<ISellerGig> {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: gigId
    });
    return result._source as ISellerGig;
  } catch (error) {
    console.log('error', 'AuthService elastcisearch getDocumentById() method error:', error);
    return {} as ISellerGig;
  }
}

export { elasticSearchClient, checkConnection, createIndex, getDocumentById };