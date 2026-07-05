import History from "../model/history.js";

export class HistoryController {
  static async getAllHistory(req, res) {
    try {
      const history = await History.getAll();
      return res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error al obtener las historias', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener las historias',
        message: error.message
      });
    }
  }

  static async getHistoryById(req, res) {
    try {
      const history = await History.getById(req.params.id);
      if (!history) {
        return res.status(404).json({
          success: false,
          error: 'Historia no encontrada'
        });
      }
      return res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error al obtener la historia', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener la historia',
        message: error.message
      });
    }
  }

  static async createHistory(req, res) {
    try {
      // Log completo de los datos recibidos
      console.log('Body completo de la petición:', JSON.stringify(req.body, null, 2));
      console.log('Tipo de idactor:', typeof req.body.idactor);
      console.log('Valor de idactor:', req.body.idactor);
      console.log('Tipo de idautor:', typeof req.body.idautor);
      console.log('Valor de idautor:', req.body.idautor);
      
      // Validar datos de entrada
      const { titulo, descripcion } = req.body;
      
      if (!titulo || !descripcion) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          message: 'Título y descripción son campos requeridos'
        });
      }

      // Extraer todos los datos relevantes del body
      console.log('Verificando datos del cuerpo de la petición:');
      console.log('idactor:', req.body.idactor, 'tipo:', typeof req.body.idactor);
      console.log('idautor:', req.body.idautor, 'tipo:', typeof req.body.idautor);

      // Procesar explícitamente idactor e idautor para asegurar que lleguen al modelo
      const idactor = req.body.idactor === '' ? null : req.body.idactor;
      const idautor = req.body.idautor === '' ? null : req.body.idautor;

      // Preparar los datos para el modelo
      const historyData = {
        titulo,
        descripcion,
        idactor, // Usamos las variables procesadas en lugar de directamente req.body
        idautor, // Usamos las variables procesadas en lugar de directamente req.body
        actores_ids: req.body.actores_ids || [],
        autores_ids: req.body.autores_ids || []
      };

      console.log('Datos preparados para enviar al modelo:', JSON.stringify(historyData, null, 2));
      
      try {
        const newHistory = await History.create(historyData);
        console.log('Historia creada:', newHistory);
        return res.status(201).json({
          success: true,
          message: 'Historia creada correctamente',
          data: newHistory
        });
      } catch (error) {
        console.error('Error detallado en el modelo:', {
          message: error.message,
          stack: error.stack,
          body: historyData
        });
        
        // Manejar errores específicos de Supabase
        if (error.code === '23502') { // Not-null violation
          return res.status(400).json({
            success: false,
            error: 'Datos inválidos',
            message: 'Todos los campos requeridos deben tener valores'
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          message: error.message,
          details: error.details || 'Por favor, verifique los logs del servidor para más detalles'
        });
      }
    } catch (error) {
      console.error('Error general en el controlador:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  static async updateHistory(req, res) {
    try {
      const updatedHistory = await History.update(req.params.id, req.body); 
      if (!updatedHistory) {
        return res.status(404).json({
          success: false,
          error: 'Historia no encontrada'
        });
      }
      return res.json({
        success: true,
        message: 'Historia actualizada correctamente',
        data: updatedHistory 
      });
    } catch (error) {
      console.error('Error al actualizar la historia', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la historia',
        error: error.message
      });
    }
  }

  static async deleteHistory(req, res) {
    try {
      const historyId = req.params.id;
      console.log(`[DELETE HISTORY] Eliminando historia con ID ${historyId}...`);
      
      // Intentar eliminar la historia
      await History.delete(historyId);
      
      // Si llegamos aquí, la historia se eliminó correctamente
      console.log(`[DELETE HISTORY] Historia ${historyId} eliminada exitosamente`);
      return res.json({
        success: true,
        message: 'Historia eliminada exitosamente'
      });
    } catch (error) {
      console.error('[DELETE HISTORY] Error al eliminar historia:', error);
      
      // Proporcionar mensajes de error más específicos basados en el mensaje de error
      if (error.message.includes('relaciones')) {
        return res.status(400).json({
          success: false,
          error: 'RELATION_ERROR',
          message: 'No se pudieron eliminar las relaciones de la historia'
        });
      } else if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'La historia no existe'
        });
      } else if (error.message.includes('filas')) {
        return res.status(400).json({
          success: false,
          error: 'NO_ROWS_DELETED',
          message: 'No se eliminó ninguna fila'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'INTERNAL_ERROR',
          message: `Error inesperado al eliminar la historia: ${error.message}`
        });
      }
    }
  }

  static async uploadHistoryImage(req, res){
    const {historyId} = req.params;
    try{
      const imageBuffer = req.file.buffer
      const updatedHistory = await History.uploadImage(historyId, imageBuffer)
      res.status(200).json(updatedHistory)
    }catch(error){
      console.error('Error al subir la imagen de la historia:', error)
      res.status(500).json({
        success: false,
        error: 'Error al subir la imagen de la historia',
        message: error.message
      })
    }
  }

  static async deleteHistoryImage(req, res){
    const {historyId} = req.params;
    try{
      const result = await History.deleteImage(historyId);
      res.status(200).json({ message: 'Imagen de la historia eliminada exitosamente', data: result });
    }catch(error){
      console.error('Error al eliminar la imagen de la historia en el controlador:', error);
      res.status(500).json({ message: 'Error al eliminar la imagen de la historia', error: error.message });
    }
  }

}