/**
 * CRMComercial - Servidor Empresarial Backend
 * Desarrollado para IB SYSTEM S.R.L. - Proyecto de Posgrado
 * 
 * Tecnologías: Node.js, Express.js, MySQL 8.0
 * Ejecución en Visual Studio Code:
 * 1. npm install
 * 2. npm start
 */
const express = require('express');
let cors;
try {
  cors = require('cors');
} catch (e) {
  cors = () => (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  };
}
const path = require('path');
const fs = require('fs');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper de IP
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '190.166.45.12';
}

// Helper Auditoría
function logAudit(usuario, accion, modulo, registro, detalles, ip, usuarioId = null) {
  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const hora = now.toTimeString().slice(0, 8);

  const newLog = {
    id: Date.now(),
    usuario,
    usuario_id: usuarioId,
    fecha,
    hora,
    accion,
    modulo,
    registro_afectado: registro,
    detalles,
    ip: ip || '127.0.0.1'
  };

  if (typeof db.saveAuditoria === 'function') {
    db.saveAuditoria(newLog);
  } else {
    const data = db.getLocalData();
    data.auditoria.unshift(newLog);
    if (data.auditoria.length > 2000) data.auditoria.pop();
    db.saveLocalData(data);
  }
}

// Helper Notificación
function createNotification(titulo, mensaje, usuario, tipo = 'nuevo_prospecto') {
  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const hora = now.toTimeString().slice(0, 5);

  const notif = {
    id: Date.now(),
    titulo,
    mensaje,
    usuario,
    fecha,
    hora,
    leida: false,
    tipo
  };

  if (typeof db.saveNotificacion === 'function') {
    db.saveNotificacion(notif);
  } else {
    const data = db.getLocalData();
    data.notificaciones.unshift(notif);
    db.saveLocalData(data);
  }
}

// --------------------------------------------------------------------
// RUTAS DE LA API
// --------------------------------------------------------------------

// 1. Estado del Servidor y Base de Datos
app.get('/api/status', (req, res) => {
  res.json({
    sistema: 'CRMComercial - IB SYSTEM S.R.L.',
    entorno: 'Node.js + Express',
    motor_bd: db.isUsingMySQL() ? 'MySQL 8.0 Conectado' : 'Almacenamiento Persistente Local (JSON Engine Activo)',
    version: '1.0.0 Pro',
    tiempo: new Date().toISOString()
  });
});

// 2. Base de Datos Completa
app.get('/api/db/all', async (req, res) => {
  const data = typeof db.getAllData === 'function' ? await db.getAllData() : db.getLocalData();
  res.json(data);
});

// 3. Autenticación: Login (Prioridad #1: Cada usuario con credencial propia, sin bypass)
app.post('/api/auth/login', (req, res) => {
  const { usuario, password } = req.body;
  const ip = getClientIp(req);
  const data = db.getLocalData();

  const user = data.usuarios.find(
    (u) =>
      (u.usuario.toLowerCase() === (usuario || '').trim().toLowerCase() ||
        u.email.toLowerCase() === (usuario || '').trim().toLowerCase()) &&
      u.password_hash === password
  );

  if (!user) {
    logAudit(usuario || 'Desconocido', 'Inicio de Sesión', 'Seguridad', `Acceso fallido: ${usuario}`, 'Credenciales inválidas', ip);
    return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
  }

  if (!user.activo) {
    return res.status(403).json({ success: false, error: 'Usuario desactivado. Contacte al Administrador General.' });
  }

  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;
  user.ultimo_acceso = timestamp;
  user.en_linea = true;

  logAudit(user.nombre, 'Inicio de Sesión', 'Seguridad', `Sesión iniciada (${user.usuario})`, `Acceso con rol: ${user.rol}`, ip, user.id);
  db.saveLocalData(data);

  res.json({
    success: true,
    user,
    token: `token_${user.id}_${Date.now()}`
  });
});

// 4. Autenticación: Logout (Prioridad #1: Registro inmutable de fecha, hora e IP)
app.post('/api/auth/logout', (req, res) => {
  const { usuario_id, usuario } = req.body;
  const ip = getClientIp(req);
  const data = db.getLocalData();

  const user = data.usuarios.find((u) => u.id === Number(usuario_id) || u.usuario === usuario);
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;

  if (user) {
    user.en_linea = false;
    user.ultimo_cierre = timestamp;
    logAudit(user.nombre, 'Cierre de Sesión', 'Seguridad', `Sesión cerrada (${user.usuario})`, `Salida a las ${timestamp}`, ip, user.id);
    db.saveLocalData(data);
  }

  res.json({ success: true, message: 'Sesión finalizada exitosamente.' });
});

// 5. Autenticación: Recuperar Contraseña
app.post('/api/auth/recuperar', (req, res) => {
  const { email } = req.body;
  const ip = getClientIp(req);
  const data = db.getLocalData();

  const user = data.usuarios.find((u) => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, error: 'Correo institucional no registrado.' });
  }

  logAudit(user.nombre, 'Restablecimiento', 'Seguridad', user.email, 'Solicitó recuperación de credenciales.', ip, user.id);

  res.json({
    success: true,
    message: `Credenciales verificadas. Tu usuario es: ${user.usuario}`,
    usuario: user.usuario
  });
});

// 5.1 CRUD de Usuarios y Control de Acceso (Prioridad #1: Administrador General)
app.get('/api/usuarios', (req, res) => {
  const data = db.getLocalData();
  // Enviar usuarios sin exponer hash en listado si se desea, pero manteniendo soporte
  res.json(data.usuarios || []);
});

