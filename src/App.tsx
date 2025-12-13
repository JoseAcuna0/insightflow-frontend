import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login'; 
import Profile from './pages/Profile'; 
import Dashboard from './pages/Dashboard'; // <<<--- 1. IMPORTAR EL DASHBOARD

// Componente Wrapper para proteger rutas que requieren autenticación
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  // Si no hay usuario, redirige al login
  return user ? element : <Navigate to="/login" replace />; 
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Protegidas (Requieren login) */}
      
      {/* 2. ESTABLECER DASHBOARD COMO RUTA PRINCIPAL PROTEGIDA (/) */}
      {/* Después del login exitoso, la navegación te lleva a / y carga Dashboard */}
      <Route path="/" element={<PrivateRoute element={<Dashboard />} />} /> 

      {/* La página de Perfil sigue estando disponible en /profile */}
      <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

      {/* 3. Ruta de Respaldo: Redirigir cualquier otra ruta no definida a la principal */}
      <Route path="*" element={<Navigate to="/" replace />} /> 
    </Routes>
  );
};

export default App;