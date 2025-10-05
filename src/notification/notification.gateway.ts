import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtPayload } from 'src/auth/jwt-strategy';
interface AuthenticatedSocket extends Socket {
  data: {
    user?: JwtPayload;
  };
}
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly jwtService: JwtService) {}

  @WebSocketServer() server: Server;
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.query?.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;

      await client.join(`user-${payload.userId}`);

      console.log(`${client.id} ✅ User connected`);
    } catch (error) {
      console.log(error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.userId;
    if (userId) {
      console.log(`❌ User disconnected`);
    } else {
      console.log(`❌ Unknown user disconnected`);
    }
  }
}
