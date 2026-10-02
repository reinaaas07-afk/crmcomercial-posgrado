import { Lead, Activity, Task, User, CalendarEvent, LeadStage } from '../types/crm';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Ing. Yenifer Sena',
    email: 'yenifer.sena@universidad.edu.mx',
    role: 'Administrador',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+52 55 1234 5678',
    activeLeadsCount: 14,
    conversionRate: 28.5,
  },
  {
    id: 'usr-2',
    name: 'Valeria Rojas',
    email: 'valeria.rojas@crmcomercial.com',
    role: 'Supervisor Comercial',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+52 55 8765 4321',
    activeLeadsCount: 18,
    conversionRate: 31.0,
  },
  {
    id: 'usr-3',
    name: 'Mateo Silva',
    email: 'mateo.silva@crmcomercial.com',
    role: 'Asesor Comercial',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+52 55 9876 5432',
    activeLeadsCount: 22,
    conversionRate: 24.2,
  },
  {
    id: 'usr-4',
    name: 'Camila Herrera',
    email: 'camila.herrera@crmcomercial.com',
    role: 'Asesor Comercial',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+52 55 4567 8901',
    activeLeadsCount: 19,
    conversionRate: 27.8,
  },
];

export const PIPELINE_STAGES: LeadStage[] = [
  'Nuevo Lead',
  'Contactado',
  'Interesado',
  'Reunión Agendada',
  'Propuesta Enviada',
  'Negociación',
  'Ganado',
  'Perdido',
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-01',
    name: 'Alejandro Morales',
    company: 'Logística & Envíos Norte',
    email: 'amorales@logisticanorte.com',
    phone: '+52 81 1234 9876',
    source: 'Meta Ads',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    stage: 'Nuevo Lead',
    createdAt: '2026-09-28',
    nextFollowUpDate: '2026-09-28 11:30',
    estimatedValue: 4800,
    tags: ['Urgente', 'Pyme'],
    notes: 'Descargó catálogo de servicios B2B desde campaña de Facebook.',
    attachments: [
      { id: 'att-1', name: 'Requerimientos_Logistica.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: '2026-09-28' },
    ],
  },
  {
    id: 'lead-02',
    name: 'Beatriz Delgado',
    company: 'Grupo Industrial Alfa',
    email: 'bdelgado@grupoalfa.mx',
    phone: '+52 55 4433 2211',
    source: 'LinkedIn',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    stage: 'Contactado',
    createdAt: '2026-09-27',
    nextFollowUpDate: '2026-09-29 10:00',
    estimatedValue: 12500,
    tags: ['Corporativo', 'Decisor Clave'],
    notes: 'Primer contacto vía WhatsApp respondido positivamente. Requiere demo ejecutiva.',
    attachments: [],
  },
  {
    id: 'lead-03',
    name: 'Rodrigo Espinoza',
    company: 'Finanzas & Capital SA',
    email: 'rodrigo.espinoza@fincapital.com',
    phone: '+52 33 9988 7766',
    source: 'Google Ads',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    stage: 'Interesado',
    createdAt: '2026-09-25',
    nextFollowUpDate: '2026-09-29 16:00',
    estimatedValue: 8200,
    tags: ['Presupuesto Alto', 'Fintech'],
    notes: 'Evalúan solución para 15 ejecutivos de cuenta.',
    attachments: [
      { id: 'att-2', name: 'Alcance_Preliminar.docx', size: '420 KB', type: 'application/msword', uploadedAt: '2026-09-26' },
    ],
  },
  {
    id: 'lead-04',
    name: 'Daniela Salgado',
    company: 'Soluciones Tecnológicas Nova',
    email: 'daniela.s@novatech.io',
    phone: '+52 55 6789 0123',
    source: 'Sitio Web',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    stage: 'Reunión Agendada',
    createdAt: '2026-09-24',
    nextFollowUpDate: '2026-09-29 11:00',
    estimatedValue: 15400,
    tags: ['Corporativo', 'Prioridad'],
    notes: 'Reunión agendada por Google Meet con el Director de Operaciones.',
    attachments: [
      { id: 'att-3', name: 'Presentacion_Nova_Tech.pdf', size: '3.4 MB', type: 'application/pdf', uploadedAt: '2026-09-25' },
    ],
  },
  {
    id: 'lead-05',
    name: 'Gustavo Adolfo Peña',
    company: 'Distribución Panamericana',
    email: 'gpena@distpan.com',
    phone: '+52 44 2345 6789',
    source: 'Referido',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    stage: 'Propuesta Enviada',
    createdAt: '2026-09-20',
    nextFollowUpDate: '2026-09-30 09:30',
    estimatedValue: 19800,
    tags: ['Decisor Clave', 'Distribución'],
    notes: 'Propuesta formal enviada para Distribución comercial y facturación.',
    attachments: [
      { id: 'att-4', name: 'Propuesta_Comercial_v2.pdf', size: '2.1 MB', type: 'application/pdf', uploadedAt: '2026-09-26' },
    ],
  },
  {
    id: 'lead-05b',
    name: 'Manuel Taveras Gómez',
    company: 'Distribución y Venta de Electrodomésticos Quisqueya S.R.L.',
    email: 'm.gomez@electrodomesticos.do',
    phone: '+1 809 582 3344',
    source: 'Referido',
    assignedTo: 'usr-1',
    assignedToName: 'Ing. Yenifer Reina',
    stage: 'Interesado',
    createdAt: '2026-09-22',
    nextFollowUpDate: '2026-09-30 15:00',
    estimatedValue: 34500,
    tags: ['Electrodomésticos', 'Distribución', 'ITHOT System'],
    notes: 'Interesado en sistema de inventario y facturación para cadena de electrodomésticos.',
    attachments: [],
  },
  {
    id: 'lead-06',
    name: 'Mariana Castillo',
    company: 'Hospitales del Bajío',
    email: 'mcastillo@hospbajio.org',
    phone: '+52 47 7123 4567',
    source: 'Evento / Feria',
    assignedTo: 'usr-2',
    assignedToName: 'Valeria Rojas',
    stage: 'Negociación',
    createdAt: '2026-09-18',
    nextFollowUpDate: '2026-09-28 17:00',
    estimatedValue: 27000,
    tags: ['Salud', 'Gran Cuenta'],
    notes: 'Negociando descuento por pronto pago e implementación escalonada.',
    attachments: [
      { id: 'att-5', name: 'Borrador_Contrato_Servicios.pdf', size: '1.8 MB', type: 'application/pdf', uploadedAt: '2026-09-22' },
    ],
  },
  {
    id: 'lead-07',
    name: 'Esteban Valencia',
    company: 'Manufacturas del Centro',
    email: 'evalencia@manufcentro.mx',
    phone: '+52 72 2334 4556',
    source: 'Sitio Web',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    stage: 'Ganado',
    createdAt: '2026-09-10',
    nextFollowUpDate: undefined,
    estimatedValue: 18500,
    tags: ['Cerrado', 'Pyme'],
    notes: 'Contrato firmado por 12 meses. Inicio de onboarding comercial en marcha.',
    attachments: [
      { id: 'att-6', name: 'Orden_Compra_Firmada.pdf', size: '890 KB', type: 'application/pdf', uploadedAt: '2026-09-26' },
    ],
  },
  {
    id: 'lead-08',
    name: 'Patricia Domínguez',
    company: 'Cadena Hotelera Real',
    email: 'pdominguez@hotelesreal.com',
    phone: '+52 99 8877 6655',
    source: 'WhatsApp Inbound',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    stage: 'Perdido',
    createdAt: '2026-09-12',
    nextFollowUpDate: undefined,
    estimatedValue: 9500,
    tags: ['Hotelería'],
    notes: 'Decidieron postergar proyecto de digitalización para el siguiente año.',
    lossReason: 'Decisión postergada para 2027',
    attachments: [],
  },
  {
    id: 'lead-09',
    name: 'Jorge Luis Cárdenas',
    company: 'Consultores Integrales',
    email: 'jcardenas@cintegrales.mx',
    phone: '+52 55 7788 9900',
    source: 'Google Ads',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    stage: 'Interesado',
    createdAt: '2026-09-26',
    nextFollowUpDate: '2026-09-29 12:00',
    estimatedValue: 6400,
    tags: ['Servicios'],
    notes: 'Interesados en automatizar recordatorios y llamadas de seguimiento.',
    attachments: [],
  },
  {
    id: 'lead-10',
    name: 'Karla Vivanco',
    company: 'Construcciones & Proyectos Modernos',
    email: 'kvivanco@copromo.mx',
    phone: '+52 81 3322 1100',
    source: 'Meta Ads',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    stage: 'Contactado',
    createdAt: '2026-09-27',
    nextFollowUpDate: '2026-09-28 15:00',
    estimatedValue: 14000,
    tags: ['Construcción', 'Urgente'],
    notes: 'Contactada vía telefónica. Se le compartirá caso de éxito de su rubro.',
    attachments: [],
  },
  {
    id: 'lead-11',
    name: 'Fernando Ruiz',
    company: 'Transportes del Altiplano',
    email: 'fruiz@transaltiplano.com',
    phone: '+52 44 4556 6778',
    source: 'Referido',
    assignedTo: 'usr-2',
    assignedToName: 'Valeria Rojas',
    stage: 'Propuesta Enviada',
    createdAt: '2026-09-21',
    nextFollowUpDate: '2026-09-30 11:00',
    estimatedValue: 22000,
    tags: ['Logística', 'Presupuesto Alto'],
    notes: 'Revisando propuesta con el consejo directivo.',
    attachments: [
      { id: 'att-7', name: 'Cotizacion_Plan_Enterprise.pdf', size: '1.5 MB', type: 'application/pdf', uploadedAt: '2026-09-24' },
    ],
  },
  {
    id: 'lead-12',
    name: 'Lucía Benítez',
    company: 'Agencia Creativa Zenith',
    email: 'lucia@zenithcreativa.com',
    phone: '+52 55 9900 1122',
    source: 'LinkedIn',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    stage: 'Nuevo Lead',
    createdAt: '2026-09-28',
    nextFollowUpDate: '2026-09-28 14:00',
    estimatedValue: 5600,
    tags: ['Agencia', 'Pyme'],
    notes: 'Llenó formulario web solicitando información de pipeline y seguimiento.',
    attachments: [],
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-01',
    leadId: 'lead-01',
    leadName: 'Alejandro Morales',
    type: 'WhatsApp',
    date: '2026-09-28',
    time: '09:15',
    userId: 'usr-3',
    userName: 'Mateo Silva',
    result: 'Exitoso',
    notes: 'Envío de mensaje de bienvenida y presentación rápida de CRMComercial.',
    nextAction: 'Llamar para verificar dudas de integración',
    nextFollowUpDate: '2026-09-28 11:30',
  },
  {
    id: 'act-02',
    leadId: 'lead-02',
    leadName: 'Beatriz Delgado',
    type: 'Llamada',
    date: '2026-09-27',
    time: '15:40',
    userId: 'usr-4',
    userName: 'Camila Herrera',
    result: 'Exitoso',
    notes: 'Conversación de 12 minutos. La clienta busca centralizar 4 asesores que usan Excel.',
    nextAction: 'Coordinar sesión de demostración guiada',
    nextFollowUpDate: '2026-09-29 10:00',
  },
  {
    id: 'act-03',
    leadId: 'lead-04',
    leadName: 'Daniela Salgado',
    type: 'Correo',
    date: '2026-09-26',
    time: '11:20',
    userId: 'usr-4',
    userName: 'Camila Herrera',
    result: 'Exitoso',
    notes: 'Envío de enlace de Google Meet y agenda de la sesión comercial.',
    nextAction: 'Ejecutar reunión de demostración',
    nextFollowUpDate: '2026-09-29 11:00',
  },
  {
    id: 'act-04',
    leadId: 'lead-06',
    leadName: 'Mariana Castillo',
    type: 'Reunión',
    date: '2026-09-25',
    time: '10:00',
    userId: 'usr-2',
    userName: 'Valeria Rojas',
    result: 'Interesado',
    notes: 'Reunión presencial en sus oficinas. Presentamos tablero Kanban y control de tiempos.',
    nextAction: 'Ajustar términos de forma de pago y garantías',
    nextFollowUpDate: '2026-09-28 17:00',
  },
  {
    id: 'act-05',
    leadId: 'lead-05',
    leadName: 'Gustavo Adolfo Peña',
    type: 'Nota',
    date: '2026-09-26',
    time: '16:15',
    userId: 'usr-3',
    userName: 'Mateo Silva',
    result: 'Exitoso',
    notes: 'El cliente confirmó recepción de cotización por USD $19,800. Requiere soporte en migración.',
    nextAction: 'Llamada de seguimiento a propuesta',
    nextFollowUpDate: '2026-09-30 09:30',
  },
  {
    id: 'act-06',
    leadId: 'lead-10',
    leadName: 'Karla Vivanco',
    type: 'Llamada',
    date: '2026-09-27',
    time: '17:00',
    userId: 'usr-3',
    userName: 'Mateo Silva',
    result: 'Sin respuesta',
    notes: 'Teléfono timbró hasta buzón de voz. Se envió mensaje complementario por WhatsApp.',
    nextAction: 'Reintentar llamada telefónica',
    nextFollowUpDate: '2026-09-28 15:00',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-01',
    title: 'Llamar a Alejandro Morales para primer diagnóstico',
    leadId: 'lead-01',
    leadName: 'Alejandro Morales',
    dueDate: '2026-09-28',
    dueTime: '11:30',
    priority: 'Alta',
    status: 'Pendiente',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    description: 'Verificar cantidad de prospectos mensuales que manejan en Logística Norte.',
  },
  {
    id: 'tsk-02',
    title: 'Confirmar reunión por Meet con Daniela Salgado',
    leadId: 'lead-04',
    leadName: 'Daniela Salgado',
    dueDate: '2026-09-28',
    dueTime: '16:00',
    priority: 'Alta',
    status: 'Pendiente',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    description: 'Enviar WhatsApp recordatorio con el enlace de la sala.',
  },
  {
    id: 'tsk-03',
    title: 'Preparar ajuste de propuesta para Mariana Castillo',
    leadId: 'lead-06',
    leadName: 'Mariana Castillo',
    dueDate: '2026-09-28',
    dueTime: '15:30',
    priority: 'Alta',
    status: 'En Progreso',
    assignedTo: 'usr-2',
    assignedToName: 'Valeria Rojas',
    description: 'Incluir cláusula de capacitación para 8 coordinadores de área.',
  },
  {
    id: 'tsk-04',
    title: 'Enviar comparativa técnica a Rodrigo Espinoza',
    leadId: 'lead-03',
    leadName: 'Rodrigo Espinoza',
    dueDate: '2026-09-29',
    dueTime: '12:00',
    priority: 'Media',
    status: 'Pendiente',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    description: 'Comparativo de tiempos de respuesta en CRM vs hojas de cálculo.',
  },
  {
    id: 'tsk-05',
    title: 'Revisión mensual de conversiones del equipo comercial',
    dueDate: '2026-09-30',
    dueTime: '18:00',
    priority: 'Media',
    status: 'Pendiente',
    assignedTo: 'usr-1',
    assignedToName: 'Ing. Yenifer Sena',
    description: 'Auditar tiempos de primer contacto y cumplimiento de tareas.',
  },
  {
    id: 'tsk-06',
    title: 'Recontactar a Karla Vivanco',
    leadId: 'lead-10',
    leadName: 'Karla Vivanco',
    dueDate: '2026-09-28',
    dueTime: '15:00',
    priority: 'Alta',
    status: 'Pendiente',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    description: 'Intentar comunicación por segunda ocasión en horario vespertino.',
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-01',
    title: 'Llamada de Calificación - Alejandro Morales',
    date: '2026-09-28',
    startTime: '11:30',
    endTime: '12:00',
    type: 'Llamada',
    leadId: 'lead-01',
    leadName: 'Alejandro Morales',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    completed: false,
  },
  {
    id: 'cal-02',
    title: 'Llamada Reintento - Karla Vivanco',
    date: '2026-09-28',
    startTime: '15:00',
    endTime: '15:30',
    type: 'Llamada',
    leadId: 'lead-10',
    leadName: 'Karla Vivanco',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    completed: false,
  },
  {
    id: 'cal-03',
    title: 'Cierre de Términos - Mariana Castillo',
    date: '2026-09-28',
    startTime: '17:00',
    endTime: '18:00',
    type: 'Reunión',
    leadId: 'lead-06',
    leadName: 'Mariana Castillo',
    assignedTo: 'usr-2',
    assignedToName: 'Valeria Rojas',
    completed: false,
  },
  {
    id: 'cal-04',
    title: 'Demo de CRMComercial - Beatriz Delgado',
    date: '2026-09-29',
    startTime: '10:00',
    endTime: '11:00',
    type: 'Reunión',
    leadId: 'lead-02',
    leadName: 'Beatriz Delgado',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    completed: false,
  },
  {
    id: 'cal-05',
    title: 'Demo Técnica - Daniela Salgado',
    date: '2026-09-29',
    startTime: '11:00',
    endTime: '12:00',
    type: 'Reunión',
    leadId: 'lead-04',
    leadName: 'Daniela Salgado',
    assignedTo: 'usr-4',
    assignedToName: 'Camila Herrera',
    completed: false,
  },
  {
    id: 'cal-06',
    title: 'Seguimiento Propuesta - Gustavo Peña',
    date: '2026-09-30',
    startTime: '09:30',
    endTime: '10:00',
    type: 'WhatsApp',
    leadId: 'lead-05',
    leadName: 'Gustavo Adolfo Peña',
    assignedTo: 'usr-3',
    assignedToName: 'Mateo Silva',
    completed: false,
  },
];

// LocalStorage Persistence Keys
const LEADS_KEY = 'crmcomercial_leads_data_v1';
const ACTIVITIES_KEY = 'crmcomercial_activities_data_v1';
const TASKS_KEY = 'crmcomercial_tasks_data_v1';
const USERS_KEY = 'crmcomercial_users_data_v1';
const CURRENT_ROLE_KEY = 'crmcomercial_current_role_v1';

export function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load leads from localStorage', e);
  }
  return INITIAL_LEADS;
}

export function saveLeads(leads: Lead[]) {
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save leads to localStorage', e);
  }
}

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activities', e);
  }
  return INITIAL_ACTIVITIES;
}

export function saveActivities(activities: Activity[]) {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  return INITIAL_TASKS;
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadCurrentRole(): string {
  try {
    const role = localStorage.getItem(CURRENT_ROLE_KEY);
    if (role) return role;
  } catch (e) {
    console.error('Failed to load current role', e);
  }
  return 'Administrador';
}

export function saveCurrentRole(role: string) {
  try {
    localStorage.setItem(CURRENT_ROLE_KEY, role);
  } catch (e) {
    console.error('Failed to save role', e);
  }
}
