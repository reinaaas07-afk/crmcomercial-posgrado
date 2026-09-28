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
  Building2,
  Phone,
  Mail,
  UserCheck,
  ChevronDown,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Lead, LeadSource, LeadStage, User } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';

interface LeadsViewProps {
  leads: Lead[];
  users: User[];
  onSelectLead: (lead: Lead) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  users,
  onSelectLead,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteLead,
  onUpdateLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');

  // Filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !searchTerm.trim() ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesAdvisor = advisorFilter === 'all' || lead.assignedTo === advisorFilter;

      return matchesSearch && matchesStage && matchesSource && matchesAdvisor;
    });
  }, [leads, searchTerm, stageFilter, sourceFilter, advisorFilter]);

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

  const handleExportCSV = () => {
    const headers = 'ID,Nombre,Empresa,Email,Telefono,Fuente,Responsable,Etapa,FechaRegistro,ProximoSeguimiento,ValorUSD\n';
    const rows = filteredLeads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.company}","${l.email}","${l.phone}","${l.source}","${l.assignedToName}","${l.stage}","${l.createdAt}","${l.nextFollowUpDate || ''}","${l.estimatedValue}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prospectos_crmcomercial_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestión y Directorio de Prospectos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Base centralizada con filtros comerciales, asignación de responsables y acceso a fichas técnicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Exportar registros filtrados a archivo CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Prospecto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, email, teléfono o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Etapas</option>
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
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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

          {/* Filter by Advisor */}
          <div>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Asesores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedLeadIds.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <span className="text-slate-300 font-medium">
              <span className="text-blue-400 font-semibold">{selectedLeadIds.length}</span> prospecto(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTagModal(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Etiquetar</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar los ${selectedLeadIds.length} prospectos seleccionados?`)) {
                    selectedLeadIds.forEach((id) => onDeleteLead(id));
                    setSelectedLeadIds([]);
                  }
                }}
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Selección</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white"
                    title="Seleccionar todos"
                  >
                    {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Prospecto y Empresa</th>
                <th className="py-3 px-3">Contacto</th>
                <th className="py-3 px-3">Fuente</th>
                <th className="py-3 px-3">Responsable</th>
                <th className="py-3 px-3">Etapa Comercial</th>
                <th className="py-3 px-3 text-right">Oportunidad</th>
                <th className="py-3 px-3">Registro</th>
                <th className="py-3 px-3">Próx. Seguimiento</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No se encontraron prospectos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => handleToggleSelectOne(lead.id, e)}>
                        <button className="text-slate-500 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Nombre & Empresa */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white truncate max-w-[200px]">{lead.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                        {/* Tags unboxed */}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lead.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] text-slate-400 font-mono"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="font-mono text-[11px]">{lead.phone || '—'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{lead.email || '—'}</div>
                      </td>

                      {/* Fuente */}
                      <td className="py-3 px-3 text-slate-300">
                        <span className="text-[11px]">{lead.source}</span>
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-blue-400">
                            {lead.assignedToName.slice(0, 1)}
                          </div>
                          <span className="truncate max-w-[110px]">{lead.assignedToName}</span>
                        </div>
                      </td>

                      {/* Etapa Comercial */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${
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
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 font-medium">
                        ${lead.estimatedValue.toLocaleString()} USD
                      </td>

                      {/* Fecha Registro */}
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] tabular-nums">
                        {lead.createdAt}
                      </td>

                      {/* Próximo Seguimiento */}
                      <td className="py-3 px-3">
                        {lead.nextFollowUpDate ? (
                          <span className="font-mono text-[11px] text-amber-400 tabular-nums">
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
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                            title="Abrir ficha individual"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(lead)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Editar prospecto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar al prospecto ${lead.name}?`)) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
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
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Mostrando <strong className="text-white font-mono">{filteredLeads.length}</strong> de{' '}
            <span className="font-mono">{leads.length}</span> prospectos
          </span>
          <span className="text-[11px] font-mono">
            Total en vista: ${filteredLeads.reduce((acc, l) => acc + l.estimatedValue, 0).toLocaleString()} USD
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
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkTagSave}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
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
