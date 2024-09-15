// Evalúa el archivo y si es permitido retorna un true indicando que se acepta
// En caso contrario un false
export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  /* console.log({ file }); */
  // Si el archivo viene nulo devolvera el callback el cual contiene el
  //new error y ademas indicaremos el false de que no aceptamos el archivo
  if (!file) return callback(new Error('File is empty'), false);

  //Mimetype nos dice que tipo de aplicación es
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  // Si el archivo contiene las extensiones validas aceptara el archivo
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  // En caso contrario será rechazado
  callback(null, false);
};
