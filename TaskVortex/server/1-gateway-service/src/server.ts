
import  http  from 'http';

import { Application, NextFunction, json, urlencoded, Response, Request} from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

import { config } from './config';
import { appRoutes } from './routes';
import { axiosAuthInstance } from './services/api/auth.service';
import { SocketIOAppHandler } from './sockets/socket';


// import { elasticSearch } from './elasticsearch';


const SERVER_PORT = 4000;
export let socketIO: Server;
export class GatewayServer {
    private app: Application;

    constructor(app: Application){
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routesMiddleware(this.app);
        this.startElasticSearch();
        this.errorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
   app.set('trust proxy' , 1);
   app.use(
    cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
        // sameSite: none
    })
   );
   app.use(hpp());
   app.use(helmet());
   app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
   }));

   app.use((req: Request, _res: Response, next: NextFunction) => {
    if(req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
    }
    next();
   });
    }

    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({limit: '20mb'}));
        app.use(urlencoded({ extended: true, limit: '200mb'}));
    }

    private routesMiddleware(app: Application): void {
        appRoutes(app);
    }

    private startElasticSearch(): void {
// elasticSearch.checkConnection();
    }

    private errorHandler(app: Application): void {
        app.use('*', (req: Request, res: Response, next: NextFunction) => {
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            console.log('error', `${fullUrl} endpoint does not exist.`, '');
            res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.'});
            next();
          });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
          app.use((error: any, _req: Request, res: Response, next: NextFunction) => {
            if (error) {
              console.log('error', `GatewayService ${error.comingFrom}:`, error);
              res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
          });  
    }

    
    private async startServer(app:Application): Promise<void>{
        try{
    const httpServer: http.Server = new http.Server(app);
    const socketIO: Server = await this.createSocketIO(httpServer);
    this.startHttpServer(httpServer);
    this.socketIOConnections(socketIO);
        } catch (error) {
            console.log('error', 'GatewayService startServer() error method', error);     
        }
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
          cors: {
            origin: `${config.CLIENT_URL}`,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          }
        });
        const pubClient = createClient({ url: config.REDIS_HOST }); //publish client
        const subClient = pubClient.duplicate(); //subscribe client
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        socketIO = io;
        return io;
      }

    private async startHttpServer(httpServer: http.Server): Promise<void>{
        try{
console.log(`Gateway server has started with process id ${process.pid}`);
httpServer.listen(SERVER_PORT, () => {
    console.log(`Gateway server runing on port ${SERVER_PORT}`);
});
        } catch (error) {
            console.log('error', 'GatewayService startServer() error method', error);     
        }
    }

    private socketIOConnections(io: Server): void {
        const socketIoApp = new SocketIOAppHandler(io);
        socketIoApp.listen();
      }
}