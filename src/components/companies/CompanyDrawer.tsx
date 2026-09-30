import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Users,
  Calendar,
  Tag,
  Kanban,
  Contact as ContactIcon,
  PhoneCall,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import {
  EmpresaDB,
  ContactoDB,
  ProspectoDB,
  SeguimientoDB,
  UsuarioDB,
  ComentarioDB,
  AdjuntoDB,
  RegistroAuditoriaDB,
} from '../../types/schema';
import { CommentsAndAttachments } from '../common/CommentsAndAttachments';

interface CompanyDrawerProps {
  company: EmpresaDB | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (company: EmpresaDB) => void;
  onDelete: (id: number) => void;
  users: UsuarioDB[];
  contacts: ContactoDB[];
  prospects: ProspectoDB[];
  followups: SeguimientoDB[];
  currentUser: UsuarioDB;
  comentarios: ComentarioDB[];
  adjuntos: AdjuntoDB[];
  onAddComentario: (c: Omit<ComentarioDB, 'id'>) => void;
  onAddAdjunto: (a: Omit<AdjuntoDB, 'id'>) => void;
  onSelectContact?: (c: ContactoDB) => void;
  onSelectProspect?: (p: ProspectoDB) => void;
  auditLogs?: RegistroAuditoriaDB[];
}

