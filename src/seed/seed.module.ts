import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { ProductosModule } from 'src/productos/productos.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [ProductosModule, AuthModule],
})
export class SeedModule {}
