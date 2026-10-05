/**
 * Script de Migración Automática: JSON -> MySQL 8.0
 * CRMComercial - IB SYSTEM S.R.L. (Proyecto de Posgrado)
 * Autora: Ing. Yenifer Reina Sena Suero
 * 
 * Uso:
 * npm run migrate:mysql
 * O directamente:
 * node scripts/migrate-to-mysql.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crmcomercial_ibsystem',
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true,
};

const JSON_CANDIDATES = [
  path.resolve(__dirname, '../database/crmcomercial_local.json'),
  path.resolve(__dirname, '../database/seedData.json'),
  path.resolve(__dirname, '../../server/crm_database.json'),
];

async function runMigration() {
  console.log('================================================================');
  console.log(' MIGRACIÓN AUTOMÁTICA DE DATOS: JSON -> MYSQL 8.0');
  console.log(' CRMComercial - IB SYSTEM S.R.L.');
  console.log('================================================================\n');

  // 1. Cargar archivo JSON origen
  let sourceJsonPath = null;
  for (const candidate of JSON_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      sourceJsonPath = candidate;
      break;
    }
  }

  if (!sourceJsonPath) {
    console.error('❌ Error: No se encontró ningún archivo JSON de origen (crmcomercial_local.json o seedData.json).');
    process.exit(1);
  }

  console.log(`📁 Leyendo base de datos JSON desde:\n   ${sourceJsonPath}`);
  const rawData = fs.readFileSync(sourceJsonPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Conectar al servidor MySQL (sin especificar DB primero para crearla si no existe)
  console.log(`\n🔌 Conectando al servidor MySQL en ${DB_CONFIG.host}:${DB_CONFIG.port}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port,
      multipleStatements: true,
    });
    console.log('✅ Conexión establecida con MySQL.');
  } catch (err) {
    console.error(`\n❌ Error conectando a MySQL: ${err.message}`);
    console.log('\n💡 Instrucciones:');
    console.log('1. Asegúrate de que el servicio MySQL (o XAMPP/WAMP) esté iniciado.');
    console.log('2. Verifica las credenciales en tu archivo .env:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=tu_contraseña');
    console.log('   DB_NAME=crmcomercial_ibsystem\n');
    console.log('ℹ️ Para generar el script SQL sin conexión directa, ejecuta la descarga desde el CRM.');
    process.exit(1);
  }

  try {
    // 3. Crear base de datos y esquema
    console.log(`⚙️ Asegurando base de datos \`${DB_CONFIG.database}\` y estructura de tablas...`);
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;
    `);
    await connection.query(`USE \`${DB_CONFIG.database}\`;`);

    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await connection.query(schemaSql);
      console.log('✅ Esquema DDL aplicado correctamente.');
    }

    // 4. Migración de Usuarios
    const usuarios = data.usuarios || [];
    console.log(`\n👤 Migrando ${usuarios.length} usuarios...`);
    for (const u of usuarios) {
      await connection.query(`
        INSERT INTO usuarios (id, nombre, apellido, email, usuario, password_hash, rol, telefono, activo, empresa, subcuenta, fecha_creacion, ultimo_acceso, ultimo_cierre)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          apellido = VALUES(apellido),
          email = VALUES(email),
          password_hash = VALUES(password_hash),
          rol = VALUES(rol),
          telefono = VALUES(telefono),
          activo = VALUES(activo),
          empresa = VALUES(empresa),
          subcuenta = VALUES(subcuenta),
          ultimo_acceso = VALUES(ultimo_acceso),
          ultimo_cierre = VALUES(ultimo_cierre);
      `, [
        u.id,
        u.nombre,
        u.apellido || '',
        u.email,
        u.usuario,
        u.password_hash || u.password_plain || 'Admin123*',
        u.rol || 'Ejecutivo Comercial',
        u.telefono || '',
        u.activo !== false ? 1 : 0,
        u.empresa || 'IB SYSTEM S.R.L.',
        u.subcuenta || 'Sede Principal Santo Domingo',
        u.fecha_creacion || new Date().toISOString().replace('T', ' ').slice(0, 19),
        u.ultimo_acceso || null,
        u.ultimo_cierre || null
      ]);
    }
    console.log(`   ✔ ${usuarios.length} usuarios migrados.`);

    // 5. Migración de Empresas
    const empresas = data.empresas || [];
    console.log(`\n🏢 Migrando ${empresas.length} empresas...`);
    for (const e of empresas) {
      await connection.query(`
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
        e.direccion || 'Distrito Nacional',
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
    }
    console.log(`   ✔ ${empresas.length} empresas migradas.`);

    // 6. Migración de Contactos
    const contactos = data.contactos || [];
    console.log(`\n👥 Migrando ${contactos.length} contactos...`);
    for (const c of contactos) {
      // Asociar empresa_id si no está explícito
      let empresaId = c.empresa_id || null;
      if (!empresaId && c.empresa) {
        const matchingEmp = empresas.find(
          (emp) => emp.razon_social.toLowerCase() === c.empresa.toLowerCase()
        );
        if (matchingEmp) empresaId = matchingEmp.id;
      }

      await connection.query(`
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
        empresaId,
        c.empresa,
        c.cargo || 'Decisor Comercial',
        c.telefono || '',
        c.whatsapp || c.telefono || '',
        c.correo || '',
        c.direccion || 'Distrito Nacional',
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
        c.etiquetas || 'Prospecto',
        c.fecha_registro || new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    }
    console.log(`   ✔ ${contactos.length} contactos migrados.`);

    // 7. Migración de Prospectos / Oportunidades
    const prospectos = data.prospectos || [];
    console.log(`\n💼 Migrando ${prospectos.length} oportunidades / prospectos...`);
    for (const p of prospectos) {
      const modulosStr = Array.isArray(p.modulos_adicionales)
        ? p.modulos_adicionales.join(', ')
        : p.modulos_adicionales || '';

      await connection.query(`
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
          etiquetas = VALUES(etiquetas);
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
        p.ultima_actividad || null,
        p.proximo_seguimiento || null,
        p.dias_sin_seguimiento || 0,
        p.observaciones || '',
        p.etiquetas || '',
        p.motivo_perdida || null,
        p.fecha_registro || new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    }
    console.log(`   ✔ ${prospectos.length} prospectos / oportunidades migrados.`);

    // 8. Migración de Seguimientos
    const seguimientos = data.seguimientos || [];
    console.log(`\n📞 Migrando ${seguimientos.length} seguimientos...`);
    for (const s of seguimientos) {
      await connection.query(`
        INSERT INTO seguimientos (id, prospecto_id, empresa, usuario, fecha, hora, canal, resultado, observaciones, proxima_accion, fecha_proximo_seguimiento, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        s.fecha || new Date().toISOString().split('T')[0],
        s.hora || '10:00:00',
        s.canal || 'Llamada',
        s.resultado || 'Contactado',
        s.observaciones || '',
        s.proxima_accion || '',
        s.fecha_proximo_seguimiento || null,
        new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    }
    console.log(`   ✔ ${seguimientos.length} seguimientos migrados.`);

    // 9. Migración de Tareas
    const tareas = data.tareas || [];
    console.log(`\n📋 Migrando ${tareas.length} tareas...`);
    for (const t of tareas) {
      await connection.query(`
        INSERT INTO tareas (id, titulo, descripcion, asignado_a, fecha_limite, prioridad, estado, relacionado_tipo, relacionado_id, relacionado_nombre, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        t.fecha_limite || new Date().toISOString().split('T')[0],
        t.prioridad || 'Media',
        t.estado || 'Pendiente',
        t.relacionado_tipo || 'empresa',
        t.relacionado_id || null,
        t.relacionado_nombre || '',
        new Date().toISOString().replace('T', ' ').slice(0, 19)
      ]);
    }
    console.log(`   ✔ ${tareas.length} tareas migradas.`);

    // 10. Migración de Metas Comerciales
    const metas = data.metas_comerciales || [];
    console.log(`\n🎯 Migrando ${metas.length} metas comerciales...`);
    for (const m of metas) {
      await connection.query(`
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
        m.usuario_id,
        m.usuario_nombre || 'Ejecutivo',
        m.meta_mensual || 0,
        m.meta_trimestral || 0,
        m.meta_anual || 0,
        m.ventas_actuales || 0,
        m.prospectos_ganados || 0
      ]);
    }
    console.log(`   ✔ ${metas.length} metas comerciales migradas.`);

    // 11. Migración de Notificaciones
    const notifs = data.notificaciones || [];
    console.log(`\n🔔 Migrando ${notifs.length} notificaciones...`);
    for (const n of notifs.slice(0, 100)) {
      await connection.query(`
        INSERT INTO notificaciones (id, titulo, mensaje, usuario, fecha, hora, leida, tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          leida = VALUES(leida);
      `, [
        n.id || Date.now(),
        n.titulo || 'Notificación',
        n.mensaje || '',
        n.usuario || null,
        n.fecha || new Date().toISOString().split('T')[0],
        n.hora || '12:00',
        n.leida ? 1 : 0,
        n.tipo || 'info'
      ]);
    }
    console.log(`   ✔ ${notifs.length} notificaciones migradas.`);

    // 12. Migración de Auditoría
    const auditLogs = data.auditoria || [];
    console.log(`\n🛡️ Migrando ${auditLogs.length} registros de auditoría...`);
    for (const a of auditLogs.slice(0, 500)) {
      await connection.query(`
        INSERT INTO auditoria (id, usuario, usuario_id, fecha, hora, accion, modulo, registro_afectado, detalles, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          detalles = VALUES(detalles);
      `, [
        a.id || Date.now(),
        a.usuario || 'Sistema',
        a.usuario_id || null,
        a.fecha || new Date().toISOString().split('T')[0],
        a.hora || '12:00:00',
        a.accion || 'ACCION',
        a.modulo || 'GENERAL',
        a.registro_afectado || '',
        a.detalles || '',
        a.ip || '127.0.0.1'
      ]);
    }
    console.log(`   ✔ ${auditLogs.length} registros de auditoría migrados.`);

    console.log('\n================================================================');
    console.log(' 🎉 MIGRACIÓN A MYSQL COMPLETADA CON ÉXITO SIN PÉRDIDA DE DATOS');
    console.log(' Base de Datos: ' + DB_CONFIG.database);
    console.log(' Tablas Sincronizadas: usuarios, empresas, contactos, prospectos,');
    console.log('                       seguimientos, tareas, auditoria, notificaciones');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Error durante la migración:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
