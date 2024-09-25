import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      //En el create() deberemos mandarle un Objeto que luzca como un usuario
      // Recodando que esto no es la inserción, es la preparación
      const user = this.userRepository.create(createUserDto);

      //Guardado del usuario
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  //Función para el manejo de errores
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
