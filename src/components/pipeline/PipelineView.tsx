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
  MessageSquare,
  Tag,
  Layers,
} from 'lucide-react';
import { Lead, LeadStage, User } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';
import { CATALOGO_ETIQUETAS } from '../../types/schema';

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
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLeads = leads.filter((lead) => {
    const matchesAdvisor = advisorFilter === 'all' || lead.assignedTo === advisorFilter;
    const matchesTag =
      tagFilter === 'all' ||
      lead.tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()));
    const matchesSearch =
      !searchQuery.trim() ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.producto_interes && lead.producto_interes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAdvisor && matchesTag && matchesSearch;
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
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <Layers className="w-4 h-4" />
            <span>Tablero Comercial Kanban · Soluciones ITHOT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pipeline de Oportunidades
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Arrastra las oportunidades entre las 8 etapas para sincronizar el ciclo de venta en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en pipeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-40"
            />
          </div>

          {/* Filter by Tag (Sistema de Etiquetas) */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas las Etiquetas</option>
            {CATALOGO_ETIQUETAS.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>

          {/* Filter by Advisor */}
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los Responsables</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Value Badge */}
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 hidden md:block">
            Valor Total: <strong className="text-emerald-400 font-bold">${totalPipelineValue.toLocaleString()} RD$</strong>
          </div>

          {/* New Lead Button */}
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Oportunidad</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-3.5 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const columnLeads = filteredLeads.filter((l) => l.stage === stage);
            const columnTotalValue = columnLeads.reduce((acc, curr) => acc + curr.estimatedValue, 0);
            const isWon = stage === 'Ganado';
            const isLost = stage === 'Perdido';
            const isDropActive = activeDropColumn === stage;

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`w-72 shrink-0 flex flex-col rounded-xl border transition-all ${
                  isDropActive
                    ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400'
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
                    <span className="font-bold text-xs truncate">{stage}</span>
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
                    ${columnTotalValue.toLocaleString()} RD$
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2.5 min-h-[380px]">
                  {columnLeads.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-slate-800/80 rounded-lg text-slate-600 text-[11px] text-center p-3">
                      Arrastra oportunidades aquí
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
                      const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
                        lead.name
                      )},%20te%20contacto%20de%20ITHOT%20respecto%20a%20tu%20oportunidad%20comercial.`;

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => onSelectLead(lead)}
                          className={`p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all select-none group relative space-y-2 ${
                            draggedLeadId === lead.id ? 'opacity-40 border-dashed border-blue-400' : ''
                          }`}
                        >
                          {/* Company Name & Solution Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-white text-xs truncate max-w-[170px]">
                              {lead.company}
                            </div>
                            {lead.producto_interes && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 shrink-0">
                                {lead.producto_interes.replace(' System', '')}
                              </span>
                            )}
                          </div>

                          {/* Contact Person & Position */}
                          <div className="text-[11px] text-slate-300 flex items-center gap-1 truncate">
                            <span className="font-semibold text-slate-200">{lead.name}</span>
                            {lead.cargo && <span className="text-slate-500">· {lead.cargo}</span>}
                          </div>

                          {/* Nature of business */}
                          {lead.naturaleza_negocio && (
                            <div className="text-[10px] text-slate-400 truncate">
                              {lead.naturaleza_negocio}
                            </div>
                          )}

                          {/* Tags */}
                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-blue-300 border border-slate-800 font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                              {lead.tags.length > 2 && (
                                <span className="text-[9px] text-slate-500">+{lead.tags.length - 2}</span>
                              )}
                            </div>
                          )}

                          {/* Value & Direct WhatsApp Link */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/60 text-xs">
                            <div className="flex items-center gap-0.5 text-emerald-400 font-mono tabular-nums font-bold text-[11px]">
                              <span>${lead.estimatedValue.toLocaleString()} RD$</span>
                            </div>

                            {cleanPhone && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-950/40 rounded transition-colors"
                                title="Chatear por WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Responsible Rep avatar & Quick Stage Mover */}
                          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-750">
                            <div className="flex items-center gap-1 truncate">
                              <div className="w-4 h-4 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[9px] font-bold text-blue-400 shrink-0">
                                {lead.assignedToName.slice(0, 1)}
                              </div>
                              <span className="text-[10px] truncate max-w-[85px]">{lead.assignedToName}</span>
                            </div>

                            {/* Quick stage selector */}
                            <select
                              value={lead.stage}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as LeadStage)}
                              className="text-[10px] bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-slate-300 hover:text-white focus:outline-none cursor-pointer"
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
                      );
                    })
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
