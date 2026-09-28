import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  Building2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Lead, LeadStage, User } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';

interface PipelineViewProps {
  leads: Lead[];
  users: User[];
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenCreateModal: () => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  users,
  onUpdateLeadStage,
  onSelectLead,
  onOpenCreateModal,
}) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<LeadStage | null>(null);
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLeads = leads.filter((lead) => {
    const matchesAdvisor = advisorFilter === 'all' || lead.assignedTo === advisorFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAdvisor && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    if (activeDropColumn !== stage) {
      setActiveDropColumn(stage);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onUpdateLeadStage(leadId, stage);
    }
    setDraggedLeadId(null);
    setActiveDropColumn(null);
  };

  const totalPipelineValue = filteredLeads
    .filter((l) => l.stage !== 'Perdido')
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-full flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Filter and Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pipeline Comercial (Tablero Kanban)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Arrastra los prospectos entre las 8 etapas para actualizar su ciclo comercial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en tablero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          {/* Filter by Advisor */}
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Asesores</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Total Value Pill */}
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            Valor Oportunidades: <span className="text-emerald-400 font-semibold">${totalPipelineValue.toLocaleString()} USD</span>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Prospecto</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 overflow-x-auto pb-4 pt-1">
        <div className="flex gap-3.5 min-w-[1750px] h-full items-start">
          {PIPELINE_STAGES.map((stage) => {
            const columnLeads = filteredLeads.filter((l) => l.stage === stage);
            const columnTotalValue = columnLeads.reduce((acc, curr) => acc + curr.estimatedValue, 0);
            const isDropActive = activeDropColumn === stage;

            const isWon = stage === 'Ganado';
            const isLost = stage === 'Perdido';

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`w-[215px] flex-shrink-0 flex flex-col max-h-full rounded-xl border transition-all duration-200 ${
                  isDropActive
                    ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-b rounded-t-xl ${
                    isWon
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                      : isLost
                      ? 'border-rose-500/30 bg-rose-950/20 text-rose-400'
                      : 'border-slate-800/80 bg-slate-900/90 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate">{stage}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                        isWon
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isLost
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-1">
                    ${columnTotalValue.toLocaleString()} USD
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2.5 min-h-[380px]">
                  {columnLeads.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-slate-800/80 rounded-lg text-slate-600 text-[11px] text-center p-3">
                      Arrastra prospectos aquí
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onSelectLead(lead)}
                        className={`p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all select-none group relative ${
                          draggedLeadId === lead.id ? 'opacity-40 border-dashed border-blue-400' : ''
                        }`}
                      >
                        {/* Prospect Name & Company */}
                        <div className="font-semibold text-white text-xs truncate">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>

                        {/* Value & Tags */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/60 text-xs">
                          <div className="flex items-center gap-0.5 text-emerald-400 font-mono tabular-nums font-semibold text-[11px]">
                            <DollarSign className="w-3 h-3" />
                            <span>{lead.estimatedValue.toLocaleString()}</span>
                          </div>

                          {/* Next follow-up indicator */}
                          {lead.nextFollowUpDate && (
                            <div
                              className="text-[10px] font-mono text-amber-400 flex items-center gap-1 truncate max-w-[100px]"
                              title={`Próximo seguimiento: ${lead.nextFollowUpDate}`}
                            >
                              <Calendar className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{lead.nextFollowUpDate.slice(5, 10)}</span>
                            </div>
                          )}
                        </div>

                        {/* Responsible Rep avatar & Quick Stage Mover */}
                        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1 truncate">
                            <div className="w-4 h-4 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[9px] font-bold text-blue-400 shrink-0">
                              {lead.assignedToName.slice(0, 1)}
                            </div>
                            <span className="text-[10px] truncate max-w-[85px]">{lead.assignedToName}</span>
                          </div>

                          {/* Quick stage selector to prevent needing drag always */}
                          <select
                            value={lead.stage}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as LeadStage)}
                            className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-slate-300 hover:text-white focus:outline-none"
                            title="Mover rápidamente a otra etapa"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
