/**
 * Documentación de Ingeniería de Software para Trabajo de Posgrado
 * Proyecto: CRMComercial - Sistema para Gestión y Seguimiento de Prospectos
 */

export interface CodigoArchivo {
  path: string;
  nombre: string;
  lenguaje: string;
  descripcion: string;
  contenido: string;
}

export interface CasoDeUso {
  codigo: string;
  nombre: string;
  actorPrincipal: string;
  actoresSecundarios?: string[];
  modulo: string;
  descripcion: string;
  precondicion: string;
  flujoPrincipal: string[];
  flujosAlternos: string[];
  reglasNegocio: string[];
}

export interface EntidadERD {
  tabla: string;
  descripcion: string;
  columnas: {
    nombre: string;
    tipo: string;
    esPK?: boolean;
    esFK?: boolean;
    fkTabla?: string;
    notNull?: boolean;
    descripcion: string;
  }[];
}

// 1. DDL SQL Completo para MySQL 8.0+
export const MYSQL_DDL_SCHEMA = `-- ==============================================================================
-- TRABAJO DE POSGRADO: DISEÑO E IMPLEMENTACIÓN DE UN SISTEMA CRM
-- PROYECTO: CRMComercial
-- MOTOR DE BASE DE DATOS: MySQL 8.0+ (Motor de Almacenamiento: InnoDB)
-- JUEGO DE CARACTERES: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`crmcomercial_db\`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`crmcomercial_db\`;

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`tareas\`;
DROP TABLE IF EXISTS \`actividades\`;
DROP TABLE IF EXISTS \`seguimientos\`;
DROP TABLE IF EXISTS \`prospectos\`;
DROP TABLE IF EXISTS \`etapas_pipeline\`;
DROP TABLE IF EXISTS \`usuarios\`;

CREATE TABLE \`usuarios\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(120) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`rol\` ENUM('Administrador', 'Supervisor Comercial', 'Asesor Comercial') NOT NULL DEFAULT 'Asesor Comercial',
  \`telefono\` VARCHAR(25) NULL,
  \`activo\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`fecha_creacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_usuarios_rol\` (\`rol\`),
  INDEX \`idx_usuarios_activo\` (\`activo\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLA: etapas_pipeline
-- ------------------------------------------------------------------------------
CREATE TABLE \`etapas_pipeline\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(60) NOT NULL,
  \`orden\` INT NOT NULL UNIQUE,
  \`color\` VARCHAR(20) NOT NULL DEFAULT '#0d6efd',
  \`descripcion\` VARCHAR(255) NULL,
  \`es_etapa_final\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`es_ganado\` BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX \`idx_etapas_orden\` (\`orden\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLA: prospectos
-- ------------------------------------------------------------------------------
CREATE TABLE \`prospectos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(120) NOT NULL,
  \`empresa\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(150) NULL,
  \`telefono\` VARCHAR(30) NULL,
  \`fuente\` VARCHAR(60) NOT NULL DEFAULT 'Sitio Web',
  \`etapa_id\` INT NOT NULL,
  \`usuario_id\` INT NOT NULL,
  \`valor_estimado\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`fecha_registro\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`fecha_proximo_seguimiento\` DATETIME NULL,
  \`notas\` TEXT NULL,
  \`etiquetas\` VARCHAR(255) NULL,
  CONSTRAINT \`fk_prospectos_etapa\`
    FOREIGN KEY (\`etapa_id\`) REFERENCES \`etapas_pipeline\` (\`id\`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT \`fk_prospectos_usuario\`
    FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX \`idx_prospectos_etapa\` (\`etapa_id\`),
  INDEX \`idx_prospectos_usuario\` (\`usuario_id\`),
  INDEX \`idx_prospectos_fecha_prox\` (\`fecha_proximo_seguimiento\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: seguimientos
-- ------------------------------------------------------------------------------
CREATE TABLE \`seguimientos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`prospecto_id\` INT NOT NULL,
  \`usuario_id\` INT NOT NULL,
  \`canal\` ENUM(
    'Llamada',
    'WhatsApp',
    'Correo Electrónico',
    'Reunión Presencial',
    'Videoconferencia',
    'Nota Interna'
  ) NOT NULL,
  \`resultado\` ENUM(
    'Exitoso / Contactado',
    'Interesado',
    'Sin Respuesta',
    'Buzón de Voz / Ocupado',
    'Reagendado',
    'No Interesado'
  ) NOT NULL,
  \`fecha_hora\` DATETIME NOT NULL,
  \`observaciones\` TEXT NOT NULL,
  \`proxima_accion\` VARCHAR(255) NULL,
  \`fecha_proxima_accion\` DATETIME NULL,
  \`creado_en\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_seguimientos_prospecto\`
    FOREIGN KEY (\`prospecto_id\`) REFERENCES \`prospectos\` (\`id\`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT \`fk_seguimientos_usuario\`
    FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX \`idx_seguimientos_prospecto\` (\`prospecto_id\`),
  INDEX \`idx_seguimientos_usuario\` (\`usuario_id\`),
  INDEX \`idx_seguimientos_fecha\` (\`fecha_hora\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: tareas
-- ------------------------------------------------------------------------------
CREATE TABLE \`tareas\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`prospecto_id\` INT NULL,
  \`usuario_id\` INT NOT NULL,
  \`titulo\` VARCHAR(200) NOT NULL,
  \`descripcion\` TEXT NULL,
  \`prioridad\` ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  \`estado\` ENUM('Pendiente', 'En Progreso', 'Completada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
  \`fecha_limite\` DATE NOT NULL,
  \`hora_limite\` TIME NULL,
  \`fecha_creacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_tareas_prospecto\`
    FOREIGN KEY (\`prospecto_id\`) REFERENCES \`prospectos\` (\`id\`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT \`fk_tareas_usuario\`
    FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX \`idx_tareas_estado\` (\`estado\`),
  INDEX \`idx_tareas_usuario\` (\`usuario_id\`),
  INDEX \`idx_tareas_fecha\` (\`fecha_limite\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLA: actividades
-- ------------------------------------------------------------------------------
CREATE TABLE \`actividades\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`prospecto_id\` INT NULL,
  \`usuario_id\` INT NOT NULL,
  \`tipo\` VARCHAR(50) NOT NULL,
  \`titulo\` VARCHAR(200) NOT NULL,
  \`descripcion\` TEXT NULL,
  \`fecha_programada\` DATETIME NOT NULL,
  \`completada\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`fecha_completada\` DATETIME NULL,
  CONSTRAINT \`fk_actividades_prospecto\`
    FOREIGN KEY (\`prospecto_id\`) REFERENCES \`prospectos\` (\`id\`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT \`fk_actividades_usuario\`
    FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX \`idx_actividades_fecha\` (\`fecha_programada\`),
  INDEX \`idx_actividades_usuario\` (\`usuario_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DATOS INICIALES (SEED DATA) PARA VALIDACIÓN METODOLÓGICA
-- ==============================================================================

INSERT INTO \`usuarios\` (\`id\`, \`nombre\`, \`email\`, \`password_hash\`, \`rol\`, \`telefono\`) VALUES
(1, 'Ing. Yenifer Sena', 'yenifer.sena@universidad.edu.mx', '$2b$12$samplehash', 'Administrador', '+52 55 1234 5678'),
(2, 'Lic. Valeria Rojas', 'valeria.rojas@crmcomercial.com', '$2b$12$samplehash', 'Supervisor Comercial', '+52 55 8765 4321'),
(3, 'Mateo Silva', 'mateo.silva@crmcomercial.com', '$2b$12$samplehash', 'Asesor Comercial', '+52 55 9876 5432'),
(4, 'Camila Herrera', 'camila.herrera@crmcomercial.com', '$2b$12$samplehash', 'Asesor Comercial', '+52 55 4567 8901');

INSERT INTO \`etapas_pipeline\` (\`id\`, \`nombre\`, \`orden\`, \`color\`, \`descripcion\`, \`es_etapa_final\`, \`es_ganado\`) VALUES
(1, 'Nuevo Lead', 1, '#0d6efd', 'Prospecto captado recientemente.', FALSE, FALSE),
(2, 'Contactado', 2, '#0dcaf0', 'Primer contacto realizado con respuesta.', FALSE, FALSE),
(3, 'Interesado', 3, '#6610f2', 'Interés validado y cliente calificado.', FALSE, FALSE),
(4, 'Reunión Agendada', 4, '#fd7e14', 'Demostración confirmada.', FALSE, FALSE),
(5, 'Propuesta Enviada', 5, '#ffc107', 'Cotización formal entregada.', FALSE, FALSE),
(6, 'Negociación', 6, '#20c997', 'Ajuste final de términos de pago.', FALSE, FALSE),
(7, 'Ganado', 7, '#198754', 'Venta y contrato formalizado.', TRUE, TRUE),
(8, 'Perdido', 8, '#dc3545', 'Oportunidad declinada o postergada.', TRUE, FALSE);
`;

