import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(private readonly messageWsService: MessageWsService) {}

  //Punto para manejar la conexión
  handleConnection(client: Socket) {
    /* console.log('Cliente conectado con el id: ', client.id); */
    this.messageWsService.registerClient(client);

    //Para mandarle un mensaje a todas las personas que están conectadas
    //Para eso se necesita la instancia de WebSocket Server
    // WebSockerServer tiene la información de todos los clientes
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
}
