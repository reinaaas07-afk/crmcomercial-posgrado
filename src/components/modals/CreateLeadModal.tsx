import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Tag,
  DollarSign,
  Calendar,
  UserCheck,
  Briefcase,
  MessageSquare,
  Layers,
  MapPin,
} from 'lucide-react';
import { Lead, LeadSource, LeadStage, User } from '../../types/crm';
import { PIPELINE_STAGES } from '../../data/mockData';
import { CATALOGO_ETIQUETAS } from '../../types/schema';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLead: (lead: Lead) => void;
  users: User[];
  leadToEdit?: Lead | null;
}

const SOURCES: LeadSource[] = [
  'Sitio Web',
  'Meta Ads',
  'Google Ads',
  'LinkedIn',
  'Referido',
  'Evento / Feria',
  'WhatsApp Inbound',
];

const PRODUCTOS_ITHOT = [
  'ITHOT System',
  'POS Digital',
  'Facturación Electrónica',
  'CRM Comercial',
];

const MODULOS_ITHOT = [
  'Inventario',
  'Compras',
  'Cuentas por Cobrar',
  'Contabilidad',
  'Facturación Electrónica',
  'Reportes Gerenciales',
];

const CIUDADES_RD = [
  { ciudad: 'Santo Domingo', provincia: 'Distrito Nacional' },
  { ciudad: 'Santo Domingo Este', provincia: 'Santo Domingo' },
  { ciudad: 'Santiago de los Caballeros', provincia: 'Santiago' },
  { ciudad: 'La Romana', provincia: 'La Romana' },
  { ciudad: 'Punta Cana', provincia: 'La Altagracia' },
  { ciudad: 'San Francisco de Macorís', provincia: 'Duarte' },
  { ciudad: 'San Cristóbal', provincia: 'San Cristóbal' },
  { ciudad: 'Puerto Plata', provincia: 'Puerto Plata' },
];

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSaveLead,
  users,
  leadToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('Gerente General');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('+1 809-');
  const [whatsapp, setWhatsapp] = useState('+1 829-');
  const [source, setSource] = useState<LeadSource>('Referido');
  const [assignedTo, setAssignedTo] = useState(users[0]?.id || 'usr-1');
  const [stage, setStage] = useState<LeadStage>('Nuevo Lead');
  const [estimatedValue, setEstimatedValue] = useState<number>(180000);
  const [productoInteres, setProductoInteres] = useState(PRODUCTOS_ITHOT[0]);
  const [moduloInteres, setModuloInteres] = useState(MODULOS_ITHOT[0]);
  const [naturaleza, setNaturaleza] = useState('Comercio Mayorista / Retail');
  const [ciudad, setCiudad] = useState('Santo Domingo');
  const [provincia, setProvincia] = useState('Distrito Nacional');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Prospecto', 'ITHOT System']);

  useEffect(() => {
    if (leadToEdit) {
      const parts = leadToEdit.name.split(' ');
      setNombre(parts[0] || '');
      setApellido(parts.slice(1).join(' ') || '');
      setEmpresa(leadToEdit.company);
      setCargo((leadToEdit as any).cargo || 'Director / Gerente');
      setEmail(leadToEdit.email);
      setTelefono(leadToEdit.phone || '+1 809-');
      setWhatsapp((leadToEdit as any).whatsapp || leadToEdit.phone || '+1 829-');
      setSource(leadToEdit.source);
      setAssignedTo(leadToEdit.assignedTo);
      setStage(leadToEdit.stage);
      setEstimatedValue(leadToEdit.estimatedValue || 180000);
      setProductoInteres((leadToEdit as any).producto_interes || PRODUCTOS_ITHOT[0]);
      setModuloInteres((leadToEdit as any).modulo_interes || MODULOS_ITHOT[0]);
      setNaturaleza((leadToEdit as any).naturaleza_negocio || 'Comercio Mayorista / Retail');
      setCiudad((leadToEdit as any).ciudad || 'Santo Domingo');
      setProvincia((leadToEdit as any).provincia || 'Distrito Nacional');
      setNextFollowUpDate(leadToEdit.nextFollowUpDate || '');
      setNotes(leadToEdit.notes || '');
      setSelectedTags(leadToEdit.tags?.length ? leadToEdit.tags : ['Prospecto']);
    } else {
      setNombre('');
      setApellido('');
      setEmpresa('');
      setCargo('Gerente General');
      setEmail('');
      setTelefono('+1 809-');
      setWhatsapp('+1 829-');
      setSource('Referido');
      setAssignedTo(users[0]?.id || 'usr-1');
      setStage('Nuevo Lead');
      setEstimatedValue(220000);
      setProductoInteres(PRODUCTOS_ITHOT[0]);
      setModuloInteres(MODULOS_ITHOT[0]);
      setNaturaleza('Comercio Mayorista / Retail');
      setCiudad('Santo Domingo');
      setProvincia('Distrito Nacional');
      setNextFollowUpDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
      setNotes('');
      setSelectedTags(['Prospecto', 'ITHOT System']);
    }
  }, [leadToEdit, isOpen, users]);

  if (!isOpen) return null;

  const handleCityChange = (cityName: string) => {
    setCiudad(cityName);
    const found = CIUDADES_RD.find((c) => c.ciudad === cityName);
    if (found) setProvincia(found.provincia);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !empresa.trim()) {
      alert('Por favor completa al menos el Nombre del contacto y la Empresa.');
      return;
    }

    const assignedUser = users.find((u) => u.id === assignedTo);
    const fullName = apellido.trim() ? `${nombre.trim()} ${apellido.trim()}` : nombre.trim();

    const newLead: Lead = {
      id: leadToEdit ? leadToEdit.id : `lead-${Date.now()}`,
      name: fullName,
      company: empresa.trim(),
      email: email.trim(),
      phone: telefono.trim(),
      source,
      assignedTo,
      assignedToName: assignedUser ? assignedUser.name : 'Ing. Yenifer Sena',
      stage,
      createdAt: leadToEdit ? leadToEdit.createdAt : new Date().toISOString().split('T')[0],
      nextFollowUpDate: nextFollowUpDate || undefined,
      estimatedValue: Number(estimatedValue) || 0,
      tags: selectedTags.length ? selectedTags : ['Prospecto'],
      notes: notes.trim(),
      attachments: leadToEdit?.attachments || [],
      cargo: cargo.trim(),
      whatsapp: whatsapp.trim() || telefono.trim(),
      ciudad,
      provincia,
      naturaleza_negocio: naturaleza,
      producto_interes: productoInteres,
      modulo_interes: moduloInteres,
      ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    onSaveLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Siempre Visible */}
        <div className="flex items-center justify-between p-5 sm:px-7 border-b border-slate-800 shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {leadToEdit ? 'Editar Oportunidad Comercial' : 'Registrar Nueva Oportunidad / Prospecto'}
              </h2>
              <p className="text-xs text-slate-400">
                Soluciones ITHOT para empresas dominicanas (POS Digital, Facturación Electrónica e-CF, ERP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="formLead" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {/* Persona y Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Rafael"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Apellido
              </label>
              <input
                type="text"
                placeholder="Ej. Almonte"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Empresa <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Auto Repuestos Central S.R.L."
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Contacto Dominicano */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Teléfono RD
              </label>
              <input
                type="text"
                placeholder="+1 809-582-4411"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                WhatsApp RD
              </label>
              <input
                type="text"
                placeholder="+1 829-340-2211"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Corporativo
              </label>
              <input
                type="email"
                placeholder="contacto@empresa.do"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Solución ITHOT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Producto ITHOT
              </label>
              <select
                value={productoInteres}
                onChange={(e) => setProductoInteres(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {PRODUCTOS_ITHOT.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Módulo Requerido
              </label>
              <select
                value={moduloInteres}
                onChange={(e) => setModuloInteres(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {MODULOS_ITHOT.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valor Estimado (RD$)
              </label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Asignación y Etapa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Responsable Asignado
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Etapa del Pipeline
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fuente del Lead
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ciudad y Próximo Seguimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ciudad / Ubicación en RD
              </label>
              <select
                value={ciudad}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {CIUDADES_RD.map((c) => (
                  <option key={c.ciudad} value={c.ciudad}>
                    {c.ciudad} ({c.provincia})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Próximo Seguimiento
              </label>
              <input
                type="datetime-local"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sistema de Etiquetas */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Etiquetas Comerciales (Selecciona del Catálogo)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATALOGO_ETIQUETAS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-400'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observaciones y Notas Comerciales
            </label>
            <textarea
              placeholder="Detalles sobre el requerimiento comercial o técnico..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none h-16"
            />
          </div>
        </form>

        {/* Footer Actions - Siempre Accesibles y Visibles */}
        <div className="flex items-center justify-between gap-3 p-4 px-6 sm:px-7 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="formLead"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{leadToEdit ? 'Guardar Cambios' : 'Registrar Oportunidad'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
