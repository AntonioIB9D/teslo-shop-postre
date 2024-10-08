import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClients {
  [id: string]: Socket;
}

@Injectable()
export class MessageWsService {
  private connectedClients: ConnectedClients = {};

  //Cuando un cliente se conecta
  registerClient(client: Socket) {
    //Se llama al connectedClients con el client.id como llave y este apuntara a client(socket)
    this.connectedClients[client.id] = client;
  }

  //Cuando un cliente se desconecta
  removeClient(clientId: string) {
    //Se manda llamar al delete del connectedClients en el clientId que se recibe como argumento
    delete this.connectedClients[clientId];
  }

  //Obtener el numero de clientes
  //Dependiendo del numero de objetos es el valor que retornara
  //En vez de mandar el lenght se mandaran los ids de los clientes conectados
  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }
}
