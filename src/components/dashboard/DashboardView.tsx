import React from 'react';
import {
  Users,
  UserPlus,
  PhoneForwarded,
  Trophy,
  Clock,
  TrendingUp,
  PhoneCall,
  Calendar,
  ChevronRight,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  FileDown,
  Building2,
  Activity,
  Target,
  UserCheck,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Lead, Activity as LeadActivity, Task, User, ActiveSection } from '../../types/crm';
import {
  ObjetivoComercialDB,
  RegistroAuditoriaDB,
  HistorialImportacionDB,
  HistorialExportacionDB,
} from '../../types/schema';
import { PIPELINE_STAGES } from '../../data/mockData';

interface DashboardViewProps {
  leads: Lead[];
  activities: LeadActivity[];
  tasks: Task[];
  currentUser: User;
  onSelectLead: (lead: Lead) => void;
  onNavigateSection: (section: ActiveSection) => void;
  onOpenCreateLeadModal: () => void;
  onOpenCreateActivityModal: () => void;
  onToggleTaskStatus: (taskId: string) => void;
  totalClientes?: number;
  lastImport?: HistorialImportacionDB | null;
  lastExport?: HistorialExportacionDB | null;
  activeUsersCount?: number;
  objetivos?: ObjetivoComercialDB[];
  recentActivities?: RegistroAuditoriaDB[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  activities,
  tasks,
  currentUser,
  onSelectLead,
  onNavigateSection,
  onOpenCreateLeadModal,
  onOpenCreateActivityModal,
  onToggleTaskStatus,
  totalClientes = 18,
  lastImport,
  lastExport,
  activeUsersCount = 4,
  objetivos = [],
  recentActivities = [],
}) => {
  // KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.stage === 'Nuevo Lead').length;
  const contactedLeads = leads.filter((l) => l.stage === 'Contactado').length;
  const convertedLeads = leads.filter((l) => l.stage === 'Ganado');
  const lostLeads = leads.filter((l) => l.stage === 'Perdido');

  const wonCount = convertedLeads.length;
  const wonValue = convertedLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  const lostCount = lostLeads.length;
  const lostValue = lostLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  // Pending followups
  const pendingFollowUps = leads.filter(
    (l) => l.nextFollowUpDate && l.stage !== 'Ganado' && l.stage !== 'Perdido'
  );

  // Inactive leads (> 7 days without follow-up)
  // Let's identify leads that have no interaction or scheduled follow-up
  const inactiveLeads = leads.filter((l) => {
    if (l.stage === 'Ganado' || l.stage === 'Perdido') return false;
    // If no nextFollowUpDate, or nextFollowUpDate was scheduled for past or missing
    return !l.nextFollowUpDate || l.nextFollowUpDate < '2026-09-22';
  });

  const totalPipelineValue = leads
    .filter((l) => l.stage !== 'Perdido')
    .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : '0';

  // Group leads by stage for the distribution chart
  const stageDistribution = PIPELINE_STAGES.map((stage) => {
    const stageLeads = leads.filter((l) => l.stage === stage);
    const count = stageLeads.length;
    const value = stageLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
    return { stage, count, value, percentage };
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner / Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Panel de Control Comercial
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              ITHOT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitoreo en tiempo real de prospectos dominicanos, embudo de ventas y cumplimiento de metas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
            Pipeline Activo:{' '}
            <span className="text-emerald-400 font-semibold font-mono">
              RD$ {totalPipelineValue.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onOpenCreateLeadModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            + Prospecto
          </button>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS EN DASHBOARD (Prioridad #13) */}
      <div className="flex flex-wrap items-center gap-2.5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono mr-1">
          &#9889; Accesos R&aacute;pidos:
        </span>
        <button
          onClick={() => onNavigateSection('empresas')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Nueva Empresa</span>
        </button>
        <button
          onClick={() => onNavigateSection('contactos')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Nuevo Contacto</span>
        </button>
        <button
          onClick={onOpenCreateLeadModal}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Nueva Oportunidad</span>
        </button>
        <button
          onClick={() => onNavigateSection('importaciones')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>&#8681; Importar Excel</span>
        </button>
      </div>

      {/* 7-DAY INACTIVITY ALERT BANNER */}
      {inactiveLeads.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-300 text-sm">
                  Alerta: Seguimiento pendiente (+7 días de inactividad)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px]">
                  {inactiveLeads.length} prospectos
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                Los siguientes prospectos llevan más de una semana sin recibir llamadas, mensajes o demostración programada.
                Se requiere contacto inmediato para evitar la pérdida del lead.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('seguimientos')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            Atender Seguimientos Pendientes
          </button>
        </div>
      )}

      {/* Comprehensive Metric Grid (User requested list) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Clientes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Clientes</span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">{totalClientes}</div>
            <div className="text-[11px] text-blue-400 font-medium mt-1">Cuentas y Empresas</div>
          </div>
        </div>

        {/* 2. Total Prospectos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Prospectos</span>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-300 font-mono">{totalLeads}</div>
            <div className="text-[11px] text-slate-400 mt-1">En el pipeline comercial</div>
          </div>
        </div>

        {/* 3. Total Oportunidades Ganadas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Oportunidades Ganadas</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{wonCount}</div>
            <div className="text-[11px] text-emerald-400/90 font-mono mt-1">
              RD$ {wonValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4. Oportunidades Perdidas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Oportunidades Perdidas</span>
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400 font-mono">{lostCount}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              RD$ {lostValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 5. Tasa de Conversión */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tasa de Conversión</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-300 font-mono">{conversionRate}%</div>
            <div className="text-[11px] text-slate-400 mt-1">Cierres sobre captación</div>
          </div>
        </div>

        {/* 6. Seguimientos Pendientes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Seguimientos Pendientes</span>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-300 font-mono">
              {pendingFollowUps.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Llamadas y WhatsApp</div>
          </div>
        </div>

        {/* 7. Usuarios Activos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Usuarios Activos</span>
            <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-teal-300 font-mono flex items-center gap-2">
              <span>{activeUsersCount}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">En línea (ITHOT Team)</div>
          </div>
        </div>

        {/* 8. Última Importación */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Última Importación</span>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-200 truncate">
              {lastImport ? lastImport.archivo : 'contactos_santodomingo.xlsx'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              {lastImport ? `${lastImport.fecha} ${lastImport.hora}` : '2026-09-28 14:15'}
            </div>
          </div>
        </div>

        {/* 9. Última Exportación */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Última Exportación</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <FileDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-200 truncate">
              {lastExport ? lastExport.archivo_generado : 'reporte_gerencial_ithot.xlsx'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              {lastExport ? `${lastExport.fecha} ${lastExport.hora}` : '2026-09-28 16:30'}
            </div>
          </div>
        </div>

        {/* 10. Base de Datos MySQL */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Motor de Base de Datos</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-emerald-400 font-mono">MySQL 8.0</div>
            <div className="text-[11px] text-slate-400 mt-1">Esquema Relacional Activo</div>
          </div>
        </div>
      </div>

      {/* Row: Metas Comerciales & Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objetivos Comerciales Widget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Metas y Objetivos Comerciales (Septiembre 2026)
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('objetivos' as any)}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              <span>Ver Objetivos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Meta 1: 50 Prospectos */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Meta Mensual: 50 Prospectos
                </span>
                <span className="font-mono text-xs font-bold text-purple-400">
                  38 / 50 (76%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: '76%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Responsable: Equipo Comercial ITHOT</span>
                <span>Faltan 12 prospectos</span>
              </div>
            </div>

            {/* Meta 2: RD$ 500,000 en ventas */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Meta de Ventas: RD$ 500,000
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  RD$ 385,000 / RD$ 500,000 (77%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                  style={{ width: '77%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Responsable: Equipo Comercial ITHOT</span>
                <span>Resta: RD$ 115,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad Reciente en Vivo Widget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Actividad Reciente del Sistema
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <button
              onClick={() => onNavigateSection('actividad' as any)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Ver Registro Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{act.usuario}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {act.modulo}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{act.detalles}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {act.hora}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts & Pipeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Prospectos por Estado */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Distribución de Prospectos por Etapa
              </h3>
              <p className="text-xs text-slate-400">
                Cantidad de prospectos y volumen económico acumulado en cada fase comercial.
              </p>
            </div>
            <button
              onClick={() => onNavigateSection('pipeline')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Ver Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {stageDistribution.map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{item.stage}</span>
                  <div className="flex items-center gap-3 font-mono text-slate-400 tabular-nums">
                    <span>
                      <strong className="text-white font-semibold">{item.count}</strong> prospectos
                    </span>
                    <span>·</span>
                    <span className="text-slate-300">RD$ {item.value.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.stage === 'Ganado'
                        ? 'bg-emerald-500'
                        : item.stage === 'Perdido'
                        ? 'bg-rose-500'
                        : item.stage === 'Negociación'
                        ? 'bg-purple-500'
                        : item.stage === 'Propuesta Enviada'
                        ? 'bg-indigo-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(item.percentage, item.count > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversión y Próximos Seguimientos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Próximos Seguimientos
              </h3>
              <button
                onClick={() => onNavigateSection('seguimientos')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-2 mt-3">
              {pendingFollowUps.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{lead.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{lead.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-amber-400 block">
                      {lead.nextFollowUpDate}
                    </span>
                    <span className="text-[10px] text-slate-500">{lead.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('reportes')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Reportes Gerenciales</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
