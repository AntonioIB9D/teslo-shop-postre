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
import { DataSource, Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductosService {
  private readonly logger = new Logger('ProductosService');
  constructor(
    @InjectRepository(Producto)
    private readonly productRepository: Repository<Producto>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  // Creación de un producto
  async create(createProductoDto: CreateProductoDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductoDto;
      //Esto solo crea la instancia del producto con sus propiedades
      const producto = this.productRepository.create({
        ...productDetails,
        //Para las imagenes se crearan instancias del product image
        images: images.map((image) =>
          this.productImageRepository.create({
            url: image,
          }),
        ),
        user,
      });
      // Para guardar e impactar la BD
      await this.productRepository.save(producto);
      return { ...producto, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  // Encontrar todos los elementos mediante paginación
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // Relación que interesa llenar
      relations: {
        images: true,
      },
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
  }
  // Encontrar uno mediante UUID, nombre o slug
  async findOne(term: string) {
    let product: Producto;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // Se le pone un alias a la tabla producto
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(' UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        // Punto donde se hara el Left Join de las imagenes
        // Pide un alias en caso de que se requiera hacer otro Join
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  //Aplanar el formato de imagenes
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  // Actualización de un producto mediante ID
  async update(id: string, updateProductoDto: UpdateProductoDto, user: User) {
    const { images, ...toUpdate } = updateProductoDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    // Create Query Runner
    // Definir procedimientos
    const queryRunner = this.dataSource.createQueryRunner();
    //Conectar el queryRunner con la BD
    await queryRunner.connect();
    //Iniciar la transacción, todo lo que hagamos en este momento, que tenga
    // que ver con el queryRunner va a estar añadiéndolo en estas transacciones
    await queryRunner.startTransaction();

    try {
      //Si vienen imágenes, borrara las anteriores
      // delete elimina los registros de la BD
      // softDelete marca una columna que indica la eliminación, pero aun existe (Mantiene la integridad referencial)
      // delete Pide la entidad target a la cual se quiere afectar
      // También pide un criterio, se debe tener cuidado ya que se puede borrar todas las imagenes
      // El criterio sera que en ProductImage, en la columna de producto sea el id del producto
      // Se borraran todas las imágenes cuya columna ProductId sea igual al id
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id },
        });
        // Se graban las nuevas imágenes
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      product.user = user;
      // QueryRunner guarda la información en la BD
      await queryRunner.manager.save(product);
      /*  await this.productRepository.save(product); */

      // Si no ha dado error hasta este punto, aplica los cambios
      // Hara el commit de la transacción
      await queryRunner.commitTransaction();

      // Una vez haga el commit, ya no se necesita el query Runner
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      // En caso de falla se hace un Rollback de la transacción
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  // Eliminación de un elemento mediante ID
  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
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

  // Función destructiva para eliminar todos los productos de la semilla - Solo Dev
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
