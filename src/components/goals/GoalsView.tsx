import React, { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Award,
  BarChart3,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { ObjetivoComercialDB, UsuarioDB, RolUsuario } from '../../types/schema';

interface GoalsViewProps {
  objetivos: ObjetivoComercialDB[];
  users: UsuarioDB[];
  currentRole: RolUsuario;
  onSaveObjetivo: (obj: Omit<ObjetivoComercialDB, 'id'>, id?: number) => void;
  onDeleteObjetivo: (id: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  objetivos,
  users,
  currentRole,
  onSaveObjetivo,
  onDeleteObjetivo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [objToEdit, setObjToEdit] = useState<ObjetivoComercialDB | null>(null);

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<'Prospectos' | 'Ventas' | 'Llamadas' | 'Cierres'>('Prospectos');
  const [metaCantidad, setMetaCantidad] = useState(50);
  const [unidad, setUnidad] = useState('prospectos');
  const [periodo, setPeriodo] = useState('Septiembre 2026');
  const [usuarioId, setUsuarioId] = useState<number | 'global'>('global');
  const [avanceActual, setAvanceActual] = useState(38);
  const [fechaLimite, setFechaLimite] = useState('2026-09-30');

  const isAdmin = currentRole.includes('Administrador');

  const handleOpenCreate = () => {
    setObjToEdit(null);
    setTitulo('Meta Mensual de Prospectos');
    setTipo('Prospectos');
    setMetaCantidad(50);
    setUnidad('prospectos');
    setPeriodo('Septiembre 2026');
    setUsuarioId('global');
    setAvanceActual(0);
    setFechaLimite('2026-09-30');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (obj: ObjetivoComercialDB) => {
    setObjToEdit(obj);
    setTitulo(obj.titulo);
    setTipo(obj.tipo);
    setMetaCantidad(obj.meta_cantidad);
    setUnidad(obj.unidad);
    setPeriodo(obj.periodo);
    setUsuarioId(obj.usuario_id === null ? 'global' : obj.usuario_id);
    setAvanceActual(obj.avance_actual);
    setFechaLimite(obj.fecha_limite);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    let responsableName = 'Equipo Comercial ITHOT';
    let targetUserId: number | null = null;

    if (usuarioId !== 'global') {
      const u = users.find((usr) => usr.id === Number(usuarioId));
      if (u) {
        responsableName = u.nombre;
        targetUserId = u.id;
      }
    }

    onSaveObjetivo(
      {
        titulo: titulo.trim(),
        tipo,
        meta_cantidad: Number(metaCantidad) || 1,
        unidad,
        periodo,
        usuario_id: targetUserId,
        responsable: responsableName,
        avance_actual: Number(avanceActual) || 0,
        fecha_limite: fechaLimite,
      },
      objToEdit?.id
    );

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Objetivos & Metas Comerciales</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {objetivos.length} activos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seguimiento de cuotas mensuales de captación de prospectos y metas de ventas en RD$
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Definir Nuevo Objetivo</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800 bg-slate-900/30">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Meta Global de Prospectos</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">50 Prospectos</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Avance actual: 38 (76%)</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Meta Global de Ventas</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">RD$ 500,000</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Avance actual: RD$ 385,000 (77%)</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Periodo de Cumplimiento</p>
            <h3 className="text-2xl font-bold text-purple-400 mt-1">Septiembre 2026</h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Cierre de mes: 30 Sept</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Metas Asignadas y Porcentaje de Cumplimiento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objetivos.map((obj) => {
            const percentage = Math.min(Math.round((obj.avance_actual / obj.meta_cantidad) * 100), 100);
            const isCompleted = percentage >= 100;

            return (
              <div
                key={obj.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {obj.tipo} • {obj.periodo}
                    </span>
                    <h3 className="font-bold text-base text-slate-100 mt-1.5">{obj.titulo}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Responsable: {obj.responsable}</p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(obj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Editar Meta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar la meta "${obj.titulo}"?`)) {
                            onDeleteObjetivo(obj.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Eliminar Meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      Avance:{' '}
                      <strong className="text-white font-mono">
                        {obj.unidad === 'RD$' ? `RD$ ${obj.avance_actual.toLocaleString()}` : `${obj.avance_actual} ${obj.unidad}`}
                      </strong>{' '}
                      de{' '}
                      <strong className="text-slate-400 font-mono">
                        {obj.unidad === 'RD$' ? `RD$ ${obj.meta_cantidad.toLocaleString()}` : `${obj.meta_cantidad} ${obj.unidad}`}
                      </strong>
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isCompleted ? 'text-emerald-400' : 'text-purple-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : 'bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Fecha Límite: {obj.fecha_limite}</span>
                  </span>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>¡Meta Alcanzada!</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Resta:{' '}
                      <strong className="font-mono text-slate-200">
                        {obj.unidad === 'RD$'
                          ? `RD$ ${(obj.meta_cantidad - obj.avance_actual).toLocaleString()}`
                          : `${obj.meta_cantidad - obj.avance_actual} ${obj.unidad}`}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Crear / Editar Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {objToEdit ? 'Editar Objetivo Comercial' : 'Crear Objetivo Comercial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Título del Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Meta mensual de prospección"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tipo de Objetivo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Prospectos">Captación de Prospectos</option>
                    <option value="Ventas">Monto de Ventas (RD$)</option>
                    <option value="Llamadas">Llamadas y Contactos</option>
                    <option value="Cierres">Cierres de Contratos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Periodo</label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Meta Numérica</label>
                  <input
                    type="number"
                    required
                    value={metaCantidad}
                    onChange={(e) => setMetaCantidad(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Unidad de Medida</label>
                  <input
                    type="text"
                    placeholder="prospectos o RD$"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Avance Actual</label>
                  <input
                    type="number"
                    value={avanceActual}
                    onChange={(e) => setAvanceActual(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Fecha Límite</label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Responsable Asignado</label>
                <select
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value === 'global' ? 'global' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="global">Meta Global (Equipo Comercial ITHOT)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.rol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
