import Author from "../model/author.js";
export class AuthorController {
  
  static async getAllAuthors(req, res) {
    try {
      const authors = await Author.getAll();
      return res.json({
        success: true,
        data: authors
      });
    } catch (error) {
      console.error('Error al obtener los autores', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener los autores',
        message: error.message // Incluye el mensaje de error para más detalle
      });
    }
  }

  
  static async getAuthorData() {
    try {
      const authors = await Author.getAll(); // Renombrado para consistencia
      return authors;
    } catch (error) {
      console.error('Error al obtener los autores para data', error);
      return []; // Mantén el comportamiento de devolver un array vacío en caso de error
    }
  }

  
  static async getAuthorById(req, res) {
    try {
      const author = await Author.getById(req.params.id);
      if (!author) {
        return res.status(404).json({
          success: false,
          error: 'Autor no encontrado'
        });
      }
      return res.json({
        success: true,
        data: author
      });
    } catch (error) {
      console.error('Error al obtener el autor por ID', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el autor',
        error: error.message
      });
    }
  }

  
  static async registerAuthor(req, res) {
    try {
      const newAuthor = await Author.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Autor creado correctamente',
        data: newAuthor
      });
    } catch (error) {
      console.error('Error al registrar el autor', error);
      return res.status(500).json({
        success: false,
        message: 'Error al registrar autor',
        error: error.message // Incluye el mensaje de error
      });
    }
  }

  static async updateAuthor(req, res) {
    try {
      const updatedAuthor = await Author.update(req.params.id, req.body); // Cambiado a updatedAuthor
      if (!updatedAuthor) { // Verificamos si updatedAuthor es null o undefined
        return res.status(404).json({
          success: false,
          error: 'Autor no encontrado'
        });
      }
      return res.json({
        success: true,
        message: 'Autor actualizado correctamente',
        data: updatedAuthor // Devolvemos los datos actualizados
      });
    } catch (error) {
      console.error('Error al actualizar el autor', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar autor',
        error: error.message
      });
    }
  }

  static async deleteAuthor(req, res) {
    try {
      const authorId = req.params.id;
      
      // Primero obtenemos el actor para verificar que existe
      const author = await Author.getById(authorId);
      if (!author) {
        return res.status(404).json({
          success: false,
          error: 'Autor no encontrado'
        });
      }
      
      // Verificamos si tiene historias asociadas para informar al usuario
      const hasHistories = await Author.hasAssociatedHistories(authorId);
      
      // Eliminamos el actor (esto también eliminará las relaciones)
      const deletedAuthor = await Author.delete(authorId);
      
      if (!deletedAuthor) {
        throw new Error('No se pudo eliminar el autor');
      }
      
      // Mensaje informativo sobre las relaciones eliminadas
      let message = 'Autor eliminado correctamente';
      if (hasHistories) {
        message += '. Se han eliminado las relaciones con las historias asociadas';
      }
      
      return res.json({
        success: true,
        message: message,
        data: deletedAuthor
      });
      
    } catch (error) {
      console.error('Error al eliminar el autor:', error);
      
      // Para otros errores
      return res.status(500).json({
        success: false,
        error: 'Error al eliminar el autor',
        message: error.message
      });
    }
  }
  
  static async uploadAuthorImage(req, res) {
    const { authorId } = req.params;

    // Verificar si se envió un archivo
    if (!req.file) {
        return res.status(400).json({ message: 'Por favor, sube una imagen' });
    }

    try {
        // Leer el contenido del archivo desde la ruta guardada por multer (diskStorage)
        const imageBuffer = req.file.buffer;

        // Llama a la función uploadImage de tu modelo Actor, pasando el buffer
        const updatedAuthor = await Author.uploadImage(authorId, imageBuffer);

        res.status(200).json(updatedAuthor); // Envía la respuesta con el actor actualizado (incluyendo la URL de la imagen)
    } catch (error) {
        console.error('Error al subir la imagen del autor en el controlador:', error);
        res.status(500).json({ message: 'Error al subir la imagen del autor', error: error.message });
    }
  }

  static async deleteAuthorImage(req, res) {
    try {
      const authorId = req.params.authorId;
      const deletedAuthor = await Author.deleteImage(authorId);
      return res.json({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: deletedAuthor
      });
    } catch (error) {
      console.error('Error al eliminar la imagen del autor', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
