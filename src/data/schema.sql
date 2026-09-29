-- =====================================================================
-- CRMComercial - Sistema Empresarial de Gestión y Seguimiento de Clientes
-- Base de Datos Relacional: MySQL 8.0 / MariaDB 10.5+
-- Autora / Tesista: Ing. Yenifer Reina Sena Suero
-- Empresa Patrocinadora: ITHOT S.R.L. (Santo Domingo, República Dominicana)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `crm_comercial` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_comercial`;

-- Desactivar temporalmente revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. TABLA: roles
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) NULL,
  `nivel_acceso` INT NOT NULL DEFAULT 1,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `nivel_acceso`) VALUES
(1, 'Administrador General', 'Control total de usuarios, roles, configuraciones, auditoría y papelera.', 100),
(2, 'Supervisor Comercial', 'Supervisión de metas, pipeline global, asignación de prospectos y reportes.', 75),
(3, 'Ejecutivo Comercial', 'Gestión de prospectos asignados, oportunidades, llamadas y tareas.', 50),
(4, 'Analista Comercial', 'Análisis de datos, validación RNC, importaciones y control de calidad.', 40),
(5, 'Consulta', 'Acceso de solo lectura a métricas y reportes gerenciales.', 10);

-- ---------------------------------------------------------------------
-- 2. TABLA: subcuentas
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `subcuentas`;
CREATE TABLE `subcuentas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `empresa_matriz` VARCHAR(100) NOT NULL DEFAULT 'ITHOT',
  `codigo` VARCHAR(30) NOT NULL UNIQUE,
  `responsable` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) NULL,
  `ciudad` VARCHAR(100) NOT NULL DEFAULT 'Santo Domingo',
  `telefono` VARCHAR(50) NULL,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `subcuentas` (`id`, `nombre`, `empresa_matriz`, `codigo`, `responsable`, `direccion`, `ciudad`, `telefono`) VALUES
(1, 'ITHOT Sede Principal', 'ITHOT', 'ITHOT-SD-01', 'Yenifer Reina Sena Suero', 'Av. 27 de Febrero esq. Winston Churchill', 'Santo Domingo', '+1 809-567-8900'),
(2, 'ITHOT Sucursal Santiago', 'ITHOT', 'ITHOT-STG-02', 'Armando Montes de Oca Hesni', 'Av. Juan Pablo Duarte No. 45', 'Santiago de los Caballeros', '+1 809-583-1122');

-- ---------------------------------------------------------------------
-- 3. TABLA: usuarios
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `usuario` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `password_plain` VARCHAR(100) NULL,
  `rol_id` INT NOT NULL DEFAULT 3,
  `rol` VARCHAR(50) NOT NULL DEFAULT 'Ejecutivo Comercial',
  `telefono` VARCHAR(50) NULL,
  `empresa` VARCHAR(100) NOT NULL DEFAULT 'ITHOT',
  `subcuenta_id` INT NULL,
  `subcuenta` VARCHAR(150) NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `online` TINYINT(1) NOT NULL DEFAULT 0,
  `ultimo_acceso` DATETIME NULL,
  `ultimo_cierre` DATETIME NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`subcuenta_id`) REFERENCES `subcuentas`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `usuario`, `password_hash`, `password_plain`, `rol_id`, `rol`, `telefono`, `empresa`, `subcuenta`, `activo`, `online`, `ultimo_acceso`) VALUES
