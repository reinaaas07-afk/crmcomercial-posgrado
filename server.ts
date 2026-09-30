import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import {
  getDatabase,
  saveDatabase,
  addAuditLog,
  addNotification,
  UserEntity,
  CompanyEntity,
  ContactEntity,
  ProspectOpportunityEntity,
  FollowUpEntity,
  TaskEntity,
} from './server/db';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper to extract client IP
  const getClientIp = (req: express.Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || '190.166.45.12';
  };

  // 1. Health and Status API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      system: 'CRMComercial - IB SYSTEM',
      institution: 'Proyecto de Posgrado',
      database: 'MySQL 8.0 Engine & File-Backed Storage Active',
      persistence: 'Permanent File System Storage Active',
      time: new Date().toISOString(),
    });
  });

  // 2. Full Database Sync Endpoint (GET /api/db/all)
  app.get('/api/db/all', (req, res) => {
    const db = getDatabase();
    res.json(db);
  });

  // 3. Authentication: Login
  app.post('/api/auth/login', (req, res) => {
    const { usuario, password } = req.body;
    const ip = getClientIp(req);
    const db = getDatabase();

    const user = db.usuarios.find(
      (u) =>
        (u.usuario.toLowerCase() === (usuario || '').trim().toLowerCase() ||
          u.email.toLowerCase() === (usuario || '').trim().toLowerCase()) &&
        (u.password_hash === password || u.password_plain === password)
    );

    if (!user) {
      addAuditLog(
        usuario || 'Desconocido',
        'Inicio de Sesión',
        'Seguridad',
        `Intento fallido para ${usuario}`,
        'Credenciales inválidas al intentar iniciar sesión en CRMComercial.',
        ip
      );
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifica tu usuario y contraseña.',
      });
    }

    if (!user.activo) {
      return res.status(403).json({
        success: false,
        error: 'Este usuario se encuentra desactivado. Contacta al Administrador General.',
      });
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;
    user.ultimo_acceso = timestamp;
    user.en_linea = true;

    addAuditLog(
      user.nombre,
      'Inicio de Sesión',
      'Seguridad',
      `Sesión iniciada (${user.usuario})`,
      `Usuario ${user.nombre} (${user.rol}) inició sesión exitosamente.`,
      ip,
      user.id
    );

    saveDatabase(db);

    res.json({
      success: true,
      user,
      token: `token_${user.id}_${Date.now()}`,
      timestamp,
    });
  });

  // 4. Authentication: Logout
  app.post('/api/auth/logout', (req, res) => {
    const { usuario_id, usuario } = req.body;
    const ip = getClientIp(req);
    const db = getDatabase();

    const user = db.usuarios.find((u) => u.id === Number(usuario_id) || u.usuario === usuario);
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;

    if (user) {
      user.en_linea = false;
      user.ultimo_cierre = timestamp;
      addAuditLog(
        user.nombre,
        'Cierre de Sesión',
        'Seguridad',
        `Sesión cerrada (${user.usuario})`,
        `Cierre de sesión registrado a las ${now.toTimeString().slice(0, 8)}.`,
        ip,
        user.id
      );
      saveDatabase(db);
    } else {
      addAuditLog(
        usuario || 'Usuario',
        'Cierre de Sesión',
        'Seguridad',
        'Sesión finalizada',
        'Cierre de sesión manual ejecutado.',
        ip
      );
    }

    res.json({ success: true, message: 'Sesión destruida exitosamente.', timestamp });
  });

  // 5. Authentication: Password Recovery
  app.post('/api/auth/recuperar', (req, res) => {
    const { email } = req.body;
    const ip = getClientIp(req);
    const db = getDatabase();

    const user = db.usuarios.find(
      (u) => u.email.toLowerCase() === (email || '').trim().toLowerCase()
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún usuario registrado con ese correo institucional.',
      });
    }

    addAuditLog(
      user.nombre,
      'Restablecimiento',
      'Seguridad',
      `Recuperación de contraseña: ${user.email}`,
      `Solicitud de recuperación de contraseña generada para ${user.email}.`,
      ip,
      user.id
    );

    res.json({
      success: true,
      message: `Se ha procesado la solicitud. Tu usuario es "${user.usuario}" y la contraseña actual es "${user.password_plain || user.password_hash}".`,
      usuario: user.usuario,
      password_plain: user.password_plain || user.password_hash,
    });
  });

  // 6. Empresas CRUD
  app.get('/api/empresas', (req, res) => {
    const db = getDatabase();
    res.json(db.empresas);
  });

  app.post('/api/empresas', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);
    const newCompany: CompanyEntity = {
      id: Date.now(),
      fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...req.body,
    };

    db.empresas.unshift(newCompany);

    addAuditLog(
      req.body.autor || 'Administrador',
      'Creación',
      'Empresas',
      newCompany.razon_social,
      `Creó nueva empresa: ${newCompany.razon_social} (RNC: ${newCompany.rnc}).`,
      ip
    );

    addNotification(
      'Nueva Empresa Registrada',
      `Se agregó la empresa ${newCompany.razon_social} al directorio de IB SYSTEM.`,
      req.body.autor || 'Sistema',
      'nuevo_prospecto'
    );

    saveDatabase(db);
    res.status(201).json(newCompany);
  });

  app.put('/api/empresas/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const index = db.empresas.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const old = db.empresas[index];
    const updated = { ...old, ...req.body, id };
    db.empresas[index] = updated;

    addAuditLog(
      req.body.autor || 'Administrador',
      'Edición',
      'Empresas',
      updated.razon_social,
      `Actualizó datos de la empresa: ${updated.razon_social}.`,
      ip
    );

    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/empresas/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const company = db.empresas.find((e) => e.id === id);

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    db.empresas = db.empresas.filter((e) => e.id !== id);

    addAuditLog(
      (req.query.autor as string) || 'Administrador',
      'Eliminación',
      'Empresas',
      company.razon_social,
      `Eliminó la empresa: ${company.razon_social}.`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true, message: 'Empresa eliminada correctamente' });
  });

  // 7. Contactos CRUD
  app.get('/api/contactos', (req, res) => {
    const db = getDatabase();
    res.json(db.contactos);
  });

  app.post('/api/contactos', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);
    const newContact: ContactEntity = {
      id: Date.now(),
      fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ultimo_contacto: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...req.body,
    };

    db.contactos.unshift(newContact);

    addAuditLog(
      req.body.autor || 'Administrador',
      'Creación',
      'Contactos',
      `${newContact.nombre} ${newContact.apellido}`,
      `Creó contacto en ${newContact.empresa} (${newContact.cargo}).`,
      ip
    );

    addNotification(
      'Nuevo Contacto Creado',
      `Se registró a ${newContact.nombre} ${newContact.apellido} (${newContact.empresa}).`,
      req.body.autor || 'Sistema',
      'contacto_actualizado'
    );

    saveDatabase(db);
    res.status(201).json(newContact);
  });

  app.put('/api/contactos/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const index = db.contactos.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    const old = db.contactos[index];
    const updated = { ...old, ...req.body, id };
    db.contactos[index] = updated;

    addAuditLog(
      req.body.autor || 'Administrador',
      'Edición',
      'Contactos',
      `${updated.nombre} ${updated.apellido}`,
      `Actualizó contacto de ${updated.empresa}.`,
      ip
    );

    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/contactos/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const contact = db.contactos.find((c) => c.id === id);

    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    db.contactos = db.contactos.filter((c) => c.id !== id);

    addAuditLog(
      (req.query.autor as string) || 'Administrador',
      'Eliminación',
      'Contactos',
      `${contact.nombre} ${contact.apellido}`,
      `Eliminó contacto de ${contact.empresa}.`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true, message: 'Contacto eliminado' });
  });

  // 8. Prospectos & Oportunidades CRUD (Automatic Calculations)
  app.get('/api/prospectos', (req, res) => {
    const db = getDatabase();
    res.json(db.prospectos);
  });

  app.post('/api/prospectos', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);

    // Calculate costs automatically
    const plan = req.body.plan_seleccionado || 'PYME';
    const combo = db.configuracion.combos.find((c) => c.nombre === plan) || db.configuracion.combos[1];
    const costo_base = combo ? combo.costo_mensual : 45;

    const modulos: string[] = req.body.modulos_adicionales || [];
    let costo_adicional = 0;
    modulos.forEach((m) => {
      const modPre = db.configuracion.modulos_precios.find((mp) => mp.nombre === m);
      costo_adicional += modPre ? modPre.costo_mensual : 8;
    });

    const costo_mensual = costo_base + costo_adicional;
    const valor_estimado = costo_mensual * 12; // Annual projected value

    const newProspect: ProspectOpportunityEntity = {
      id: Date.now(),
      fecha_primer_contacto: new Date().toISOString().split('T')[0],
      ultima_actividad: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
      dias_sin_seguimiento: 0,
      costo_base,
      costo_adicional,
      costo_mensual,
      valor_estimado,
      ...req.body,
    };

    db.prospectos.unshift(newProspect);

    // Auto-create Empresa and Contacto if not existing
    const existingCompany = db.empresas.find(
      (e) => e.razon_social.toLowerCase() === newProspect.empresa.toLowerCase()
    );
    if (!existingCompany && newProspect.empresa) {
      db.empresas.push({
        id: Date.now() + 1,
        razon_social: newProspect.empresa,
        nombre_comercial: newProspect.empresa,
        rnc: 'Pendiente',
        direccion: 'Distrito Nacional',
        ciudad: 'Santo Domingo',
        provincia: 'Distrito Nacional',
        telefono: newProspect.telefono,
        correo: newProspect.correo,
        sitio_web: '',
        industria: 'Comercial / Empresarial',
        responsable_comercial: newProspect.responsable_comercial,
        usuario_id: newProspect.usuario_id,
        fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
        estado_comercial: 'Prospecto',
      });
    }

    addAuditLog(
      req.body.autor || newProspect.responsable_comercial,
      'Creación',
      'Pipeline Comercial',
      newProspect.empresa,
      `Creó oportunidad para ${newProspect.empresa} (Plan ${newProspect.plan_seleccionado} - US$${newProspect.costo_mensual}/mes).`,
      ip
    );

    addNotification(
      'Nueva Oportunidad Comercial',
      `Se agregó ${newProspect.empresa} en etapa "${newProspect.etapa}".`,
      req.body.autor || 'Sistema',
      'nuevo_prospecto'
    );

    saveDatabase(db);
    res.status(201).json(newProspect);
  });

  app.put('/api/prospectos/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const index = db.prospectos.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Prospecto no encontrado' });
    }

    const old = db.prospectos[index];
    const updated = { ...old, ...req.body, id };

    // Recalculate if plan or modules changed
    if (req.body.plan_seleccionado || req.body.modulos_adicionales) {
      const combo = db.configuracion.combos.find((c) => c.nombre === updated.plan_seleccionado);
      updated.costo_base = combo ? combo.costo_mensual : 45;

      let costo_add = 0;
      (updated.modulos_adicionales || []).forEach((m: string) => {
        const modPre = db.configuracion.modulos_precios.find((mp) => mp.nombre === m);
        costo_add += modPre ? modPre.costo_mensual : 8;
      });
      updated.costo_adicional = costo_add;
      updated.costo_mensual = updated.costo_base + updated.costo_adicional;
      updated.valor_estimado = updated.costo_mensual * 12;
    }

    db.prospectos[index] = updated;

    const actionText = old.etapa !== updated.etapa
      ? `Movió etapa de "${old.etapa}" a "${updated.etapa}"`
      : `Actualizó datos de la oportunidad`;

    addAuditLog(
      req.body.autor || updated.responsable_comercial,
      'Edición',
      'Pipeline Comercial',
      updated.empresa,
      `${actionText} (${updated.empresa}).`,
      ip
    );

    if (old.etapa !== updated.etapa) {
      addNotification(
        'Cambio de Etapa en Pipeline',
        `${updated.empresa} avanzó a "${updated.etapa}".`,
        req.body.autor || 'Sistema',
        'cambio_etapa'
      );
    }

    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/prospectos/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const prospect = db.prospectos.find((p) => p.id === id);

    if (!prospect) {
      return res.status(404).json({ error: 'Prospecto no encontrado' });
    }

    db.prospectos = db.prospectos.filter((p) => p.id !== id);

    addAuditLog(
      (req.query.autor as string) || 'Administrador',
      'Eliminación',
      'Pipeline Comercial',
      prospect.empresa,
      `Eliminó oportunidad de ${prospect.empresa}.`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true, message: 'Prospecto eliminado' });
  });

  // 9. Seguimientos CRUD
  app.get('/api/seguimientos', (req, res) => {
    const db = getDatabase();
    res.json(db.seguimientos);
  });

  app.post('/api/seguimientos', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);
    const now = new Date();

    const newFollowUp: FollowUpEntity = {
      id: Date.now(),
      fecha: req.body.fecha || now.toISOString().split('T')[0],
      hora: req.body.hora || now.toTimeString().slice(0, 5),
      ...req.body,
    };

    db.seguimientos.unshift(newFollowUp);

    // Update prospect last activity & days without follow-up
    const prospectIndex = db.prospectos.findIndex((p) => p.id === Number(newFollowUp.prospecto_id));
    if (prospectIndex !== -1) {
      db.prospectos[prospectIndex].ultima_actividad = `${newFollowUp.fecha} ${newFollowUp.hora}:00`;
      db.prospectos[prospectIndex].dias_sin_seguimiento = 0;
      if (newFollowUp.fecha_proximo_seguimiento) {
        db.prospectos[prospectIndex].proximo_seguimiento = newFollowUp.fecha_proximo_seguimiento;
      }
    }

    addAuditLog(
      newFollowUp.usuario || 'Ejecutivo Comercial',
      'Creación',
      'Seguimientos',
      newFollowUp.empresa,
      `Registró ${newFollowUp.canal} (${newFollowUp.resultado}) con ${newFollowUp.empresa}.`,
      ip
    );

    saveDatabase(db);
    res.status(201).json(newFollowUp);
  });

  // 10. Tareas CRUD
  app.get('/api/tareas', (req, res) => {
    const db = getDatabase();
    res.json(db.tareas);
  });

  app.post('/api/tareas', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);

    const newTask: TaskEntity = {
      id: Date.now(),
      ...req.body,
    };

    db.tareas.unshift(newTask);

    addAuditLog(
      req.body.autor || newTask.asignado_a,
      'Creación',
      'Tareas',
      newTask.titulo,
      `Asignó tarea "${newTask.titulo}" a ${newTask.asignado_a}.`,
      ip
    );

    saveDatabase(db);
    res.status(201).json(newTask);
  });

  app.put('/api/tareas/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const index = db.tareas.findIndex((t) => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const updated = { ...db.tareas[index], ...req.body, id };
    db.tareas[index] = updated;

    addAuditLog(
      req.body.autor || updated.asignado_a,
      'Edición',
      'Tareas',
      updated.titulo,
      `Actualizó estado de tarea a "${updated.estado}".`,
      ip
    );

    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/tareas/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const task = db.tareas.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    db.tareas = db.tareas.filter((t) => t.id !== id);

    addAuditLog(
      (req.query.autor as string) || 'Administrador',
      'Eliminación',
      'Tareas',
      task.titulo,
      `Eliminó tarea: ${task.titulo}.`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true });
  });

  // 11. Usuarios Administration CRUD
  app.get('/api/usuarios', (req, res) => {
    const db = getDatabase();
    res.json(db.usuarios);
  });

  app.post('/api/usuarios', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);

    const newUser: UserEntity = {
      id: Date.now(),
      fecha_creacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
      activo: true,
      empresa: 'IB SYSTEM S.R.L.',
      ...req.body,
    };

    db.usuarios.push(newUser);

    addAuditLog(
      req.body.autor || 'Yenifer Reina Sena Suero',
      'Creación',
      'Usuarios',
      newUser.nombre,
      `Creó usuario corporativo: ${newUser.nombre} (${newUser.usuario}) con rol ${newUser.rol}.`,
      ip
    );

    addNotification(
      'Nuevo Usuario Corporativo',
      `Se habilitó la cuenta de acceso para ${newUser.nombre} (${newUser.rol}).`,
      req.body.autor || 'Administrador General',
      'usuario_creado'
    );

    saveDatabase(db);
    res.status(201).json(newUser);
  });

  app.put('/api/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const index = db.usuarios.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updated = { ...db.usuarios[index], ...req.body, id };
    db.usuarios[index] = updated;

    addAuditLog(
      req.body.autor || 'Administrador General',
      'Edición',
      'Usuarios',
      updated.nombre,
      `Modificó perfil y credenciales de ${updated.nombre}.`,
      ip
    );

    saveDatabase(db);
    res.json(updated);
  });

  app.post('/api/usuarios/:id/toggle', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const user = db.usuarios.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.activo = !user.activo;
    const accion = user.activo ? 'Reactivó' : 'Desactivó';

    addAuditLog(
      req.body.autor || 'Administrador General',
      'Edición',
      'Usuarios',
      user.nombre,
      `${accion} el acceso de ${user.nombre}.`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true, activo: user.activo });
  });

  app.post('/api/usuarios/:id/reset-password', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const user = db.usuarios.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const newPass = req.body.nueva_password || `Temporal${Math.floor(1000 + Math.random() * 9000)}*`;
    user.password_hash = newPass;
    user.password_plain = newPass;

    addAuditLog(
      req.body.autor || 'Administrador General',
      'Cambio de Contraseña',
      'Usuarios',
      user.nombre,
      `Restableció contraseña para ${user.usuario}.`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true, nueva_password: newPass });
  });

  app.delete('/api/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);
    const db = getDatabase();
    const ip = getClientIp(req);
    const user = db.usuarios.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.rol === 'Administrador General') {
      return res.status(400).json({ error: 'No se puede eliminar al Administrador General' });
    }

    db.usuarios = db.usuarios.filter((u) => u.id !== id);

    addAuditLog(
      (req.query.autor as string) || 'Administrador General',
      'Eliminación',
      'Usuarios',
      user.nombre,
      `Eliminó usuario: ${user.nombre} (${user.usuario}).`,
      ip
    );

    saveDatabase(db);
    res.json({ success: true });
  });

  // 12. Alertas Automáticas (3, 5, 7, 15 días)
  app.get('/api/alertas', (req, res) => {
    const db = getDatabase();
    const today = new Date('2026-09-30');

    const alertas = db.prospectos
      .filter((p) => p.etapa !== 'Ganado' && p.etapa !== 'Perdido')
      .map((p) => {
        const lastActStr = p.ultima_actividad || p.fecha_primer_contacto || '2026-09-20';
        const lastDate = new Date(lastActStr.split(' ')[0]);
        const diffMs = Math.abs(today.getTime() - lastDate.getTime());
        const diasSinSeguimiento = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let nivel: '3_dias' | '5_dias' | '7_dias' | '15_dias' | 'al_dia' = 'al_dia';
        if (diasSinSeguimiento >= 15) nivel = '15_dias';
        else if (diasSinSeguimiento >= 7) nivel = '7_dias';
        else if (diasSinSeguimiento >= 5) nivel = '5_dias';
        else if (diasSinSeguimiento >= 3) nivel = '3_dias';

        return {
          id: p.id,
          empresa: p.empresa,
          contacto: p.contacto_principal,
          telefono: p.telefono,
          correo: p.correo,
          responsable: p.responsable_comercial,
          etapa: p.etapa,
          ultima_actividad: p.ultima_actividad,
          proximo_seguimiento: p.proximo_seguimiento,
          dias_sin_seguimiento: diasSinSeguimiento,
          nivel,
          mensaje: diasSinSeguimiento >= 7
            ? 'Seguimiento pendiente urgente (+7 días sin actividad)'
            : `${diasSinSeguimiento} días sin actividad comercial`,
        };
      })
      .filter((a) => a.dias_sin_seguimiento >= 3)
      .sort((a, b) => b.dias_sin_seguimiento - a.dias_sin_seguimiento);

    res.json({
      total: alertas.length,
      alertas_3_dias: alertas.filter((a) => a.dias_sin_seguimiento >= 3 && a.dias_sin_seguimiento < 5).length,
      alertas_5_dias: alertas.filter((a) => a.dias_sin_seguimiento >= 5 && a.dias_sin_seguimiento < 7).length,
      alertas_7_dias: alertas.filter((a) => a.dias_sin_seguimiento >= 7 && a.dias_sin_seguimiento < 15).length,
      alertas_15_dias: alertas.filter((a) => a.dias_sin_seguimiento >= 15).length,
      items: alertas,
    });
  });

  // 13. Auditoría Logs
  app.get('/api/auditoria', (req, res) => {
    const db = getDatabase();
    res.json(db.auditoria);
  });

  app.post('/api/auditoria', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);
    const { usuario, accion, modulo, registro_afectado, detalles, usuario_id } = req.body;
    addAuditLog(
      usuario || 'Usuario',
      accion || 'Edición',
      modulo || 'General',
      registro_afectado || '',
      detalles || '',
      ip,
      usuario_id
    );
    res.json({ success: true });
  });

  // 13.1 Sincronización Masiva Persistente
  app.post('/api/db/sync', (req, res) => {
    const db = getDatabase();
    const payload = req.body;
    if (payload.empresas) db.empresas = payload.empresas;
    if (payload.contactos) db.contactos = payload.contactos;
    if (payload.prospectos) db.prospectos = payload.prospectos;
    if (payload.usuarios) db.usuarios = payload.usuarios;
    if (payload.seguimientos) db.seguimientos = payload.seguimientos;
    if (payload.tareas) db.tareas = payload.tareas;
    saveDatabase(db);
    res.json({ success: true, message: 'Base de datos sincronizada y persistida en disco.' });
  });

  // 14. Notificaciones
  app.get('/api/notificaciones', (req, res) => {
    const db = getDatabase();
    res.json(db.notificaciones);
  });

  app.post('/api/notificaciones/mark-all-read', (req, res) => {
    const db = getDatabase();
    db.notificaciones.forEach((n) => (n.leida = true));
    saveDatabase(db);
    res.json({ success: true });
  });

  // 15. Importación Inteligente (Excel / CSV de IB SYSTEM con Mapeo y Deduplicación)
  app.post('/api/importar', (req, res) => {
    const { filas, autor } = req.body;
    const ip = getClientIp(req);
    const db = getDatabase();

    if (!Array.isArray(filas) || filas.length === 0) {
      return res.status(400).json({ error: 'No se enviaron filas para importar.' });
    }

    let creados = 0;
    let actualizados = 0;

    filas.forEach((row: any, idx: number) => {
      const empresaNombre = (row.empresa || row['Empresa'] || '').trim();
      const contactoNombre = (row.contacto || row['Contacto'] || row.nombre || '').trim();
      const telefono = (row.telefono || row['Teléfono'] || row.phone || '').trim();
      const correo = (row.correo || row['Correo'] || row.email || '').trim().toLowerCase();
      const naturaleza = row.naturaleza || row['Naturaleza de las operaciones'] || 'Comercial';
      const posDigital = row.pos_digital || row['POS Digital'] || 'Sí';
      const modulosInteres = row.modulos || row['Módulos de interés'] || 'Inventario, Ventas';
      const estado = row.estado || row['Estado'] || 'Contacto';

      if (!empresaNombre && !contactoNombre) return;

      // 1. Prospecto check (Deduplication by email, phone, or company)
      const existingProspectIdx = db.prospectos.findIndex(
        (p) =>
          (correo && p.correo.toLowerCase() === correo) ||
          (telefono && p.telefono.replace(/[^0-9]/g, '') === telefono.replace(/[^0-9]/g, '')) ||
          (empresaNombre && p.empresa.toLowerCase() === empresaNombre.toLowerCase())
      );

      if (existingProspectIdx >= 0) {
        // Update existing prospect
        const existing = db.prospectos[existingProspectIdx];
        db.prospectos[existingProspectIdx] = {
          ...existing,
          contacto_principal: contactoNombre || existing.contacto_principal,
          telefono: telefono || existing.telefono,
          correo: correo || existing.correo,
          observaciones: `${existing.observaciones} | Importado: ${modulosInteres}`,
          ultima_actividad: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
        actualizados++;
      } else {
        // Create new prospect
        db.prospectos.unshift({
          id: Date.now() + idx,
          nombre: empresaNombre || contactoNombre,
          empresa: empresaNombre || 'Empresa Dominicana',
          contacto_principal: contactoNombre || 'Contacto Comercial',
          telefono: telefono || '+1 809-565-0000',
          whatsapp: telefono || '+1 809-565-0000',
          correo: correo || 'contacto@empresa.com.do',
          canal_captacion: 'Importación Excel',
          producto_principal: posDigital === 'Sí' ? 'POS Digital' : 'Facturación Electrónica',
          plan_seleccionado: 'PYME',
          costo_base: 45,
          modulos_adicionales: modulosInteres.split(',').map((s: string) => s.trim()),
          costo_adicional: 16,
          costo_mensual: 61,
          valor_estimado: 732,
          cantidad_usuarios: 3,
          responsable_comercial: autor || 'Yenifer Reina Sena Suero',
          usuario_id: 1,
          etapa: (['Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido'].includes(estado)
            ? estado
            : 'Contacto') as any,
          fecha_primer_contacto: new Date().toISOString().split('T')[0],
          ultima_actividad: new Date().toISOString().replace('T', ' ').slice(0, 19),
          proximo_seguimiento: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + ' 10:00:00',
          dias_sin_seguimiento: 0,
          observaciones: `Registro importado desde archivo externo. Naturaleza: ${naturaleza}. Módulos: ${modulosInteres}.`,
          etiquetas: 'Importado, IB SYSTEM, Lead',
          fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
        creados++;
      }

      // 2. Auto-sync with Empresa
      const existingComp = db.empresas.find(
        (e) => e.razon_social.toLowerCase() === empresaNombre.toLowerCase()
      );
      if (!existingComp && empresaNombre) {
        db.empresas.unshift({
          id: Date.now() + 5000 + idx,
          razon_social: empresaNombre,
          nombre_comercial: empresaNombre,
          rnc: 'Pendiente',
          direccion: 'Distrito Nacional',
          ciudad: 'Santo Domingo',
          provincia: 'Distrito Nacional',
          telefono,
          correo,
          sitio_web: '',
          industria: naturaleza || 'Comercial',
          responsable_comercial: autor || 'Yenifer Reina Sena Suero',
          usuario_id: 1,
          fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
          estado_comercial: 'Prospecto',
        });
      }

      // 3. Auto-sync with Contacto
      const existingCont = db.contactos.find(
        (c) =>
          (correo && c.correo.toLowerCase() === correo) ||
          (contactoNombre && c.nombre.toLowerCase() === contactoNombre.toLowerCase())
      );
      if (!existingCont && contactoNombre) {
        db.contactos.unshift({
          id: Date.now() + 10000 + idx,
          nombre: contactoNombre.split(' ')[0] || contactoNombre,
          apellido: contactoNombre.split(' ').slice(1).join(' ') || '',
          empresa: empresaNombre,
          cargo: 'Decisor Comercial',
          telefono,
          whatsapp: telefono,
          correo,
          direccion: 'Distrito Nacional',
          ciudad: 'Santo Domingo',
          provincia: 'Distrito Nacional',
          naturaleza_negocio: naturaleza,
          responsable_comercial: autor || 'Yenifer Reina Sena Suero',
          usuario_id: 1,
          ultimo_contacto: new Date().toISOString().replace('T', ' ').slice(0, 19),
          proximo_seguimiento: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + ' 10:00:00',
          notas: `Registrado automáticamente desde importación masiva.`,
          etiquetas: 'Prospecto, IB SYSTEM',
          fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });
      }
    });

    addAuditLog(
      autor || 'Administrador',
      'Importación',
      'Importaciones',
      `Lote Excel (${filas.length} registros)`,
      `Procesó archivo de importación IB SYSTEM: ${creados} nuevos, ${actualizados} actualizados.`,
      ip
    );

    addNotification(
      'Importación de Prospectos Completada',
      `Se procesaron ${filas.length} filas: ${creados} registros creados y ${actualizados} actualizados.`,
      autor || 'Sistema',
      'importacion'
    );

    saveDatabase(db);

    res.json({
      success: true,
      creados,
      actualizados,
      total: filas.length,
      message: `Importación completada: ${creados} creados, ${actualizados} actualizados.`,
    });
  });

  // 16. Configuración de Precios y Combos
  app.get('/api/configuracion', (req, res) => {
    const db = getDatabase();
    res.json(db.configuracion);
  });

  app.put('/api/configuracion', (req, res) => {
    const db = getDatabase();
    const ip = getClientIp(req);
    db.configuracion = { ...db.configuracion, ...req.body };

    addAuditLog(
      req.body.autor || 'Administrador General',
      'Edición',
      'Configuración',
      'Parámetros del Sistema',
      'Actualizó tarifas de combos, precios de módulos e información de la empresa.',
      ip
    );

    saveDatabase(db);
    res.json(db.configuracion);
  });

  // 17. MySQL DDL Schema Dump Download
  app.get('/api/mysql-dump', (req, res) => {
    const candidates = [
      path.resolve(process.cwd(), 'vscode-crmcomercial/database/schema.sql'),
      path.resolve(process.cwd(), 'src/data/schema.sql'),
    ];
    for (const sqlPath of candidates) {
      if (fs.existsSync(sqlPath)) {
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', 'attachment; filename="crmcomercial_ibsystem_mysql.sql"');
        return res.sendFile(sqlPath);
      }
    }
    res.status(404).json({ error: 'Esquema MySQL no encontrado.' });
  });

  // 18. Standalone Pure HTML5/CSS3/Vanilla JS Route
  app.use('/standalone', express.static(path.join(process.cwd(), 'vscode-crmcomercial', 'public')));

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CRMComercial Backend] Servidor Express activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
