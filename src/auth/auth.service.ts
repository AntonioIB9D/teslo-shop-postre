import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    //Inyección del servicio JwtService para generar el token
    private readonly jwtService: JwtService,
  ) {}

  // Servicio para crear un usuario
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      //En el create() deberemos mandarle un Objeto que luzca como un usuario
      // Recodando que esto no es la inserción, es la preparación
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      //Guardado del usuario
      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // Servicio para hacer login
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    /* Mediante el email, se selecciona los campos deseados, los cuales son email y el password */
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  //Servicio para revalidar el JWT
  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    //Para generar el token debemos usar un servicio llamado JwtService
    const token = this.jwtService.sign(payload);
    return token;
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
