import axios from 'axios';
import { type TaskDto } from './types/TaskDto'; 

const TASKS_API_URL = 'https://insightflow-taskservice.onrender.com';

export const TaskService = {
  /**
   * Obtiene todas las tareas de un documento.
   * @param documentId El ID del documento.
   */
  async getTasks(documentId: string): Promise<TaskDto[]> {
    const endpoint = `${TASKS_API_URL}/documents/${documentId}/tasks`;
    try {
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener las tareas:' + error);
    }
  },

  /**
   * Obtiene una tarea específica de un documento.
   * @param taskId El ID de la tarea.
   */
  async getTask(taskId: string): Promise<TaskDto> {
    const endpoint = `${TASKS_API_URL}/tasks/${taskId}`;
    try {
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener la tarea:' + error);
    }
  },

  /**
   * Crea una nueva tarea en un documento.
   * @param params Objeto con los datos de la tarea.
   */
  async createTask(params: {
    documentId: string;
    title: string;
    description: string;
    comment: string;
    status: string;
    assignedTo: string;
    dueDate: string;
  }): Promise<TaskDto> {
    const { documentId, title, description, comment, status, assignedTo, dueDate } = params;
    const endpoint = `${TASKS_API_URL}/tasks`;
    const body = {
      documentId,
      title,
      description,
      comment,
      status,
      assignedTo,
      dueDate
    };
    try {
      const response = await axios.post(endpoint, body);
      return response.data;
    } catch (error) {
      throw new Error('Error al crear la tarea:' + error);
    }
  },

  /**
   * Actualiza una tarea existente en un documento.
   * @param params Objeto con los datos de la tarea a actualizar.
   */
  async updateTask(params: {
    taskId: string;
    title: string;
    description: string;
    comment: string;
    status: string;
    assignedTo: string;
    dueDate: string;
  }): Promise<TaskDto> {
    const { taskId, title, description, comment, status, assignedTo, dueDate } = params;
    const endpoint = `${TASKS_API_URL}/tasks/${taskId}`;
    const body = {
      title,
      description,
      comment,
      status,
      assignedTo,
      dueDate
    };
    try {
      const response = await axios.patch(endpoint, body);
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar la tarea:' + error);
    }
  },

  /**
   * Elimina una tarea de un documento.
   * @param taskId El ID de la tarea.
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const endpoint = `${TASKS_API_URL}/tasks/${taskId}`;
    try {
      await axios.delete(endpoint);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar la tarea:' + error);
    }
  }
};
