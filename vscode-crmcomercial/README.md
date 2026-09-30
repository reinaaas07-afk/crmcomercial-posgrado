# CRMComercial - IB SYSTEM S.R.L.
### Sistema Empresarial para la Gestión y Seguimiento de Prospectos
**Proyecto de Posgrado** | Desarrollado para: **IB SYSTEM S.R.L.**  
**Autora:** Ing. Yenifer Reina Sena Suero  

---

## 1. Arquitectura Tecnológica Oficial

El sistema está desarrollado bajo los requerimientos estrictos de ingeniería de software corporativa:

- **Frontend:** HTML5, CSS3 moderno (diseño responsivo oscuro empresarial), JavaScript Puro (ES6+ Vanilla, sin frameworks).
- **Backend:** Node.js, Express.js (Servidor RESTful).
- **Base de Datos:** MySQL 8.0 / MariaDB 10.5+ con motor transaccional InnoDB y llaves foráneas.
- **Entorno de Desarrollo:** Visual Studio Code.
- **Control de Versiones:** Preparado para repositorio Git / GitHub.

---

## 2. Estructura del Proyecto (Visual Studio Code)

```text
vscode-crmcomercial/
├── database/
│   ├── schema.sql             # Script DDL completo de MySQL 8.0 y datos semilla (Seed Data)
│   ├── db.js                  # Conector de base de datos con soporte MySQL y fallback local
│   └── seedData.json          # Datos corporativos iniciales (empresas, contactos, prospectos)
├── public/
│   ├── css/
│   │   └── styles.css         # Hoja de estilos corporativos CSS3
│   ├── js/
│   │   └── app.js             # Lógica cliente pura (Vanilla JS) y comunicación REST
│   └── index.html             # Pantalla de acceso profesional (Login) y módulos del CRM
├── .env.example               # Variables de entorno de muestra
├── package.json               # Dependencias del servidor Node.js (express, mysql2, cors)
├── server.js                  # Servidor Express.js y API RESTful
└── README.md                  # Manual técnico y guía de despliegue
```

---

## 3. Instrucciones de Ejecución en Visual Studio Code

### Paso 1: Abrir la carpeta en Visual Studio Code
1. Abre **Visual Studio Code**.
2. Selecciona **File > Open Folder...** y elige la carpeta `vscode-crmcomercial`.

### Paso 2: Configurar la Base de Datos MySQL
1. Abre tu gestor MySQL favorito (**MySQL Workbench**, **phpMyAdmin**, o la terminal MySQL).
2. Ejecuta el archivo SQL ubicado en `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *Esto creará la base de datos `crmcomercial_ibsystem` con todas sus tablas, restricciones y datos iniciales.*

### Paso 3: Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Asegúrate de que los datos de conexión coincidan con tu MySQL local:
```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=crmcomercial_ibsystem
DB_PORT=3306
```

### Paso 4: Instalar Dependencias y Arrancar el Servidor
Abre la terminal integrada en VS Code (`Ctrl + ~`) y ejecuta:
```bash
npm install
npm start
```
*O también directamente:*
```bash
node server.js
```

### Paso 5: Abrir en el Navegador
Abre tu navegador en:
```text
http://localhost:3000
```

---

## 4. Usuarios Iniciales y Credenciales de Acceso

| Nombre Completo | Rol Asignado | Usuario | Contraseña |
| :--- | :--- | :--- | :--- |
| **Yenifer Reina Sena Suero** | Administrador General | `yenifer.sena` | `Admin123*` |
| **Felix Manuel Robles** | Ejecutivo Comercial | `felix.robles` | `Felix2026*` |
| **Armando Montes de Oca Hesni** | Supervisor Comercial | `armando.montes` | `Armando2026*` |
| **Ana Julia Alcántara** | Analista Comercial | `ana.alcantara` | `Ana2026*` |

---

## 5. Módulos Implementados

1. **Pantalla de Acceso (Login):** Autenticación estricta con control de sesiones, expiración y recuperación de contraseñas.
2. **Dashboard:** Métricas comerciales clave (Total prospectos, Ganados, Tasa de conversión %, Valor de pipeline en US$, y actividad reciente).
3. **Módulo de Empresas:** Razón social, RNC oficial dominicano, teléfono, correo, industria y relación directa con prospectos y contactos.
4. **Directorio de Contactos:** Información de decisores, teléfonos, enlaces directos a WhatsApp y cargos comerciales.
5. **Pipeline Comercial (Kanban):** Etapas oficiales: *Contacto, Interesado, Propuesta Enviada, Ganado, Perdido*. Incluye cálculo automático de costos según plan (Básico, PYME, Empresarial, Corporativo) y módulos seleccionados (Inventario, Ventas, Caja, etc.).
6. **Seguimiento con Alerta de 7 Días:** Registro de llamadas, WhatsApp, reuniones y notas. El sistema detecta y alerta automáticamente prospectos sin seguimiento por más de 7 días con la etiqueta *"Seguimiento pendiente"*.
7. **Historial y Comentarios:** Pestaña de notas con adjuntos (PDF, Excel, Word, imágenes) y auditoría de qué cambió, quién lo cambió, fecha y hora.
8. **Tareas:** Tareas operativas con fecha límite, prioridad (Alta, Media, Baja) y estado.
9. **Metas Comerciales:** Objetivos individuales mensuales, trimestrales y anuales con barras de progreso de cumplimiento.
10. **Auditoría Completa:** Registro inmutable de inicios de sesión, cierres de sesión, altas, bajas, modificaciones, importaciones e IP de cada usuario.
11. **Importación Excel/CSV:** Carga masiva con mapeo automático de columnas y deduplicación por correo o nombre de empresa.
12. **Exportación:** Generación instantánea de archivos Excel/CSV para Empresas, Contactos, Pipeline y Auditoría.
13. **Gestión de Usuarios:** Exclusivo para el Administrador General (Yenifer Sena) para crear, editar o desactivar cuentas.
