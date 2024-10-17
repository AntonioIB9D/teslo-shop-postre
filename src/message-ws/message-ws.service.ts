import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  //Al connectedClients vamos a adicionarle el usuario, en vez de que apunte al socket
  //se le puede indicar que el id apunte a un objeto
  [id: string]: { socket: Socket; user: User };
}

@Injectable()
export class MessageWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //Cuando un cliente se conecta
  async registerClient(client: Socket, userId: string) {
    //Se llama al connectedClients con el client.id como llave y este apuntara a client(socket)
    const user = await this.userRepository.findOneBy({ id: userId });
    //Si el usuario no lo encuentra
    if (!user) throw new Error('User not found');
    //Si el usuario no esta activo
    if (!user.isActive) throw new Error('User not active');

    //Verificamos que no haya un cliente con el mismo id conectado
    this.checkUserConection(user);

    this.connectedClients[client.id] = { socket: client, user: user };
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

  /**
   * This TypeScript function retrieves the full name of a user based on their socket ID from a list of
   * connected clients.
   * @param {string} socketId - The `socketId` parameter is a string that represents the unique
   * identifier of a socket connection.
   * @returns The function `getUserFullName` is returning the full name of the user associated with the
   * `socketId` provided as a parameter.
   */
  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  /**
   * The function `checkUserConnection` disconnects any connected client with the same user ID as the
   * provided user.
   * @param {User} user - User
   */
  private checkUserConection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
