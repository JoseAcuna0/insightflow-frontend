import axios from 'axios';

// Obtiene la URL base de la API de usuarios desde las variables de entorno
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL;


/**
 * Interfaz User: Representa el objeto completo del usuario devuelto por la API.
 * Actúa como la fuente de verdad para el tipado de datos de usuario en toda la aplicación,
 * asegurando consistencia con la respuesta del Backend.
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

/**
 * Interfaz para la estructura de datos requerida en la petición de inicio de sesión.
 */
interface LoginRequest {
  identifier: string; // Corresponde al campo "identifier" esperado por el Backend
  password: string;
}


export const AuthService = {
  /**
   * Realiza la petición de inicio de sesión al servicio de usuarios.
   * Envía las credenciales y espera el objeto de usuario como confirmación de éxito.
   *
   * @param {LoginRequest} credentials - Objeto que contiene el identificador y la contraseña.
   * @returns {Promise<User>} Una promesa que resuelve con los datos del usuario autenticado.
   * @throws {Error} Si las credenciales son inválidas o hay un error de conexión.
   */
  async login(credentials: LoginRequest): Promise<User> {
    // Construcción del endpoint de login: ${USERS_API_URL}/login
    const loginEndpoint = `${USERS_API_URL}/login`;

    try {
      const response = await axios.post<User>(
        loginEndpoint,
        credentials
      );

      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Propaga el mensaje de error específico devuelto por el Backend
        throw new Error(error.response.data.message || 'Credenciales inválidas o fallo en la API.');
      }
      // Error genérico para fallos de red o servidor no disponible
      throw new Error('Error de conexión con el servidor. Verifica que Render esté activo.');
    }
  },
};