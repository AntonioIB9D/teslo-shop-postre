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
import { User } from 'src/auth/entities/user.entity';

@Entity({
  name: 'products',
})
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0,
  })
  price: number;

  /* nullable quiere decir que puede aceptar nulos */
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  /* Producto del URL visitado por el usuario, no se pueden tener dos productos iguales */
  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

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
