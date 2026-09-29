import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Shield,
  Building,
} from 'lucide-react';
import { UsuarioDB, RolUsuario } from '../../types/schema';

interface BatchUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatchUsers: (users: UsuarioDB[]) => void;
}

interface BatchUserRow {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  telefono: string;
  rol: RolUsuario;
  subcuenta: string;
}

export const BatchUsersModal: React.FC<BatchUsersModalProps> = ({
  isOpen,
  onClose,
  onSaveBatchUsers,
}) => {
  const [rows, setRows] = useState<BatchUserRow[]>([
    {
      id: 1,
      nombre: 'Carlos',
      apellido: 'Méndez',
      email: 'carlos.mendez@ithot.com.do',
      usuario: 'cmendez',
      telefono: '+1 809-567-1122',
      rol: 'Ejecutivo Comercial',
      subcuenta: 'ITHOT Sede Principal',
    },
    {
      id: 2,
      nombre: 'Laura',
      apellido: 'Polanco',
      email: 'laura.polanco@ithot.com.do',
      usuario: 'lpolanco',
      telefono: '+1 809-567-3344',
      rol: 'Ejecutivo Comercial',
      subcuenta: 'ITHOT Sede Principal',
    },
    {
      id: 3,
      nombre: 'David',
      apellido: 'Castillo',
      email: 'david.castillo@ithot.com.do',
      usuario: 'dcastillo',
      telefono: '+1 829-450-5566',
      rol: 'Analista Comercial',
      subcuenta: 'ITHOT Sucursal Cibao',
    },
  ]);

  if (!isOpen) return null;

  const handleAddPreset = (count: number, defaultRole: RolUsuario = 'Ejecutivo Comercial') => {
    const startId = Date.now();
    const newItems: BatchUserRow[] = [];
    const sampleNames = [
      { n: 'Rosa', a: 'García', u: 'rgarcia' },
      { n: 'José', a: 'Bautista', u: 'jbautista' },
      { n: 'Marcos', a: 'Peña', u: 'mpena' },
      { n: 'Patricia', a: 'Valdez', u: 'pvaldez' },
      { n: 'Eduardo', a: 'Santana', u: 'esantana' },
      { n: 'Giselle', a: 'Núñez', u: 'gnunez' },
      { n: 'Héctor', a: 'Morales', u: 'hmorales' },
      { n: 'Karla', a: 'Vásquez', u: 'kvasquez' },
      { n: 'Julio', a: 'Mercedes', u: 'jmercedes' },
      { n: 'Altagracia', a: 'Fernández', u: 'afernandez' },
    ];

    for (let i = 0; i < count; i++) {
      const sample = sampleNames[i % sampleNames.length];
      const suffix = Math.floor(Math.random() * 90 + 10);
      newItems.push({
        id: startId + i,
        nombre: sample.n,
        apellido: sample.a,
        email: `${sample.u}${suffix}@ithot.com.do`,
        usuario: `${sample.u}${suffix}`,
        telefono: `+1 809-5${suffix}-1100`,
        rol: defaultRole,
        subcuenta: 'ITHOT Sede Principal',
      });
    }

    setRows(newItems);
  };

  const handleRowChange = (id: number, field: keyof BatchUserRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRow = () => {
    const newId = Date.now();
    setRows((prev) => [
      ...prev,
      {
        id: newId,
        nombre: '',
        apellido: '',
        email: '',
        usuario: '',
        telefono: '+1 809-',
        rol: 'Ejecutivo Comercial',
        subcuenta: 'ITHOT Sede Principal',
      },
    ]);
  };

  const handleRemoveRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.nombre.trim() && r.email.trim());

    if (validRows.length === 0) {
      alert('Por favor completa al menos un usuario válido.');
      return;
    }

    const newUsers: UsuarioDB[] = validRows.map((r, idx) => ({
      id: Date.now() + idx,
      nombre: `${r.nombre.trim()} ${r.apellido.trim()}`.trim(),
      apellido: r.apellido.trim(),
      email: r.email.trim(),
      usuario: r.usuario.trim() || r.email.split('@')[0],
      password_hash: '$2b$12$ITHOT_BCRYPT_SECURE_HASH...',
      password_plain: 'ITHOT2026*',
      rol: r.rol,
      telefono: r.telefono.trim(),
      activo: true,
      fecha_creacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ultimo_acceso: new Date().toISOString().replace('T', ' ').slice(0, 19),
      empresa: 'ITHOT',
      subcuenta: r.subcuenta,
    }));

    onSaveBatchUsers(newUsers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Agregar Múltiples Usuarios en Lote (Empresa ITHOT)
              </h3>
              <p className="text-xs text-slate-400">
                Alta ágil para 3, 5 o 10 compañeros simultáneamente sin intervención técnica
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

        {/* Preset Quick Generator */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Generar plantilla rápida:</span>
            <button
              type="button"
              onClick={() => handleAddPreset(3, 'Ejecutivo Comercial')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              + 3 Usuarios
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset(5, 'Ejecutivo Comercial')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              + 5 Usuarios
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset(10, 'Ejecutivo Comercial')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              + 10 Usuarios
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Fila</span>
          </button>
        </div>

        {/* Table of Rows */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center hover:border-slate-700 transition-colors"
              >
                <div className="sm:col-span-1 text-slate-500 text-xs font-mono font-bold">
                  #{idx + 1}
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={row.nombre}
                    onChange={(e) => handleRowChange(row.id, 'nombre', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={row.apellido}
                    onChange={(e) => handleRowChange(row.id, 'apellido', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="email"
                    placeholder="correo@ithot.com.do"
                    value={row.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleRowChange(row.id, 'email', val);
                      if (!row.usuario) {
                        handleRowChange(row.id, 'usuario', val.split('@')[0]);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={row.rol}
                    onChange={(e) => handleRowChange(row.id, 'rol', e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ejecutivo Comercial">Ejecutivo Comercial</option>
                    <option value="Supervisor Comercial">Supervisor Comercial</option>
                    <option value="Analista Comercial">Analista Comercial</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Consulta">Consulta</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="+1 809-"
                    value={row.telefono}
                    onChange={(e) => handleRowChange(row.id, 'telefono', e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={rows.length <= 1}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors disabled:opacity-30 cursor-pointer"
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Contraseña inicial para todos: <strong className="text-blue-400 font-mono">ITHOT2026*</strong> (podrá ser cambiada por cada usuario).
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Crear {rows.length} Usuarios Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
