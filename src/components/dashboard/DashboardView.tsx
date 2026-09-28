import React from 'react';
import {
  Users,
  UserPlus,
  PhoneForwarded,
  Trophy,
  Clock,
  TrendingUp,
  ArrowUpRight,
  PhoneCall,
  MessageSquare,
  Mail,
  Calendar,
  ChevronRight,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Lead, Activity, Task, User, ActiveSection } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';

interface DashboardViewProps {
  leads: Lead[];
  activities: Activity[];
  tasks: Task[];
  currentUser: User;
  onSelectLead: (lead: Lead) => void;
  onNavigateSection: (section: ActiveSection) => void;
  onOpenCreateLeadModal: () => void;
  onOpenCreateActivityModal: () => void;
  onToggleTaskStatus: (taskId: string) => void;
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
}) => {
  // KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.stage === 'Nuevo Lead').length;
  const contactedLeads = leads.filter((l) => l.stage === 'Contactado').length;
  const convertedLeads = leads.filter((l) => l.stage === 'Ganado').length;
  const lostLeads = leads.filter((l) => l.stage === 'Perdido').length;

  // Pending followups
  const pendingFollowUps = leads.filter(
    (l) => l.nextFollowUpDate && l.stage !== 'Ganado' && l.stage !== 'Perdido'
  );

  const totalPipelineValue = leads
    .filter((l) => l.stage !== 'Perdido')
    .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  // Group leads by stage for the distribution chart
  const stageDistribution = PIPELINE_STAGES.map((stage) => {
    const stageLeads = leads.filter((l) => l.stage === stage);
    const count = stageLeads.length;
    const value = stageLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
    return { stage, count, value, percentage };
  });

  // Today's activities
  const todayStr = '2026-09-28';
  const todaysActivities = activities.filter((a) => a.date === todayStr);
  const todaysTasks = tasks.filter((t) => t.dueDate === todayStr);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner / Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Panel de Control Comercial
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitoreo en tiempo real de prospectos, avance en el embudo y actividades de seguimiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
            Pipeline Activo: <span className="text-emerald-400 font-semibold">${totalPipelineValue.toLocaleString()} USD</span>
          </div>
          <button
            onClick={onOpenCreateLeadModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            + Prospecto
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Prospectos Totales</span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono tabular-nums">{totalLeads}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% este mes</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Prospectos Nuevos</span>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-300 font-mono tabular-nums">{newLeads}</div>
            <div className="text-[11px] text-slate-400 mt-1">Sin contactar aún</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Contactados</span>
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
              <PhoneForwarded className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-sky-300 font-mono tabular-nums">{contactedLeads}</div>
            <div className="text-[11px] text-slate-400 mt-1">En fase de validación</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Convertidos</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{convertedLeads}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
              <span>Tasa: {conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Seguimientos Pendientes</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
              {pendingFollowUps.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requieren atención</div>
          </div>
        </div>
      </div>

      {/* Main Charts & Pipeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Prospectos por Estado (Pipeline distribution) */}
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
                    <span className="text-slate-300">${item.value.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Progress bar */}
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

        {/* Gráfico de Conversión / Velocidad */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Métricas de Conversión
              </h3>
              <span className="text-xs font-mono text-emerald-400">Actualizado</span>
            </div>

            <div className="mt-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
              <span className="text-xs font-medium text-slate-400 block mb-1">Efectividad General</span>
              <div className="text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                {conversionRate}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                De cada 10 prospectos captados, aproximadamente 3 cierran exitosamente.
              </p>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg">
                <span className="text-slate-300">Tiempo prom. de contacto:</span>
                <strong className="text-white font-mono tabular-nums">&lt; 35 min</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg">
                <span className="text-slate-300">Ciclo promedio de venta:</span>
                <strong className="text-white font-mono tabular-nums">14 días</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg">
                <span className="text-slate-300">Ticket promedio ganado:</span>
                <strong className="text-emerald-400 font-mono tabular-nums">$18,500 USD</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('reportes')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Reportes Detallados</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Actividades del Día & Próximos Seguimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividades del Día */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Actividades y Tareas de Hoy
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('tareas')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Ver todas ({tasks.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No hay tareas programadas para el día de hoy.
              </div>
            ) : (
              todaysTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    task.status === 'Completada'
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      task.status === 'Completada'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-500 hover:border-blue-400'
                    }`}
                  >
                    {task.status === 'Completada' && <CheckCircle2 className="w-3 h-3" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold truncate ${
                          task.status === 'Completada' ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] tabular-nums shrink-0 ml-2">
                        {task.dueTime}
                      </span>
                    </div>

                    {task.leadName && (
                      <div className="text-[11px] text-blue-400 truncate mt-0.5">
                        Prospecto: {task.leadName}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>Responsable: {task.assignedToName}</span>
                      <span>·</span>
                      <span
                        className={`font-semibold ${
                          task.priority === 'Alta'
                            ? 'text-rose-400'
                            : task.priority === 'Media'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        Prioridad {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Próximos Seguimientos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cola de Próximos Seguimientos
            </h3>
            <button
              onClick={() => onNavigateSection('seguimientos')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Módulo de Seguimiento
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingFollowUps.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs truncate">{lead.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">({lead.company})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Etapa: {lead.stage}</span>
                    <span>·</span>
                    <span>Asignado: {lead.assignedToName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold text-amber-400">
                    {lead.nextFollowUpDate}
                  </div>
                  <div className="text-[10px] text-slate-400">Recordatorio activo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
