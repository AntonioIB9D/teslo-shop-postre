import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductosService } from 'src/productos/productos.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productosService: ProductosService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    //Antes de insertar los nuevos productos
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    //Insertar usuarios antes que los nuevos productos
    await this.insertNewProducts(adminUser);

    return 'SEED EXECUTED';
  }

  /* Procedimiento para purgar la BD */
  private async deleteTables() {
    //Primero se necesitan borrar los productos ya que tienen la integridad referencial con el User
    await this.productosService.deleteAllProducts();

    //Eliminar todos los usuarios
    //Al tener cascade borrara las imagenes automaticamente
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  /*Función para insertar usuarios */
  private async insertUsers() {
    const seedUser = initialData.users;

    const users: User[] = [];
    seedUser.forEach((user) => {
      users.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(seedUser);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    //Eliminamos todos los datos en la BD
    this.productosService.deleteAllProducts();

    //Se utilizara el mismo create de productos.service
    //Tomaremos los productos del initialData - Luce muy parecido al DTO
    const products = initialData.products;

    //Se crearan varios inserts, pero de manera simultanea
    const insertPromises = [];
    //Se barreran los productos, con cada producto se realiza el código de la inserción
    products.forEach((product) => {
      //El create es una Promesa, se ejecuta, pero solo se añade al arreglo de promesas
      insertPromises.push(this.productosService.create(product, user));
    });

    // Espera a que todas las promesas se resuelvan, cuando se resuelvan continuara
    await Promise.all(insertPromises);

    return true;
  }
}
