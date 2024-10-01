import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  //Para hacer uso de la entidad sera mediante la inyección del repositorio por el constructor
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    //Cuando se usa el constructor por defecto el PassportStrategy necesita mandar llamar al padre
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  //Cuando se tiene un JWT vigente con la fecha de expiración
  //Adicionalmente hace match la firma con el payload
  //Entonces se recibe el payload y se puede validar el payload como se desee

  //Se ejecutara siempre y cuando el token pase las dos validaciones anteriores
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    //Consultar la tabla de usuarios para verificar la existencia de usuario por el email
    const user = await this.userRepository.findOneBy({ id });
    // Si no se encuentra un usuario con email retornamos un error
    if (!user) throw new UnauthorizedException('Token not valid');
    //Si el status del usuario es False, retorna un error
    if (!user.isActive)
      throw new UnauthorizedException('User is inactive, talk with an admin');
    return user;
  }
}
