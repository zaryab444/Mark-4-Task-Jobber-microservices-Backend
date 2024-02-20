import 'express-async-errors';
import http from 'http';

import { Application } from 'express';
import { healthRoutes } from '@notifications/routes';
// import { checkConnection } from '@notifications/elasticsearch'
import { createConnection } from '@notifications/queues/connection';
 import { Channel } from 'amqplib';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';
// import { config } from '@notifications/config';
const SERVER_PORT = 4001;


export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  // await createConnection();
  const emailChannel: Channel = await createConnection() as Channel;
  await consumeAuthEmailMessages(emailChannel);
 await consumeOrderEmailMessages(emailChannel);

// this code is just for testing consume email for order and auth email
//  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token12345adadda`;
//  const messageDetails = {
//   receiverEmail: `${config.SENDER_EMAIL}`,
//   verifyLink: verificationLink,
//   template: 'verifyEmail'
//  };
//  await emailChannel.assertExchange('jobber-email-notification', 'direct');
//  const message = JSON.stringify(messageDetails);
//  emailChannel.publish('jobber-email-notification', 'auth-email', Buffer.from(message));
}

function startElasticSearch(): void {
 // checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    console.log(`Worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT, () => {
      console.log(`Notification server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    console.log('error', 'NotificationService startServer() method:', error);
  }
}