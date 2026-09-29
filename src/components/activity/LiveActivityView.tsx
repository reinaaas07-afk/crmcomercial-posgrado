import React, { useState } from 'react';
import {
  Activity,
  Radio,
  Clock,
  User,
  Filter,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Contact,
  Kanban,
  UserPlus,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { RegistroAuditoriaDB, UsuarioDB } from '../../types/schema';

interface LiveActivityViewProps {
  auditLogs: RegistroAuditoriaDB[];
  users: UsuarioDB[];
}

export const LiveActivityView: React.FC<LiveActivityViewProps> = ({ auditLogs, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('todos');
  const [moduleFilter, setModuleFilter] = useState('todos');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.registro_afectado.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = userFilter === 'todos' || log.usuario.includes(userFilter);
    const matchesModule = moduleFilter === 'todos' || log.modulo === moduleFilter;

    return matchesSearch && matchesUser && matchesModule;
  });

  const getActionColor = (accion: string) => {
    switch (accion) {
      case 'Creación':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Actualización':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Eliminación':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Importación':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Exportación':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Inicio de Sesión':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const getModuleIcon = (modulo: string) => {
    switch (modulo) {
      case 'Prospectos':
      case 'Pipeline':
        return <Kanban className="w-4 h-4 text-emerald-400" />;
      case 'Contactos':
        return <Contact className="w-4 h-4 text-blue-400" />;
      case 'Usuarios y Roles':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'Importaciones':
        return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 relative">
              <Activity className="w-5 h-5" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute top-1 right-1 animate-ping" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Actividad Reciente del Sistema</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EN VIVO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transmisión cronológica y colaborativa de cada acción realizada por los miembros del equipo ITHOT
          </p>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          <span>Total Eventos: </span>
          <strong className="text-white">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o registro afectado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="todos">Todos los Usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.nombre.split(' ')[0]}>
              {u.nombre}
            </option>
          ))}
        </select>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="todos">Todos los Módulos</option>
          <option value="Prospectos">Prospectos</option>
          <option value="Contactos">Contactos</option>
          <option value="Pipeline">Pipeline</option>
          <option value="Seguimientos">Seguimientos</option>
          <option value="Importaciones">Importaciones</option>
          <option value="Exportaciones">Exportaciones</option>
          <option value="Usuarios y Roles">Usuarios y Roles</option>
        </select>
      </div>

      {/* Real-time Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-4 shadow-sm"
            >
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                {getModuleIcon(log.modulo)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{log.usuario}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getActionColor(
                        log.accion
                      )}`}
                    >
                      {log.accion}
                    </span>
                    <span className="text-slate-400 text-xs">en {log.modulo}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {log.fecha} • {log.hora}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{log.detalles}</p>

                {log.registro_afectado && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-500">Registro afectado:</span>
                    <span className="font-semibold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {log.registro_afectado}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
