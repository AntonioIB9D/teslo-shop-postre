import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';

/* Definición de los roles para evitar la volatilidad */
export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {
  //Se establece la variable META_ROLES
  return SetMetadata(META_ROLES, args);
};