(1, 'Yenifer Reina Sena Suero', 'Sena Suero', 'yenifer.sena@ithot.com.do', 'ysena', '$2b$12$ITHOT_ADMIN_HASH', 'ITHOT2026*', 1, 'Administrador General', '+1 809-567-8900', 'ITHOT', 'ITHOT Sede Principal', 1, 1, '2026-09-29 08:30:00'),
(2, 'Armando Montes de Oca Hesni', 'Montes de Oca Hesni', 'armando.montes@ithot.com.do', 'amontes', '$2b$12$ITHOT_SUPERVISOR_HASH', 'Montes2026*', 2, 'Supervisor Comercial', '+1 829-876-5432', 'ITHOT', 'ITHOT Sede Principal', 1, 1, '2026-09-29 08:15:00'),
(3, 'Felix Manuel Robles', 'Robles', 'felix.robles@ithot.com.do', 'frobles', '$2b$12$ITHOT_EJECUTIVO_HASH', 'Robles2026*', 3, 'Ejecutivo Comercial', '+1 849-987-6543', 'ITHOT', 'ITHOT Sede Principal', 1, 1, '2026-09-29 07:50:00'),
(4, 'Ana Julia Alcántara', 'Alcántara', 'ana.alcantara@ithot.com.do', 'aalcantara', '$2b$12$ITHOT_ANALISTA_HASH', 'Alcantara2026*', 4, 'Analista Comercial', '+1 809-456-7890', 'ITHOT', 'ITHOT Sede Principal', 1, 1, '2026-09-28 17:30:00');

-- ---------------------------------------------------------------------
-- 4. TABLA: empresas
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `empresas`;
CREATE TABLE `empresas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `razon_social` VARCHAR(200) NOT NULL,
  `rnc` VARCHAR(30) NOT NULL UNIQUE,
  `telefono` VARCHAR(50) NULL,
  `email` VARCHAR(150) NULL,
  `direccion` VARCHAR(255) NULL,
  `ciudad` VARCHAR(100) NOT NULL DEFAULT 'Santo Domingo',
  `sector` VARCHAR(100) NULL,
  `sitio_web` VARCHAR(200) NULL,
  `industria` VARCHAR(150) NOT NULL DEFAULT 'Comercio Mayorista',
  `cantidad_empleados` INT NOT NULL DEFAULT 10,
  `usuario_id` INT NOT NULL,
  `etiquetas` TEXT NULL,
  `notas` TEXT NULL,
  `estado` ENUM('Activa', 'Prospecto', 'Inactiva', 'Lead') NOT NULL DEFAULT 'Prospecto',
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `empresas` (`id`, `razon_social`, `rnc`, `telefono`, `email`, `direccion`, `ciudad`, `sector`, `sitio_web`, `industria`, `cantidad_empleados`, `usuario_id`, `etiquetas`, `estado`) VALUES
(1, 'Auto Repuestos Central S.R.L.', '1-31-45678-2', '+1 809-582-4411', 'contacto@autorepuestoscentral.do', 'Av. Bartolomé Colón No. 85', 'Santiago de los Caballeros', 'Los Jardines', 'https://autorepuestoscentral.do', 'Comercio Mayorista y Repuestos', 45, 1, 'Prospecto, ITHOT System, Facturación Electrónica', 'Prospecto'),
(2, 'Distribuidora Corripio & Asociados', '1-01-23456-7', '+1 809-566-1020', 'comercial@distcorripio.com.do', 'Av. John F. Kennedy Km 6.5', 'Santo Domingo', 'Ensanche La Fe', 'https://distcorripio.com.do', 'Distribución y Retail Masivo', 250, 2, 'Cliente Activo, ITHOT System, CRM Comercial', 'Activa'),
(3, 'Supermercados Plaza Lama Express S.A.', '1-02-98765-4', '+1 809-591-3300', 'operaciones@plazalama.com.do', 'Autopista San Isidro esq. Charles de Gaulle', 'Santo Domingo Este', 'San Isidro', 'https://plazalama.com.do', 'Supermercados y Gran Superficie', 180, 3, 'Prospecto, POS Digital, Facturación Electrónica', 'Prospecto'),
(4, 'Farmacias Carol S.A.', '1-01-77889-1', '+1 809-541-2000', 'contacto@farmaciascarol.com.do', 'Av. Gustavo Mejía Ricart No. 102', 'Santo Domingo', 'Ensanche Naco', 'https://farmaciascarol.com.do', 'Salud y Farmacéutica', 320, 4, 'Cliente, ITHOT System, Inventario', 'Activa');

-- ---------------------------------------------------------------------
-- 5. TABLA: etapas_pipeline
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `etapas_pipeline`;
CREATE TABLE `etapas_pipeline` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL,
  `orden` INT NOT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT '#0d6efd',
  `descripcion` VARCHAR(255) NULL,
  `es_etapa_final` TINYINT(1) NOT NULL DEFAULT 0,
  `es_ganado` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `etapas_pipeline` (`id`, `nombre`, `orden`, `color`, `descripcion`, `es_etapa_final`, `es_ganado`) VALUES
(1, 'Nuevo Lead', 1, '#0d6efd', 'Prospecto captado recientemente, pendiente de primer contacto.', 0, 0),
(2, 'Contactado', 2, '#0dcaf0', 'Primer contacto telefónico o WhatsApp completado.', 0, 0),
(3, 'Interesado', 3, '#6610f2', 'Cliente interesado y calificado.', 0, 0),
(4, 'Reunión Agendada', 4, '#fd7e14', 'Demostración del software agendada en calendario.', 0, 0),
(5, 'Propuesta Enviada', 5, '#ffc107', 'Cotización formal remitida al tomador de decisión.', 0, 0),
(6, 'Negociación', 6, '#20c997', 'Ajuste de términos de licenciamiento e implementación.', 0, 0),
(7, 'Ganado', 7, '#198754', 'Venta cerrada formalmente con contrato firmado.', 1, 1),
(8, 'Perdido', 8, '#dc3545', 'El prospecto declinó la propuesta comercial.', 1, 0);

-- ---------------------------------------------------------------------
-- 6. TABLA: contactos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `contactos`;
CREATE TABLE `contactos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `empresa_id` INT NULL,
  `empresa` VARCHAR(200) NOT NULL,
  `cargo` VARCHAR(100) NULL,
  `telefono` VARCHAR(50) NOT NULL,
  `whatsapp` VARCHAR(50) NULL,
  `email` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) NULL,
  `ciudad` VARCHAR(100) NOT NULL DEFAULT 'Santo Domingo',
  `provincia` VARCHAR(100) NOT NULL DEFAULT 'Distrito Nacional',
  `naturaleza_negocio` VARCHAR(150) NULL,
  `usuario_id` INT NOT NULL,
  `estado_comercial` VARCHAR(50) NOT NULL DEFAULT 'Prospecto',
  `observaciones` TEXT NULL,
  `etiquetas` TEXT NULL,
  `producto_interes` VARCHAR(100) NULL,
  `modulo_interes` VARCHAR(100) NULL,
  `ultima_interaccion` DATETIME NULL,
  `proximo_seguimiento` DATETIME NULL,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 7. TABLA: prospectos (Oportunidades Comerciales)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `prospectos`;
