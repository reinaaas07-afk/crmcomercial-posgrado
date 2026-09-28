import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Tag,
  Download,
  Upload,
  Building2,
  Phone,
  Mail,
  UserCheck,
  MessageSquare,
  X,
  CheckSquare,
  Square,
  MapPin,
  Layers,
  ArrowRight,
  Filter,
  Users,
} from 'lucide-react';
import { ContactoDB, UsuarioDB, CATALOGO_ETIQUETAS } from '../../types/schema';

interface ContactsViewProps {
  contacts: ContactoDB[];
  users: UsuarioDB[];
  onSelectContact: (contact: ContactoDB) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (contact: ContactoDB) => void;
  onDeleteContact: (contactId: number) => void;
  onUpdateContact: (contact: ContactoDB) => void;
  onConvertToOpportunity: (contact: ContactoDB) => void;
  onNavigateToImports?: () => void;
  onNavigateToExports?: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  users,
  onSelectContact,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteContact,
  onUpdateContact,
  onConvertToOpportunity,
  onNavigateToImports,
  onNavigateToExports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [natureFilter, setNatureFilter] = useState<string>('all');
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');

  // Filtering
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const fullText = `${c.nombre} ${c.apellido} ${c.empresa} ${c.cargo} ${c.telefono} ${c.whatsapp} ${c.email} ${c.ciudad} ${c.provincia} ${c.naturaleza_negocio} ${c.etiquetas}`.toLowerCase();
      const matchesSearch = !searchTerm.trim() || fullText.includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || c.estado_comercial === statusFilter;
      const matchesTag =
        tagFilter === 'all' ||
        (c.etiquetas && c.etiquetas.toLowerCase().includes(tagFilter.toLowerCase()));
      const matchesAdvisor =
        advisorFilter === 'all' || String(c.usuario_id) === advisorFilter;
      const matchesNature = natureFilter === 'all' || c.naturaleza_negocio === natureFilter;