// 2. Entidades para Diagrama ERD Visual
export const ENTIDADES_ERD: EntidadERD[] = [
  {
    tabla: 'usuarios',
    descripcion: 'Almacena credenciales, roles y datos del personal comercial y administrativo.',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'Identificador único autoincremental' },
      { nombre: 'nombre', tipo: 'VARCHAR(120)', notNull: true, descripcion: 'Nombre completo del colaborador' },
      { nombre: 'email', tipo: 'VARCHAR(150)', notNull: true, descripcion: 'Correo institucional (login único)' },
      { nombre: 'password_hash', tipo: 'VARCHAR(255)', notNull: true, descripcion: 'Hash seguro de contraseña (Bcrypt)' },
      { nombre: 'rol', tipo: 'ENUM', notNull: true, descripcion: 'Administrador / Supervisor / Asesor' },
      { nombre: 'telefono', tipo: 'VARCHAR(25)', descripcion: 'Teléfono de contacto' },
      { nombre: 'activo', tipo: 'BOOLEAN', notNull: true, descripcion: 'Estado de acceso al sistema' },
      { nombre: 'fecha_creacion', tipo: 'DATETIME', notNull: true, descripcion: 'Fecha de alta en base de datos' },
    ],
  },
  {
    tabla: 'contactos',
    descripcion: 'Directorio independiente de contactos comerciales, empresas y personas dominicanas (ITHOT).',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'Identificador único del contacto' },
      { nombre: 'nombre', tipo: 'VARCHAR(100)', notNull: true, descripcion: 'Nombre del decisor o persona' },
      { nombre: 'apellido', tipo: 'VARCHAR(100)', descripcion: 'Apellido de la persona' },
      { nombre: 'empresa', tipo: 'VARCHAR(150)', notNull: true, descripcion: 'Razón social de la empresa' },
      { nombre: 'cargo', tipo: 'VARCHAR(100)', descripcion: 'Cargo o posición comercial' },
      { nombre: 'telefono', tipo: 'VARCHAR(30)', descripcion: 'Teléfono con formato RD (+1 809/829/849)' },
      { nombre: 'whatsapp', tipo: 'VARCHAR(30)', descripcion: 'WhatsApp directo dominicano' },
      { nombre: 'email', tipo: 'VARCHAR(150)', descripcion: 'Correo corporativo' },
      { nombre: 'direccion', tipo: 'VARCHAR(255)', descripcion: 'Dirección física de la empresa' },
      { nombre: 'ciudad', tipo: 'VARCHAR(80)', notNull: true, descripcion: 'Ciudad en República Dominicana' },
      { nombre: 'provincia', tipo: 'VARCHAR(80)', notNull: true, descripcion: 'Provincia dominicana' },
      { nombre: 'naturaleza_negocio', tipo: 'VARCHAR(120)', descripcion: 'Giro o sector económico' },
      { nombre: 'usuario_id', tipo: 'INT', esFK: true, fkTabla: 'usuarios.id', notNull: true, descripcion: 'Responsable comercial ITHOT' },
      { nombre: 'fecha_registro', tipo: 'DATETIME', notNull: true, descripcion: 'Fecha de ingreso al CRM' },
      { nombre: 'ultima_interaccion', tipo: 'DATETIME', descripcion: 'Fecha del último contacto' },
      { nombre: 'proximo_seguimiento', tipo: 'DATETIME', descripcion: 'Fecha agendada para siguiente seguimiento' },
      { nombre: 'estado_comercial', tipo: 'VARCHAR(50)', notNull: true, descripcion: 'Cliente Activo, Prospecto, Inactivo' },
      { nombre: 'observaciones', tipo: 'TEXT', descripcion: 'Notas comerciales' },
      { nombre: 'etiquetas', tipo: 'VARCHAR(255)', descripcion: 'Clasificación por etiquetas del catálogo' },
      { nombre: 'producto_interes', tipo: 'VARCHAR(100)', descripcion: 'Solución ITHOT (POS, e-CF, ERP)' },
      { nombre: 'modulo_interes', tipo: 'VARCHAR(100)', descripcion: 'Módulo de interés' },
    ],
  },
  {
    tabla: 'etapas_pipeline',
    descripcion: 'Catálogo ordenado de las 8 fases del ciclo de conversión comercial.',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'Identificador de la etapa' },
      { nombre: 'nombre', tipo: 'VARCHAR(60)', notNull: true, descripcion: 'Nombre de la fase (ej. Nuevo Lead, Negociación)' },
      { nombre: 'orden', tipo: 'INT', notNull: true, descripcion: 'Posición secuencial en el embudo (1 a 8)' },
      { nombre: 'color', tipo: 'VARCHAR(20)', notNull: true, descripcion: 'Código hexadecimal para vista Kanban' },
      { nombre: 'descripcion', tipo: 'VARCHAR(255)', descripcion: 'Criterio de permanencia en la etapa' },
      { nombre: 'es_etapa_final', tipo: 'BOOLEAN', notNull: true, descripcion: 'Determina si concluye el ciclo' },
      { nombre: 'es_ganado', tipo: 'BOOLEAN', notNull: true, descripcion: 'Indica conversión exitosa' },
    ],
  },
  {
    tabla: 'prospectos',
    descripcion: 'Entidad central. Clientes potenciales, valor económico y asesor responsable.',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'Identificador de prospecto' },
      { nombre: 'nombre', tipo: 'VARCHAR(120)', notNull: true, descripcion: 'Nombre del contacto comercial' },
      { nombre: 'empresa', tipo: 'VARCHAR(150)', notNull: true, descripcion: 'Razón social o empresa cliente' },
      { nombre: 'email', tipo: 'VARCHAR(150)', descripcion: 'Correo electrónico corporativo' },
      { nombre: 'telefono', tipo: 'VARCHAR(30)', descripcion: 'Teléfono directo o WhatsApp' },
      { nombre: 'fuente', tipo: 'VARCHAR(60)', notNull: true, descripcion: 'Canal de captación (Web, Ads, LinkedIn)' },
      { nombre: 'etapa_id', tipo: 'INT', esFK: true, fkTabla: 'etapas_pipeline.id', notNull: true, descripcion: 'Fase actual en el pipeline' },
      { nombre: 'usuario_id', tipo: 'INT', esFK: true, fkTabla: 'usuarios.id', notNull: true, descripcion: 'Asesor comercial responsable' },
      { nombre: 'valor_estimado', tipo: 'DECIMAL(12,2)', notNull: true, descripcion: 'Monto estimado de la oportunidad (USD)' },
      { nombre: 'fecha_registro', tipo: 'DATETIME', notNull: true, descripcion: 'Timestamp de captación' },
      { nombre: 'fecha_proximo_seguimiento', tipo: 'DATETIME', descripcion: 'Compromiso agendado de contacto' },
      { nombre: 'notas', tipo: 'TEXT', descripcion: 'Observaciones comerciales generales' },
      { nombre: 'etiquetas', tipo: 'VARCHAR(255)', descripcion: 'Etiquetas para segmentación' },
    ],
  },
  {
    tabla: 'seguimientos',
    descripcion: 'Bitácora inmutable de interacciones (llamadas, WhatsApp, correos, reuniones).',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'ID del registro de seguimiento' },
      { nombre: 'prospecto_id', tipo: 'INT', esFK: true, fkTabla: 'prospectos.id', notNull: true, descripcion: 'Prospecto contactado (CASCADE)' },
      { nombre: 'usuario_id', tipo: 'INT', esFK: true, fkTabla: 'usuarios.id', notNull: true, descripcion: 'Asesor que ejecutó el contacto' },
      { nombre: 'canal', tipo: 'ENUM', notNull: true, descripcion: 'Llamada, WhatsApp, Correo, Reunión, Nota' },
      { nombre: 'resultado', tipo: 'ENUM', notNull: true, descripcion: 'Exitoso, Interesado, Sin respuesta, etc.' },
      { nombre: 'fecha_hora', tipo: 'DATETIME', notNull: true, descripcion: 'Momento exacto de la interacción' },
      { nombre: 'observaciones', tipo: 'TEXT', notNull: true, descripcion: 'Resumen detallado de la conversación' },
      { nombre: 'proxima_accion', tipo: 'VARCHAR(255)', descripcion: 'Compromiso acordado' },
      { nombre: 'fecha_proxima_accion', tipo: 'DATETIME', descripcion: 'Fecha de la siguiente acción' },
      { nombre: 'creado_en', tipo: 'DATETIME', notNull: true, descripcion: 'Auditoría de inserción' },
    ],
  },
  {
    tabla: 'tareas',
    descripcion: 'Acciones operativas pendientes con fecha límite y nivel de prioridad.',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'Identificador único de la tarea' },
      { nombre: 'prospecto_id', tipo: 'INT', esFK: true, fkTabla: 'prospectos.id', descripcion: 'Prospecto relacionado (opcional)' },
      { nombre: 'usuario_id', tipo: 'INT', esFK: true, fkTabla: 'usuarios.id', notNull: true, descripcion: 'Asignatario responsable' },
      { nombre: 'titulo', tipo: 'VARCHAR(200)', notNull: true, descripcion: 'Descripción breve de la tarea' },
      { nombre: 'descripcion', tipo: 'TEXT', descripcion: 'Instrucciones adicionales' },
      { nombre: 'prioridad', tipo: 'ENUM', notNull: true, descripcion: 'Alta, Media o Baja' },
      { nombre: 'estado', tipo: 'ENUM', notNull: true, descripcion: 'Pendiente, En Progreso, Completada' },
      { nombre: 'fecha_limite', tipo: 'DATE', notNull: true, descripcion: 'Fecha tope de cumplimiento' },
      { nombre: 'hora_limite', tipo: 'TIME', descripcion: 'Hora tope' },
      { nombre: 'fecha_creacion', tipo: 'DATETIME', notNull: true, descripcion: 'Fecha de registro' },
    ],
  },
  {
    tabla: 'actividades',
    descripcion: 'Eventos del calendario comercial: llamadas agendadas y videoconferencias.',
    columnas: [
      { nombre: 'id', tipo: 'INT', esPK: true, notNull: true, descripcion: 'ID del evento' },
      { nombre: 'prospecto_id', tipo: 'INT', esFK: true, fkTabla: 'prospectos.id', descripcion: 'Prospecto citado' },
      { nombre: 'usuario_id', tipo: 'INT', esFK: true, fkTabla: 'usuarios.id', notNull: true, descripcion: 'Organizador' },
      { nombre: 'tipo', tipo: 'VARCHAR(50)', notNull: true, descripcion: 'Llamada, Demostración, Reunión' },
      { nombre: 'titulo', tipo: 'VARCHAR(200)', notNull: true, descripcion: 'Título del evento' },
      { nombre: 'fecha_programada', tipo: 'DATETIME', notNull: true, descripcion: 'Horario agendado' },
      { nombre: 'completada', tipo: 'BOOLEAN', notNull: true, descripcion: 'Estatus de realización' },
    ],
  },
];

