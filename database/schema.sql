-- =====================================================================
-- CRMComercial - Sistema Empresarial de Gestión de Prospectos
-- Desarrollado para: IB SYSTEM S.R.L. (Proyecto de Posgrado)
-- Autora: Ing. Yenifer Reina Sena Suero
-- Motor Relacional: MySQL 8.0 / MariaDB 10.5+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `crmcomercial_ibsystem` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `crmcomercial_ibsystem`;

-- 1. Tabla: roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) NOT NULL,
  `permisos` TEXT,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla: usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100),
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `usuario` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` VARCHAR(50) NOT NULL DEFAULT 'Ejecutivo Comercial',
  `telefono` VARCHAR(30),
  `activo` BOOLEAN DEFAULT TRUE,
  `empresa` VARCHAR(100) DEFAULT 'IB SYSTEM S.R.L.',
  `subcuenta` VARCHAR(100) DEFAULT 'Sede Principal Santo Domingo',
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` DATETIME NULL,
  `ultimo_cierre` DATETIME NULL
) ENGINE=InnoDB;

-- 3. Tabla: empresas
CREATE TABLE IF NOT EXISTS `empresas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `razon_social` VARCHAR(200) NOT NULL,
  `nombre_comercial` VARCHAR(200),
  `rnc` VARCHAR(30) NOT NULL,
  `direccion` VARCHAR(255),
  `ciudad` VARCHAR(100) DEFAULT 'Santo Domingo',
  `provincia` VARCHAR(100) DEFAULT 'Distrito Nacional',
  `telefono` VARCHAR(50),
  `correo` VARCHAR(150),
  `sitio_web` VARCHAR(200),
  `industria` VARCHAR(100),
  `cantidad_empleados` VARCHAR(50),
  `responsable_comercial` VARCHAR(100),
  `usuario_id` INT,
  `estado_comercial` VARCHAR(50) DEFAULT 'Prospecto',
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Tabla: contactos
CREATE TABLE IF NOT EXISTS `contactos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100),
  `empresa_id` INT NULL,
  `empresa` VARCHAR(200) NOT NULL,
  `cargo` VARCHAR(100),
  `telefono` VARCHAR(50),
  `whatsapp` VARCHAR(50),
  `correo` VARCHAR(150),
  `direccion` VARCHAR(255),
  `ciudad` VARCHAR(100) DEFAULT 'Santo Domingo',
  `provincia` VARCHAR(100) DEFAULT 'Distrito Nacional',
  `naturaleza_negocio` VARCHAR(150),
  `estado_comercial` VARCHAR(50) DEFAULT 'Prospecto',
  `producto_interes` VARCHAR(100) DEFAULT 'Facturación Electrónica',
  `modulo_principal` VARCHAR(100) DEFAULT 'Ventas',
  `responsable_comercial` VARCHAR(100),
  `usuario_id` INT,
  `ultimo_contacto` DATETIME,
  `proximo_seguimiento` DATETIME,
  `notas` TEXT,
  `observaciones_comerciales` TEXT,
  `etiquetas` VARCHAR(255),
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Tabla: prospectos (Oportunidades Comerciales con Etapas Oficiales)
CREATE TABLE IF NOT EXISTS `prospectos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(200) NOT NULL,
  `empresa` VARCHAR(200) NOT NULL,
  `contacto_principal` VARCHAR(150),
  `telefono` VARCHAR(50),
  `whatsapp` VARCHAR(50),
  `correo` VARCHAR(150),
  `canal_captacion` VARCHAR(100),
  `producto_principal` VARCHAR(100) DEFAULT 'Facturación Electrónica',
  `plan_seleccionado` VARCHAR(100) DEFAULT 'PYME',
  `costo_base` DECIMAL(10,2) DEFAULT 45.00,
  `modulos_adicionales` TEXT,
  `costo_adicional` DECIMAL(10,2) DEFAULT 0.00,
  `costo_mensual` DECIMAL(10,2) DEFAULT 45.00,
  `valor_estimado` DECIMAL(12,2) DEFAULT 540.00,
  `cantidad_usuarios` INT DEFAULT 3,
  `responsable_comercial` VARCHAR(100),
  `usuario_id` INT,
  `etapa` ENUM('Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido') NOT NULL DEFAULT 'Contacto',
  `fecha_primer_contacto` DATE,
  `ultima_actividad` DATETIME,
  `proximo_seguimiento` DATETIME,
  `dias_sin_seguimiento` INT DEFAULT 0,
  `observaciones` TEXT,
  `etiquetas` VARCHAR(255),
  `motivo_perdida` VARCHAR(255),
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5.1 Tabla: oportunidades (Pipeline de Ventas, Cotizaciones y Planes Comerciales)
CREATE TABLE IF NOT EXISTS `oportunidades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prospecto_id` INT,
  `empresa_id` INT,
  `contacto_id` INT,
  `usuario_id` INT,
  `nombre` VARCHAR(200) NOT NULL,
  `plan_seleccionado` VARCHAR(100) NOT NULL DEFAULT 'PYME',
  `ecf_mensuales` INT DEFAULT 500,
  `limite_ventas` DECIMAL(12,2) DEFAULT 50000.00,
  `costo_base` DECIMAL(10,2) DEFAULT 45.00,
  `modulos_seleccionados` TEXT,
  `costo_modulos` DECIMAL(10,2) DEFAULT 0.00,
  `cantidad_usuarios` INT DEFAULT 1,
  `costo_por_usuario` DECIMAL(10,2) DEFAULT 0.00,
  `total_mensual` DECIMAL(10,2) DEFAULT 45.00,
  `total_anual` DECIMAL(12,2) DEFAULT 540.00,
  `etapa` ENUM('Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido') DEFAULT 'Contacto',
  `probabilidad` INT DEFAULT 20,
  `fecha_cierre_estimada` DATE,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`prospecto_id`) REFERENCES `prospectos`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`contacto_id`) REFERENCES `contactos`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Tabla: seguimientos (Historial de Interacciones)
CREATE TABLE IF NOT EXISTS `seguimientos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prospecto_id` INT,
  `empresa` VARCHAR(200),
  `usuario` VARCHAR(100) NOT NULL,
  `usuario_id` INT,
  `canal` ENUM('Llamada', 'Correo', 'WhatsApp', 'Reunión', 'Nota') NOT NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `resultado` VARCHAR(100) NOT NULL,
  `observaciones` TEXT NOT NULL,
  `proxima_accion` VARCHAR(255),
  `fecha_proximo_seguimiento` DATETIME,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`prospecto_id`) REFERENCES `prospectos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabla: tareas
