import api from '../config/api';

const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      const userData = response.data.user || { username: credentials.username };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Error en el inicio de sesión' };
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || { username: userData.username }));
      return response.data;
    }
    throw new Error('No se recibieron datos válidos del servidor');
  } catch (error) {
    console.error('Registration service error:', error);
    throw error.response?.data || { message: error.message || 'Error en el registro' };
  }
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getAuthHeader
};
