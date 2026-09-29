import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Tag,
  Download,
  Upload,
  Building2,
  Phone,
  Mail,
  UserCheck,
  Briefcase,
  MessageSquare,
  X,
  CheckSquare,
  Square,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { Lead, LeadSource, LeadStage, User } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';
import { CATALOGO_ETIQUETAS } from '../../types/schema';

interface LeadsViewProps {
  leads: Lead[];
  users: User[];
  onSelectLead: (lead: Lead) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onNavigateToImports?: () => void;
  onNavigateToExports?: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  users,
  onSelectLead,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteLead,
  onUpdateLead,
  onNavigateToImports,
  onNavigateToExports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');

  // Filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const cargo = (lead as any).cargo || '';
      const matchesSearch =
        !searchTerm.trim() ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesTag =
        tagFilter === 'all' ||
        lead.tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()));
      const matchesAdvisor = advisorFilter === 'all' || lead.assignedTo === advisorFilter;

      return matchesSearch && matchesStage && matchesSource && matchesTag && matchesAdvisor;
    });
  }, [leads, searchTerm, stageFilter, sourceFilter, tagFilter, advisorFilter]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleBulkTagSave = () => {
    if (!bulkTagInput.trim() || selectedLeadIds.length === 0) return;
    const tag = bulkTagInput.trim();

    leads.forEach((l) => {
      if (selectedLeadIds.includes(l.id) && !l.tags.includes(tag)) {
        onUpdateLead({
          ...l,
          tags: [...l.tags, tag],
        });
      }
    });

    setBulkTagInput('');
    setShowTagModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Directorio y Gestión de Prospectos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Módulo relacional conectado a la tabla <span className="font-mono text-blue-400">prospectos</span> en MySQL con filtros, historial y acciones completas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToImports && (
            <button
              onClick={onNavigateToImports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Importar prospectos desde Excel o CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Importar</span>
            </button>
          )}

          {onNavigateToExports && (
            <button
              onClick={onNavigateToExports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Exportar prospectos a Excel, CSV o PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Prospecto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, empresa, cargo, teléfono o tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Stage */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Etapas (8)</option>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Source */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Fuentes</option>
              <option value="Sitio Web">Sitio Web</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referido">Referido</option>
              <option value="Evento / Feria">Evento / Feria</option>
              <option value="WhatsApp Inbound">WhatsApp Inbound</option>
            </select>
          </div>

          {/* Filter by Tag (Sistema de Etiquetas) */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Etiquetas</option>
              {CATALOGO_ETIQUETAS.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Advisor */}
          <div>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <span className="text-slate-300 font-medium">
              <span className="text-blue-400 font-bold">{selectedLeadIds.length}</span> prospecto(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTagModal(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Etiquetar</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar los ${selectedLeadIds.length} prospectos seleccionados de la base de datos?`)) {
                    selectedLeadIds.forEach((id) => onDeleteLead(id));
                    setSelectedLeadIds([]);
                  }
                }}
                className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Selección</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Relational Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white cursor-pointer"
                    title="Seleccionar todos"
                  >
                    {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-4">Nombre y Apellido</th>
                <th className="py-3 px-3">Empresa y Cargo</th>
                <th className="py-3 px-3">Contacto Directo</th>
                <th className="py-3 px-3">Fuente</th>
                <th className="py-3 px-3">Responsable</th>
                <th className="py-3 px-3">Estado / Etapa</th>
                <th className="py-3 px-3 text-right">Oportunidad</th>
                <th className="py-3 px-3">Próx. Contacto</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No se encontraron prospectos registrados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const cargo = (lead as any).cargo || 'Decisor Comercial';
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(lead.name)},%20te%20escribo%20respecto%20a%20tu%20consulta.`;

                  // Overdue follow-up check: 7+ days without contact
                  const isOverdue7Days = (() => {
                    if (lead.stage === 'Ganado' || lead.stage === 'Perdido') return false;
                    const dateToCheck = lead.ultima_interaccion || lead.createdAt || '2026-09-20';
                    const diffTime = Math.abs(new Date('2026-09-29').getTime() - new Date(dateToCheck.split(' ')[0]).getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 7 || !lead.nextFollowUpDate || lead.nextFollowUpDate < '2026-09-23';
                  })();

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-850/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => handleToggleSelectOne(lead.id, e)}>
                        <button className="text-slate-500 hover:text-white cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Numeric Database ID */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 font-bold">
                        #{lead.id.replace('lead-', '')}
                      </td>

                      {/* Nombre y Apellido */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs truncate max-w-[180px]">{lead.name}</div>
                        {/* Tags */}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {lead.tags.slice(0, 2).map((t) => (
                              <span key={t} className="text-[10px] text-slate-400 font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Empresa y Cargo */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200 flex items-center gap-1 truncate max-w-[180px]">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px] flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{cargo}</span>
                        </div>
                      </td>

                      {/* Contacto Directo */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px]">{lead.phone || '—'}</span>
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px] font-mono">{lead.email || '—'}</div>
                      </td>

                      {/* Fuente */}
                      <td className="py-3 px-3 text-slate-300">
                        <span className="text-[11px]">{lead.source}</span>
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[9px] font-bold text-blue-400 shrink-0">
                            {lead.assignedToName.slice(0, 1)}
                          </div>
                          <span className="truncate max-w-[110px]">{lead.assignedToName}</span>
                        </div>
                      </td>

                      {/* Estado / Etapa */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded ${
                            lead.stage === 'Ganado'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : lead.stage === 'Perdido'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : lead.stage === 'Negociación' || lead.stage === 'Propuesta Enviada'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {lead.stage}
                        </span>
                      </td>

                      {/* Oportunidad */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 font-bold">
                        ${lead.estimatedValue.toLocaleString()} USD
                      </td>

                      {/* Próximo Seguimiento */}
                      <td className="py-3 px-3">
                        {isOverdue7Days ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Seguimiento pendiente</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {lead.nextFollowUpDate || 'Sin programar'}
                            </span>
                          </div>
                        ) : lead.nextFollowUpDate ? (
                          <span className="font-mono text-[11px] text-amber-400 tabular-nums font-semibold">
                            {lead.nextFollowUpDate}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">Sin fecha</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Ver ficha técnica completa"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(lead)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Editar prospecto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar al prospecto ${lead.name} (${lead.company}) de la base de datos?`)) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Eliminar prospecto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Mostrando <strong className="text-white">{filteredLeads.length}</strong> de{' '}
            <span>{leads.length}</span> prospectos registrados en MySQL
          </span>
          <span>
            Suma de Oportunidades: ${filteredLeads.reduce((acc, l) => acc + l.estimatedValue, 0).toLocaleString()} USD
          </span>
        </div>
      </div>

      {/* Bulk Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-sm text-slate-100 space-y-4">
            <h3 className="font-bold text-sm text-white">Etiquetar Prospectos Seleccionados</h3>
            <p className="text-xs text-slate-400">
              Se aplicará la etiqueta a {selectedLeadIds.length} contacto(s).
            </p>
            <input
              type="text"
              placeholder="Ej. Prioridad Alta, Campaña Q4..."
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkTagSave}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold cursor-pointer"
              >
                Aplicar Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
