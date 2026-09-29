import React, { useState } from 'react';
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
  Clock,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { UsuarioDB, RolUsuario, SubcuentaDB } from '../../types/schema';
import { ResetPasswordModal } from '../modals/ResetPasswordModal';
import { BatchUsersModal } from '../modals/BatchUsersModal';

interface UsersViewProps {
  users: UsuarioDB[];
  currentRole: RolUsuario;
  currentUserId?: number;
  subcuentas?: SubcuentaDB[];
  onRoleChange: (role: RolUsuario) => void;
  onSelectUser?: (userId: number) => void;
  onOpenCreateUserModal: () => void;
  onOpenEditUserModal: (user: UsuarioDB) => void;
  onDeleteUser: (userId: number) => void;
  onToggleUserStatus: (userId: number) => void;
  onResetPassword: (userId: number, newPassword: string) => void;
  onSaveBatchUsers: (users: UsuarioDB[]) => void;
  onCreateSubcuenta?: (subcuenta: SubcuentaDB) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentRole,
  currentUserId,
  subcuentas = [],
  onRoleChange,
  onSelectUser,
  onOpenCreateUserModal,
  onOpenEditUserModal,
  onDeleteUser,
  onToggleUserStatus,
  onResetPassword,
  onSaveBatchUsers,
  onCreateSubcuenta,
}) => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'subcuentas' | 'permisos'>('usuarios');
  const [userForPasswordReset, setUserForPasswordReset] = useState<UsuarioDB | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isNewSubcuentaModalOpen, setIsNewSubcuentaModalOpen] = useState(false);

  // Subcuenta form state
  const [subcuentaNombre, setSubcuentaNombre] = useState('');
  const [subcuentaCodigo, setSubcuentaCodigo] = useState('');
  const [subcuentaCiudad, setSubcuentaCiudad] = useState('Santo Domingo');
  const [subcuentaDireccion, setSubcuentaDireccion] = useState('');
  const [subcuentaTelefono, setSubcuentaTelefono] = useState('+1 809-');
  const [subcuentaResponsable, setSubcuentaResponsable] = useState('Yenifer Reina Sena Suero');

  const handleCreateSubcuentaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcuentaNombre.trim()) return;

    if (onCreateSubcuenta) {
      onCreateSubcuenta({
        id: Date.now(),
        nombre: subcuentaNombre.trim(),
        empresa_matriz: 'ITHOT',
        codigo: subcuentaCodigo.trim() || `ITH-${Date.now().toString().slice(-4)}`,
        responsable: subcuentaResponsable,
        direccion: subcuentaDireccion.trim(),
        ciudad: subcuentaCiudad,
        telefono: subcuentaTelefono.trim(),
        usuarios_count: 1,
        fecha_creacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
        activa: true,
      });
    }

    setIsNewSubcuentaModalOpen(false);
    setSubcuentaNombre('');
    setSubcuentaCodigo('');
    setSubcuentaDireccion('');
  };

  const rolePermissions: {
    permission: string;
    adminGeneral: boolean;
    supervisor: boolean;
    ejecutivo: boolean;
    analista: boolean;
    consulta: boolean;
  }[] = [
    {
      permission: 'Control total de usuarios, roles, contraseñas y subcuentas',
      adminGeneral: true,
      supervisor: false,
      ejecutivo: false,
      analista: false,
      consulta: false,
    },
    {
      permission: 'Ver todos los contactos, empresas y prospectos de la organización',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: false,
      analista: true,
      consulta: true,
    },
    {
      permission: 'Crear y editar prospectos y contactos asignados',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: true,
      analista: true,
      consulta: false,
    },
    {
      permission: 'Asignar / Reasignar oportunidades entre ejecutivos comerciales',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: false,
      analista: false,
      consulta: false,
    },
    {
      permission: 'Registrar actividades y bitácora de seguimiento multicanal',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: true,
      analista: true,
      consulta: false,
    },
    {
      permission: 'Mover y gestionar etapas del Pipeline Comercial Kanban',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: true,
      analista: false,
      consulta: false,
    },
    {
      permission: 'Visualizar analítica gerencial, reportes y métricas de ventas',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: false,
      analista: true,
      consulta: true,
    },
    {
      permission: 'Importar y exportar bases de datos en Excel (.xlsx) y CSV',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: false,
      analista: true,
      consulta: false,
    },
    {
      permission: 'Consultar Auditoría del Sistema y Registro de Actividad',
      adminGeneral: true,
      supervisor: true,
      ejecutivo: false,
      analista: true,
      consulta: false,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Control Total Administrativo · Empresa ITHOT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestión de Usuarios, Subcuentas y Roles
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Administración completa de accesos, compañeros, contraseñas, sucursales y permisos de la plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Crear 3, 5 o 10 usuarios en lote"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>+ Agregar Lote (3, 5, 10)</span>
          </button>

          <button
            onClick={onOpenCreateUserModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/30 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'usuarios'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios del Sistema ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subcuentas')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'subcuentas'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Subcuentas ITHOT ({subcuentas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permisos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'permisos'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Permisos (RBAC)</span>
        </button>
      </div>

      {/* TAB 1: USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          {/* Active Role Simulator Banner */}
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Perspectiva de Permisos
                </span>
                <div className="text-sm font-bold text-white">
                  Rol Simulado: <span className="text-blue-300 font-mono">{currentRole}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Haz clic en cualquier rol o en "Iniciar Sesión" en la tarjeta de un compañero para operar con su perfil.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  'Administrador General',
                  'Supervisor Comercial',
                  'Ejecutivo Comercial',
                  'Analista Comercial',
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
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {users.map((u) => {
              const isYenifer = u.nombre.includes('Yenifer');
              return (
                <div
                  key={u.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-base text-blue-400 shrink-0 font-mono">
                          {u.nombre
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-white text-sm sm:text-base truncate flex items-center gap-2">
                            <span>{u.nombre}</span>
                            {isYenifer && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                                Principal
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 block truncate">
                            @{u.usuario} · {u.subcuenta || 'ITHOT Sede Principal'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                          u.rol.includes('Administrador')
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
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate font-mono">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{u.telefono}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span>Último acceso: {u.ultimo_acceso || 'Hoy 08:30'}</span>
                        </div>
                        <span className="font-mono text-slate-400">ITHOT Enterprise</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Active/Inactive Toggle Button */}
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        disabled={isYenifer}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                          u.activo
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        } ${isYenifer ? 'opacity-80 cursor-default' : 'hover:opacity-80'}`}
                        title={isYenifer ? 'Administrador General no puede desactivarse' : 'Cambiar estado del usuario'}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </button>

                      {/* Login as this user button */}
                      {currentUserId === u.id ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Sesión Activa
                        </span>
                      ) : onSelectUser ? (
                        <button
                          onClick={() => onSelectUser(u.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Iniciar Sesión
                        </button>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reset Password Button */}
                      <button
                        onClick={() => setUserForPasswordReset(u)}
                        className="px-2 py-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                        title="Restablecer contraseña"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Restablecer Clave</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onOpenEditUserModal(u)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
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
        </div>
      )}

      {/* TAB 2: SUBCUENTAS */}
      {activeTab === 'subcuentas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="font-bold text-white text-base">
                Subcuentas y Sucursales bajo Empresa Matriz ITHOT
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Todos los usuarios trabajan bajo la misma empresa pero pueden operar asignados a sucursales territoriales.
              </p>
            </div>
            <button
              onClick={() => setIsNewSubcuentaModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Subcuenta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subcuentas.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-blue-400 border border-slate-700">
                    {sub.codigo}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{sub.nombre}</h4>
                  <span className="text-xs text-slate-400 block font-semibold mt-0.5">
                    Empresa: {sub.empresa_matriz}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{sub.ciudad} · {sub.direccion}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{sub.telefono}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                    <span>Responsable:</span>
                    <span className="text-slate-300 font-bold">{sub.responsable}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MATRIZ DE PERMISOS */}
      {activeTab === 'permisos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-1">
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Matriz de Permisos por Rol Comercial (RBAC) · ITHOT
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Arquitectura Multi-usuario
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px] uppercase font-semibold">
                  <th className="py-3 px-4">Funcionalidad / Privilegio</th>
                  <th className="py-3 px-4 text-center">Administrador General</th>
                  <th className="py-3 px-4 text-center">Supervisor Comercial</th>
                  <th className="py-3 px-4 text-center">Ejecutivo Comercial</th>
                  <th className="py-3 px-4 text-center">Analista Comercial</th>
                  <th className="py-3 px-4 text-center">Consulta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rolePermissions.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">{row.permission}</td>
                    <td className="py-3 px-4 text-center">
                      {row.adminGeneral ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.supervisor ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.ejecutivo ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.analista ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.consulta ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
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
      )}

      {/* Modal: Restablecer Contraseña */}
      <ResetPasswordModal
        isOpen={Boolean(userForPasswordReset)}
        onClose={() => setUserForPasswordReset(null)}
        user={userForPasswordReset}
        onConfirmReset={(userId, newPass) => {
          onResetPassword(userId, newPass);
          setUserForPasswordReset(null);
        }}
      />

      {/* Modal: Crear Lote de Usuarios (3, 5, 10) */}
      <BatchUsersModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSaveBatchUsers={onSaveBatchUsers}
      />

      {/* Modal: Crear Subcuenta */}
      {isNewSubcuentaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Crear Nueva Subcuenta (ITHOT)</h3>
            <form onSubmit={handleCreateSubcuentaSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la Subcuenta / Sucursal
                </label>
                <input
                  type="text"
                  placeholder="Ej. ITHOT Sucursal La Romana"
                  value={subcuentaNombre}
                  onChange={(e) => setSubcuentaNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código Interno
                  </label>
                  <input
                    type="text"
                    placeholder="ITH-ROM-04"
                    value={subcuentaCodigo}
                    onChange={(e) => setSubcuentaCodigo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={subcuentaCiudad}
                    onChange={(e) => setSubcuentaCiudad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Av. Santa Rosa #45"
                  value={subcuentaDireccion}
                  onChange={(e) => setSubcuentaDireccion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  value={subcuentaResponsable}
                  onChange={(e) => setSubcuentaResponsable(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewSubcuentaModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  Crear Subcuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
