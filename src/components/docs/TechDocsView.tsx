import React, { useState } from 'react';
import {
  Database,
  Workflow,
  Server,
  Terminal,
  BookOpen,
  FolderTree,
} from 'lucide-react';
import { ERDViewer } from './ERDViewer';
import { UseCasesViewer } from './UseCasesViewer';
import { ArchitectureViewer } from './ArchitectureViewer';
import { DatabaseConsole } from './DatabaseConsole';
import {
  UsuarioDB,
  EtapaPipelineDB,
  ProspectoDB,
  ContactoDB,
  SeguimientoDB,
  TareaDB,
  ActividadDB,
} from '../../types/schema';

interface TechDocsViewProps {
  usuarios: UsuarioDB[];
  etapas: EtapaPipelineDB[];
  prospectos: ProspectoDB[];
  contactos?: ContactoDB[];
  seguimientos: SeguimientoDB[];
  tareas: TareaDB[];
  actividades: ActividadDB[];
}

export const TechDocsView: React.FC<TechDocsViewProps> = ({
  usuarios,
  etapas,
  prospectos,
  contactos = [],
  seguimientos,
  tareas,
  actividades,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'erd' | 'casos_uso' | 'arquitectura' | 'consola'>(
    'erd'
  );

  const subTabs = [
    { id: 'erd', label: '1. Modelo ERD & DDL SQL', icon: Database },
    { id: 'casos_uso', label: '2. Casos de Uso UML', icon: Workflow },
    { id: 'arquitectura', label: '3. Arquitectura & Carpetas Backend', icon: Server },
    { id: 'consola', label: '4. Consola SQL MySQL 8.0', icon: Terminal },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Sub-navigation bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
            Documentación Técnica · Posgrado
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render selected documentation module */}
      <div>
        {activeSubTab === 'erd' && <ERDViewer />}
        {activeSubTab === 'casos_uso' && <UseCasesViewer />}
        {activeSubTab === 'arquitectura' && <ArchitectureViewer />}
        {activeSubTab === 'consola' && (
          <DatabaseConsole
            usuarios={usuarios}
            etapas={etapas}
            prospectos={prospectos}
            seguimientos={seguimientos}
            tareas={tareas}
            actividades={actividades}
          />
        )}
      </div>
    </div>
  );
};
