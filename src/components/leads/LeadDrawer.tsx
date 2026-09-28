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
} from 'lucide-react';
import { Lead, Activity, LeadStage, User, ActivityType, ActivityResult } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';

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
  const [activeTab, setActiveTab] = useState<'historial' | 'notas' | 'archivos'>('historial');
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

    // Also update lead's notes field
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
      nextAction: 'Seguimiento continuo',
      nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + ' 11:00',
    };

    onAddActivity(activity);
    setQuickActivityNotes('');
    setShowQuickActivityForm(false);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
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

  const handleSimulateFileUpload = () => {
    const fileName = prompt('Nombre del archivo o documento a adjuntar:', 'Especificacion_Comercial.pdf');
    if (!fileName) return;

    const newAttachment = {
      id: `att-${Date.now()}`,
      name: fileName,
      size: '1.4 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateLead({
      ...lead,
      attachments: [...(lead.attachments || []), newAttachment],
    });
  };

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(lead.name)},%20te%20escribo%20de%20CRMComercial%20respecto%20a%20tu%20consulta.`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Ficha de Prospecto</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">ID: {lead.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white truncate">{lead.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-300 font-medium truncate">{lead.company}</span>
              <span>·</span>
              <span>Fuente: {lead.source}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenEditModal(lead)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Editar prospecto"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar el prospecto "${lead.name}"?`)) {
                  onDeleteLead(lead.id);
                  onClose();
                }
              }}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Eliminar prospecto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Commercial Pipeline Action Ribbon */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Etapa:</span>
            <select
              value={lead.stage}
              onChange={(e) => handleStageChange(e.target.value as LeadStage)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-white font-medium focus:outline-none focus:border-blue-500"
            >
              {PIPELINE_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono tabular-nums text-emerald-400 font-semibold text-sm">
                ${lead.estimatedValue.toLocaleString('en-US')} USD
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-300">
              <span>Asignado:</span>
              <strong className="text-white font-medium">{lead.assignedToName}</strong>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Contact Bar */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Llamar</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-700/50 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Correo</span>
            </a>
          </div>

          {/* Contact Details Grid */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Correo:</span>
                <span className="text-slate-200 font-mono">{lead.email || 'No registrado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Teléfono:</span>
                <span className="text-slate-200 font-mono">{lead.phone || 'No registrado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Fecha de Registro:</span>
                <span className="text-slate-200 font-mono">{lead.createdAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Próximo Seguimiento:</span>
                <span className="text-amber-400 font-mono font-medium">
                  {lead.nextFollowUpDate || 'Sin seguimiento programado'}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Etiquetas:</span>
                {!isAddingTag ? (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Agregar etiqueta
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Nueva etiqueta..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="px-2 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-500"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setIsAddingTag(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-md"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Quitar etiqueta"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Accordion / Button */}
          <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Acción Rápida de Seguimiento
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ¿Hablaste con el cliente? Registra el resultado inmediatamente.
                </p>
              </div>
              <button
                onClick={() => setShowQuickActivityForm(!showQuickActivityForm)}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                {showQuickActivityForm ? 'Cancelar' : '+ Registrar Contacto'}
              </button>
            </div>

            {showQuickActivityForm && (
              <form onSubmit={handleSaveQuickActivity} className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Medio de contacto:</label>
                    <select
                      value={quickActivityType}
                      onChange={(e) => setQuickActivityType(e.target.value as ActivityType)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Llamada">Llamada</option>
                      <option value="Correo">Correo</option>
                      <option value="Reunión">Reunión</option>
                      <option value="Nota">Nota</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Resultado:</label>
                    <select
                      value={quickActivityResult}
                      onChange={(e) => setQuickActivityResult(e.target.value as ActivityResult)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none"
                    >
                      <option value="Exitoso">Exitoso</option>
                      <option value="Interesado">Interesado</option>
                      <option value="Reagendado">Reagendado</option>
                      <option value="Sin respuesta">Sin respuesta</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Notas de la conversación:</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Qué dijo el prospecto, requerimientos acordados..."
                    value={quickActivityNotes}
                    onChange={(e) => setQuickActivityNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                  >
                    Guardar Contacto
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Tabs: Historial, Notas, Archivos */}
          <div>
            <div className="flex items-center gap-1 border-b border-slate-800 mb-4">
              <button
                onClick={() => setActiveTab('historial')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'historial'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Historial de Actividades ({leadActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('notas')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'notas'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Notas Comerciales
              </button>
              <button
                onClick={() => setActiveTab('archivos')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'archivos'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Archivos Adjuntos ({lead.attachments?.length || 0})
              </button>
            </div>

            {/* TAB: HISTORIAL */}
            {activeTab === 'historial' && (
              <div className="space-y-4">
                {leadActivities.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No se han registrado seguimientos para este prospecto aún.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leadActivities.map((act) => {
                      const getIcon = () => {
                        switch (act.type) {
                          case 'Llamada':
                            return <PhoneCall className="w-3.5 h-3.5 text-blue-400" />;
                          case 'WhatsApp':
                            return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
                          case 'Correo':
                            return <Mail className="w-3.5 h-3.5 text-indigo-400" />;
                          case 'Reunión':
                            return <Users className="w-3.5 h-3.5 text-purple-400" />;
                          default:
                            return <FileText className="w-3.5 h-3.5 text-amber-400" />;
                        }
                      };

                      return (
                        <div
                          key={act.id}
                          className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-800 border border-slate-700/80 rounded-md">
                                {getIcon()}
                              </div>
                              <span className="font-semibold text-white">{act.type}</span>
                              <span className="text-slate-500">·</span>
                              <span className="text-slate-400">{act.userName}</span>
                            </div>
                            <span className="font-mono text-slate-400 tabular-nums">
                              {act.date} {act.time}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 pl-7">{act.notes}</p>

                          <div className="pl-7 flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                            <span className="text-slate-400">
                              Resultado: <span className="text-slate-200 font-medium">{act.result}</span>
                            </span>
                            {act.nextAction && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="text-blue-300">
                                  Próxima acción: {act.nextAction}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: NOTAS */}
            {activeTab === 'notas' && (
              <div className="space-y-4">
                <form onSubmit={handleAddQuickNote} className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Agregar Observación o Nota Rápida
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe comentarios sobre requerimientos, objeciones o acuerdos comerciales..."
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Guardar Nota
                    </button>
                  </div>
                </form>

                <div className="mt-4 p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Historial de Notas del Prospecto
                  </h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {lead.notes || 'No hay notas comerciales registradas.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ARCHIVOS */}
            {activeTab === 'archivos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Propuestas, cotizaciones, contratos y especificaciones.
                  </span>
                  <button
                    onClick={handleSimulateFileUpload}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adjuntar Archivo
                  </button>
                </div>

                {(!lead.attachments || lead.attachments.length === 0) ? (
                  <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    <Paperclip className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    No hay archivos adjuntos en este expediente.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lead.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Paperclip className="w-4 h-4 text-blue-400 shrink-0" />
                          <div className="truncate">
                            <span className="font-medium text-slate-200 block truncate">{file.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {file.size} · Subido el {file.uploadedAt}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Simulación: Descargando archivo ${file.name}`)}
                          className="px-2.5 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors shrink-0"
                        >
                          Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Última actualización: Hoy</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
