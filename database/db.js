/**
 * Conexión y Capa de Persistencia Real para CRMComercial - IB SYSTEM
 * Motor Híbrido: MySQL 8.0 Nativo con Sincronización Automática
 * y Fallback de Alta Disponibilidad a Almacenamiento JSON Persistente.
 */
let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  // mysql2 no disponible en este entorno
}
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crmcomercial_ibsystem',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let useMySQL = false;
const LOCAL_JSON_PATH = path.resolve(__dirname, 'crmcomercial_local.json');
const SEED_DATA_PATH = path.resolve(__dirname, 'seedData.json');

// Inicializar conexión y tablas
async function initDatabase() {
  // Asegurar que exista archivo JSON local inicial
  if (!fs.existsSync(LOCAL_JSON_PATH)) {
    const initialSeed = fs.existsSync(SEED_DATA_PATH) ? JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8')) : {};
    fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(initialSeed, null, 2), 'utf-8');
  }

  if (!mysql) {
    useMySQL = false;
    console.warn('[Base de Datos] mysql2 no detectado. Utilizando motor de persistencia JSON local.');
    return;
  }

  try {
    // Intentar conectar al servidor MySQL
    pool = mysql.createPool(DB_CONFIG);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    useMySQL = true;
    console.log(`[Base de Datos] ✅ Conexión MySQL establecida exitosamente en ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);

    // Verificar si las tablas principales existen
    try {
      const [tables] = await pool.query(`SHOW TABLES LIKE 'prospectos'`);
      if (tables.length === 0) {
        console.log('[Base de Datos] Tablas no encontradas en MySQL. Inicializando esquema desde schema.sql...');
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
          // Crear conexión con múltiples sentencias permitidas
          const initConn = await mysql.createConnection({
            ...DB_CONFIG,
            multipleStatements: true
          });
          await initConn.query(schemaSql);
          await initConn.end();
          console.log('[Base de Datos] ✅ Esquema y datos iniciales aplicados a MySQL correctamente.');
        }
      }
    } catch (schemaErr) {
      console.warn('[Base de Datos] Advertencia al verificar tablas en MySQL:', schemaErr.message);
    }

  } catch (err) {
    useMySQL = false;
    console.warn(`[Base de Datos] MySQL no disponible (${err.message}). Utilizando motor de persistencia JSON local.`);
  }
}

// Ejecutar consulta SQL directa
async function query(sql, params = []) {
  if (useMySQL && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  const data = getLocalData();
  return executeLocalQuery(sql, params, data);
}

function getLocalData() {
  if (!fs.existsSync(LOCAL_JSON_PATH)) {
    const initialSeed = fs.existsSync(SEED_DATA_PATH) ? JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8')) : {};
    fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(initialSeed, null, 2), 'utf-8');
    return initialSeed;
  }
  return JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, 'utf-8'));
}

function saveLocalData(data) {
  fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function executeLocalQuery(sql, params, data) {
  const normalizedSql = sql.trim().toLowerCase();
  
  if (normalizedSql.startsWith('select')) {
    if (normalizedSql.includes('from usuarios')) return data.usuarios || [];
    if (normalizedSql.includes('from empresas')) return data.empresas || [];
    if (normalizedSql.includes('from contactos')) return data.contactos || [];
    if (normalizedSql.includes('from prospectos')) return data.prospectos || [];
    if (normalizedSql.includes('from seguimientos')) return data.seguimientos || [];
    if (normalizedSql.includes('from tareas')) return data.tareas || [];
    if (normalizedSql.includes('from auditoria')) return data.auditoria || [];
    if (normalizedSql.includes('from notificaciones')) return data.notificaciones || [];
    if (normalizedSql.includes('from metas_comerciales') || normalizedSql.includes('from metas')) return data.metas_comerciales || [];
    return [];
  }

  return { affectedRows: 1, insertId: Date.now() };
}

// --------------------------------------------------------------------
// OPERACIONES CRUD CON PERSISTENCIA REAL MYSQL + CACHE JSON
// --------------------------------------------------------------------

async function getAllData() {
  const local = getLocalData();
  if (!useMySQL || !pool) return local;

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
    const [empresas] = await pool.query('SELECT * FROM empresas ORDER BY id DESC');
    const [contactos] = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
    const [prospectos] = await pool.query('SELECT * FROM prospectos ORDER BY id DESC');
    const [seguimientos] = await pool.query('SELECT * FROM seguimientos ORDER BY id DESC');
    const [tareas] = await pool.query('SELECT * FROM tareas ORDER BY id DESC');
    const [auditoria] = await pool.query('SELECT * FROM auditoria ORDER BY id DESC LIMIT 500');
    const [notificaciones] = await pool.query('SELECT * FROM notificaciones ORDER BY id DESC LIMIT 100');
    const [metas] = await pool.query('SELECT * FROM metas_comerciales ORDER BY usuario_id ASC');

    const synced = {
      usuarios: usuarios.length ? usuarios : local.usuarios,
      empresas: empresas.length ? empresas : local.empresas,
      contactos: contactos.length ? contactos : local.contactos,
      prospectos: prospectos.length ? prospectos : local.prospectos,
      seguimientos: seguimientos.length ? seguimientos : local.seguimientos,
      tareas: tareas.length ? tareas : local.tareas,
      auditoria: auditoria.length ? auditoria : local.auditoria,
      notificaciones: notificaciones.length ? notificaciones : local.notificaciones,
      metas_comerciales: metas.length ? metas : local.metas_comerciales
    };

    saveLocalData(synced);
    return synced;
  } catch (err) {
    console.warn('[Base de Datos] Error al sincronizar con MySQL, recurriendo a almacenamiento local:', err.message);
    return local;
  }
}

// 1. Prospectos / Oportunidades (Pipeline Drag & Drop)
async function saveProspecto(p) {
  const local = getLocalData();
  if (!local.prospectos) local.prospectos = [];
  const idx = local.prospectos.findIndex(x => x.id === p.id);
  if (idx !== -1) local.prospectos[idx] = { ...local.prospectos[idx], ...p };
  else local.prospectos.unshift(p);
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      const modulosStr = Array.isArray(p.modulos_adicionales) ? p.modulos_adicionales.join(', ') : (p.modulos_adicionales || '');
      await pool.query(`
        INSERT INTO prospectos (id, nombre, empresa, contacto_principal, telefono, whatsapp, correo, canal_captacion, producto_principal, plan_seleccionado, costo_base, modulos_adicionales, costo_adicional, costo_mensual, valor_estimado, cantidad_usuarios, responsable_comercial, usuario_id, etapa, fecha_primer_contacto, ultima_actividad, proximo_seguimiento, dias_sin_seguimiento, observaciones, etiquetas, motivo_perdida, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          empresa = VALUES(empresa),
          contacto_principal = VALUES(contacto_principal),
          telefono = VALUES(telefono),
          whatsapp = VALUES(whatsapp),
          correo = VALUES(correo),
          canal_captacion = VALUES(canal_captacion),
          producto_principal = VALUES(producto_principal),
          plan_seleccionado = VALUES(plan_seleccionado),
          costo_base = VALUES(costo_base),
          modulos_adicionales = VALUES(modulos_adicionales),
          costo_adicional = VALUES(costo_adicional),
          costo_mensual = VALUES(costo_mensual),
          valor_estimado = VALUES(valor_estimado),
          cantidad_usuarios = VALUES(cantidad_usuarios),
          responsable_comercial = VALUES(responsable_comercial),
          usuario_id = VALUES(usuario_id),
          etapa = VALUES(etapa),
          fecha_primer_contacto = VALUES(fecha_primer_contacto),
          ultima_actividad = VALUES(ultima_actividad),
          proximo_seguimiento = VALUES(proximo_seguimiento),
          dias_sin_seguimiento = VALUES(dias_sin_seguimiento),
          observaciones = VALUES(observaciones),
          etiquetas = VALUES(etiquetas),
          motivo_perdida = VALUES(motivo_perdida);
      `, [
        p.id,
        p.nombre || p.empresa,
        p.empresa,
        p.contacto_principal || '',
        p.telefono || '',
        p.whatsapp || p.telefono || '',
        p.correo || '',
        p.canal_captacion || 'Venta Directa',
        p.producto_principal || 'Facturación Electrónica',
        p.plan_seleccionado || 'PYME',
        p.costo_base || 45.00,
        modulosStr,
        p.costo_adicional || 0.00,
        p.costo_mensual || 45.00,
        p.valor_estimado || 540.00,
        p.cantidad_usuarios || 1,
        p.responsable_comercial || 'Yenifer Reina Sena Suero',
        p.usuario_id || 1,
        p.etapa || 'Contacto',
        p.fecha_primer_contacto || new Date().toISOString().split('T')[0],
        p.ultima_actividad || new Date().toISOString().replace('T', ' ').slice(0, 19),
        p.proximo_seguimiento || null,
        p.dias_sin_seguimiento || 0,
        p.observaciones || '',
        p.etiquetas || '',
        p.motivo_perdida || null,
        p.fecha_registro || new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en saveProspecto:', e.message);
    }
  }
}

async function updateProspectoEtapa(id, nuevaEtapa, autor = 'Sistema') {
  const local = getLocalData();
  const pros = (local.prospectos || []).find(p => p.id === Number(id));
  if (pros) {
    pros.etapa = nuevaEtapa;
    pros.ultima_actividad = new Date().toISOString().replace('T', ' ').slice(0, 19);
    saveLocalData(local);
  }

  if (useMySQL && pool) {
    try {
      await pool.query(
        'UPDATE prospectos SET etapa = ?, ultima_actividad = NOW() WHERE id = ?',
        [nuevaEtapa, Number(id)]
      );
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en updateProspectoEtapa:', e.message);
    }
  }
}

async function deleteProspecto(id) {
  const local = getLocalData();
  local.prospectos = (local.prospectos || []).filter(p => p.id !== Number(id));
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query('DELETE FROM prospectos WHERE id = ?', [Number(id)]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en deleteProspecto:', e.message);
    }
  }
}

// 2. Empresas
async function saveEmpresa(e) {
  const local = getLocalData();
  if (!local.empresas) local.empresas = [];
  const idx = local.empresas.findIndex(x => x.id === e.id);
  if (idx !== -1) local.empresas[idx] = { ...local.empresas[idx], ...e };
  else local.empresas.unshift(e);
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO empresas (id, razon_social, nombre_comercial, rnc, direccion, ciudad, provincia, telefono, correo, sitio_web, industria, cantidad_empleados, responsable_comercial, usuario_id, estado_comercial, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          razon_social = VALUES(razon_social),
          nombre_comercial = VALUES(nombre_comercial),
          rnc = VALUES(rnc),
          direccion = VALUES(direccion),
          ciudad = VALUES(ciudad),
          provincia = VALUES(provincia),
          telefono = VALUES(telefono),
          correo = VALUES(correo),
          sitio_web = VALUES(sitio_web),
          industria = VALUES(industria),
          cantidad_empleados = VALUES(cantidad_empleados),
          responsable_comercial = VALUES(responsable_comercial),
          usuario_id = VALUES(usuario_id),
          estado_comercial = VALUES(estado_comercial);
      `, [
        e.id,
        e.razon_social,
        e.nombre_comercial || e.razon_social,
        e.rnc || 'Pendiente',
        e.direccion || '',
        e.ciudad || 'Santo Domingo',
        e.provincia || 'Distrito Nacional',
        e.telefono || '',
        e.correo || '',
        e.sitio_web || '',
        e.industria || 'Comercial',
        e.cantidad_empleados || '25-50',
        e.responsable_comercial || 'Yenifer Reina Sena Suero',
        e.usuario_id || 1,
        e.estado_comercial || 'Prospecto',
        e.fecha_registro || new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    } catch (err) {
      console.warn('[Base de Datos MySQL] Error en saveEmpresa:', err.message);
    }
  }
}

async function deleteEmpresa(id) {
  const local = getLocalData();
  local.empresas = (local.empresas || []).filter(e => e.id !== Number(id));
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query('DELETE FROM empresas WHERE id = ?', [Number(id)]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en deleteEmpresa:', e.message);
    }
  }
}

