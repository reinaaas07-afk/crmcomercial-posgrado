import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Tag,
  Clock,
  PhoneCall,
  MessageSquare,
  Users,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Shield,
  Briefcase,
  FileText,
} from 'lucide-react';
import { ContactoDB, UsuarioDB, SeguimientoDB } from '../../types/schema';

interface ContactDrawerProps {
  contact: ContactoDB | null;
  isOpen: boolean;
  onClose: () => void;
  onEditContact: (contact: ContactoDB) => void;
  onDeleteContact: (contactId: number) => void;
  onConvertToOpportunity?: (contact: ContactoDB) => void;
  users: UsuarioDB[];
  seguimientos: SeguimientoDB[];
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  isOpen,
  onClose,
  onEditContact,
  onDeleteContact,
  onConvertToOpportunity,
  users,
  seguimientos,
}) => {
  if (!isOpen || !contact) return null;

  const assignedUser = users.find((u) => u.id === contact.usuario_id) || users[0];
  const cleanPhone = (contact.whatsapp || contact.telefono || '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
    contact.nombre
  )},%20te%20escribo%20de%20ITHOT%20respecto%20a%20tu%20consulta%20comercial.`;

  const tagsList = contact.etiquetas
    ? contact.etiquetas.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-lg text-blue-400 shrink-0">
              {contact.nombre.slice(0, 1)}
              {contact.apellido?.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 block mb-0.5">
                Ficha de Contacto Empresarial #{contact.id}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {contact.nombre} {contact.apellido}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-200">{contact.empresa}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{contact.cargo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditContact(contact)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Editar contacto"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar al contacto ${contact.nombre} ${contact.apellido} (${contact.empresa})?`)) {
                  onDeleteContact(contact.id);
                  onClose();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Eliminar contacto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {cleanPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[140px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp RD</span>
              </a>
            )}

            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Enviar Correo</span>
              </a>
            )}

            {onConvertToOpportunity && (
              <button
                onClick={() => {
                  onConvertToOpportunity(contact);
                  onClose();
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Crear Oportunidad</span>
              </button>
            )}
          </div>

          {/* Estado Comercial & Responsable */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Estado Comercial
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                  contact.estado_comercial.includes('Activo')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : contact.estado_comercial.includes('Inactivo')
                    ? 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {contact.estado_comercial}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Responsable ITHOT
              </span>
              <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 text-[10px] font-bold flex items-center justify-center">
                  {assignedUser?.nombre.slice(0, 1)}
                </div>
                <span>{assignedUser?.nombre}</span>
              </div>
            </div>
          </div>

          {/* Vías de Contacto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Phone className="w-3.5 h-3.5" />
              <span>Vías de Contacto y Comunicación</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px] block mb-0.5">Teléfono Principal</span>
                <span className="text-white font-mono font-medium">{contact.telefono || 'No registrado'}</span>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px] block mb-0.5">WhatsApp Dominicano</span>
                <span className="text-emerald-400 font-mono font-medium">{contact.whatsapp || contact.telefono || 'No registrado'}</span>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg sm:col-span-2">
                <span className="text-slate-500 text-[10px] block mb-0.5">Correo Electrónico</span>
                <span className="text-white font-mono">{contact.email || 'No registrado'}</span>
              </div>
            </div>
          </div>

          {/* Ubicación y Naturaleza del Negocio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ubicación y Perfil de Negocio</span>
            </h4>

            <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Naturaleza del Negocio:</span>
                <span className="text-white font-semibold">{contact.naturaleza_negocio}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-2">
                <span className="text-slate-400">Ciudad y Provincia:</span>
                <span className="text-blue-300 font-medium">
                  {contact.ciudad}, {contact.provincia}
                </span>
              </div>

              {contact.direccion && (
                <div className="flex items-start justify-between border-t border-slate-850 pt-2">
                  <span className="text-slate-400 shrink-0">Dirección:</span>
                  <span className="text-slate-300 text-right ml-4">{contact.direccion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Solución de Interés ITHOT */}
          {(contact.producto_interes || contact.modulo_interes) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Layers className="w-3.5 h-3.5" />
                <span>Interés en Soluciones ITHOT</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg">
                  <span className="text-blue-400 text-[10px] uppercase font-bold block mb-0.5">
                    Producto Principal
                  </span>
                  <span className="text-white font-semibold">{contact.producto_interes || 'ITHOT System'}</span>
                </div>

                <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg">
                  <span className="text-purple-400 text-[10px] uppercase font-bold block mb-0.5">
                    Módulo Específico
                  </span>
                  <span className="text-white font-semibold">{contact.modulo_interes || 'Inventario'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones Comerciales */}
          {contact.observaciones && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <FileText className="w-3.5 h-3.5" />
                <span>Observaciones Comerciales</span>
              </h4>
              <p className="text-xs text-slate-300 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                {contact.observaciones}
              </p>
            </div>
          )}

          {/* Etiquetas */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Tag className="w-3.5 h-3.5" />
              <span>Etiquetas Asignadas</span>
            </h4>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tagsList.length === 0 ? (
                <span className="text-xs text-slate-500">Sin etiquetas asignadas</span>
              ) : (
                tagsList.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-800 text-blue-300 border border-slate-700 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Tiempos de Registro & Seguimiento */}
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Fecha de Registro:</span>
              <span className="text-slate-400">{contact.fecha_registro}</span>
            </div>
            {contact.proximo_seguimiento && (
              <div className="flex justify-between">
                <span>Próximo Seguimiento:</span>
                <span className="text-amber-400 font-bold">{contact.proximo_seguimiento}</span>
              </div>
            )}
            {contact.ultima_interaccion && (
              <div className="flex justify-between">
                <span>Última Interacción:</span>
                <span className="text-slate-400">{contact.ultima_interaccion}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