export const CompanyDrawer: React.FC<CompanyDrawerProps> = ({
  company,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  users,
  contacts,
  prospects,
  followups,
  currentUser,
  comentarios,
  adjuntos,
  onAddComentario,
  onAddAdjunto,
  onSelectContact,
  onSelectProspect,
  auditLogs = [],
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'relacionados' | 'comentarios' | 'historial'>('info');

  if (!isOpen || !company) return null;

  const assignedUser = users.find((u) => u.id === company.usuario_id);

  // Relational matches
  const relatedContacts = contacts.filter(
    (c) =>
      c.empresa?.toLowerCase() === company.razon_social?.toLowerCase() ||
      c.empresa?.toLowerCase().includes(company.razon_social?.toLowerCase().split(' ')[0] || '')
  );

  const relatedProspects = prospects.filter(
    (p) =>
      p.empresa?.toLowerCase() === company.razon_social?.toLowerCase() ||
      p.empresa?.toLowerCase().includes(company.razon_social?.toLowerCase().split(' ')[0] || '')
  );

  const relatedFollowups = followups.filter((f) =>
    relatedProspects.some((p) => p.id === f.prospecto_id)
  );

  const tagsList = company.etiquetas
    ? company.etiquetas.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Top Bar */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">{company.razon_social}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono">RNC: {company.rnc}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {company.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(company)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Editar Empresa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Mover "${company.razon_social}" a la papelera de reciclaje?`)) {
                    onDelete(company.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                title="Mover a papelera"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Ficha Corporativa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('relacionados')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'relacionados'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Relaciones Vinculadas</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {relatedContacts.length + relatedProspects.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comentarios')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'comentarios'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Comentarios & Adjuntos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('historial')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'historial'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historial de Cambios</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {activeTab === 'info' && (
              <div className="space-y-5">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block mb-1">Responsable Comercial</span>
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-[10px]">
                        {assignedUser?.nombre.charAt(0) || 'U'}
                      </div>
                      <span>{assignedUser?.nombre || 'Sin Asignar'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block mb-1">Sector e Industria</span>
                    <p className="font-medium text-slate-200">{company.industria}</p>
                    <span className="text-[10px] text-slate-400">{company.sector || 'N/D'}</span>
                  </div>
                </div>

                {/* Contact Data */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Datos de Comunicación
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <a href={`tel:${company.telefono}`} className="hover:underline">
                        {company.telefono || 'Sin teléfono registrado'}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                      <a href={`mailto:${company.email}`} className="hover:underline truncate">
                        {company.email || 'Sin correo registrado'}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{company.direccion ? `${company.direccion}, ${company.ciudad}` : company.ciudad}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      {company.sitio_web ? (
                        <a
                          href={company.sitio_web}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-cyan-400"
                        >
                          <span>{company.sitio_web}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Sin sitio web</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Empleados & Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Empleados</span>
                    <p className="text-sm font-bold text-slate-200 font-mono">
                      {company.cantidad_empleados} personas
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Fecha de Registro</span>
                    <p className="text-xs text-slate-300 font-mono">{company.fecha_registro}</p>
                  </div>
                </div>

                {/* Tags */}
                {tagsList.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 block font-medium">Etiquetas Comerciales</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tagsList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {company.notas && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 block font-medium">Observaciones & DGII</span>
                    <p className="text-slate-300 leading-relaxed text-xs">{company.notas}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'relacionados' && (
              <div className="space-y-5">
                {/* Related Contacts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                      <ContactIcon className="w-4 h-4" />
                      <span>Contactos Registrados ({relatedContacts.length})</span>
                    </div>
                  </div>

                  {relatedContacts.length === 0 ? (
                    <p className="text-slate-500 text-xs py-2">
                      No hay contactos individuales asociados a esta empresa aún.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {relatedContacts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectContact && onSelectContact(c)}
                          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-slate-200">
                              {c.nombre} {c.apellido}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {c.cargo} • {c.email}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono">
                            {c.telefono}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Prospects / Opportunities */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Kanban className="w-4 h-4" />
                      <span>Oportunidades & Prospectos ({relatedProspects.length})</span>
                    </div>
                  </div>

                  {relatedProspects.length === 0 ? (
                    <p className="text-slate-500 text-xs py-2">
                      No hay oportunidades comerciales abiertas para esta empresa.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {relatedProspects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectProspect && onSelectProspect(p)}
                          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-slate-200">{p.nombre} {p.apellido}</p>
                            <p className="text-[11px] text-slate-400">
                              {p.producto_interes || 'ITHOT System'} • Fuente: {p.fuente}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 font-mono block">
                              RD$ {p.valor_estimado.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {p.fecha_proximo_seguimiento ? `Seguimiento: ${p.fecha_proximo_seguimiento.split(' ')[0]}` : 'Sin fecha'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Follow-ups */}
                {relatedFollowups.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <PhoneCall className="w-4 h-4" />
                      <span>Historial de Seguimientos ({relatedFollowups.length})</span>
                    </div>

                    <div className="space-y-2">
                      {relatedFollowups.map((f) => (
                        <div
                          key={f.id}
                          className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-200">
                              {f.canal} - {f.resultado}
                            </span>
                            <span className="text-slate-500 font-mono">{f.fecha_hora}</span>
                          </div>
                          <p className="text-slate-400 text-xs">{f.observaciones}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comentarios' && (
              <CommentsAndAttachments
                entidadTipo="empresa"
                entidadId={company.id}
                entidadTitulo={company.razon_social}
                currentUser={currentUser}
                comentarios={comentarios}
                adjuntos={adjuntos}
                onAddComentario={onAddComentario}
                onAddAdjunto={onAddAdjunto}
              />
            )}

            {activeTab === 'historial' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Trazabilidad y Registro de Cambios</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Auditoría Inmutable MySQL
                  </span>
                </div>

                {(() => {
                  const companyAudits = auditLogs.filter(
                    (a) =>
                      a.registro_afectado?.toLowerCase().includes(company.razon_social.toLowerCase()) ||
                      a.registro_afectado?.includes(String(company.id)) ||
                      a.detalles?.toLowerCase().includes(company.razon_social.toLowerCase()) ||
                      (a.modulo === 'Empresas' && a.registro_afectado?.includes(company.nombre_comercial || company.razon_social))
                  );

                  return (
                    <div className="space-y-3">
                      {/* Current Record State Timestamp */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">Creación Inicial del Registro</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                              {company.fecha_registro}
                            </span>
                          </div>
                          <p className="text-slate-400">
                            <strong>Qué se realizó:</strong> Empresa registrada en el sistema con RNC {company.rnc} y sector {company.industria}.
                          </p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                            <span><strong>Quién:</strong> {assignedUser?.nombre || 'Administrador'}</span>
                            <span><strong>Cuándo:</strong> {company.fecha_registro}</span>
                          </div>
                        </div>
                      </div>

                      {companyAudits.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.accion === 'Creación'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : item.accion === 'Modificación'
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : item.accion === 'Eliminación'
                                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {item.accion}
                              </span>
                              <span className="font-semibold text-slate-200">{item.registro_afectado}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {item.fecha} {item.hora}
                            </span>
                          </div>

                          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 space-y-1 text-slate-300">
                            <p className="text-[11px]">
                              <strong className="text-slate-200">Qué cambió: </strong>
                              {item.detalles || `${item.accion} en ${item.modulo}: ${item.registro_afectado}`}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                              <span>
                                <strong className="text-slate-300">Quién lo cambió: </strong>
                                {item.usuario}
                              </span>
                              <span>•</span>
                              <span>
                                <strong className="text-slate-300">Cuándo se cambió: </strong>
                                {item.fecha} a las {item.hora}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
