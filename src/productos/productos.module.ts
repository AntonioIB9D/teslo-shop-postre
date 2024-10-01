import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';

import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

import { Producto } from './entities/producto.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [TypeOrmModule.forFeature([Producto, ProductImage]), AuthModule],
  exports: [ProductosService, TypeOrmModule],
})
export class ProductosModule {}
