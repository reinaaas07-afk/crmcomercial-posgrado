import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  PhoneCall,
  Users,
  MessageSquare,
  CheckSquare,
  Plus,
  Filter,
} from 'lucide-react';
import { CalendarEvent, ActivityType, User, Lead } from '../../types/crm';
import { INITIAL_CALENDAR_EVENTS } from '../../data/mockData';

interface CalendarViewProps {
  events?: CalendarEvent[];
  users: User[];
  leads: Lead[];
  onSelectLeadById: (leadId: string) => void;
  onOpenCreateActivityModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events = INITIAL_CALENDAR_EVENTS,
  users,
  leads,
  onSelectLeadById,
  onOpenCreateActivityModal,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('all');
  const [currentMonthName] = useState('Septiembre 2026');

  // Filter events
  const filteredEvents = events.filter((ev) => {
    return selectedAdvisor === 'all' || ev.assignedTo === selectedAdvisor;
  });

  // Days in calendar month (September 2026 starts on Tuesday 1st and has 30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Sept 1, 2026 was Tuesday => 1 empty slot on Monday
  const leadingBlanks = 1;

  const getEventBadgeColor = (type: ActivityType) => {
    switch (type) {
      case 'Reunión':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/80';
      case 'Llamada':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/80';
      case 'WhatsApp':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      default:
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    }
  };

  const getEventIcon = (type: ActivityType) => {
    switch (type) {
      case 'Reunión':
        return <Users className="w-3 h-3 text-purple-400 shrink-0" />;
      case 'Llamada':
        return <PhoneCall className="w-3 h-3 text-blue-400 shrink-0" />;
      case 'WhatsApp':
        return <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />;
      default:
        return <CheckSquare className="w-3 h-3 text-amber-400 shrink-0" />;
    }
  };

  // Specific week days for the week view: Sept 28 - Oct 04, 2026
  const weekDates = [
    { label: 'Lun 28 Sep', date: '2026-09-28', isToday: true },
    { label: 'Mar 29 Sep', date: '2026-09-29', isToday: false },
    { label: 'Mié 30 Sep', date: '2026-09-30', isToday: false },
    { label: 'Jue 01 Oct', date: '2026-10-01', isToday: false },
    { label: 'Vie 02 Oct', date: '2026-10-02', isToday: false },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Calendario de Actividades Comerciales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Agenda centralizada de reuniones, llamadas de calificación y compromisos comerciales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Filter by Advisor */}
          <select
            value={selectedAdvisor}
            onChange={(e) => setSelectedAdvisor(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todo el Equipo</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenCreateActivityModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Header Month Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <span className="text-base font-bold text-white tracking-tight">{currentMonthName}</span>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            Hoy
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/80 text-center py-2.5 text-xs font-semibold text-slate-400">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-slate-950/30">
            {/* Leading blanks */}
            {Array.from({ length: leadingBlanks }).map((_, idx) => (
              <div key={`blank-${idx}`} className="min-h-[110px] p-2 bg-slate-950/60 opacity-30" />
            ))}

            {daysInMonth.map((day) => {
              const dayStr = day < 10 ? `0${day}` : `${day}`;
              const fullDateStr = `2026-09-${dayStr}`;
              const isToday = fullDateStr === '2026-09-28';
              const dayEvents = filteredEvents.filter((e) => e.date === fullDateStr);

              return (
                <div
                  key={day}
                  className={`min-h-[110px] p-2 flex flex-col justify-between hover:bg-slate-800/30 transition-colors ${
                    isToday ? 'bg-blue-950/15 ring-1 ring-inset ring-blue-500/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Day Events list */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => ev.leadId && onSelectLeadById(ev.leadId)}
                        className={`p-1.5 rounded border text-[11px] cursor-pointer hover:brightness-125 transition-all truncate flex items-center gap-1 ${getEventBadgeColor(
                          ev.type
                        )}`}
                        title={`${ev.title} (${ev.startTime}) - ${ev.assignedToName}`}
                      >
                        {getEventIcon(ev.type)}
                        <span className="font-mono text-[10px]">{ev.startTime}</span>
                        <span className="truncate font-medium">{ev.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-950/80 text-center py-3 text-xs font-semibold">
            {weekDates.map((wd) => (
              <div
                key={wd.date}
                className={wd.isToday ? 'text-blue-400 font-bold' : 'text-slate-300'}
              >
                {wd.label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 divide-x divide-slate-800/80 min-h-[460px] bg-slate-950/30">
            {weekDates.map((wd) => {
              const dayEvents = filteredEvents.filter((e) => e.date === wd.date);

              return (
                <div key={wd.date} className="p-3 space-y-3">
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs">
                      Sin actividades
                    </div>
                  ) : (
                    dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => ev.leadId && onSelectLeadById(ev.leadId)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer hover:border-slate-500 transition-all space-y-1.5 ${getEventBadgeColor(
                          ev.type
                        )}`}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="flex items-center gap-1 font-semibold">
                            {getEventIcon(ev.type)}
                            <span>{ev.type}</span>
                          </span>
                          <span>
                            {ev.startTime} - {ev.endTime}
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs leading-snug">
                          {ev.title}
                        </div>

                        {ev.leadName && (
                          <div className="text-[11px] text-slate-300 truncate">
                            Prospecto: {ev.leadName}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                          <span>Asesor:</span>
                          <strong className="text-slate-300">{ev.assignedToName}</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
