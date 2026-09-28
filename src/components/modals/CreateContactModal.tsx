import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Tag,
  Calendar,
  UserCheck,
  Briefcase,
  MapPin,
  Sparkles,
  Layers,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { ContactoDB, UsuarioDB, CATALOGO_ETIQUETAS } from '../../types/schema';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (contacto: ContactoDB) => void;
  users: UsuarioDB[];
  contactToEdit?: ContactoDB | null;
}

const CIUDADES_RD = [
  { ciudad: 'Santo Domingo', provincia: 'Distrito Nacional' },
  { ciudad: 'Santo Domingo Este', provincia: 'Santo Domingo' },
  { ciudad: 'Santo Domingo Oeste', provincia: 'Santo Domingo' },
  { ciudad: 'Santo Domingo Norte', provincia: 'Santo Domingo' },
  { ciudad: 'Santiago de los Caballeros', provincia: 'Santiago' },
  { ciudad: 'La Romana', provincia: 'La Romana' },
  { ciudad: 'Punta Cana / Bávaro', provincia: 'La Altagracia' },
  { ciudad: 'Higüey', provincia: 'La Altagracia' },
  { ciudad: 'Puerto Plata', provincia: 'Puerto Plata' },
  { ciudad: 'San Francisco de Macorís', provincia: 'Duarte' },
  { ciudad: 'La Vega', provincia: 'La Vega' },
  { ciudad: 'San Cristóbal', provincia: 'San Cristóbal' },
  { ciudad: 'Bonao', provincia: 'Monseñor Nouel' },
  { ciudad: 'Moca', provincia: 'Espaillat' },
  { ciudad: 'San Pedro de Macorís', provincia: 'San Pedro de Macorís' },
  { ciudad: 'Baní', provincia: 'Peravia' },
];

