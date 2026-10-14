import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RealtimeGateway');

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Socket.IO Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

    // Authenticate the socket using the JWT the client passed in the
    // `auth` handshake payload, and join a private per-user room so that
    // targeted notifications (order-ready, low-stock, etc.) are only ever
    // delivered to the intended user instead of being broadcast globally.
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'restaurant_erp_super_secret_key_987654321',
        });
        if (payload?.sub) {
          client.join(`user:${payload.sub}`);
          if (payload.restaurantId) {
            client.join(`restaurant:${payload.restaurantId}`);
          }
        }
      }
    } catch (err) {
      this.logger.warn(`Socket auth failed for client ${client.id}: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Fallback manual join, in case a client connects without the auth
  // handshake token (e.g. reused/older clients) and authenticates later.
  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    if (userId) {
      client.join(`user:${userId}`);
    }
  }

  // Broadcasters for various events
  sendOrderUpdate(order: any) {
    this.server.emit('orderUpdate', order);
  }

  sendKitchenUpdate(order: any) {
    this.server.emit('kitchenUpdate', order);
  }

  sendTableUpdate(table: any) {
    this.server.emit('tableUpdate', table);
  }

  sendInventoryUpdate(item: any) {
    this.server.emit('inventoryUpdate', item);
  }

  // Sends a notification ONLY to the targeted user's private room, instead
  // of broadcasting it to every connected client.
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendComplaintUpdate(complaint: any) {
    this.server.emit('complaintUpdate', complaint);
  }

  sendOwnerDashboardUpdate(stats: any) {
    this.server.emit('ownerDashboardUpdate', stats);
  }
}
