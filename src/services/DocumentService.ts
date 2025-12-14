import axios from 'axios';

// URL de la API de documentos (ajustar según tu configuración)
const DOCUMENTS_API_URL = import.meta.env.VITE_DOCUMENTS_API_URL || 'http://localhost:5209/api/documents';

/**
 * Interfaz Document: Representa un documento en el sistema
 */
export interface Document {
  id: string;
  workspaceId: string;
  title: string;
  icon: string;
  content: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * DTO para crear un nuevo documento
 */
export interface CreateDocumentDto {
  workspaceId: string;
  title: string;
  icon: string;
  content: string;
  createdByUserId: string;
}

/**
 * DTO para actualizar un documento
 */
export interface UpdateDocumentDto {
  title?: string;
  icon?: string;
  content?: string;
}

/**
 * Servicio para la gestión de documentos
 */
export const DocumentService = {
  /**
   * Obtiene todos los documentos
   */
  async getAllDocuments(): Promise<Document[]> {
    try {
      const response = await axios.get<Document[]>(DOCUMENTS_API_URL);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener los documentos');
    }
  },

  /**
   * Obtiene un documento por su ID
   */
  async getDocumentById(id: string): Promise<Document> {
    try {
      const response = await axios.get<Document>(`${DOCUMENTS_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener el documento');
    }
  },

  /**
   * Obtiene los documentos de un workspace
   */
  async getDocumentsByWorkspace(workspaceId: string): Promise<Document[]> {
    try {
      const response = await axios.get<Document[]>(`${DOCUMENTS_API_URL}/workspace/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener los documentos del workspace');
    }
  },

  /**
   * Crea un nuevo documento
   */
  async createDocument(data: CreateDocumentDto): Promise<Document> {
    // Validación previa
    if (!data.workspaceId) {
      throw new Error('El Workspace ID es requerido');
    }
    if (!data.title) {
      throw new Error('El título es requerido');
    }
    if (!data.icon) {
      throw new Error('El ícono es requerido');
    }
    if (!data.createdByUserId) {
      throw new Error('El ID del usuario es requerido');
    }

    console.log('📤 Enviando documento a API:', data);

    try {
      const response = await axios.post<Document>(DOCUMENTS_API_URL, data);
      console.log('✅ Documento creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear documento:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un código de error
          const errorMessage = error.response.data?.error || error.response.data?.message || 'Error del servidor';
          console.error('Respuesta del servidor:', error.response.data);
          throw new Error(`Error ${error.response.status}: ${errorMessage}`);
        } else if (error.request) {
          // La petición se hizo pero no hubo respuesta
          throw new Error('No se recibió respuesta del servidor. Verifica que el backend esté corriendo.');
        }
      }
      throw new Error('Error de conexión al crear el documento');
    }
  },

  /**
   * Actualiza un documento existente
   */
  async updateDocument(id: string, data: UpdateDocumentDto): Promise<Document> {
    try {
      const response = await axios.patch<Document>(`${DOCUMENTS_API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Error al actualizar el documento');
      }
      throw new Error('Error de conexión al actualizar el documento');
    }
  },

  /**
   * Elimina un documento (soft delete)
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await axios.delete(`${DOCUMENTS_API_URL}/${id}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Error al eliminar el documento');
      }
      throw new Error('Error de conexión al eliminar el documento');
    }
  },
};