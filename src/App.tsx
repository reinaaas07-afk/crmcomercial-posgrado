import React, { useState, useEffect, useMemo } from 'react';
import {
  SeccionApp,
  UsuarioDB,
  EtapaPipelineDB,
  ProspectoDB,
  ContactoDB,
  SeguimientoDB,
  TareaDB,
  ActividadDB,
  RolUsuario,
  HistorialImportacionDB,
  HistorialExportacionDB,
} from './types/schema';
import {
  loadRelationalData,
  saveRelationalData,
} from './data/relationalDatabase';

// Types for legacy subcomponents adapter
import { Lead, Activity, Task, User, LeadStage, UserRole } from './types/crm';

// Layout: Fixed Left Sidebar & Header
import { AppSidebar } from './components/layout/AppSidebar';

// Functional CRM Modules
import { DashboardView } from './components/dashboard/DashboardView';
import { ContactsView } from './components/contacts/ContactsView';
import { LeadsView } from './components/leads/LeadsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { TrackingView } from './components/tracking/TrackingView';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { ReportsView } from './components/reports/ReportsView';
import { ImportsModule } from './components/import/ImportsModule';
import { ExportsModule } from './components/export/ExportsModule';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { TechDocsView } from './components/docs/TechDocsView';

// Modals & Drawers
import { ContactDrawer } from './components/contacts/ContactDrawer';
import { CreateContactModal } from './components/modals/CreateContactModal';
import { LeadDrawer } from './components/leads/LeadDrawer';
import { CreateLeadModal } from './components/modals/CreateLeadModal';
import { CreateActivityModal } from './components/modals/CreateActivityModal';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CreateUserModal } from './components/modals/CreateUserModal';
import { AcademicInfoModal } from './components/modals/AcademicInfoModal';

import {
  Shield,
  Plus,
  PhoneCall,
  GraduationCap,
  ChevronRight,
  Database,
  CheckCircle2,
  Contact,
} from 'lucide-react';

interface DBState {
  usuarios: UsuarioDB[];
  etapas: EtapaPipelineDB[];
  prospectos: ProspectoDB[];
  contactos: ContactoDB[];
  seguimientos: SeguimientoDB[];
  tareas: TareaDB[];
  actividades: ActividadDB[];
  historialImportaciones: HistorialImportacionDB[];
  historialExportaciones: HistorialExportacionDB[];
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SeccionApp>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<RolUsuario>('Administrador');

  // Relational Database State
  const [dbState, setDbState] = useState<DBState>(() => loadRelationalData());

  const {
    usuarios,
    etapas,
    prospectos,
    contactos,
    seguimientos,
    tareas,
    actividades,
    historialImportaciones,
    historialExportaciones,
  } = dbState;

  // Modals & Drawers State
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  // Contacts State
  const [selectedContact, setSelectedContact] = useState<ContactoDB | null>(null);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ContactoDB | null>(null);