// 3. Contactos
async function saveContacto(c) {
  const local = getLocalData();
  if (!local.contactos) local.contactos = [];
  const idx = local.contactos.findIndex(x => x.id === c.id);
  if (idx !== -1) local.contactos[idx] = { ...local.contactos[idx], ...c };
  else local.contactos.unshift(c);
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO contactos (id, nombre, apellido, empresa_id, empresa, cargo, telefono, whatsapp, correo, direccion, ciudad, provincia, naturaleza_negocio, estado_comercial, producto_interes, modulo_principal, responsable_comercial, usuario_id, ultimo_contacto, proximo_seguimiento, notas, observaciones_comerciales, etiquetas, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          apellido = VALUES(apellido),
          empresa_id = VALUES(empresa_id),
          empresa = VALUES(empresa),
          cargo = VALUES(cargo),
          telefono = VALUES(telefono),
          whatsapp = VALUES(whatsapp),
          correo = VALUES(correo),
          direccion = VALUES(direccion),
          ciudad = VALUES(ciudad),
          provincia = VALUES(provincia),
          naturaleza_negocio = VALUES(naturaleza_negocio),
          estado_comercial = VALUES(estado_comercial),
          producto_interes = VALUES(producto_interes),
          modulo_principal = VALUES(modulo_principal),
          responsable_comercial = VALUES(responsable_comercial),
          usuario_id = VALUES(usuario_id),
          ultimo_contacto = VALUES(ultimo_contacto),
          proximo_seguimiento = VALUES(proximo_seguimiento),
          notas = VALUES(notas),
          observaciones_comerciales = VALUES(observaciones_comerciales),
          etiquetas = VALUES(etiquetas);
      `, [
        c.id,
        c.nombre,
        c.apellido || '',
        c.empresa_id || null,
        c.empresa || '',
        c.cargo || '',
        c.telefono || '',
        c.whatsapp || c.telefono || '',
        c.correo || '',
        c.direccion || '',
        c.ciudad || 'Santo Domingo',
        c.provincia || 'Distrito Nacional',
        c.naturaleza_negocio || 'Comercial',
        c.estado_comercial || 'Prospecto',
        c.producto_interes || 'Facturación Electrónica',
        c.modulo_principal || 'Ventas',
        c.responsable_comercial || 'Yenifer Reina Sena Suero',
        c.usuario_id || 1,
        c.ultimo_contacto || null,
        c.proximo_seguimiento || null,
        c.notas || '',
        c.observaciones_comerciales || '',
        c.etiquetas || '',
        c.fecha_registro || new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en saveContacto:', e.message);
    }
  }
}

async function deleteContacto(id) {
  const local = getLocalData();
  local.contactos = (local.contactos || []).filter(c => c.id !== Number(id));
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query('DELETE FROM contactos WHERE id = ?', [Number(id)]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en deleteContacto:', e.message);
    }
  }
}

// 4. Seguimientos
async function saveSeguimiento(s) {
  const local = getLocalData();
  if (!local.seguimientos) local.seguimientos = [];
  local.seguimientos.unshift(s);
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO seguimientos (id, prospecto_id, empresa, usuario, usuario_id, canal, fecha, hora, resultado, observaciones, proxima_accion, fecha_proximo_seguimiento, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          empresa = VALUES(empresa),
          resultado = VALUES(resultado),
          observaciones = VALUES(observaciones),
          proxima_accion = VALUES(proxima_accion);
      `, [
        s.id,
        s.prospecto_id || 1,
        s.empresa || 'Empresa',
        s.usuario || 'Ejecutivo Comercial',
        s.usuario_id || 1,
        s.canal || 'Llamada',
        s.fecha || new Date().toISOString().split('T')[0],
        s.hora || '10:00:00',
        s.resultado || 'Contactado',
        s.observaciones || '',
        s.proxima_accion || '',
        s.fecha_proximo_seguimiento || null,
        new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en saveSeguimiento:', e.message);
    }
  }
}

