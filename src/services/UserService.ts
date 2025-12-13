// src/services/UserService.ts

import axios from 'axios';
// CRÍTICO: Importar el tipo 'User' desde AuthService (donde se define la interfaz maestra)
import { type User } from './AuthService'; 
// Asumimos que UserUpdateDto solo tiene username y fullName
import { type UserUpdateDto } from './types/UserDto'; 

// URL base de tu Backend (obtenida del .env, que ahora es la raíz /api)
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL; 
const USER_BASE_PATH = '/users'; // Prefijo para todos los endpoints de Usuario

export const UserService = {
    /**
     * 1. Obtiene toda la información detallada del perfil (incluye estado, dirección, etc.).
     * @param userId El ID del usuario.
     * @returns El objeto User con todos los campos.
     */
    async getUserById(userId: string): Promise<User> {
        // RUTA CORREGIDA: ${USERS_API_URL}/users/{userId}
        const endpoint = `${USERS_API_URL}${USER_BASE_PATH}/${userId}`;
        
        try {
            const response = await axios.get<User>(endpoint);
            return response.data;
        } catch (error) {
            throw new Error('Fallo al cargar el perfil. El Backend podría estar caído.');
        }
    },
    
    /**
     * 2. Actualiza el perfil del usuario (limitado a Username y FullName).
     * @param userId El ID del usuario a modificar.
     * @param updateData Los campos a cambiar (username, fullName).
     * @returns El objeto User actualizado.
     */
    async updateUser(userId: string, updateData: UserUpdateDto): Promise<User> {
        // RUTA CORREGIDA: ${USERS_API_URL}/users/{userId}
        const endpoint = `${USERS_API_URL}${USER_BASE_PATH}/${userId}`;
        
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
     * 3. Elimina permanentemente la cuenta del usuario.
     * @param userId El ID del usuario a eliminar.
     * @returns true si la eliminación fue exitosa.
     */
    async deleteUser(userId: string): Promise<boolean> {
        // RUTA CORREGIDA: ${USERS_API_URL}/users/{userId}
        const endpoint = `${USERS_API_URL}${USER_BASE_PATH}/${userId}`;
        
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