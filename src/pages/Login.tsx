
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
      // 1. Llamar a la función de login del AuthContext
      await login(identifier, password);
      
      // 2. Si es exitoso, navegar a la ruta protegida (el perfil)
      navigate('/profile'); 
      
    } catch (err) {
      // 3. Si falla (ej: credenciales inválidas), mostrar el error
      const errorMessage = err instanceof Error ? err.message : 'Fallo en la conexión.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Iniciar Sesión</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Campo de Identificador (Username o Email) */}
        <div>
          <label htmlFor="identifier">Usuario o Email:</label>
          <input 
            id="identifier"
            type="text" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            required
            disabled={loading}
          />
        </div>

        {/* Campo de Contraseña */}
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {/* Mostrar errores */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
          {/* Aquí podrías añadir un link a "Registrarse" si tuvieras ese endpoint */}
          ¿No tienes cuenta? Regístrate (Pendiente)
      </p>
    </div>
  );
};

export default Login;