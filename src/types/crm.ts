export type LeadStage =
  | 'Nuevo Lead'
  | 'Contactado'
  | 'Interesado'
  | 'Reunión Agendada'
  | 'Propuesta Enviada'
  | 'Negociación'
  | 'Ganado'
  | 'Perdido';

export type LeadSource =
  | 'Sitio Web'
  | 'Meta Ads'
  | 'Google Ads'
  | 'LinkedIn'
  | 'Referido'
  | 'Evento / Feria'
  | 'WhatsApp Inbound';

export type ActivityType = 'Llamada' | 'Correo' | 'WhatsApp' | 'Reunión' | 'Nota';

export type ActivityResult =
  | 'Exitoso'
  | 'Sin respuesta'
  | 'Ocupado'
  | 'Reagendado'
  | 'Interesado'
  | 'Rechazado';

export type TaskPriority = 'Alta' | 'Media' | 'Baja';

export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completada';

export type UserRole =
  | 'Administrador'
  | 'Supervisor Comercial'
  | 'Ejecutivo Comercial'
  | 'Asesor Comercial'
  | 'Consulta';

export interface User {
  id: string;
  name: string;
  apellido?: string;
  email: string;
  username?: string;
  role: UserRole;
  avatar: string;
  phone: string;
  activeLeadsCount: number;
  conversionRate: number; // percentage e.g. 24
  active?: boolean;
  empresa?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  leadName: string;
  type: ActivityType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  userId: string;
  userName: string;
  result: ActivityResult;
  notes: string;
  nextAction?: string;
  nextFollowUpDate?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  assignedTo: string; // User ID
  assignedToName: string;
  stage: LeadStage;
  createdAt: string; // YYYY-MM-DD
  nextFollowUpDate?: string; // YYYY-MM-DD HH:mm
  estimatedValue: number; // in USD or RD$
  tags: string[];
  notes?: string;
  lossReason?: string;
  attachments?: Attachment[];
  cargo?: string;
  whatsapp?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  naturaleza_negocio?: string;
  producto_interes?: string;
  modulo_interes?: string;
  contacto_principal?: string;
  ultima_interaccion?: string;
  contactoId?: number;
}

export interface Task {
  id: string;
  title: string;
  leadId?: string;
  leadName?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  assignedToName: string;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: ActivityType;
  leadId?: string;
  leadName?: string;
  assignedTo: string;
  assignedToName: string;
  completed: boolean;
}

export type ActiveSection =
  | 'dashboard'
  | 'empresas'
  | 'contactos'
  | 'prospectos'
  | 'pipeline'
  | 'seguimientos'
  | 'calendario'
  | 'tareas'
  | 'alertas'
  | 'objetivos'
  | 'papelera'
  | 'actividad'
  | 'reportes'
  | 'importar-exportar'
  | 'importaciones'
  | 'exportaciones'
  | 'usuarios'
  | 'auditoria'
  | 'configuracion'
  | 'documentacion';
