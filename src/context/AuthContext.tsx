import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type User, AuthService } from '../services/AuthService';

/**
 * Define la estructura de datos y funciones disponibles en el contexto de autenticación.
 */
interface AuthContextType {
  /**
   * El objeto del usuario actual si está autenticado, o null si no lo está.
   */
  user: User | null; 

  /**
   * Función para iniciar sesión.
   * Llama al servicio de autenticación y actualiza el estado global.
   * @param identifier - Nombre de usuario o correo electrónico.
   * @param password - Contraseña del usuario.
   */
  login: (identifier: string, password: string) => Promise<void>;

  /**
   * Función para cerrar sesión.
   * Limpia el estado del usuario.
   */
  logout: () => void;
}

// Creación del contexto con valor inicial indefinido.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Componente Proveedor de Autenticación.
 * Envuelve a los componentes hijos para proporcionarles acceso al estado de autenticación.
 * Gestiona el estado local del usuario y expone métodos de login/logout.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Maneja la lógica de inicio de sesión.
   * Delega la petición a AuthService y, si es exitosa, guarda el usuario en el estado.
   */
  const login = async (identifier: string, password: string) => {
    // AuthService.login lanza un error si falla, que debe ser capturado por el componente que llame a esta función (ej. Login.tsx)
    const loggedInUser = await AuthService.login({ identifier, password });
    setUser(loggedInUser); 
  };

  /**
   * Maneja el cierre de sesión limpiando el estado del usuario.
   */
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para consumir el contexto de autenticación.
 * Garantiza que el hook se utilice dentro de un AuthProvider.
 * * @returns {AuthContextType} El contexto de autenticación (user, login, logout).
 * @throws {Error} Si se usa fuera de un AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};