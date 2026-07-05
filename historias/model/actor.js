import supabase from '../config/DatabaseConfig.js'; // Importa tu instancia de Supabase

class Actor {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('actor')
        .select(`
          idactor,
          descripcion,
          imagen,
          caracteristicas,
          historia_actor (
            history (
              idhistory,
              titulo,
              descripcion,
              imagen
            )
          )
        `);

      if (error) {
        console.error('Error al obtener todos los actores:', error);
        throw error;
      }

      // Re-formatear los datos para que el frontend reciba `actor.obras` directamente
      const formattedData = data.map(actor => ({
        ...actor,
        // Mapea el array de `historia_actor` para extraer solo el objeto `history`
        obras: actor.historia_actor.map(ha => ha.history).filter(Boolean)
      }));

      return formattedData; // Retorna los datos ya formateados
    } catch (error) {
      // Re-lanza el error para que el controlador lo capture
      throw error;
    }
  }

  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('actor')
        .select(`
          idactor,
          descripcion,
          imagen,
          caracteristicas,
          historia_actor (
            history (
              idhistory,
              titulo,
              descripcion,
              imagen
            )
          )
        `)
        .eq('idactor', id)
        .single();

      if (error) {
        console.error('Error al obtener actor por ID:', error);
        throw error;
      }

      // Re-formatear los datos para que el frontend reciba `actor.obras` directamente
      const formattedData = {
        ...data,
        // Mapea el array de `historia_actor` para extraer solo el objeto `history`
        obras: data.historia_actor.map(ha => ha.history).filter(Boolean)
      };

      return formattedData; // Retorna los datos ya formateados
    } catch (error) {
      // Re-lanza el error para que el controlador lo capture
      throw error;
    }
  }

  static async create(actor) {
    try {
      const { data, error } = await supabase
        .from('actor')
        .insert([actor])
        .select()
        .single();

      if (error) {
        console.error('Error al crear actor desde el Modelo:', error);
        throw error;
      }
      return data;
    } catch (error) {
        throw error;
    }
  }

  static async update(id, actor) {
    try {
      const { data, error } = await supabase
        .from('actor')
        .update(actor)
        .eq('idactor', id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar actor desde el Modelo:', error);
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteActorHistories(actorId) {
    try {
      // Primero, obtener las relaciones para poder eliminarlas
      const { data: relations, error: findError } = await supabase
        .from('historia_actor')
        .delete()
        .eq('idactor', actorId)
        .select('*');

      if (findError) {
        console.error('Error al buscar relaciones de historias:', findError);
        throw findError;
      }

      return relations;
    } catch (error) {
      console.error('Error en deleteActorHistories:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Primero eliminamos las relaciones con historias
      await this.deleteActorHistories(id);

      // Luego eliminamos el actor
      const { data, error } = await supabase
        .from('actor')
        .delete()
        .eq('idactor', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async hasAssociatedHistories(id) {
    try {
      const { data, error } = await supabase
        .from('historia_actor')
        .select('idhistory')
        .eq('idactor', id)
        .limit(1);

      if (error) {
        throw error;
      }
      return data && data.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async uploadImage(actorId, image) {
    console.log('Iniciando uploadImage para actorId:', actorId);
    try {
      const filename = `actor-${actorId}.jpg`;
      console.log('Nombre de archivo generado:', filename);
  
      // 1. Subir la imagen a Supabase Storage
      console.log('Intentando subir imagen a Supabase Storage...');
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('imagenes-web')
        .upload(`titeres/${filename}`, image, {
          cacheControl: '3600',
          upsert: false
        });
  
      console.log('Resultado de la subida:', { storageData, storageError });
  
      if (storageError) {
        console.error('Error al subir imagen:', storageError);
        throw storageError;
      }
  
      console.log('Imagen subida exitosamente. Intentando obtener URL pública...');
  
      // 2. Obtener la URL pública de la imagen subida
      const { data: publicUrlData } = supabase
        .storage
        .from('imagenes-web')
        .getPublicUrl(`titeres/${filename}`);
  
      console.log('Resultado de obtener URL pública:', { publicUrlData });
  
      const publicImageUrl = publicUrlData?.publicUrl;
  
      if (!publicImageUrl) {
        console.error('No se pudo obtener la URL pública de la imagen.');
        throw new Error('No se pudo obtener la URL pública de la imagen.');
      }
  
      console.log('URL pública obtenida:', publicImageUrl);
  
      // 3. Actualizar la tabla 'actor' con la URL de la imagen
      console.log('Intentando actualizar la tabla "actor" con la URL de la imagen...');
      const { data: actorData, error: actorError } = await supabase
        .from('actor')
        .update({ imagen: publicImageUrl })
        .eq('idactor', actorId)
        .select()
        .single();
  
      console.log('Resultado de la actualización de la tabla "actor":', { actorData, actorError });
  
      if (actorError) {
        console.error('Error al actualizar la tabla actor con la URL de la imagen:', actorError);
        throw actorError;
      }
  
      console.log('Tabla "actor" actualizada exitosamente. Retornando datos del actor.');
      return actorData;
  
    } catch (error) {
      console.error('Error en la función uploadImage:', error);
      throw error;
    } finally {
      console.log('Finalizando la función uploadImage para actorId:', actorId);
    }
  }

  static async deleteImage(actorId){
    try{
      const { data, error } = await supabase
        .storage
        .from('imagenes-web')
        .remove(`titeres/actor-${actorId}.jpg`);

      if (error) {
        console.error('Error al eliminar imagen:', error);
        throw error;
      }
      return data;
    } catch (error){
      throw error;
    }
  }

}

export default Actor;