CREATE TABLE `prospectos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `empresa_id` INT NULL,
  `empresa` VARCHAR(200) NOT NULL,
  `cargo` VARCHAR(100) NULL,
  `email` VARCHAR(150) NOT NULL,
  `telefono` VARCHAR(50) NOT NULL,
  `whatsapp` VARCHAR(50) NULL,
  `fuente` VARCHAR(50) NOT NULL DEFAULT 'Referido',
  `etapa_id` INT NOT NULL DEFAULT 1,
  `usuario_id` INT NOT NULL,
  `valor_estimado` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `contacto_id` INT NULL,
  `producto_interes` VARCHAR(100) NULL,
  `modulo_interes` VARCHAR(100) NULL,
  `direccion` VARCHAR(255) NULL,
  `ciudad` VARCHAR(100) NOT NULL DEFAULT 'Santo Domingo',
  `notas` TEXT NULL,
  `etiquetas` TEXT NULL,
  `ultima_interaccion` DATETIME NULL,
  `fecha_proximo_seguimiento` DATETIME NULL,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`etapa_id`) REFERENCES `etapas_pipeline`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`contacto_id`) REFERENCES `contactos`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 8. TABLA: seguimientos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `seguimientos`;
CREATE TABLE `seguimientos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prospecto_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `canal` ENUM('Llamada', 'WhatsApp', 'Correo Electrónico', 'Reunión Presencial', 'Videoconferencia', 'Nota Interna') NOT NULL,
  `resultado` VARCHAR(100) NOT NULL,
  `fecha_hora` DATETIME NOT NULL,
  `observaciones` TEXT NOT NULL,
  `proxima_accion` VARCHAR(150) NULL,
  `fecha_proxima_accion` DATETIME NULL,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`prospecto_id`) REFERENCES `prospectos`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 9. TABLA: tareas
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `tareas`;
CREATE TABLE `tareas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prospecto_id` INT NULL,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT NULL,
  `prioridad` ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  `estado` ENUM('Pendiente', 'En Progreso', 'Completada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
  `fecha_limite` DATE NOT NULL,
  `hora_limite` TIME NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`prospecto_id`) REFERENCES `prospectos`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 10. TABLA: comentarios
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE `comentarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entidad_tipo` ENUM('empresa', 'contacto', 'prospecto', 'oportunidad') NOT NULL,
  `entidad_id` INT NOT NULL,
  `usuario_nombre` VARCHAR(150) NOT NULL,
  `usuario_id` INT NOT NULL,
  `texto` TEXT NOT NULL,
  `fecha_hora` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 11. TABLA: adjuntos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `adjuntos`;