const NATURALEZAS_NEGOCIO = [
  'Comercio Mayorista / Distribución',
  'Supermercados / Gran Superficie Retail',
  'Ferretería & Construcción',
  'Restaurantes & Gastronomía',
  'Farmacias & Salud',
  'Repuestos Automotrices & Talleres',
  'Tiendas por Departamento & Moda',
  'Franquicias & Comida Rápida',
  'Transporte, Carga & Envíos',
  'Hotelería & Turismo',
  'Industria & Manufactura',
  'Servicios Profesionales & Consultoría',
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

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
  isOpen,
  onClose,
  onSaveContact,
  users,
  contactToEdit,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('Gerente General');
  const [telefono, setTelefono] = useState('+1 809-');
  const [whatsapp, setWhatsapp] = useState('+1 829-');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('Santo Domingo');
  const [provincia, setProvincia] = useState('Distrito Nacional');
  const [naturaleza, setNaturaleza] = useState(NATURALEZAS_NEGOCIO[0]);
  const [usuarioId, setUsuarioId] = useState(users[0]?.id || 1);
  const [estadoComercial, setEstadoComercial] = useState('Prospecto');
  const [productoInteres, setProductoInteres] = useState(PRODUCTOS_ITHOT[0]);
  const [moduloInteres, setModuloInteres] = useState(MODULOS_ITHOT[0]);
  const [proximoSeguimiento, setProximoSeguimiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Prospecto', 'ITHOT System']);
  const [customTagInput, setCustomTagInput] = useState('');

  useEffect(() => {
    if (contactToEdit) {
      setNombre(contactToEdit.nombre || '');
      setApellido(contactToEdit.apellido || '');
      setEmpresa(contactToEdit.empresa || '');
      setCargo(contactToEdit.cargo || '');
      setTelefono(contactToEdit.telefono || '+1 809-');
      setWhatsapp(contactToEdit.whatsapp || '+1 829-');
      setEmail(contactToEdit.email || '');
      setDireccion(contactToEdit.direccion || '');
      setCiudad(contactToEdit.ciudad || 'Santo Domingo');
      setProvincia(contactToEdit.provincia || 'Distrito Nacional');
      setNaturaleza(contactToEdit.naturaleza_negocio || NATURALEZAS_NEGOCIO[0]);
      setUsuarioId(contactToEdit.usuario_id || users[0]?.id || 1);
      setEstadoComercial(contactToEdit.estado_comercial || 'Prospecto');
      setProductoInteres(contactToEdit.producto_interes || PRODUCTOS_ITHOT[0]);
      setModuloInteres(contactToEdit.modulo_interes || MODULOS_ITHOT[0]);
      setProximoSeguimiento(contactToEdit.proximo_seguimiento || '');
      setObservaciones(contactToEdit.observaciones || '');
      setSelectedTags(
        contactToEdit.etiquetas
          ? contactToEdit.etiquetas.split(',').map((t) => t.trim()).filter(Boolean)
          : ['Prospecto']
      );
    } else {
      setNombre('');
      setApellido('');
      setEmpresa('');
      setCargo('Gerente General');
      setTelefono('+1 809-');
      setWhatsapp('+1 829-');
      setEmail('');
      setDireccion('');
      setCiudad('Santo Domingo');
      setProvincia('Distrito Nacional');
      setNaturaleza(NATURALEZAS_NEGOCIO[0]);
      setUsuarioId(users[0]?.id || 1);
      setEstadoComercial('Prospecto');
      setProductoInteres(PRODUCTOS_ITHOT[0]);
      setModuloInteres(MODULOS_ITHOT[0]);
      setProximoSeguimiento(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
      setObservaciones('');
      setSelectedTags(['Prospecto', 'ITHOT System']);
    }
  }, [contactToEdit, isOpen, users]);

  if (!isOpen) return null;

  const handleCityChange = (cityName: string) => {
    setCiudad(cityName);
    const found = CIUDADES_RD.find((c) => c.ciudad === cityName);
    if (found) {
      setProvincia(found.provincia);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const clean = customTagInput.trim();
      if (!selectedTags.includes(clean)) {
        setSelectedTags([...selectedTags, clean]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !empresa.trim()) {
      alert('Por favor completa al menos el Nombre del contacto y el Nombre de la Empresa.');
      return;
    }

    const newContact: ContactoDB = {
      id: contactToEdit?.id || Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      empresa: empresa.trim(),
      cargo: cargo.trim(),
      telefono: telefono.trim(),
      whatsapp: whatsapp.trim() || telefono.trim(),
      email: email.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      naturaleza_negocio: naturaleza,
      usuario_id: Number(usuarioId),
      fecha_registro: contactToEdit?.fecha_registro || new Date().toISOString().replace('T', ' ').slice(0, 19),
      ultima_interaccion: contactToEdit?.ultima_interaccion || new Date().toISOString().replace('T', ' ').slice(0, 19),
      proximo_seguimiento: proximoSeguimiento || null,
      estado_comercial: estadoComercial,
      observaciones: observaciones.trim(),
      etiquetas: selectedTags.join(', '),
      producto_interes: productoInteres,
      modulo_interes: moduloInteres,
    };

    onSaveContact(newContact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {contactToEdit ? 'Editar Contacto Empresarial' : 'Registrar Nuevo Contacto'}
              </h3>
              <p className="text-xs text-slate-400">
                Ficha comercial detallada para empresas y personas en República Dominicana (ITHOT)
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECCIÓN 1: DATOS PERSONALES Y EMPRESA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <Building2 className="w-3.5 h-3.5" />
              <span>1. Información de la Persona y la Empresa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del Contacto <span className="text-rose-400">*</span>
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
                  Apellido(s)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Almonte Gómez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Empresa / Razón Social <span className="text-rose-400">*</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cargo / Puesto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Gerente General y Propietario"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Naturaleza del Negocio
                </label>
                <select
                  value={naturaleza}
                  onChange={(e) => setNaturaleza(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {NATURALEZAS_NEGOCIO.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Estado Comercial
                </label>
                <select
                  value={estadoComercial}
                  onChange={(e) => setEstadoComercial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Prospecto">Prospecto</option>
                  <option value="Cliente Activo">Cliente Activo</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Cliente Inactivo">Cliente Inactivo</option>
                  <option value="En Negociación">En Negociación</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONTACTO DIRECTO Y UBICACIÓN DOMINICANA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <Phone className="w-3.5 h-3.5" />
              <span>2. Vías de Contacto y Ubicación (República Dominicana)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Teléfono Principal (RD)
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
                  WhatsApp Directo (RD)
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
                  Correo Electrónico Corporativo
                </label>
                <input
                  type="email"
                  placeholder="contacto@empresa.com.do"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ciudad
                </label>
                <select
                  value={ciudad}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {CIUDADES_RD.map((c) => (
                    <option key={c.ciudad} value={c.ciudad}>
                      {c.ciudad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  value={provincia}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dirección Exacta
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. 27 de Febrero esq. Winston Churchill"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ASIGNACIÓN COMERCIAL Y SOLUCIONES ITHOT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              <Layers className="w-3.5 h-3.5" />
              <span>3. Soluciones ITHOT y Asignación Comercial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Responsable Comercial Asignado
                </label>
                <select
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.rol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Producto de Interés (ITHOT)
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
                  Módulo Principal Requerido
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fecha del Próximo Seguimiento
                </label>
                <input
                  type="datetime-local"
                  value={proximoSeguimiento}
                  onChange={(e) => setProximoSeguimiento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Observaciones Comerciales
                </label>
                <input
                  type="text"
                  placeholder="Detalles sobre necesidades o requerimientos técnicos..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: SISTEMA DE ETIQUETAS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>4. Sistema de Etiquetas (Clasificación Comercial)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Seleccionadas: <strong className="text-white font-mono">{selectedTags.length}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Haz clic en cualquiera de las etiquetas oficiales para asignar o desasignar:
            </p>

            {/* Quick Catalog Chips */}
            <div className="flex flex-wrap gap-1.5">
              {CATALOGO_ETIQUETAS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Add */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe otra etiqueta personalizada y presiona Enter..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full max-w-sm px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400">Presiona Enter para agregar</span>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{contactToEdit ? 'Guardar Cambios' : 'Crear Contacto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
