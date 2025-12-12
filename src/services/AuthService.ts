

import axios from 'axios';

const USERS_API_URL = import.meta.env.VITE_USERS_API_URL;

export interface User {
  id: string;
  username: string;
  email: string;
  
}

interface LoginRequest {
  identifier: string; 
  password: string;
}

export const AuthService = {
  async login(credentials: LoginRequest): Promise<User> {
    const loginEndpoint = `${USERS_API_URL}/login`; 
    
    try {
      const response = await axios.post<User>(loginEndpoint, credentials);

      return response.data; 

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        
        throw new Error(error.response.data.message || 'Error de autenticación desconocido');
      }
      throw new Error('Error de conexión con el Users Service. Verifica que Render esté activo.');
    }
  },
};