// 3. Casos de Uso del Sistema
export const CASOS_DE_USO: CasoDeUso[] = [
  {
    codigo: 'CU-01',
    nombre: 'Registrar Nuevo Prospecto',
    actorPrincipal: 'Asesor Comercial',
    actoresSecundarios: ['Supervisor Comercial', 'Administrador'],
    modulo: 'Gestión de Prospectos',
    descripcion: 'Permite registrar un nuevo contacto comercial con sus datos de empresa, fuente, valor estimado y asesor asignado.',
    precondicion: 'El usuario debe estar autenticado en el sistema.',
    flujoPrincipal: [
      '1. El asesor presiona el botón "Nuevo Prospecto".',
      '2. El sistema despliega el formulario modal de captura.',
      '3. El asesor ingresa nombre, empresa, email, teléfono, fuente, etapa y valor estimado.',
      '4. El sistema valida formato de correo electrónico y campos obligatorios.',
      '5. El sistema inserta el registro en la tabla `prospectos` con timestamp actual.',
      '6. El sistema actualiza la vista de tabla y el contador de etapa en el pipeline.',
    ],
    flujosAlternos: [
      '4a. Si falta algún campo obligatorio, el sistema muestra mensajes de validación en rojo y no guarda.',
      '5a. Si el usuario no tiene permisos para asignar a terceros, el sistema autoasigna su propio ID de usuario.',
    ],
    reglasNegocio: [
      'RN-01: El valor estimado debe ser un número decimal positivo o cero.',
      'RN-02: La etapa inicial por defecto es "Nuevo Lead" a menos que se especifique otra.',
    ],
  },
  {
    codigo: 'CU-02',
    nombre: 'Mover Prospecto en Tablero Kanban',
    actorPrincipal: 'Asesor Comercial',
    actoresSecundarios: ['Supervisor Comercial'],
    modulo: 'Pipeline Comercial',
    descripcion: 'Permite arrastrar una tarjeta de prospecto entre las 8 etapas para reflejar el avance en el ciclo de ventas.',
    precondicion: 'El prospecto existe en la base de datos.',
    flujoPrincipal: [
      '1. El usuario visualiza las 8 columnas del Kanban cargadas desde `etapas_pipeline`.',
      '2. El usuario arrastra una tarjeta desde una columna origen a una columna destino.',
      '3. El sistema ejecuta una petición PUT /api/prospectos/{id}/etapa con el nuevo `etapa_id`.',
      '4. La base de datos actualiza el campo `etapa_id` del prospecto.',
      '5. El sistema registra automáticamente una entrada de auditoría en la tabla `seguimientos`.',
      '6. Se recalculan los totales monetarios de cada columna.',
    ],
    flujosAlternos: [
      '3a. Si la etapa destino es "Perdido", el sistema solicita registrar el motivo de pérdida.',
      '3b. Si falla la conexión de red, la tarjeta regresa a su columna original y muestra alerta.',
    ],
    reglasNegocio: [
      'RN-03: Solo el Administrador y Supervisor pueden reabrir prospectos que están en etapa "Ganado".',
    ],
  },
  {
    codigo: 'CU-03',
    nombre: 'Registrar Bitácora de Seguimiento',
    actorPrincipal: 'Asesor Comercial',
    modulo: 'Seguimientos',
    descripcion: 'Documenta los resultados de llamadas, WhatsApp, reuniones o notas sobre un prospecto.',
    precondicion: 'El prospecto debe estar registrado previamente.',
    flujoPrincipal: [
      '1. El asesor accede a la ficha del prospecto o al módulo de Seguimientos.',
      '2. Presiona "Registrar Actividad / Contacto".',
      '3. Selecciona el canal (Llamada, WhatsApp, Correo, Reunión, Nota) y el resultado.',
      '4. Escribe las observaciones de la conversación y define la próxima acción acordada.',
      '5. Selecciona la fecha y hora para el próximo contacto.',
      '6. El sistema guarda el seguimiento en `seguimientos` y actualiza `fecha_proximo_seguimiento` en `prospectos`.',
    ],
    flujosAlternos: [
      '5a. Si el resultado es "Sin respuesta", el sistema sugiere programar reintento a las 24 horas.',
    ],
    reglasNegocio: [
      'RN-04: Los registros de seguimiento son inmutables por trazabilidad histórica.',
    ],
  },
  {
    codigo: 'CU-04',
    nombre: 'Supervisar Métricas y Conversión del Equipo',
    actorPrincipal: 'Supervisor Comercial',
    actoresSecundarios: ['Administrador'],
    modulo: 'Reportes y Analítica',
    descripcion: 'Permite analizar las tasas de conversión global, efectividad por asesor y motivos de descarte.',
    precondicion: 'Usuario con rol "Supervisor Comercial" o "Administrador".',
    flujoPrincipal: [
      '1. El supervisor ingresa a la pestaña "Reportes".',
      '2. El sistema consulta las tablas `prospectos`, `etapas_pipeline` y `seguimientos`.',
      '3. Se computan las tasas de conversión: (Ganados / Totales) * 100.',
      '4. Se grafica la distribución por canal de adquisición (fuente).',
      '5. Se genera la tabla comparativa de asesores con leads asignados y cerrados.',
    ],
    flujosAlternos: [],
    reglasNegocio: [
      'RN-05: El Asesor Comercial solo puede ver sus propias métricas individuales.',
    ],
  },
];

