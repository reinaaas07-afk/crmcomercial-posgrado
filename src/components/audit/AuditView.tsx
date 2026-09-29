import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Calendar,
  User,
  Layers,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Trash2,
  Edit3,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { RegistroAuditoriaDB, ModuloAfectado, TipoAccionAuditoria } from '../../types/schema';

interface AuditViewProps {
  auditLogs: RegistroAuditoriaDB[];
  onClearLogs?: () => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('todos');
  const [selectedAction, setSelectedAction] = useState<string>('todas');
  const [selectedUser, setSelectedUser] = useState<string>('todos');

  // Dynamic lists for filters
  const modulesList = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.modulo)));
  }, [auditLogs]);

  const usersList = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.usuario)));
  }, [auditLogs]);

  const actionsList = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.accion)));
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.registro_afectado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.detalles.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.modulo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchModule = selectedModule === 'todos' || log.modulo === selectedModule;
      const matchAction = selectedAction === 'todas' || log.accion === selectedAction;
      const matchUser = selectedUser === 'todos' || log.usuario === selectedUser;

      return matchSearch && matchModule && matchAction && matchUser;
    });
  }, [auditLogs, searchTerm, selectedModule, selectedAction, selectedUser]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const dataToExport = filteredLogs.map((log) => ({
      ID: log.id,
      Fecha: log.fecha,
      Hora: log.hora,
      Usuario: log.usuario,
      Acción: log.accion,
      Módulo: log.modulo,
      'Registro Afectado': log.registro_afectado,
      Detalles: log.detalles,
      'IP Origen': log.ip_simulada || '190.167.34.12',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoria_Sistema_ITHOT');
    XLSX.writeFile(
      workbook,
      `Auditoria_CRMComercial_ITHOT_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Badge coloring helper
  const getActionBadge = (accion: TipoAccionAuditoria) => {
    switch (accion) {
      case 'Creación':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Actualización':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Eliminación':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Cambio de Etapa':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Importación':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Exportación':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Restablecimiento de Contraseña':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Activación / Desactivación':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <Activity className="w-4 h-4" />
            <span>Trazabilidad y Seguridad · Empresa ITHOT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Auditoría del Sistema y Registro de Actividad
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Bitácora automatizada e inmutable de cada acción, actualización y cambio realizado por los usuarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Auditoría (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Total Eventos</span>
            <span className="text-xl font-bold text-white">{auditLogs.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Creaciones</span>
            <span className="text-xl font-bold text-white">
              {auditLogs.filter((l) => l.accion === 'Creación' || l.accion === 'Importación').length}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Actualizaciones</span>
            <span className="text-xl font-bold text-white">
              {auditLogs.filter((l) => l.accion === 'Actualización' || l.accion === 'Cambio de Etapa').length}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Usuarios Activos</span>
            <span className="text-xl font-bold text-white">{usersList.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario, empresa..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los Módulos ({modulesList.length})</option>
              {modulesList.map((m) => (
                <option key={m} value={m}>
                  Módulo: {m}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="todas">Todas las Acciones ({actionsList.length})</option>
              {actionsList.map((a) => (
                <option key={a} value={a}>
                  Acción: {a}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los Usuarios ({usersList.length})</option>
              {usersList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[11px] uppercase font-semibold">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Acción Realizada</th>
                <th className="py-3 px-4">Módulo Afectado</th>
                <th className="py-3 px-4">Registro Afectado</th>
                <th className="py-3 px-4">Detalle del Movimiento</th>
                <th className="py-3 px-4 text-right">IP Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron registros de auditoría con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                      {/* Fecha y Hora */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-200 font-semibold">{log.fecha}</div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{log.hora}</span>
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 font-mono">
                            {log.usuario.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{log.usuario}</span>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getActionBadge(
                            log.accion
                          )}`}
                        >
                          {log.accion}
                        </span>
                      </td>

                      {/* Módulo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {log.modulo}
                        </span>
                      </td>

                      {/* Registro Afectado */}
                      <td className="py-3 px-4 font-semibold text-white max-w-[200px] truncate">
                        {log.registro_afectado}
                      </td>

                      {/* Detalles */}
                      <td className="py-3 px-4 text-slate-300 max-w-[320px]">
                        <p className="line-clamp-2 leading-relaxed text-xs">{log.detalles}</p>
                      </td>

                      {/* IP */}
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ip_simulada || '190.167.34.12'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
