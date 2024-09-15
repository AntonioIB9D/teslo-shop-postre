import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [ProductosModule],
})
export class SeedModule {}
