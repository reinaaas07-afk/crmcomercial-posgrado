import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Trophy,
  Users,
  Shield,
  Layers,
} from 'lucide-react';
import { User, UserRole } from '../../types/crm';

interface UsersViewProps {
  users: User[];
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentRole,
  onRoleChange,
}) => {
  const rolePermissions: {
    permission: string;
    admin: boolean;
    supervisor: boolean;
    asesor: boolean;
  }[] = [
    {
      permission: 'Ver todos los prospectos de la empresa',
      admin: true,
      supervisor: true,
      asesor: false,
    },
    {
      permission: 'Crear y editar prospectos propios',
      admin: true,
      supervisor: true,
      asesor: true,
    },
    {
      permission: 'Asignar / Reasignar prospectos entre asesores',
      admin: true,
      supervisor: true,
      asesor: false,
    },
    {
      permission: 'Registrar actividades y seguimientos comerciales',
      admin: true,
      supervisor: true,
      asesor: true,
    },
    {
      permission: 'Modificar etapas en el tablero Kanban',
      admin: true,
      supervisor: true,
      asesor: true,
    },
    {
      permission: 'Visualizar reportes de desempeño de todo el equipo',
      admin: true,
      supervisor: true,
      asesor: false,
    },
    {
      permission: 'Importar y exportar base completa de prospectos',
      admin: true,
      supervisor: false,
      asesor: false,
    },
    {
      permission: 'Administrar configuración del CRM y usuarios',
      admin: true,
      supervisor: false,
      asesor: false,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Gestión de Usuarios y Roles del Equipo
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Estructura de perfiles comerciales y matriz de permisos para Administrador, Supervisor y Asesor Comercial.
        </p>
      </div>

      {/* Active Role Simulator Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Modo de Simulación Activo
            </span>
            <div className="text-sm font-bold text-white">
              Rol Actual: <span className="text-blue-300 font-mono">{currentRole}</span>
            </div>
            <p className="text-xs text-slate-400">
              Haz clic en cualquiera de los botones para alternar la perspectiva de permisos en el prototipo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['Administrador', 'Supervisor Comercial', 'Asesor Comercial'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === r
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Simular como {r}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-blue-400 shrink-0">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <h4 className="font-bold text-white text-sm truncate">{u.name}</h4>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                    u.role === 'Administrador'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : u.role === 'Supervisor Comercial'
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono">{u.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Prospectos</span>
                <span className="font-mono font-bold text-white tabular-nums text-sm">
                  {u.activeLeadsCount}
                </span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Conversión</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums text-sm">
                  {u.conversionRate}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-1">
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Matriz de Permisos por Rol Comercial
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Control de Acceso Basado en Roles (RBAC)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px] uppercase font-semibold">
                <th className="py-3 px-4">Funcionalidad / Privilegio</th>
                <th className="py-3 px-4 text-center">Administrador</th>
                <th className="py-3 px-4 text-center">Supervisor Comercial</th>
                <th className="py-3 px-4 text-center">Asesor Comercial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rolePermissions.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-slate-200">{row.permission}</td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.supervisor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.asesor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
