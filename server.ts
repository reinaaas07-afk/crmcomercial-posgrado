import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health and Status API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      system: 'CRMComercial',
      company: 'ITHOT S.R.L.',
      database: 'MySQL 8.0 Engine Compatible',
      time: new Date().toISOString(),
    });
  });

  // MySQL DDL Schema Dump Download
  app.get('/api/mysql-dump', (req, res) => {
    const sqlPath = path.resolve(process.cwd(), 'src/data/schema.sql');
    if (fs.existsSync(sqlPath)) {
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', 'attachment; filename="crm_comercial_mysql.sql"');
      return res.sendFile(sqlPath);
    }
    res.status(404).json({ error: 'Esquema MySQL no encontrado.' });
  });

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
    console.log(`[CRMComercial Backend] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
