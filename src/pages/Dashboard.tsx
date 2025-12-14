import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

/**
 * Componente Dashboard (Panel de Control).
 * Representa la página principal a la que accede el usuario una vez autenticado.
 * Muestra un menú de opciones disponibles (como Perfil, Documentos o Cerrar Sesión).
 */
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    
    // Extrae el usuario actual y la función de logout del contexto global de autenticación
    const { user, logout } = useAuth(); 

    // Verificación de seguridad (aunque PrivateRoute ya maneja esto, es una doble capa de seguridad)
    if (!user) {
        navigate('/login');
        return null;
    }

    /**
     * Maneja el proceso de cierre de sesión.
     * Ejecuta la limpieza del estado global y redirige al usuario a la pantalla de login.
     */
    const handleLogout = () => {
        logout(); // Limpia el usuario del contexto/localStorage
        navigate('/login'); // Redirección inmediata
    };

    // --- Configuración de Botones del Menú ---
    // Array de objetos que define las tarjetas de acción del dashboard.
    // Facilita la escalabilidad: para añadir una opción, solo se agrega un objeto aquí.
    const buttons = [
        { 
            name: 'Ver Perfil', 
            path: '/profile', 
            description: 'Visualiza y edita tu información personal.', 
            disabled: false, 
            action: () => navigate('/profile') 
        },
        { 
            name: 'Documentos', 
            path: '/documents', 
            description: 'Gestiona tus documentos y notas.', 
            disabled: false, 
            action: () => navigate('/documents'),
            icon: '📚'
        },
        // Opción de Cerrar Sesión (Configurada con estilo de alerta)
        { 
            name: 'Cerrar Sesión', 
            path: '/logout', 
            description: 'Termina tu sesión actual de forma segura.', 
            disabled: false, 
            action: handleLogout,
            isLogout: true // Propiedad personalizada para aplicar estilos rojos (peligro/acción crítica)
        },
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center', color: 'white' }}>
            
            {/* Cabecera de bienvenida personalizada */}
            <h2>Bienvenido, {user.username}!</h2>
            <p style={{ marginBottom: '40px' }}>Este es el centro de control del sistema. Selecciona una opción:</p>
            
            {/* Contenedor Flex para las tarjetas del menú */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {buttons.map((button) => (
                    <div 
                        key={button.name}
                        style={{
                            border: '1px solid #444', 
                            padding: '15px', 
                            width: '200px',
                            cursor: button.disabled ? 'not-allowed' : 'pointer',
                            // Estilo condicional:
                            // 1. Rojo (#dc3545) si es botón de logout.
                            // 2. Gris oscuro (#404040) si está deshabilitado.
                            // 3. Azul (#4a6597) por defecto.
                            backgroundColor: button.isLogout ? '#dc3545' : button.disabled ? '#404040' : '#4a6597', 
                            color: 'white', 
                            borderRadius: '8px',
                            opacity: button.disabled ? 0.8 : 1,
                            transition: '0.3s',
                            textAlign: 'left',
                        }}
                        // Ejecuta la acción asociada solo si el botón no está deshabilitado
                        onClick={() => !button.disabled && button.action()}
                    >
                        <h3 style={{ margin: '0 0 10px 0', color: button.disabled ? '#aaa' : '#fff' }}>
                            {button.icon && <span style={{ marginRight: '8px' }}>{button.icon}</span>}
                            {button.name}
                        </h3>
                        <p style={{ fontSize: '0.9em', color: button.disabled ? '#888' : '#ccc' }}>
                            {button.description}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Dashboard;