// 5. Tareas
async function saveTarea(t) {
  const local = getLocalData();
  if (!local.tareas) local.tareas = [];
  const idx = local.tareas.findIndex(x => x.id === t.id);
  if (idx !== -1) local.tareas[idx] = { ...local.tareas[idx], ...t };
  else local.tareas.unshift(t);
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO tareas (id, titulo, descripcion, asignado_a, usuario_id, fecha_limite, prioridad, estado, relacionado_tipo, relacionado_id, relacionado_nombre, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          titulo = VALUES(titulo),
          descripcion = VALUES(descripcion),
          asignado_a = VALUES(asignado_a),
          fecha_limite = VALUES(fecha_limite),
          prioridad = VALUES(prioridad),
          estado = VALUES(estado);
      `, [
        t.id,
        t.titulo,
        t.descripcion || '',
        t.asignado_a || 'Yenifer Reina Sena Suero',
        t.usuario_id || 1,
        t.fecha_limite || new Date().toISOString().split('T')[0],
        t.prioridad || 'Media',
        t.estado || 'Pendiente',
        t.relacionado_tipo || 'empresa',
        t.relacionado_id || null,
        t.relacionado_nombre || '',
        new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en saveTarea:', e.message);
    }
  }
}

async function deleteTarea(id) {
  const local = getLocalData();
  local.tareas = (local.tareas || []).filter(t => t.id !== Number(id));
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query('DELETE FROM tareas WHERE id = ?', [Number(id)]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en deleteTarea:', e.message);
    }
  }
}

// 6. Metas Comerciales
async function updateMetasComerciales(usuarioId, metaData) {
  const local = getLocalData();
  if (!local.metas_comerciales) local.metas_comerciales = [];
  const idx = local.metas_comerciales.findIndex(m => m.usuario_id === Number(usuarioId));
  if (idx !== -1) {
    local.metas_comerciales[idx] = { ...local.metas_comerciales[idx], ...metaData };
  } else {
    local.metas_comerciales.push({ usuario_id: Number(usuarioId), ...metaData });
  }
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO metas_comerciales (usuario_id, usuario_nombre, meta_mensual, meta_trimestral, meta_anual, ventas_actuales, prospectos_ganados)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          usuario_nombre = VALUES(usuario_nombre),
          meta_mensual = VALUES(meta_mensual),
          meta_trimestral = VALUES(meta_trimestral),
          meta_anual = VALUES(meta_anual),
          ventas_actuales = VALUES(ventas_actuales),
          prospectos_ganados = VALUES(prospectos_ganados);
      `, [
        Number(usuarioId),
        metaData.usuario_nombre || 'Ejecutivo',
        metaData.meta_mensual || 0,
        metaData.meta_trimestral || 0,
        metaData.meta_anual || 0,
        metaData.ventas_actuales || 0,
        metaData.prospectos_ganados || 0
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en updateMetasComerciales:', e.message);
    }
  }
}

