import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';

@Entity({
  name: 'products',
})
export class Producto {
  @ApiProperty({
    example: '1299324d-9628-4b20-b3d9-3cb2e787c8d3',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: '0',
    description: 'Product price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  /* nullable quiere decir que puede aceptar nulos */
  @ApiProperty({
    example: 'Lorem ipsum nulla in anim mollit minim irure commodo.',
    description: 'Product description',
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  /* Producto del URL visitado por el usuario, no se pueden tener dos productos iguales */
  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product SLUG - for SEO',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['M', 'XL', 'XXL'],
    description: 'Product sizes',
    default: 0,
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: 'shirt',
    description: 'Product tags',
    default: 0,
  })
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];
  //Images
  // El callback regrese un ProductImage
  // Relación del ProductImage con nuestra tabla
  // Opciones, cascade: Elimina todo lo relacionado al elemento
  // No es una columna, es una relación
  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];
  /* Primer valor es la entidad con la cual se va a relacionar*/
  /* En el segundo deberá saber como relacionarse con la otra tabla */
  @ManyToOne(() => User, (user) => user.product, {
    eager: true,
  })
  user: User;

  //Permite revisar antes de insertar
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  //@BeforeUpdate
  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
