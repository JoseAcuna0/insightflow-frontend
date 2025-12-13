import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/UserService';
// Importamos el tipo 'User' y 'UserUpdateDto' usando la palabra clave 'type'
import { type User } from '../services/AuthService'; 
import { type UserUpdateDto } from '../services/types/UserDto'; 
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado para guardar el perfil completo obtenido por getUserById
  const [profileData, setProfileData] = useState<User | null>(null);
  
  // Estados para manejar los inputs de edición (solo username y fullName)
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Estados de la UI
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ----------------------------------------------------
  // EFECTO: Cargar el perfil completo al iniciar
  // ----------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          // Usa el ID del usuario logueado para obtener todos los detalles
          const data = await UserService.getUserById(user.id);
          setProfileData(data);
          // Inicializar los inputs con los datos obtenidos
          setUsername(data.username);
          setFullName(data.fullName);
        } catch (err) {
          setError('Error al cargar la información detallada del perfil.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);
  
  // ----------------------------------------------------
  // Lógica para VOLVER AL DASHBOARD
  // ----------------------------------------------------
  const handleGoToDashboard = () => {
      navigate('/dashboard'); // Redirige a la ruta del Dashboard
  };

  // ----------------------------------------------------
  // VERIFICACIÓN INICIAL (CORRECCIÓN del error 'null' ts(18047))
  // ----------------------------------------------------
  if (loading || !user || !profileData) { 
    // Si cualquiera de estos es true, mostramos un mensaje de carga
    return <p>Cargando información detallada del perfil...</p>;
  }
  
  // ----------------------------------------------------
  // Lógica para ACTUALIZAR el perfil
  // ----------------------------------------------------
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');
    setError('');

    // Prepara el objeto DTO solo con los campos que cambiaron
    const updateData: UserUpdateDto = {};
    if (username !== profileData.username) updateData.username = username;
    if (fullName !== profileData.fullName) updateData.fullName = fullName;
    
    if (Object.keys(updateData).length === 0) {
        setMessage("No se detectaron cambios.");
        setIsUpdating(false);
        return;
    }

    try {
        const updatedUser = await UserService.updateUser(user.id, updateData);
        // Actualiza el estado local del perfil con la respuesta del servidor
        setProfileData(updatedUser); 
        setMessage("Perfil actualizado con éxito.");
    } catch (err) {
        setError(`Fallo al actualizar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
        setIsUpdating(false);
    }
  };

  // ----------------------------------------------------
  // Lógica para ELIMINAR la cuenta
  // ----------------------------------------------------
  const handleDelete = async () => {
      if (!window.confirm("¿Estás seguro de que quieres eliminar tu cuenta?")) return;
      
      try {
          await UserService.deleteUser(user.id);
          logout(); // Cierra la sesión
          navigate('/login'); // Redirige al login
      } catch (err) {
          setError(`Fallo al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
  }

  // ----------------------------------------------------
  // Renderizado
  // ----------------------------------------------------
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #007bff', borderRadius: '8px' }}>
      
      {/* === BOTÓN VOLVER AL DASHBOARD (NUEVO) === */}
      <button 
          onClick={handleGoToDashboard} 
          style={{ 
              backgroundColor: '#5a6268', // Gris oscuro para ser visible pero no dominante
              color: 'white', 
              padding: '10px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px' // Espacio después del botón
          }}
      >
          ← Volver al Dashboard
      </button>
      
      <h2>Información de Perfil Detallada</h2>
      
      {/* 1. Datos que solo se MUESTRAN (profileData ya es seguro que no es null) */}
      <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px' }}>
        <h3>Datos del Usuario</h3>
        <p><strong>ID:</strong> {profileData.id}</p>
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Estado del Usuario:</strong> {profileData.userStatus}</p>
        <p><strong>Fecha de Nacimiento:</strong> {profileData.birthDate}</p>
        <p><strong>Dirección:</strong> {profileData.address}</p>
      </div>

      <hr />

      {/* 2. Formulario de Actualización */}
      <form onSubmit={handleUpdate} style={{ marginBottom: '20px' }}>
        <h3>Editar Perfil (Solo Nombre y Usuario)</h3>
        
        {/* Campo Username */}
        <div style={{ marginBottom: '10px' }}>
            <label>Username:</label>
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={isUpdating}
            />
        </div>
        
        {/* Campo Full Name */}
        <div style={{ marginBottom: '10px' }}>
            <label>Nombre Completo:</label>
            <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                disabled={isUpdating}
            />
        </div>

        <button type="submit" disabled={isUpdating} style={{ backgroundColor: '#007bff', color: 'white' }}>
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
      
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <hr />
      
      {/* 3. Botones de Acción */}
      <button onClick={handleDelete} style={{ marginRight: '10px', backgroundColor: 'red', color: 'white' }}>
        Eliminar Cuenta
      </button>
      <button onClick={logout} style={{ backgroundColor: 'orange', color: 'white' }}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Profile;