# GUÍA COMPLETA DE INSTALACIÓN Y EJECUCIÓN EN VISUAL STUDIO CODE
## CRMComercial - Sistema Empresarial para IB SYSTEM S.R.L.
**Proyecto de Posgrado | Autora: Ing. Yenifer Reina Sena Suero**

Esta guía detalla, paso a paso y sin omitir comandos ni configuraciones, cómo cualquier integrante del equipo de trabajo o evaluador académico puede clonar, instalar, configurar y ejecutar la plataforma **CRMComercial** en su entorno local desde cero utilizando **Visual Studio Code**, **Node.js 20+**, **Express.js** y **MySQL 8.0 / MariaDB**.

---

## 1. Instalación de Node.js (Entorno de Ejecución)
1. Ingrese al portal oficial de Node.js: **https://nodejs.org/**
2. Descargue la versión **LTS (Long Term Support)** recomendada (v20.x o v22.x).
3. Ejecute el instalador `.msi` (en Windows) o `.pkg` (en macOS) aceptando los términos y asegurándose de marcar la casilla *"Automatically install the necessary tools / Add to PATH"*.
4. Abra una terminal en Visual Studio Code (`Ctrl + ñ` o `Terminal -> New Terminal`) y verifique la instalación ejecutando:
   ```bash
   node -v
   npm -v
   ```
   *Debe responder con una versión superior a `v18.0.0` y `npm 9.0.0`.*

---

## 2. Instalación y Configuración de MySQL Server 8.0
Puede utilizar cualquier distribución de MySQL:
- **Opción A (Recomendada para Desarrollo):** Instalar **XAMPP** (incluye MariaDB/MySQL y phpMyAdmin) desde https://www.apachefriends.org/.
- **Opción B (Servidor Nativo):** Instalar **MySQL Installer Community 8.0** desde https://dev.mysql.com/downloads/installer/ seleccionando *MySQL Server* y *MySQL Workbench*.

### Iniciar el Servicio MySQL:
- En **XAMPP Control Panel**: Clic en el botón **Start** al lado del módulo `MySQL` (debe ponerse en color verde en el puerto `3306`).
- En **Windows Services**: Ejecutar `services.msc` y comprobar que el servicio `MySQL80` esté en estado *En ejecución*.

---

## 3. Configuración del Archivo de Entorno (`.env`)
En la carpeta del proyecto (`vscode-crmcomercial/`):
1. Verifique o copie el archivo `.env.example` creando un nuevo archivo llamado `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abra el archivo `.env` en Visual Studio Code y configure las credenciales según su instalación local de MySQL:
   ```ini
   # Configuración de Red
   PORT=3000
   NODE_ENV=development

   # Parámetros de Conexión MySQL 8.0
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=crmcomercial_ibsystem
   ```
   *(Nota: Si su usuario `root` de MySQL tiene contraseña asignada durante la instalación, indíquela en `DB_PASSWORD=su_password`).*

---

## 4. Creación de la Base de Datos Relacional
Abra su gestor de base de datos preferido (**MySQL Workbench**, **phpMyAdmin** en `http://localhost/phpmyadmin` o la terminal MySQL) y ejecute la instrucción de creación:

```sql
CREATE DATABASE IF NOT EXISTS `crmcomercial_ibsystem` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

---

## 5. Ejecución del Script Relacional (`schema.sql`)
El archivo `database/schema.sql` contiene la estructura completa DDL de las 13 tablas, claves primarias, claves foráneas, restricciones de integridad e inserciones iniciales (seed data).

### Desde la Terminal (Línea de Comandos):
```bash
mysql -u root -p crmcomercial_ibsystem < database/schema.sql
```
*(Si no tiene contraseña, simplemente presione `Enter` cuando solicite el password).*

### O desde phpMyAdmin / MySQL Workbench:
1. Abra `http://localhost/phpmyadmin` o MySQL Workbench.
2. Seleccione la base de datos `crmcomercial_ibsystem`.
3. Vaya a la pestaña **Importar** (o abra el archivo `database/schema.sql` en una pestaña SQL).
4. Ejecute el script.
5. Verifique que se hayan creado exitosamente las 13 tablas:
   - `usuarios`
   - `roles`
   - `empresas`
   - `contactos`
   - `prospectos`
   - `oportunidades`
   - `seguimientos`
   - `tareas`
   - `etiquetas`
   - `importaciones`
   - `exportaciones`
   - `auditoria`
   - `notificaciones`

---

## 6. Instalación de Dependencias del Proyecto (`npm install`)
En Visual Studio Code, abra la carpeta del proyecto y en la terminal integrada ejecute:
```bash
npm install
```
Este comando instalará las dependencias oficiales declaradas en `package.json`:
- `express` (^4.21.2): Servidor web corporativo y API REST.
- `mysql2` (^3.11.5): Conector de alto rendimiento nativo para MySQL con soporte de Pool y Promises.
- `cors` (^2.8.5): Habilitación de peticiones de origen cruzado.

---

## 7. Inicio del Sistema con `npm start`
Para poner en marcha la aplicación con el comando estándar de producción:
```bash
npm start
```
La terminal mostrará el siguiente banner técnico de inicio:
```
================================================================
 CRMComercial - IB SYSTEM S.R.L. (Proyecto de Posgrado)
 Servidor Express activo en: http://localhost:3000
 Base de Datos: MySQL 8.0 Conectado en localhost:3306/crmcomercial_ibsystem
 Frontend: HTML5, CSS3, JavaScript Puro (Vanilla)
================================================================
```

---

## 8. Ejecución Alternativa con `node server.js`
También puede iniciar directamente el servidor Node.js sin intermediarios ejecutando:
```bash
node server.js
```
Ambos métodos (`npm start` y `node server.js`) levantan el servidor Express en el puerto 3000 y conectan el pool de MySQL.

---

## 9. Acceso a la Plataforma Web
Abra su navegador web favorito (Google Chrome, Microsoft Edge, Mozilla Firefox) y diríjase a:
```
http://localhost:3000
```

### Credenciales Oficiales de Acceso Preconfiguradas:
| Rol | Usuario | Contraseña | Nombre Completo |
|---|---|---|---|
| **Administrador General** | `yenifer.sena` | `Admin123*` | Yenifer Reina Sena Suero |
| **Ejecutivo Comercial** | `felix.robles` | `Felix2026*` | Felix Manuel Robles |
| **Supervisor Comercial** | `armando.montes` | `Armando2026*` | Armando Montes de Oca Hesni |
| **Analista Comercial** | `ana.alcantara` | `Ana2026*` | Ana Julia Alcántara |

---

## 10. Verificación de Persistencia Real (Prueba de Supervivencia)
Para validar que los datos no son efímeros ni en memoria:
1. Inicie sesión como `yenifer.sena`.
2. Vaya al módulo **Empresas** y cree una nueva empresa (ej. *"Consorcio Comercial Quisqueyano"*).
3. Vaya a **Pipeline Comercial** y registre una nueva oportunidad seleccionando el plan **PYME** y agregando módulos.
4. Detenga el servidor en la terminal presionando `Ctrl + C`.
5. Reinicie el servidor con `npm start`.
6. Refresque el navegador o ábralo en una ventana de incógnito:
   - **Resultado comprobable:** Todos los registros, notas, cálculos y auditorías permanecen intactos guardados en MySQL.