CREATE TABLE IF NOT EXISTS `tareas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `asignado_a` VARCHAR(100) NOT NULL,
  `usuario_id` INT,
  `fecha_limite` DATE NOT NULL,
  `prioridad` ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
  `estado` ENUM('Pendiente', 'En Progreso', 'Completada') DEFAULT 'Pendiente',
  `relacionado_tipo` VARCHAR(50),
  `relacionado_id` INT,
  `relacionado_nombre` VARCHAR(200),
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Tabla: etiquetas
CREATE TABLE IF NOT EXISTS `etiquetas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `categoria` ENUM('Clientes', 'Prospectos', 'Productos', 'Módulos') NOT NULL,
  `color` VARCHAR(20) DEFAULT '#3b82f6'
) ENGINE=InnoDB;

-- 9. Tabla: auditoria
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario` VARCHAR(100) NOT NULL,
  `usuario_id` INT,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `modulo` VARCHAR(100) NOT NULL,
  `registro_afectado` VARCHAR(255),
  `detalles` TEXT,
  `ip` VARCHAR(50) DEFAULT '127.0.0.1'
) ENGINE=InnoDB;

-- 10. Tabla: notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `usuario` VARCHAR(100),
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `leida` BOOLEAN DEFAULT FALSE,
  `tipo` VARCHAR(50) DEFAULT 'nuevo_prospecto'
) ENGINE=InnoDB;

-- 11. Tabla: importaciones
CREATE TABLE IF NOT EXISTS `importaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `usuario` VARCHAR(100) NOT NULL,
  `archivo` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `registros_procesados` INT DEFAULT 0,
  `registros_correctos` INT DEFAULT 0,
  `registros_con_error` INT DEFAULT 0,
  `estado` VARCHAR(50) DEFAULT 'Exitoso'
) ENGINE=InnoDB;

-- 12. Tabla: exportaciones
CREATE TABLE IF NOT EXISTS `exportaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `usuario` VARCHAR(100) NOT NULL,
  `archivo_generado` VARCHAR(255) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `formato` VARCHAR(20) NOT NULL,
  `cantidad_registros` INT DEFAULT 0
) ENGINE=InnoDB;

-- 13. Tabla: configuracion
CREATE TABLE IF NOT EXISTS `configuracion` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clave` VARCHAR(100) NOT NULL UNIQUE,
  `valor` TEXT NOT NULL
) ENGINE=InnoDB;

