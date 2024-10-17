import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}

  //Punto para manejar la conexión
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    //Verificación, en caso de que de error, no dejaremos pasarlo
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    /* console.log({ payload }); */
    /* console.log('Cliente conectado con el id: ', client.id); */

    //Para mandarle un mensaje a todas las personas que están conectadas
    //Para eso se necesita la instancia de WebSocket Server
    // WebSocketServer tiene la información de todos los clientes
    //Se puede utilizar para notificar a todo el mundo de la siguiente forma
    //con emit emitiremos un evento llamado clients-updated y el payload puede ser cualquier cosa
    // un objeto, un arreglo, un boolean
    //getConnectedClients() es un arreglo de strings
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    /* console.log('Cliente desconectado con el id:', client.id); */
    this.messageWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );
  }
  //Espera el nombre del evento por parte del cliente a escuchar
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //Para emitir solo a la persona que se comunico con nosotros
    //message-from-server
    //! Emite únicamente al cliente.
    /* client.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no-message!!',
    }); */

    //! Emite a todos MENOS, al cliente inicial
    /*  client.broadcast.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no-message!!',
    }); */

    //! Emite a todos incluyendo al remitente
    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    });
  }
}
