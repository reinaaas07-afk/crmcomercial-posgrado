import React, { useState } from 'react';
import {
  Settings,
  BellRing,
  Shuffle,
  MessageSquare,
  Building,
  RotateCcw,
  CheckCircle2,
  Save,
  Clock,
} from 'lucide-react';

interface SettingsViewProps {
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetDemoData }) => {
  const [assignmentMode, setAssignmentMode] = useState<'round-robin' | 'manual' | 'workload'>('round-robin');
  const [inactivityAlertHours, setInactivityAlertHours] = useState('24');
  const [autoNotifyWhatsApp, setAutoNotifyWhatsApp] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const [companyName, setCompanyName] = useState('Comercializadora B2B S.A. de C.V.');
  const [businessHours, setBusinessHours] = useState('08:30 - 18:30 Lunes a Viernes');
  const [currency, setCurrency] = useState('USD');

  const [waTemplate1, setWaTemplate1] = useState(
    'Hola {nombre}, te saluda {asesor} de {empresa}. Recibimos tu interés y queremos coordinar una breve llamada de 10 minutos para presentarte la solución.'
  );

  const [waTemplate2, setWaTemplate2] = useState(
    'Hola {nombre}, te comparto el enlace a la cotización solicitada. Quedo atento a tus dudas para definir la siguiente reunión técnica.'
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Configuración del Sistema CRM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Parámetros operativos de prospección, reglas de asignación y plantillas de contacto.
          </p>
        </div>

        {savedNotification && (
          <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Configuración guardada correctamente</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Module 1: Asignación de Leads */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shuffle className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Reglas de Asignación Automática de Prospectos
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              onClick={() => setAssignmentMode('round-robin')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                assignmentMode === 'round-robin'
                  ? 'bg-blue-600/10 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Round-Robin Equitativo</span>
                <input
                  type="radio"
                  name="assignMode"
                  checked={assignmentMode === 'round-robin'}
                  onChange={() => setAssignmentMode('round-robin')}
                  className="accent-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Distribuye de forma secuencial y cíclica cada nuevo prospecto entre los asesores activos.
              </p>
            </label>

            <label
              onClick={() => setAssignmentMode('workload')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                assignmentMode === 'workload'
                  ? 'bg-blue-600/10 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Por Carga de Trabajo</span>
                <input
                  type="radio"
                  name="assignMode"
                  checked={assignmentMode === 'workload'}
                  onChange={() => setAssignmentMode('workload')}
                  className="accent-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Asigna el lead al asesor que tenga la menor cantidad de prospectos pendientes en seguimiento.
              </p>
            </label>

            <label
              onClick={() => setAssignmentMode('manual')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                assignmentMode === 'manual'
                  ? 'bg-blue-600/10 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Asignación Manual</span>
                <input
                  type="radio"
                  name="assignMode"
                  checked={assignmentMode === 'manual'}
                  onChange={() => setAssignmentMode('manual')}
                  className="accent-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Los nuevos prospectos entran a una bandeja compartida para ser asignados por el supervisor.
              </p>
            </label>
          </div>
        </div>

        {/* Module 2: Alertas de Inactividad */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BellRing className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Control de Calidad y Alertas de Seguimiento
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Alerta de Prospecto Sin Contacto (Horas máximas)
              </label>
              <select
                value={inactivityAlertHours}
                onChange={(e) => setInactivityAlertHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="12">12 horas (Alta urgencia comercial)</option>
                <option value="24">24 horas (Recomendado estándar)</option>
                <option value="48">48 horas</option>
                <option value="72">72 horas</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Se notificará al supervisor si un lead nuevo no registra llamada o WhatsApp en este lapso.
              </p>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNotifyWhatsApp}
                  onChange={(e) => setAutoNotifyWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 bg-slate-950 border-slate-700"
                />
                <span className="text-slate-300">
                  Activar atajo directo a WhatsApp Web al registrar prospectos nuevos
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Module 3: Plantillas de Mensajes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Plantillas Rápidas para WhatsApp y Correo
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plantilla 1: Primer Contacto Comercial
              </label>
              <textarea
                rows={2}
                value={waTemplate1}
                onChange={(e) => setWaTemplate1(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plantilla 2: Seguimiento de Propuesta Enviada
              </label>
              <textarea
                rows={2}
                value={waTemplate2}
                onChange={(e) => setWaTemplate2(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Restaurar los datos de demostración originales del CRM?')) {
                onResetDemoData();
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar Datos de Demostración</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros</span>
          </button>
        </div>
      </form>
    </div>
  );
};