-- =====================================================================
-- DATOS INICIALES SEMILLA (SEED DATA)
-- =====================================================================

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `usuario`, `password_hash`, `rol`, `telefono`, `activo`, `empresa`, `subcuenta`) VALUES
(1, 'Yenifer Reina', 'Sena Suero', 'yenifer.sena@ibsystem.com.do', 'yenifer.sena', 'Admin123*', 'Administrador General', '+1 809-567-8900', 1, 'IB SYSTEM S.R.L.', 'Sede Principal Santo Domingo'),
(2, 'Felix Manuel', 'Robles', 'felix.robles@ibsystem.com.do', 'felix.robles', 'Felix2026*', 'Ejecutivo Comercial', '+1 809-541-2233', 1, 'IB SYSTEM S.R.L.', 'Sucursal Este Punta Cana'),
(3, 'Armando', 'Montes de Oca Hesni', 'armando.montes@ibsystem.com.do', 'armando.montes', 'Armando2026*', 'Supervisor Comercial', '+1 809-582-4411', 1, 'IB SYSTEM S.R.L.', 'Sucursal Cibao Santiago'),
(4, 'Ana Julia', 'Alcántara', 'ana.alcantara@ibsystem.com.do', 'ana.alcantara', 'Ana2026*', 'Analista Comercial', '+1 809-535-6677', 1, 'IB SYSTEM S.R.L.', 'Sede Principal Santo Domingo');

INSERT INTO `etiquetas` (`nombre`, `categoria`, `color`) VALUES
('Cliente', 'Clientes', '#10b981'),
('Cliente Activo', 'Clientes', '#059669'),
('Cliente Inactivo', 'Clientes', '#ef4444'),
('Prospecto', 'Prospectos', '#3b82f6'),
('Lead', 'Prospectos', '#6366f1'),
('POS Digital', 'Productos', '#ec4899'),
('Facturación Electrónica', 'Productos', '#06b6d4'),
('CRMComercial', 'Productos', '#f59e0b'),
('Inventario', 'Módulos', '#84cc16'),
('Compras', 'Módulos', '#14b8a6'),
('Ventas', 'Módulos', '#0284c7'),
('Caja', 'Módulos', '#f97316'),
('Contabilidad', 'Módulos', '#64748b'),
('Cuentas por Cobrar', 'Módulos', '#eab308'),
('Cuentas por Pagar', 'Módulos', '#f43f5e'),
('Reportes Gerenciales', 'Módulos', '#a855f7');

-- Empresas iniciales
INSERT INTO `empresas` (`id`, `razon_social`, `nombre_comercial`, `rnc`, `direccion`, `ciudad`, `provincia`, `telefono`, `correo`, `sitio_web`, `industria`, `cantidad_empleados`, `responsable_comercial`, `usuario_id`, `estado_comercial`, `fecha_registro`) VALUES
(1, 'Auto Repuestos & Talleres Central S.R.L.', 'Auto Central RD', '1-30-88452-1', 'Av. 27 de Febrero #452, Miraflores', 'Santo Domingo', 'Distrito Nacional', '+1 809-565-1122', 'gerencia@autocentral.com.do', 'https://autocentral.com.do', 'Automotriz y Repuestos', '25-50', 'Yenifer Reina Sena Suero', 1, 'Cliente Activo', '2026-09-01 10:00:00'),
(2, 'Distribuidora Farmacéutica Quisqueyana S.A.', 'Farma Quisqueya', '1-01-94512-3', 'Av. John F. Kennedy Km 6.5', 'Santo Domingo', 'Distrito Nacional', '+1 809-540-3344', 'ventas@farmaquisqueya.do', 'https://farmaquisqueya.do', 'Farmacéutica y Salud', '50-100', 'Armando Montes de Oca Hesni', 3, 'En Negociación', '2026-09-05 11:30:00'),
(3, 'Supermercados & Plazas El Conde S.R.L.', 'Plaza El Conde', '1-31-00214-5', 'Calle El Conde esq. Duarte #102', 'Santo Domingo', 'Distrito Nacional', '+1 809-688-9900', 'administracion@plazaelconde.com.do', 'https://plazaelconde.com.do', 'Supermercados y Retail', '100+', 'Felix Manuel Robles', 2, 'Propuesta Enviada', '2026-09-10 14:15:00'),
(4, 'Ferretería Industrial del Cibao S.R.L.', 'Ferretería Cibao', '1-32-44589-9', 'Av. Bartolomé Colón #88', 'Santiago de los Caballeros', 'Santiago', '+1 809-582-7711', 'compras@ferreteriacibao.com.do', 'https://ferreteriacibao.com.do', 'Construcción y Ferretería', '50-100', 'Armando Montes de Oca Hesni', 3, 'Interesado', '2026-09-12 09:45:00'),
(5, 'Grupo Gastronómico Bella Vista S.R.L.', 'Restaurantes Bella Vista', '1-33-11245-7', 'Av. Sarasota #45, Bella Vista', 'Santo Domingo', 'Distrito Nacional', '+1 809-532-6600', 'operaciones@bellavistagroup.do', 'https://bellavistagroup.do', 'Restaurantes y Hotelería', '25-50', 'Yenifer Reina Sena Suero', 1, 'Cliente Activo', '2026-09-15 16:20:00');

