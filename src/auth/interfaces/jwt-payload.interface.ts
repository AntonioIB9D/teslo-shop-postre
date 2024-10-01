export interface JwtPayload {
  id: string;
  //TODO: Añadir todo lo que se quiera grabar
  //Se recomienda que no sea muy grande ya que debe viajar
  //entre el cliente y el backend en cada una de las peticiones autenticadas
}
