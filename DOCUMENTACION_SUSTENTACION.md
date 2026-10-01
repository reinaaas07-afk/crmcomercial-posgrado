# DOCUMENTACIÓN TÉCNICA PARA SUSTENTACIÓN DE PROYECTO
## CRMComercial - Sistema de Gestión de Prospectos y Pipeline Comercial
### Empresa Patrocinadora: IB SYSTEM S.R.L. | Proyecto de Titulación de Posgrado
**Autora:** Ing. Yenifer Reina Sena Suero (Administrador General)  
**Equipo Comercial:** Felix Manuel Robles, Armando Montes de Oca Hesni, Ana Julia Alcántara  
**Tecnologías:** Node.js, Express.js, MySQL 8.0, HTML5 Semántico, CSS3, JavaScript Vanilla  
**Fecha:** Octubre 2026  

---

## 1. Arquitectura del Sistema

CRMComercial implementa una arquitectura desacoplada en tres capas (Three-Tier Architecture), diseñada para garantizar alta disponibilidad, velocidad de respuesta en tiempo real y funcionamiento tanto local como en red institucional LAN/Wi-Fi:

```
+-------------------------------------------------------------------------+
|                        CAPA DE PRESENTACIÓN                             |
|  - HTML5 Semántico & CSS3 con Variables y Diseño Responsivo             |
|  - JavaScript Vanilla (SPA sin dependencias pesadas ni compiladores)    |
|  - Soporte Multi-dispositivo: PC, Laptops, Tablets y Teléfonos Móviles  |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTP / REST API (JSON / UTF-8)
                                    v
+-------------------------------------------------------------------------+
|                        CAPA DE APLICACIÓN                               |
|  - Node.js Runtime con Express.js Framework                             |
|  - Servidor escuchando en 0.0.0.0:3000 (Acceso vía IP LAN)              |
|  - Middleware de Auditoría Inmutable (IP, Fecha, Hora, Sesión)          |
|  - Motor de Deduplicación y Lectura Inteligente de Excel (SheetJS)      |
|  - Motor de Cálculo Automático Comercial por Módulos y Usuarios         |
+-------------------------------------------------------------------------+
                                    |
                                    | Pool de Conexiones mysql2 / fs
                                    v
+-------------------------------------------------------------------------+
|                        CAPA DE PERSISTENCIA                             |
|  - Motor Primario: MySQL 8.0 Relacional con Integridad Referencial      |
|  - Motor Secundario: Almacenamiento JSON Transaccional en Disco         |
|  - Sincronización Automática Bidireccional y Scripts de Migración DDL   |
+-------------------------------------------------------------------------+
```

### Principios de Arquitectura:
1. **Acceso Multi-dispositivo Local (0.0.0.0:3000):** Express está configurado para escuchar en todas las interfaces de red de la máquina anfitriona, permitiendo que cualquier dispositivo en la misma red Wi-Fi/LAN ingrese digitando `http://[IP-LOCAL]:3000`.
2. **Cero Dependencia de Compilación en Producción:** La interfaz de usuario opera nativamente en el navegador sin frameworks pesados, garantizando arranque en menos de 1 segundo.
3. **Persistencia Transaccional con Respaldo en Disco:** Toda mutación efectuada en la API se valida, se registra en la bitácora de auditoría y se graba de inmediato en almacenamiento físico.

---

## 2. Modelo Entidad-Relación (ERD)

El modelo de datos relacional de CRMComercial se encuentra normalizado en Tercera Forma Normal (3NF), garantizando coherencia e integridad de datos:

