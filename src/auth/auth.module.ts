import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    //Definición de la estrategia
    PassportModule.register({ defaultStrategy: 'jwt' }),
    //Configuración del modulo JWT Async
    JwtModule.registerAsync({
      // Importamos el configModule el cual nos permite inyectar el ConfigService
      imports: [ConfigModule],
      inject: [ConfigService],
      //Función que se manda llamar cuando se intente registrar de forma asíncrona el modulo
      useFactory: (configService: ConfigService) => {
        /* console.log('JWT Secret', configService.get('JWT_SECRET'));
        console.log('JWT SECRET', process.env.JWT_SECRET); */
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            // Tiempo de expiración de los tokens
            expiresIn: '2h',
          },
        };
      },
    }),

    //Configuración del modulo JWT
    /* JwtModule.register({
      Llave secreta para firmar los tokens
      secret: process.env.JWT_SECRET,
      signOptions: {
        Tiempo de expiración de los tokens
        expiresIn: '2h',
      },
    }), */
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
