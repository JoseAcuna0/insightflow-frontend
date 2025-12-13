import axios from 'axios';
import { type User } from './AuthService';
import { type UserUpdateDto } from './types/UserDto';

// Obtiene la URL base de la API de usuarios desde las variables de entorno
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL;

/**
 * Servicio encargado de la gestión de usuarios.
 * Contiene los métodos para obtener, actualizar y eliminar datos de usuario
 * comunicándose con los endpoints correspondientes del backend.
 */
export const UserService = {
    /**
     * Obtiene toda la información detallada del perfil de un usuario.
     * Realiza una petición GET al endpoint específico del usuario.
     *
     * @param {string} userId - El identificador único del usuario.
     * @returns {Promise<User>} Una promesa que resuelve con el objeto User completo.
     * @throws {Error} Si falla la conexión con el backend.
     */
    async getUserById(userId: string): Promise<User> {
        const endpoint = `${USERS_API_URL}/${userId}`;
        
        try {
            const response = await axios.get<User>(endpoint);
            return response.data;
        } catch (error) {
            throw new Error('Fallo al cargar el perfil. El Backend podría estar caído.');
        }
    },
    
    /**
     * Actualiza datos parciales del perfil del usuario (Username y FullName).
     * Utiliza el verbo PATCH para modificar solo los campos enviados.
     *
     * @param {string} userId - El identificador del usuario a modificar.
     * @param {UserUpdateDto} updateData - Objeto con los campos a actualizar.
     * @returns {Promise<User>} Una promesa con el objeto User actualizado.
     * @throws {Error} Muestra el mensaje del backend si hay error de validación o un error genérico de conexión.
     */
    async updateUser(userId: string, updateData: UserUpdateDto): Promise<User> {
        const endpoint = `${USERS_API_URL}/${userId}`;
        
        try {
            const response = await axios.patch<User>(endpoint, updateData); 
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Error de validación al actualizar.');
            }
            throw new Error('Fallo de conexión al actualizar el perfil.');
        }
    },
    
    /**
     * Elimina permanentemente la cuenta del usuario.
     * Realiza una petición DELETE al endpoint del usuario.
     *
     * @param {string} userId - El identificador del usuario a eliminar.
     * @returns {Promise<boolean>} Retorna true si la eliminación fue exitosa.
     * @throws {Error} Muestra el mensaje del backend si falla la operación o un error genérico de conexión.
     */
    async deleteUser(userId: string): Promise<boolean> {
        const endpoint = `${USERS_API_URL}/${userId}`;
        
        try {
            await axios.delete(endpoint);
            return true;
        } catch (error) {
             if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Error al intentar eliminar la cuenta.');
            }
             throw new Error('Fallo de conexión al eliminar la cuenta.');
        }
    }
};