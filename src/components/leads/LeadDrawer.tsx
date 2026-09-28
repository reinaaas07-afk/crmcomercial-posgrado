import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Tag,
  Paperclip,
  Clock,
  PhoneCall,
  MessageSquare,
  Users,
  FileText,
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  Trash2,
  Edit2,
  CheckCircle2,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Lead, Activity, LeadStage, User, ActivityType, ActivityResult } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';
import { CATALOGO_ETIQUETAS } from '../../types/schema';

interface LeadDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  currentUser: User;
  users: User[];
  onOpenEditModal: (lead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onDeleteLead,
  activities,
  onAddActivity,
  currentUser,
  users,
  onOpenEditModal,
}) => {
  const [activeTab, setActiveTab] = useState<'ficha' | 'historial' | 'notas' | 'archivos'>('ficha');
  const [quickNote, setQuickNote] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Quick activity logging from drawer
  const [quickActivityType, setQuickActivityType] = useState<ActivityType>('WhatsApp');
  const [quickActivityResult, setQuickActivityResult] = useState<ActivityResult>('Exitoso');
  const [quickActivityNotes, setQuickActivityNotes] = useState('');
  const [showQuickActivityForm, setShowQuickActivityForm] = useState(false);

  if (!isOpen || !lead) return null;

  const leadActivities = activities.filter((a) => a.leadId === lead.id);

  const handleStageChange = (newStage: LeadStage) => {
    onUpdateLead({
      ...lead,
      stage: newStage,
    });
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      type: 'Nota',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      userId: currentUser.id,
      userName: currentUser.name,
      result: 'Exitoso',
      notes: quickNote.trim(),
    };

    onAddActivity(activity);

    const updatedNotes = lead.notes
      ? `${lead.notes}\n[${activity.date}]: ${quickNote.trim()}`
      : quickNote.trim();

    onUpdateLead({
      ...lead,
      notes: updatedNotes,
    });

    setQuickNote('');
  };

  const handleSaveQuickActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActivityNotes.trim()) return;

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      type: quickActivityType,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      userId: currentUser.id,
      userName: currentUser.name,
      result: quickActivityResult,
      notes: quickActivityNotes.trim(),
      nextAction: 'Seguimiento continuo de la oportunidad',
      nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + ' 11:00',
    };

    onAddActivity(activity);
    setQuickActivityNotes('');
    setShowQuickActivityForm(false);
  };

  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim();
    if (!tag) return;
    if (!lead.tags.includes(tag)) {
      onUpdateLead({
        ...lead,
        tags: [...lead.tags, tag],
      });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateLead({
      ...lead,
      tags: lead.tags.filter((t) => t !== tagToRemove),
    });
  };

  const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
    lead.name
  )},%20te%20contacto%20de%20ITHOT%20respecto%20a%20tu%20oportunidad%20comercial.`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono">
                Ficha Completa de Oportunidad #{lead.id.replace('lead-', '')}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">ITHOT CRM</span>
            </div>
            <h2 className="text-xl font-bold text-white truncate">{lead.company}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
              <span className="font-semibold text-blue-300">{lead.name}</span>
              {lead.cargo && <span className="text-slate-400">({lead.cargo})</span>}
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{lead.source}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenEditModal(lead)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Editar oportunidad"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar la oportunidad de "${lead.company}"?`)) {
                  onDeleteLead(lead.id);
                  onClose();
                }
              }}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Eliminar oportunidad"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Commercial Ribbon: Stage + Value + Advisor */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Etapa Comercial:</span>
            <select
              value={lead.stage}
              onChange={(e) => handleStageChange(e.target.value as LeadStage)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-white font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {PIPELINE_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <span>Valor Estimado:</span>
              <span className="font-bold text-emerald-400 text-sm">
                ${lead.estimatedValue.toLocaleString('en-US')} RD$ / USD
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-400">Responsable:</span>
              <strong className="text-blue-300 font-semibold">{lead.assignedToName}</strong>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ficha')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ficha'
                ? 'border-blue-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ficha Detallada
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'historial'
                ? 'border-blue-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Historial de Actividades</span>
            <span className="px-1.5 py-0.2 bg-slate-800 text-blue-400 rounded-full text-[10px]">
              {leadActivities.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notas')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'notas'
                ? 'border-blue-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Notas Comerciales
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'ficha' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Quick Communication Bar */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Llamar RD</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp RD</span>
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Correo</span>
                </a>
              </div>

              {/* 16 CAMPOS OBLIGATORIOS DE LA FICHA DETALLADA */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <Building2 className="w-4 h-4" />
                  <span>Datos Comerciales de la Oportunidad</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Empresa */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">1. Empresa:</span>
                    <span className="font-bold text-white text-sm">{lead.company}</span>
                  </div>

                  {/* Contacto Principal */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">2. Contacto Principal:</span>
                    <span className="font-bold text-white text-sm">{lead.name}</span>
                    {lead.cargo && <span className="text-slate-400 block text-[10px]">{lead.cargo}</span>}
                  </div>

                  {/* Teléfono */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">3. Teléfono Dominicano:</span>
                    <span className="font-mono text-slate-200 font-semibold">{lead.phone || 'No registrado'}</span>
                  </div>

                  {/* WhatsApp */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">4. WhatsApp Dominicano:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{lead.whatsapp || lead.phone || 'No registrado'}</span>
                  </div>

                  {/* Correo Electrónico */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-0.5">5. Correo Electrónico:</span>
                    <span className="font-mono text-slate-200">{lead.email || 'No registrado'}</span>
                  </div>

                  {/* Naturaleza del Negocio */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-0.5">6. Naturaleza del Negocio:</span>
                    <span className="font-semibold text-white">{lead.naturaleza_negocio || 'Comercio / Servicios'}</span>
                  </div>

                  {/* Producto de Interés */}
                  <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-800/40">
                    <span className="text-blue-400 font-bold block text-[11px] mb-0.5">7. Producto de Interés (ITHOT):</span>
                    <span className="font-bold text-white text-sm">{lead.producto_interes || 'ITHOT System'}</span>
                  </div>

                  {/* Módulo de Interés */}
                  <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-800/40">
                    <span className="text-purple-400 font-bold block text-[11px] mb-0.5">8. Módulo de Interés:</span>
                    <span className="font-bold text-white text-sm">{lead.modulo_interes || 'Inventario'}</span>
                  </div>

                  {/* Valor Estimado */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">9. Valor Estimado:</span>
                    <span className="font-bold text-emerald-400 text-sm font-mono">
                      ${lead.estimatedValue.toLocaleString('en-US')} RD$
                    </span>
                  </div>

                  {/* Responsable Asignado */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">10. Responsable Asignado:</span>
                    <span className="font-bold text-blue-300">{lead.assignedToName}</span>
                  </div>

                  {/* Estado Actual */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">11. Estado Actual (Etapa):</span>
                    <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30 inline-block mt-0.5">
                      {lead.stage}
                    </span>
                  </div>

                  {/* Última Actividad */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">12. Última Actividad / Interacción:</span>
                    <span className="font-mono text-slate-300">
                      {lead.ultima_interaccion || '2026-09-28 09:15:00'}
                    </span>
                  </div>

                  {/* Próximo Seguimiento */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-0.5">13. Próximo Seguimiento Programado:</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {lead.nextFollowUpDate || 'Sin fecha programada'}
                    </span>
                  </div>

                  {/* Ubicación */}
                  {lead.ciudad && (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 sm:col-span-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Ubicación:</span>
                      <span className="text-slate-200 font-medium">
                        {lead.direccion ? `${lead.direccion}, ` : ''}
                        {lead.ciudad}, {lead.provincia}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comentarios y Notas */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-slate-400 block text-[11px] font-bold">14. Comentarios y Observaciones:</span>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {lead.notes || 'Sin comentarios registrados hasta el momento.'}
                  </div>
                </div>

                {/* Etiquetas */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[11px] font-bold">15. Sistema de Etiquetas:</span>
                    <span className="text-[11px] text-slate-500">Haz clic para agregar del catálogo</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {lead.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 text-blue-300 border border-slate-700 rounded-md font-medium"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Quitar etiqueta"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add from suggested catalog */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {CATALOGO_ETIQUETAS.filter((t) => !lead.tags.includes(t))
                      .slice(0, 6)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
                        >
                          +{tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Registro Rápido de Bitácora */}
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Registrar Bitácora Rápida
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Registra llamadas, WhatsApp o reuniones directamente en la base de datos relacional.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuickActivityForm(!showQuickActivityForm)}
                    className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {showQuickActivityForm ? 'Cerrar' : '+ Registrar'}
                  </button>
                </div>

                {showQuickActivityForm && (
                  <form onSubmit={handleSaveQuickActivity} className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-300 block mb-1">Tipo de Canal:</label>
                        <select
                          value={quickActivityType}
                          onChange={(e) => setQuickActivityType(e.target.value as ActivityType)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                        >
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Llamada">Llamada</option>
                          <option value="Reunión">Reunión Presencial</option>
                          <option value="Correo">Correo Electrónico</option>
                          <option value="Nota">Nota Interna</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">Resultado:</label>
                        <select
                          value={quickActivityResult}
                          onChange={(e) => setQuickActivityResult(e.target.value as ActivityResult)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                        >
                          <option value="Exitoso">Exitoso / Contactado</option>
                          <option value="Interesado">Interesado</option>
                          <option value="Sin respuesta">Sin respuesta</option>
                          <option value="Ocupado">Buzón de Voz / Ocupado</option>
                          <option value="Reagendado">Reagendado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <textarea
                        required
                        placeholder="Observaciones de la interacción..."
                        value={quickActivityNotes}
                        onChange={(e) => setQuickActivityNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white resize-none h-16"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                      >
                        Guardar en Bitácora
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase">
                  16. Historial Completo de Interacciones ({leadActivities.length})
                </span>
                <span className="text-xs text-slate-400">Orden cronológico</span>
              </div>

              {leadActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No hay actividades registradas aún para este prospecto.
                </div>
              ) : (
                <div className="space-y-3">
                  {leadActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px]">
                            {act.type}
                          </span>
                          <span className="font-semibold text-white">{act.result}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {act.date} {act.time}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                        {act.notes}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Registrado por: <strong className="text-slate-300">{act.userName}</strong></span>
                        {act.nextFollowUpDate && (
                          <span className="text-amber-400 font-mono">
                            Próx: {act.nextFollowUpDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notas' && (
            <div className="space-y-4 animate-in fade-in">
              <form onSubmit={handleAddQuickNote} className="space-y-2">
                <textarea
                  placeholder="Escribe una observación comercial importante para este cliente..."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none h-24"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Guardar Nota
                  </button>
                </div>
              </form>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {lead.notes || 'Sin notas comerciales registradas.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
