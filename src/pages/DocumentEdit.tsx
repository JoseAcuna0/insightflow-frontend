import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentService, type Document } from '../services/DocumentService';

/**
 * Componente de Edición de Documento
 * Permite ver y editar un documento específico con un editor amigable
 */
const DocumentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para los campos editables
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [textContent, setTextContent] = useState(''); // Texto plano para editar
  const [viewMode, setViewMode] = useState<'simple' | 'json'>('simple'); // Modo de vista

  /**
   * Convierte JSON a texto plano legible
   */
  const jsonToText = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Si tiene estructura de bloques
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks
          .map((block: any) => {
            if (block.type === 'heading') {
              return `# ${block.content || ''}\n`;
            } else if (block.type === 'paragraph') {
              return `${block.content || ''}\n`;
            }
            return block.content || '';
          })
          .join('\n');
      }
      
      // Si es JSON vacío
      return '';
    } catch {
      return '';
    }
  };

  /**
   * Convierte texto plano a JSON con estructura de bloques
   */
  const textToJson = (text: string): string => {
    if (!text.trim()) {
      return JSON.stringify({ blocks: [] });
    }

    const lines = text.split('\n');
    const blocks = lines
      .filter(line => line.trim()) // Ignorar líneas vacías
      .map(line => {
        const trimmedLine = line.trim();
        
        // Si empieza con #, es un heading
        if (trimmedLine.startsWith('# ')) {
          return {
            type: 'heading',
            content: trimmedLine.substring(2).trim()
          };
        }
        
        // Si empieza con ##, es un subheading
        if (trimmedLine.startsWith('## ')) {
          return {
            type: 'subheading',
            content: trimmedLine.substring(3).trim()
          };
        }
        
        // Todo lo demás es un párrafo
        return {
          type: 'paragraph',
          content: trimmedLine
        };
      });

    return JSON.stringify({ blocks }, null, 2);
  };

  /**
   * Carga el documento al montar el componente
   */
  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  /**
   * Obtiene el documento del servidor
   */
  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const data = await DocumentService.getDocumentById(documentId);
      setDocument(data);
      setTitle(data.title);
      setIcon(data.icon);
      setTextContent(jsonToText(data.content)); // Convertir JSON a texto
      setError('');
    } catch (err) {
      setError('Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda los cambios del documento
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      // Convertir el texto plano a JSON antes de enviar
      const jsonContent = textToJson(textContent);
      
      await DocumentService.updateDocument(id, {
        title: title.trim(),
        icon: icon.trim(),
        content: jsonContent,
      });
      
      setSuccess('Documento actualizado correctamente');
      setError('');
      
      // Recargar el documento para mostrar los cambios
      loadDocument(id);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el documento');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <p>Cargando documento...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <p>Documento no encontrado</p>
        <button
          onClick={() => navigate('/documents')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          ← Volver a Documentos
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px', color: 'white' }}>
      
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>✏️ Editar Documento</h2>
        <button
          onClick={() => navigate('/documents')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          ← Volver a Documentos
        </button>
      </div>

      {/* Mensajes */}
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

      {success && (
        <div
          style={{
            padding: '15px',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            border: '1px solid #28a745',
            borderRadius: '5px',
            marginBottom: '20px',
            color: '#90ee90',
          }}
        >
          {success}
        </div>
      )}

      {/* Información del documento */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#333',
          border: '1px solid #444',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>
          <strong>ID:</strong> {document.id}
        </p>
        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>
          <strong>Workspace:</strong> {document.workspaceId}
        </p>
        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>
          <strong>Creado:</strong> {new Date(document.createdAt).toLocaleString()}
        </p>
        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>
          <strong>Actualizado:</strong> {new Date(document.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Formulario de edición */}
      <form
        onSubmit={handleSave}
        style={{
          padding: '20px',
          backgroundColor: '#333',
          border: '1px solid #444',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Editar Contenido</h3>

        {/* Campo: Título */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Título:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1em',
            }}
          />
        </div>

        {/* Campo: Ícono */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Ícono (emoji):
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1em',
            }}
          />
          <small style={{ color: '#aaa' }}>Vista previa: {icon}</small>
        </div>

        {/* Selector de modo de edición */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Modo de edición:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setViewMode('simple')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'simple' ? '#007bff' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📝 Editor Simple
            </button>
            <button
              type="button"
              onClick={() => {
                // Convertir el texto actual a JSON para mostrarlo
                setViewMode('json');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'json' ? '#007bff' : '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              🔧 Editor JSON (Avanzado)
            </button>
          </div>
        </div>

        {/* Editor Simple */}
        {viewMode === 'simple' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Contenido:
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={15}
              placeholder="Escribe tu contenido aquí...

Consejos:
- Usa # para crear títulos
- Usa ## para crear subtítulos
- Escribe párrafos normalmente, cada línea será un bloque
- Líneas vacías se ignorarán"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#444',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
                fontSize: '1em',
                fontFamily: 'inherit',
                resize: 'vertical',
                lineHeight: '1.6',
              }}
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '8px' }}>
              💡 <strong>Tip:</strong> Escribe normalmente. Usa <code style={{ backgroundColor: '#555', padding: '2px 6px', borderRadius: '3px' }}># Título</code> para encabezados.
            </small>
          </div>
        )}

        {/* Editor JSON (Avanzado) */}
        {viewMode === 'json' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Contenido (JSON):
            </label>
            <textarea
              value={textToJson(textContent)}
              onChange={(e) => {
                try {
                  // Intentar parsear para validar
                  JSON.parse(e.target.value);
                  // Si es válido, convertir de vuelta a texto
                  setTextContent(jsonToText(e.target.value));
                } catch {
                  // Si no es válido, no hacer nada (o mostrar error)
                  setError('JSON inválido');
                }
              }}
              rows={15}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#444',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
            <small style={{ color: '#aaa', display: 'block', marginTop: '8px' }}>
              ⚠️ <strong>Avanzado:</strong> Edita el JSON directamente. Debe ser válido.
            </small>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            💾 Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => {
              // Restaurar valores originales
              setTitle(document.title);
              setIcon(document.icon);
              setTextContent(jsonToText(document.content));
              setError('');
              setSuccess('');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            ↺ Deshacer Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentEdit;