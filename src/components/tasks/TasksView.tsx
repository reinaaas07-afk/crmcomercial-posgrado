import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Lead, User } from '../../types/crm';

interface TasksViewProps {
  tasks: Task[];
  leads: Lead[];
  users: User[];
  onToggleTaskStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateTaskModal: () => void;
  onSelectLeadById: (leadId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  leads,
  users,
  onToggleTaskStatus,
  onDeleteTask,
  onOpenCreateTaskModal,
  onSelectLeadById,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAdvisor = advisorFilter === 'all' || t.assignedTo === advisorFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.leadName && t.leadName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesPriority && matchesAdvisor && matchesSearch;
  });

  const pendingCount = tasks.filter((t) => t.status === 'Pendiente').length;
  const inProgressCount = tasks.filter((t) => t.status === 'En Progreso').length;
  const completedCount = tasks.filter((t) => t.status === 'Completada').length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestión de Tareas Comerciales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organiza compromisos, llamadas y entregables asociados directamente a cada prospecto.
          </p>
        </div>

        <button
          onClick={onOpenCreateTaskModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Stats summary banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Pendientes</span>
            <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">{pendingCount}</div>
          </div>
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">En Progreso</span>
            <div className="text-xl font-bold text-blue-400 font-mono tabular-nums">{inProgressCount}</div>
          </div>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Completadas</span>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">{completedCount}</div>
          </div>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tareas por título o prospecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Responsables</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg divide-y divide-slate-800/80">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No hay tareas que coincidan con los filtros seleccionados.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completada';

            return (
              <div
                key={task.id}
                className={`p-4 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4 ${
                  isCompleted ? 'opacity-60 bg-slate-950/30' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-blue-400 bg-slate-800'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority tag */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          task.priority === 'Alta'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : task.priority === 'Media'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                      {task.leadId && (
                        <button
                          onClick={() => onSelectLeadById(task.leadId!)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                          <span>{task.leadName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>{task.assignedToName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Due Date & Delete */}
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div className="text-xs font-mono">
                    <div className="text-slate-300 font-semibold">{task.dueDate}</div>
                    {task.dueTime && (
                      <div className="text-[11px] text-slate-500">{task.dueTime}</div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
