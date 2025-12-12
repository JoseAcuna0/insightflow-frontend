
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/UserService';
import { type UserUpdateDto } from '../services/types/UserDto'; 
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
      if (user) {
          setUsername(user.username);
      }
  }, [user]);

  if (!user) {
    return <p>Cargando perfil...</p>;
  }


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    
    const updateData: UserUpdateDto = {};
    if (username !== user.username) updateData.username = username;
    if (fullName && (fullName !== user.fullName)) updateData.fullName = fullName;
    
    if (Object.keys(updateData).length === 0) {
        setMessage("No hay cambios para guardar.");
        setLoading(false);
        return;
    }

    try {
        // Llama al servicio de actualización con solo los datos permitidos
        const updatedUser = await UserService.updateUser(user.id, updateData);
        
        // NOTA: Para ver el cambio, DEBERÍAS actualizar el AuthContext aquí
        // (Esto requiere añadir una función de actualización al AuthProvider)

        setMessage("Perfil actualizado con éxito.");
    } catch (err) {
        setError(`Fallo al actualizar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
        setLoading(false);
    }
  };

  
  const handleDelete = async () => {
      if (!window.confirm("¿Estás absolutamente seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
          return;
      }
      
      try {
          await UserService.deleteUser(user.id);
          logout();
          navigate('/login');
      } catch (err) {
          setError(`Fallo al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
  }

  
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Pestaña Perfil</h2>
      <p>ID de Usuario (del Backend): <strong>{user.id}</strong></p>
      <p>Email Registrado: <strong>{user.email}</strong></p>
      
      <hr />

      <form onSubmit={handleUpdate}>
        <h3>Actualizar Datos</h3>
        
        
        <div>
            <label htmlFor="username">Username:</label>
            <input 
                id="username"
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={loading}
            />
        </div>
        
        
        <div>
            <label htmlFor="fullName">Nombre Completo:</label>
            <input 
                id="fullName"
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                disabled={loading}
            />
        </div>

        <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
      
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <hr />
      
      
      <button onClick={handleDelete} style={{ marginRight: '10px', backgroundColor: 'red', color: 'white' }}>
        Eliminar Cuenta
      </button>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};

export default Profile;