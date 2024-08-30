import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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

  //Tags
  //Images
}
