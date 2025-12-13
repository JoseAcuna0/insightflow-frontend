import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    // Obtenemos el usuario logueado Y la función de logout del contexto
    const { user, logout } = useAuth(); 

    if (!user) {
        // Redirige al login si el usuario no está autenticado
        navigate('/login');
        return null;
    }

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        // Llama a la función de logout proporcionada por el AuthContext
        logout(); 
        // Redirige al login después de cerrar sesión
        navigate('/login'); 
    };

    // --- Definición de Botones del Dashboard ---
    const buttons = [
        { 
            name: 'Ver Perfil', 
            path: '/profile', 
            description: 'Visualiza y edita tu información personal.', 
            disabled: false, 
            action: () => navigate('/profile') 
        },
        // === BOTÓN DE CERRAR SESIÓN AGREGADO AL FINAL ===
        { 
            name: 'Cerrar Sesión', 
            path: '/logout', 
            description: 'Termina tu sesión actual de forma segura.', 
            disabled: false, 
            action: handleLogout,
            isLogout: true // Etiqueta para aplicar el estilo rojo
        },
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center', color: 'white' }}>
            <h2>Bienvenido, {user.username}!</h2>
            <p style={{ marginBottom: '40px' }}>Este es el centro de control del sistema. Selecciona una opción:</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {buttons.map((button) => (
                    <div 
                        key={button.name}
                        style={{
                            border: '1px solid #444', 
                            padding: '15px', 
                            width: '200px',
                            cursor: button.disabled ? 'not-allowed' : 'pointer',
                            // Estilo condicional: Rojo si es botón de cerrar sesión, Azul oscuro en caso contrario
                            backgroundColor: button.isLogout ? '#dc3545' : button.disabled ? '#404040' : '#4a6597', 
                            color: 'white', 
                            borderRadius: '8px',
                            opacity: button.disabled ? 0.8 : 1,
                            transition: '0.3s',
                            textAlign: 'left',
                        }}
                        // Ejecuta la acción definida en el array
                        onClick={() => !button.disabled && button.action()}
                    >
                        <h3 style={{ margin: '0 0 10px 0', color: button.disabled ? '#aaa' : '#fff' }}>{button.name}</h3>
                        <p style={{ fontSize: '0.9em', color: button.disabled ? '#888' : '#ccc' }}>{button.description}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Dashboard;