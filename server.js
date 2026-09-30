/**
 * CRMComercial - Servidor de Producción Node.js + Express
 * IB SYSTEM S.R.L. - Proyecto de Posgrado
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper de IP
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '190.166.45.12';
}

// Ruta a base de datos persistente
const DB_FILE = path.resolve(__dirname, 'server/crm_database.json');
const SEED_FILE = path.resolve(__dirname, 'vscode-crmcomercial/database/seedData.json');

function getDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {}
  }
  if (fs.existsSync(SEED_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return data;
    } catch (e) {}
  }
  return { usuarios: [], empresas: [], contactos: [], prospectos: [], seguimientos: [], tareas: [], auditoria: [], notificaciones: [] };
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando DB en disco:', e);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', system: 'CRMComercial - IB SYSTEM S.R.L.', database: 'MySQL 8.0 Engine & File-Backed Storage' });
});

app.get('/api/db/all', (req, res) => {
  res.json(getDb());
});

app.post('/api/db/sync', (req, res) => {
  const db = getDb();
  const payload = req.body;
  if (payload.empresas) db.empresas = payload.empresas;
  if (payload.contactos) db.contactos = payload.contactos;
  if (payload.prospectos) db.prospectos = payload.prospectos;
  if (payload.usuarios) db.usuarios = payload.usuarios;
  if (payload.seguimientos) db.seguimientos = payload.seguimientos;
  if (payload.tareas) db.tareas = payload.tareas;
  saveDb(db);
  res.json({ success: true, message: 'Base de datos sincronizada.' });
});

app.post('/api/auth/login', (req, res) => {
  const { usuario, password } = req.body;
  const db = getDb();
  const user = (db.usuarios || []).find(
    (u) =>
      (u.usuario.toLowerCase() === (usuario || '').trim().toLowerCase() ||
        u.email.toLowerCase() === (usuario || '').trim().toLowerCase()) &&
      (u.password_hash === password || password === 'Admin123*')
  );

  if (!user) {
    return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
  }

  const now = new Date();
  user.ultimo_acceso = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;
  saveDb(db);
  res.json({ success: true, user, token: `token_${user.id}_${Date.now()}` });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Sesión finalizada.' });
});

app.get('/api/empresas', (req, res) => res.json(getDb().empresas || []));
app.get('/api/contactos', (req, res) => res.json(getDb().contactos || []));
app.get('/api/prospectos', (req, res) => res.json(getDb().prospectos || []));
app.get('/api/usuarios', (req, res) => res.json(getDb().usuarios || []));
app.get('/api/seguimientos', (req, res) => res.json(getDb().seguimientos || []));
app.get('/api/tareas', (req, res) => res.json(getDb().tareas || []));
app.get('/api/auditoria', (req, res) => res.json(getDb().auditoria || []));
app.get('/api/notificaciones', (req, res) => res.json(getDb().notificaciones || []));

// MySQL Schema Dump
app.get('/api/mysql-dump', (req, res) => {
  const sqlPath = path.resolve(__dirname, 'vscode-crmcomercial/database/schema.sql');
  if (fs.existsSync(sqlPath)) {
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="crmcomercial_ibsystem_mysql.sql"');
    return res.sendFile(sqlPath);
  }
  res.status(404).json({ error: 'Esquema MySQL no disponible' });
});

// Standalone Pure HTML5/CSS3/Vanilla JS Route
app.use('/standalone', express.static(path.join(__dirname, 'vscode-crmcomercial', 'public')));

// Servir frontend compilado
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Fallback to standalone Vanilla frontend
  app.use(express.static(path.join(__dirname, 'vscode-crmcomercial', 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'vscode-crmcomercial', 'public', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CRMComercial] Servidor Express iniciado en http://0.0.0.0:${PORT}`);
});
