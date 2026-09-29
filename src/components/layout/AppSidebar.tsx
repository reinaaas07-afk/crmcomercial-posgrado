import React from 'react';
import {
  LayoutDashboard,
  Users,
  Contact,
  Kanban,
  PhoneCall,
  CheckSquare,
  Calendar,
  BarChart3,
  FileUp,
  FileDown,
  ShieldCheck,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  X,
  UserCheck,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { SeccionApp, UsuarioDB, RolUsuario } from '../../types/schema';

interface AppSidebarProps {
  activeSection: SeccionApp;
  onSelectSection: (section: SeccionApp) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: UsuarioDB;
  onRoleChange: (role: RolUsuario) => void;
  contactosCount: number;
  prospectosCount: number;
  tareasPendientesCount: number;
  onOpenAcademicModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  allUsers?: UsuarioDB[];
  onSelectUser?: (userId: number) => void;
  onLogout?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  currentUser,
  onRoleChange,
  contactosCount,
  prospectosCount,
  tareasPendientesCount,
  onOpenAcademicModal,
  isMobileOpen = false,
  onCloseMobile,
  allUsers = [],
  onSelectUser,
  onLogout,
}) => {
  const menuItems: {
    id: SeccionApp;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contactos', label: 'Contactos', icon: Contact, badge: contactosCount },
    { id: 'prospectos', label: 'Prospectos', icon: Users, badge: prospectosCount },
    { id: 'pipeline', label: 'Pipeline Comercial', icon: Kanban },
    { id: 'seguimientos', label: 'Seguimientos', icon: PhoneCall },
    { id: 'tareas', label: 'Tareas', icon: CheckSquare, badge: tareasPendientesCount },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'importaciones', label: 'Importaciones', icon: FileUp },
    { id: 'exportaciones', label: 'Exportaciones', icon: FileDown },
    { id: 'usuarios', label: 'Usuarios y Roles', icon: ShieldCheck, badge: allUsers.length || undefined },
    { id: 'auditoria', label: 'Auditoría del Sistema', icon: ShieldAlert },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
    { id: 'documentacion', label: 'Documentación Técnica', icon: BookOpen },
  ];

  const handleItemClick = (id: SeccionApp) => {
    onSelectSection(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* Brand & System Title */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950 shrink-0">
        {!collapsed || isMobile ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              C
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-base tracking-tight block leading-tight">
                CRMComercial
              </span>
              <span className="text-[10px] text-blue-400 font-mono block leading-tight truncate">
                Gestión de Prospectos · ITHOT
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
            C
          </div>
        )}

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Vertical Navigation Rows */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isCollapsedView = collapsed && !isMobile;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              title={isCollapsedView ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              } ${isCollapsedView ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsedView && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!isCollapsedView && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Posgrado Accreditation & Administrator User Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2 shrink-0">
        {(!collapsed || isMobile) && (
          <button
            onClick={() => {
              onOpenAcademicModal();
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="truncate">Proyecto de Posgrado</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              Diseño de un Sistema CRM para la Gestión y Seguimiento de Prospectos
            </p>
          </button>
        )}

        {/* User Card: Active Session & Colleague Switcher */}
        <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 ${collapsed && !isMobile ? 'text-center' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0 font-mono">
              {currentUser.nombre.includes('Yenifer')
                ? 'YS'
                : currentUser.nombre.slice(0, 2).toUpperCase()}
            </div>
            {(!collapsed || isMobile) && (
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-white truncate">{currentUser.nombre} {currentUser.apellido || ''}</div>
                <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1 truncate">
                  <Shield className="w-2.5 h-2.5 shrink-0" />
                  <span>{currentUser.rol}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Colleague Switcher Dropdown & Logout */}
          {(!collapsed || isMobile) && allUsers.length > 1 && onSelectUser && (
            <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Cambiar Usuario Activo:</label>
                <select
                  value={currentUser.id}
                  onChange={(e) => onSelectUser(Number(e.target.value))}
                  className="w-full text-[11px] bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.rol})
                    </option>
                  ))}
                </select>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-1 px-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Cerrar sesión actual"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 select-none z-40 h-full border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Drawer (Visible on small screens when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Sliding Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50 flex flex-col border-r border-slate-800 animate-in slide-in-from-left duration-200">
            {navContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
