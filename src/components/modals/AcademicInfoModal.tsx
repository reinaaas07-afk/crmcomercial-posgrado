import React from 'react';
import { GraduationCap, X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AcademicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicInfoModal: React.FC<AcademicInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gradient highlight */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Proyecto de Posgrado</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Diseño de un Sistema CRM para la Gestión y Seguimiento de Prospectos</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-5 text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Objetivo del Prototipo</h3>
            <p className="text-slate-300">
              Prototipo visual funcional e interactivo para validar la arquitectura de información, experiencia de usuario y flujo operacional 
              de un software CRM comercial enfocado en optimizar el ciclo de conversión de clientes potenciales dentro de organizaciones B2B y de servicios.
            </p>
          </div>

          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Alcance del Sistema (Enfoque Especializado)</span>
            </div>
            <p className="text-xs text-slate-300">
              El alcance de esta plataforma comprende estrictamente:
            </p>
            <ul className="text-xs space-y-1.5 pl-5 list-disc text-slate-300">
              <li><strong className="text-white">Administración integral de prospectos:</strong> Captación, filtrado, asignación y etiquetas.</li>
              <li><strong className="text-white">Pipeline Comercial Kanban:</strong> 8 etapas visuales con arrastre interactivo y valorización.</li>
              <li><strong className="text-white">Seguimiento multicanal:</strong> Bitácora de llamadas, mensajes WhatsApp, correos, reuniones y notas.</li>
              <li><strong className="text-white">Calendario y Tareas:</strong> Control de compromisos comerciales y alertas de próximo contacto.</li>
              <li><strong className="text-white">Análisis de conversión y reportes:</strong> Indicadores de rendimiento por asesor y motivo de pérdida.</li>
            </ul>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200/90 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-300">Exclusión de Módulos Operativos:</strong>
              <p className="mt-0.5">
                Por diseño metodológico del proyecto de posgrado, no se incluyen módulos de facturación electrónica, contabilidad general, cobranza ni inventarios de almacén.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Plataforma: <span className="text-blue-400 font-medium">CRMComercial v1.0</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
          >
            Entendido y Explorar CRM
          </button>
        </div>
      </div>
    </div>
  );
};
