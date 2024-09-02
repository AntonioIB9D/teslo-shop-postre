import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductosService {
  private readonly logger = new Logger('ProductosService');
  constructor(
    @InjectRepository(Producto)
    private readonly productRepository: Repository<Producto>,
  ) {}

  // Creación de un producto
  async create(createProductoDto: CreateProductoDto) {
    try {
      //Esto solo crea la instancia del producto con sus propiedades
      const producto = this.productRepository.create(createProductoDto);
      // Para guardar e impactar la BD
      await this.productRepository.save(producto);
      return producto;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  // Encontrar todos los elementos mediante paginación
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //Todo: relaciones
    });
  }
  // Encontrar uno mediante UUID, nombre o slug
  async findOne(term: string) {
    let product: Producto;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(' UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  // Actualización de un producto mediante ID
  async update(id: string, updateProductoDto: UpdateProductoDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductoDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return product;
  }

  // Eliminación de un elemento mediante ID
  remove(id: number) {
    return `This action removes a #${id} producto`;
  }

  // Función para el manejo de errores
  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
