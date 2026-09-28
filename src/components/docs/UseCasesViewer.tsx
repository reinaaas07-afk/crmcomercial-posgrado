import React, { useState } from 'react';
import {
  Users,
  Shield,
  Layers,
  CheckCircle2,
  FileText,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { CASOS_DE_USO, CasoDeUso } from '../../data/softwareDocs';

export const UseCasesViewer: React.FC = () => {
  const [selectedCU, setSelectedCU] = useState<CasoDeUso>(CASOS_DE_USO[0]);
  const [filterModulo, setFilterModulo] = useState<string>('all');

  const filteredCUs = CASOS_DE_USO.filter(
    (cu) => filterModulo === 'all' || cu.modulo === filterModulo
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
          <Workflow className="w-4 h-4" />
          <span>Ingeniería de Requerimientos · Modelado UML</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Diagrama y Especificación de Casos de Uso
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Matriz de casos de uso funcionales, especificación de actores y flujos de eventos.
        </p>
      </div>

      {/* Actors definition banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Actor: Administrador</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Responsable del control total del sistema, configuración global, gestión de cuentas de usuario, esquemas de pipeline y respaldos DDL.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Actor: Supervisor Comercial</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supervisa el embudo de ventas global, audita la calidad de los seguimientos, reasigna prospectos entre asesores y consulta métricas gerenciales.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Actor: Asesor Comercial</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ejecuta la captura de prospectos asignados, registra interacciones de seguimiento (llamadas, WhatsApp), agenda reuniones y gestiona tareas.
          </p>
        </div>
      </div>

      {/* Two columns: Cases List + Detail Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Use Cases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Casos de Uso Catalogados ({filteredCUs.length})
            </span>
          </div>

          <div className="space-y-2">
            {CASOS_DE_USO.map((cu) => {
              const isSelected = selectedCU.codigo === cu.codigo;

              return (
                <div
                  key={cu.codigo}
                  onClick={() => setSelectedCU(cu)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">{cu.codigo}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {cu.modulo}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-xs mt-1">{cu.nombre}</h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <span>Actor:</span>
                    <strong className="text-slate-300 font-medium">{cu.actorPrincipal}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Specification Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedCU.codigo}
                </span>
                <span className="text-xs text-slate-400 font-mono">Módulo: {selectedCU.modulo}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{selectedCU.nombre}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Actor Principal</span>
              <span className="text-xs font-bold text-purple-300 font-mono">{selectedCU.actorPrincipal}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Descripción</h4>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {selectedCU.descripcion}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Precondición</h4>
            <p className="text-xs text-slate-300 font-mono bg-slate-950/40 p-2 rounded border border-slate-800">
              {selectedCU.precondicion}
            </p>
          </div>

          {/* Flujo Principal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Flujo Básico de Eventos</h4>
            <div className="space-y-1.5">
              {selectedCU.flujoPrincipal.map((paso, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 bg-slate-950/50 rounded border border-slate-800/80 text-xs text-slate-300"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{paso}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flujos Alternos */}
          {selectedCU.flujosAlternos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Flujos Alternativos</h4>
              <div className="space-y-1.5">
                {selectedCU.flujosAlternos.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-amber-950/15 border border-amber-800/30 rounded text-xs text-amber-200/90"
                  >
                    {alt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reglas de Negocio */}
          {selectedCU.reglasNegocio.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reglas de Negocio Asociadas</h4>
              <div className="space-y-1.5">
                {selectedCU.reglasNegocio.map((rn, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-blue-950/20 border border-blue-800/30 rounded text-xs text-blue-300 font-mono"
                  >
                    {rn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
