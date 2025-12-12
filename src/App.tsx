import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login'; 
import Profile from './pages/Profile'; 

// Wrapper para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  // Si no hay usuario, redirige al login
  return user ? element : <Navigate to="/login" replace />; 
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Ruta para el Login (accesible a todos) */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Protegidas (Requieren login) */}
      <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
      <Route path="/" element={<Navigate to="/profile" replace />} /> 
    </Routes>
  );
};

export default App;