import React, { useState, useEffect } from 'react';
import {
  ActiveSection,
  Lead,
  Activity,
  Task,
  User,
  UserRole,
  LeadStage,
} from './types/crm';
import {
  INITIAL_USERS,
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_TASKS,
  loadLeads,
  saveLeads,
  loadActivities,
  saveActivities,
  loadTasks,
  saveTasks,
  loadCurrentRole,
  saveCurrentRole,
} from './data/mockData';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { TrackingView } from './components/tracking/TrackingView';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { ReportsView } from './components/reports/ReportsView';
import { ImportExportView } from './components/import-export/ImportExportView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';

// Drawers & Modals
import { LeadDrawer } from './components/leads/LeadDrawer';
import { CreateLeadModal } from './components/modals/CreateLeadModal';
import { CreateActivityModal } from './components/modals/CreateActivityModal';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { AcademicInfoModal } from './components/modals/AcademicInfoModal';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core Data States with LocalStorage Persistence
  const [leads, setLeads] = useState<Lead[]>(() => loadLeads());
  const [activities, setActivities] = useState<Activity[]>(() => loadActivities());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadCurrentRole() as UserRole);

  // Modal and Drawer States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);

  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);

  // Compute Current User based on Role
  const currentUser =
    users.find((u) => u.role === currentRole) || users[0];

  // Section titles dictionary
  const sectionTitles: Record<ActiveSection, string> = {
    dashboard: 'Dashboard Principal',
    prospectos: 'Directorio de Prospectos',
    pipeline: 'Pipeline Comercial (Kanban)',
    seguimientos: 'Módulo de Seguimientos',
    calendario: 'Calendario Comercial',
    tareas: 'Módulo de Tareas',
    reportes: 'Reportes y Analítica',
    'importar-exportar': 'Importar y Exportar Datos',
    usuarios: 'Usuarios y Roles',
    configuracion: 'Configuración Comercial',
  };

  // HANDLERS
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    saveCurrentRole(role);
  };

  const handleOpenLeadDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadDrawerOpen(true);
  };

  const handleSelectLeadById = (leadId: string) => {
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      setSelectedLead(found);
      setIsLeadDrawerOpen(true);
    }
  };

  const handleSaveLead = (leadData: Lead) => {
    const exists = leads.some((l) => l.id === leadData.id);
    let updated: Lead[];
    if (exists) {
      updated = leads.map((l) => (l.id === leadData.id ? leadData : l));
    } else {
      updated = [leadData, ...leads];
    }
    setLeads(updated);
    saveLeads(updated);

    if (selectedLead && selectedLead.id === leadData.id) {
      setSelectedLead(leadData);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    const updated = leads.filter((l) => l.id !== leadId);
    setLeads(updated);
    saveLeads(updated);
    if (selectedLead?.id === leadId) {
      setIsLeadDrawerOpen(false);
      setSelectedLead(null);
    }
  };

  const handleUpdateLeadStage = (leadId: string, newStage: LeadStage) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead || targetLead.stage === newStage) return;

    const oldStage = targetLead.stage;
    const updatedLeads = leads.map((l) =>
      l.id === leadId ? { ...l, stage: newStage } : l
    );
    setLeads(updatedLeads);
    saveLeads(updatedLeads);

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, stage: newStage });
    }

    // Auto-log activity for audit trail
    const auditActivity: Activity = {
      id: `act-stage-${Date.now()}`,
      leadId,
      leadName: targetLead.name,
      type: 'Nota',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      userId: currentUser.id,
      userName: currentUser.name,
      result: 'Exitoso',
      notes: `Prospecto avanzado de la etapa "${oldStage}" a "${newStage}" en el tablero Kanban.`,
    };

    const updatedActivities = [auditActivity, ...activities];
    setActivities(updatedActivities);
    saveActivities(updatedActivities);
  };

  const handleSaveActivity = (activity: Activity) => {
    const updatedActivities = [activity, ...activities];
    setActivities(updatedActivities);
    saveActivities(updatedActivities);

    // Update related lead follow-up date if specified
    if (activity.nextFollowUpDate) {
      const updatedLeads = leads.map((l) =>
        l.id === activity.leadId ? { ...l, nextFollowUpDate: activity.nextFollowUpDate } : l
      );
      setLeads(updatedLeads);
      saveLeads(updatedLeads);

      if (selectedLead && selectedLead.id === activity.leadId) {
        setSelectedLead({ ...selectedLead, nextFollowUpDate: activity.nextFollowUpDate });
      }
    }
  };

  const handleSaveTask = (newTask: Task) => {
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: t.status === 'Completada' ? ('Pendiente' as const) : ('Completada' as const) }
        : t
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleImportLeads = (newLeads: Lead[]) => {
    const updated = [...newLeads, ...leads];
    setLeads(updated);
    saveLeads(updated);
  };

  const handleResetDemoData = () => {
    setLeads(INITIAL_LEADS);
    saveLeads(INITIAL_LEADS);
    setActivities(INITIAL_ACTIVITIES);
    saveActivities(INITIAL_ACTIVITIES);
    setTasks(INITIAL_TASKS);
    saveTasks(INITIAL_TASKS);
    setCurrentRole('Administrador');
    saveCurrentRole('Administrador');
    setSelectedLead(null);
    setIsLeadDrawerOpen(false);
  };

  // Counters for sidebar badges
  const pendingActivitiesCount = activities.filter((a) => a.result === 'Sin respuesta' || a.result === 'Ocupado').length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'Pendiente').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Lateral Menu (Sidebar) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(section) => setActiveSection(section)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        leadsCount={leads.length}
        pendingActivitiesCount={pendingActivitiesCount}
        pendingTasksCount={pendingTasksCount}
        currentUser={currentUser}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-950">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          onOpenCreateLeadModal={() => {
            setLeadToEdit(null);
            setIsCreateLeadModalOpen(true);
          }}
          onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
          onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
          onSelectLeadById={handleSelectLeadById}
          leads={leads}
          currentSectionTitle={sectionTitles[activeSection]}
        />

        {/* Viewport Router */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeSection === 'dashboard' && (
            <DashboardView
              leads={leads}
              activities={activities}
              tasks={tasks}
              currentUser={currentUser}
              onSelectLead={handleOpenLeadDrawer}
              onNavigateSection={(sec) => setActiveSection(sec)}
              onOpenCreateLeadModal={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {activeSection === 'prospectos' && (
            <LeadsView
              leads={leads}
              users={users}
              onSelectLead={handleOpenLeadDrawer}
              onOpenCreateModal={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
              onOpenEditModal={(lead) => {
                setLeadToEdit(lead);
                setIsCreateLeadModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onUpdateLead={handleSaveLead}
            />
          )}

          {activeSection === 'pipeline' && (
            <PipelineView
              leads={leads}
              users={users}
              onUpdateLeadStage={handleUpdateLeadStage}
              onSelectLead={handleOpenLeadDrawer}
              onOpenCreateModal={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
            />
          )}

          {activeSection === 'seguimientos' && (
            <TrackingView
              activities={activities}
              leads={leads}
              users={users}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
              onSelectLeadById={handleSelectLeadById}
            />
          )}

          {activeSection === 'calendario' && (
            <CalendarView
              users={users}
              leads={leads}
              onSelectLeadById={handleSelectLeadById}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
            />
          )}

          {activeSection === 'tareas' && (
            <TasksView
              tasks={tasks}
              leads={leads}
              users={users}
              onToggleTaskStatus={handleToggleTaskStatus}
              onDeleteTask={handleDeleteTask}
              onOpenCreateTaskModal={() => setIsCreateTaskModalOpen(true)}
              onSelectLeadById={handleSelectLeadById}
            />
          )}

          {activeSection === 'reportes' && (
            <ReportsView
              leads={leads}
              activities={activities}
              users={users}
            />
          )}

          {activeSection === 'importar-exportar' && (
            <ImportExportView
              leads={leads}
              onImportLeads={handleImportLeads}
              users={users}
            />
          )}

          {activeSection === 'usuarios' && (
            <UsersView
              users={users}
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
            />
          )}

          {activeSection === 'configuracion' && (
            <SettingsView onResetDemoData={handleResetDemoData} />
          )}
        </main>
      </div>

      {/* Individual Lead Drawer (Ficha de Prospecto) */}
      <LeadDrawer
        lead={selectedLead}
        isOpen={isLeadDrawerOpen}
        onClose={() => {
          setIsLeadDrawerOpen(false);
          setSelectedLead(null);
        }}
        onUpdateLead={handleSaveLead}
        onDeleteLead={handleDeleteLead}
        activities={activities}
        onAddActivity={handleSaveActivity}
        currentUser={currentUser}
        users={users}
        onOpenEditModal={(lead) => {
          setLeadToEdit(lead);
          setIsCreateLeadModalOpen(true);
        }}
      />

      {/* Create / Edit Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateLeadModalOpen}
        onClose={() => {
          setIsCreateLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSaveLead={handleSaveLead}
        users={users}
        leadToEdit={leadToEdit}
      />

      {/* Register Follow-up Activity Modal */}
      <CreateActivityModal
        isOpen={isCreateActivityModalOpen}
        onClose={() => setIsCreateActivityModalOpen(false)}
        onSaveActivity={handleSaveActivity}
        leads={leads}
        currentUser={currentUser}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        leads={leads}
        users={users}
        defaultAssignedUserId={currentUser.id}
      />

      {/* Academic Scope Information Modal */}
      <AcademicInfoModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />
    </div>
  );
}
