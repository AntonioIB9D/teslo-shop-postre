import { Injectable } from '@nestjs/common';
import { ProductosService } from 'src/productos/productos.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productosService: ProductosService) {}

  async runSeed() {
    await this.insertNewProducts();

    return 'SEED EXECUTED';
  }

  private async insertNewProducts() {
    //Eliminamos todos los datos en la BD
    this.productosService.deleteAllProducts();

    //Se utilizara el mismo create de productos.service
    //Tomaremos los productos del initialData - Luce muy parecido al DTO
    const products = initialData.products;

    //Se crearan varios inserts, pero de manera simultanea
    const insertPromises = [];
    //Se barreran los productos, con cada producto se realiza el código de la inserción
    products.forEach((product) => {
      // El create es una Promesa, se ejecuta, pero solo se añade al arreglo de promesas
      insertPromises.push(this.productosService.create(product));
    });

    // Espera a que todas las promesas se resuelvan, cuando se resuelvan continuara
    await Promise.all(insertPromises);

    return true;
  }
}