app.post('/api/usuarios', (req, res) => {
  const data = db.getLocalData();
  const ip = getClientIp(req);

  const { nombre, apellido, email, usuario, password_hash, rol, telefono, autor } = req.body;

  if (!nombre || !usuario || !email || !password_hash) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
  }

  // Verificar si ya existe usuario o email
  const existing = data.usuarios.find(
    (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: 'El nombre de usuario o correo ya está en uso por otro miembro del equipo.' });
  }

  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;

  const nuevoUsuario = {
    id: Date.now(),
    nombre: nombre.trim(),
    apellido: (apellido || '').trim(),
    email: email.trim().toLowerCase(),
    usuario: usuario.trim(),
    password_hash: password_hash.trim(),
    rol: rol || 'Ejecutivo Comercial',
    telefono: telefono || '+1 809-000-0000',
    activo: true,
    empresa: 'IB SYSTEM S.R.L.',
    subcuenta: 'Sede Principal Santo Domingo',
    fecha_creacion: timestamp,
    ultimo_acceso: null,
    ultimo_cierre: null
  };

  data.usuarios.push(nuevoUsuario);
  logAudit(autor || 'Administrador General', 'Creación', 'Usuarios', nuevoUsuario.nombre, `Creó usuario ${nuevoUsuario.usuario} con rol ${nuevoUsuario.rol}`, ip);
  db.saveLocalData(data);

  res.status(201).json(nuevoUsuario);
});

app.put('/api/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const idx = data.usuarios.findIndex((u) => u.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

  const old = data.usuarios[idx];
  const { nombre, apellido, email, rol, telefono, activo, autor, password_hash } = req.body;

  data.usuarios[idx] = {
    ...old,
    nombre: nombre !== undefined ? nombre.trim() : old.nombre,
    apellido: apellido !== undefined ? apellido.trim() : old.apellido,
    email: email !== undefined ? email.trim().toLowerCase() : old.email,
    rol: rol !== undefined ? rol : old.rol,
    telefono: telefono !== undefined ? telefono : old.telefono,
    activo: activo !== undefined ? Boolean(activo) : old.activo,
    password_hash: password_hash ? password_hash.trim() : old.password_hash
  };

  logAudit(autor || 'Administrador General', 'Edición', 'Usuarios', data.usuarios[idx].nombre, `Actualizó datos y rol (${data.usuarios[idx].rol})`, ip);
  db.saveLocalData(data);

  res.json(data.usuarios[idx]);
});

app.post('/api/usuarios/:id/reset-password', (req, res) => {
  const id = Number(req.params.id);
  const { nueva_password, autor } = req.body;
  const ip = getClientIp(req);
  const data = db.getLocalData();
  const user = data.usuarios.find((u) => u.id === id);

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (!nueva_password || nueva_password.trim().length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  user.password_hash = nueva_password.trim();
  logAudit(autor || 'Administrador General', 'Seguridad', 'Usuarios', user.nombre, `Restableció contraseña para el usuario ${user.usuario}`, ip);
  db.saveLocalData(data);

  res.json({ success: true, message: `Contraseña actualizada exitosamente para ${user.usuario}.` });
});

app.delete('/api/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const user = data.usuarios.find((u) => u.id === id);

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (user.rol === 'Administrador General' && user.id === 1) {
    return res.status(403).json({ error: 'No es posible eliminar al Administrador General principal del sistema.' });
  }

  data.usuarios = data.usuarios.filter((u) => u.id !== id);
  logAudit(req.query.autor || 'Administrador General', 'Eliminación', 'Usuarios', user.nombre, `Eliminó cuenta de usuario ${user.usuario}`, ip);
  db.saveLocalData(data);

  res.json({ success: true, message: 'Usuario eliminado exitosamente.' });
});

app.get('/api/usuarios/:id/actividad', (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const user = data.usuarios.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const logs = (data.auditoria || []).filter(
    (a) => a.usuario.toLowerCase().includes(user.usuario.toLowerCase()) || a.usuario.toLowerCase().includes(user.nombre.toLowerCase())
  );
  res.json(logs);
});

// Endpoint de Información del Sistema y Red (Prioridad #2: Multi-dispositivo)
app.get('/api/system/info', (req, res) => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }

  const data = db.getLocalData();

  res.json({
    nombre_empresa: 'IB SYSTEM S.R.L.',
    rnc: '1-30-88452-1',
    producto_crm: 'CRMComercial',
    puerto: PORT,
    local_ip: localIp,
    localhost_url: `http://localhost:${PORT}`,
    network_url: `http://${localIp}:${PORT}`,
    motor_db: db.isUsingMySQL() ? 'MySQL 8.0 Conectado' : 'Motor JSON Persistente Activo',
    version: '2.5.0-Produccion',
    stats: {
      usuarios: (data.usuarios || []).length,
      empresas: (data.empresas || []).length,
      contactos: (data.contactos || []).length,
      prospectos: (data.prospectos || []).length,
      seguimientos: (data.seguimientos || []).length,
      tareas: (data.tareas || []).length,
      auditoria: (data.auditoria || []).length
    }
  });
});

// 6. CRUD: Empresas
app.get('/api/empresas', (req, res) => {
  const data = db.getLocalData();
  res.json(data.empresas);
});

app.post('/api/empresas', async (req, res) => {
  const data = db.getLocalData();
  const ip = getClientIp(req);

  const nueva = {
    id: Date.now(),
    razon_social: req.body.razon_social,
    nombre_comercial: req.body.nombre_comercial || req.body.razon_social,
    rnc: req.body.rnc || 'Pendiente',
    direccion: req.body.direccion || '',
    ciudad: req.body.ciudad || 'Santo Domingo',
    provincia: req.body.provincia || 'Distrito Nacional',
    telefono: req.body.telefono || '',
    correo: req.body.correo || '',
    sitio_web: req.body.sitio_web || '',
    industria: req.body.industria || 'General',
    cantidad_empleados: req.body.cantidad_empleados || '1-10',
    responsable_comercial: req.body.responsable_comercial || 'Yenifer Reina Sena Suero',
    usuario_id: req.body.usuario_id || 1,
    estado_comercial: req.body.estado_comercial || 'Prospecto',
    fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  if (typeof db.saveEmpresa === 'function') {
    await db.saveEmpresa(nueva);
  } else {
    data.empresas.unshift(nueva);
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || 'Administrador', 'Creación', 'Empresas', nueva.razon_social, `Creó empresa RNC: ${nueva.rnc}`, ip);
  createNotification('Nueva Empresa Registrada', `${nueva.razon_social} fue añadida al CRM.`, req.body.autor || 'Sistema', 'nuevo_prospecto');

  res.status(201).json(nueva);
});

app.put('/api/empresas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const idx = data.empresas.findIndex((e) => e.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Empresa no encontrada' });

  const updated = { ...data.empresas[idx], ...req.body, id };
  if (typeof db.saveEmpresa === 'function') {
    await db.saveEmpresa(updated);
  } else {
    data.empresas[idx] = updated;
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || 'Administrador', 'Edición', 'Empresas', updated.razon_social, 'Actualizó datos corporativos', ip);

  res.json(updated);
});