```
+---------------------+           +------------------------+
|      USUARIOS       | 1       N |        EMPRESAS        |
+---------------------+-----------+------------------------+
| PK id (INT)         |           | PK id (INT)            |
|    nombre           |           |    razon_social        |
|    apellido         |           |    nombre_comercial    |
|    email            |           |    rnc (UNIQUE)        |
|    usuario (UNIQUE) |           |    direccion           |
|    password_hash    |           |    ciudad, provincia   |
|    rol (RBAC)       |           |    telefono, correo    |
|    activo (BOOL)    |           |    industria           |
|    ultimo_acceso    |           |    estado_comercial    |
+---------------------+           | FK usuario_id          |
          | 1                     +------------------------+
          |                                   | 1
          |                                   |
          |                                   | N
          | N                     +------------------------+
          +-----------------------|       CONTACTOS        |
          |                       +------------------------+
          |                       | PK id (INT)            |
          |                       | FK empresa_id          |
          |                       |    nombre, apellido    |
          |                       |    cargo               |
          |                       |    telefono, whatsapp  |
          |                       |    correo              |
          |                       |    naturaleza_negocio  |
          |                       |    estado_comercial    |
          |                       |    producto_interes    |
          |                       |    modulo_principal    |
          |                       |    proximo_seguimiento |
          |                       | FK usuario_id          |
          |                       +------------------------+
          |                                   | 1
          |                                   |
          |                                   | N
          | N                     +------------------------+
          +-----------------------|       PROSPECTOS       |
          |                       +------------------------+
          |                       | PK id (INT)            |
          |                       | FK empresa_id          |
          |                       |    contacto_principal  |
          |                       |    plan_seleccionado   |
          |                       |    costo_base          |
          |                       |    modulos_adicionales |
          |                       |    costo_mensual       |
          |                       |    valor_estimado (12m)|
          |                       |    etapa (Pipeline)    |
          |                       |    dias_sin_seguimiento|
          |                       | FK usuario_id          |
          |                       +------------------------+
          |                                   | 1
          |                                   |
          | N                                 | N
+---------------------+           +------------------------+
|      AUDITORIA      |           |      SEGUIMIENTOS      |
+---------------------+           +------------------------+
| PK id (INT)         |           | PK id (INT)            |
|    fecha, hora      |           | FK prospecto_id        |
|    usuario          |           |    canal, resultado    |
|    accion           |           |    observaciones       |
|    modulo           |           |    proxima_accion      |
|    registro_afectado|           |    fecha_proximo       |
|    ip_origen        |           | FK usuario_id          |
+---------------------+           +------------------------+
```

### Cardinalidades y Reglas de Integridad:
- **Empresa &rarr; Contactos (1:N):** Una empresa puede tener múltiples contactos y decisores.
- **Empresa &rarr; Oportunidades (1:N):** Una empresa puede tener múltiples oportunidades comerciales en distintas etapas del pipeline.
- **Contacto &rarr; Oportunidad (1:N):** Una oportunidad puede generarse directamente a partir de un contacto existente.
- **Oportunidad &rarr; Seguimientos (1:N):** Cada interacción telefónica, por WhatsApp o reunión se asocia a la oportunidad comercial correspondiente.

---

## 3. Casos de Uso del Sistema

| Código | Caso de Uso | Actor | Descripción |
|---|---|---|---|
| **CU-01** | Autenticación y Control de Acceso (RBAC) | Todos | Inicio de sesión con usuario institucional y contraseña privada. Destrucción segura de sesión en logout. |
| **CU-02** | Gestión de Usuarios y Permisos | Administrador General | Creación, edición, activación/desactivación de usuarios y restablecimiento de credenciales. |
| **CU-03** | Directorio y Relación Empresa-Contacto | Ejecutivo Comercial | Registro de empresas con RNC y vinculación jerárquica de decisores comerciales. |
| **CU-04** | Creación de Oportunidades con Auto-completado | Ejecutivo Comercial | Selección de empresa con carga automática de contactos y relleno de datos sin teclear duplicados. |
| **CU-05** | Cotización Dinámica de Planes y Módulos | Supervisor / Ejecutivo | Selección de Plan Oficial (Básico, PYME, Empresarial, Corporativo) y cálculo de tarifas según usuarios por módulo. |
| **CU-06** | Importación Inteligente y Deduplicación | Administrador / Supervisor | Carga de archivos Excel (.xlsx) / CSV con mapeo heurístico y creación concurrente de entidades. |
| **CU-07** | Exportación Multi-formato (Excel, CSV, PDF) | Todos | Descarga de datos respetando filtros de búsqueda en formatos Excel (.xlsx), CSV con BOM UTF-8 y reportes PDF. |
| **CU-08** | Auditoría y Trazabilidad Inmutable | Administrador General | Registro automático de logins, logouts, creaciones, ediciones, eliminaciones y direcciones IP. |

---

## 4. Estructura de Base de Datos (DDL MySQL 8.0)

