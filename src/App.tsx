import React, { useState, useEffect, useMemo } from 'react';
import {
  SeccionApp,
  UsuarioDB,
  EtapaPipelineDB,
  ProspectoDB,
  ContactoDB,
  EmpresaDB,
  ComentarioDB,
  AdjuntoDB,
  ObjetivoComercialDB,
  RegistroPapeleraDB,
  SeguimientoDB,
  TareaDB,
  ActividadDB,
  RolUsuario,
  HistorialImportacionDB,
  HistorialExportacionDB,
  RegistroAuditoriaDB,
  NotificacionDB,
  SubcuentaDB,
  EtiquetaConfigDB,
  CampoPersonalizadoDB,
  TipoAccionAuditoria,
  ModuloAfectado,
  TipoNotificacion,
} from './types/schema';
import {
  loadRelationalData,
  saveRelationalData,
} from './data/relationalDatabase';

// Types for legacy subcomponents adapter
import { Lead, Activity, Task, User, LeadStage, UserRole } from './types/crm';

// Layout & Navigation
import { AppSidebar } from './components/layout/AppSidebar';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { GlobalSearchBar } from './components/layout/GlobalSearchBar';

// Functional CRM Modules
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { CompaniesView } from './components/companies/CompaniesView';
import { ContactsView } from './components/contacts/ContactsView';
import { LeadsView } from './components/leads/LeadsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { TrackingView } from './components/tracking/TrackingView';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { GoalsView } from './components/goals/GoalsView';
import { TrashView } from './components/trash/TrashView';
import { LiveActivityView } from './components/activity/LiveActivityView';
import { ReportsView } from './components/reports/ReportsView';
import { ImportsModule } from './components/import/ImportsModule';
import { ExportsModule } from './components/export/ExportsModule';
import { UsersView } from './components/users/UsersView';
import { AuditView } from './components/audit/AuditView';
import { SettingsView } from './components/settings/SettingsView';
import { TechDocsView } from './components/docs/TechDocsView';

// Modals & Drawers
import { CompanyModal } from './components/companies/CompanyModal';
import { CompanyDrawer } from './components/companies/CompanyDrawer';
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
  Menu,
  Kanban,
  LayoutDashboard,
  Users as UsersIcon,
  X,
  UserCheck,
  Bell,
  LogOut,
  ShieldAlert,
  Building2,
  Target,
  Trash2,
  Activity as ActivityIcon,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface DBState {
  usuarios: UsuarioDB[];
  etapas: EtapaPipelineDB[];
  prospectos: ProspectoDB[];
  contactos: ContactoDB[];
  empresas: EmpresaDB[];
  comentarios: ComentarioDB[];
  adjuntos: AdjuntoDB[];
  objetivos: ObjetivoComercialDB[];
  papelera: RegistroPapeleraDB[];
  seguimientos: SeguimientoDB[];
  tareas: TareaDB[];
  actividades: ActividadDB[];
  historialImportaciones: HistorialImportacionDB[];
  historialExportaciones: HistorialExportacionDB[];
  subcuentas: SubcuentaDB[];
  etiquetasConfig: EtiquetaConfigDB[];
  camposPersonalizados: CampoPersonalizadoDB[];
  registrosAuditoria: RegistroAuditoriaDB[];
  notificaciones: NotificacionDB[];
}