      return matchesSearch && matchesStatus && matchesTag && matchesAdvisor && matchesNature;
    });
  }, [contacts, searchTerm, statusFilter, tagFilter, advisorFilter, natureFilter]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    }
  };

  const handleToggleSelectOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((item) => item !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleBulkTagSave = () => {
    if (!bulkTagInput.trim() || selectedContactIds.length === 0) return;
    const tag = bulkTagInput.trim();

    contacts.forEach((c) => {
      if (selectedContactIds.includes(c.id)) {
        const existingTags = c.etiquetas ? c.etiquetas.split(',').map((t) => t.trim()) : [];
        if (!existingTags.includes(tag)) {
          onUpdateContact({
            ...c,
            etiquetas: [...existingTags, tag].join(', '),
          });
        }
      }
    });

    setBulkTagInput('');
    setShowTagModal(false);
  };

  // Stats
  const totalContacts = contacts.length;
  const activeClients = contacts.filter((c) => c.estado_comercial === 'Cliente Activo').length;
  const prospects = contacts.filter((c) => c.estado_comercial === 'Prospecto').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">
            <Users className="w-4 h-4" />
            <span>Módulo de Contactos · Empresas & Personas (ITHOT)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Directorio de Contactos Comerciales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Base centralizada con información de empresas dominicanas, teléfonos, WhatsApp, ubicación y soluciones ITHOT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToImports && (
            <button
              onClick={onNavigateToImports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Importar contactos desde Excel o CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Importar</span>
            </button>
          )}

          {onNavigateToExports && (
            <button
              onClick={onNavigateToExports}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Exportar contactos a Excel o CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contacto</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Total Contactos</span>
          <span className="text-lg font-bold text-white font-mono">{totalContacts}</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Clientes Activos</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{activeClients}</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Prospectos Registrados</span>
          <span className="text-lg font-bold text-blue-400 font-mono">{prospects}</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Responsable Principal</span>
          <span className="text-sm font-bold text-slate-200 truncate block">Ing. Yenifer Sena (ITHOT)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, cargo, teléfono RD, ciudad o tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Estado Comercial */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Estados Comerciales</option>
              <option value="Prospecto">Prospecto</option>
              <option value="Cliente Activo">Cliente Activo</option>
              <option value="Cliente">Cliente</option>
              <option value="Cliente Inactivo">Cliente Inactivo</option>
              <option value="En Negociación">En Negociación</option>
            </select>
          </div>

          {/* Filter by Tag (Sistema de Etiquetas) */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Etiquetas</option>
              {CATALOGO_ETIQUETAS.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Advisor */}
          <div>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Responsables</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedContactIds.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <span className="text-slate-300 font-medium">
              <span className="text-blue-400 font-bold">{selectedContactIds.length}</span> contacto(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTagModal(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Etiquetar Selección</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar los ${selectedContactIds.length} contactos seleccionados?`)) {
                    selectedContactIds.forEach((id) => onDeleteContact(id));
                    setSelectedContactIds([]);
                  }
                }}
                className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Selección</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Relational Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white cursor-pointer"
                    title="Seleccionar todos"
                  >
                    {selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-4">Contacto y Cargo</th>
                <th className="py-3 px-3">Empresa y Naturaleza</th>
                <th className="py-3 px-3">Teléfono / WhatsApp RD</th>
                <th className="py-3 px-3">Ubicación (RD)</th>
                <th className="py-3 px-3">Solución ITHOT</th>
                <th className="py-3 px-3">Responsable</th>
                <th className="py-3 px-3">Estado Comercial</th>
                <th className="py-3 px-3">Etiquetas</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No se encontraron contactos registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  const cleanPhone = (contact.whatsapp || contact.telefono || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
                    contact.nombre
                  )},%20te%20contacto%20de%20ITHOT%20respecto%20a%20tu%20consulta.`;
                  const assignedUser = users.find((u) => u.id === contact.usuario_id);

                  const tags = contact.etiquetas
                    ? contact.etiquetas.split(',').map((t) => t.trim()).filter(Boolean)
                    : [];

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => onSelectContact(contact)}
                      className={`hover:bg-slate-850/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => handleToggleSelectOne(contact.id, e)}
                      >
                        <button className="text-slate-500 hover:text-white cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* ID */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 font-bold">
                        #{contact.id}
                      </td>

                      {/* Contacto y Cargo */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs truncate max-w-[180px]">
                          {contact.nombre} {contact.apellido}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {contact.cargo}
                        </div>
                      </td>

                      {/* Empresa y Naturaleza */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200 flex items-center gap-1 truncate max-w-[200px]">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{contact.empresa}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {contact.naturaleza_negocio}
                        </div>
                      </td>

                      {/* Teléfono / WhatsApp */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-300">
                            {contact.telefono || '—'}
                          </span>
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded transition-colors"
                              title="Chatear por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {contact.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px] font-mono">
                            {contact.email}
                          </div>
                        )}
                      </td>

                      {/* Ubicación */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px] font-medium">{contact.ciudad}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {contact.provincia}
                        </div>
                      </td>

                      {/* Solución ITHOT */}
                      <td className="py-3 px-3">
                        <div className="text-white font-medium text-[11px]">
                          {contact.producto_interes || 'ITHOT System'}
                        </div>
                        <div className="text-[10px] text-blue-400 font-mono">
                          {contact.modulo_interes || 'General'}
                        </div>
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[9px] font-bold text-blue-400 shrink-0">
                            {assignedUser?.nombre.slice(0, 1) || 'Y'}
                          </div>
                          <span className="truncate max-w-[110px]">{assignedUser?.nombre || 'Ing. Yenifer Sena'}</span>
                        </div>
                      </td>

                      {/* Estado Comercial */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                            contact.estado_comercial === 'Cliente Activo'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : contact.estado_comercial === 'Cliente Inactivo'
                              ? 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {contact.estado_comercial}
                        </span>
                      </td>

                      {/* Etiquetas */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className="text-[10px] text-slate-500">+{tags.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectContact(contact)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Ver ficha completa de contacto"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(contact)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Editar contacto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onConvertToOpportunity(contact)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Vincular / Crear Oportunidad en Pipeline"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar al contacto ${contact.nombre} ${contact.apellido} (${contact.empresa})?`)) {
                                onDeleteContact(contact.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Eliminar contacto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Etiquetado Masivo */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">
                Etiquetar {selectedContactIds.length} contactos seleccionados
              </h4>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Selecciona del catálogo o escribe el nombre de la etiqueta comercial:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {CATALOGO_ETIQUETAS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setBulkTagInput(tag)}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 hover:border-blue-500 text-xs"
                >
                  +{tag}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Nombre de la etiqueta..."
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkTagSave}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
              >
                Aplicar Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
