import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login'; 
import Tasks from './pages/Tasks';
import Profile from './pages/Profile'; 
import Dashboard from './pages/Dashboard'; 
import Documents from './pages/Documents';
import DocumentEdit from './pages/DocumentEdit';


/**
 * Componente de orden superior (Wrapper) para proteger rutas que requieren autenticación.
 * Verifica si el usuario está autenticado a través del contexto de autenticación.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {React.ReactElement} props.element - El componente hijo a renderizar si el usuario está autenticado.
 * @returns {React.ReactElement} El componente solicitado o una redirección a la página de inicio de sesión.
 */
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  // Si no hay usuario en el contexto, forzar la redirección al login.
  return user ? element : <Navigate to="/login" replace />;
};

/**
 * Componente principal de la aplicación.
 * Define la estructura de enrutamiento utilizando React Router.
 * Gestiona la navegación entre rutas públicas y protegidas.
 */
const App: React.FC = () => {
  return (
    <Routes>
      {/* --- Rutas Públicas --- */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Protegidas (Requieren login) */}
      <Route path="/tasks" element={<PrivateRoute element={<Tasks />} />} />

      {/* Ruta raíz: Carga el Dashboard si el usuario está autenticado */}
      <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />

      {/* Ruta de perfil: Muestra la información del usuario */}
      <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

      {/* Rutas de documentos */}
      <Route path="/documents" element={<PrivateRoute element={<Documents />} />} />
      <Route path="/documents/:id" element={<PrivateRoute element={<DocumentEdit />} />} />

      {/* --- Ruta de Respaldo (Fallback) --- */}
      {/* Captura cualquier ruta no definida y redirige a la ruta principal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;