-- Contactos iniciales
INSERT INTO `contactos` (`id`, `nombre`, `apellido`, `empresa`, `cargo`, `telefono`, `whatsapp`, `correo`, `direccion`, `ciudad`, `provincia`, `naturaleza_negocio`, `responsable_comercial`, `usuario_id`, `ultimo_contacto`, `proximo_seguimiento`, `notas`, `etiquetas`, `fecha_registro`) VALUES
(1, 'Lic. Roberto', 'Castillo Peña', 'Auto Repuestos & Talleres Central S.R.L.', 'Gerente General', '+1 809-565-1122', '+1 809-565-1122', 'rcastillo@autocentral.com.do', 'Av. 27 de Febrero #452', 'Santo Domingo', 'Distrito Nacional', 'Comercial / Automotriz', 'Yenifer Reina Sena Suero', 1, '2026-09-28 10:30:00', '2026-10-05 10:00:00', 'Interesado en expandir licencias de POS Digital a 3 sucursales más.', 'Cliente Activo, POS Digital', '2026-09-01 10:00:00'),
(2, 'Dra. Carmen', 'Villalona Ramos', 'Distribuidora Farmacéutica Quisqueyana S.A.', 'Directora Financiera', '+1 809-540-3344', '+1 809-540-3344', 'cvillalona@farmaquisqueya.do', 'Av. John F. Kennedy Km 6.5', 'Santo Domingo', 'Distrito Nacional', 'Distribución / Salud', 'Armando Montes de Oca Hesni', 3, '2026-09-29 11:00:00', '2026-10-02 15:00:00', 'Evaluando propuesta enviada para facturación electrónica con DGII.', 'En Negociación, Facturación Electrónica', '2026-09-05 11:30:00'),
(3, 'Ing. Manuel', 'Taveras Gómez', 'Supermercados & Plazas El Conde S.R.L.', 'Director de Operaciones', '+1 809-688-9900', '+1 809-688-9900', 'mtaveras@plazaelconde.com.do', 'Calle El Conde #102', 'Santo Domingo', 'Distrito Nacional', 'Retail / Supermercado', 'Felix Manuel Robles', 2, '2026-09-27 15:30:00', '2026-10-03 11:00:00', 'Reunión presencial programada para revisión de módulos de inventario y caja.', 'Propuesta Enviada, Retail', '2026-09-10 14:15:00'),
(4, 'Don Franklin', 'Báez Morales', 'Ferretería Industrial del Cibao S.R.L.', 'Presidente Ejecutivo', '+1 809-582-7711', '+1 809-582-7711', 'fbaez@ferreteriacibao.com.do', 'Av. Bartolomé Colón #88', 'Santiago de los Caballeros', 'Santiago', 'Ferretería Mayorista', 'Armando Montes de Oca Hesni', 3, '2026-09-26 14:00:00', '2026-10-04 10:30:00', 'Solicitó cotización con descuento por volumen para 8 usuarios simultáneos.', 'Interesado, Ferretería', '2026-09-12 09:45:00');

