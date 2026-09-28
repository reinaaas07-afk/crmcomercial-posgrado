import React, { useState } from 'react';
import { X, PhoneCall, Mail, MessageSquare, Users, FileText, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Activity, ActivityType, ActivityResult, Lead, User } from '../../types/crm';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveActivity: (activity: Activity) => void;
  leads: Lead[];
  currentUser: User;
  preselectedLeadId?: string;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: React.ElementType }[] = [
  { type: 'Llamada', label: 'Llamada', icon: PhoneCall },
  { type: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare },
  { type: 'Correo', label: 'Correo', icon: Mail },
  { type: 'Reunión', label: 'Reunión', icon: Users },
  { type: 'Nota', label: 'Nota', icon: FileText },
];

const RESULTS: ActivityResult[] = [
  'Exitoso',
  'Interesado',
  'Reagendado',
  'Sin respuesta',
  'Ocupado',
  'Rechazado',
];

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onSaveActivity,
  leads,
  currentUser,
  preselectedLeadId,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState(preselectedLeadId || leads[0]?.id || '');
  const [type, setType] = useState<ActivityType>('Llamada');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [result, setResult] = useState<ActivityResult>('Exitoso');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('Llamada de seguimiento');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + ' 10:00'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === selectedLeadId) || leads[0];
    if (!lead) return;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      type,
      date,
      time,
      userId: currentUser.id,
      userName: currentUser.name,
      result,
      notes: notes.trim(),
      nextAction: nextAction.trim() || undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
    };

    onSaveActivity(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Registrar Seguimiento Comercial
              </h2>
              <p className="text-xs text-slate-400">
                Documenta cada contacto comercial para mantener el historial del prospecto al día.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Prospecto Relacionado *
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.company} ({l.stage})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Canal de Actividad *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ACTIVITY_TYPES.map(({ type: actType, label, icon: Icon }) => (
                <button
                  type="button"
                  key={actType}
                  onClick={() => setType(actType)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    type === actType
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Fecha del Contacto
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hora
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Resultado
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as ActivityResult)}
                className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {RESULTS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Observaciones / Resultado de la Interacción *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Resume los puntos tratados, inquietudes del cliente, acuerdos y estado de ánimo comercial..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Próxima Acción Acordada
              </label>
              <input
                type="text"
                placeholder="Ej. Enviar propuesta ajustada"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Fecha del Próximo Seguimiento
              </label>
              <input
                type="datetime-local"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              Guardar Seguimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
