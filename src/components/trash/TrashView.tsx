import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Building2,
  Contact,
  Kanban,
  CheckSquare,
  PhoneCall,
  Search,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { RegistroPapeleraDB, RolUsuario } from '../../types/schema';

interface TrashViewProps {
  papelera: RegistroPapeleraDB[];
  currentRole: RolUsuario;
  onRestore: (item: RegistroPapeleraDB) => void;
  onPermanentDelete: (id: number) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  papelera,
  currentRole,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');

  const isAdmin = currentRole.includes('Administrador');

  const filteredTrash = papelera.filter((item) => {
    const matchesSearch =
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detalles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario_elimino.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'todos' || item.entidad_tipo === filterType;

    return matchesSearch && matchesType;
  });

  const getEntityIcon = (tipo: string) => {
    switch (tipo) {
      case 'Empresa':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'Contacto':
        return <Contact className="w-4 h-4 text-blue-400" />;
      case 'Prospecto':
        return <Kanban className="w-4 h-4 text-emerald-400" />;
      case 'Tarea':
        return <CheckSquare className="w-4 h-4 text-cyan-400" />;
      case 'Seguimiento':
        return <PhoneCall className="w-4 h-4 text-indigo-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Papelera de Reciclaje</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {papelera.length} elementos eliminados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Protección contra pérdida de datos. Los registros eliminados se conservan y pueden ser restaurados.
          </p>
        </div>

        {isAdmin && papelera.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  '¿Estás seguro de vaciar definitivamente toda la papelera? Esta acción no se puede deshacer.'
                )
              ) {
                onEmptyTrash();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Vaciar Papelera Definitivamente</span>
          </button>
        )}
      </div>

      {/* Info notice */}
      <div className="px-6 py-3 bg-amber-950/20 border-b border-amber-900/30 text-amber-300 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Política de Seguridad CRM:</strong> Los registros nunca se destruyen inmediatamente. Puedes restaurarlos en cualquier momento a su módulo original.
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por título, detalles o usuario que eliminó..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
        >
          <option value="todos">Todos los Tipos de Entidad</option>
          <option value="Empresa">Empresas</option>
          <option value="Contacto">Contactos</option>
          <option value="Prospecto">Prospectos</option>
          <option value="Tarea">Tareas</option>
          <option value="Seguimiento">Seguimientos</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filteredTrash.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-3" />
            <p className="text-base font-semibold text-slate-300">La papelera está limpia</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No hay elementos eliminados pendientes de restaurar en este momento.
            </p>
          </div>
        ) : (
          filteredTrash.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                  {getEntityIcon(item.entidad_tipo)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.entidad_tipo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{item.titulo}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.detalles}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Eliminado por: {item.usuario_elimino}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.fecha_eliminacion}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onRestore(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Registro</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Destruir definitivamente "${item.titulo}" de la base de datos?`)) {
                        onPermanentDelete(item.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Destruir permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
