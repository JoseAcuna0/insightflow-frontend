import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { TaskService } from '../services/TaskService';
import { type TaskDto } from '../services/types/TaskDto';
import { useAuth } from '../context/AuthContext';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Obtener documentId de la URL (cuando esté implementado)
  const location = useLocation();
  const params = useParams();
  
  // Prioridad: params > location.state > hardcoded
  // TODO: Eliminar el valor hardcoded cuando se implemente la navegación desde otra página
  const initialDocumentId = 
    params.documentId || 
    (location.state as any)?.documentId || 
    '3fa85f64-5717-4562-b3fc-2c963f66afa6'; // Valor provisional

  // Estado para la lista de tareas
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado para el documentId
  const [documentId] = useState(initialDocumentId);

  // Modal para crear tarea
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  
  // Modal para ver/editar tarea seleccionada
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalError, setDetailModalError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  
  // Usuarios fijos para asignar tareas
  const USERS = [
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa4', name: 'usuario1' },
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa5', name: 'usuario2' },
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'usuario3' },
  ];

  // Estado para crear tarea
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    comment: '',
    dueDate: '',
    assignedTo: '3fa85f64-5717-4562-b3fc-2c963f66afa4'
  });
  
  // Estado para editar tarea seleccionada
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    comment: '',
    status: '',
    dueDate: '',
    assignedTo: '3fa85f64-5717-4562-b3fc-2c963f66afa4'
  });

  // Cambiar esto por user.id cuando se integre la autenticación
  const currentUserId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  // Estado para drag and drop
  const [draggedTask, setDraggedTask] = useState<TaskDto | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  // Obtener todas las tareas de un documento
  const handleGetTasks = async () => {
    if (!documentId) {
      setError('Document ID no disponible');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const data = await TaskService.getTasks(documentId);
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tareas automáticamente al montar el componente
  useEffect(() => {
    if (documentId) {
      handleGetTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crear una nueva tarea
  const handleCreateTask = async () => {
    if (!documentId || !createFormData.title || !createFormData.dueDate) {
      setCreateModalError('Completa todos los campos obligatorios (título y fecha)');
      return;
    }
    setCreateModalError(null);
    setLoading(true);
    try {
      await TaskService.createTask({
        documentId,
        title: createFormData.title,
        description: createFormData.description,
        comment: createFormData.comment,
        status: 'pending',
        assignedTo: createFormData.assignedTo,
        dueDate: new Date(createFormData.dueDate).toISOString()
      });
      setSuccessMsg('Tarea creada correctamente');
      setCreateFormData({ title: '', description: '', comment: '', dueDate: '', assignedTo: '3fa85f64-5717-4562-b3fc-2c963f66afa4' });
      setCreateModalError(null);
      setShowCreateModal(false);
      handleGetTasks();
    } catch (err: any) {
      setCreateModalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar tarea seleccionada
  const handleUpdateSelectedTask = async () => {
    if (!selectedTask?.id || !editFormData.title || !editFormData.dueDate) {
      setDetailModalError('Completa todos los campos obligatorios (título y fecha)');
      return;
    }
    setDetailModalError(null);
    setLoading(true);
    try {
      await TaskService.updateTask({
        taskId: selectedTask.id,
        title: editFormData.title,
        description: editFormData.description,
        comment: editFormData.comment,
        status: selectedTask.status || 'pending',
        assignedTo: editFormData.assignedTo,
        dueDate: new Date(editFormData.dueDate).toISOString()
      });
      setSuccessMsg('Tarea actualizada correctamente');
      setDetailModalError(null);
      setShowDetailModal(false);
      setSelectedTask(null);
      handleGetTasks();
    } catch (err: any) {
      setDetailModalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarea seleccionada desde el modal de detalle
  const handleDeleteSelectedTask = async () => {
    if (!selectedTask?.id) {
      setDetailModalError('No hay tarea seleccionada');
      return;
    }
    setDetailModalError(null);
    setLoading(true);
    setShowDetailModal(false);
    try {
      await TaskService.deleteTask(selectedTask.id);
      setSuccessMsg('Tarea eliminada correctamente');
      setSelectedTask(null);
      await handleGetTasks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  // Abrir modal para crear tarea
  const handleOpenCreateModal = () => {
    setCreateFormData({ title: '', description: '', comment: '', dueDate: '', assignedTo: '3fa85f64-5717-4562-b3fc-2c963f66afa4' });
    setCreateModalError(null);
    setShowCreateModal(true);
    clearMessages();
  };

  // Cerrar modal de crear
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({ title: '', description: '', comment: '', dueDate: '', assignedTo: '3fa85f64-5717-4562-b3fc-2c963f66afa4' });
    setCreateModalError(null);
    clearMessages();
  };

  // Abrir modal de detalle al seleccionar una tarea
  const handleSelectTask = (task: TaskDto) => {
    setSelectedTask(task);
    setEditFormData({
      title: task.title || '',
      description: task.description || '',
      comment: task.comment || '',
      status: task.status || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      assignedTo: task.assignedTo || '3fa85f64-5717-4562-b3fc-2c963f66afa4'
    });
    setDetailModalError(null);
    setShowDetailModal(true);
    clearMessages();
  };

  // Cerrar modal de detalle
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
    setDetailModalError(null);
    clearMessages();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Funciones para drag and drop
  const handleDragStart = (e: React.DragEvent, task: TaskDto) => {
    setDraggedTask(task);
    // Hacer que la tarea sea semitransparente mientras se arrastra
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask) {
      return;
    }

    // Si la tarea se suelta en la misma columna, no hacer nada
    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    // Actualizar el estado local inmediatamente para feedback visual rápido
    const updatedTasks = tasks.map(task => 
      task.id === draggedTask.id 
        ? { ...task, status: newStatus }
        : task
    );
    setTasks(updatedTasks);

    // Actualizar el estado de la tarea en el backend
    try {
      await TaskService.updateTask({
        taskId: draggedTask.id || '',
        title: draggedTask.title || '',
        description: draggedTask.description || '',
        comment: draggedTask.comment || '',
        status: newStatus,
        assignedTo: draggedTask.assignedTo || currentUserId,
        dueDate: draggedTask.dueDate ? new Date(draggedTask.dueDate).toISOString() : new Date().toISOString()
      });
    } catch (err: any) {
      // Si falla, revertir el cambio local y recargar
      setError(err.message);
      await handleGetTasks();
    } finally {
      setDraggedTask(null);
    }
  };

  // Agrupar tareas por estado y ordenar por fecha de vencimiento
  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending').sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }),
    'in-progress': tasks.filter(t => t.status === 'in-progress').sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }),
    completed: tasks.filter(t => t.status === 'completed').sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#242424', color: 'white', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        backgroundColor: '#1a1a1a',
        padding: '15px 30px',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#646cff' }}>InsightFlow</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a6597',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/profile')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a6597',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Perfil
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '30px 20px 30px 20px' }}>
        {/* Header con botón crear */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0 }}>Gestión de Tareas</h2>
          <button 
            onClick={handleOpenCreateModal}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4a6597',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ Nueva Tarea
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div style={{
            background: '#dc3545',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #c82333'
          }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{
            background: '#28a745',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #218838'
          }}>
            {successMsg}
          </div>
        )}

        {/* Tablero Kanban */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          height: 'calc(100vh - 280px)',
          minHeight: '400px',
          maxHeight: '800px'
        }}>
          {/* Columna Pendiente */}
            <div
              onDragOver={(e) => handleDragOver(e, 'pending')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'pending')}
              style={{
                backgroundColor: dragOverColumn === 'pending' ? '#2a2a1a' : '#1a1a1a',
                border: dragOverColumn === 'pending' ? '2px dashed #ffc107' : '2px solid #ffc107',
                borderRadius: '12px',
                padding: '15px',
                height: '100%',
                maxHeight: '100%',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <h3 style={{
                margin: '0 0 20px 0',
                padding: '10px',
                backgroundColor: '#ffc107',
                color: '#000',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                📝 Pendiente ({tasksByStatus.pending.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
                {tasksByStatus.pending.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px', fontSize: '14px' }}>
                    No hay tareas pendientes
                  </p>
                ) : (
                  tasksByStatus.pending.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSelectTask(task)}
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #ffc107',
                      borderRadius: '10px',
                      padding: '15px',
                      cursor: draggedTask?.id === task.id ? 'grabbing' : 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.3s',
                      opacity: draggedTask?.id === task.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 10px 0',
                      fontSize: '16px',
                      color: '#ffc107',
                      wordBreak: 'break-word'
                    }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p style={{
                        margin: '5px 0 10px 0',
                        fontSize: '13px',
                        color: '#bbb',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word'
                      }}>
                        {task.description}
                      </p>
                    )}
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                      📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                      👤 Asignado a: {USERS.find(u => u.id === task.assignedTo)?.name || 'Sin asignar'}
                    </p>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Columna En Progreso */}
            <div
              onDragOver={(e) => handleDragOver(e, 'in-progress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'in-progress')}
              style={{
                backgroundColor: dragOverColumn === 'in-progress' ? '#1a1a2a' : '#1a1a1a',
                border: dragOverColumn === 'in-progress' ? '2px dashed #646cff' : '2px solid #646cff',
                borderRadius: '12px',
                padding: '15px',
                height: '100%',
                maxHeight: '100%',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <h3 style={{
                margin: '0 0 20px 0',
                padding: '10px',
                backgroundColor: '#646cff',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                ⚙️ En Progreso ({tasksByStatus['in-progress'].length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
                {tasksByStatus['in-progress'].length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px', fontSize: '14px' }}>
                    No hay tareas en progreso
                  </p>
                ) : (
                  tasksByStatus['in-progress'].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '10px',
                      padding: '15px',
                      cursor: draggedTask?.id === task.id ? 'grabbing' : 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.3s',
                      opacity: draggedTask?.id === task.id ? 0.5 : 1
                    }}
                    onClick={() => handleSelectTask(task)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 108, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 10px 0',
                      fontSize: '16px',
                      color: '#646cff',
                      wordBreak: 'break-word'
                    }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p style={{
                        margin: '5px 0 10px 0',
                        fontSize: '13px',
                        color: '#bbb',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word'
                      }}>
                        {task.description}
                      </p>
                    )}
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                      📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                      👤 Asignado a: {USERS.find(u => u.id === task.assignedTo)?.name || 'Sin asignar'}
                    </p>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Columna Completada */}
            <div
              onDragOver={(e) => handleDragOver(e, 'completed')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'completed')}
              style={{
                backgroundColor: dragOverColumn === 'completed' ? '#1a2a1a' : '#1a1a1a',
                border: dragOverColumn === 'completed' ? '2px dashed #28a745' : '2px solid #28a745',
                borderRadius: '12px',
                padding: '15px',
                height: '100%',
                maxHeight: '100%',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <h3 style={{
                margin: '0 0 20px 0',
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                ✅ Completada ({tasksByStatus.completed.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
                {tasksByStatus.completed.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px', fontSize: '14px' }}>
                    No hay tareas completadas
                  </p>
                ) : (
                  tasksByStatus.completed.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSelectTask(task)}
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '10px',
                      padding: '15px',
                      cursor: draggedTask?.id === task.id ? 'grabbing' : 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.3s',
                      opacity: draggedTask?.id === task.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 10px 0',
                      fontSize: '16px',
                      color: '#28a745',
                      wordBreak: 'break-word'
                    }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p style={{
                        margin: '5px 0 10px 0',
                        fontSize: '13px',
                        color: '#bbb',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word'
                      }}>
                        {task.description}
                      </p>
                    )}
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                      📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                      👤 Asignado a: {USERS.find(u => u.id === task.assignedTo)?.name || 'Sin asignar'}
                    </p>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Modal para crear tarea */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#646cff' }}>Nueva Tarea</h2>

            {createModalError && (
              <div style={{
                background: '#dc3545',
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '6px',
                border: '1px solid #c82333',
                fontSize: '14px'
              }}>
                {createModalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Título *:</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="Ingresa el título de la tarea"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Descripción:</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Descripción detallada de la tarea (opcional)"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Comentario:</label>
                <textarea
                  value={createFormData.comment}
                  onChange={(e) => setCreateFormData({ ...createFormData, comment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '60px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Comentarios adicionales (opcional)"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Fecha de vencimiento *:</label>
                <input
                  type="datetime-local"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Asignar a:</label>
                <select
                  value={createFormData.assignedTo}
                  onChange={(e) => setCreateFormData({ ...createFormData, assignedTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {USERS.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={handleCreateTask}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#4a6597',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Creando...' : 'Crear Tarea'}
              </button>
              <button
                onClick={handleCloseCreateModal}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle/edición de tarea */}
      {showDetailModal && selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #646cff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#646cff' }}>Detalle de Tarea</h2>

            {detailModalError && (
              <div style={{
                background: '#dc3545',
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '6px',
                border: '1px solid #c82333',
                fontSize: '14px'
              }}>
                {detailModalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Título *:</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="Título de la tarea"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Descripción:</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Descripción detallada (opcional)"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Comentario:</label>
                <textarea
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '60px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Comentarios adicionales (opcional)"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Fecha de vencimiento *:</label>
                <input
                  type="datetime-local"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Asignar a:</label>
                <select
                  value={editFormData.assignedTo}
                  onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {USERS.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={handleUpdateSelectedTask}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#4a6597',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button
                onClick={handleDeleteSelectedTask}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={handleCloseDetailModal}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
