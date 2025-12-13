// src/services/AuthService.ts

import axios from 'axios';

// La URL base del Users Service se obtiene del archivo .env (que ahora es /api)
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL; 
const AUTH_BASE_PATH = '/auth'; // Prefijo para todos los endpoints de Autenticación

// ----------------------------------------------------
// INTERFACES (Definición Maestra del objeto Usuario)
// ----------------------------------------------------

/**
 * Interfaz User: Representa el objeto completo del usuario devuelto por la API.
 * Es la fuente de verdad para el tipado de usuario en toda la app.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string; 
  userStatus: boolean; 
  dateOfBirth?: string | null;  
  address: string;    
}

// Interfaz de la Petición de Login 
interface LoginRequest {
  identifier: string; // Coincide con [JsonPropertyName("identifier")] en el Backend
  password: string;
}


// ----------------------------------------------------
// SERVICIO DE AUTENTICACIÓN
// ----------------------------------------------------
export const AuthService = {
  /**
   * Intenta iniciar sesión contra el Users Service.
   * @param credentials Objeto con identifier y password.
   * @returns El objeto User si la autenticación es exitosa.
   */
  async login(credentials: LoginRequest): Promise<User> {
    // RUTA CORREGIDA: ${USERS_API_URL}/auth/login
    const loginEndpoint = `${USERS_API_URL}${AUTH_BASE_PATH}/login`; 
    
    try {
      const response = await axios.post<User>(
        loginEndpoint, 
        credentials 
      ); 

      return response.data; 

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Devuelve el mensaje de error del Backend (ej: Credenciales inválidas)
        throw new Error(error.response.data.message || 'Credenciales inválidas o fallo en la API.');
      }
      throw new Error('Error de conexión con el servidor. Verifica que Render esté activo.');
    }
  },
};