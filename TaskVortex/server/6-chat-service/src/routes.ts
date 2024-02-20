import { Application } from 'express';
import { healthRoutes } from '@chat/routes/health';
import { messageRoutes } from '@chat/routes/message';

import { verifyGatewayRequest } from './middlewares/gateway-middleware';

const BASE_PATH = '/api/v1/message';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, messageRoutes());
};

export { appRoutes };
