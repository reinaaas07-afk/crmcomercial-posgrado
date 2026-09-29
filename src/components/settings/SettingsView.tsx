import React, { useState } from 'react';
import {
  Settings,
  Building,
  Tag,
  Sliders,
  Layers,
  Users,
  Shield,
  Download,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  FileCode,
  Save,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  UsuarioDB,
  SubcuentaDB,
  EtiquetaConfigDB,
  CampoPersonalizadoDB,
} from '../../types/schema';

interface SettingsViewProps {
  users?: UsuarioDB[];
  subcuentas?: SubcuentaDB[];
  etiquetasConfig?: EtiquetaConfigDB[];
  camposPersonalizados?: CampoPersonalizadoDB[];
  onUpdateEtiquetas?: (etiquetas: EtiquetaConfigDB[]) => void;
  onUpdateCampos?: (campos: CampoPersonalizadoDB[]) => void;
  onOpenCreateUserModal?: () => void;
  onNavigateSection?: (section: any) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  users = [],
  subcuentas = [],
  etiquetasConfig = [],
  camposPersonalizados = [],
  onUpdateEtiquetas,
  onUpdateCampos,
  onOpenCreateUserModal,
  onNavigateSection,
  onResetDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'empresa' | 'etiquetas' | 'campos' | 'modulos' | 'exportar'>('empresa');
  const [savedNotification, setSavedNotification] = useState(false);

  // Empresa ITHOT fields
  const [empresaNombre, setEmpresaNombre] = useState('ITHOT Technologies Dominicana S.R.L.');
  const [nombreComercial, setNombreComercial] = useState('ITHOT');
  const [rnc, setRnc] = useState('1-31-89745-2');
  const [moneda, setMoneda] = useState('DOP (RD$) - Peso Dominicano');
  const [direccion, setDireccion] = useState('Av. Winston Churchill #1099, Torre Acrópolis, Nivel 14');
  const [ciudad, setCiudad] = useState('Santo Domingo');
  const [provincia, setProvincia] = useState('Distrito Nacional');
  const [telefono, setTelefono] = useState('+1 809-567-8900');
  const [emailOficial, setEmailOficial] = useState('contacto@ithot.com.do');
  const [sitioWeb, setSitioWeb] = useState('https://ithot.com.do');

  // Local state for tags
  const [localTags, setLocalTags] = useState<EtiquetaConfigDB[]>(etiquetasConfig);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [newTagCategoria, setNewTagCategoria] = useState('Módulo');

  // Local state for custom fields
  const [localCampos, setLocalCampos] = useState<CampoPersonalizadoDB[]>(camposPersonalizados);
  const [newCampoLabel, setNewCampoLabel] = useState('');
  const [newCampoModulo, setNewCampoModulo] = useState<'Contactos' | 'Prospectos' | 'Ambos'>('Ambos');
  const [newCampoTipo, setNewCampoTipo] = useState<'Texto' | 'Número' | 'Fecha' | 'Selección' | 'Moneda'>('Texto');

  // Active Modules config
  const [modulesConfig, setModulesConfig] = useState({
    contactos: true,
    prospectos: true,
    pipeline: true,
    seguimientos: true,
    tareas: true,
    calendario: true,
    reportes: true,
    importaciones: true,
    exportaciones: true,
    usuarios: true,
    auditoria: true,
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Add tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag: EtiquetaConfigDB = {
      id: Date.now(),
      nombre: newTagName.trim(),
      color: newTagColor,
      categoria: newTagCategoria,
      activa: true,
    };

    const updated = [...localTags, newTag];
    setLocalTags(updated);
    if (onUpdateEtiquetas) onUpdateEtiquetas(updated);
    setNewTagName('');
  };

  // Delete tag
  const handleDeleteTag = (id: number) => {
    const updated = localTags.filter((t) => t.id !== id);
    setLocalTags(updated);
    if (onUpdateEtiquetas) onUpdateEtiquetas(updated);
  };

  // Add custom field
  const handleAddCampo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampoLabel.trim()) return;

    const newField: CampoPersonalizadoDB = {
      id: Date.now(),
      modulo: newCampoModulo,
      nombre_campo: newCampoLabel.toLowerCase().replace(/\s+/g, '_'),
      etiqueta: newCampoLabel.trim(),
      tipo: newCampoTipo,
      requerido: false,
      activo: true,
    };