app.delete('/api/empresas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const comp = data.empresas.find((e) => e.id === id);

  if (!comp) return res.status(404).json({ error: 'Empresa no encontrada' });

  if (typeof db.deleteEmpresa === 'function') {
    await db.deleteEmpresa(id);
  } else {
    data.empresas = data.empresas.filter((e) => e.id !== id);
    db.saveLocalData(data);
  }
  logAudit(req.query.autor || 'Administrador', 'Eliminación', 'Empresas', comp.razon_social, 'Eliminó registro de empresa', ip);

  res.json({ success: true, message: 'Empresa eliminada' });
});

// 7. CRUD: Contactos
app.get('/api/contactos', (req, res) => {
  const data = db.getLocalData();
  res.json(data.contactos);
});

app.post('/api/contactos', async (req, res) => {
  const data = db.getLocalData();
  const ip = getClientIp(req);

  let empresaId = req.body.empresa_id ? Number(req.body.empresa_id) : null;
  let empresaNombre = (req.body.empresa || '').trim();

  // Si tenemos empresaId pero no nombre, resolver de empresas
  if (empresaId && !empresaNombre) {
    const comp = data.empresas.find((e) => e.id === empresaId);
    if (comp) empresaNombre = comp.razon_social;
  }
  // Si tenemos nombre de empresa pero no empresaId, resolver o crear enlace
  if (!empresaId && empresaNombre) {
    const comp = data.empresas.find((e) => e.razon_social.toLowerCase() === empresaNombre.toLowerCase());
    if (comp) empresaId = comp.id;
  }

  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre,
    apellido: req.body.apellido || '',
    empresa_id: empresaId,
    empresa: empresaNombre || 'Empresa Dominicana',
    cargo: req.body.cargo || 'Contacto Comercial',
    telefono: req.body.telefono || '',
    whatsapp: req.body.whatsapp || req.body.telefono || '',
    correo: req.body.correo || '',
    direccion: req.body.direccion || '',
    ciudad: req.body.ciudad || 'Santo Domingo',
    provincia: req.body.provincia || 'Distrito Nacional',
    naturaleza_negocio: req.body.naturaleza_negocio || 'Comercial',
    estado_comercial: req.body.estado_comercial || 'Prospecto',
    producto_interes: req.body.producto_interes || 'Facturación Electrónica',
    modulo_principal: req.body.modulo_principal || 'Ventas',
    responsable_comercial: req.body.responsable_comercial || 'Yenifer Reina Sena Suero',
    usuario_id: req.body.usuario_id || 1,
    ultimo_contacto: new Date().toISOString().replace('T', ' ').slice(0, 19),
    proximo_seguimiento: req.body.proximo_seguimiento || '',
    notas: req.body.notas || '',
    observaciones_comerciales: req.body.observaciones_comerciales || '',
    etiquetas: req.body.etiquetas || 'Prospecto',
    fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  if (typeof db.saveContacto === 'function') {
    await db.saveContacto(nuevo);
  } else {
    data.contactos.unshift(nuevo);
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || 'Administrador', 'Creación', 'Contactos', `${nuevo.nombre} ${nuevo.apellido}`, `Contacto registrado en ${nuevo.empresa} (Empresa ID: ${empresaId || 'N/A'})`, ip);
  createNotification('Nuevo Contacto Creado', `${nuevo.nombre} ${nuevo.apellido} registrado en ${nuevo.empresa}.`, req.body.autor || 'Sistema', 'contacto_actualizado');

  res.status(201).json(nuevo);
});

app.put('/api/contactos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const idx = data.contactos.findIndex((c) => c.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Contacto no encontrado' });

  const updated = { ...data.contactos[idx], ...req.body, id };
  if (typeof db.saveContacto === 'function') {
    await db.saveContacto(updated);
  } else {
    data.contactos[idx] = updated;
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || 'Administrador', 'Edición', 'Contactos', `${updated.nombre} ${updated.apellido}`, 'Actualizó datos de contacto', ip);

  res.json(updated);
});

app.delete('/api/contactos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const cont = data.contactos.find((c) => c.id === id);

  if (!cont) return res.status(404).json({ error: 'Contacto no encontrado' });

  if (typeof db.deleteContacto === 'function') {
    await db.deleteContacto(id);
  } else {
    data.contactos = data.contactos.filter((c) => c.id !== id);
    db.saveLocalData(data);
  }
  logAudit(req.query.autor || 'Administrador', 'Eliminación', 'Contactos', `${cont.nombre} ${cont.apellido}`, 'Eliminó contacto', ip);

  res.json({ success: true });
});

// 7.1 Acciones Masivas en Contactos (Prioridad #8)
app.post('/api/contactos/bulk-action', (req, res) => {
  const { ids, accion, valor, autor } = req.body;
  const ip = getClientIp(req);
  const data = db.getLocalData();

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No se enviaron IDs de contactos.' });
  }

  let modificados = 0;

  if (accion === 'asignar_responsable') {
    data.contactos.forEach((c) => {
      if (ids.includes(c.id)) {
        c.responsable_comercial = valor;
        modificados++;
      }
    });
    logAudit(autor || 'Administrador', 'Edición', 'Contactos', `Lote (${modificados} contactos)`, `Asignó responsable comercial: ${valor}`, ip);
  } else if (accion === 'asignar_etiqueta') {
    data.contactos.forEach((c) => {
      if (ids.includes(c.id)) {
        const currentTags = (c.etiquetas || '').split(',').map((t) => t.trim()).filter(Boolean);
        if (!currentTags.includes(valor)) {
          currentTags.push(valor);
          c.etiquetas = currentTags.join(', ');
          modificados++;
        }
      }
    });
    logAudit(autor || 'Administrador', 'Edición', 'Contactos', `Lote (${modificados} contactos)`, `Agregó etiqueta: ${valor}`, ip);
  } else if (accion === 'cambiar_estado') {
    data.contactos.forEach((c) => {
      if (ids.includes(c.id)) {
        c.estado_comercial = valor;
        modificados++;
      }
    });
    logAudit(autor || 'Administrador', 'Edición', 'Contactos', `Lote (${modificados} contactos)`, `Cambió estado comercial a: ${valor}`, ip);
  } else if (accion === 'eliminar') {
    data.contactos = data.contactos.filter((c) => !ids.includes(c.id));
    modificados = ids.length;
    logAudit(autor || 'Administrador', 'Eliminación', 'Contactos', `Lote (${modificados} contactos)`, `Eliminación masiva de contactos`, ip);
  }

  db.saveLocalData(data);
  res.json({ success: true, modificados, total: ids.length });
});

