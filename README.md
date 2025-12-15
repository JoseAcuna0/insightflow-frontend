# InsightFlow Frontend

## 📋 Descripción

InsightFlow Frontend es una aplicación web construida con React y TypeScript que proporciona una interfaz de usuario moderna para gestionar espacios de trabajo documentos, tareas y usuarios. El proyecto implementa una arquitectura de microservicios comunicándose con múltiples backends especializados.

## 🏗️ Arquitectura

### Arquitectura de Microservicios

El frontend se comunica con tres servicios backend independientes:

```
    ┌──────────────────────────────────────┐
    │     InsightFlow Frontend (React)     │
    │         Desplegado en firebase       │
    └────────────────────┬─────────────────┘
                         │
     ┌───────────────────│─────────────────┐
     │                   │                 │
     ▼                   ▼                 ▼
┌─────────┐      ┌────────────┐      ┌────────────┐
│  User   │      │  Document  │      │    Task    │
│ Service │      │   Service  │      │   Service  │
│(Render) │      │  (Render)  │      │  (Render)  │
└─────────┘      └────────────┘      └────────────┘
```


## 🎨 Patrones de Diseño

### 1. **Service Layer Pattern**
Cada servicio backend tiene su propia capa de servicio encapsulada:

```typescript
// Ejemplo: AuthService.ts
export const AuthService = {
  async login(credentials: LoginRequest): Promise<User> {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  }
};
```

**Beneficios:**
- Separación de lógica de negocio de la UI
- Fácil mantenimiento y testing
- Reutilización de código

### 2. **Context API Pattern**
Gestión del estado global de autenticación:

```typescript
// AuthContext.tsx
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (identifier: string, password: string) => {
    const loggedInUser = await AuthService.login({ identifier, password });
    setUser(loggedInUser);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Beneficios:**
- Estado compartido sin prop drilling
- Single source of truth para autenticación
- Simplifica la gestión de sesión



## 🔌 Endpoints Disponibles

### **AuthService**
- `POST /api/users/login`

### **UserService**
- `GET /api/users/{userId}`
- `PATCH /api/users/{userId}`
- `DELETE /api/users/{userId}`

### **TaskService**
- `GET /documents/{documentId}/tasks`
- `GET /tasks/{taskId}`
- `POST /tasks`
- `PATCH /tasks/{taskId}`
- `DELETE /tasks/{taskId}`


### **DocumentService**
- `POST/documents`
- `GET /documents/{id}`
- `PATCH /documents/{id}`
- `DELETE /documents/{id}`

---

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos

- **Node.js** >= 22.0.0
- **npm** >= 9.0.0
- **Git**

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/JoseAcuna0/insightflow-frontend.git
cd insightflow-frontend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto, los valores que debe ir en el env se pueden encontrar en el package.json:

```bash
# .env
VITE_USERS_API_URL=users-service-page
VITE_DOCUMENTS_API_URL=documents-service-page
VITE_TASKS_API_URL=tasks-service-page
```


### Paso 4: Probar en Modo de Desarrollo o Local

```bash
npm run dev
```

El proyecto estará disponible en: **http://localhost:5173**

### Paso 5: Probar Sistema Desplegado

Simplemente debemos dirirnos a la pagina


## 📦 Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| **React 19** | Librería de UI |
| **TypeScript** | Tipado estático |
| **Vite** | Build tool y dev server |
| **React Router DOM** | Navegación SPA |
| **Axios** | Cliente HTTP |
| **ESLint** | Linter de código |

---

## 🗂️ Rutas de la Aplicación

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/login` | `Login` | ❌ | Inicio de sesión |
| `/` | `Dashboard` | ✅ | Página principal |
| `/profile` | `Profile` | ✅ | Perfil de usuario |
| `/tasks` | `Tasks` | ✅ | Gestión de tareas |

---

