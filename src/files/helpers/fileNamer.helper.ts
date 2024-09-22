import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: string) => void,
) => {
  if (!file) return callback(new Error('File is empty'), '');

  //Tomar la extensión del nombre
  const fileExtension = file.mimetype.split('/')[1];

  // Nombre de archivo que se quiere poner
  const fileName = `${uuid()}.${fileExtension}`;
  // En caso de que no encuentre un error, se le asignara un nuevo nombre
  callback(null, fileName);
};