El esquema relacional completo se implementa con soporte nativo de caracteres `utf8mb4_unicode_ci`:

```sql
-- 1. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) DEFAULT '',
  email VARCHAR(150) NOT NULL UNIQUE,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('Administrador General', 'Supervisor Comercial', 'Ejecutivo Comercial', 'Analista Comercial') NOT NULL DEFAULT 'Ejecutivo Comercial',
  telefono VARCHAR(30) DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  empresa VARCHAR(150) DEFAULT 'IB SYSTEM S.R.L.',
  subcuenta VARCHAR(150) DEFAULT 'Sede Principal Santo Domingo',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME NULL,
  ultimo_cierre DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: empresas
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(200) NOT NULL,
  nombre_comercial VARCHAR(200) DEFAULT '',
  rnc VARCHAR(30) NOT NULL UNIQUE,
  direccion VARCHAR(255) DEFAULT '',
  ciudad VARCHAR(100) DEFAULT 'Santo Domingo',
  provincia VARCHAR(100) DEFAULT 'Distrito Nacional',
  telefono VARCHAR(30) DEFAULT '',
  correo VARCHAR(150) DEFAULT '',
  sitio_web VARCHAR(150) DEFAULT '',
  industria VARCHAR(100) DEFAULT 'Comercial / Retail',
  cantidad_empleados VARCHAR(50) DEFAULT '25-50',
  responsable_comercial VARCHAR(100) DEFAULT 'Yenifer Reina Sena Suero',
  usuario_id INT DEFAULT 1,
  estado_comercial ENUM('Prospecto', 'En Negociación', 'Propuesta Enviada', 'Cliente Activo', 'Inactivo') DEFAULT 'Prospecto',
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: contactos
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) DEFAULT '',
  empresa_id INT NULL,
  empresa VARCHAR(200) DEFAULT '',
  cargo VARCHAR(100) DEFAULT 'Decisor Comercial',
  telefono VARCHAR(30) DEFAULT '',
  whatsapp VARCHAR(30) DEFAULT '',
  correo VARCHAR(150) DEFAULT '',
  direccion VARCHAR(255) DEFAULT '',
  ciudad VARCHAR(100) DEFAULT 'Santo Domingo',
  provincia VARCHAR(100) DEFAULT 'Distrito Nacional',
  naturaleza_negocio VARCHAR(100) DEFAULT 'Comercial / Servicios',
  estado_comercial VARCHAR(50) DEFAULT 'Prospecto',
  producto_interes VARCHAR(100) DEFAULT 'Facturación Electrónica',
  modulo_principal VARCHAR(100) DEFAULT 'Ventas',
  responsable_comercial VARCHAR(100) DEFAULT 'Yenifer Reina Sena Suero',
  usuario_id INT DEFAULT 1,
  ultimo_contacto DATETIME NULL,
  proximo_seguimiento DATETIME NULL,
  notas TEXT,
  observaciones_comerciales TEXT,
  etiquetas VARCHAR(255) DEFAULT '',
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: prospectos (Oportunidades Pipeline)
CREATE TABLE IF NOT EXISTS prospectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  empresa_id INT NULL,
  empresa VARCHAR(200) NOT NULL,
  contacto_principal VARCHAR(150) DEFAULT '',
  telefono VARCHAR(30) DEFAULT '',
  whatsapp VARCHAR(30) DEFAULT '',
  correo VARCHAR(150) DEFAULT '',
  canal_captacion VARCHAR(100) DEFAULT 'Venta Directa',
  producto_principal VARCHAR(100) DEFAULT 'Facturación Electrónica',
  plan_seleccionado VARCHAR(50) DEFAULT 'PYME',
  costo_base DECIMAL(10,2) NOT NULL DEFAULT 45.00,
  modulos_adicionales TEXT,
  costo_adicional DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  costo_mensual DECIMAL(10,2) NOT NULL DEFAULT 45.00,
  valor_estimado DECIMAL(10,2) NOT NULL DEFAULT 540.00,
  cantidad_usuarios INT NOT NULL DEFAULT 1,
  responsable_comercial VARCHAR(100) DEFAULT 'Yenifer Reina Sena Suero',
  usuario_id INT DEFAULT 1,
  etapa ENUM('Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido') NOT NULL DEFAULT 'Contacto',
  fecha_primer_contacto DATE NOT NULL,
  ultima_actividad DATETIME NULL,
  proximo_seguimiento DATETIME NULL,
  dias_sin_seguimiento INT NOT NULL DEFAULT 0,
  observaciones TEXT,
  etiquetas VARCHAR(255) DEFAULT '',
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: seguimientos
CREATE TABLE IF NOT EXISTS seguimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prospecto_id INT NOT NULL,
  empresa VARCHAR(200) NOT NULL,
  usuario VARCHAR(100) NOT NULL,
  usuario_id INT DEFAULT 1,
  canal ENUM('Llamada', 'Correo', 'WhatsApp', 'Reunión', 'Nota') NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  resultado ENUM('Exitoso', 'Sin respuesta', 'Ocupado', 'Reagendado', 'Interesado', 'Rechazado') NOT NULL,
  observaciones TEXT NOT NULL,
  proxima_accion VARCHAR(255) DEFAULT '',
  fecha_proximo_seguimiento DATETIME NULL,
  FOREIGN KEY (prospecto_id) REFERENCES prospectos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: auditoria (Inmutable)
CREATE TABLE IF NOT EXISTS auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  usuario_id INT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  accion ENUM('Inicio de Sesión', 'Cierre de Sesión', 'Creación', 'Edición', 'Eliminación', 'Importación', 'Exportación', 'Cambio de Contraseña', 'Restablecimiento') NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  registro_afectado VARCHAR(255) NOT NULL,
  detalles TEXT NOT NULL,
  ip VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Flujo de Importación Inteligente

```
[ Archivo Excel (.xlsx) / CSV ]
                 |
                 v
   [ 1. Carga & Decodificación ] ---> Lectura en memoria con SheetJS
                 |
                 v
   [ 2. Mapeo Heurístico ]      ---> Identificación de columnas oficiales:
                                     - Razón Social / Empresa
                                     - Contacto Principal
                                     - Teléfono / Celular / WhatsApp
                                     - Correo Electrónico
                                     - Naturaleza del Negocio
                                     - POS Digital / Facturación Electrónica
                                     - Módulos de Interés
                 |
                 v
   [ 3. Deduplicación ]         ---> Búsqueda cruzada por RNC, Teléfono o Correo
                 |
         +-------+-------+
         |               |
     [ Existe ]      [ Nuevo ]
         |               |
   Actualiza datos   Crea Empresa +
   y observaciones   Contacto + Prospecto
         |               |
         +-------+-------+
                 |
                 v
   [ 4. Inserción & Auditoría ]  ---> Graba en disco y registra en bitácora
