import http from 'http';

import 'express-async-errors';
import { config } from '@auth/config';
import { Application, Request, Response, NextFunction, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { appRoutes } from '@auth/routes';
import { Channel } from 'amqplib';
import { createConnection } from '@auth/queues/connection';

import { IAuthPayload } from './middleware/auth.interface';
import { CustomError, IErrorResponse } from './middleware/error-handler';

const SERVER_PORT = 4002;

export let authChannel: Channel;

export function start(app: Application): void {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

//this function check the token coming from the api gateway is valid or not
// if this token is valid and contain bearer then set the token to current user
function securityMiddleware(app: Application): void {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routesMiddleware(app: Application): void {
  appRoutes(app);
}

async function startQueues(): Promise<void> {
  authChannel = await createConnection() as Channel;
}

function startElasticSearch(): void {
//   checkConnection();
//   createIndex('gigs');
}

function authErrorHandler(app: Application): void {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    // this is user custom error like show in kibana dashboard
    console.log('error', `AuthService ${error.comingFrom}:`, error);

    // this is user custom error like if user want to login with wrong credential so send the error message
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    console.log(`Authentication server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      console.log(`Authentication server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    console.log('error', 'AuthService startServer() method error:', error);
  }
}