import { Application } from 'express';

import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { currentUserRoutes } from './routes/current-user';
import { authMiddleware } from './services/auth-middleware';
import { buyerRoutes } from './routes/buyer';
import { sellerRoutes } from './routes/seller';
import { gigRoutes } from './routes/gig';
import { messageRoutes } from './routes/message';

//http://localhost:4000/gateway-health
const BASE_PATH = '/api/gateway/v1';
export const appRoutes = (app: Application) => {
app.use('', healthRoutes.routes());
app.use(BASE_PATH, authRoutes.routes());
app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
app.use(BASE_PATH, authMiddleware.verifyUser, buyerRoutes.routes());
app.use(BASE_PATH, authMiddleware.verifyUser, sellerRoutes.routes());
app.use(BASE_PATH, authMiddleware.verifyUser, gigRoutes.routes());
app.use(BASE_PATH, authMiddleware.verifyUser, messageRoutes.routes());
};
