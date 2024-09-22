import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    //Al hacer esto se tiene el control total de la respuesta
    res.sendFile(path);
  }

  @Post('product')
  // Los interceptores interceptan las solicitudes y también interceptar y mutar las respuestas
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      /* limits: { fileSize: 1000} */
      // Storage - Donde quiero almacenarlo
      storage: diskStorage({
        // destination es físicamente donde se quiere almacenar la imagen en el filesystem
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  UploadedProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUrl,
    };
  }
}
