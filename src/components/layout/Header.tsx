import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  GraduationCap,
  ChevronDown,
  Shield,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { User, UserRole, Lead } from '../../types/crm';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  onOpenCreateLeadModal: () => void;
  onOpenCreateActivityModal: () => void;
  onOpenAcademicModal: () => void;
  onSelectLeadById: (leadId: string) => void;
  leads: Lead[];
  currentSectionTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  onOpenCreateLeadModal,
  onOpenCreateActivityModal,
  onOpenAcademicModal,
  onSelectLeadById,
  leads,
  currentSectionTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredSearchLeads = searchQuery.trim()
    ? leads
        .filter(
          (l) =>
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.phone.includes(searchQuery)
        )
        .slice(0, 5)
    : [];

  const roles: UserRole[] = ['Administrador', 'Supervisor Comercial', 'Asesor Comercial'];

  // Pending follow-ups for alerts
  const urgentFollowUps = leads.filter((l) => l.nextFollowUpDate && l.stage !== 'Ganado' && l.stage !== 'Perdido').slice(0, 4);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Section Title & Academic Marker */}
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {currentSectionTitle}
        </h1>
        <button
          onClick={onOpenAcademicModal}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 rounded-lg transition-colors cursor-pointer"
          title="Ver especificación del proyecto académico"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Proyecto de Posgrado</span>
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar prospecto por nombre, empresa o teléfono..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950/60 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Live Search Popup */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Resultados ({filteredSearchLeads.length})
            </div>
            {filteredSearchLeads.length === 0 ? (
              <div className="px-3 py-4 text-center text-slate-500">
                No se encontraron prospectos que coincidan.
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredSearchLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      onSelectLeadById(lead.id);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400">{lead.company} · {lead.phone}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-blue-400 font-medium">{lead.stage}</span>
                      <div className="text-[10px] font-mono text-slate-500">
                        ${lead.estimatedValue.toLocaleString()} USD
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Role Switcher, Notifications, New Lead */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Follow-up Activity button */}
        <button
          onClick={onOpenCreateActivityModal}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
          <span>Registrar Seguimiento</span>
        </button>

        {/* Primary CTA: + Nuevo Prospecto */}
        <button
          onClick={onOpenCreateLeadModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Prospecto</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg relative transition-colors"
            title="Seguimientos pendientes"
          >
            <Bell className="w-4 h-4" />
            {urgentFollowUps.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-white">Recordatorios de Seguimiento</span>
                <span className="text-[11px] text-blue-400 font-mono">{urgentFollowUps.length} activos</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {urgentFollowUps.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => {
                      onSelectLeadById(lead.id);
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-slate-800/40 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-200 font-medium">
                      <span>{lead.name}</span>
                      <span className="text-[11px] text-amber-400 font-mono">{lead.nextFollowUpDate?.slice(11)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{lead.company}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-400">
              <Shield className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-left hidden md:block">
              <div className="font-semibold text-white leading-none">{currentUser.role}</div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">{currentUser.name}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                Cambiar Rol de Demostración:
              </div>
              <div className="space-y-1 mt-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      currentUser.role === r
                        ? 'bg-blue-600/20 text-blue-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 px-2 text-[10px] text-slate-500">
                Permite simular la experiencia para Administrador, Supervisor o Asesor.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