// 8. CRUD: Pipeline / Prospectos
app.get('/api/prospectos', (req, res) => {
  const data = db.getLocalData();
  res.json(data.prospectos);
});

app.post('/api/prospectos', async (req, res) => {
  const data = db.getLocalData();
  const ip = getClientIp(req);

  // Cálculo automático de costos
  const plan = req.body.plan_seleccionado || 'PYME';
  const planCostos = { 'Básico': 25, 'PYME': 45, 'Empresarial': 80, 'Corporativo': 120 };
  const costo_base = planCostos[plan] || 45;
  const modulos = req.body.modulos_adicionales || [];
  const costo_adicional = modulos.length * 8;
  const costo_mensual = costo_base + costo_adicional;
  const valor_estimado = costo_mensual * 12;

  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre || req.body.empresa,
    empresa: req.body.empresa,
    contacto_principal: req.body.contacto_principal || 'Contacto Principal',
    telefono: req.body.telefono || '',
    whatsapp: req.body.whatsapp || req.body.telefono || '',
    correo: req.body.correo || '',
    canal_captacion: req.body.canal_captacion || 'Prospección Directa',
    producto_principal: req.body.producto_principal || 'Facturación Electrónica',
    plan_seleccionado: plan,
    costo_base,
    modulos_adicionales: modulos,
    costo_adicional,
    costo_mensual,
    valor_estimado,
    cantidad_usuarios: req.body.cantidad_usuarios || 3,
    responsable_comercial: req.body.responsable_comercial || 'Yenifer Reina Sena Suero',
    usuario_id: req.body.usuario_id || 1,
    etapa: req.body.etapa || 'Contacto',
    fecha_primer_contacto: new Date().toISOString().split('T')[0],
    ultima_actividad: new Date().toISOString().replace('T', ' ').slice(0, 19),
    proximo_seguimiento: req.body.proximo_seguimiento || '',
    dias_sin_seguimiento: 0,
    observaciones: req.body.observaciones || '',
    etiquetas: req.body.etiquetas || 'Prospecto',
    fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  if (typeof db.saveProspecto === 'function') {
    await db.saveProspecto(nuevo);
  } else {
    data.prospectos.unshift(nuevo);
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || nuevo.responsable_comercial, 'Creación', 'Pipeline Comercial', nuevo.empresa, `Oportunidad creada: Plan ${nuevo.plan_seleccionado} ($${nuevo.costo_mensual}/mes)`, ip);
  createNotification('Nueva Oportunidad Comercial', `${nuevo.empresa} añadida en etapa "${nuevo.etapa}".`, req.body.autor || 'Sistema', 'nuevo_prospecto');

  res.status(201).json(nuevo);
});

app.put('/api/prospectos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const idx = data.prospectos.findIndex((p) => p.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Prospecto no encontrado' });

  const old = data.prospectos[idx];
  const updated = { ...old, ...req.body, id };

  // Recalcular si cambió de plan
  if (req.body.plan_seleccionado || req.body.modulos_adicionales) {
    const planCostos = { 'Básico': 25, 'PYME': 45, 'Empresarial': 80, 'Corporativo': 120 };
    updated.costo_base = planCostos[updated.plan_seleccionado] || 45;
    const modulos = updated.modulos_adicionales || [];
    updated.costo_adicional = modulos.length * 8;
    updated.costo_mensual = updated.costo_base + updated.costo_adicional;
    updated.valor_estimado = updated.costo_mensual * 12;
  }

  if (typeof db.saveProspecto === 'function') {
    await db.saveProspecto(updated);
  } else {
    data.prospectos[idx] = updated;
    db.saveLocalData(data);
  }

  const accionTexto = old.etapa !== updated.etapa ? `Movió etapa a "${updated.etapa}"` : 'Actualizó datos de la oportunidad';
  logAudit(req.body.autor || updated.responsable_comercial, 'Edición', 'Pipeline Comercial', updated.empresa, accionTexto, ip);

  if (old.etapa !== updated.etapa) {
    createNotification('Cambio de Etapa en Pipeline', `${updated.empresa} avanzó a "${updated.etapa}".`, req.body.autor || 'Sistema', 'cambio_etapa');
  }

  res.json(updated);
});

app.delete('/api/prospectos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const pros = data.prospectos.find((p) => p.id === id);

  if (!pros) return res.status(404).json({ error: 'Prospecto no encontrado' });

  if (typeof db.deleteProspecto === 'function') {
    await db.deleteProspecto(id);
  } else {
    data.prospectos = data.prospectos.filter((p) => p.id !== id);
    db.saveLocalData(data);
  }
  logAudit(req.query.autor || 'Administrador', 'Eliminación', 'Pipeline Comercial', pros.empresa, 'Eliminó oportunidad comercial', ip);

  res.json({ success: true });
});

// 9. CRUD: Seguimientos con Alerta de 7 Días
app.get('/api/seguimientos', (req, res) => {
  const data = db.getLocalData();
  res.json(data.seguimientos);
});

