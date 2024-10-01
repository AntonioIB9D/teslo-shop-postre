import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /*Solo el admin puede crear productos */
  @Post()
  @Auth()
  create(@Body() createProductoDto: CreateProductoDto, @GetUser() user: User) {
    return this.productosService.create(createProductoDto, user);
  }

  /*Cualquiera puede ver los productos */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productosService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.productosService.findOnePlain(term);
  }

  /*Solo el admin puede actualizar productos */
  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @GetUser() user: User,
  ) {
    return this.productosService.update(id, updateProductoDto, user);
  }
  /*Solo el admin puede eliminar productos */
  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
