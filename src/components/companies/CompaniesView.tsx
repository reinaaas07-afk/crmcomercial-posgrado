import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Users,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Edit2,
  Trash2,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  EmpresaDB,
  ContactoDB,
  ProspectoDB,
  UsuarioDB,
  RolUsuario,
} from '../../types/schema';

interface CompaniesViewProps {
  companies: EmpresaDB[];
  contacts: ContactoDB[];
  prospects: ProspectoDB[];
  users: UsuarioDB[];
  currentRole: RolUsuario;
  currentUserId: number;
  onOpenCreateCompanyModal: () => void;
  onOpenEditCompanyModal: (company: EmpresaDB) => void;
  onOpenCompanyDrawer: (company: EmpresaDB) => void;
  onDeleteCompany: (id: number) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  contacts,
  prospects,
  users,
  currentRole,
  currentUserId,
  onOpenCreateCompanyModal,
  onOpenEditCompanyModal,
  onOpenCompanyDrawer,
  onDeleteCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('todas');
  const [industryFilter, setIndustryFilter] = useState('todas');
  const [userFilter, setUserFilter] = useState<number | 'todos'>('todos');

  // Filter logic: if not admin, by default show their assigned companies or allow filtering
  const isAdmin = currentRole.includes('Administrador');

  const filteredCompanies = companies.filter((comp) => {
    const matchesSearch =
      comp.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.rnc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = cityFilter === 'todas' || comp.ciudad === cityFilter;
    const matchesIndustry = industryFilter === 'todas' || comp.industria.includes(industryFilter);
    const matchesUser =
      userFilter === 'todos' ? (isAdmin ? true : comp.usuario_id === currentUserId) : comp.usuario_id === userFilter;

    return matchesSearch && matchesCity && matchesIndustry && matchesUser;
  });

  const uniqueCities = Array.from(new Set(companies.map((c) => c.ciudad))).filter(Boolean);

  const getAssignedUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.nombre : 'Sin asignar';
  };

  const getRelatedCounts = (comp: EmpresaDB) => {
    const rContacts = contacts.filter(
      (c) =>
        c.empresa?.toLowerCase() === comp.razon_social?.toLowerCase() ||
        c.empresa?.toLowerCase().includes(comp.razon_social?.toLowerCase().split(' ')[0] || '')
    ).length;

    const rProspects = prospects.filter(
      (p) =>
        p.empresa?.toLowerCase() === comp.razon_social?.toLowerCase() ||
        p.empresa?.toLowerCase().includes(comp.razon_social?.toLowerCase().split(' ')[0] || '')
    ).length;

    return { contacts: rContacts, prospects: rProspects };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Empresas Comerciales</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {companies.length} registradas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de cuentas corporativas dominicanas, validación de RNC y trazabilidad comercial
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCreateCompanyModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Empresa</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por Razón Social, RNC, Ciudad o Correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* City Filter */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="todas">Todas las Ciudades</option>
          {uniqueCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* User filter */}
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="todos">Todos los Responsables</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Main Table / Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredCompanies.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Building2 className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-base font-semibold text-slate-400">No se encontraron empresas</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Intenta cambiando los filtros de búsqueda o agrega una nueva empresa para iniciar el registro.
            </p>
            <button
              type="button"
              onClick={onOpenCreateCompanyModal}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              + Agregar Empresa Ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((comp) => {
              const counts = getRelatedCounts(comp);
              return (
                <div
                  key={comp.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3
                            onClick={() => onOpenCompanyDrawer(comp)}
                            className="font-bold text-sm text-slate-100 group-hover:text-blue-400 cursor-pointer transition-colors leading-tight"
                          >
                            {comp.razon_social}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono text-slate-400">
                              RNC: {comp.rnc}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          comp.estado === 'Activa'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : comp.estado === 'Prospecto'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {comp.estado}
                      </span>
                    </div>

                    {/* Information lines */}
                    <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{comp.ciudad} • {comp.sector || 'República Dominicana'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono">{comp.telefono || 'Sin teléfono'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{comp.email || 'Sin correo registrado'}</span>
                      </div>
                    </div>

                    {/* Related badges */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-300 border border-slate-700/80">
                        {counts.contacts} Contactos
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-300 border border-slate-700/80">
                        {counts.prospects} Oportunidades
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-300 border border-slate-700/80 font-mono">
                        {comp.cantidad_empleados} empl.
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom */}
                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[120px]">
                        {getAssignedUserName(comp.usuario_id).split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenCompanyDrawer(comp)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
                      >
                        Ver Ficha
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditCompanyModal(comp)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Enviar "${comp.razon_social}" a la papelera?`)) {
                            onDeleteCompany(comp.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Eliminar (a papelera)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
