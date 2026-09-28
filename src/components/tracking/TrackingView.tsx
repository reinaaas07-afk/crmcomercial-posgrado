import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MessageSquare,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Activity, ActivityType, ActivityResult, Lead, User } from '../../types/crm';

interface TrackingViewProps {
  activities: Activity[];
  leads: Lead[];
  users: User[];
  onOpenCreateActivityModal: () => void;
  onSelectLeadById: (leadId: string) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  activities,
  leads,
  users,
  onOpenCreateActivityModal,
  onSelectLeadById,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredActivities = activities.filter((act) => {
    const matchesType = selectedType === 'all' || act.type === selectedType;
    const matchesResult = selectedResult === 'all' || act.result === selectedResult;
    const matchesUser = selectedUser === 'all' || act.userId === selectedUser;
    const matchesSearch =
      !searchQuery.trim() ||
      act.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.nextAction && act.nextAction.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesResult && matchesUser && matchesSearch;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Llamada':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'Correo':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'Reunión':
        return <Users className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-amber-400" />;
    }
  };

  // Activity counts
  const totalCalls = activities.filter((a) => a.type === 'Llamada').length;
  const totalWhatsApp = activities.filter((a) => a.type === 'WhatsApp').length;
  const totalEmails = activities.filter((a) => a.type === 'Correo').length;
  const totalMeetings = activities.filter((a) => a.type === 'Reunión').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Módulo de Seguimiento Comercial
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Bitácora operativa centralizada: llamadas, WhatsApp, reuniones, correos y acuerdos de seguimiento.
          </p>
        </div>

        <button
          onClick={onOpenCreateActivityModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Actividad</span>
        </button>
      </div>

      {/* Activity Counters Mini Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Llamadas Realizadas</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums">{totalCalls}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Mensajes WhatsApp</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums">{totalWhatsApp}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Reuniones y Demos</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums">{totalMeetings}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Correos Enviados</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums">{totalEmails}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por prospecto o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Canales</option>
              <option value="Llamada">Llamadas</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Correo">Correos</option>
              <option value="Reunión">Reuniones</option>
              <option value="Nota">Notas</option>
            </select>
          </div>

          <div>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Resultados</option>
              <option value="Exitoso">Exitoso</option>
              <option value="Interesado">Interesado</option>
              <option value="Reagendado">Reagendado</option>
              <option value="Sin respuesta">Sin respuesta</option>
              <option value="Ocupado">Ocupado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
      </div>

      {/* Activity Timeline / Table Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Bitácora de Interacciones ({filteredActivities.length})
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Registros ordenados cronológicamente
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No hay actividades registradas que coincidan con la búsqueda.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const relatedLead = leads.find((l) => l.id === act.leadId);

              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl shrink-0 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectLeadById(act.leadId)}
                          className="font-bold text-white text-sm hover:text-blue-400 transition-colors text-left"
                        >
                          {act.leadName}
                        </button>
                        {relatedLead && (
                          <span className="text-xs text-slate-400">· {relatedLead.company}</span>
                        )}
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-blue-400 font-medium">[{act.type}]</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {act.notes}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <span>Responsable:</span>
                          <strong className="text-slate-200 font-medium">{act.userName}</strong>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <span>Resultado:</span>
                          <span
                            className={`font-medium ${
                              act.result === 'Exitoso' || act.result === 'Interesado'
                                ? 'text-emerald-400'
                                : act.result === 'Sin respuesta' || act.result === 'Ocupado'
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {act.result}
                          </span>
                        </div>
                        {act.nextAction && (
                          <>
                            <span>·</span>
                            <div className="flex items-center gap-1 text-sky-300">
                              <span>Próxima acción:</span>
                              <strong className="font-medium">{act.nextAction}</strong>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Date, Next follow-up, and Action button */}
                  <div className="md:text-right shrink-0 flex md:flex-col justify-between items-center md:items-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                    <div>
                      <div className="text-xs font-mono text-slate-300 tabular-nums font-semibold">
                        {act.date} {act.time}
                      </div>
                      {act.nextFollowUpDate && (
                        <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                          Próx: {act.nextFollowUpDate}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectLeadById(act.leadId)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <span>Ver Ficha</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
