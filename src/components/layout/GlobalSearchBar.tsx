import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Building2,
  Users,
  Kanban,
  Contact,
  UserCheck,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import {
  EmpresaDB,
  ContactoDB,
  ProspectoDB,
  UsuarioDB,
  SeccionApp,
} from '../../types/schema';

interface GlobalSearchBarProps {
  empresas: EmpresaDB[];
  contactos: ContactoDB[];
  prospectos: ProspectoDB[];
  usuarios: UsuarioDB[];
  onSelectEntity: (
    type: 'empresa' | 'contacto' | 'prospecto' | 'usuario',
    id: number,
    section: SeccionApp
  ) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  empresas,
  contactos,
  prospectos,
  usuarios,
  onSelectEntity,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  const matchingEmpresas = cleanQuery
    ? empresas.filter(
        (e) =>
          e.razon_social.toLowerCase().includes(cleanQuery) ||
          e.rnc.toLowerCase().includes(cleanQuery) ||
          e.ciudad.toLowerCase().includes(cleanQuery) ||
          e.industria.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingContactos = cleanQuery
    ? contactos.filter(
        (c) =>
          c.nombre.toLowerCase().includes(cleanQuery) ||
          c.apellido.toLowerCase().includes(cleanQuery) ||
          c.empresa.toLowerCase().includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery) ||
          c.telefono.includes(cleanQuery)
      )
    : [];

  const matchingProspectos = cleanQuery
    ? prospectos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(cleanQuery) ||
          p.empresa.toLowerCase().includes(cleanQuery) ||
          (p.producto_interes && p.producto_interes.toLowerCase().includes(cleanQuery)) ||
          p.notas.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingUsuarios = cleanQuery
    ? usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(cleanQuery) ||
          (u.usuario && u.usuario.toLowerCase().includes(cleanQuery)) ||
          u.email.toLowerCase().includes(cleanQuery) ||
          u.rol.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalResults =
    matchingEmpresas.length +
    matchingContactos.length +
    matchingProspectos.length +
    matchingUsuarios.length;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Buscar empresas, contactos, prospectos, usuarios..."
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-800">
          <div className="p-2.5 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">
              Resultados para &quot;{query}&quot;
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
              {totalResults} encontrados
            </span>
          </div>

          {totalResults === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No se encontraron coincidencias para tu búsqueda.
            </div>
          ) : (
            <>
              {/* Empresas */}
              {matchingEmpresas.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Empresas ({matchingEmpresas.length})</span>
                  </div>
                  {matchingEmpresas.slice(0, 3).map((emp) => (
                    <button
                      key={`emp-${emp.id}`}
                      type="button"
                      onClick={() => {
                        onSelectEntity('empresa', emp.id, 'empresas');
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {emp.razon_social}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          RNC: {emp.rnc} • {emp.ciudad}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                    </button>
                  ))}
                </div>
              )}

              {/* Contactos */}
              {matchingContactos.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    <Contact className="w-3.5 h-3.5" />
                    <span>Contactos ({matchingContactos.length})</span>
                  </div>
                  {matchingContactos.slice(0, 3).map((con) => (
                    <button
                      key={`con-${con.id}`}
                      type="button"
                      onClick={() => {
                        onSelectEntity('contacto', con.id, 'contactos');
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {con.nombre} {con.apellido}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {con.empresa} • {con.cargo}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                    </button>
                  ))}
                </div>
              )}

              {/* Prospectos / Oportunidades */}
              {matchingProspectos.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Prospectos & Oportunidades ({matchingProspectos.length})</span>
                  </div>
                  {matchingProspectos.slice(0, 3).map((pros) => (
                    <button
                      key={`pros-${pros.id}`}
                      type="button"
                      onClick={() => {
                        onSelectEntity('prospecto', pros.id, 'prospectos');
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                          {pros.nombre} {pros.apellido} - {pros.empresa}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Valor: RD$ {pros.valor_estimado.toLocaleString()} • {pros.producto_interes || 'ITHOT System'}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                    </button>
                  ))}
                </div>
              )}

              {/* Usuarios */}
              {matchingUsuarios.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Usuarios del CRM ({matchingUsuarios.length})</span>
                  </div>
                  {matchingUsuarios.slice(0, 3).map((usr) => (
                    <button
                      key={`usr-${usr.id}`}
                      type="button"
                      onClick={() => {
                        onSelectEntity('usuario', usr.id, 'usuarios');
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {usr.nombre}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Rol: {usr.rol} • @{usr.usuario}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