app.post('/api/seguimientos', async (req, res) => {
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const now = new Date();

  const nuevo = {
    id: Date.now(),
    prospecto_id: req.body.prospecto_id,
    empresa: req.body.empresa,
    usuario: req.body.usuario || 'Ejecutivo Comercial',
    usuario_id: req.body.usuario_id || 1,
    canal: req.body.canal || 'Llamada',
    fecha: req.body.fecha || now.toISOString().split('T')[0],
    hora: req.body.hora || now.toTimeString().slice(0, 5),
    resultado: req.body.resultado || 'Exitoso',
    observaciones: req.body.observaciones || '',
    proxima_accion: req.body.proxima_accion || '',
    fecha_proximo_seguimiento: req.body.fecha_proximo_seguimiento || ''
  };

  if (typeof db.saveSeguimiento === 'function') {
    await db.saveSeguimiento(nuevo);
  } else {
    data.seguimientos.unshift(nuevo);
    db.saveLocalData(data);
  }

  // Actualizar días sin seguimiento en prospecto
  const pIdx = (data.prospectos || []).findIndex((p) => p.id === Number(nuevo.prospecto_id));
  if (pIdx !== -1) {
    data.prospectos[pIdx].ultima_actividad = `${nuevo.fecha} ${nuevo.hora}:00`;
    data.prospectos[pIdx].dias_sin_seguimiento = 0;
    if (nuevo.fecha_proximo_seguimiento) {
      data.prospectos[pIdx].proximo_seguimiento = nuevo.fecha_proximo_seguimiento;
    }
    if (typeof db.saveProspecto === 'function') {
      await db.saveProspecto(data.prospectos[pIdx]);
    }
  }

  logAudit(nuevo.usuario, 'Creación', 'Seguimientos', nuevo.empresa, `Registró interacción ${nuevo.canal} (${nuevo.resultado})`, ip);

  res.status(201).json(nuevo);
});

// 10. CRUD: Tareas
app.get('/api/tareas', (req, res) => {
  const data = db.getLocalData();
  res.json(data.tareas);
});

app.post('/api/tareas', async (req, res) => {
  const data = db.getLocalData();
  const ip = getClientIp(req);

  const nueva = {
    id: Date.now(),
    titulo: req.body.titulo,
    descripcion: req.body.descripcion || '',
    asignado_a: req.body.asignado_a || 'Yenifer Reina Sena Suero',
    usuario_id: req.body.usuario_id || 1,
    fecha_limite: req.body.fecha_limite || new Date().toISOString().split('T')[0],
    prioridad: req.body.prioridad || 'Media',
    estado: req.body.estado || 'Pendiente',
    relacionado_tipo: req.body.relacionado_tipo || 'empresa',
    relacionado_id: req.body.relacionado_id || null,
    relacionado_nombre: req.body.relacionado_nombre || ''
  };

  if (typeof db.saveTarea === 'function') {
    await db.saveTarea(nueva);
  } else {
    data.tareas.unshift(nueva);
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || nueva.asignado_a, 'Creación', 'Tareas', nueva.titulo, `Asignada a ${nueva.asignado_a}`, ip);

  res.status(201).json(nueva);
});

app.put('/api/tareas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  const idx = data.tareas.findIndex((t) => t.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Tarea no encontrada' });

  const updated = { ...data.tareas[idx], ...req.body, id };
  if (typeof db.saveTarea === 'function') {
    await db.saveTarea(updated);
  } else {
    data.tareas[idx] = updated;
    db.saveLocalData(data);
  }
  logAudit(req.body.autor || data.tareas[idx].asignado_a, 'Edición', 'Tareas', data.tareas[idx].titulo, `Estado actualizado a "${data.tareas[idx].estado}"`, ip);

  res.json(updated);
});

app.delete('/api/tareas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const data = db.getLocalData();
  const ip = getClientIp(req);
  if (typeof db.deleteTarea === 'function') {
    await db.deleteTarea(id);
  } else {
    data.tareas = data.tareas.filter((t) => t.id !== id);
    db.saveLocalData(data);
  }
  logAudit(req.query.autor || 'Administrador', 'Eliminación', 'Tareas', `ID: ${id}`, 'Tarea eliminada', ip);
  res.json({ success: true });
});

// 11. Auditoría
app.get('/api/auditoria', (req, res) => {
  const data = db.getLocalData();
  res.json(data.auditoria);
});

// 12. Notificaciones
app.get('/api/notificaciones', (req, res) => {
  const data = db.getLocalData();
  res.json(data.notificaciones);
});

app.post('/api/notificaciones/mark-read', async (req, res) => {
  if (typeof db.markNotificacionesRead === 'function') {
    await db.markNotificacionesRead(req.body.usuario);
  } else {
    const data = db.getLocalData();
    data.notificaciones.forEach((n) => (n.leida = true));
    db.saveLocalData(data);
  }
  res.json({ success: true });
});

// 13. Metas Comerciales
app.get('/api/metas', (req, res) => {
  const data = db.getLocalData();
  res.json(data.metas_comerciales || []);
});

app.put('/api/metas/:usuarioId', async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  if (typeof db.updateMetasComerciales === 'function') {
    await db.updateMetasComerciales(usuarioId, req.body);
    const data = db.getLocalData();
    const updated = (data.metas_comerciales || []).find((m) => m.usuario_id === usuarioId);
    return res.json(updated || req.body);
  }
  const data = db.getLocalData();
  const idx = (data.metas_comerciales || []).findIndex((m) => m.usuario_id === usuarioId);

  if (idx !== -1) {
    data.metas_comerciales[idx] = { ...data.metas_comerciales[idx], ...req.body };
    db.saveLocalData(data);
    return res.json(data.metas_comerciales[idx]);
  }
  res.status(404).json({ error: 'Meta no encontrada' });
});