  // Users State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UsuarioDB | null>(null);

  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveRelationalData(dbState);
  }, [dbState]);

  // Current User computed from simulated role
  const currentUserDB = useMemo(() => {
    return usuarios.find((u) => u.rol === currentRole) || usuarios[0];
  }, [usuarios, currentRole]);

  // Adapter for UI compatibility: Prospectos Con Relaciones -> Lead format
  const prospectosAdaptados: Lead[] = useMemo(() => {
    const etapasMap = new Map(etapas.map((e) => [e.id, e.nombre]));
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u.nombre]));

    return prospectos.map((p) => ({
      id: String(p.id),
      name: `${p.nombre} ${p.apellido}`.trim(),
      company: p.empresa,
      email: p.email || '',
      phone: p.telefono || '',
      source: p.fuente as any,
      assignedTo: `usr-${p.usuario_id}`,
      assignedToName: usuariosMap.get(p.usuario_id) || 'Ing. Yenifer Sena',
      stage: (etapasMap.get(p.etapa_id) || 'Nuevo Lead') as LeadStage,
      createdAt: p.fecha_registro.split(' ')[0],
      nextFollowUpDate: p.fecha_proximo_seguimiento || undefined,
      estimatedValue: p.valor_estimado,
      tags: p.etiquetas ? p.etiquetas.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: p.notas || '',
      attachments: [],
      cargo: p.cargo,
      whatsapp: p.whatsapp,
      ciudad: p.ciudad,
      provincia: p.provincia,
      naturaleza_negocio: p.naturaleza_negocio,
      producto_interes: p.producto_interes,
      modulo_interes: p.modulo_interes,
      contactoId: p.contacto_id || undefined,
      ultima_interaccion: p.ultima_interaccion,
    } as any));
  }, [prospectos, etapas, usuarios]);

  // Adapter for Seguimientos -> Activity format
  const seguimientosAdaptados: Activity[] = useMemo(() => {
    const prospectosMap = new Map(prospectos.map((p) => [p.id, `${p.nombre} ${p.apellido}`]));
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u.nombre]));

    return seguimientos.map((s) => ({
      id: `act-${s.id}`,
      leadId: String(s.prospecto_id),
      leadName: prospectosMap.get(s.prospecto_id) || 'Oportunidad ITHOT',
      type: (s.canal === 'Correo Electrónico' ? 'Correo' : s.canal === 'Nota Interna' ? 'Nota' : s.canal) as any,
      date: s.fecha_hora.split(' ')[0],
      time: s.fecha_hora.split(' ')[1]?.slice(0, 5) || '12:00',
      userId: `usr-${s.usuario_id}`,
      userName: usuariosMap.get(s.usuario_id) || 'Ing. Yenifer Sena',
      result: (s.resultado.includes('Exitoso') ? 'Exitoso' : s.resultado.includes('Interesado') ? 'Interesado' : s.resultado.includes('Sin Respuesta') ? 'Sin respuesta' : s.resultado.includes('Ocupado') ? 'Ocupado' : 'Reagendado') as any,
      notes: s.observaciones,
      nextAction: s.proxima_accion || undefined,
      nextFollowUpDate: s.fecha_proxima_accion || undefined,
    }));
  }, [seguimientos, prospectos, usuarios]);

  // Adapter for Tareas -> Task format
  const tareasAdaptadas: Task[] = useMemo(() => {
    const prospectosMap = new Map(prospectos.map((p) => [p.id, `${p.nombre} ${p.apellido} (${p.empresa})`]));
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u.nombre]));

    return tareas.map((t) => ({
      id: `tsk-${t.id}`,
      title: t.titulo,
      leadId: t.prospecto_id ? String(t.prospecto_id) : undefined,
      leadName: t.prospecto_id ? prospectosMap.get(t.prospecto_id) : undefined,
      dueDate: t.fecha_limite,
      dueTime: t.hora_limite || undefined,
      priority: t.prioridad,
      status: t.estado as any,
      assignedTo: `usr-${t.usuario_id}`,
      assignedToName: usuariosMap.get(t.usuario_id) || 'Ing. Yenifer Sena',
      description: t.descripcion || undefined,
    }));
  }, [tareas, prospectos, usuarios]);

  // Adapter for Users format
  const usuariosAdaptados: User[] = useMemo(() => {
    return usuarios.map((u) => {
      const uProspectos = prospectos.filter((p) => p.usuario_id === u.id);
      const uGanados = uProspectos.filter((p) => p.etapa_id === 7).length;
      const rate = uProspectos.length > 0 ? (uGanados / uProspectos.length) * 100 : 0;

      return {
        id: `usr-${u.id}`,
        name: u.nombre,
        email: u.email,
        role: u.rol as UserRole,
        avatar: '',
        phone: u.telefono,
        activeLeadsCount: uProspectos.length,
        conversionRate: Number(rate.toFixed(1)),
        active: u.activo,
        empresa: u.empresa || 'ITHOT',
      };
    });
  }, [usuarios, prospectos]);

  const currentUserAdaptado: User = useMemo(() => {
    return usuariosAdaptados.find((u) => u.role === currentRole) || usuariosAdaptados[0];
  }, [usuariosAdaptados, currentRole]);

  // Selected Lead for Drawer
  const selectedLeadAdapted = useMemo(() => {
    if (!selectedLeadId) return null;
    return prospectosAdaptados.find((p) => p.id === String(selectedLeadId)) || null;
  }, [selectedLeadId, prospectosAdaptados]);

  // HANDLERS RELACIONALES (LIVE DATABASE MUTATIONS & REAL INTERCONNECTIONS)
  const handleRoleChange = (newRole: RolUsuario) => {
    setCurrentRole(newRole);
  };

  const handleOpenLeadDrawer = (lead: Lead) => {
    setSelectedLeadId(Number(lead.id));
    setIsLeadDrawerOpen(true);
  };

  const handleSelectLeadById = (leadIdStr: string) => {
    const numId = Number(leadIdStr.replace('lead-', ''));
    setSelectedLeadId(numId);
    setIsLeadDrawerOpen(true);
  };

  // Guardar Contacto (INSERT o UPDATE en 'contactos' con sincronización en cascada a prospectos y empresa)
  const handleSaveContact = (contactData: ContactoDB) => {
    setDbState((prev) => {
      const isNew = !prev.contactos.some((c) => c.id === contactData.id);
      const updatedContactos = isNew
        ? [contactData, ...prev.contactos]
        : prev.contactos.map((c) => (c.id === contactData.id ? contactData : c));

      // Sincronizar en cascada hacia prospectos si coinciden por contacto_id o nombre de empresa
      const updatedProspectos = prev.prospectos.map((p) => {
        const isMatched =
          (p.contacto_id && p.contacto_id === contactData.id) ||
          p.empresa.toLowerCase() === contactData.empresa.toLowerCase();

        if (isMatched) {
          return {
            ...p,
            nombre: contactData.nombre,
            apellido: contactData.apellido,
            empresa: contactData.empresa,
            cargo: contactData.cargo || p.cargo,
            email: contactData.email || p.email,
            telefono: contactData.telefono || p.telefono,
            whatsapp: contactData.whatsapp || p.whatsapp,
            ciudad: contactData.ciudad || p.ciudad,
            provincia: contactData.provincia || p.provincia,
            naturaleza_negocio: contactData.naturaleza_negocio || p.naturaleza_negocio,
            producto_interes: contactData.producto_interes || p.producto_interes,
            modulo_interes: contactData.modulo_interes || p.modulo_interes,
            usuario_id: contactData.usuario_id || p.usuario_id,
          };
        }
        return p;
      });

      return {
        ...prev,
        contactos: updatedContactos,
        prospectos: updatedProspectos,
      };
    });
  };

  // Eliminar Contacto
  const handleDeleteContact = (contactId: number) => {
    setDbState((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((c) => c.id !== contactId),
    }));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
      setIsContactDrawerOpen(false);
    }
  };

  // Convertir Contacto en Oportunidad de Pipeline
  const handleConvertToOpportunity = (contact: ContactoDB) => {
    const newId = prospectos.length > 0 ? Math.max(...prospectos.map((p) => p.id)) + 1 : 101;
    const newProspecto: ProspectoDB = {
      id: newId,
      nombre: contact.nombre,
      apellido: contact.apellido,
      empresa: contact.empresa,
      cargo: contact.cargo,
      email: contact.email,
      telefono: contact.telefono,
      whatsapp: contact.whatsapp || contact.telefono,
      fuente: 'Referido',
      etapa_id: 1, // Nuevo Lead
      usuario_id: contact.usuario_id || currentUserDB.id,
      valor_estimado: 240000,
      fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fecha_proximo_seguimiento: contact.proximo_seguimiento || new Date(Date.now() + 86400000 * 2).toISOString().replace('T', ' ').slice(0, 16),
      notas: `Oportunidad generada desde el contacto ${contact.nombre} ${contact.apellido}. ${contact.observaciones || ''}`,
      etiquetas: contact.etiquetas || 'Prospecto, ITHOT System',
      contacto_id: contact.id,
      naturaleza_negocio: contact.naturaleza_negocio,
      producto_interes: contact.producto_interes || 'ITHOT System',
      modulo_interes: contact.modulo_interes || 'Inventario',
      direccion: contact.direccion,
      ciudad: contact.ciudad,
      provincia: contact.provincia,
      ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      prospectos: [newProspecto, ...prev.prospectos],
    }));

    setActiveSection('pipeline');
  };

  // Guardar Prospecto (INSERT o UPDATE en la tabla 'prospectos' con sincronización recíproca a contactos)
  const handleSaveLead = (leadData: Lead) => {
    const rawId = Number(leadData.id.replace('lead-', ''));
    const isNew = isNaN(rawId) || !prospectos.some((p) => p.id === rawId);

    const targetEtapa = etapas.find((e) => e.nombre === leadData.stage) || etapas[0];
    const targetUserId = Number(leadData.assignedTo.replace('usr-', '')) || currentUserDB.id;

    const parts = leadData.name.split(' ');
    const nombre = parts[0] || leadData.name;
    const apellido = parts.slice(1).join(' ') || '';

    setDbState((prev) => {
      let updatedProspectos: ProspectoDB[];

      if (isNew) {
        const newId = prev.prospectos.length > 0 ? Math.max(...prev.prospectos.map((p) => p.id)) + 1 : 101;
        const newProspecto: ProspectoDB = {
          id: newId,
          nombre,
          apellido,
          empresa: leadData.company,
          cargo: (leadData as any).cargo || 'Gerente General',
          email: leadData.email,
          telefono: leadData.phone,
          whatsapp: (leadData as any).whatsapp || leadData.phone,
          fuente: leadData.source,
          etapa_id: targetEtapa.id,
          usuario_id: targetUserId,
          valor_estimado: leadData.estimatedValue || 0,
          fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
          fecha_proximo_seguimiento: leadData.nextFollowUpDate || null,
          notas: leadData.notes || '',
          etiquetas: leadData.tags.join(', '),
          naturaleza_negocio: (leadData as any).naturaleza_negocio || 'Comercio Mayorista / Retail',
          producto_interes: (leadData as any).producto_interes || 'ITHOT System',
          modulo_interes: (leadData as any).modulo_interes || 'Inventario',
          ciudad: (leadData as any).ciudad || 'Santo Domingo',
          provincia: (leadData as any).provincia || 'Distrito Nacional',
          ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
        updatedProspectos = [newProspecto, ...prev.prospectos];
      } else {
        updatedProspectos = prev.prospectos.map((p) =>
          p.id === rawId
            ? {
                ...p,
                nombre,
                apellido,
                empresa: leadData.company,
                cargo: (leadData as any).cargo || p.cargo,
                email: leadData.email,
                telefono: leadData.phone,
                whatsapp: (leadData as any).whatsapp || p.whatsapp,
                fuente: leadData.source,
                etapa_id: targetEtapa.id,
                usuario_id: targetUserId,
                valor_estimado: leadData.estimatedValue || 0,
                fecha_proximo_seguimiento: leadData.nextFollowUpDate || null,
                notas: leadData.notes || '',
                etiquetas: leadData.tags.join(', '),
                naturaleza_negocio: (leadData as any).naturaleza_negocio || p.naturaleza_negocio,
                producto_interes: (leadData as any).producto_interes || p.producto_interes,
                modulo_interes: (leadData as any).modulo_interes || p.modulo_interes,
                ciudad: (leadData as any).ciudad || p.ciudad,
                provincia: (leadData as any).provincia || p.provincia,
                ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
              }
            : p
        );
      }

      // Sincronizar hacia Contactos si la empresa coincide
      const updatedContactos = prev.contactos.map((c) => {
        if (c.empresa.toLowerCase() === leadData.company.toLowerCase()) {
          return {
            ...c,
            empresa: leadData.company,
            usuario_id: targetUserId,
            telefono: leadData.phone || c.telefono,
            whatsapp: (leadData as any).whatsapp || c.whatsapp,
            email: leadData.email || c.email,
          };
        }
        return c;
      });

      return {
        ...prev,
        prospectos: updatedProspectos,
        contactos: updatedContactos,
      };
    });
  };

  // Eliminar Prospecto (DELETE con CASCADE)
  const handleDeleteLead = (leadIdStr: string) => {
    const rawId = Number(leadIdStr.replace('lead-', ''));
    setDbState((prev) => ({
      ...prev,
      prospectos: prev.prospectos.filter((p) => p.id !== rawId),
      seguimientos: prev.seguimientos.filter((s) => s.prospecto_id !== rawId),
      tareas: prev.tareas.filter((t) => t.prospecto_id !== rawId),
      actividades: prev.actividades.filter((a) => a.prospecto_id !== rawId),
    }));

    if (selectedLeadId === rawId) {
      setIsLeadDrawerOpen(false);
      setSelectedLeadId(null);
    }
  };

  // Mover Etapa en Pipeline Kanban
  const handleUpdateLeadStage = (leadIdStr: string, newStageName: LeadStage) => {
    const rawId = Number(leadIdStr.replace('lead-', ''));
    const targetEtapa = etapas.find((e) => e.nombre === newStageName);
    if (!targetEtapa) return;

    setDbState((prev) => {
      const currentLead = prev.prospectos.find((p) => p.id === rawId);
      if (!currentLead || currentLead.etapa_id === targetEtapa.id) return prev;

      const auditSeguimiento: SeguimientoDB = {
        id: prev.seguimientos.length > 0 ? Math.max(...prev.seguimientos.map((s) => s.id)) + 1 : 1,
        prospecto_id: rawId,
        usuario_id: currentUserDB.id,
        canal: 'Nota Interna',
        resultado: 'Exitoso / Contactado',
        fecha_hora: new Date().toISOString().replace('T', ' ').slice(0, 19),
        observaciones: `Avance en Pipeline a "${targetEtapa.nombre}" (Solución ITHOT: ${currentLead.producto_interes || 'Sistema'}).`,
        proxima_accion: 'Seguimiento comercial',
        fecha_proxima_accion: currentLead.fecha_proximo_seguimiento,
        creado_en: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      return {
        ...prev,
        prospectos: prev.prospectos.map((p) =>
          p.id === rawId ? { ...p, etapa_id: targetEtapa.id, ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19) } : p
        ),
        seguimientos: [auditSeguimiento, ...prev.seguimientos],
      };
    });
  };

  // Guardar Seguimiento
  const handleSaveActivity = (activityData: Activity) => {
    const rawLeadId = Number(activityData.leadId.replace('lead-', ''));
    const newSegId = seguimientos.length > 0 ? Math.max(...seguimientos.map((s) => s.id)) + 1 : 1;

    const newSeguimiento: SeguimientoDB = {
      id: newSegId,
      prospecto_id: rawLeadId,
      usuario_id: currentUserDB.id,
      canal: (activityData.type === 'Correo' ? 'Correo Electrónico' : activityData.type === 'Nota' ? 'Nota Interna' : activityData.type) as any,
      resultado: (activityData.result === 'Exitoso' ? 'Exitoso / Contactado' : activityData.result === 'Sin respuesta' ? 'Sin Respuesta' : activityData.result === 'Ocupado' ? 'Buzón de Voz / Ocupado' : 'Interesado') as any,
      fecha_hora: `${activityData.date} ${activityData.time}:00`,
      observaciones: activityData.notes,
      proxima_accion: activityData.nextAction || null,
      fecha_proxima_accion: activityData.nextFollowUpDate || null,
      creado_en: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      seguimientos: [newSeguimiento, ...prev.seguimientos],
      prospectos: prev.prospectos.map((p) =>
        p.id === rawLeadId
          ? {
              ...p,
              fecha_proximo_seguimiento: activityData.nextFollowUpDate || p.fecha_proximo_seguimiento,
              ultima_interaccion: `${activityData.date} ${activityData.time}:00`,
            }
          : p
      ),
    }));
  };

  // Guardar Tarea
  const handleSaveTask = (newTaskData: Task) => {
    const rawLeadId = newTaskData.leadId ? Number(newTaskData.leadId.replace('lead-', '')) : null;
    const newTaskId = tareas.length > 0 ? Math.max(...tareas.map((t) => t.id)) + 1 : 1;

    const newTarea: TareaDB = {
      id: newTaskId,
      prospecto_id: rawLeadId,
      usuario_id: currentUserDB.id,
      titulo: newTaskData.title,
      descripcion: newTaskData.description || '',
      prioridad: newTaskData.priority,
      estado: newTaskData.status as any,
      fecha_limite: newTaskData.dueDate,
      hora_limite: newTaskData.dueTime || null,
      fecha_creacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      tareas: [newTarea, ...prev.tareas],
    }));
  };

  const handleToggleTaskStatus = (taskIdStr: string) => {
    const rawId = Number(taskIdStr.replace('tsk-', ''));
    setDbState((prev) => ({
      ...prev,
      tareas: prev.tareas.map((t) =>
        t.id === rawId
          ? { ...t, estado: t.estado === 'Completada' ? 'Pendiente' : 'Completada' }
          : t
      ),
    }));
  };

  const handleDeleteTask = (taskIdStr: string) => {
    const rawId = Number(taskIdStr.replace('tsk-', ''));
    setDbState((prev) => ({
      ...prev,
      tareas: prev.tareas.filter((t) => t.id !== rawId),
    }));
  };

  // User Management Handlers (Yenifer Sena as Administrator)
  const handleSaveUser = (userData: UsuarioDB) => {
    setDbState((prev) => {
      const isNew = !prev.usuarios.some((u) => u.id === userData.id);
      const updated = isNew
        ? [...prev.usuarios, userData]
        : prev.usuarios.map((u) => (u.id === userData.id ? userData : u));
      return {
        ...prev,
        usuarios: updated,
      };
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === 1) {
      alert('No es posible eliminar al Administrador principal (Ing. Yenifer Sena).');
      return;
    }
    setDbState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.filter((u) => u.id !== userId),
    }));
  };

  const handleToggleUserStatus = (userId: number) => {
    setDbState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) =>
        u.id === userId ? { ...u, activo: !u.activo } : u
      ),
    }));
  };

  // Importar Prospectos masivamente desde Excel / CSV
  const handleImportProspectos = (newProspectos: ProspectoDB[]) => {
    setDbState((prev) => ({
      ...prev,
      prospectos: [...newProspectos, ...prev.prospectos],
    }));
  };

  const handleAddHistorialImportacion = (audit: HistorialImportacionDB) => {
    setDbState((prev) => ({
      ...prev,
      historialImportaciones: [audit, ...prev.historialImportaciones],
    }));
  };

  const handleAddHistorialExportacion = (audit: HistorialExportacionDB) => {
    setDbState((prev) => ({
      ...prev,
      historialExportaciones: [audit, ...prev.historialExportaciones],
    }));
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    setDbState(loadRelationalData());
    setCurrentRole('Administrador');
    setSelectedLeadId(null);
    setIsLeadDrawerOpen(false);
    setSelectedContact(null);
    setIsContactDrawerOpen(false);
  };

  const pendingTasksCount = tareas.filter((t) => t.estado === 'Pendiente').length;

  const sectionTitles: Record<SeccionApp, string> = {
    dashboard: 'Dashboard Principal',
    contactos: 'Directorio y Gestión de Contactos (Empresas y Personas)',
    prospectos: 'Directorio y Gestión de Prospectos',
    pipeline: 'Pipeline Comercial (Tablero Kanban)',
    seguimientos: 'Módulo de Seguimientos Multicanal',
    tareas: 'Módulo de Tareas Comerciales',
    calendario: 'Calendario Comercial',
    reportes: 'Módulo de Reportes y Analítica',
    importaciones: 'Módulo Independiente de Importaciones (Excel / CSV)',
    exportaciones: 'Módulo Independiente de Exportaciones',
    usuarios: 'Gestión de Usuarios y Roles (RBAC)',
    configuracion: 'Configuración del Sistema',
    documentacion: 'Documentación Técnica y Arquitectura de Software',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* MENÚ LATERAL IZQUIERDO FIJO */}
      <AppSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUserDB}
        onRoleChange={handleRoleChange}
        contactosCount={contactos.length}
        prospectosCount={prospectos.length}
        tareasPendientesCount={pendingTasksCount}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-950">
        {/* Top Institutional Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-blue-400 font-bold text-xs tracking-wider font-mono hidden sm:inline">
              ITHOT
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {sectionTitles[activeSection]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 rounded-lg transition-colors cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Proyecto de Posgrado</span>
            </button>

            {/* Quick Contact Button */}
            <button
              onClick={() => {
                setContactToEdit(null);
                setIsCreateContactModalOpen(true);
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Contact className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Contacto</span>
            </button>

            {/* Quick Opportunity Button */}
            <button
              onClick={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Oportunidad</span>
            </button>

            {/* Current user badge: Ing. Yenifer Sena */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-semibold">{currentUserDB.nombre}</span>
            </div>
          </div>
        </header>

        {/* Viewport Router */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {/* Módulo 1: Dashboard */}
          {activeSection === 'dashboard' && (
            <DashboardView
              leads={prospectosAdaptados}
              activities={seguimientosAdaptados}
              tasks={tareasAdaptadas}
              currentUser={currentUserAdaptado}
              onSelectLead={handleOpenLeadDrawer}
              onNavigateSection={(sec) => setActiveSection(sec as SeccionApp)}
              onOpenCreateLeadModal={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {/* Módulo 2: Contactos (NUEVO) */}
          {activeSection === 'contactos' && (
            <ContactsView
              contacts={contactos}
              users={usuarios}
              onSelectContact={(c) => {
                setSelectedContact(c);
                setIsContactDrawerOpen(true);
              }}
              onOpenCreateModal={() => {
                setContactToEdit(null);
                setIsCreateContactModalOpen(true);
              }}
              onOpenEditModal={(c) => {
                setContactToEdit(c);
                setIsCreateContactModalOpen(true);
              }}
              onDeleteContact={handleDeleteContact}
              onUpdateContact={handleSaveContact}
              onConvertToOpportunity={handleConvertToOpportunity}
              onNavigateToImports={() => setActiveSection('importaciones')}
              onNavigateToExports={() => setActiveSection('exportaciones')}
            />
          )}

          {/* Módulo 3: Prospectos */}
          {activeSection === 'prospectos' && (
            <LeadsView
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
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
              onNavigateToImports={() => setActiveSection('importaciones')}
              onNavigateToExports={() => setActiveSection('exportaciones')}
            />
          )}

          {/* Módulo 4: Pipeline Comercial */}
          {activeSection === 'pipeline' && (
            <PipelineView
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
              onUpdateLeadStage={handleUpdateLeadStage}
              onSelectLead={handleOpenLeadDrawer}
              onOpenCreateModal={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
            />
          )}

          {/* Módulo 5: Seguimientos */}
          {activeSection === 'seguimientos' && (
            <TrackingView
              activities={seguimientosAdaptados}
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
              onSelectLeadById={handleSelectLeadById}
            />
          )}

          {/* Módulo 6: Tareas */}
          {activeSection === 'tareas' && (
            <TasksView
              tasks={tareasAdaptadas}
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
              onToggleTaskStatus={handleToggleTaskStatus}
              onDeleteTask={handleDeleteTask}
              onOpenCreateTaskModal={() => setIsCreateTaskModalOpen(true)}
              onSelectLeadById={handleSelectLeadById}
            />
          )}

          {/* Módulo 7: Calendario */}
          {activeSection === 'calendario' && (
            <CalendarView
              users={usuariosAdaptados}
              leads={prospectosAdaptados}
              onSelectLeadById={handleSelectLeadById}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
            />
          )}

          {/* Módulo 8: Reportes */}
          {activeSection === 'reportes' && (
            <ReportsView
              leads={prospectosAdaptados}
              activities={seguimientosAdaptados}
              users={usuariosAdaptados}
            />
          )}

          {/* Módulo 9: Importaciones */}
          {activeSection === 'importaciones' && (
            <ImportsModule
              onImportProspectos={handleImportProspectos}
              historialImportaciones={historialImportaciones}
              onAddHistorialImportacion={handleAddHistorialImportacion}
              currentUser={currentUserDB}
              etapas={etapas}
              usuarios={usuarios}
            />
          )}

          {/* Módulo 10: Exportaciones */}
          {activeSection === 'exportaciones' && (
            <ExportsModule
              contactos={contactos}
              prospectos={prospectos}
              seguimientos={seguimientos}
              etapas={etapas}
              usuarios={usuarios}
              historialExportaciones={historialExportaciones}
              onAddHistorialExportacion={handleAddHistorialExportacion}
              currentUser={currentUserDB}
            />
          )}

          {/* Módulo 11: Usuarios y Roles */}
          {activeSection === 'usuarios' && (
            <UsersView
              users={usuarios}
              currentRole={currentRole}
              onRoleChange={(r) => handleRoleChange(r)}
              onOpenCreateUserModal={() => {
                setUserToEdit(null);
                setIsCreateUserModalOpen(true);
              }}
              onOpenEditUserModal={(u) => {
                setUserToEdit(u);
                setIsCreateUserModalOpen(true);
              }}
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {/* Módulo 12: Configuración */}
          {activeSection === 'configuracion' && (
            <SettingsView onResetDemoData={handleResetDemoData} />
          )}

          {/* Módulo 13: Documentación Técnica */}
          {activeSection === 'documentacion' && (
            <TechDocsView
              usuarios={usuarios}
              etapas={etapas}
              prospectos={prospectos}
              seguimientos={seguimientos}
              tareas={tareas}
              actividades={actividades}
            />
          )}
        </main>
      </div>

      {/* Contact Drawer (Ficha Técnica de Contacto) */}
      <ContactDrawer
        contact={selectedContact}
        isOpen={isContactDrawerOpen}
        onClose={() => {
          setIsContactDrawerOpen(false);
          setSelectedContact(null);
        }}
        onEditContact={(c) => {
          setContactToEdit(c);
          setIsCreateContactModalOpen(true);
        }}
        onDeleteContact={handleDeleteContact}
        onConvertToOpportunity={handleConvertToOpportunity}
        users={usuarios}
        seguimientos={seguimientos}
      />

      {/* Modal: Crear / Editar Contacto */}
      <CreateContactModal
        isOpen={isCreateContactModalOpen}
        onClose={() => {
          setIsCreateContactModalOpen(false);
          setContactToEdit(null);
        }}
        onSaveContact={handleSaveContact}
        users={usuarios}
        contactToEdit={contactToEdit}
      />

      {/* Opportunity / Lead Drawer (Ficha Técnica Completa con 16 campos) */}
      <LeadDrawer
        lead={selectedLeadAdapted}
        isOpen={isLeadDrawerOpen}
        onClose={() => {
          setIsLeadDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        onUpdateLead={handleSaveLead}
        onDeleteLead={handleDeleteLead}
        activities={seguimientosAdaptados}
        onAddActivity={handleSaveActivity}
        currentUser={currentUserAdaptado}
        users={usuariosAdaptados}
        onOpenEditModal={(lead) => {
          setLeadToEdit(lead);
          setIsCreateLeadModalOpen(true);
        }}
      />

      {/* Modal: Crear / Editar Prospecto */}
      <CreateLeadModal
        isOpen={isCreateLeadModalOpen}
        onClose={() => {
          setIsCreateLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSaveLead={handleSaveLead}
        users={usuariosAdaptados}
        leadToEdit={leadToEdit}
      />

      {/* Modal: Registrar Seguimiento */}
      <CreateActivityModal
        isOpen={isCreateActivityModalOpen}
        onClose={() => setIsCreateActivityModalOpen(false)}
        onSaveActivity={handleSaveActivity}
        leads={prospectosAdaptados}
        currentUser={currentUserAdaptado}
      />

      {/* Modal: Crear Tarea */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        leads={prospectosAdaptados}
        users={usuariosAdaptados}
        defaultAssignedUserId={currentUserAdaptado.id}
      />

      {/* Modal: Crear / Editar Usuario (Administradora Yenifer Sena) */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => {
          setIsCreateUserModalOpen(false);
          setUserToEdit(null);
        }}
        onSaveUser={handleSaveUser}
        userToEdit={userToEdit}
      />

      {/* Modal: Ficha del Proyecto de Posgrado */}
      <AcademicInfoModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />
    </div>
  );
}