// 4. Archivos de Código Python / Flask / SQLAlchemy Reales
export const ARCHIVOS_PROYECTO_BACKEND: CodigoArchivo[] = [
  {
    path: 'app.py',
    nombre: 'app.py',
    lenguaje: 'python',
    descripcion: 'Punto de entrada de la aplicación Flask. Inicializa extensiones, CORS y registra los Blueprints.',
    contenido: `"""
CRMComercial - Sistema de Gestión y Seguimiento de Prospectos
Proyecto de Posgrado en Ingeniería de Software
Punto de Entrada del Servidor Flask
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.auth_bp import auth_bp
from routes.prospectos_bp import prospectos_bp
from routes.pipeline_bp import pipeline_bp
from routes.seguimientos_bp import seguimientos_bp
from routes.tareas_bp import tareas_bp
from routes.reportes_bp import reportes_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicialización de extensiones
    CORS(app)
    db.init_app(app)

    # Registro de Blueprints de la API REST
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(prospectos_bp, url_prefix='/api/prospectos')
    app.register_blueprint(pipeline_bp, url_prefix='/api/pipeline')
    app.register_blueprint(seguimientos_bp, url_prefix='/api/seguimientos')
    app.register_blueprint(tareas_bp, url_prefix='/api/tareas')
    app.register_blueprint(reportes_bp, url_prefix='/api/reportes')

    @app.route('/api/health')
    def health_check():
        return jsonify({
            "status": "online",
            "version": "1.0.0",
            "db_engine": "MySQL 8.0 via SQLAlchemy",
            "project": "CRMComercial - Proyecto de Posgrado"
        })

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Crea tablas si no existen según los modelos SQLAlchemy
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
`,
  },
  {
    path: 'config.py',
    nombre: 'config.py',
    lenguaje: 'python',
    descripcion: 'Configuración de base de datos MySQL, parámetros de conexión y llaves criptográficas.',
    contenido: `import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'clave-secreta-posgrado-crmcomercial-2026'
    
    # Parámetros de conexión a MySQL
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'mysql_password')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME', 'crmcomercial_db')

    # Cadena de conexión SQLAlchemy para MySQL (driver pymysql)
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
`,
  },
  {
    path: 'models/prospecto.py',
    nombre: 'prospecto.py',
    lenguaje: 'python',
    descripcion: 'Modelo SQLAlchemy para la tabla prospectos con relaciones foráneas a usuarios y etapas_pipeline.',
    contenido: `from datetime import datetime
from models import db

class Prospecto(db.Model):
    __tablename__ = 'prospectos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(120), nullable=False)
    empresa = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=True)
    telefono = db.Column(db.String(30), nullable=True)
    fuente = db.Column(db.String(60), nullable=False, default='Sitio Web')
    
    # Claves foráneas
    etapa_id = db.Column(db.Integer, db.ForeignKey('etapas_pipeline.id', onupdate='CASCADE', ondelete='RESTRICT'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', onupdate='CASCADE', ondelete='RESTRICT'), nullable=False)
    
    valor_estimado = db.Column(db.Numeric(12, 2), nullable=False, default=0.00)
    fecha_registro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fecha_proximo_seguimiento = db.Column(db.DateTime, nullable=True)
    notas = db.Column(db.Text, nullable=True)
    etiquetas = db.Column(db.String(255), nullable=True)

    # Relaciones ORM
    etapa = db.relationship('EtapaPipeline', backref=db.backref('prospectos', lazy='dynamic'))
    usuario = db.relationship('Usuario', backref=db.backref('prospectos_asignados', lazy='dynamic'))
    seguimientos = db.relationship('Seguimiento', backref='prospecto', cascade='all, delete-orphan', lazy='dynamic')
    tareas = db.relationship('Tarea', backref='prospecto', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'empresa': self.empresa,
            'email': self.email,
            'telefono': self.telefono,
            'fuente': self.fuente,
            'etapa_id': self.etapa_id,
            'etapa_nombre': self.etapa.nombre if self.etapa else None,
            'etapa_color': self.etapa.color if self.etapa else '#0d6efd',
            'usuario_id': self.usuario_id,
            'usuario_nombre': self.usuario.nombre if self.usuario else None,
            'valor_estimado': float(self.valor_estimado),
            'fecha_registro': self.fecha_registro.strftime('%Y-%m-%d %H:%M:%S'),
            'fecha_proximo_seguimiento': self.fecha_proximo_seguimiento.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_proximo_seguimiento else None,
            'notas': self.notas,
            'etiquetas': self.etiquetas.split(',') if self.etiquetas else []
        }
`,
  },
  {
    path: 'models/seguimiento.py',
    nombre: 'seguimiento.py',
    lenguaje: 'python',
    descripcion: 'Modelo SQLAlchemy para registrar la bitácora cronológica de llamadas, correos y WhatsApp.',
    contenido: `from datetime import datetime
from models import db

class Seguimiento(db.Model):
    __tablename__ = 'seguimientos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prospecto_id = db.Column(db.Integer, db.ForeignKey('prospectos.id', onupdate='CASCADE', ondelete='CASCADE'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', onupdate='CASCADE', ondelete='RESTRICT'), nullable=False)
    
    canal = db.Column(db.Enum('Llamada', 'WhatsApp', 'Correo Electrónico', 'Reunión Presencial', 'Videoconferencia', 'Nota Interna'), nullable=False)
    resultado = db.Column(db.Enum('Exitoso / Contactado', 'Interesado', 'Sin Respuesta', 'Buzón de Voz / Ocupado', 'Reagendado', 'No Interesado'), nullable=False)
    
    fecha_hora = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    observaciones = db.Column(db.Text, nullable=False)
    proxima_accion = db.Column(db.String(255), nullable=True)
    fecha_proxima_accion = db.Column(db.DateTime, nullable=True)
    creado_en = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    usuario = db.relationship('Usuario', backref=db.backref('seguimientos_realizados', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'prospecto_id': self.prospecto_id,
            'usuario_id': self.usuario_id,
            'usuario_nombre': self.usuario.nombre if self.usuario else None,
            'canal': self.canal,
            'resultado': self.resultado,
            'fecha_hora': self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
            'observaciones': self.observaciones,
            'proxima_accion': self.proxima_accion,
            'fecha_proxima_accion': self.fecha_proxima_accion.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_proxima_accion else None
        }
`,
  },
  {
    path: 'routes/prospectos_bp.py',
    nombre: 'prospectos_bp.py',
    lenguaje: 'python',
    descripcion: 'Controlador API REST con endpoints CRUD para prospectos, filtrado relacional y validaciones.',
    contenido: `from flask import Blueprint, request, jsonify
from models import db
from models.prospecto import Prospecto
from models.etapa_pipeline import EtapaPipeline
from datetime import datetime

prospectos_bp = Blueprint('prospectos_bp', __name__)

@prospectos_bp.route('', methods=['GET'])
def get_prospectos():
    """Listado de prospectos con soporte de filtros"""
    etapa_id = request.args.get('etapa_id', type=int)
    usuario_id = request.args.get('usuario_id', type=int)
    fuente = request.args.get('fuente')
    busqueda = request.args.get('q')

    query = Prospecto.query

    if etapa_id:
        query = query.filter_by(etapa_id=etapa_id)
    if usuario_id:
        query = query.filter_by(usuario_id=usuario_id)
    if fuente:
        query = query.filter_by(fuente=fuente)
    if busqueda:
        term = f"%{busqueda}%"
        query = query.filter(
            (Prospecto.nombre.ilike(term)) | 
            (Prospecto.empresa.ilike(term)) | 
            (Prospecto.email.ilike(term))
        )

    prospectos = query.order_by(Prospecto.fecha_registro.desc()).all()
    return jsonify([p.to_dict() for p in prospectos])

@prospectos_bp.route('/<int:id>', methods=['GET'])
def get_prospecto(id):
    prospecto = Prospecto.query.get_or_404(id)
    return jsonify(prospecto.to_dict())

@prospectos_bp.route('', methods=['POST'])
def create_prospecto():
    data = request.get_json() or {}
    
    # Validaciones obligatorias
    if not data.get('nombre') or not data.get('empresa'):
        return jsonify({'error': 'Los campos nombre y empresa son requeridos'}), 400

    prospecto = Prospecto(
        nombre=data['nombre'].strip(),
        empresa=data['empresa'].strip(),
        email=data.get('email'),
        telefono=data.get('telefono'),
        fuente=data.get('fuente', 'Sitio Web'),
        etapa_id=data.get('etapa_id', 1),
        usuario_id=data.get('usuario_id', 1),
        valor_estimado=data.get('valor_estimado', 0.0),
        notas=data.get('notas'),
        etiquetas=','.join(data.get('etiquetas', [])) if isinstance(data.get('etiquetas'), list) else data.get('etiquetas')
    )

    db.session.add(prospecto)
    db.session.commit()
    return jsonify(prospecto.to_dict()), 201

@prospectos_bp.route('/<int:id>/etapa', methods=['PUT'])
def update_etapa(id):
    """Actualiza la etapa comercial de un prospecto (Kanban drag & drop)"""
    prospecto = Prospecto.query.get_or_404(id)
    data = request.get_json() or {}
    nueva_etapa_id = data.get('etapa_id')

    if not nueva_etapa_id:
        return jsonify({'error': 'etapa_id requerido'}), 400

    prospecto.etapa_id = nueva_etapa_id
    db.session.commit()
    return jsonify(prospecto.to_dict())

@prospectos_bp.route('/<int:id>', methods=['DELETE'])
def delete_prospecto(id):
    prospecto = Prospecto.query.get_or_404(id)
    db.session.delete(prospecto)
    db.session.commit()
    return jsonify({'message': f'Prospecto #{id} eliminado correctamente'})
`,
  },
  {
    path: 'requirements.txt',
    nombre: 'requirements.txt',
    lenguaje: 'text',
    descripcion: 'Dependencias oficiales de Python para ejecutar el backend Flask con MySQL.',
    contenido: `Flask==3.0.2
Flask-Cors==4.0.0
Flask-SQLAlchemy==3.1.1
Flask-JWT-Extended==4.6.0
PyMySQL==1.1.0
cryptography==42.0.5
python-dotenv==1.0.1
gunicorn==21.2.0
marshmallow==3.20.2
pytest==8.0.2
`,
  },
];
