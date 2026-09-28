import React, { useState } from 'react';
import {
  Server,
  FolderTree,
  FileCode,
  Layers,
  Database,
  Globe,
  Copy,
  Check,
  Download,
  Code2,
  Terminal,
} from 'lucide-react';
import { ARCHIVOS_PROYECTO_BACKEND, CodigoArchivo } from '../../data/softwareDocs';

export const ArchitectureViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'capas' | 'carpetas'>('capas');
  const [selectedFile, setSelectedFile] = useState<CodigoArchivo>(ARCHIVOS_PROYECTO_BACKEND[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.contenido);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.contenido], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.nombre;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Arquitectura de Software & Estructura de Código</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Arquitectura en Capas & Repositorio Backend
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Stack: Python 3.11+, Flask REST API, SQLAlchemy 3.x, MySQL 8.0 y Frontend Bootstrap 5.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('capas')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeTab === 'capas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Diagrama de Arquitectura
          </button>
          <button
            onClick={() => setActiveTab('carpetas')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeTab === 'carpetas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Estructura de Carpetas & Código
          </button>
        </div>
      </div>

      {activeTab === 'capas' ? (
        /* Architecture Diagram */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Layer 1 */}
            <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="w-1.5 bg-blue-500 absolute left-0 top-0 bottom-0" />
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>1. Capa de Presentación</span>
              </div>
              <h4 className="text-base font-bold text-white">Frontend Web Client</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interfaz cliente construida con <strong>HTML5, CSS3, JavaScript y Bootstrap 5</strong>. Renderiza vistas responsivas, manipulación de DOM y peticiones asíncronas vía Fetch API a los endpoints REST.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                Tecnología: HTML5 + Bootstrap + JS
              </div>
            </div>

            {/* Layer 2 */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="w-1.5 bg-emerald-500 absolute left-0 top-0 bottom-0" />
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Server className="w-4 h-4" />
                <span>2. Capa de Aplicación</span>
              </div>
              <h4 className="text-base font-bold text-white">API RESTful Flask</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Servidor web en <strong>Python con Flask</strong>. Organizado en Blueprints modulares para Prospectos, Pipeline, Seguimientos, Tareas y Reportes con autenticación JWT y CORS.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                Framework: Flask 3.0 + Blueprints
              </div>
            </div>

            {/* Layer 3 */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="w-1.5 bg-purple-500 absolute left-0 top-0 bottom-0" />
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>3. Acceso a Datos (ORM)</span>
              </div>
              <h4 className="text-base font-bold text-white">SQLAlchemy ORM</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mapeo objeto-relacional tipado con <strong>Flask-SQLAlchemy</strong>. Administra transacciones ACID, pool de conexiones, lazy loading de relaciones foráneas y consultas optimizadas.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                ORM: SQLAlchemy 3.1 + PyMySQL
              </div>
            </div>

            {/* Layer 4 */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="w-1.5 bg-amber-500 absolute left-0 top-0 bottom-0" />
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>4. Capa de Persistencia</span>
              </div>
              <h4 className="text-base font-bold text-white">MySQL 8.0 Database</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Servidor de base de datos relacional <strong>MySQL 8.0 con motor InnoDB</strong>. Garantiza integridad referencial mediante Foreign Keys con reglas ON DELETE RESTRICT / CASCADE.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                Motor: MySQL 8.0 (InnoDB)
              </div>
            </div>
          </div>

          {/* Data Flow Diagram Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Flujo de Peticiones y Respuestas (Ciclo Operacional)
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto space-y-2">
              <div className="text-blue-400">
                [Usuario en Navegador Bootstrap]
              </div>
              <div className="pl-4 text-slate-400">
                {'│── (1) HTTP POST /api/prospectos { nombre, empresa, etapa_id: 1, ... }'}
              </div>
              <div className="text-emerald-400">
                ▼ [Servidor Flask: prospectos_bp.py]
              </div>
              <div className="pl-4 text-slate-400">
                │── (2) Validación de datos de entrada (Marshmallow)
                <br />
                │── (3) Instancia objeto Prospecto() y agrega a db.session
              </div>
              <div className="text-purple-400">
                ▼ [SQLAlchemy ORM Session]
              </div>
              <div className="pl-4 text-slate-400">
                │── (4) Genera SQL: INSERT INTO prospectos (nombre, empresa, etapa_id, ...) VALUES (...)
              </div>
              <div className="text-amber-400">
                ▼ [Base de Datos MySQL 8.0]
              </div>
              <div className="pl-4 text-slate-400">
                │── (5) Ejecución con motor InnoDB, verificación de Foreign Keys y asignación de AUTO_INCREMENT id
              </div>
              <div className="text-emerald-400">
                ▲ [Flask Response JSON 201 Created]
              </div>
              <div className="pl-4 text-slate-400">
                {'│── (6) Retorna { id: 111, nombre: "...", etapa: "Nuevo Lead", ... }'}
              </div>
              <div className="text-blue-400">
                [Frontend JavaScript: Actualización reactiva del Tablero Kanban y Tabla]
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Folder Structure & Code Viewer */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree list */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Estructura del Proyecto crmcomercial/</span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              {ARCHIVOS_PROYECTO_BACKEND.map((file) => {
                const isSelected = selectedFile.path === file.path;

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-4 h-4 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Haz clic en cualquier archivo para inspeccionar su código fuente Python / Flask.
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-white">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.descripcion}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed flex-1 max-h-[550px]">
              {selectedFile.contenido}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
