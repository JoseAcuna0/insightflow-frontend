import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DocumentService, type Document } from '../services/DocumentService';

/**
 * Componente de Lista de Documentos
 * Muestra todos los documentos y permite crear, editar y eliminar
 */
const Documents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para crear documento
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📄');
  const [newWorkspace, setNewWorkspace] = useState('workspace-example-1');

  /**
   * Carga los documentos al montar el componente
   */
  useEffect(() => {
    loadDocuments();
  }, []);

  /**
   * Obtiene todos los documentos del servidor
   */
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await DocumentService.getAllDocuments();
      setDocuments(data);
      setError('');
    } catch (err) {
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
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
        <h2>📚 Mis Documentos</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showCreateForm ? 'Cancelar' : '➕ Nuevo Documento'}
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

      {/* Formulario de crear documento */}
      {showCreateForm && (
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
        <p style={{ textAlign: 'center', color: '#888' }}>
          No hay documentos. ¡Crea tu primer documento!
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;