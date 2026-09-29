import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Trash2,
  Kanban,
  Users,
  FileSpreadsheet,
  PhoneCall,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificacionDB, SeccionApp } from '../../types/schema';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificacionDB[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onClearRead: () => void;
  onNavigateSection: (section: SeccionApp) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearRead,
  onNavigateSection,
}) => {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.leida).length;
  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.leida)
    : notifications;

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'nuevo_prospecto':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'oportunidad_movida':
        return <Kanban className="w-4 h-4 text-purple-400" />;
      case 'nueva_importacion':
        return <FileSpreadsheet className="w-4 h-4 text-cyan-400" />;
      case 'nuevo_seguimiento':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'nuevo_usuario':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleItemClick = (notif: NotificacionDB) => {
    if (!notif.leida) {
      onMarkAsRead(notif.id);
    }
    if (notif.modulo_destino) {
      onNavigateSection(notif.modulo_destino);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200 text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Centro de Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold font-mono">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Actividades en tiempo real del equipo ITHOT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                !filterUnreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterUnreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer px-1.5 py-1"
                title="Marcar todas como leídas"
              >
                Leídas todas
              </button>
            )}
            <button
              onClick={onClearRead}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer rounded"
              title="Limpiar leídas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1.5">
          {displayedNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No tienes notificaciones pendientes.</p>
            </div>
          ) : (
            displayedNotifications.map((notif) => {
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                    !notif.leida
                      ? 'bg-blue-950/30 border-blue-500/30 hover:bg-blue-900/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0 mt-0.5">
                      {getNotificationIcon(notif.tipo)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {notif.titulo}
                        </h4>
                        {!notif.leida && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.mensaje}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300 truncate">
                          Por: {notif.usuario_origen}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{notif.hora} · {notif.fecha}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Empresa ITHOT · Sincronización Automática</span>
          <span className="text-blue-400 font-mono">Tiempo Real</span>
        </div>
      </div>
    </div>
  );
};