// 14. Importación Inteligente (Excel/CSV de IB SYSTEM)
app.post('/api/importar', (req, res) => {
  const { filas, autor } = req.body;
  const ip = getClientIp(req);
  const data = db.getLocalData();

  if (!Array.isArray(filas) || filas.length === 0) {
    return res.status(400).json({ error: 'No se enviaron filas para procesar.' });
  }

  let creados = 0;
  let actualizados = 0;

  filas.forEach((row, i) => {
    const empresa = (row.empresa || row['Empresa'] || '').trim();
    const contacto = (row.contacto_principal || row.contacto || row['Contacto'] || row.nombre || '').trim();
    const telefono = (row.telefono || row['Teléfono'] || '').trim();
    const correo = (row.correo || row['Correo'] || '').trim().toLowerCase();
    const estado = row.etapa || row.estado || row['Estado'] || 'Contacto';
    const naturaleza = row.naturaleza || row['Naturaleza de las operaciones'] || 'Comercial';
    const certificadoFE = row.certificado_fe || row['¿Certificado FE?'] || 'No';
    const posDigital = row.pos_digital || row['POS Digital'] || 'No';
    const otroSistema = row.otro_sistema || row['Otro sistema'] || 'Ninguno';
    const modulosRaw = row.modulos_interes || row.modulos || row['Módulos de interés'] || 'Inventario, Ventas';
    const modulos = Array.isArray(modulosRaw) ? modulosRaw : String(modulosRaw).split(',').map((s) => s.trim());
    const fechaContacto = row.fecha_primer_contacto || row['Fecha de contacto'] || new Date().toISOString().split('T')[0];
    const presentacionFE = row.presentacion_fe || row['Presentación FE'] || 'Pendiente';

    if (!empresa && !contacto) return;

    // Deduplicación en Prospectos
    const existIdx = data.prospectos.findIndex(
      (p) =>
        (correo && p.correo.toLowerCase() === correo) ||
        (empresa && p.empresa.toLowerCase() === empresa.toLowerCase())
    );

    if (existIdx >= 0) {
      data.prospectos[existIdx].contacto_principal = contacto || data.prospectos[existIdx].contacto_principal;
      data.prospectos[existIdx].telefono = telefono || data.prospectos[existIdx].telefono;
      data.prospectos[existIdx].correo = correo || data.prospectos[existIdx].correo;
      data.prospectos[existIdx].observaciones = `${data.prospectos[existIdx].observaciones || ''} | Actualizado por importación IB: FE: ${certificadoFE}, POS: ${posDigital}, Demo: ${presentacionFE}`.trim();
      actualizados++;
    } else {
      data.prospectos.unshift({
        id: Date.now() + i,
        nombre: empresa || contacto,
        empresa: empresa || 'Empresa Dominicana',
        contacto_principal: contacto || 'Contacto Comercial',
        telefono: telefono || '+1 809-565-0000',
        whatsapp: telefono || '+1 809-565-0000',
        correo: correo || 'contacto@empresa.com.do',
        canal_captacion: 'Importación Excel IB SYSTEM',
        producto_principal: posDigital.toLowerCase().includes('s') ? 'POS Digital' : 'Facturación Electrónica',
        plan_seleccionado: 'PYME',
        costo_base: 45.00,
        modulos_adicionales: modulos,
        costo_adicional: 16.00,
        costo_mensual: 61.00,
        valor_estimado: 732.00,
        cantidad_usuarios: 3,
        responsable_comercial: autor || 'Yenifer Reina Sena Suero',
        usuario_id: 1,
        etapa: ['Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido'].includes(estado) ? estado : 'Contacto',
        fecha_primer_contacto: fechaContacto,
        ultima_actividad: new Date().toISOString().replace('T', ' ').slice(0, 19),
        dias_sin_seguimiento: 0,
        observaciones: `Importado con estructura IB SYSTEM. Naturaleza: ${naturaleza} | ¿Certificado FE?: ${certificadoFE} | POS Digital: ${posDigital} | Sistema Actual: ${otroSistema} | Presentación FE: ${presentacionFE}`,
        fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      creados++;
    }

    // 2. Auto-crear o actualizar Empresa vinculada
    let compId = null;
    let compObj = data.empresas.find((e) => e.razon_social.toLowerCase() === empresa.toLowerCase());
    if (!compObj && empresa) {
      compId = Date.now() + 5000 + i;
      compObj = {
        id: compId,
        razon_social: empresa,
        nombre_comercial: empresa,
        rnc: 'Pendiente',
        direccion: 'Distrito Nacional',
        ciudad: 'Santo Domingo',
        provincia: 'Distrito Nacional',
        telefono,
        correo,
        sitio_web: '',
        industria: naturaleza,
        responsable_comercial: autor || 'Yenifer Reina Sena Suero',
        usuario_id: 1,
        fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
        estado_comercial: ['Cliente Activo', 'Ganado'].includes(estado) ? 'Cliente Activo' : 'Prospecto'
      };
      data.empresas.unshift(compObj);
    } else if (compObj) {
      compId = compObj.id;
      if (telefono && !compObj.telefono) compObj.telefono = telefono;
      if (correo && !compObj.correo) compObj.correo = correo;
    }

    // 3. Auto-crear o vincular Contacto
    if (contacto) {
      const cleanTel = telefono.replace(/[^0-9]/g, '');
      const existContact = data.contactos.find((c) =>
        (correo && c.correo && c.correo.toLowerCase() === correo) ||
        (cleanTel && c.telefono && c.telefono.replace(/[^0-9]/g, '') === cleanTel) ||
        (c.nombre.toLowerCase() === contacto.toLowerCase() && c.empresa.toLowerCase() === empresa.toLowerCase())
      );

      if (existContact) {
        existContact.empresa_id = compId || existContact.empresa_id;
        existContact.empresa = empresa || existContact.empresa;
        if (telefono) existContact.telefono = telefono;
        if (telefono) existContact.whatsapp = telefono;
        if (correo) existContact.correo = correo;
        existContact.ultimo_contacto = new Date().toISOString().replace('T', ' ').slice(0, 19);
      } else {
        data.contactos.unshift({
          id: Date.now() + 10000 + i,
          nombre: contacto.split(' ')[0] || contacto,
          apellido: contacto.split(' ').slice(1).join(' ') || '',
          empresa_id: compId,
          empresa: empresa || 'Empresa Comercial',
          cargo: 'Decisor Comercial',
          telefono,
          whatsapp: telefono,
          correo,
          direccion: 'Distrito Nacional',
          ciudad: 'Santo Domingo',
          provincia: 'Distrito Nacional',
          naturaleza_negocio: naturaleza,
          estado_comercial: ['Ganado', 'Cliente Activo'].includes(estado) ? 'Cliente Activo' : 'Prospecto',
          producto_interes: posDigital.toLowerCase().includes('s') ? 'POS Digital' : 'Facturación Electrónica',
          modulo_principal: modulos[0] || 'Ventas',
          responsable_comercial: autor || 'Yenifer Reina Sena Suero',
          usuario_id: 1,
          ultimo_contacto: new Date().toISOString().replace('T', ' ').slice(0, 19),
          proximo_seguimiento: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + ' 10:00:00',
          notas: `Registrado automáticamente desde importación masiva IB SYSTEM.`,
          observaciones_comerciales: `Naturaleza: ${naturaleza} | POS: ${posDigital} | Certificado FE: ${certificadoFE}`,
          etiquetas: 'Prospecto, IB SYSTEM',
          fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19)
        });
      }
    }
  });

  if (!data.importaciones) data.importaciones = [];
  data.importaciones.unshift({
    id: Date.now(),
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    usuario: autor || 'Yenifer Reina Sena Suero',
    archivo: req.body.nombre_archivo || 'IB_SYSTEM_Import.xlsx',
    tipo: 'Excel / CSV',
    registros_procesados: filas.length,
    registros_correctos: creados + actualizados,
    registros_con_error: 0,
    estado: 'Exitoso'
  });

  logAudit(autor || 'Administrador', 'Importación', 'Importaciones', `Lote (${filas.length} registros)`, `Procesó archivo: ${creados} nuevos, ${actualizados} actualizados`, ip);
  createNotification('Importación Completada', `Se importaron ${creados} nuevos prospectos y actualizaron ${actualizados}.`, autor || 'Sistema', 'importacion');
  db.saveLocalData(data);

  res.json({ success: true, creados, actualizados, total: filas.length });
});

// 15. Migración Automática JSON -> MySQL & Generador SQL (Prioridad #10)
app.get('/api/migrate/download-sql', (req, res) => {
  const data = db.getLocalData();
  const schemaPath = path.resolve(__dirname, 'database', 'schema.sql');
  let baseSchema = '';
  if (fs.existsSync(schemaPath)) {
    baseSchema = fs.readFileSync(schemaPath, 'utf-8');
  }

  let inserts = '\n\n-- ====================================================\n-- DATOS MIGRADOS DESDE EL MOTOR ACTIVO CRMCOMERCIAL\n-- ====================================================\n\n';

  // Usuarios
  (data.usuarios || []).forEach((u) => {
    inserts += `INSERT INTO usuarios (id, nombre, apellido, email, usuario, password_hash, rol, telefono, activo, empresa, subcuenta, fecha_creacion) VALUES (${u.id}, '${(u.nombre || '').replace(/'/g, "''")}', '${(u.apellido || '').replace(/'/g, "''")}', '${u.email}', '${u.usuario}', '${u.password_hash || u.password_plain || 'Admin123*'}', '${u.rol || 'Ejecutivo Comercial'}', '${u.telefono || ''}', ${u.activo !== false ? 1 : 0}, '${(u.empresa || 'IB SYSTEM S.R.L.').replace(/'/g, "''")}', '${(u.subcuenta || 'Sede Principal').replace(/'/g, "''")}', '${u.fecha_creacion || '2026-01-15 08:00:00'}') ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), rol=VALUES(rol);\n`;
  });

  // Empresas
  (data.empresas || []).forEach((e) => {
    inserts += `INSERT INTO empresas (id, razon_social, nombre_comercial, rnc, direccion, ciudad, provincia, telefono, correo, sitio_web, industria, cantidad_empleados, responsable_comercial, usuario_id, estado_comercial, fecha_registro) VALUES (${e.id}, '${(e.razon_social || '').replace(/'/g, "''")}', '${(e.nombre_comercial || e.razon_social || '').replace(/'/g, "''")}', '${e.rnc || 'Pendiente'}', '${(e.direccion || '').replace(/'/g, "''")}', '${e.ciudad || 'Santo Domingo'}', '${e.provincia || 'Distrito Nacional'}', '${e.telefono || ''}', '${e.correo || ''}', '${e.sitio_web || ''}', '${(e.industria || 'Comercial').replace(/'/g, "''")}', '${e.cantidad_empleados || '25-50'}', '${(e.responsable_comercial || 'Yenifer Reina').replace(/'/g, "''")}', ${e.usuario_id || 1}, '${e.estado_comercial || 'Prospecto'}', '${e.fecha_registro || '2026-09-01 10:00:00'}') ON DUPLICATE KEY UPDATE razon_social=VALUES(razon_social), telefono=VALUES(telefono);\n`;
  });

  // Contactos
  (data.contactos || []).forEach((c) => {
    inserts += `INSERT INTO contactos (id, nombre, apellido, empresa_id, empresa, cargo, telefono, whatsapp, correo, direccion, ciudad, provincia, naturaleza_negocio, estado_comercial, producto_interes, modulo_principal, responsable_comercial, usuario_id, ultimo_contacto, proximo_seguimiento, notas, observaciones_comerciales, etiquetas, fecha_registro) VALUES (${c.id}, '${(c.nombre || '').replace(/'/g, "''")}', '${(c.apellido || '').replace(/'/g, "''")}', ${c.empresa_id || 'NULL'}, '${(c.empresa || '').replace(/'/g, "''")}', '${(c.cargo || 'Contacto').replace(/'/g, "''")}', '${c.telefono || ''}', '${c.whatsapp || c.telefono || ''}', '${c.correo || ''}', '${(c.direccion || '').replace(/'/g, "''")}', '${c.ciudad || 'Santo Domingo'}', '${c.provincia || 'Distrito Nacional'}', '${(c.naturaleza_negocio || 'Comercial').replace(/'/g, "''")}', '${c.estado_comercial || 'Prospecto'}', '${c.producto_interes || 'Facturación Electrónica'}', '${c.modulo_principal || 'Ventas'}', '${(c.responsable_comercial || 'Yenifer Reina').replace(/'/g, "''")}', ${c.usuario_id || 1}, ${c.ultimo_contacto ? `'${c.ultimo_contacto}'` : 'NULL'}, ${c.proximo_seguimiento ? `'${c.proximo_seguimiento}'` : 'NULL'}, '${(c.notas || '').replace(/'/g, "''")}', '${(c.observaciones_comerciales || '').replace(/'/g, "''")}', '${(c.etiquetas || 'Prospecto').replace(/'/g, "''")}', '${c.fecha_registro || '2026-09-01 10:00:00'}') ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), empresa=VALUES(empresa), telefono=VALUES(telefono);\n`;
  });

  // Prospectos
  (data.prospectos || []).forEach((p) => {
    const modulosStr = Array.isArray(p.modulos_adicionales) ? p.modulos_adicionales.join(', ') : p.modulos_adicionales || '';
    inserts += `INSERT INTO prospectos (id, nombre, empresa, contacto_principal, telefono, whatsapp, correo, canal_captacion, producto_principal, plan_seleccionado, costo_base, modulos_adicionales, costo_adicional, costo_mensual, valor_estimado, cantidad_usuarios, responsable_comercial, usuario_id, etapa, fecha_primer_contacto, ultima_actividad, proximo_seguimiento, dias_sin_seguimiento, observaciones, etiquetas, fecha_registro) VALUES (${p.id}, '${(p.nombre || p.empresa || '').replace(/'/g, "''")}', '${(p.empresa || '').replace(/'/g, "''")}', '${(p.contacto_principal || '').replace(/'/g, "''")}', '${p.telefono || ''}', '${p.whatsapp || p.telefono || ''}', '${p.correo || ''}', '${p.canal_captacion || 'Venta Directa'}', '${p.producto_principal || 'Facturación Electrónica'}', '${p.plan_seleccionado || 'PYME'}', ${p.costo_base || 45.00}, '${modulosStr.replace(/'/g, "''")}', ${p.costo_adicional || 0.00}, ${p.costo_mensual || 45.00}, ${p.valor_estimado || 540.00}, ${p.cantidad_usuarios || 1}, '${(p.responsable_comercial || 'Yenifer Reina').replace(/'/g, "''")}', ${p.usuario_id || 1}, '${p.etapa || 'Contacto'}', '${p.fecha_primer_contacto || '2026-09-01'}', ${p.ultima_actividad ? `'${p.ultima_actividad}'` : 'NULL'}, ${p.proximo_seguimiento ? `'${p.proximo_seguimiento}'` : 'NULL'}, ${p.dias_sin_seguimiento || 0}, '${(p.observaciones || '').replace(/'/g, "''")}', '${(p.etiquetas || '').replace(/'/g, "''")}', '${p.fecha_registro || '2026-09-01 10:00:00'}') ON DUPLICATE KEY UPDATE etapa=VALUES(etapa), costo_mensual=VALUES(costo_mensual);\n`;
  });

  const fullSql = baseSchema + inserts;
  res.setHeader('Content-Type', 'application/sql; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="crmcomercial_ibsystem_migracion_completa.sql"');
  res.send(fullSql);
});

app.post('/api/migrate/json-to-mysql', async (req, res) => {
  const ip = getClientIp(req);
  try {
    // Si MySQL está activo, ejecutar
    if (db.isUsingMySQL()) {
      return res.json({
        success: true,
        message: 'MySQL ya se encuentra activo y sincronizado en tiempo real.',
        engine: 'MySQL 8.0'
      });
    }

    // Si no está conectado directamente, ejecutar script de migración local si es posible
    const data = db.getLocalData();
    logAudit(req.body.autor || 'Administrador', 'Exportación', 'Base de Datos', 'Migración MySQL', 'Generó volcado de migración completo hacia MySQL', ip);

    res.json({
      success: true,
      message: 'Estructura preparada y script SQL generado. Puedes descargar el archivo .sql o ejecutar `npm run migrate:mysql` en terminal.',
      stats: {
        usuarios: (data.usuarios || []).length,
        empresas: (data.empresas || []).length,
        contactos: (data.contactos || []).length,
        prospectos: (data.prospectos || []).length,
        seguimientos: (data.seguimientos || []).length,
        tareas: (data.tareas || []).length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Información de Red Local para Acceso desde otras Laptops (Prioridad #3)
app.get('/api/network-info', (req, res) => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ interface: name, address: iface.address, url: `http://${iface.address}:${PORT}` });
      }
    }
  }

  res.json({
    puerto: PORT,
    ips_detectadas: ips,
    firewall_instrucciones: 'Asegurar que el puerto 3000 TCP esté permitido en el Firewall de Windows (Inbound Rule: TCP Port 3000).',
    comando_firewall: 'netsh advfirewall firewall add rule name="CRMComercial Port 3000" dir=in action=allow protocol=TCP localport=3000'
  });
});

// Ruta comodín para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor configurado para red local (Prioridad #3: 0.0.0.0 accesible para laptops, celulares y tablets)
db.initDatabase().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const networkIps = [];

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          networkIps.push({ name, address: iface.address });
        }
      }
    }

    // Ordenar para dar prioridad a 192.168.X.X y 10.X.X.X
    networkIps.sort((a, b) => {
      if (a.address.startsWith('192.168.')) return -1;
      if (b.address.startsWith('192.168.')) return 1;
      if (a.address.startsWith('10.')) return -1;
      if (b.address.startsWith('10.')) return 1;
      return 0;
    });

    const primaryIp = networkIps.length > 0 ? networkIps[0].address : '127.0.0.1';

    console.log(`================================================================`);
    console.log(` CRMComercial - IB SYSTEM S.R.L. (Proyecto de Posgrado)`);
    console.log(` Servidor Express activo en red local (0.0.0.0):`);
    console.log(` • Localhost:      http://localhost:${PORT}`);
    networkIps.forEach((n) => {
      console.log(` • Red Local (${n.name}): http://${n.address}:${PORT}`);
    });
    if (networkIps.length === 0) {
      console.log(` • Red Local (IP): http://${primaryIp}:${PORT}`);
    }
    console.log(` ----------------------------------------------------------------`);
    console.log(` Acceso desde otras Laptops / Celulares:`);
    console.log(`   http://${primaryIp}:${PORT}`);
    console.log(` Nota Firewall Windows: Si otra laptop no conecta, permite el puerto`);
    console.log(`   3000 TCP ejecutando en CMD como Administrador:`);
    console.log(`   netsh advfirewall firewall add rule name="CRMComercial" dir=in action=allow protocol=TCP localport=${PORT}`);
    console.log(` Base de Datos:     ${db.isUsingMySQL() ? 'MySQL 8.0 Conectado' : 'Motor JSON Persistente Activo'}`);
    console.log(` Frontend:          HTML5, CSS3, JavaScript Puro (Vanilla)`);
    console.log(` Migración MySQL:   npm run migrate:mysql | GET /api/migrate/download-sql`);
    console.log(`================================================================`);
  });
});
