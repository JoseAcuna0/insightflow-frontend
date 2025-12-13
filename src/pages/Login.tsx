
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el hook de autenticación

const Login: React.FC = () => {
  // Estados para capturar los valores de los inputs
  const [identifier, setIdentifier] = useState(''); // Puede ser username o email
  const [password, setPassword] = useState('');
  
  // Estados para manejar la UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hooks esenciales
  const { login } = useAuth(); // Función para iniciar sesión del contexto
  const navigate = useNavigate(); // Hook para la navegación

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      
      // Navegar a la ruta principal (Dashboard) después del Login exitoso
      navigate('/'); 
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fallo en la conexión.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // -----------------------------------------------------------------
    // Contenedor principal para CENTRADO TOTAL
    // Usamos minHeight: '100vh' y Flexbox para centrar en el centro de la pantalla.
    // -----------------------------------------------------------------
    <div 
        style={{
            display: 'flex',
            justifyContent: 'center', // Centrado horizontal
            alignItems: 'center',    // Centrado vertical
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#222', // Fondo oscuro general
        }}
    >
        {/* -----------------------------------------------------------------
        // Estilos de la Caja de Login
        // Estilo oscuro consistente con el diseño.
        // ----------------------------------------------------------------- */}
      <div 
            style={{ 
                maxWidth: '350px', 
                padding: '30px', 
                border: '1px solid #444', 
                borderRadius: '8px',
                backgroundColor: '#333', // Fondo oscuro de la caja
                color: 'white', // Texto claro
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
            }}
        >
        <h2>Iniciar Sesión</h2>
        
        {/* Formulario con espaciado consistente */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Campo de Identificador */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="identifier" style={{ marginRight: '10px' }}>Usuario o Email:</label>
            <input 
              id="identifier"
              type="text" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              style={{ padding: '8px', border: '1px solid #555', backgroundColor: '#444', color: 'white', flexGrow: 1 }}
              required
              disabled={loading}
            />
          </div>

          {/* Campo de Contraseña */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="password" style={{ marginRight: '10px' }}>Contraseña:</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ padding: '8px', border: '1px solid #555', backgroundColor: '#444', color: 'white', flexGrow: 1 }}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} style={{ 
                padding: '10px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginTop: '10px'
            }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Mostrar errores */}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
            ¿No tienes cuenta? Regístrate (Pendiente)
        </p>
      </div>
    </div>
  );
};

export default Login;