import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/UserService';
import { type User } from '../services/AuthService'; 
import { type UserUpdateDto } from '../services/types/UserDto'; 

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Estado para guardar el perfil completo obtenido por getUserById
    const [profileData, setProfileData] = useState<User | null>(null);
    
    // Estados para manejar los inputs de edición (inicializados al valor del perfil)
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    
    // Estados de la UI
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Función que carga los datos del perfil y sincroniza los estados de edición
    const fetchAndSyncProfile = async (userId: string) => {
        try {
            const data = await UserService.getUserById(userId);
            setProfileData(data);
            
            // CRÍTICO: Inicializar los estados de edición con el valor actual del perfil.
            setUsername(data.username);
            setFullName(data.fullName);

            setLoading(false);
        } catch (err) {
            setError('Error al cargar la información detallada del perfil.');
            setLoading(false);
            throw err;
        }
    }

    // ----------------------------------------------------
    // EFECTO: Cargar el perfil completo al iniciar
    // ----------------------------------------------------
    useEffect(() => {
        if (user) {
            fetchAndSyncProfile(user.id);
        }
    }, [user]);
    
    // ----------------------------------------------------
    // Lógica para VOLVER AL DASHBOARD
    // ----------------------------------------------------
    const handleGoToDashboard = () => {
        navigate('/dashboard'); 
    };

    // ----------------------------------------------------
    // VERIFICACIÓN INICIAL 
    // ----------------------------------------------------
    if (loading || !user || !profileData) { 
        return <p>Cargando información detallada del perfil...</p>;
    }
    
    // ----------------------------------------------------
    // Lógica para ACTUALIZAR el perfil (¡CORREGIDA PARA IGNORAR VALORES VACÍOS!)
    // ----------------------------------------------------
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage('');
        setError('');

        // Prepara el objeto DTO solo si el valor del input es diferente al valor actual Y NO está vacío.
        const updateData: UserUpdateDto = {};
        
        // --- LÓGICA CORREGIDA PARA ELIMINAR CADENAS VACÍAS ---
        
        // 1. Username
        const newUsername = username.trim(); // Limpiamos espacios
        if (newUsername !== profileData.username && newUsername !== '') {
            updateData.username = newUsername;
        }

        // 2. Full Name
        const newFullName = fullName.trim(); // Limpiamos espacios
        if (newFullName !== profileData.fullName && newFullName !== '') {
            updateData.fullName = newFullName;
        }
        
        // --- FIN DE LA LÓGICA CORREGIDA ---

        if (Object.keys(updateData).length === 0) {
            setMessage("No se detectaron cambios válidos.");
            setIsUpdating(false);
            return;
        }

        try {
            // 1. Ejecuta la actualización (PATCH)
            await UserService.updateUser(user.id, updateData); 
            
            // 2. Vuelve a llamar al GET para obtener el objeto COMPLETO y SINCRO
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

    // ----------------------------------------------------
    // Lógica para ELIMINAR la cuenta
    // ----------------------------------------------------
    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar tu cuenta?")) return;
        
        try {
            await UserService.deleteUser(user.id);
            logout(); 
            navigate('/login'); 
        } catch (err) {
             if (err instanceof Error) {
                 setError(`Fallo al eliminar: ${err.message}`);
            } else {
                 setError('Fallo al eliminar: Error desconocido.');
            }
        }
    }

    // ----------------------------------------------------
    // Renderizado
    // ----------------------------------------------------
    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #007bff', borderRadius: '8px' }}>
            
            {/* === BOTÓN VOLVER AL DASHBOARD === */}
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
            
            {/* 1. DATOS MOSTRADOS (TODOS LOS DATOS, INCLUIDO USERNAME Y FULLNAME) */}
            <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px' }}>
                <h3>Datos del Usuario</h3>
                
                <p><strong>Username:</strong> {profileData.username}</p>
                <p><strong>Nombre Completo:</strong> {profileData.fullName}</p>
                
                <p><strong>ID:</strong> {profileData.id}</p>
                <p><strong>Email:</strong> {profileData.email}</p>

                {/* === ESTADO DEL USUARIO === */}
                <p>
                    <strong>Estado del Usuario:</strong> 
                    <span style={{ color: profileData.userStatus ? 'green' : 'red', fontWeight: 'bold' }}>
                        {profileData.userStatus ? ' Activo' : ' No Activo'}
                    </span>
                </p>

                {/* === FECHA DE NACIMIENTO === */}
                <p>
                <strong>Fecha de Nacimiento:</strong> 
                {profileData.dateOfBirth && profileData.dateOfBirth.trim() !== '' 
                    ? new Date(profileData.dateOfBirth).toLocaleDateString() 
                    : ' N/A'}
                </p>

                <p><strong>Dirección:</strong> {profileData.address}</p>
            </div>

            <hr />

            {/* 2. Formulario de Actualización (Inputs usan Placeholder) */}
            <form onSubmit={handleUpdate} style={{ marginBottom: '20px' }}>
                <h3>Editar Perfil (Solo Nombre y Usuario)</h3>
                
                {/* Campo Username */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        onChange={(e) => setUsername(e.target.value)} 
                        disabled={isUpdating}
                        placeholder={profileData.username} // Muestra el valor actual como guía
                    />
                </div>
                
                {/* Campo Full Name */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Nombre Completo:</label>
                    <input 
                        type="text" 
                        onChange={(e) => setFullName(e.target.value)} 
                        disabled={isUpdating}
                        placeholder={profileData.fullName} // Muestra el valor actual como guía
                    />
                </div>

                <button 
                    type="submit" 
                    // Deshabilitar si está actualizando o si no hay cambios VÁLIDOS (vacío/sin cambiar)
                    disabled={isUpdating || (username === profileData.username && fullName === profileData.fullName)} 
                    style={{ backgroundColor: '#007bff', color: 'white' }}
                >
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