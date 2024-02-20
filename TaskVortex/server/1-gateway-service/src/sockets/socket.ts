import { config } from '@gateway/config';
import { IMessageDocument } from '@gateway/interfaces/chat.interface';
import { IOrderDocument, IOrderNotifcation } from '@gateway/interfaces/order.interface';
import { GatewayCache } from '@gateway/redis/gateway.cache';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';

//reason this variable outside the class is i dont want to initialize in the constructor
let chatSocketClient: SocketClient;
let orderSocketClient: SocketClient;

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache; 

  constructor(io: Server) {
    this.io = io;
    this.gatewayCache = new GatewayCache();
    this.chatSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();
  }

  //listen event from frontend so api gateway act as a server
  public listen(): void {
    this.chatSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();
    this.io.on('connection', async (socket: Socket) => {
      socket.on('getLoggedInUsers', async () => {
        const response: string[] = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
        this.io.emit('online', response);
      });

      socket.on('loggedInUsers', async (username: string) => {
        const response: string[] = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response: string[] = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });
    });
  }

  //this method api act as client for chat service
  //connnection coming from chat service
  private chatSocketServiceIOConnections(): void {
    chatSocketClient = io(`${config.MESSAGE_BASE_URL}`, {
      transports: ['websocket', 'polling'], //if websocket no available try to use polling
      secure: true
    });

    chatSocketClient.on('connect', () => {
        console.log('ChatService socket connected');
    });

    chatSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      console.log('error', 'ChatSocket disconnect reason:', reason);
      chatSocketClient.connect();
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      console.log('error', 'ChatService socket connection error:', error);
      chatSocketClient.connect();
    });

    // custom events
    chatSocketClient.on('message received', (data: IMessageDocument) => {
      this.io.emit('message received', data);
    });

    chatSocketClient.on('message updated', (data: IMessageDocument) => {
      this.io.emit('message updated', data);
    });
  }

  private orderSocketServiceIOConnections(): void {
    orderSocketClient = io(`${config.ORDER_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    orderSocketClient.on('connect', () => {
      console.log('OrderService socket connected');
    });

    orderSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      console.log('error', 'OrderSocket disconnect reason:', reason);
      orderSocketClient.connect();
    });

    orderSocketClient.on('connect_error', (error: Error) => {
      console.log('error', 'OrderService socket connection error:', error);
      orderSocketClient.connect();
    });

    // custom event
    orderSocketClient.on('order notification', (order: IOrderDocument, notification: IOrderNotifcation) => {
      this.io.emit('order notification', order, notification);
    });
  }
};