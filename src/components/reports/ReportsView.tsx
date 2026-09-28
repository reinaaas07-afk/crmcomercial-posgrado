import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  Users,
  PhoneCall,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Download,
} from 'lucide-react';
import { Lead, Activity, User, LeadSource } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';

interface ReportsViewProps {
  leads: Lead[];
  activities: Activity[];
  users: User[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ leads, activities, users }) => {
  const [timeRange, setTimeRange] = useState<'30d' | 'quarter' | 'year'>('30d');

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.stage === 'Ganado');
  const lostLeads = leads.filter((l) => l.stage === 'Perdido');
  const activePipelineLeads = leads.filter((l) => l.stage !== 'Ganado' && l.stage !== 'Perdido');

  const totalWonValue = wonLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const totalPipelineValue = activePipelineLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : '0';

  // 1. Leads by Source
  const sources: LeadSource[] = [
    'Sitio Web',
    'Meta Ads',
    'Google Ads',
    'LinkedIn',
    'Referido',
    'Evento / Feria',
    'WhatsApp Inbound',
  ];

  const sourceData = sources.map((src) => {
    const count = leads.filter((l) => l.source === src).length;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    const wonCount = wonLeads.filter((l) => l.source === src).length;
    return { source: src, count, percentage, wonCount };
  });

  // 2. Leads by Advisor
  const advisorData = users.map((user) => {
    const userLeads = leads.filter((l) => l.assignedTo === user.id);
    const userWon = userLeads.filter((l) => l.stage === 'Ganado').length;
    const userActivities = activities.filter((a) => a.userId === user.id).length;
    const rate = userLeads.length > 0 ? ((userWon / userLeads.length) * 100).toFixed(1) : '0';
    return {
      user,
      totalLeads: userLeads.length,
      wonLeads: userWon,
      activitiesCount: userActivities,
      conversionRate: rate,
    };
  });

  // 3. Funnel by Stage
  const funnelStages = PIPELINE_STAGES.map((stg) => {
    const count = leads.filter((l) => l.stage === stg).length;
    return { stage: stg, count };
  });

  // 4. Follow-up activities by type
  const actTypes = ['Llamada', 'WhatsApp', 'Correo', 'Reunión', 'Nota'];
  const actTypeCounts = actTypes.map((type) => ({
    type,
    count: activities.filter((a) => a.type === type).length,
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Date Range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Reportes y Métricas Comerciales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Análisis de efectividad del pipeline, canales de prospección y rendimiento por asesor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                timeRange === '30d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Últimos 30 Días
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trimestre Actual
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                timeRange === 'year' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Año en Curso
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Volumen Ganado (Cerrado)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ${totalWonValue.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{wonLeads.length} contratos cerrados</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Tasa de Conversión General</span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {conversionRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Promedio de la fuerza comercial</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Seguimientos Realizados</span>
          <div className="text-2xl font-bold text-blue-400 font-mono tabular-nums">
            {activities.length}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Interacciones documentadas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Prospectos Perdidos</span>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {lostLeads.length}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {totalLeads > 0 ? ((lostLeads.length / totalLeads) * 100).toFixed(0) : 0}% de pérdida
          </span>
        </div>
      </div>

      {/* Row 1: Leads by Source & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospectos por Fuente */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Prospectos por Canal de Captación (Fuente)
              </h3>
              <p className="text-xs text-slate-400">Efectividad y volumen por canal de adquisición.</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-3">
            {sourceData.map((item) => (
              <div key={item.source} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{item.source}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-400 text-[11px]">
                    <span className="text-white font-bold">{item.count} leads</span>
                    <span>·</span>
                    <span className="text-emerald-400">{item.wonCount} ganados</span>
                    <span>({item.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, item.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embudo de Conversión por Etapa */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Embudo Comercial (Pipeline Funnel)
              </h3>
              <p className="text-xs text-slate-400">Recorrido de los prospectos por las 8 etapas.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-2.5">
            {funnelStages.map((item, index) => {
              const maxLeads = Math.max(...funnelStages.map((s) => s.count), 1);
              const barPercent = Math.max(Math.round((item.count / maxLeads) * 100), item.count > 0 ? 10 : 0);

              return (
                <div key={item.stage} className="flex items-center gap-3 text-xs">
                  <span className="w-32 truncate font-medium text-slate-300 text-[11px]">
                    {item.stage}
                  </span>
                  <div className="flex-1 h-5 bg-slate-800/80 rounded-md overflow-hidden relative flex items-center">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.stage === 'Ganado'
                          ? 'bg-emerald-500/80'
                          : item.stage === 'Perdido'
                          ? 'bg-rose-500/60'
                          : 'bg-blue-600/70'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                    <span className="absolute right-2 font-mono text-[10px] text-white font-bold tabular-nums">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Desempeño por Asesor & Seguimientos por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento por Asesor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Rendimiento por Asesor Comercial
              </h3>
              <p className="text-xs text-slate-400">Carga de prospectos, cierres y actividad.</p>
            </div>
            <Users className="w-4 h-4 text-slate-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                  <th className="pb-2">Asesor</th>
                  <th className="pb-2 text-center">Prospectos</th>
                  <th className="pb-2 text-center">Contactos</th>
                  <th className="pb-2 text-center">Ganados</th>
                  <th className="pb-2 text-right">Efectividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {advisorData.map(({ user, totalLeads: userTotal, wonLeads: userWon, activitiesCount: userAct, conversionRate: rate }) => (
                  <tr key={user.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-500">{user.role}</div>
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums text-slate-300">
                      {userTotal}
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums text-blue-400">
                      {userAct}
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums text-emerald-400 font-bold">
                      {userWon}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-white font-semibold">
                      {rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seguimientos realizados por tipo y motivos de pérdida */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Actividades de Seguimiento por Canal
                </h3>
                <p className="text-xs text-slate-400">Medios más utilizados por el equipo de ventas.</p>
              </div>
              <PhoneCall className="w-4 h-4 text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {actTypeCounts.map(({ type, count }) => (
                <div
                  key={type}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-300">{type}</span>
                  <span className="text-lg font-bold text-white font-mono tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Principales Motivos de Pérdida
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded">
                <span>1. Decisión postergada para próximo ciclo presupuestario</span>
                <span className="font-mono text-slate-400">45%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded">
                <span>2. Sin respuesta reiterada tras envío de propuesta</span>
                <span className="font-mono text-slate-400">30%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded">
                <span>3. Elección de solución existente interna</span>
                <span className="font-mono text-slate-400">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
