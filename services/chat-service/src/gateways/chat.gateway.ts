////services/chat-service/src/gateways/chat.gateway.ts`typescript


import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.join(`user:${userId}`);
    console.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(client: Socket, chatId: string) {
    client.join(`chat:${chatId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: Socket,
    payload: { chatId: string; content: string; type?: string }
  ) {
    const userId = client.handshake.query.userId as string;
    const message = await this.chatService.sendMessage(
      payload.chatId,
      userId,
      payload.content,
      payload.type
    );

    this.server.to(`chat:${payload.chatId}`).emit('new_message', message);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, chatId: string) {
    const userId = client.handshake.query.userId as string;
    client.to(`chat:${chatId}`).emit('user_typing', { userId });
  }

  @SubscribeMessage('read_message')
  async handleReadMessage(client: Socket, messageId: string) {
    await this.chatService.markAsRead(messageId);
  }
}