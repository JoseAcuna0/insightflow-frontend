export interface TaskDto
{
    id?: string;
    documentId?: string;
    title?: string;
    description?: string;
    comment?: string;
    status?: string;
    assignedTo?: string;
    dueDate?: Date;
    isDeleted?: boolean;
}