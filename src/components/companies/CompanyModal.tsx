import React, { useState, useEffect } from 'react';
import { Building2, X, Check, Globe, MapPin, Mail, Phone, Users, Shield } from 'lucide-react';
import { EmpresaDB, UsuarioDB } from '../../types/schema';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Omit<EmpresaDB, 'id'>, id?: number) => void;
  companyToEdit?: EmpresaDB | null;
  users: UsuarioDB[];
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  companyToEdit,
  users,
}) => {
  const [razonSocial, setRazonSocial] = useState('');
  const [rnc, setRnc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('Santo Domingo');
  const [sector, setSector] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [industria, setIndustria] = useState('Comercio Mayorista');
  const [cantidadEmpleados, setCantidadEmpleados] = useState(25);
  const [usuarioId, setUsuarioId] = useState<number>(users[0]?.id || 1);
  const [etiquetas, setEtiquetas] = useState('Prospecto, ITHOT System');
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState<'Activa' | 'Prospecto' | 'Inactiva' | 'Lead'>('Prospecto');

  useEffect(() => {
    if (companyToEdit) {
      setRazonSocial(companyToEdit.razon_social);
      setRnc(companyToEdit.rnc);
      setTelefono(companyToEdit.telefono);
      setEmail(companyToEdit.email);
      setDireccion(companyToEdit.direccion);
      setCiudad(companyToEdit.ciudad);
      setSector(companyToEdit.sector);
      setSitioWeb(companyToEdit.sitio_web);
      setIndustria(companyToEdit.industria);
      setCantidadEmpleados(companyToEdit.cantidad_empleados);
      setUsuarioId(companyToEdit.usuario_id);
      setEtiquetas(companyToEdit.etiquetas);
      setNotas(companyToEdit.notas);
      setEstado(companyToEdit.estado);
    } else {
      setRazonSocial('');
      setRnc('');
      setTelefono('+1 809-');
      setEmail('');
      setDireccion('');
      setCiudad('Santo Domingo');
      setSector('Distrito Nacional');
      setSitioWeb('https://');
      setIndustria('Comercio Mayorista');
      setCantidadEmpleados(25);
      setUsuarioId(users[0]?.id || 1);
      setEtiquetas('Prospecto, ITHOT System');
      setNotas('');
      setEstado('Prospecto');
    }
  }, [companyToEdit, users]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razonSocial.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onSave(
      {
        razon_social: razonSocial.trim(),
        rnc: rnc.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
        sector: sector.trim(),
        sitio_web: sitioWeb.trim(),
        industria: industria.trim(),
        cantidad_empleados: Number(cantidadEmpleados) || 1,
        usuario_id: Number(usuarioId),
        etiquetas: etiquetas.trim(),
        notas: notas.trim(),
        fecha_registro: companyToEdit?.fecha_registro || formattedDate,
        estado,
      },
      companyToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {companyToEdit ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
              </h2>
              <p className="text-xs text-slate-400">
                Información comercial, RNC y vinculación con contactos y oportunidades
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body con Scroll Interno */}
        <form id="formCompany" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Razón Social */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Razón Social *</label>
              <input
                type="text"
                required
                placeholder="Ej: Distribuidora Quisqueya S.R.L."
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* RNC */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">RNC (Registro Nacional del Contribuyente) *</label>
              <input
                type="text"
                required
                placeholder="Ej: 1-31-45678-2"
                value={rnc}
                onChange={(e) => setRnc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Teléfono Principal</label>
              <input
                type="text"
                placeholder="+1 809-567-8900"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Correo Electrónico Corporativo</label>
              <input
                type="email"
                placeholder="contacto@empresa.com.do"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-slate-300 font-medium">Dirección Física</label>
              <input
                type="text"
                placeholder="Av. 27 de Febrero esq. Winston Churchill"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Ciudad / Provincia</label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Santo Domingo">Santo Domingo (Distrito Nacional)</option>
                <option value="Santo Domingo Este">Santo Domingo Este</option>
                <option value="Santo Domingo Norte">Santo Domingo Norte</option>
                <option value="Santo Domingo Oeste">Santo Domingo Oeste</option>
                <option value="Santiago de los Caballeros">Santiago de los Caballeros</option>
                <option value="La Vega">La Vega</option>
                <option value="San Cristóbal">San Cristóbal</option>
                <option value="Puerto Plata">Puerto Plata</option>
                <option value="Higüey / Bávaro">Higüey / Bávaro</option>
                <option value="La Romana">La Romana</option>
                <option value="San Pedro de Macorís">San Pedro de Macorís</option>
              </select>
            </div>

            {/* Sector */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Sector / Barrio</label>
              <input
                type="text"
                placeholder="Ej: Piantini, Bella Vista, Los Jardines"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Página Web */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Página Web / Redes</label>
              <input
                type="text"
                placeholder="https://empresa.com.do"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Industria */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Industria / Naturaleza del Negocio</label>
              <select
                value={industria}
                onChange={(e) => setIndustria(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Comercio Mayorista">Comercio Mayorista y Repuestos</option>
                <option value="Distribución y Retail">Distribución y Retail</option>
                <option value="Supermercados y Alimentos">Supermercados y Alimentos</option>
                <option value="Salud y Farmacéutica">Salud, Clínicas y Farmacias</option>
                <option value="Construcción e Inmobiliaria">Construcción e Inmobiliaria</option>
                <option value="Hotelería y Restaurantes">Hotelería, Bares y Restaurantes</option>
                <option value="Servicios Profesionales">Servicios Profesionales y Consultoría</option>
                <option value="Tecnología y Comunicaciones">Tecnología y Telecomunicaciones</option>
              </select>
            </div>

            {/* Cantidad de empleados */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Cantidad de Empleados</label>
              <input
                type="number"
                min="1"
                value={cantidadEmpleados}
                onChange={(e) => setCantidadEmpleados(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Responsable Comercial */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Responsable Comercial Asignado</label>
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Estado de la Empresa</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Prospecto">Prospecto en Evaluación</option>
                <option value="Activa">Cliente Activo</option>
                <option value="Lead">Lead Nuevo</option>
                <option value="Inactiva">Inactiva / Pausada</option>
              </select>
            </div>

            {/* Etiquetas */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-slate-300 font-medium">Etiquetas Comerciales (separadas por coma)</label>
              <input
                type="text"
                placeholder="ITHOT System, Facturación Electrónica, Inventario, POS Digital"
                value={etiquetas}
                onChange={(e) => setEtiquetas(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notas */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-slate-300 font-medium">Notas y Observaciones</label>
              <textarea
                rows={3}
                placeholder="Detalles sobre el interés comercial, antecedentes o requisitos de DGII..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Action Buttons - Siempre Accesibles y Visibles */}
        <div className="flex items-center justify-between gap-3 p-4 px-6 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="formCompany"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-600/25 text-xs"
          >
            <Check className="w-4 h-4" />
            <span>{companyToEdit ? 'Guardar Cambios' : 'Registrar Empresa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
