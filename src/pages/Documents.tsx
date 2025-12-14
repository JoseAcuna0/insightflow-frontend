import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DocumentService, type Document } from '../services/DocumentService';

/**
 * Componente de Lista de Documentos
 * Muestra documentos del usuario filtrados por workspace
 */
const Documents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]); // Todos los docs del usuario
  const [deletedDocuments, setDeletedDocuments] = useState<Document[]>([]); // Docs eliminados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para crear documento
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📄');
  const [newWorkspace, setNewWorkspace] = useState('workspace-example-1');

  // Estado para filtro de workspace
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [availableWorkspaces, setAvailableWorkspaces] = useState<string[]>([]);

  // Estado para vista de papelera
  const [showTrash, setShowTrash] = useState(false);

  /**
   * Carga los documentos al montar el componente
   */
  useEffect(() => {
    loadDocuments();
  }, []);

  /**
   * Obtiene todos los documentos del servidor, filtra por usuario y extrae workspaces
   */
  const loadDocuments = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await DocumentService.getAllDocuments();
      
      // Separar documentos activos y eliminados del usuario actual
      const userActiveDocuments = data.filter(
        doc => doc.isActive === true && doc.createdByUserId === user.id
      );

      const userDeletedDocuments = data.filter(
        doc => doc.isActive === false && doc.createdByUserId === user.id
      );
      
      // Extraer workspaces únicos de documentos activos
      const workspaces = Array.from(
        new Set(userActiveDocuments.map(doc => doc.workspaceId))
      ).sort();
      
      setAllDocuments(userActiveDocuments);
      setDeletedDocuments(userDeletedDocuments);
      setAvailableWorkspaces(workspaces);
      
      // Aplicar filtro de workspace solo si no estamos en papelera
      if (!showTrash) {
        filterByWorkspace(userActiveDocuments, selectedWorkspace);
      }
      
      setError('');
      
      console.log(`📊 Total documentos: ${data.length}`);
      console.log(`👤 Documentos activos del usuario: ${userActiveDocuments.length}`);
      console.log(`🗑️ Documentos eliminados del usuario: ${userDeletedDocuments.length}`);
      console.log(`📁 Workspaces disponibles:`, workspaces);
    } catch (err) {
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra documentos por workspace seleccionado
   */
  const filterByWorkspace = (docs: Document[], workspace: string) => {
    if (workspace === 'all') {
      setDocuments(docs);
    } else {
      const filtered = docs.filter(doc => doc.workspaceId === workspace);
      setDocuments(filtered);
    }
  };

  /**
   * Maneja el cambio de workspace seleccionado
   */
  const handleWorkspaceChange = (workspace: string) => {
    setSelectedWorkspace(workspace);
    filterByWorkspace(allDocuments, workspace);
  };

  /**
   * Cambia entre vista normal y papelera
   */
  const toggleTrashView = () => {
    const newShowTrash = !showTrash;
    setShowTrash(newShowTrash);
    
    if (newShowTrash) {
      // Mostrar documentos eliminados
      setDocuments(deletedDocuments);
    } else {
      // Volver a documentos activos con filtro de workspace
      filterByWorkspace(allDocuments, selectedWorkspace);
    }
  };

  /**
   * Crea un nuevo documento
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }
    
    if (!newTitle.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!newIcon.trim()) {
      setError('El ícono es requerido');
      return;
    }

    if (!newWorkspace.trim()) {
      setError('El workspace es requerido');
      return;
    }

    try {
      setError(''); // Limpiar errores previos
      
      const createData = {
        workspaceId: newWorkspace.trim(),
        title: newTitle.trim(),
        icon: newIcon.trim(),
        content: '{}',
        createdByUserId: user.id,
      };

      console.log('Enviando datos:', createData); // Debug
      
      await DocumentService.createDocument(createData);
      
      // Limpiar formulario
      setNewTitle('');
      setNewIcon('📄');
      setNewWorkspace('workspace-example-1');
      setShowCreateForm(false);
      
      // Recargar lista
      await loadDocuments();
    } catch (err) {
      console.error('Error al crear documento:', err); // Debug
      setError(err instanceof Error ? err.message : 'Error al crear documento');
    }
  };

  /**
   * Elimina un documento
   */
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

    try {
      await DocumentService.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar documento');
    }
  };

  /**
   * Navega a la vista de edición del documento
   */
  const handleEdit = (id: string) => {
    navigate(`/documents/${id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <p>Cargando documentos...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', color: 'white' }}>
      
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>{showTrash ? '🗑️ Papelera de Reciclaje' : '📚 Mis Documentos'}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!showTrash && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: showCreateForm ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {showCreateForm ? 'Cancelar' : '➕ Nuevo Documento'}
            </button>
          )}
          <button
            onClick={toggleTrashView}
            style={{
              padding: '10px 20px',
              backgroundColor: showTrash ? '#007bff' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showTrash ? '📚 Ver Documentos' : `🗑️ Papelera (${deletedDocuments.length})`}
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            border: '1px solid #dc3545',
            borderRadius: '5px',
            marginBottom: '20px',
            color: '#ff6b6b',
          }}
        >
          {error}
        </div>
      )}

      {/* Mensaje informativo */}
      {!loading && !showTrash && documents.length > 0 && (
        <div
          style={{
            padding: '12px 15px',
            backgroundColor: 'rgba(23, 162, 184, 0.15)',
            border: '1px solid rgba(23, 162, 184, 0.3)',
            borderRadius: '5px',
            marginBottom: '20px',
            color: '#17a2b8',
            fontSize: '0.9em',
          }}
        >
          ℹ️ Mostrando {documents.length} documento{documents.length !== 1 ? 's' : ''} 
          {selectedWorkspace !== 'all' && ` en ${selectedWorkspace}`}
        </div>
      )}

      {/* Mensaje informativo de papelera */}
      {!loading && showTrash && (
        <div
          style={{
            padding: '12px 15px',
            backgroundColor: 'rgba(220, 53, 69, 0.15)',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: '5px',
            marginBottom: '20px',
            color: '#ff6b6b',
            fontSize: '0.9em',
          }}
        >
          🗑️ Papelera: {deletedDocuments.length} documento{deletedDocuments.length !== 1 ? 's' : ''} eliminado{deletedDocuments.length !== 1 ? 's' : ''}
          {deletedDocuments.length > 0 && ' (Los documentos en la papelera no se pueden recuperar)'}
        </div>
      )}

      {/* Filtro por Workspace - Solo en vista normal */}
      {!loading && !showTrash && availableWorkspaces.length > 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            📁 Filtrar por Workspace:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleWorkspaceChange('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedWorkspace === 'all' ? '#007bff' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: selectedWorkspace === 'all' ? 'bold' : 'normal',
              }}
            >
              🌐 Todos ({allDocuments.length})
            </button>
            {availableWorkspaces.map((workspace) => {
              const count = allDocuments.filter(doc => doc.workspaceId === workspace).length;
              return (
                <button
                  key={workspace}
                  onClick={() => handleWorkspaceChange(workspace)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedWorkspace === workspace ? '#007bff' : '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: selectedWorkspace === workspace ? 'bold' : 'normal',
                  }}
                >
                  📂 {workspace} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario de crear documento - Solo en vista normal */}
      {!showTrash && showCreateForm && (
        <form
          onSubmit={handleCreate}
          style={{
            padding: '20px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            marginBottom: '30px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Crear Nuevo Documento</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título del documento"
              required
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#444',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Ícono (emoji):</label>
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="📄"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#444',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Workspace:</label>
            <select
              value={newWorkspace}
              onChange={(e) => setNewWorkspace(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#444',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
              }}
            >
              <option value="workspace-example-1">Workspace 1</option>
              <option value="workspace-example-2">Workspace 2</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Crear Documento
          </button>
        </form>
      )}

      {/* Lista de documentos */}
      {documents.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          {showTrash 
            ? (deletedDocuments.length === 0 
                ? '🎉 No hay documentos en la papelera' 
                : 'No hay documentos eliminados')
            : (allDocuments.length === 0 
                ? 'No tienes documentos. ¡Crea tu primer documento!' 
                : `No hay documentos en ${selectedWorkspace === 'all' ? 'ningún workspace' : selectedWorkspace}`)
          }
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                padding: '20px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: '0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#007bff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#444')}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '2em', marginRight: '10px' }}>{doc.icon}</span>
                <h3 style={{ margin: 0, flex: 1 }}>{doc.title}</h3>
              </div>
              
              <p style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '10px' }}>
                Workspace: {doc.workspaceId}
              </p>
              
              <p style={{ fontSize: '0.8em', color: '#888' }}>
                Actualizado: {new Date(doc.updatedAt).toLocaleDateString()}
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {showTrash ? (
                  // Vista de papelera - solo botón de ver
                  <button
                    onClick={() => handleEdit(doc.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    👁️ Ver
                  </button>
                ) : (
                  // Vista normal - botones de editar y eliminar
                  <>
                    <button
                      onClick={() => handleEdit(doc.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;