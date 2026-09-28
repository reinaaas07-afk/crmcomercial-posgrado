import React, { useState } from 'react';
import {
  Database,
  Key,
  Link2,
  FileCode,
  Copy,
  Download,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ENTIDADES_ERD, MYSQL_DDL_SCHEMA } from '../../data/softwareDocs';

export const ERDViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagrama' | 'sql'>('diagrama');
  const [copied, setCopied] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(MYSQL_DDL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([MYSQL_DDL_SCHEMA], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crmcomercial_mysql_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Institutional Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Base de Datos Relacional · MySQL 8.0 (InnoDB)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Modelo Entidad - Relación (ERD) & Script DDL
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Estructura normalizada en 3FN con integridad referencial, índices y llaves foráneas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('diagrama')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeTab === 'diagrama'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Diagrama ERD Visual
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Script DDL SQL (MySQL)
          </button>
        </div>
      </div>

      {activeTab === 'diagrama' ? (
        <div className="space-y-6">
          {/* Relational Mapping Summary Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-300 font-semibold">Relaciones Clave:</span>
              <span className="text-slate-400 font-mono">usuarios (1) ── (N) prospectos</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">etapas_pipeline (1) ── (N) prospectos</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">prospectos (1) ── (N) seguimientos</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">prospectos (1) ── (N) tareas</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> PK (Llave Primaria)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> FK (Llave Foránea)
              </span>
            </div>
          </div>

          {/* Grid of Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENTIDADES_ERD.map((ent) => {
              const isSelected = selectedEntity === ent.tabla;

              return (
                <div
                  key={ent.tabla}
                  onClick={() => setSelectedEntity(isSelected ? null : ent.tabla)}
                  className={`bg-slate-900 border rounded-xl overflow-hidden shadow-md transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Table Header */}
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="font-mono font-bold text-white text-sm">{ent.tabla}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      InnoDB
                    </span>
                  </div>

                  <p className="px-3 py-2 text-[11px] text-slate-400 bg-slate-950/40 border-b border-slate-800/80">
                    {ent.descripcion}
                  </p>

                  {/* Columns List */}
                  <div className="divide-y divide-slate-800/60 max-h-[320px] overflow-y-auto text-xs">
                    {ent.columnas.map((col) => (
                      <div
                        key={col.nombre}
                        className="px-3 py-2 hover:bg-slate-850/50 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {col.esPK && (
                            <span title="Llave Primaria">
                              <Key className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          )}
                          {col.esFK && (
                            <span title={`Llave Foránea -> ${col.fkTabla}`}>
                              <Link2 className="w-3 h-3 text-blue-400 shrink-0" />
                            </span>
                          )}
                          {!col.esPK && !col.esFK && (
                            <span className="w-3 h-3 block shrink-0" />
                          )}
                          <span
                            className={`font-mono text-xs truncate ${
                              col.esPK
                                ? 'font-bold text-amber-300'
                                : col.esFK
                                ? 'font-semibold text-blue-300'
                                : 'text-slate-200'
                            }`}
                          >
                            {col.nombre}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {col.tipo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Foreign Key targets preview */}
                  <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                    {ent.columnas
                      .filter((c) => c.esFK)
                      .map((c) => (
                        <div key={c.nombre} className="text-blue-400 flex items-center gap-1">
                          <ArrowRight className="w-2.5 h-2.5" />
                          <span>FK {c.nombre} → {c.fkTabla}</span>
                        </div>
                      ))}
                    {ent.columnas.filter((c) => c.esFK).length === 0 && (
                      <span className="text-slate-500 italic">Sin dependencias externas</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SQL DDL Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-2">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-bold text-white">crmcomercial_mysql.sql</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Sentencias DDL & DML compatibles con MySQL Workbench / phpMyAdmin</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Script'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .sql</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed max-h-[600px] select-all">
            {MYSQL_DDL_SCHEMA}
          </pre>
        </div>
      )}
    </div>
  );
};