CREATE TABLE `adjuntos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entidad_tipo` ENUM('empresa', 'contacto', 'prospecto', 'oportunidad') NOT NULL,
  `entidad_id` INT NOT NULL,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `tipo_archivo` ENUM('PDF', 'Excel', 'Word', 'Imagen', 'Otro') NOT NULL DEFAULT 'PDF',
  `tamano_kb` INT NOT NULL DEFAULT 500,
  `usuario_nombre` VARCHAR(150) NOT NULL,
  `fecha_subida` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `url_data` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 12. TABLA: objetivos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `objetivos`;
CREATE TABLE `objetivos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `tipo` ENUM('Prospectos', 'Ventas', 'Llamadas', 'Cierres') NOT NULL DEFAULT 'Prospectos',
  `meta_cantidad` DECIMAL(12,2) NOT NULL,
  `unidad` VARCHAR(20) NOT NULL DEFAULT 'prospectos',
  `periodo` VARCHAR(50) NOT NULL DEFAULT 'Septiembre 2026',
  `usuario_id` INT NULL,
  `responsable` VARCHAR(150) NOT NULL,
  `avance_actual` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `fecha_limite` DATE NOT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `objetivos` (`id`, `titulo`, `tipo`, `meta_cantidad`, `unidad`, `periodo`, `usuario_id`, `responsable`, `avance_actual`, `fecha_limite`) VALUES
(1, 'Meta Mensual de Prospectos Calificados', 'Prospectos', 50.00, 'prospectos', 'Septiembre 2026', NULL, 'Equipo Comercial ITHOT', 38.00, '2026-09-30'),
(2, 'Meta de Ventas y Cierres Comerciales', 'Ventas', 500000.00, 'RD$', 'Septiembre 2026', NULL, 'Equipo Comercial ITHOT', 385000.00, '2026-09-30');

-- ---------------------------------------------------------------------
-- 13. TABLA: papelera (Soft delete para restauración segura)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `papelera`;
CREATE TABLE `papelera` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entidad_tipo` ENUM('Empresa', 'Contacto', 'Prospecto', 'Tarea', 'Seguimiento') NOT NULL,
  `entidad_id` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `detalles` TEXT NULL,
  `datos_json` LONGTEXT NOT NULL,
  `usuario_elimino` VARCHAR(150) NOT NULL,
  `fecha_eliminacion` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 14. TABLA: auditoria_sistema
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `auditoria_sistema`;
CREATE TABLE `auditoria_sistema` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario` VARCHAR(150) NOT NULL,
  `usuario_id` INT NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `accion` VARCHAR(50) NOT NULL,
  `modulo` VARCHAR(50) NOT NULL,
  `registro_afectado` VARCHAR(255) NOT NULL,
  `detalles` TEXT NOT NULL,
  `ip_simulada` VARCHAR(45) NULL,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 15. TABLA: notificaciones
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `usuario_origen` VARCHAR(150) NOT NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `modulo_destino` VARCHAR(50) NULL,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reactivar revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Fin del script MySQL DDL
