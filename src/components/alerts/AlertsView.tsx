import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Building2,
  User,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Flame,
  PhoneCall,
  BellRing,
} from 'lucide-react';
import { Lead, Activity, User as CRMUser } from '../../types/crm';

interface AlertsViewProps {
  leads: Lead[];
  users: CRMUser[];
  onSelectLead: (lead: Lead) => void;
  onOpenCreateActivityModal: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  leads,
  users,
  onSelectLead,
  onOpenCreateActivityModal,
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | '15' | '7' | '5' | '3'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState('all');

  const today = new Date('2026-09-30');

  // Compute days without contact for all open leads
  const alertItems = useMemo(() => {
    return leads
      .filter((l) => l.stage !== 'Ganado' && l.stage !== 'Perdido')
      .map((lead) => {
        const lastDateStr = lead.ultima_interaccion || lead.createdAt || '2026-09-20';
        const lastDate = new Date(lastDateStr.split(' ')[0]);
        const diffMs = Math.abs(today.getTime() - lastDate.getTime());
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let category: '15' | '7' | '5' | '3' | 'normal' = 'normal';
        if (days >= 15) category = '15';
        else if (days >= 7) category = '7';
        else if (days >= 5) category = '5';
        else if (days >= 3) category = '3';

        return {
          lead,
          days,
          category,
          lastActivityDate: lastDateStr,
        };
      })
      .filter((item) => item.days >= 3)
      .sort((a, b) => b.days - a.days);
  }, [leads]);

  const filteredAlerts = useMemo(() => {
    return alertItems.filter((item) => {
      if (filterLevel !== 'all' && item.category !== filterLevel) return false;
      if (advisorFilter !== 'all' && item.lead.assignedTo !== advisorFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesComp = item.lead.company.toLowerCase().includes(term);
        const matchesName = item.lead.name.toLowerCase().includes(term);
        const matchesResp = item.lead.assignedToName.toLowerCase().includes(term);
        if (!matchesComp && !matchesName && !matchesResp) return false;
      }
      return true;
    });
  }, [alertItems, filterLevel, advisorFilter, searchTerm]);

  const count15 = alertItems.filter((a) => a.days >= 15).length;
  const count7 = alertItems.filter((a) => a.days >= 7 && a.days < 15).length;
  const count5 = alertItems.filter((a) => a.days >= 5 && a.days < 7).length;
  const count3 = alertItems.filter((a) => a.days >= 3 && a.days < 5).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Módulo Oficial de Detección de Inactividad Comercial · IB SYSTEM</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Alertas Automáticas de Seguimiento
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Identificación en tiempo real de prospectos sin interacción durante 3, 5, 7 y 15 días para evitar pérdida de oportunidades comerciales.
            </p>
          </div>

          <button
            onClick={onOpenCreateActivityModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+ Registrar Seguimiento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 15+ días (Crítico) */}
        <div
          onClick={() => setFilterLevel('15')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === '15'
              ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Críticas (+15 Días)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono">{count15}</span>
            <span className="text-xs text-rose-300/80 block mt-0.5">Riesgo inminente de deserción</span>
          </div>
        </div>

        {/* Card 2: 7+ días (Urgente - Requerimiento Usuario) */}
        <div
          onClick={() => setFilterLevel('7')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === '7'
              ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Seguimiento Pendiente (+7 Días)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono">{count7}</span>
            <span className="text-xs text-amber-300/80 block mt-0.5">Alerta comercial requerida</span>
          </div>
        </div>

        {/* Card 3: 5 días */}
        <div
          onClick={() => setFilterLevel('5')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === '5'
              ? 'bg-orange-950/50 border-orange-500 ring-2 ring-orange-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              En Observación (5-6 Días)
            </span>
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono">{count5}</span>
            <span className="text-xs text-orange-300/80 block mt-0.5">Planificar contacto esta semana</span>
          </div>
        </div>

        {/* Card 4: 3 días */}
        <div
          onClick={() => setFilterLevel('3')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === '3'
              ? 'bg-yellow-950/50 border-yellow-500 ring-2 ring-yellow-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-yellow-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
              Preventivas (3-4 Días)
            </span>
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white font-mono">{count3}</span>
            <span className="text-xs text-yellow-300/80 block mt-0.5">Seguimiento preventivo</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterLevel === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({alertItems.length})
            </button>
            <button
              onClick={() => setFilterLevel('15')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterLevel === '15'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-rose-400 hover:text-white'
              }`}
            >
              15d
            </button>
            <button
              onClick={() => setFilterLevel('7')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterLevel === '7'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setFilterLevel('5')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterLevel === '5'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-orange-400 hover:text-white'
              }`}
            >
              5d
            </button>
            <button
              onClick={() => setFilterLevel('3')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterLevel === '3'
                  ? 'bg-yellow-600 text-white font-bold'
                  : 'text-yellow-400 hover:text-white'
              }`}
            >
              3d
            </button>
          </div>

          {/* Advisor Filter */}
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos los Responsables</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Inactividad</th>
                <th className="py-3 px-4">Empresa & Contacto Principal</th>
                <th className="py-3 px-3">Responsable Comercial</th>
                <th className="py-3 px-3">Etapa Actual</th>
                <th className="py-3 px-3">Última Actividad Registrada</th>
                <th className="py-3 px-4 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-white text-sm">¡Todos los prospectos están al día!</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No hay prospectos desatendidos con los filtros actuales seleccionados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(({ lead, days, lastActivityDate }) => {
                  const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
                    lead.name
                  )},%20te%20contacto%20de%20IB%20SYSTEM%20respecto%20a%20tu%20consulta%20comercial.`;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-850/60 transition-colors cursor-pointer"
                    >
                      {/* Badge Inactividad */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                            days >= 15
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : days >= 7
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : days >= 5
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{days} días sin seguimiento</span>
                        </span>
                      </td>

                      {/* Empresa & Contacto */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5 text-xs truncate max-w-[220px]">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 truncate max-w-[200px]">
                          {lead.name} {lead.cargo ? `(${lead.cargo})` : ''}
                        </div>
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {lead.assignedToName.slice(0, 1)}
                          </div>
                          <span className="font-medium text-slate-200 truncate max-w-[130px]">
                            {lead.assignedToName}
                          </span>
                        </div>
                      </td>

                      {/* Etapa */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {lead.stage}
                        </span>
                      </td>

                      {/* Última Actividad */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {lastActivityDate}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Contactar vía WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                              title="Llamar"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
