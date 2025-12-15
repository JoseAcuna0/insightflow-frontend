/**
 * Data Transfer Object usado por `TaskService` para representar las tareas.
 * Todos los campos son opcionales para facilitar la deserialización desde el backend
 * en casos donde no se devuelvan todos los campos.
 *
 */
export interface TaskDto {
    /** UUID de la tarea */
    id?: string;
    /** UUID del documento relacionado */
    documentId?: string;
    /** Título breve */
    title?: string;
    /** Descripción completa */
    description?: string;
    /** Comentario o nota adicional */
    comment?: string;
    /** Estado de la tarea */
    status?: string;
    /** ID del usuario asignado */
    assignedTo?: string;
    /** Fecha de vencimiento (ISO string o Date) */
    dueDate?: Date | string;
    /** Estado del Softdelete*/
    isDeleted?: boolean;
}