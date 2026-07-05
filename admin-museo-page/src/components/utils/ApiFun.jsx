import api from '../../config/api';

// Actors API
export const getActors = () => api.get('/actors/list');
export const getActorById = (id) => api.get(`/actors/${id}`);
export const createActor = (actor) => api.post('/actors/add', actor);
export const updateActor = (id, actor) => api.put(`/actors/update/${id}`, actor);
export const deleteActor = (id) => api.delete(`/actors/delete/${id}`);
export const uploadActorImage = (id, image) => api.post(`/actors/upload-image/${id}/image`, image, {
  headers: { 'Accept': 'application/json' }
});
export const deleteActorImage = (id) => api.delete(`/actors/delete-image/${id}/image`);

// Authors API
export const getAuthors = () => api.get('/authors/list');
export const getAuthorById = async (id) => {
  try {
    const response = await api.get(`/authors/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching author:', error);
    return { success: false, message: error.response?.data?.message || 'Error al obtener el autor' };
  }
};
export const createAuthor = (author) => api.post('/authors/add', author);
export const updateAuthor = async (id, authorData) => {
  try {
    const response = await api.put(`/authors/update/${id}`, authorData);
    return { success: true, data: response.data, message: 'Autor actualizado exitosamente' };
  } catch (error) {
    console.error('Error updating author:', error);
    let errorMessage = 'Error al actualizar el autor';
    if (error.response) {
      errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No se recibió respuesta del servidor';
    } else {
      errorMessage = error.message || 'Error desconocido';
    }
    return { success: false, message: errorMessage };
  }
};
export const deleteAuthor = (id) => api.delete(`/authors/delete/${id}`);
export const uploadAuthorImage = (id, image) => api.post(`/authors/upload-image/${id}/image`, image, {
  headers: { 'Accept': 'application/json' }
});
export const deleteAuthorImage = (id) => api.delete(`/authors/delete-image/${id}/image`);

// Histories API
export const getHistories = async () => {
  try {
    const response = await api.get('/histories/list');
    return response;
  } catch (error) {
    throw new Error('Error al obtener historias');
  }
};
export const getHistoryById = async (id) => {
  const response = await api.get(`/histories/${id}`);
  return response;
};
export const createHistory = (history) => api.post('/histories/add', history);
export const updateHistory = (id, history) => api.put(`/histories/update/${id}`, history);
export const deleteHistory = (id) => api.delete(`/histories/delete/${id}`);
export const uploadHistoryImage = async (historyId, formData) => {
  try {
    const response = await api.post(`/histories/upload-image/${historyId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      validateStatus: function (status) { return status >= 200 && status < 500; }
    });
    if (!response.data) throw new Error('No se recibió respuesta del servidor');
    return response;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error en el servidor al subir la imagen');
    } else if (error.request) {
      throw new Error('No se recibió respuesta del servidor');
    } else {
      throw new Error('Error al configurar la solicitud: ' + error.message);
    }
  }
};
export const deleteHistoryImage = (id) => api.delete(`/histories/delete-image/${id}/image`);

// Taller API
export const getTallers = async () => {
  try {
    const response = await api.get('/tallers/list');
    return response;
  } catch (error) {
    throw new Error('Error al obtener talleres');
  }
};
export const getTallerById = async (id) => {
  const response = await api.get(`/tallers/${id}`);
  return response;
};
export const createTaller = (taller) => api.post('/tallers/add', taller);
export const updateTaller = (id, taller) => api.put(`/tallers/update/${id}`, taller);
export const deleteTaller = (id) => api.delete(`/tallers/delete/${id}`);
