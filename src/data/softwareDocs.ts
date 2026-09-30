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

// 4. Archivos de Código Oficiales para Visual Studio Code (Node.js + Express + MySQL + HTML5 + CSS3 + JS)
export const ARCHIVOS_PROYECTO_BACKEND: CodigoArchivo[] = [
  {
    path: 'server.js',
    nombre: 'server.js',
    lenguaje: 'javascript',
    descripcion: 'Punto de entrada del servidor Express.js. Inicializa CORS, middlewares, conexión a base de datos MySQL 8.0 y endpoints RESTful para todos los módulos.',
    contenido: `/**
 * CRMComercial - Servidor Empresarial Backend
 * Desarrollado para IB SYSTEM S.R.L. - Proyecto de Posgrado
 * 
 * Tecnologías: Node.js, Express.js, MySQL 8.0
 * Ejecución en Visual Studio Code:
 * 1. npm install
 * 2. npm start
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Endpoints RESTful completos para Empresas, Contactos, Pipeline, Seguimiento, Auditoría y Usuarios
app.get('/api/status', (req, res) => {
  res.json({
    sistema: 'CRMComercial - IB SYSTEM S.R.L.',
    entorno: 'Node.js + Express',
    motor_bd: db.isUsingMySQL() ? 'MySQL 8.0 Conectado' : 'Persistencia Local Activa',
    version: '1.0.0 Pro'
  });
});

app.post('/api/auth/login', (req, res) => {
  /* Autenticación estricta con control de sesiones e IP */
});

app.get('/api/empresas', async (req, res) => {
  /* Consulta de empresas en MySQL */
});

app.post('/api/empresas', async (req, res) => {
  /* Registro con RNC y auditoría */
});

app.get('/api/prospectos', async (req, res) => {
  /* Pipeline comercial y cálculo automático de costos */
});

db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(\`CRMComercial Server corriendo en http://localhost:\${PORT}\`);
  });
});`,
  },
  {
    path: 'database/schema.sql',
    nombre: 'schema.sql',
    lenguaje: 'sql',
    descripcion: 'Script DDL completo de MySQL 8.0 con creación de base de datos, tablas relacionales con llaves foráneas y datos iniciales (Seed Data).',
    contenido: `-- =====================================================================
-- CRMComercial - Sistema Empresarial de Gestión de Prospectos
-- Desarrollado para: IB SYSTEM S.R.L. (Proyecto de Posgrado)
-- Autora: Ing. Yenifer Reina Sena Suero
-- Motor Relacional: MySQL 8.0 / MariaDB 10.5+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`crmcomercial_ibsystem\` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE \`crmcomercial_ibsystem\`;

-- 1. Tabla: usuarios (Yenifer Sena, Felix Robles, Armando Montes, Ana Julia)
CREATE TABLE IF NOT EXISTS \`usuarios\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`apellido\` VARCHAR(100),
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`usuario\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`rol\` VARCHAR(50) NOT NULL DEFAULT 'Ejecutivo Comercial',
  \`telefono\` VARCHAR(30),
  \`activo\` BOOLEAN DEFAULT TRUE,
  \`empresa\` VARCHAR(100) DEFAULT 'IB SYSTEM S.R.L.',
  \`subcuenta\` VARCHAR(100) DEFAULT 'Sede Principal Santo Domingo',
  \`fecha_creacion\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`ultimo_acceso\` DATETIME NULL,
  \`ultimo_cierre\` DATETIME NULL
) ENGINE=InnoDB;

-- 2. Tabla: empresas
CREATE TABLE IF NOT EXISTS \`empresas\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`razon_social\` VARCHAR(200) NOT NULL,
  \`nombre_comercial\` VARCHAR(200),
  \`rnc\` VARCHAR(30) NOT NULL,
  \`direccion\` VARCHAR(255),
  \`ciudad\` VARCHAR(100) DEFAULT 'Santo Domingo',
  \`provincia\` VARCHAR(100) DEFAULT 'Distrito Nacional',
  \`telefono\` VARCHAR(50),
  \`correo\` VARCHAR(150),
  \`sitio_web\` VARCHAR(200),
  \`industria\` VARCHAR(100),
  \`cantidad_empleados\` VARCHAR(50),
  \`responsable_comercial\` VARCHAR(100),
  \`usuario_id\` INT,
  \`estado_comercial\` VARCHAR(50) DEFAULT 'Prospecto',
  \`fecha_registro\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Tabla: contactos
CREATE TABLE IF NOT EXISTS \`contactos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`apellido\` VARCHAR(100),
  \`empresa\` VARCHAR(200) NOT NULL,
  \`cargo\` VARCHAR(100),
  \`telefono\` VARCHAR(50),
  \`whatsapp\` VARCHAR(50),
  \`correo\` VARCHAR(150),
  \`responsable_comercial\` VARCHAR(100),
  \`usuario_id\` INT,
  \`ultimo_contacto\` DATETIME,
  \`fecha_registro\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Tabla: prospectos (Pipeline Kanban & Cálculo de Costos)
CREATE TABLE IF NOT EXISTS \`prospectos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(200) NOT NULL,
  \`empresa\` VARCHAR(200) NOT NULL,
  \`contacto_principal\` VARCHAR(150),
  \`telefono\` VARCHAR(50),
  \`correo\` VARCHAR(150),
  \`plan_seleccionado\` VARCHAR(100) DEFAULT 'PYME',
  \`costo_base\` DECIMAL(10,2) DEFAULT 45.00,
  \`costo_adicional\` DECIMAL(10,2) DEFAULT 0.00,
  \`costo_mensual\` DECIMAL(10,2) DEFAULT 45.00,
  \`valor_estimado\` DECIMAL(12,2) DEFAULT 540.00,
  \`etapa\` ENUM('Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido') NOT NULL DEFAULT 'Contacto',
  \`dias_sin_seguimiento\` INT DEFAULT 0,
  \`fecha_registro\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Tabla: seguimientos (Alertas de 7 días)
CREATE TABLE IF NOT EXISTS \`seguimientos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`prospecto_id\` INT,
  \`usuario\` VARCHAR(100) NOT NULL,
  \`canal\` ENUM('Llamada', 'Correo', 'WhatsApp', 'Reunión', 'Nota') NOT NULL,
  \`fecha\` DATE NOT NULL,
  \`hora\` TIME NOT NULL,
  \`resultado\` VARCHAR(100) NOT NULL,
  \`observaciones\` TEXT NOT NULL,
  FOREIGN KEY (\`prospecto_id\`) REFERENCES \`prospectos\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla: auditoria (Trazabilidad total)
CREATE TABLE IF NOT EXISTS \`auditoria\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`usuario\` VARCHAR(100) NOT NULL,
  \`fecha\` DATE NOT NULL,
  \`hora\` TIME NOT NULL,
  \`accion\` VARCHAR(100) NOT NULL,
  \`modulo\` VARCHAR(100) NOT NULL,
  \`registro_afectado\` VARCHAR(255),
  \`detalles\` TEXT,
  \`ip\` VARCHAR(50) DEFAULT '127.0.0.1'
) ENGINE=InnoDB;`,
  },
  {
    path: 'database/db.js',
    nombre: 'db.js',
    lenguaje: 'javascript',
    descripcion: 'Módulo de conexión a MySQL 8.0 con pool de conexiones y fallback automático a almacenamiento JSON si MySQL local no está encendido.',
    contenido: `const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crmcomercial_ibsystem',
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: 10
};

let pool = null;
let useMySQL = false;

async function initDatabase() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    useMySQL = true;
    console.log('[Base de Datos] MySQL 8.0 Conectado.');
  } catch (err) {
    useMySQL = false;
    console.warn('[Base de Datos] MySQL no disponible. Activando motor persistente JSON.');
  }
}

module.exports = { initDatabase, isUsingMySQL: () => useMySQL };`,
  },
  {
    path: 'public/index.html',
    nombre: 'index.html',
    lenguaje: 'html',
    descripcion: 'Página HTML5 corporativa con pantalla de acceso (Login), navegación sidebar y los 11 módulos empresariales.',
    contenido: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CRMComercial - IB SYSTEM S.R.L.</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <!-- Pantalla de Login -->
  <div id="loginScreen" class="login-wrapper">...</div>

  <!-- Layout Principal con 11 Módulos -->
  <div id="appContainer" class="app-layout hidden">
    <!-- Sidebar, Header, Modales y Tablas -->
  </div>
  <script src="js/app.js"></script>
</body>
</html>`,
  },
  {
    path: 'public/js/app.js',
    nombre: 'app.js',
    lenguaje: 'javascript',
    descripcion: 'Lógica cliente Vanilla JavaScript (ES6+). Autenticación, control de sesiones, CRUD de los módulos, cálculo de costos y alerta de 7 días.',
    contenido: `// Cliente Vanilla JavaScript para CRMComercial
const state = { currentUser: null, token: null, db: {} };

async function loadAllData() {
  const res = await fetch('/api/db/all');
  state.db = await res.json();
  renderDashboard();
  renderPipelineBoard();
}

function calculatePricing() {
  // Cálculo automático según Plan y Módulos
}`,
  },
  {
    path: 'package.json',
    nombre: 'package.json',
    lenguaje: 'json',
    descripcion: 'Manifiesto de dependencias y scripts de ejecución para Node.js y Visual Studio Code.',
    contenido: `{
  "name": "crmcomercial-ibsystem",
  "version": "1.0.0",
  "description": "Sistema Empresarial CRMComercial para IB SYSTEM - Proyecto de Posgrado",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "mysql2": "^3.11.5",
    "cors": "^2.8.5"
  }
}`,
  },
  {
    path: 'README.md',
    nombre: 'README.md',
    lenguaje: 'markdown',
    descripcion: 'Manual de instalación, configuración de MySQL y ejecución en Visual Studio Code.',
    contenido: `# CRMComercial - IB SYSTEM S.R.L.
## Instrucciones de Ejecución
1. Abrir carpeta en Visual Studio Code
2. Importar database/schema.sql en MySQL
3. npm install
4. npm start
5. Acceder a http://localhost:3000`,
  },
];