```

---

## 6. Flujo del Pipeline Comercial

```
[ 1. Contacto ] -------> [ 2. Interesado ] -------> [ 3. Propuesta Enviada ]
 (Captación inicial)    (Demostración técnica)     (Cotización formal)
        |                       |                         |
        |                       |                         +-----> [ 4. Ganado ] (Cierre)
        |                       |                         |
        +-----------------------+-------------------------+-----> [ 5. Perdido ] (Motivo)
                                |
                                v
               [ Motor de Alertas Comerciales ]
                - 3 Días: Seguimiento Preventivo
                - 5 Días: Contacto Recomendado
                - 7 Días: Alerta de Inactividad Alta
                - 15 Días: Urgencia Máxima Comercial
```

### Cálculo Automático Comercial por Módulo:
$$\text{Total Mensual} = \text{Costo Base (Plan)} + \sum (\text{Usuarios por Módulo} \times \text{Tarifa Unitario})$$
$$\text{Proyección Anual} = \text{Total Mensual} \times 12$$

---

## 7. Instrucciones para Ejecución en Visual Studio Code

1. **Abrir el proyecto en VS Code:**
   ```bash
   cd vscode-crmcomercial
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar el servidor local (Acceso multi-dispositivo en red LAN):**
   ```bash
   npm start
   # o: node server.js
   ```
4. **Abrir en navegador:**
   - En la misma computadora: `http://localhost:3000`
   - Desde celular o tablet en la misma red Wi-Fi: `http://[IP-DE-TU-PC]:3000`
5. **Migración a MySQL:**
   ```bash
   npm run migrate:mysql
   ```