    const updated = [...localCampos, newField];
    setLocalCampos(updated);
    if (onUpdateCampos) onUpdateCampos(updated);
    setNewCampoLabel('');
  };

  // Delete custom field
  const handleDeleteCampo = (id: number) => {
    const updated = localCampos.filter((c) => c.id !== id);
    setLocalCampos(updated);
    if (onUpdateCampos) onUpdateCampos(updated);
  };

  // Generate and download MySQL SQL script
  const handleDownloadSQL = () => {
    const sqlContent = `-- ==========================================================
-- SISTEMA CRMComercial - EMPRESA ITHOT
-- Script de Base de Datos MySQL 8.0 / MariaDB
-- Desarrollado para: Yenifer Reina Sena Suero (Administrador General)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS crmcomercial_ithot 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE crmcomercial_ithot;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('Administrador General', 'Administrador', 'Supervisor Comercial', 'Ejecutivo Comercial', 'Analista Comercial', 'Consulta') NOT NULL DEFAULT 'Ejecutivo Comercial',
  telefono VARCHAR(30) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME NULL,
  empresa VARCHAR(100) NOT NULL DEFAULT 'ITHOT',
  subcuenta VARCHAR(150) NULL DEFAULT 'ITHOT Sede Principal'
) ENGINE=InnoDB;

-- Tabla: contactos
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NULL,
  empresa VARCHAR(150) NOT NULL,
  cargo VARCHAR(100) NULL,
  telefono VARCHAR(30) NULL,
  whatsapp VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  direccion VARCHAR(255) NULL,
  ciudad VARCHAR(100) NULL,
  provincia VARCHAR(100) NULL,
  naturaleza_negocio VARCHAR(150) NULL,
  usuario_id INT NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultima_interaccion DATETIME NULL,
  proximo_seguimiento DATETIME NULL,
  estado_comercial VARCHAR(50) NOT NULL DEFAULT 'Prospecto',
  observaciones TEXT NULL,
  etiquetas TEXT NULL,
  producto_interes VARCHAR(100) NULL,
  modulo_interes VARCHAR(100) NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla: etapas_pipeline
CREATE TABLE IF NOT EXISTS etapas_pipeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  orden INT NOT NULL,
  color VARCHAR(20) NOT NULL,
  descripcion TEXT NULL,
  es_etapa_final TINYINT(1) NOT NULL DEFAULT 0,
  es_ganado TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Tabla: prospectos (Oportunidades Pipeline)
CREATE TABLE IF NOT EXISTS prospectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NULL,
  empresa VARCHAR(150) NOT NULL,
  cargo VARCHAR(100) NULL,
  email VARCHAR(150) NULL,
  telefono VARCHAR(30) NULL,
  whatsapp VARCHAR(30) NULL,
  fuente VARCHAR(50) NOT NULL DEFAULT 'Sitio Web',
  etapa_id INT NOT NULL,
  usuario_id INT NOT NULL,
  contacto_id INT NULL,
  valor_estimado DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_proximo_seguimiento DATETIME NULL,
  notas TEXT NULL,
  etiquetas TEXT NULL,
  FOREIGN KEY (etapa_id) REFERENCES etapas_pipeline(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: auditoria_sistema
CREATE TABLE IF NOT EXISTS auditoria_sistema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  usuario_id INT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  accion VARCHAR(50) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  registro_afectado VARCHAR(255) NOT NULL,
  detalles TEXT NOT NULL,
  ip_origen VARCHAR(45) NULL DEFAULT '190.167.34.12'
) ENGINE=InnoDB;

-- Insertar Usuarios Iniciales Requeridos
INSERT INTO usuarios (nombre, apellido, email, usuario, password_hash, rol, telefono, empresa, subcuenta)
VALUES 
('Yenifer Reina Sena Suero', 'Sena Suero', 'yenifer.sena@ithot.com.do', 'ysena', '$2b$12$ITHOT_ADMIN_HASH', 'Administrador General', '+1 809-567-8900', 'ITHOT', 'ITHOT Sede Principal'),
('Armando Montes de Oca Hesni', 'Montes de Oca', 'armando.montes@ithot.com.do', 'amontes', '$2b$12$ITHOT_SUP_HASH', 'Supervisor Comercial', '+1 829-876-5432', 'ITHOT', 'ITHOT Sede Principal'),
('Felix Manuel Robles', 'Robles', 'felix.robles@ithot.com.do', 'frobles', '$2b$12$ITHOT_EXEC_HASH', 'Ejecutivo Comercial', '+1 849-987-6543', 'ITHOT', 'ITHOT Sede Principal'),
('Ana Julia Alcántara', 'Alcántara', 'ana.alcantara@ithot.com.do', 'aalcantara', '$2b$12$ITHOT_ANA_HASH', 'Analista Comercial', '+1 809-456-7890', 'ITHOT', 'ITHOT Sede Principal')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
`;

    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crmcomercial_ithot_mysql.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <Settings className="w-4 h-4" />
            <span>Configuración Integral de la Plataforma · Empresa ITHOT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Panel de Configuración del CRM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Personalización de empresa, etiquetas comerciales, campos adicionales, módulos y exportación de código.
          </p>
        </div>

        {savedNotification && (
          <div className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cambios guardados exitosamente</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'empresa'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Información de la Empresa</span>
        </button>

        <button
          onClick={() => setActiveTab('etiquetas')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'etiquetas'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Etiquetas Corporativas ({localTags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campos')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'campos'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Campos Personalizados ({localCampos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('modulos')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'modulos'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Módulos Activos</span>
        </button>

        <button
          onClick={() => setActiveTab('exportar')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'exportar'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Exportar Código y MySQL</span>
        </button>
      </div>

      {/* TAB 1: EMPRESA */}
      {activeTab === 'empresa' && (
        <form onSubmit={handleSaveGeneral} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">Datos Corporativos de ITHOT</h3>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Información</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Razón Social</label>
              <input
                type="text"
                value={empresaNombre}
                onChange={(e) => setEmpresaNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">RNC Fiscal (DGII)</label>
              <input
                type="text"
                value={rnc}
                onChange={(e) => setRnc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Moneda Principal</label>
              <input
                type="text"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Central</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Oficial</label>
              <input
                type="email"
                value={emailOficial}
                onChange={(e) => setEmailOficial(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Principal</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sitio Web</label>
              <input
                type="text"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: ETIQUETAS */}
      {activeTab === 'etiquetas' && (
        <div className="space-y-6">
          {/* Add Tag Form */}
          <form onSubmit={handleAddTag} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">Crear Nueva Etiqueta Comercial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Etiqueta</label>
                <input
                  type="text"
                  placeholder="Ej. e-CF Emisor"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                <select
                  value={newTagCategoria}
                  onChange={(e) => setNewTagCategoria(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Módulo">Módulo ITHOT</option>
                  <option value="Producto">Producto ITHOT</option>
                  <option value="Estado">Estado Comercial</option>
                  <option value="Fiscal DGII">Fiscal DGII</option>
                  <option value="Prioridad">Prioridad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Color Identificador</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
                  />
                  <span className="text-xs font-mono text-slate-300">{newTagColor}</span>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Etiqueta</span>
              </button>
            </div>
          </form>

          {/* Tags Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-bold text-white text-sm mb-3">Catálogo Operativo de Etiquetas ({localTags.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {localTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-white truncate block">{tag.nombre}</span>
                      <span className="text-[10px] text-slate-400 block">{tag.categoria}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Eliminar etiqueta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAMPOS PERSONALIZADOS */}
      {activeTab === 'campos' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCampo} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">Crear Campo Personalizado</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre / Etiqueta del Campo</label>
                <input
                  type="text"
                  placeholder="Ej. Cantidad de Sucursales"
                  value={newCampoLabel}
                  onChange={(e) => setNewCampoLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Módulo Aplicable</label>
                <select
                  value={newCampoModulo}
                  onChange={(e) => setNewCampoModulo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Ambos">Contactos y Prospectos</option>
                  <option value="Contactos">Solo Contactos</option>
                  <option value="Prospectos">Solo Prospectos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Dato</label>
                <select
                  value={newCampoTipo}
                  onChange={(e) => setNewCampoTipo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Texto">Texto</option>
                  <option value="Número">Número</option>
                  <option value="Moneda">Moneda (DOP)</option>
                  <option value="Fecha">Fecha</option>
                  <option value="Selección">Selección Múltiple</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Campo</span>
              </button>
            </div>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Campo</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {localCampos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-bold text-white">{c.etiqueta}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{c.modulo}</td>
                    <td className="py-3 px-4 text-blue-400 font-mono">{c.tipo}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Activo
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCampo(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MODULOS */}
      {activeTab === 'modulos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Configuración de Módulos Activos en el CRM</h3>
          <p className="text-xs text-slate-400">
            Habilita o deshabilita la visibilidad de los submódulos institucionales para toda la organización.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {[
              { key: 'contactos', label: 'Directorio de Contactos' },
              { key: 'prospectos', label: 'Gestión de Prospectos' },
              { key: 'pipeline', label: 'Pipeline Comercial Kanban' },
              { key: 'seguimientos', label: 'Seguimientos Multicanal' },
              { key: 'tareas', label: 'Tareas Comerciales' },
              { key: 'calendario', label: 'Calendario de Visitas' },
              { key: 'reportes', label: 'Reportes y Analítica' },
              { key: 'importaciones', label: 'Módulo de Importaciones' },
              { key: 'exportaciones', label: 'Módulo de Exportaciones' },
              { key: 'usuarios', label: 'Usuarios, Roles y Subcuentas' },
              { key: 'auditoria', label: 'Auditoría del Sistema' },
            ].map((m) => (
              <label
                key={m.key}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-200">{m.label}</span>
                <input
                  type="checkbox"
                  checked={(modulesConfig as any)[m.key]}
                  onChange={() =>
                    setModulesConfig((prev: any) => ({
                      ...prev,
                      [m.key]: !prev[m.key],
                    }))
                  }
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPORTAR CODIGO & MYSQL */}
      {activeTab === 'exportar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Exportación del Proyecto & Conexión MySQL / Node.js
              </h3>
              <p className="text-xs text-slate-400">
                La plataforma está preparada para abrirse en Visual Studio Code y desplegarse en servidores locales o remotos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Script de Base de Datos MySQL (.sql)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descarga el script completo con la creación de tablas relacionales, llaves foráneas, índices, restricciones y datos iniciales para MySQL 8.0.
              </p>
              <button
                type="button"
                onClick={handleDownloadSQL}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Descargar crmcomercial_ithot_mysql.sql</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <span>Restablecer Datos de Demostración</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Restaura la base de datos relacional local a su estado institucional inicial con los 4 usuarios corporativos y datos de prueba.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Restablecer los datos relacionales a la configuración inicial de ITHOT?')) {
                    onResetDemoData();
                  }
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Restablecer Base de Datos Local</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
