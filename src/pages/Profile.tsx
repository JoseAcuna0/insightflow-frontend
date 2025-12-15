import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/UserService';
import { type User } from '../services/AuthService';
import { type UserUpdateDto } from '../services/types/UserDto';

/**
 * Componente de Perfil de Usuario.
 * Permite visualizar la información completa de la cuenta, editar campos permitidos (username, nombre completo)
 * y realizar acciones críticas como cerrar sesión o eliminar la cuenta.
 */
const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Almacena el objeto completo del usuario recuperado del backend
    const [profileData, setProfileData] = useState<User | null>(null);
    
    // Estados locales para el manejo de formularios (Inputs controlados)
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    
    // Estados para el control de la interfaz de usuario (UI)
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    /**
     * Obtiene los datos más recientes del servidor y sincroniza el formulario.
     * Es crucial actualizar los estados 'username' y 'fullName' con la data recibida
     * para que los inputs no aparezcan vacíos al cargar la página.
     * * @param userId - ID del usuario a consultar.
     */
    const fetchAndSyncProfile = async (userId: string) => {
        try {
            const data = await UserService.getUserById(userId);
            setProfileData(data);
            
            // Sincronización de estados locales para edición
            setUsername(data.username);
            setFullName(data.fullName);

            setLoading(false);
        } catch (err) {
            setError('Error al cargar la información detallada del perfil.');
            setLoading(false);
            throw err;
        }
    }


    useEffect(() => {
        if (user) {
            fetchAndSyncProfile(user.id);
        }
    }, [user]);
    

    const handleGoToDashboard = () => {
        navigate('/dashboard'); 
    };


    if (loading || !user || !profileData) { 
        return <p>Cargando información detallada del perfil...</p>;
    }
    

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage('');
        setError('');

        const updateData: UserUpdateDto = {};
        
        // Validación: Solo agregar al DTO si el valor ha cambiado y no está vacío.
        
        // 1. Procesar Username
        const newUsername = username.trim();
        if (newUsername !== profileData.username && newUsername !== '') {
            updateData.username = newUsername;
        }

        // 2. Procesar Nombre Completo
        const newFullName = fullName.trim();
        if (newFullName !== profileData.fullName && newFullName !== '') {
            updateData.fullName = newFullName;
        }
        
        // Si no hay cambios válidos, abortar operación
        if (Object.keys(updateData).length === 0) {
            setMessage("No se detectaron cambios válidos.");
            setIsUpdating(false);
            return;
        }

        try {
            // 1. Enviar petición de actualización al Backend
            await UserService.updateUser(user.id, updateData); 
            
            // 2. Refrescar los datos locales para asegurar sincronía con la BD
            await fetchAndSyncProfile(user.id);
            
            setMessage("Perfil actualizado con éxito.");
        } catch (err) {
             if (err instanceof Error) {
                 setError(`Fallo al actualizar: ${err.message}`);
            } else {
                 setError('Fallo al actualizar: Error desconocido.');
            }
        } finally {
            setIsUpdating(false);
        }
    };


    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar tu cuenta?")) return;
        
        try {
            await UserService.deleteUser(user.id);
            logout(); // Limpia el contexto de autenticación
            navigate('/login'); // Redirige fuera de la app
        } catch (err) {
             if (err instanceof Error) {
                 setError(`Fallo al eliminar: ${err.message}`);
            } else {
                 setError('Fallo al eliminar: Error desconocido.');
            }
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #007bff', borderRadius: '8px' }}>
            
            {/* Botón de navegación superior */}
            <button 
                onClick={handleGoToDashboard} 
                style={{ 
                    backgroundColor: '#5a6268', 
                    color: 'white', 
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '20px' 
                }}
            >
                ← Volver al Dashboard
            </button>
            
            <h2>Información de Perfil Detallada</h2>
            
            {/* Sección de Datos de Lectura (Read-Only) */}
            <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px' }}>
                <h3>Datos del Usuario</h3>
                
                <p><strong>Username:</strong> {profileData.username}</p>
                <p><strong>Nombre Completo:</strong> {profileData.fullName}</p>
                <p><strong>ID:</strong> {profileData.id}</p>
                <p><strong>Email:</strong> {profileData.email}</p>

                {/* Indicador visual de estado */}
                <p>
                    <strong>Estado del Usuario:</strong> 
                    <span style={{ color: profileData.userStatus ? 'green' : 'red', fontWeight: 'bold' }}>
                        {profileData.userStatus ? ' Activo' : ' No Activo'}
                    </span>
                </p>

                {/* Formateo de fecha */}
                <p>
                <strong>Fecha de Nacimiento:</strong> 
                {profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '' 
                    ? new Date(profileData.dateOfBirth).toLocaleDateString() 
                    : ' N/A'}
                </p>

                <p><strong>Dirección:</strong> {profileData.address}</p>
            </div>

            <hr />

            {/* Formulario de Edición */}
            <form onSubmit={handleUpdate} style={{ marginBottom: '20px' }}>
                <h3>Editar Perfil (Solo Nombre y Usuario)</h3>
                
                {/* Input: Username */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        onChange={(e) => setUsername(e.target.value)} 
                        disabled={isUpdating}
                        placeholder={profileData.username} // Muestra valor actual como referencia
                    />
                </div>
                
                {/* Input: Full Name */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Nombre Completo:</label>
                    <input 
                        type="text" 
                        onChange={(e) => setFullName(e.target.value)} 
                        disabled={isUpdating}
                        placeholder={profileData.fullName}
                    />
                </div>

                <button 
                    type="submit" 
                    // Deshabilita si está cargando o si los campos son idénticos a los datos guardados
                    disabled={isUpdating || (username === profileData.username && fullName === profileData.fullName)} 
                    style={{ backgroundColor: '#007bff', color: 'white' }}
                >
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
            
            {/* Mensajes de Feedback */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            
            <hr />
            
            {/* Botones de Zona de Peligro */}
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