-- Prospectos y Pipeline Comercial
INSERT INTO `prospectos` (`id`, `nombre`, `empresa`, `contacto_principal`, `telefono`, `whatsapp`, `correo`, `canal_captacion`, `producto_principal`, `plan_seleccionado`, `costo_base`, `modulos_adicionales`, `costo_adicional`, `costo_mensual`, `valor_estimado`, `cantidad_usuarios`, `responsable_comercial`, `usuario_id`, `etapa`, `fecha_primer_contacto`, `ultima_actividad`, `proximo_seguimiento`, `dias_sin_seguimiento`, `observaciones`, `etiquetas`, `fecha_registro`) VALUES
(1, 'Auto Repuestos Central', 'Auto Repuestos & Talleres Central S.R.L.', 'Lic. Roberto Castillo Peña', '+1 809-565-1122', '+1 809-565-1122', 'rcastillo@autocentral.com.do', 'Recomendación', 'POS Digital', 'Empresarial', 80.00, 'Inventario, Ventas, Cuentas por Cobrar', 24.00, 104.00, 1248.00, 5, 'Yenifer Reina Sena Suero', 1, 'Ganado', '2026-09-01', '2026-09-28 10:30:00', '2026-10-05 10:00:00', 2, 'Contrato firmado por 12 meses. Implementación en curso.', 'Ganado, POS Digital', '2026-09-01 10:00:00'),
(2, 'Distribuidora Farma Quisqueya', 'Distribuidora Farmacéutica Quisqueyana S.A.', 'Dra. Carmen Villalona Ramos', '+1 809-540-3344', '+1 809-540-3344', 'cvillalona@farmaquisqueya.do', 'Feria Comercial', 'Facturación Electrónica', 'Corporativo', 120.00, 'Contabilidad, Cuentas por Pagar, Reportes Gerenciales', 24.00, 144.00, 1728.00, 10, 'Armando Montes de Oca Hesni', 3, 'Propuesta Enviada', '2026-09-05', '2026-09-29 11:00:00', '2026-10-02 15:00:00', 1, 'Propuesta económica entregada. Decisión esperada para esta semana.', 'Propuesta Enviada, Facturación Electrónica', '2026-09-05 11:30:00'),
(3, 'Plazas & Supermercados El Conde', 'Supermercados & Plazas El Conde S.R.L.', 'Ing. Manuel Taveras Gómez', '+1 809-688-9900', '+1 809-688-9900', 'mtaveras@plazaelconde.com.do', 'Llamada en Frío', 'POS Digital', 'Empresarial', 80.00, 'Inventario, Caja, Facturación Electrónica', 24.00, 104.00, 1248.00, 6, 'Felix Manuel Robles', 2, 'Propuesta Enviada', '2026-09-10', '2026-09-27 15:30:00', '2026-10-03 11:00:00', 3, 'Enviada cotización formal. Pendiente visto bueno de tesorería.', 'Propuesta Enviada, Retail', '2026-09-10 14:15:00'),
(4, 'Ferretería Industrial del Cibao', 'Ferretería Industrial del Cibao S.R.L.', 'Don Franklin Báez Morales', '+1 809-582-7711', '+1 809-582-7711', 'fbaez@ferreteriacibao.com.do', 'Página Web', 'Facturación Electrónica', 'PYME', 45.00, 'Inventario, Compras', 16.00, 61.00, 732.00, 3, 'Armando Montes de Oca Hesni', 3, 'Interesado', '2026-09-12', '2026-09-26 14:00:00', '2026-10-04 10:30:00', 4, 'Requiere demo personalizada para los encargados de almacén y facturación.', 'Interesado, Ferretería', '2026-09-12 09:45:00'),
(5, 'Clínica Dental OdontoSalud', 'OdontoSalud Dominicana S.R.L.', 'Dra. Altagracia Pérez', '+1 809-533-8899', '+1 809-533-8899', 'contacto@odontosalud.com.do', 'Redes Sociales', 'Facturación Electrónica', 'Básico', 25.00, 'Caja', 8.00, 33.00, 396.00, 2, 'Ana Julia Alcántara', 4, 'Contacto', '2026-09-22', '2026-09-22 10:00:00', '2026-09-29 10:00:00', 8, 'Sin contacto reciente en más de 7 días. Requiere seguimiento urgente.', 'Contacto, Salud', '2026-09-22 10:00:00');

-- Tareas
INSERT INTO `tareas` (`id`, `titulo`, `descripcion`, `asignado_a`, `usuario_id`, `fecha_limite`, `prioridad`, `estado`, `relacionado_tipo`, `relacionado_id`, `relacionado_nombre`) VALUES
(1, 'Llamar a Carmen Villalona (Farma Quisqueya)', 'Dar seguimiento a la propuesta enviada sobre facturación electrónica.', 'Armando Montes de Oca Hesni', 3, '2026-10-02', 'Alta', 'Pendiente', 'prospecto', 2, 'Distribuidora Farmacéutica Quisqueyana S.A.'),
(2, 'Preparar demo POS para Ferretería Cibao', 'Configurar catálogo de ferretería en entorno de pruebas.', 'Armando Montes de Oca Hesni', 3, '2026-10-04', 'Media', 'En Progreso', 'prospecto', 4, 'Ferretería Industrial del Cibao S.R.L.'),
(3, 'Revisar contratos firmados Auto Central', 'Archivar copia digital y coordinar capacitación con soporte técnico.', 'Yenifer Reina Sena Suero', 1, '2026-10-01', 'Media', 'Completada', 'empresa', 1, 'Auto Repuestos & Talleres Central S.R.L.');

