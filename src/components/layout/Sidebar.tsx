import React from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  PhoneCall,
  Calendar,
  CheckSquare,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { ActiveSection, User } from '../../types/crm';

interface SidebarProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  leadsCount: number;
  pendingActivitiesCount: number;
  pendingTasksCount: number;
  currentUser: User;
  onOpenAcademicModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  leadsCount,
  pendingActivitiesCount,
  pendingTasksCount,
  currentUser,
  onOpenAcademicModal,
}) => {
  const menuItems: {
    id: ActiveSection;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prospectos', label: 'Prospectos', icon: Users, badge: leadsCount },
    { id: 'pipeline', label: 'Pipeline Comercial', icon: Kanban },
    { id: 'seguimientos', label: 'Seguimientos', icon: PhoneCall, badge: pendingActivitiesCount },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'tareas', label: 'Tareas', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'importar-exportar', label: 'Importar y Exportar', icon: FileSpreadsheet },
    { id: 'usuarios', label: 'Usuarios y Roles', icon: ShieldCheck },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 transition-all duration-300 relative z-40 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-blue-500/20 shrink-0">
              C
            </div>
            <div className="truncate">
              <span className="font-bold text-white tracking-tight text-base block leading-tight">
                CRMComercial
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight truncate">
                Gestión de Prospectos
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
            C
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
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
      </div>

      {/* Academic Project Badge / Bottom */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        {!collapsed ? (
          <button
            onClick={onOpenAcademicModal}
            className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="truncate">Proyecto de Posgrado</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              Diseño de un Sistema CRM para la Gestión y Seguimiento de Prospectos
            </p>
          </button>
        ) : (
          <button
            onClick={onOpenAcademicModal}
            className="w-full flex justify-center p-2 text-blue-400 hover:bg-slate-900 rounded-lg"
            title="Proyecto de Posgrado"
          >
            <GraduationCap className="w-5 h-5" />
          </button>
        )}

        {/* User Mini Bar */}
        <div className={`mt-3 flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-1'}`}>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
