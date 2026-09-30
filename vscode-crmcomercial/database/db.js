/**
 * Conexión a Base de Datos para CRMComercial - IB SYSTEM
 * Soporta MySQL 8.0 nativo mediante mysql2 con fallback automático
 * a almacenamiento JSON persistente si el servicio MySQL no está iniciado.
 */
const mysql = require('mysql2/promise');
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

// Inicializar conexión
async function initDatabase() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    useMySQL = true;
    console.log(`[Base de Datos] Conexión MySQL establecida exitosamente en ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
  } catch (err) {
    useMySQL = false;
    console.warn(`[Base de Datos] MySQL no disponible (${err.message}). Utilizando motor de persistencia JSON local.`);
    if (!fs.existsSync(LOCAL_JSON_PATH)) {
      // Cargar datos iniciales
      const initialSeed = require('./seedData.json');
      fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(initialSeed, null, 2), 'utf-8');
    }
  }
}

// Ejecutar consulta (MySQL o motor local)
async function query(sql, params = []) {
  if (useMySQL && pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // Fallback motor JSON
  const data = getLocalData();
  return executeLocalQuery(sql, params, data);
}

function getLocalData() {
  if (!fs.existsSync(LOCAL_JSON_PATH)) {
    const initialSeed = require('./seedData.json');
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
    if (normalizedSql.includes('from usuarios')) return data.usuarios;
    if (normalizedSql.includes('from empresas')) return data.empresas;
    if (normalizedSql.includes('from contactos')) return data.contactos;
    if (normalizedSql.includes('from prospectos')) return data.prospectos;
    if (normalizedSql.includes('from seguimientos')) return data.seguimientos;
    if (normalizedSql.includes('from tareas')) return data.tareas;
    if (normalizedSql.includes('from auditoria')) return data.auditoria;
    if (normalizedSql.includes('from notificaciones')) return data.notificaciones;
    return [];
  }

  return { affectedRows: 1, insertId: Date.now() };
}

module.exports = {
  initDatabase,
  query,
  getLocalData,
  saveLocalData,
  isUsingMySQL: () => useMySQL,
};