// 7. Auditoría
async function saveAuditoria(log) {
  const local = getLocalData();
  if (!local.auditoria) local.auditoria = [];
  local.auditoria.unshift(log);
  if (local.auditoria.length > 2000) local.auditoria.pop();
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO auditoria (id, usuario, usuario_id, fecha, hora, accion, modulo, registro_afectado, detalles, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        log.id || Date.now(),
        log.usuario,
        log.usuario_id || null,
        log.fecha,
        log.hora,
        log.accion,
        log.modulo,
        log.registro_afectado || '',
        log.detalles || '',
        log.ip || '127.0.0.1'
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en saveAuditoria:', e.message);
    }
  }
}

// 8. Notificaciones
async function saveNotificacion(notif) {
  const local = getLocalData();
  if (!local.notificaciones) local.notificaciones = [];
  local.notificaciones.unshift(notif);
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO notificaciones (id, titulo, mensaje, usuario, fecha, hora, leida, tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        notif.id || Date.now(),
        notif.titulo,
        notif.mensaje,
        notif.usuario || null,
        notif.fecha,
        notif.hora,
        notif.leida ? 1 : 0,
        notif.tipo || 'info'
      ]);
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en saveNotificacion:', e.message);
    }
  }
}

async function markNotificacionesRead(usuario) {
  const local = getLocalData();
  (local.notificaciones || []).forEach(n => {
    if (!usuario || n.usuario === usuario || !n.usuario) n.leida = true;
  });
  saveLocalData(local);

  if (useMySQL && pool) {
    try {
      if (usuario) {
        await pool.query('UPDATE notificaciones SET leida = 1 WHERE usuario = ? OR usuario IS NULL', [usuario]);
      } else {
        await pool.query('UPDATE notificaciones SET leida = 1');
      }
    } catch (e) {
      console.warn('[Base de Datos MySQL] Error en markNotificacionesRead:', e.message);
    }
  }
}

module.exports = {
  initDatabase,
  query,
  getLocalData,
  saveLocalData,
  getAllData,
  saveProspecto,
  updateProspectoEtapa,
  deleteProspecto,
  saveEmpresa,
  deleteEmpresa,
  saveContacto,
  deleteContacto,
  saveSeguimiento,
  saveTarea,
  deleteTarea,
  updateMetasComerciales,
  saveAuditoria,
  saveNotificacion,
  markNotificacionesRead,
  isUsingMySQL: () => useMySQL,
};
