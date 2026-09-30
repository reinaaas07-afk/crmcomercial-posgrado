/**
 * Modelo de Datos Relacional para MySQL / SQLAlchemy ORM
 * Sistema: CRMComercial (Proyecto de Posgrado)
 * Administradora / Tesista: Ing. Yenifer Sena
 */

export type RolUsuario =
  | 'Administrador General'
  | 'Administrador'
  | 'Supervisor Comercial'
  | 'Ejecutivo Comercial'
  | 'Analista Comercial'
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
  'Ventas',
  'Caja',
  'Contabilidad',
  'Cuentas por Cobrar',
  'Cuentas por Pagar',
  'Reportes Gerenciales',
] as const;

export type EtiquetaSugerida = (typeof CATALOGO_ETIQUETAS)[number];

export interface EtiquetaConfigDB {
  id: number;
  nombre: string;
  color: string;
  categoria: string;
  descripcion?: string;
  activa: boolean;
}

export interface CampoPersonalizadoDB {
  id: number;
  modulo: 'Contactos' | 'Prospectos' | 'Ambos';
  nombre_campo: string;
  etiqueta: string;
  tipo: 'Texto' | 'Número' | 'Fecha' | 'Selección' | 'Moneda';
  opciones?: string[];
  requerido: boolean;
  activo: boolean;
}

export interface SubcuentaDB {
  id: number;
  nombre: string;
  empresa_matriz: string; // 'ITHOT'
  codigo: string;
  responsable: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  usuarios_count: number;
  fecha_creacion: string;
  activa: boolean;
}

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
  | 'WhatsApp Inbound'
  | 'Importación Excel'
  | 'Llamada en Frío'
  | 'Prospección Directa'
  | 'Otro';

// Tabla: usuarios
export interface UsuarioDB {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  usuario: string;
  password_hash: string;
  password_plain?: string; // Visible para demostración y restablecimiento
  rol: RolUsuario;
  telefono: string;
  activo: boolean;
  online?: boolean; // Estado en línea / desconectado
  fecha_creacion: string; // YYYY-MM-DD HH:mm:ss
  ultimo_acceso?: string;
  ultimo_cierre?: string;
  empresa: string; // 'ITHOT'
  subcuenta?: string; // Ej: 'ITHOT Principal - Santo Domingo'
  permisos_personalizados?: string[];
}

// Tabla: empresas (Módulo Empresas Comerciales)
export interface EmpresaDB {
  id: number;
  razon_social: string;
  nombre_comercial?: string;
  rnc: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia?: string;
  sector: string;
  sitio_web: string;
  industria: string;
  cantidad_empleados: number;
  usuario_id: number; // Foreign Key -> usuarios.id (Responsable comercial)
  etiquetas: string; // Comma-separated
  notas: string;
  fecha_registro: string;
  estado: 'Activa' | 'Prospecto' | 'Inactiva' | 'Lead';
}

// Tabla: comentarios (Notas y Trazabilidad por Entidad)
export interface ComentarioDB {
  id: number;
  entidad_tipo: 'empresa' | 'contacto' | 'prospecto' | 'oportunidad';
  entidad_id: number;
  usuario_nombre: string;
  usuario_id: number;
  texto: string;
  fecha_hora: string;
}

// Tabla: adjuntos (Documentos adjuntos por Entidad)
export interface AdjuntoDB {
  id: number;
  entidad_tipo: 'empresa' | 'contacto' | 'prospecto' | 'oportunidad';
  entidad_id: number;
  nombre_archivo: string;
  tipo_archivo: 'PDF' | 'Excel' | 'Word' | 'Imagen' | 'Otro';
  tamano_kb: number;
  usuario_nombre: string;
  fecha_subida: string;
  url_data?: string;
}

// Tabla: objetivos (Metas Comerciales Mensuales)
export interface ObjetivoComercialDB {
  id: number;
  titulo: string;
  tipo: 'Prospectos' | 'Ventas' | 'Llamadas' | 'Cierres';
  meta_cantidad: number;
  unidad: string; // 'prospectos', 'RD$', 'llamadas'
  periodo: string; // Ej: 'Septiembre 2026'
  usuario_id: number | null; // null = Meta Global Empresa
  responsable: string;
  avance_actual: number;
  fecha_limite: string;
}

// Tabla: papelera (Soft delete para restauración segura)
export interface RegistroPapeleraDB {
  id: number;
  entidad_tipo: 'Empresa' | 'Contacto' | 'Prospecto' | 'Tarea' | 'Seguimiento';
  entidad_id: number;
  titulo: string;
  detalles: string;
  datos_json: string;
  usuario_elimino: string;
  fecha_eliminacion: string;
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
  tipo: 'Prospectos' | 'Oportunidades' | 'Contactos' | 'Seguimientos' | 'Empresas';
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
  tipo: 'Contactos' | 'Prospectos' | 'Pipeline' | 'Seguimientos' | 'Reportes';
  formato: 'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)';
  cantidad_registros: number;
}

// Módulo de Auditoría del Sistema: auditoria_sistema
export type TipoAccionAuditoria =
  | 'Creación'
  | 'Actualización'
  | 'Modificación'
  | 'Edición'
  | 'Eliminación'
  | 'Cambio de Etapa'
  | 'Reasignación'
  | 'Importación'
  | 'Exportación'
  | 'Restablecimiento de Contraseña'
  | 'Activación / Desactivación'
  | 'Inicio de Sesión'
  | 'Cierre de Sesión';

export type ModuloAfectado =
  | 'Empresas'
  | 'Prospectos'
  | 'Contactos'
  | 'Pipeline'
  | 'Seguimientos'
  | 'Tareas'
  | 'Calendario'
  | 'Importaciones'
  | 'Exportaciones'
  | 'Usuarios y Roles'
  | 'Configuración'
  | 'Seguridad';

export interface RegistroAuditoriaDB {
  id: number;
  usuario: string; // Nombre del usuario responsable
  usuario_id?: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm:ss
  accion: TipoAccionAuditoria;
  modulo: ModuloAfectado;
  registro_afectado: string; // Ej: 'Auto Repuestos Central', 'Contacto Fausto Henríquez'
  detalles: string; // Descripción detallada de lo que cambió
  ip_simulada?: string;
}

// Centro de Notificaciones en Tiempo Real
export type TipoNotificacion =
  | 'nuevo_prospecto'
  | 'prospecto_actualizado'
  | 'prospecto_asignado'
  | 'nuevo_seguimiento'
  | 'nueva_importacion'
  | 'nuevo_usuario'
  | 'oportunidad_movida'
  | 'tarea_completada'
  | 'seguridad';

export interface NotificacionDB {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  usuario_origen: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  leida: boolean;
  modulo_destino?: SeccionApp;
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
  | 'empresas'
  | 'contactos'
  | 'prospectos'
  | 'pipeline'
  | 'seguimientos'
  | 'tareas'
  | 'calendario'
  | 'alertas'
  | 'objetivos'
  | 'papelera'
  | 'actividad'
  | 'reportes'
  | 'importaciones'
  | 'exportaciones'
  | 'usuarios'
  | 'auditoria'
  | 'configuracion'
  | 'documentacion';