export default function App() {
  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('crm_v4_session_active'));
  });

  const [activeSection, setActiveSection] = useState<SeccionApp>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RolUsuario>('Administrador General');

  // Relational Database State
  const [dbState, setDbState] = useState<DBState>(() => loadRelationalData());

  const {
    usuarios,
    etapas,
    prospectos,
    contactos,
    empresas,
    comentarios,
    adjuntos,
    objetivos,
    papelera,
    seguimientos,
    tareas,
    actividades,
    historialImportaciones,
    historialExportaciones,
    subcuentas,
    etiquetasConfig,
    camposPersonalizados,
    registrosAuditoria,
    notificaciones,
  } = dbState;

  // Active User ID: defaults to Yenifer Reina Sena Suero (id: 1)
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const initialData = loadRelationalData();
    return initialData.usuarios[0]?.id || 1;
  });

  // Empresas State
  const [selectedCompany, setSelectedCompany] = useState<EmpresaDB | null>(null);
  const [isCompanyDrawerOpen, setIsCompanyDrawerOpen] = useState(false);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<EmpresaDB | null>(null);

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

  // Current User computed from simulated role or selected colleague
  const currentUserDB = useMemo(() => {
    return (
      usuarios.find((u) => u.id === currentUserId) ||
      usuarios.find((u) => u.rol === currentRole) ||
      usuarios[0]
    );
  }, [usuarios, currentUserId, currentRole]);

  // Centralized Audit & Notification Logger
  const recordAuditAndNotify = (
    accion: TipoAccionAuditoria,
    modulo: ModuloAfectado,
    registro: string,
    detalles: string,
    notifTipo?: TipoNotificacion,
    notifTitulo?: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 8);
    const shortTimeStr = now.toTimeString().slice(0, 5);
    const userName = currentUserDB.nombre;

    const newAudit: RegistroAuditoriaDB = {
      id: Date.now(),
      usuario: userName,
      usuario_id: currentUserDB.id,
      fecha: dateStr,
      hora: timeStr,
      accion,
      modulo,
      registro_afectado: registro,
      detalles,
      ip_simulada: '190.167.34.12',
    };

    setDbState((prev) => {
      let updatedNotifs = prev.notificaciones;
      if (notifTipo) {
        const newNotif: NotificacionDB = {
          id: Date.now() + 1,
          titulo: notifTitulo || `${accion} en ${modulo}`,
          mensaje: `${userName}: ${detalles}`,
          tipo: notifTipo,
          usuario_origen: userName,
          fecha: dateStr,
          hora: shortTimeStr,
          leida: false,
          modulo_destino: (modulo === 'Prospectos'
            ? 'prospectos'
            : modulo === 'Contactos'
            ? 'contactos'
            : modulo === 'Pipeline'
            ? 'pipeline'
            : modulo === 'Importaciones'
            ? 'importaciones'
            : modulo === 'Usuarios y Roles'
            ? 'usuarios'
            : 'dashboard') as SeccionApp,
        };
        updatedNotifs = [newNotif, ...prev.notificaciones];
      }

      return {
        ...prev,
        registrosAuditoria: [newAudit, ...prev.registrosAuditoria],
        notificaciones: updatedNotifs,
      };
    });
  };

  const handleSelectUser = (userId: number) => {
    const target = usuarios.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      setCurrentRole(target.rol);
    }
  };

  // Auth Handlers
  const handleLogin = (user: UsuarioDB) => {
    setCurrentUserId(user.id);
    setCurrentRole(user.rol);
    setIsAuthenticated(true);
    localStorage.setItem('crm_v4_session_active', 'true');
    recordAuditAndNotify(
      'Inicio de Sesión',
      'Usuarios y Roles',
      user.nombre,
      `Inició sesión en el sistema CRMComercial como ${user.rol}.`
    );
  };

  const handleLogout = () => {
    recordAuditAndNotify(
      'Actualización',
      'Usuarios y Roles',
      currentUserDB.nombre,
      `Cerró sesión en el sistema.`
    );
    setIsAuthenticated(false);
    localStorage.removeItem('crm_v4_session_active');
  };

  // Notification Handlers
  const handleMarkAsRead = (id: number) => {
    setDbState((prev) => ({
      ...prev,
      notificaciones: prev.notificaciones.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
    }));
  };

  const handleMarkAllAsRead = () => {
    setDbState((prev) => ({
      ...prev,
      notificaciones: prev.notificaciones.map((n) => ({ ...n, leida: true })),
    }));
  };

  const handleClearRead = () => {
    setDbState((prev) => ({
      ...prev,
      notificaciones: prev.notificaciones.filter((n) => !n.leida),
    }));
  };

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
      assignedToName: usuariosMap.get(p.usuario_id) || 'Yenifer Reina Sena Suero',
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
      userName: usuariosMap.get(s.usuario_id) || 'Yenifer Reina Sena Suero',
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
      leadId: t.prospecto_id ? String(t.prospecto_id) : '',
      leadName: t.prospecto_id ? (prospectosMap.get(t.prospecto_id) || 'General ITHOT') : 'General ITHOT',
      assignedTo: `usr-${t.usuario_id}`,
      assignedToName: usuariosMap.get(t.usuario_id) || 'Yenifer Reina Sena Suero',
      dueDate: t.fecha_limite,
      dueTime: t.hora_limite || '17:00',
      priority: t.prioridad as any,
      status: (t.estado === 'Pendiente' ? 'Pendiente' : t.estado === 'En Progreso' ? 'En Progreso' : 'Completada') as any,
      description: t.descripcion,
    }));
  }, [tareas, prospectos, usuarios]);

  // Current User in legacy format
  const currentUserAdaptado: User = useMemo(() => ({
    id: `usr-${currentUserDB.id}`,
    name: currentUserDB.nombre,
    email: currentUserDB.email,
    role: currentUserDB.rol as UserRole,
    avatar: '',
    phone: currentUserDB.telefono,
    activeLeadsCount: prospectos.filter((p) => p.usuario_id === currentUserDB.id).length,
    conversionRate: 28,
  }), [currentUserDB, prospectos]);

  const usuariosAdaptados: User[] = useMemo(() => {
    return usuarios.map((u) => ({
      id: `usr-${u.id}`,
      name: u.nombre,
      email: u.email,
      role: u.rol as UserRole,
      avatar: '',
      phone: u.telefono,
      activeLeadsCount: prospectos.filter((p) => p.usuario_id === u.id).length,
      conversionRate: 25,
    }));
  }, [usuarios, prospectos]);

  // Selected Lead Adapted
  const selectedLeadAdapted: Lead | null = useMemo(() => {
    if (!selectedLeadId) return null;
    return prospectosAdaptados.find((p) => p.id === String(selectedLeadId)) || null;
  }, [selectedLeadId, prospectosAdaptados]);

  // Drawer handlers
  const handleOpenLeadDrawer = (lead: Lead) => {
    setSelectedLeadId(Number(lead.id));
    setIsLeadDrawerOpen(true);
  };

  const handleRoleChange = (newRole: RolUsuario) => {
    setCurrentRole(newRole);
    const matched = usuarios.find((u) => u.rol === newRole);
    if (matched) {
      setCurrentUserId(matched.id);
    }
  };

  // Contacts Handlers (CREATE / UPDATE)
  const handleSaveContact = (contactData: ContactoDB) => {
    const isNew = !dbState.contactos.some((c) => c.id === contactData.id);
    setDbState((prev) => {
      const updated = isNew
        ? [contactData, ...prev.contactos]
        : prev.contactos.map((c) => (c.id === contactData.id ? contactData : c));
      return { ...prev, contactos: updated };
    });

    recordAuditAndNotify(
      isNew ? 'Creación' : 'Actualización',
      'Contactos',
      `${contactData.nombre} ${contactData.apellido} (${contactData.empresa})`,
      `${isNew ? 'Creó' : 'Actualizó'} los datos de contacto y empresa en el directorio.`,
      isNew ? 'nuevo_prospecto' : 'prospecto_actualizado',
      isNew ? 'Nuevo contacto registrado' : 'Contacto actualizado'
    );
  };

  // Delete Contact (Soft Delete a Papelera)
  const handleDeleteContact = (contactId: number) => {
    const target = contactos.find((c) => c.id === contactId);
    if (!target) return;

    const trashRecord: RegistroPapeleraDB = {
      id: Date.now(),
      entidad_tipo: 'Contacto',
      entidad_id: contactId,
      titulo: `${target.nombre} ${target.apellido} (${target.empresa})`,
      detalles: `Cargo: ${target.cargo} • ${target.email} • Tel: ${target.telefono}`,
      datos_json: JSON.stringify(target),
      usuario_elimino: currentUserDB.nombre,
      fecha_eliminacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((c) => c.id !== contactId),
      papelera: [trashRecord, ...prev.papelera],
    }));

    if (selectedContact?.id === contactId) {
      setIsContactDrawerOpen(false);
      setSelectedContact(null);
    }

    recordAuditAndNotify(
      'Eliminación',
      'Contactos',
      `${target.nombre} ${target.apellido} (${target.empresa})`,
      `Movió el contacto a la papelera de reciclaje.`
    );
  };

  // Convert Contact into Pipeline Opportunity
  const handleConvertToOpportunity = (contact: ContactoDB) => {
    const defaultEtapa = etapas[0] || { id: 1, nombre: 'Nuevo Lead' };
    const newLead: ProspectoDB = {
      id: Date.now(),
      nombre: contact.nombre,
      apellido: contact.apellido,
      empresa: contact.empresa,
      cargo: contact.cargo,
      email: contact.email,
      telefono: contact.telefono,
      whatsapp: contact.whatsapp,
      fuente: 'Referido',
      etapa_id: defaultEtapa.id,
      usuario_id: contact.usuario_id || currentUserDB.id,
      valor_estimado: 120000,
      fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fecha_proximo_seguimiento: new Date(Date.now() + 86400000 * 2).toISOString().replace('T', ' ').slice(0, 16),
      notas: `Oportunidad generada a partir del contacto corporativo. Interés en ${contact.producto_interes || 'ITHOT System'}.`,
      etiquetas: contact.etiquetas || 'ITHOT System, Facturación Electrónica',
      contacto_id: contact.id,
      naturaleza_negocio: contact.naturaleza_negocio,
      producto_interes: contact.producto_interes,
      modulo_interes: contact.modulo_interes,
      direccion: contact.direccion,
      ciudad: contact.ciudad,
      provincia: contact.provincia,
      ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      prospectos: [newLead, ...prev.prospectos],
      contactos: prev.contactos.map((c) =>
        c.id === contact.id ? { ...c, estado_comercial: 'En Negociación' } : c
      ),
    }));

    recordAuditAndNotify(
      'Creación',
      'Pipeline',
      `${contact.empresa} - ${contact.nombre}`,
      `Convirtió el contacto en oportunidad comercial activa en el Pipeline Kanban.`,
      'nuevo_prospecto',
      'Oportunidad generada desde Contactos'
    );

    setActiveSection('pipeline');
  };

  // Prospectos Handlers (INSERT / UPDATE)
  const handleSaveLead = (leadData: Partial<Lead>) => {
    const isNew = !leadData.id;
    const rawId = isNew ? Date.now() : Number(leadData.id);
    const targetUserId = leadData.assignedTo
      ? Number(leadData.assignedTo.replace('usr-', ''))
      : currentUserDB.id;
    const targetEtapa = etapas.find((e) => e.nombre === leadData.stage) || etapas[0];
    const [nombre, ...apellidoParts] = (leadData.name || 'Nuevo Prospecto').split(' ');
    const apellido = apellidoParts.join(' ');

    setDbState((prev) => {
      let updatedProspectos: ProspectoDB[];
      if (isNew) {
        const newProspecto: ProspectoDB = {
          id: rawId,
          nombre,
          apellido,
          empresa: leadData.company || 'Empresa Dominicana',
          cargo: (leadData as any).cargo || 'Gerente General',
          email: leadData.email || '',
          telefono: leadData.phone || '+1 809-567-0000',
          whatsapp: (leadData as any).whatsapp || leadData.phone || '+1 829-000-0000',
          fuente: leadData.source || 'Sitio Web',
          etapa_id: targetEtapa.id,
          usuario_id: targetUserId,
          valor_estimado: leadData.estimatedValue || 0,
          fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
          fecha_proximo_seguimiento: leadData.nextFollowUpDate || null,
          notas: leadData.notes || '',
          etiquetas: (leadData.tags || []).join(', ') || 'Prospecto, ITHOT System',
          naturaleza_negocio: (leadData as any).naturaleza_negocio || 'Comercial / Empresarial',
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
                empresa: leadData.company || p.empresa,
                cargo: (leadData as any).cargo || p.cargo,
                email: leadData.email || p.email,
                telefono: leadData.phone || p.telefono,
                whatsapp: (leadData as any).whatsapp || p.whatsapp,
                fuente: leadData.source || p.fuente,
                etapa_id: targetEtapa.id,
                usuario_id: targetUserId,
                valor_estimado: leadData.estimatedValue || p.valor_estimado,
                fecha_proximo_seguimiento: leadData.nextFollowUpDate || null,
                notas: leadData.notes || p.notas,
                etiquetas: (leadData.tags || []).join(', ') || p.etiquetas,
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
        if (c.empresa.toLowerCase() === (leadData.company || '').toLowerCase()) {
          return {
            ...c,
            empresa: leadData.company || c.empresa,
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

    recordAuditAndNotify(
      isNew ? 'Creación' : 'Actualización',
      'Prospectos',
      leadData.company || 'Oportunidad ITHOT',
      `${isNew ? 'Creó' : 'Actualizó'} la oportunidad comercial por RD$ ${(leadData.estimatedValue || 0).toLocaleString()}.`,
      isNew ? 'nuevo_prospecto' : 'prospecto_actualizado',
      isNew ? 'Nueva oportunidad comercial' : 'Oportunidad actualizada'
    );
  };

  // Eliminar Prospecto (Soft Delete a Papelera de Reciclaje)
  const handleDeleteLead = (leadIdStr: string) => {
    const rawId = Number(leadIdStr.replace('lead-', ''));
    const target = prospectos.find((p) => p.id === rawId);
    if (!target) return;

    const trashRecord: RegistroPapeleraDB = {
      id: Date.now(),
      entidad_tipo: 'Prospecto',
      entidad_id: rawId,
      titulo: `${target.nombre} ${target.apellido} (${target.empresa})`,
      detalles: `Valor estimado: RD$ ${target.valor_estimado.toLocaleString()} • ${target.producto_interes || 'ITHOT System'}`,
      datos_json: JSON.stringify(target),
      usuario_elimino: currentUserDB.nombre,
      fecha_eliminacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      prospectos: prev.prospectos.filter((p) => p.id !== rawId),
      papelera: [trashRecord, ...prev.papelera],
    }));

    if (selectedLeadId === rawId) {
      setIsLeadDrawerOpen(false);
      setSelectedLeadId(null);
    }

    recordAuditAndNotify(
      'Eliminación',
      'Prospectos',
      target?.empresa || `Prospecto #${rawId}`,
      `Movió la oportunidad comercial a la papelera de reciclaje.`
    );
  };

  // Empresa Handlers (Módulo Empresas)
  const handleSaveCompany = (companyData: Omit<EmpresaDB, 'id'>, id?: number) => {
    const isNew = !id;
    const companyId = id || (empresas.length > 0 ? Math.max(...empresas.map((e) => e.id)) + 1 : 1);
    const newCompany: EmpresaDB = {
      ...companyData,
      id: companyId,
    };

    setDbState((prev) => ({
      ...prev,
      empresas: isNew
        ? [newCompany, ...prev.empresas]
        : prev.empresas.map((e) => (e.id === companyId ? newCompany : e)),
    }));

    recordAuditAndNotify(
      isNew ? 'Creación' : 'Actualización',
      'Configuración',
      newCompany.razon_social,
      `${isNew ? 'Registró nueva' : 'Actualizó datos de la'} empresa: ${newCompany.razon_social} (RNC: ${newCompany.rnc}).`
    );
  };

  const handleDeleteCompany = (id: number) => {
    const target = empresas.find((e) => e.id === id);
    if (!target) return;

    const trashRecord: RegistroPapeleraDB = {
      id: Date.now(),
      entidad_tipo: 'Empresa',
      entidad_id: id,
      titulo: target.razon_social,
      detalles: `RNC: ${target.rnc} • ${target.ciudad} • ${target.industria}`,
      datos_json: JSON.stringify(target),
      usuario_elimino: currentUserDB.nombre,
      fecha_eliminacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => ({
      ...prev,
      empresas: prev.empresas.filter((e) => e.id !== id),
      papelera: [trashRecord, ...prev.papelera],
    }));

    if (selectedCompany?.id === id) {
      setIsCompanyDrawerOpen(false);
      setSelectedCompany(null);
    }

    recordAuditAndNotify(
      'Eliminación',
      'Configuración',
      target.razon_social,
      `Movió la empresa "${target.razon_social}" a la papelera de reciclaje.`
    );
  };

  // Papelera Handlers (Restaurar / Eliminar Definitivamente)
  const handleRestoreTrash = (item: RegistroPapeleraDB) => {
    try {
      const parsedData = JSON.parse(item.datos_json);
      setDbState((prev) => {
        const updated = { ...prev, papelera: prev.papelera.filter((p) => p.id !== item.id) };

        if (item.entidad_tipo === 'Empresa') {
          updated.empresas = [parsedData, ...prev.empresas];
        } else if (item.entidad_tipo === 'Contacto') {
          updated.contactos = [parsedData, ...prev.contactos];
        } else if (item.entidad_tipo === 'Prospecto') {
          updated.prospectos = [parsedData, ...prev.prospectos];
        } else if (item.entidad_tipo === 'Tarea') {
          updated.tareas = [parsedData, ...prev.tareas];
        }

        return updated;
      });

      recordAuditAndNotify(
        'Creación',
        'Configuración',
        item.titulo,
        `Restauró el registro "${item.titulo}" desde la papelera de reciclaje.`
      );
    } catch (e) {
      console.error('Error restaurando registro', e);
    }
  };

  const handlePermanentDelete = (id: number) => {
    setDbState((prev) => ({
      ...prev,
      papelera: prev.papelera.filter((p) => p.id !== id),
    }));

    recordAuditAndNotify(
      'Eliminación',
      'Configuración',
      `Registro Papelera #${id}`,
      `Eliminó permanentemente un registro de la papelera.`
    );
  };

  const handleEmptyTrash = () => {
    setDbState((prev) => ({
      ...prev,
      papelera: [],
    }));

    recordAuditAndNotify(
      'Eliminación',
      'Configuración',
      'Papelera Completa',
      `Vació definitivamente todos los registros de la papelera.`
    );
  };

  // Objetivos Comerciales Handlers
  const handleSaveObjetivo = (objData: Omit<ObjetivoComercialDB, 'id'>, id?: number) => {
    const isNew = !id;
    const objId = id || (objetivos.length > 0 ? Math.max(...objetivos.map((o) => o.id)) + 1 : 1);
    const newObj: ObjetivoComercialDB = {
      ...objData,
      id: objId,
    };

    setDbState((prev) => ({
      ...prev,
      objetivos: isNew
        ? [newObj, ...prev.objetivos]
        : prev.objetivos.map((o) => (o.id === objId ? newObj : o)),
    }));

    recordAuditAndNotify(
      isNew ? 'Creación' : 'Actualización',
      'Configuración',
      newObj.titulo,
      `${isNew ? 'Definió' : 'Actualizó'} objetivo comercial: ${newObj.titulo}.`
    );
  };

  const handleDeleteObjetivo = (id: number) => {
    setDbState((prev) => ({
      ...prev,
      objetivos: prev.objetivos.filter((o) => o.id !== id),
    }));
  };

  // Comentarios & Adjuntos Handlers
  const handleAddComentario = (c: Omit<ComentarioDB, 'id'>) => {
    const newId = comentarios.length > 0 ? Math.max(...comentarios.map((x) => x.id)) + 1 : 1;
    const newComment: ComentarioDB = { ...c, id: newId };
    setDbState((prev) => ({
      ...prev,
      comentarios: [newComment, ...prev.comentarios],
    }));

    recordAuditAndNotify(
      'Creación',
      'Configuración',
      `Nota sobre ${c.entidad_tipo}`,
      `${c.usuario_nombre} agregó un comentario: "${c.texto.slice(0, 45)}..."`
    );
  };

  const handleAddAdjunto = (a: Omit<AdjuntoDB, 'id'>) => {
    const newId = adjuntos.length > 0 ? Math.max(...adjuntos.map((x) => x.id)) + 1 : 1;
    const newAttachment: AdjuntoDB = { ...a, id: newId };
    setDbState((prev) => ({
      ...prev,
      adjuntos: [newAttachment, ...prev.adjuntos],
    }));

    recordAuditAndNotify(
      'Creación',
      'Configuración',
      a.nombre_archivo,
      `${a.usuario_nombre} adjuntó el archivo ${a.nombre_archivo} (${a.tipo_archivo}).`
    );
  };

  const handleDeleteComentario = (id: number) => {
    setDbState((prev) => ({
      ...prev,
      comentarios: prev.comentarios.filter((c) => c.id !== id),
    }));
  };

  const handleDeleteAdjunto = (id: number) => {
    setDbState((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((a) => a.id !== id),
    }));
  };

  // Global Search Navigation
  const handleSelectEntityFromSearch = (
    type: 'empresa' | 'contacto' | 'prospecto' | 'usuario',
    id: number,
    section: SeccionApp
  ) => {
    setActiveSection(section);
    if (type === 'empresa') {
      const found = empresas.find((e) => e.id === id);
      if (found) {
        setSelectedCompany(found);
        setIsCompanyDrawerOpen(true);
      }
    } else if (type === 'contacto') {
      const found = contactos.find((c) => c.id === id);
      if (found) {
        setSelectedContact(found);
        setIsContactDrawerOpen(true);
      }
    } else if (type === 'prospecto') {
      setSelectedLeadId(id);
      setIsLeadDrawerOpen(true);
    } else if (type === 'usuario') {
      handleSelectUser(id);
    }
  };

  // MySQL Dump Download Handler
  const handleDownloadMySQL = () => {
    const link = document.createElement('a');
    link.href = '/api/mysql-dump';
    link.download = 'crm_comercial_mysql.sql';
    link.click();
  };

  // Mover Etapa en Pipeline Kanban
  const handleUpdateLeadStage = (leadIdStr: string, newStageName: LeadStage) => {
    const rawId = Number(leadIdStr.replace('lead-', ''));
    const targetEtapa = etapas.find((e) => e.nombre === newStageName);
    if (!targetEtapa) return;

    const currentLead = prospectos.find((p) => p.id === rawId);
    if (!currentLead || currentLead.etapa_id === targetEtapa.id) return;

    setDbState((prev) => {
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

    recordAuditAndNotify(
      'Cambio de Etapa',
      'Pipeline',
      currentLead.empresa,
      `Movió la oportunidad a la etapa "${targetEtapa.nombre}".`,
      'oportunidad_movida',
      'Oportunidad avanzada de etapa'
    );
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
              ultima_interaccion: `${activityData.date} ${activityData.time}:00`,
              fecha_proximo_seguimiento: activityData.nextFollowUpDate || p.fecha_proximo_seguimiento,
            }
          : p
      ),
    }));

    recordAuditAndNotify(
      'Creación',
      'Seguimientos',
      activityData.leadName,
      `Registró seguimiento (${activityData.type}) con resultado: ${activityData.result}.`,
      'nuevo_seguimiento',
      'Nuevo seguimiento registrado'
    );
  };

  // Guardar Tarea
  const handleSaveTask = (taskData: Partial<Task>) => {
    const isNew = !taskData.id;
    const rawId = isNew ? Date.now() : Number(taskData.id?.replace('tsk-', ''));
    const rawLeadId = taskData.leadId ? Number(taskData.leadId.replace('lead-', '')) : null;
    const targetUserId = taskData.assignedTo ? Number(taskData.assignedTo.replace('usr-', '')) : currentUserDB.id;

    const newTask: TareaDB = {
      id: rawId,
      titulo: taskData.title || 'Nueva Tarea',
      descripcion: taskData.description || '',
      prospecto_id: rawLeadId,
      usuario_id: targetUserId,
      fecha_limite: taskData.dueDate || new Date().toISOString().split('T')[0],
      hora_limite: taskData.dueTime || '17:00',
      prioridad: (taskData.priority || 'Media') as any,
      estado: (taskData.status || 'Pendiente') as any,
      fecha_creacion: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setDbState((prev) => {
      const updated = isNew
        ? [newTask, ...prev.tareas]
        : prev.tareas.map((t) => (t.id === rawId ? newTask : t));
      return { ...prev, tareas: updated };
    });

    recordAuditAndNotify(
      isNew ? 'Creación' : 'Actualización',
      'Tareas',
      newTask.titulo,
      `${isNew ? 'Programó' : 'Actualizó'} tarea con prioridad ${newTask.prioridad}.`
    );
  };

  const handleToggleTaskStatus = (taskIdStr: string) => {
    const rawId = Number(taskIdStr.replace('tsk-', ''));
    setDbState((prev) => ({
      ...prev,
      tareas: prev.tareas.map((t) =>
        t.id === rawId
          ? {
              ...t,
              estado: t.estado === 'Completada' ? 'Pendiente' : 'Completada',
              fecha_completada: t.estado === 'Completada' ? null : new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
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

  // User Management Handlers (Administradora General Yenifer Reina Sena Suero)
  const handleSaveUser = (userData: UsuarioDB) => {
    const isNew = !dbState.usuarios.some((u) => u.id === userData.id);
    setDbState((prev) => {
      const updated = isNew
        ? [...prev.usuarios, userData]
        : prev.usuarios.map((u) => (u.id === userData.id ? userData : u));
      return {
        ...prev,
        usuarios: updated,
      };
    });

    recordAuditAndNotify(
      isNew ? 'Creación' : 'Actualización',
      'Usuarios y Roles',
      userData.nombre,
      `${isNew ? 'Creó nuevo usuario' : 'Actualizó datos de usuario'} con rol: ${userData.rol}.`,
      isNew ? 'nuevo_usuario' : undefined,
      isNew ? 'Nuevo usuario incorporado' : undefined
    );
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === 1) {
      alert('No es posible eliminar al Administrador General (Yenifer Reina Sena Suero).');
      return;
    }
    const target = usuarios.find((u) => u.id === userId);
    setDbState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.filter((u) => u.id !== userId),
    }));

    recordAuditAndNotify(
      'Eliminación',
      'Usuarios y Roles',
      target?.nombre || `Usuario #${userId}`,
      `Eliminó al usuario de la plataforma comercial.`
    );
  };

  const handleToggleUserStatus = (userId: number) => {
    const target = usuarios.find((u) => u.id === userId);
    const newStatus = !target?.activo;

    setDbState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) =>
        u.id === userId ? { ...u, activo: !u.activo } : u
      ),
    }));

    recordAuditAndNotify(
      'Activación / Desactivación',
      'Usuarios y Roles',
      target?.nombre || `Usuario #${userId}`,
      `Cambió el estado del usuario a: ${newStatus ? 'Activo' : 'Inactivo'}.`
    );
  };

  const handleResetPassword = (userId: number, newPassword: string) => {
    const target = usuarios.find((u) => u.id === userId);
    setDbState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) =>
        u.id === userId ? { ...u, password_plain: newPassword, password_hash: '$2b$12$ITHOT_UPDATED...' } : u
      ),
    }));

    recordAuditAndNotify(
      'Restablecimiento de Contraseña',
      'Usuarios y Roles',
      target?.nombre || `Usuario #${userId}`,
      `Restableció la contraseña de acceso al CRM.`
    );
  };

  const handleSaveBatchUsers = (newUsers: UsuarioDB[]) => {
    setDbState((prev) => ({
      ...prev,
      usuarios: [...prev.usuarios, ...newUsers],
    }));

    recordAuditAndNotify(
      'Creación',
      'Usuarios y Roles',
      `Lote de ${newUsers.length} Usuarios`,
      `Creó ${newUsers.length} usuarios comerciales para la empresa ITHOT.`,
      'nuevo_usuario',
      'Nuevos usuarios creados'
    );
  };

  const handleCreateSubcuenta = (newSub: SubcuentaDB) => {
    setDbState((prev) => ({
      ...prev,
      subcuentas: [...prev.subcuentas, newSub],
    }));

    recordAuditAndNotify(
      'Creación',
      'Configuración',
      newSub.nombre,
      `Creó nueva subcuenta/sucursal: ${newSub.nombre} (${newSub.codigo}).`
    );
  };

  // Importar Prospectos masivamente desde Excel / CSV con Upsert y Deduplicación
  const handleImportProspectos = (incoming: ProspectoDB[]) => {
    setDbState((prev) => {
      let currentProspectos = [...prev.prospectos];
      let currentContactos = [...prev.contactos];

      let createdCount = 0;
      let updatedCount = 0;

      incoming.forEach((item, idx) => {
        const itemEmail = (item.email || '').trim().toLowerCase();
        const itemEmpresa = (item.empresa || '').trim().toLowerCase();
        const itemFullName = `${item.nombre} ${item.apellido}`.trim().toLowerCase();

        // 1. Prospectos deduplication & upsert
        const existingProspectoIdx = currentProspectos.findIndex((p) => {
          const pEmail = (p.email || '').trim().toLowerCase();
          const pEmpresa = (p.empresa || '').trim().toLowerCase();
          const pFullName = `${p.nombre} ${p.apellido}`.trim().toLowerCase();

          return (
            (itemEmail && pEmail && itemEmail === pEmail) ||
            (itemEmpresa && pEmpresa && itemEmpresa === pEmpresa) ||
            (itemFullName && pFullName && itemFullName === pFullName)
          );
        });

        if (existingProspectoIdx >= 0) {
          const old = currentProspectos[existingProspectoIdx];
          const mergedTags = Array.from(
            new Set([
              ...(old.etiquetas ? old.etiquetas.split(',').map((t) => t.trim()) : []),
              ...(item.etiquetas ? item.etiquetas.split(',').map((t) => t.trim()) : []),
            ])
          ).join(', ');

          currentProspectos[existingProspectoIdx] = {
            ...old,
            nombre: item.nombre || old.nombre,
            apellido: item.apellido || old.apellido,
            empresa: item.empresa || old.empresa,
            cargo: item.cargo || old.cargo,
            email: item.email || old.email,
            telefono: item.telefono || old.telefono,
            whatsapp: item.whatsapp || old.whatsapp || old.telefono,
            valor_estimado: item.valor_estimado || old.valor_estimado,
            notas: item.notas ? `${old.notas ? old.notas + ' | ' : ''}${item.notas}` : old.notas,
            etiquetas: mergedTags,
            ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
          updatedCount++;
        } else {
          currentProspectos = [item, ...currentProspectos];
          createdCount++;
        }

        // 2. Contactos deduplication & upsert
        const existingContactoIdx = currentContactos.findIndex((c) => {
          const cEmail = (c.email || '').trim().toLowerCase();
          const cEmpresa = (c.empresa || '').trim().toLowerCase();
          const cFullName = `${c.nombre} ${c.apellido}`.trim().toLowerCase();

          return (
            (itemEmail && cEmail && itemEmail === cEmail) ||
            (itemEmpresa && cEmpresa && itemEmpresa === cEmpresa) ||
            (itemFullName && cFullName && itemFullName === cFullName)
          );
        });

        if (existingContactoIdx >= 0) {
          const oldC = currentContactos[existingContactoIdx];
          const mergedTags = Array.from(
            new Set([
              ...(oldC.etiquetas ? oldC.etiquetas.split(',').map((t) => t.trim()) : []),
              ...(item.etiquetas ? item.etiquetas.split(',').map((t) => t.trim()) : []),
            ])
          ).join(', ');

          currentContactos[existingContactoIdx] = {
            ...oldC,
            nombre: item.nombre || oldC.nombre,
            apellido: item.apellido || oldC.apellido,
            empresa: item.empresa || oldC.empresa,
            cargo: item.cargo || oldC.cargo,
            email: item.email || oldC.email,
            telefono: item.telefono || oldC.telefono,
            whatsapp: item.whatsapp || oldC.whatsapp || oldC.telefono,
            etiquetas: mergedTags,
            observaciones: item.notas ? `${oldC.observaciones ? oldC.observaciones + ' | ' : ''}${item.notas}` : oldC.observaciones,
            ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };
        } else {
          const newContacto: ContactoDB = {
            id: Date.now() + 5000 + idx,
            nombre: item.nombre,
            apellido: item.apellido,
            empresa: item.empresa,
            cargo: item.cargo || 'Encargado Comercial',
            email: item.email || '',
            telefono: item.telefono,
            whatsapp: item.whatsapp || item.telefono,
            direccion: 'Distrito Nacional / Gran Santo Domingo',
            ciudad: 'Santo Domingo',
            provincia: 'Distrito Nacional',
            naturaleza_negocio: 'Comercial / Empresarial',
            usuario_id: item.usuario_id || 1,
            fecha_registro: new Date().toISOString().replace('T', ' ').slice(0, 19),
            ultima_interaccion: new Date().toISOString().replace('T', ' ').slice(0, 19),
            proximo_seguimiento: item.fecha_proximo_seguimiento || null,
            estado_comercial: 'En Proceso',
            observaciones: item.notas || 'Contacto registrado automáticamente desde importación Excel.',
            etiquetas: item.etiquetas || 'Cliente, ITHOT System',
            producto_interes: 'ITHOT System',
            modulo_interes: 'Inventario y POS',
          };
          currentContactos = [newContacto, ...currentContactos];
        }
      });

      return {
        ...prev,
        prospectos: currentProspectos,
        contactos: currentContactos,
      };
    });

    recordAuditAndNotify(
      'Importación',
      'Importaciones',
      `Lote de ${incoming.length} registros`,
      `Procesó archivo Excel con actualización automática y deduplicación.`,
      'nueva_importacion',
      'Importación masiva completada'
    );
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

    recordAuditAndNotify(
      'Exportación',
      'Exportaciones',
      audit.archivo_generado,
      `Exportó datos (${audit.tipo}) en formato ${audit.formato}.`
    );
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    setDbState(loadRelationalData());
    setCurrentRole('Administrador General');
    setSelectedLeadId(null);
    setIsLeadDrawerOpen(false);
    setSelectedContact(null);
    setIsContactDrawerOpen(false);
  };

  const pendingTasksCount = tareas.filter((t) => t.estado === 'Pendiente').length;
  const unreadNotifsCount = notificaciones.filter((n) => !n.leida).length;

  const sectionTitles: Record<SeccionApp, string> = {
    dashboard: 'Dashboard Principal',
    empresas: 'Directorio y Gestión de Empresas Comerciales',
    contactos: 'Directorio y Gestión de Contactos (Empresas y Personas)',
    prospectos: 'Directorio y Gestión de Prospectos',
    pipeline: 'Pipeline Comercial (Tablero Kanban)',
    seguimientos: 'Módulo de Seguimientos Multicanal',
    tareas: 'Módulo de Tareas Comerciales',
    calendario: 'Calendario Comercial',
    objetivos: 'Objetivos & Metas Comerciales (Septiembre 2026)',
    actividad: 'Actividad Reciente del Sistema en Vivo',
    reportes: 'Módulo de Reportes y Analítica',
    papelera: 'Papelera de Reciclaje y Restauración de Registros',
    importaciones: 'Módulo Independiente de Importaciones (Excel / CSV)',
    exportaciones: 'Módulo Independiente de Exportaciones',
    usuarios: 'Gestión de Usuarios, Subcuentas y Roles (RBAC)',
    auditoria: 'Auditoría del Sistema y Registro de Actividad',
    configuracion: 'Configuración del Sistema',
    documentacion: 'Documentación Técnica y Arquitectura de Software',
  };

  // IF NOT AUTHENTICATED: Display Professional Login Screen
  if (!isAuthenticated) {
    return <LoginView users={usuarios} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* MENÚ LATERAL IZQUIERDO (Escritorio y Cajón Móvil) */}
      <AppSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUserDB}
        onRoleChange={handleRoleChange}
        empresasCount={empresas.length}
        contactosCount={contactos.length}
        prospectosCount={prospectos.length}
        tareasPendientesCount={pendingTasksCount}
        papeleraCount={papelera.length}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        allUsers={usuarios}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-950">
        {/* Top Institutional Header Bar with Global Search */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Hamburger button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5 text-blue-400" />
            </button>

            <span className="text-blue-400 font-bold text-xs tracking-wider font-mono hidden sm:inline">
              ITHOT
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <h1 className="text-xs sm:text-base font-bold text-white tracking-tight truncate max-w-[150px] lg:max-w-[280px]">
              {sectionTitles[activeSection]}
            </h1>
          </div>

          {/* Global Search Bar (Central) */}
          <div className="flex-1 max-w-sm hidden md:block">
            <GlobalSearchBar
              empresas={empresas}
              contactos={contactos}
              prospectos={prospectos}
              usuarios={usuarios}
              onSelectEntity={handleSelectEntityFromSearch}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Download MySQL Dump Schema */}
            <button
              onClick={handleDownloadMySQL}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-lg transition-colors cursor-pointer"
              title="Descargar base de datos relacional MySQL 8.0 (.sql)"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Esquema MySQL (.sql)</span>
            </button>

            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 rounded-lg transition-colors cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Proyecto de Posgrado</span>
            </button>

            {/* Quick Company Button */}
            <button
              onClick={() => {
                setCompanyToEdit(null);
                setIsCreateCompanyModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Empresa</span>
            </button>

            {/* Quick Opportunity Button */}
            <button
              onClick={() => {
                setLeadToEdit(null);
                setIsCreateLeadModalOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ Oportunidad</span>
              <span className="xs:hidden">+ Lead</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Centro de Notificaciones en Tiempo Real"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Active User Switcher & Status Badge */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="En línea" />
              <select
                value={currentUserDB.id}
                onChange={(e) => handleSelectUser(Number(e.target.value))}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[170px] truncate"
                title="Cambiar usuario activo (Permite que cualquier compañero trabaje en el CRM)"
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Viewport Router with bottom padding on mobile */}
        <main className="flex-1 overflow-y-auto bg-slate-950 pb-20 md:pb-0">
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
              totalClientes={contactos.length}
              lastImport={historialImportaciones[0] || null}
              lastExport={historialExportaciones[0] || null}
              activeUsersCount={usuarios.filter((u) => u.activo).length}
              objetivos={objetivos}
              recentActivities={registrosAuditoria}
            />
          )}

          {/* Módulo: Empresas Comerciales */}
          {activeSection === 'empresas' && (
            <CompaniesView
              companies={empresas}
              contacts={contactos}
              prospects={prospectos}
              users={usuarios}
              currentRole={currentRole}
              currentUserId={currentUserDB.id}
              onOpenCreateCompanyModal={() => {
                setCompanyToEdit(null);
                setIsCreateCompanyModalOpen(true);
              }}
              onOpenEditCompanyModal={(comp) => {
                setCompanyToEdit(comp);
                setIsCreateCompanyModalOpen(true);
              }}
              onOpenCompanyDrawer={(comp) => {
                setSelectedCompany(comp);
                setIsCompanyDrawerOpen(true);
              }}
              onDeleteCompany={handleDeleteCompany}
            />
          )}

          {/* Módulo 2: Contactos */}
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

          {/* Módulo 4: Pipeline Comercial Kanban */}
          {activeSection === 'pipeline' && (
            <PipelineView
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
              onSelectLead={handleOpenLeadDrawer}
              onUpdateLeadStage={handleUpdateLeadStage}
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
              onSelectLeadById={(leadId) => {
                setSelectedLeadId(Number(leadId));
                setIsLeadDrawerOpen(true);
              }}
            />
          )}

          {/* Módulo 6: Tareas */}
          {activeSection === 'tareas' && (
            <TasksView
              tasks={tareasAdaptadas}
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
              onOpenCreateTaskModal={() => setIsCreateTaskModalOpen(true)}
              onToggleTaskStatus={handleToggleTaskStatus}
              onDeleteTask={handleDeleteTask}
              onSelectLeadById={(leadId) => {
                setSelectedLeadId(Number(leadId));
                setIsLeadDrawerOpen(true);
              }}
            />
          )}

          {/* Módulo 7: Calendario */}
          {activeSection === 'calendario' && (
            <CalendarView
              leads={prospectosAdaptados}
              users={usuariosAdaptados}
              onOpenCreateActivityModal={() => setIsCreateActivityModalOpen(true)}
              onSelectLeadById={(leadId) => {
                setSelectedLeadId(Number(leadId));
                setIsLeadDrawerOpen(true);
              }}
            />
          )}

          {/* Módulo: Objetivos Comerciales */}
          {activeSection === 'objetivos' && (
            <GoalsView
              objetivos={objetivos}
              users={usuarios}
              currentRole={currentRole}
              onSaveObjetivo={handleSaveObjetivo}
              onDeleteObjetivo={handleDeleteObjetivo}
            />
          )}

          {/* Módulo: Actividad Reciente del Sistema */}
          {activeSection === 'actividad' && (
            <LiveActivityView
              auditLogs={registrosAuditoria}
              users={usuarios}
            />
          )}

          {/* Módulo: Papelera de Reciclaje */}
          {activeSection === 'papelera' && (
            <TrashView
              papelera={papelera}
              currentRole={currentRole}
              onRestore={handleRestoreTrash}
              onPermanentDelete={handlePermanentDelete}
              onEmptyTrash={handleEmptyTrash}
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
              currentUserId={currentUserDB.id}
              subcuentas={subcuentas}
              onRoleChange={(r) => handleRoleChange(r)}
              onSelectUser={handleSelectUser}
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
              onResetPassword={handleResetPassword}
              onSaveBatchUsers={handleSaveBatchUsers}
              onCreateSubcuenta={handleCreateSubcuenta}
            />
          )}

          {/* Módulo: Auditoría del Sistema */}
          {activeSection === 'auditoria' && (
            <AuditView auditLogs={registrosAuditoria} />
          )}

          {/* Módulo 12: Configuración */}
          {activeSection === 'configuracion' && (
            <SettingsView
              users={usuarios}
              subcuentas={subcuentas}
              etiquetasConfig={etiquetasConfig}
              camposPersonalizados={camposPersonalizados}
              onUpdateEtiquetas={(tags) =>
                setDbState((prev) => ({ ...prev, etiquetasConfig: tags }))
              }
              onUpdateCampos={(campos) =>
                setDbState((prev) => ({ ...prev, camposPersonalizados: campos }))
              }
              onOpenCreateUserModal={() => {
                setUserToEdit(null);
                setIsCreateUserModalOpen(true);
              }}
              onNavigateSection={(sec) => setActiveSection(sec)}
              onResetDemoData={handleResetDemoData}
            />
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

        {/* Barra de Navegación Inferior para Dispositivos Móviles */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors p-1 cursor-pointer ${
              activeSection === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Inicio</span>
          </button>
          <button
            onClick={() => setActiveSection('contactos')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors p-1 cursor-pointer ${
              activeSection === 'contactos' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Contact className="w-4 h-4" />
            <span>Contactos</span>
          </button>
          <button
            onClick={() => setActiveSection('prospectos')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors p-1 cursor-pointer ${
              activeSection === 'prospectos' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Prospectos</span>
          </button>
          <button
            onClick={() => setActiveSection('pipeline')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors p-1 cursor-pointer ${
              activeSection === 'pipeline' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Pipeline</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-400 hover:text-blue-400 transition-colors p-1 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Menú</span>
          </button>
        </div>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notificaciones}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearRead={handleClearRead}
        onNavigateSection={(sec) => setActiveSection(sec)}
      />

      {/* Empresa Drawer (Ficha Técnica de Empresa Comercial) */}
      <CompanyDrawer
        company={selectedCompany}
        isOpen={isCompanyDrawerOpen}
        onClose={() => {
          setIsCompanyDrawerOpen(false);
          setSelectedCompany(null);
        }}
        onEdit={(comp) => {
          setCompanyToEdit(comp);
          setIsCreateCompanyModalOpen(true);
        }}
        onDelete={handleDeleteCompany}
        users={usuarios}
        contacts={contactos}
        prospects={prospectos}
        followups={seguimientos}
        currentUser={currentUserDB}
        comentarios={comentarios}
        adjuntos={adjuntos}
        onAddComentario={handleAddComentario}
        onAddAdjunto={handleAddAdjunto}
        auditLogs={registrosAuditoria}
        onSelectContact={(c) => {
          setSelectedContact(c);
          setIsContactDrawerOpen(true);
        }}
        onSelectProspect={(p) => {
          setSelectedLeadId(p.id);
          setIsLeadDrawerOpen(true);
        }}
      />

      {/* Modal: Crear / Editar Empresa */}
      <CompanyModal
        isOpen={isCreateCompanyModalOpen}
        onClose={() => {
          setIsCreateCompanyModalOpen(false);
          setCompanyToEdit(null);
        }}
        onSave={handleSaveCompany}
        companyToEdit={companyToEdit}
        users={usuarios}
      />

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
        currentUser={currentUserDB}
        comentarios={comentarios}
        adjuntos={adjuntos}
        onAddComentario={handleAddComentario}
        onAddAdjunto={handleAddAdjunto}
        auditLogs={registrosAuditoria}
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
        comentarios={comentarios}
        adjuntos={adjuntos}
        onAddComentario={handleAddComentario}
        onAddAdjunto={handleAddAdjunto}
        auditLogs={registrosAuditoria}
        currentUserDB={currentUserDB}
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

      {/* Modal: Crear / Editar Usuario (Administradora General Yenifer Reina Sena Suero) */}
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
