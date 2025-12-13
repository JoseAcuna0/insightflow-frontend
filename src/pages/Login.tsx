import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de Inicio de Sesión (Login).
 * Proporciona un formulario para que los usuarios se autentiquen utilizando
 * su identificador (nombre de usuario o correo electrónico) y contraseña.
 */
const Login: React.FC = () => {
  // --- Estados de los Inputs ---
  const [identifier, setIdentifier] = useState(''); // Captura username o email
  const [password, setPassword] = useState('');
  
  // --- Estados de la Interfaz (UI) ---
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- Hooks del Sistema ---
  const { login } = useAuth(); // Acceso a la función de login del contexto global
  const navigate = useNavigate(); // Para redirigir al usuario tras el éxito

  /**
   * Gestiona el envío del formulario.
   * Evita la recarga de página, llama al servicio de autenticación
   * y redirige al dashboard si la operación es exitosa.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Intento de login contra el backend
      await login(identifier, password);
      
      // Si no lanza error, la autenticación fue exitosa.
      // Redirigir a la ruta raíz (que cargará el Dashboard protegido).
      navigate('/'); 
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fallo en la conexión.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div 
        style={{
            display: 'flex',
            justifyContent: 'center', // Centrado horizontal
            alignItems: 'center',     // Centrado vertical
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#222',  // Fondo oscuro de la página
        }}
    >
        {/* -----------------------------------------------------------------
        // Tarjeta de Login
        // Contenedor visual del formulario con diseño oscuro y sombra.
        // ----------------------------------------------------------------- */}
      <div 
            style={{ 
                maxWidth: '350px', 
                width: '100%',        // Asegura respuesta en móviles
                padding: '30px', 
                border: '1px solid #444', 
                borderRadius: '8px',
                backgroundColor: '#333', // Fondo de la tarjeta
                color: 'white', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
            }}
        >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Campo: Identificador (Username/Email) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="identifier" style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Usuario o Email:</label>
            <input 
              id="identifier"
              type="text" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              style={{ 
                padding: '10px', 
                border: '1px solid #555', 
                borderRadius: '4px',
                backgroundColor: '#444', 
                color: 'white' 
              }}
              required
              disabled={loading}
              placeholder="Ej: usuario123"
            />
          </div>

          {/* Campo: Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="password" style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Contraseña:</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ 
                padding: '10px', 
                border: '1px solid #555', 
                borderRadius: '4px',
                backgroundColor: '#444', 
                color: 'white' 
              }}
              required
              disabled={loading}
              placeholder="********"
            />
          </div>

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
                padding: '12px', 
                backgroundColor: loading ? '#555' : '#007bff', // Cambio visual si está cargando
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Visualización de Errores */}
        {error && (
            <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                border: '1px solid red', 
                borderRadius: '4px',
                color: '#ff6b6b',
                fontSize: '0.9rem',
                textAlign: 'center'
            }}>
                {error}
            </div>
        )}
        
        {/* Enlace a Registro (Placeholder) */}
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85em', color: '#aaa' }}>
            ¿No tienes cuenta? <span style={{ color: '#007bff', cursor: 'pointer' }}>Regístrate (Próximamente)</span>
        </p>
      </div>
    </div>
  );
};

export default Login;