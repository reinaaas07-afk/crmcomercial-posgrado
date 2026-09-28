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
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  Building,
} from 'lucide-react';
import { UsuarioDB, RolUsuario } from '../../types/schema';

interface UsersViewProps {
  users: UsuarioDB[];
  currentRole: RolUsuario;
  onRoleChange: (role: RolUsuario) => void;
  onOpenCreateUserModal: () => void;
  onOpenEditUserModal: (user: UsuarioDB) => void;
  onDeleteUser: (userId: number) => void;
  onToggleUserStatus: (userId: number) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentRole,
  onRoleChange,
  onOpenCreateUserModal,
  onOpenEditUserModal,
  onDeleteUser,
  onToggleUserStatus,
}) => {
  const rolePermissions: {
    permission: string;
    admin: boolean;
    supervisor: boolean;
    ejecutivo: boolean;
    consulta: boolean;
  }[] = [
    {
      permission: 'Ver todos los contactos y prospectos de la empresa',
      admin: true,
      supervisor: true,
      ejecutivo: false,
      consulta: true,
    },
    {
      permission: 'Crear y editar prospectos y contactos propios',
      admin: true,
      supervisor: true,
      ejecutivo: true,
      consulta: false,
    },
    {
      permission: 'Asignar / Reasignar oportunidades entre ejecutivos',
      admin: true,
      supervisor: true,
      ejecutivo: false,
      consulta: false,
    },
    {
      permission: 'Registrar actividades y bitácora comercial (WhatsApp / Llamadas)',
      admin: true,
      supervisor: true,
      ejecutivo: true,
      consulta: false,
    },
    {
      permission: 'Modificar etapas en el tablero Kanban del Pipeline',
      admin: true,
      supervisor: true,
      ejecutivo: true,
      consulta: false,
    },
    {
      permission: 'Visualizar reportes de rendimiento y analítica comercial',
      admin: true,
      supervisor: true,
      ejecutivo: false,
      consulta: true,
    },
    {
      permission: 'Importar y exportar base de datos (Excel / CSV)',
      admin: true,
      supervisor: false,
      ejecutivo: false,
      consulta: false,
    },
    {
      permission: 'Crear, editar y administrar usuarios y roles (RBAC)',
      admin: true,
      supervisor: false,
      ejecutivo: false,
      consulta: false,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Gestión Institucional de Accesos · Empresa ITHOT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Usuarios y Roles del Sistema Comercial
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Administración de credenciales, roles comerciales y matriz de permisos para el equipo de ventas.
          </p>
        </div>

        <button
          onClick={onOpenCreateUserModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Active Role Simulator Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Modo de Simulación de Permisos
            </span>
            <div className="text-sm font-bold text-white">
              Rol Activo: <span className="text-blue-300 font-mono">{currentRole}</span>
            </div>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier rol para evaluar la perspectiva de seguridad y privilegios en el CRM.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              'Administrador',
              'Supervisor Comercial',
              'Ejecutivo Comercial',
              'Consulta',
            ] as RolUsuario[]
          ).map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isYenifer = u.nombre.includes('Yenifer');
          return (
            <div
              key={u.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-base text-blue-400 shrink-0 font-mono">
                      {isYenifer
                        ? 'YS'
                        : u.nombre.includes('Valeria')
                        ? 'VR'
                        : u.nombre.includes('Mateo')
                        ? 'MS'
                        : u.nombre.includes('Camila')
                        ? 'CH'
                        : u.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm truncate">{u.nombre}</h4>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        @{u.usuario || u.email.split('@')[0]} · {u.empresa || 'ITHOT'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                      u.rol === 'Administrador'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : u.rol === 'Supervisor Comercial'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : u.rol === 'Ejecutivo Comercial'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {u.rol}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate font-mono">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono">{u.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => onToggleUserStatus(u.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    u.activo
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                  title="Cambiar estado del usuario"
                >
                  {u.activo ? 'Activo' : 'Inactivo'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditUserModal(u)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Editar usuario"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!isYenifer && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al usuario ${u.nombre}?`)) {
                          onDeleteUser(u.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-1">
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Matriz de Permisos por Rol Comercial (RBAC)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Arquitectura de Software · Proyecto Posgrado
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px] uppercase font-semibold">
                <th className="py-3 px-4">Funcionalidad / Privilegio</th>
                <th className="py-3 px-4 text-center">Administrador</th>
                <th className="py-3 px-4 text-center">Supervisor Comercial</th>
                <th className="py-3 px-4 text-center">Ejecutivo Comercial</th>
                <th className="py-3 px-4 text-center">Consulta</th>
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
                    {row.ejecutivo ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.consulta ? (
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
