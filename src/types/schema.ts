/**
 * Modelo de Datos Relacional para MySQL / SQLAlchemy ORM
 * Sistema: CRMComercial (Proyecto de Posgrado)
 * Administradora / Tesista: Ing. Yenifer Sena
 */

export type RolUsuario =
  | 'Administrador'
  | 'Supervisor Comercial'
  | 'Ejecutivo Comercial'
  | 'Asesor Comercial'
  | 'Consulta';

export const CATALOGO_ETIQUETAS = [
  'Cliente',
  'Prospecto',
  'Cliente Activo',
  'Cliente Inactivo',
  'ITHOT System',
  'POS Digital',
  'Facturación Electrónica',
  'CRM Comercial',
  'Inventario',
  'Compras',
  'Cuentas por Cobrar',
  'Contabilidad',
  'Reportes Gerenciales',
] as const;

export type EtiquetaSugerida = (typeof CATALOGO_ETIQUETAS)[number];

export type CanalSeguimiento =
  | 'Llamada'
  | 'WhatsApp'
  | 'Correo Electrónico'
  | 'Reunión Presencial'
  | 'Videoconferencia'
  | 'Nota Interna';

export type ResultadoSeguimiento =
  | 'Exitoso / Contactado'
  | 'Interesado'
  | 'Sin Respuesta'
  | 'Buzón de Voz / Ocupado'
  | 'Reagendado'
  | 'No Interesado';

export type PrioridadTarea = 'Alta' | 'Media' | 'Baja';

export type EstadoTarea = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';

export type FuenteProspecto =
  | 'Sitio Web'
  | 'Meta Ads'
  | 'Google Ads'
  | 'LinkedIn'
  | 'Referido'
  | 'Evento / Feria'
  | 'WhatsApp Inbound';

// Tabla: usuarios
export interface UsuarioDB {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  usuario?: string;
  password_hash: string;
  rol: RolUsuario;
  telefono: string;
  activo: boolean;
  fecha_creacion: string; // YYYY-MM-DD HH:mm:ss
  empresa?: string;
}

// Tabla: contactos (Módulo Independiente de Empresas y Personas)
export interface ContactoDB {
  id: number;
  nombre: string;
  apellido: string;
  empresa: string;
  cargo: string;
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  naturaleza_negocio: string;
  usuario_id: number; // Foreign Key -> usuarios.id (Responsable comercial)
  fecha_registro: string; // YYYY-MM-DD HH:mm:ss
  ultima_interaccion: string | null;
  proximo_seguimiento: string | null;
  estado_comercial: string; // 'Cliente' | 'Prospecto' | 'Cliente Activo' | 'Cliente Inactivo' | 'En Negociación'
  observaciones: string;
  etiquetas: string; // Comma-separated
  producto_interes?: string; // ITHOT System, POS Digital, Facturación Electrónica, CRM Comercial
  modulo_interes?: string; // Inventario, Compras, Cuentas por Cobrar, Contabilidad, Reportes Gerenciales
}

// Tabla: etapas_pipeline
export interface EtapaPipelineDB {
  id: number;
  nombre: string;
  orden: number;
  color: string;
  descripcion: string;
  es_etapa_final: boolean;
  es_ganado: boolean;
}

// Tabla: prospectos / oportunidades
export interface ProspectoDB {
  id: number;
  nombre: string;
  apellido: string;
  empresa: string;
  cargo: string;
  email: string;
  telefono: string;
  whatsapp: string;
  fuente: FuenteProspecto;
  etapa_id: number; // Foreign Key -> etapas_pipeline.id
  usuario_id: number; // Foreign Key -> usuarios.id
  valor_estimado: number; // DECIMAL(12, 2)
  fecha_registro: string; // DATETIME
  fecha_proximo_seguimiento: string | null; // DATETIME
  notas: string;
  etiquetas: string; // Comma-separated
  contacto_id?: number | null; // Foreign Key -> contactos.id
  naturaleza_negocio?: string;
  producto_interes?: string;
  modulo_interes?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  ultima_interaccion?: string;
}

// Tabla: seguimientos
export interface SeguimientoDB {
  id: number;
  prospecto_id: number; // Foreign Key -> prospectos.id ON DELETE CASCADE
  usuario_id: number; // Foreign Key -> usuarios.id
  canal: CanalSeguimiento;
  resultado: ResultadoSeguimiento;
  fecha_hora: string; // DATETIME
  observaciones: string;
  proxima_accion: string | null;
  fecha_proxima_accion: string | null; // DATETIME
  creado_en: string; // DATETIME
}

// Tabla: actividades
export interface ActividadDB {
  id: number;
  prospecto_id: number | null; // Foreign Key -> prospectos.id
  usuario_id: number; // Foreign Key -> usuarios.id
  tipo: string;
  titulo: string;
  descripcion: string;
  fecha_programada: string; // DATETIME
  completada: boolean;
  fecha_completada: string | null;
}

// Tabla: tareas
export interface TareaDB {
  id: number;
  prospecto_id: number | null; // Foreign Key -> prospectos.id ON DELETE CASCADE
  usuario_id: number; // Foreign Key -> usuarios.id
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  fecha_limite: string; // DATE (YYYY-MM-DD)
  hora_limite: string | null; // TIME (HH:mm)
  fecha_creacion: string; // DATETIME
}

// Tabla de Auditoría: historial_importaciones
export interface HistorialImportacionDB {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  archivo: string;
  tipo: 'Prospectos' | 'Oportunidades' | 'Contactos' | 'Seguimientos';
  registros_procesados: number;
  registros_correctos: number;
  registros_con_error: number;
  estado: 'Exitoso' | 'Parcial' | 'Con Errores';
}

// Tabla de Auditoría: historial_exportaciones
export interface HistorialExportacionDB {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  archivo_generado: string;
  tipo: 'Prospectos' | 'Pipeline' | 'Seguimientos' | 'Reportes';
  formato: 'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)';
  cantidad_registros: number;
}

// Relational Joins for UI Views
export interface ProspectoConRelaciones extends ProspectoDB {
  etapa: EtapaPipelineDB;
  usuario_asignado: UsuarioDB;
  seguimientos_count: number;
  tareas_pendientes_count: number;
}

export interface SeguimientoConRelaciones extends SeguimientoDB {
  prospecto: ProspectoDB;
  usuario: UsuarioDB;
}

export interface TareaConRelaciones extends TareaDB {
  prospecto?: ProspectoDB;
  usuario: UsuarioDB;
}

export type SeccionApp =
  | 'dashboard'
  | 'contactos'
  | 'prospectos'
  | 'pipeline'
  | 'seguimientos'
  | 'tareas'
  | 'calendario'
  | 'reportes'
  | 'importaciones'
  | 'exportaciones'
  | 'usuarios'
  | 'configuracion'
  | 'documentacion';
