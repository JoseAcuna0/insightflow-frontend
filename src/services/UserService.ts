

import axios from 'axios';
import { type User } from './AuthService';
import { type UserUpdateDto } from './types/UserDto'; 


const USERS_API_URL = import.meta.env.VITE_USERS_API_URL; 

export const UserService = {

    async updateUser(userId: string, updateData: UserUpdateDto): Promise<User> {
        const endpoint = `${USERS_API_URL}/${userId}`;
        
        try {
            
            const response = await axios.put<User>(endpoint, updateData); 
            return response.data;
        } catch (error) {
            
            throw new Error('Error al actualizar el usuario. Verifique los datos.');
        }
    },
    

    async deleteUser(userId: string): Promise<boolean> {
        const endpoint = `${USERS_API_URL}/${userId}`;
        
        try {
            
            await axios.delete(endpoint);
            return true;
        } catch (error) {
             throw new Error('Error al intentar eliminar la cuenta.');
        }
    }
};