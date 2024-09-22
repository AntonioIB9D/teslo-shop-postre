import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    //Contruir el path para que se pueda mostrar la imagen
    // Join permite unir todos los argumentos y normaliza el path resultante
    //Path físico donde se encuentra la imagen en el servidor
    const path = join(__dirname, '../../static/products', imageName);
    //existsSync devuelve true si el path existe
    if (!existsSync(path)) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }
    return path;
  }
}
