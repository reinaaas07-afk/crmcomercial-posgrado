import fs from 'fs';
import path from 'path';

export interface UserEntity {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  usuario: string;
  password_hash: string;
  password_plain?: string;
  rol: 'Administrador General' | 'Administrador' | 'Supervisor Comercial' | 'Ejecutivo Comercial' | 'Analista Comercial' | 'Asesor Comercial';
  telefono: string;
  activo: boolean;
  fecha_creacion: string;
  ultimo_acceso?: string;
  ultimo_cierre?: string;
  empresa: string;
  subcuenta?: string;
  en_linea?: boolean;
}

export interface CompanyEntity {
  id: number;
  razon_social: string;
  nombre_comercial: string;
  rnc: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  telefono: string;
  correo: string;
  sitio_web: string;
  industria: string;
  cantidad_empleados?: string;
  responsable_comercial: string;
  usuario_id: number;
  fecha_registro: string;
  estado_comercial: string;
}

export interface ContactEntity {
  id: number;
  nombre: string;
  apellido: string;
  empresa_id?: number | null;
  empresa: string;
  cargo: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  telefono_adicional?: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  naturaleza_negocio: string;
  estado_comercial?: string;
  producto_interes?: string;
  modulo_principal?: string;
  responsable_comercial: string;
  usuario_id: number;
  ultimo_contacto: string;
  proximo_seguimiento: string;
  notas: string;
  observaciones_comerciales?: string;
  etiquetas: string;
  fecha_registro: string;
}

export interface ProspectOpportunityEntity {
  id: number;
  nombre: string;
  apellido?: string;
  empresa: string;
  contacto_principal: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  canal_captacion: string;
  producto_principal: string;
  plan_seleccionado: string;
  costo_base: number;
  modulos_adicionales: string[];
  costo_adicional: number;
  costo_mensual: number;
  valor_estimado: number; // e.g. annual or total
  cantidad_usuarios: number;
  responsable_comercial: string;
  usuario_id: number;
  etapa: 'Contacto' | 'Interesado' | 'Propuesta Enviada' | 'Ganado' | 'Perdido';
  fecha_primer_contacto: string;
  ultima_actividad: string;
  proximo_seguimiento: string;
  dias_sin_seguimiento: number;
  observaciones: string;
  etiquetas: string;
  motivo_perdida?: string;
  fecha_registro: string;
}

export interface FollowUpEntity {
  id: number;
  prospecto_id: number;
  empresa: string;
  usuario: string;
  usuario_id: number;
  canal: 'Llamada' | 'Correo' | 'WhatsApp' | 'Reunión' | 'Nota';
  fecha: string;
  hora: string;
  resultado: 'Exitoso' | 'Sin respuesta' | 'Ocupado' | 'Reagendado' | 'Interesado' | 'Rechazado';
  observaciones: string;
  proxima_accion: string;
  fecha_proximo_seguimiento?: string;
}

export interface TaskEntity {
  id: number;
  titulo: string;
  descripcion: string;
  asignado_a: string;
  usuario_id: number;
  fecha_limite: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'Completada' | 'En Progreso';
  relacionado_tipo?: 'prospecto' | 'contacto' | 'empresa';
  relacionado_id?: number;
  relacionado_nombre?: string;
}

export interface AuditEntity {
  id: number;
  usuario: string;
  usuario_id?: number;
  fecha: string;
  hora: string;
  accion: 'Inicio de Sesión' | 'Cierre de Sesión' | 'Creación' | 'Edición' | 'Eliminación' | 'Importación' | 'Exportación' | 'Cambio de Contraseña' | 'Restablecimiento';
  modulo: string;
  registro_afectado: string;
  detalles: string;
  ip: string;
}

export interface NotificationEntity {
  id: number;
  titulo: string;
  mensaje: string;
  usuario: string;
  fecha: string;
  hora: string;
  leida: boolean;
  tipo: 'nuevo_prospecto' | 'contacto_actualizado' | 'importacion' | 'usuario_creado' | 'cambio_etapa' | 'alerta';
}

export interface TagEntity {
  id: number;
  nombre: string;
  categoria: 'Clientes' | 'Prospectos' | 'Productos' | 'Módulos';
  color: string;
}

export interface DatabaseSchema {
  usuarios: UserEntity[];
  empresas: CompanyEntity[];
  contactos: ContactEntity[];
  prospectos: ProspectOpportunityEntity[];
  seguimientos: FollowUpEntity[];
  tareas: TaskEntity[];
  auditoria: AuditEntity[];
  notificaciones: NotificationEntity[];
  etiquetas: TagEntity[];
  configuracion: {
    empresa_nombre: string;
    rnc: string;
    direccion: string;
    telefono: string;
    email: string;
    moneda: string;
    combos: {
      nombre: string;
      costo_mensual: number;
      descripcion: string;
      usuarios_incluidos: number;
    }[];
    modulos_precios: {
      nombre: string;
      costo_mensual: number;
    }[];
  };
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server/crm_database.json');

// Initial seed data representing real Dominican enterprises for IB SYSTEM CRM
const INITIAL_DATABASE: DatabaseSchema = {
  usuarios: [
    {
      id: 1,
      nombre: 'Yenifer Reina',
      apellido: 'Sena Suero',
      email: 'yenifer.sena@ibsystem.com.do',
      usuario: 'yenifer.sena',
      password_hash: 'Admin123*',
      password_plain: 'Admin123*',
      rol: 'Administrador General',
      telefono: '+1 809-567-8900',
      activo: true,
      fecha_creacion: '2026-01-15 08:00:00',
      ultimo_acceso: '2026-09-30 08:15:00',
      empresa: 'IB SYSTEM S.R.L.',
      subcuenta: 'Sede Principal Santo Domingo',
      en_linea: true,
    },
    {
      id: 2,
      nombre: 'Felix Manuel',
      apellido: 'Robles',
      email: 'felix.robles@ibsystem.com.do',
      usuario: 'felix.robles',
      password_hash: 'Felix2026*',
      password_plain: 'Felix2026*',
      rol: 'Ejecutivo Comercial',
      telefono: '+1 809-541-2233',
      activo: true,
      fecha_creacion: '2026-02-01 09:00:00',
      ultimo_acceso: '2026-09-29 16:40:00',
      empresa: 'IB SYSTEM S.R.L.',
      subcuenta: 'Sucursal Este Punta Cana',
      en_linea: false,
    },
    {
      id: 3,
      nombre: 'Armando',
      apellido: 'Montes de Oca Hesni',
      email: 'armando.montes@ibsystem.com.do',
      usuario: 'armando.montes',
      password_hash: 'Armando2026*',
      password_plain: 'Armando2026*',
      rol: 'Supervisor Comercial',
      telefono: '+1 809-582-4411',
      activo: true,
      fecha_creacion: '2026-02-15 08:30:00',
      ultimo_acceso: '2026-09-30 07:50:00',
      empresa: 'IB SYSTEM S.R.L.',
      subcuenta: 'Sucursal Cibao Santiago',
      en_linea: true,
    },
    {
      id: 4,
      nombre: 'Ana Julia',
      apellido: 'Alcántara',
      email: 'ana.alcantara@ibsystem.com.do',
      usuario: 'ana.alcantara',
      password_hash: 'Ana2026*',
      password_plain: 'Ana2026*',
      rol: 'Analista Comercial',
      telefono: '+1 809-535-6677',
      activo: true,
      fecha_creacion: '2026-03-01 09:30:00',
      ultimo_acceso: '2026-09-29 17:10:00',
      empresa: 'IB SYSTEM S.R.L.',
      subcuenta: 'Sede Principal Santo Domingo',
      en_linea: false,
    },
  ],
  empresas: [
    {
      id: 1,
      razon_social: 'Auto Repuestos & Talleres Central S.R.L.',
      nombre_comercial: 'Auto Central RD',
      rnc: '1-30-88452-1',
      direccion: 'Av. 27 de Febrero #452, Miraflores',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      telefono: '+1 809-565-1122',
      correo: 'gerencia@autocentral.com.do',
      sitio_web: 'https://autocentral.com.do',
      industria: 'Automotriz y Repuestos',
      cantidad_empleados: '25-50',
      responsable_comercial: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      fecha_registro: '2026-09-01 10:00:00',
      estado_comercial: 'Cliente Activo',
    },
    {
      id: 2,
      razon_social: 'Distribuidora Farmacéutica Quisqueyana S.A.',
      nombre_comercial: 'Farma Quisqueya',
      rnc: '1-01-94512-3',
      direccion: 'Av. John F. Kennedy Km 6.5',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      telefono: '+1 809-540-3344',
      correo: 'ventas@farmaquisqueya.do',
      sitio_web: 'https://farmaquisqueya.do',
      industria: 'Farmacéutica y Salud',
      cantidad_empleados: '50-100',
      responsable_comercial: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      fecha_registro: '2026-09-05 11:30:00',
      estado_comercial: 'En Negociación',
    },
    {
      id: 3,
      razon_social: 'Supermercados & Plazas El Conde S.R.L.',
      nombre_comercial: 'Plaza El Conde',
      rnc: '1-31-00214-5',
      direccion: 'Calle El Conde esq. Duarte #102',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      telefono: '+1 809-688-9900',
      correo: 'administracion@plazaelconde.com.do',
      sitio_web: 'https://plazaelconde.com.do',
      industria: 'Supermercados y Retail',
      cantidad_empleados: '100+',
      responsable_comercial: 'Felix Manuel Robles',
      usuario_id: 2,
      fecha_registro: '2026-09-10 14:15:00',
      estado_comercial: 'Propuesta Enviada',
    },
    {
      id: 4,
      razon_social: 'Ferretería Industrial del Cibao S.R.L.',
      nombre_comercial: 'Ferretería Cibao',
      rnc: '1-32-44589-9',
      direccion: 'Av. Bartolomé Colón #88',
      ciudad: 'Santiago de los Caballeros',
      provincia: 'Santiago',
      telefono: '+1 809-582-7711',
      correo: 'contacto@ferreteriacibao.do',
      sitio_web: 'https://ferreteriacibao.do',
      industria: 'Construcción y Ferretería',
      cantidad_empleados: '30-60',
      responsable_comercial: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      fecha_registro: '2026-09-12 09:40:00',
      estado_comercial: 'Interesado',
    },
    {
      id: 5,
      razon_social: 'Restaurante & Lounge Mar Adentro S.R.L.',
      nombre_comercial: 'Mar Adentro Lounge',
      rnc: '1-33-88901-2',
      direccion: 'Av. Winston Churchill, Blue Mall Nivel 5',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      telefono: '+1 809-955-4000',
      correo: 'eventos@maradentro.com.do',
      sitio_web: 'https://maradentro.com.do',
      industria: 'Gastronomía y Hospitalidad',
      cantidad_empleados: '15-30',
      responsable_comercial: 'Ana Julia Alcántara',
      usuario_id: 4,
      fecha_registro: '2026-09-18 16:20:00',
      estado_comercial: 'Contacto',
    },
  ],
  contactos: [
    {
      id: 1,
      nombre: 'Ing. Carlos',
      apellido: 'Méndez Peña',
      empresa: 'Auto Repuestos & Talleres Central S.R.L.',
      cargo: 'Director General y Propietario',
      telefono: '+1 809-565-1122',
      whatsapp: '+1 829-340-9988',
      correo: 'cmendez@autocentral.com.do',
      direccion: 'Av. 27 de Febrero #452',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      naturaleza_negocio: 'Venta de repuestos al por mayor y talleres mecánicos',
      responsable_comercial: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      ultimo_contacto: '2026-09-28 10:30:00',
      proximo_seguimiento: '2026-10-05 10:00:00',
      notas: 'Cliente satisfecho con la Facturación Electrónica e-CF de IB SYSTEM.',
      etiquetas: 'Cliente, Cliente Activo, Facturación Electrónica, Inventario',
      fecha_registro: '2026-09-01 10:15:00',
    },
    {
      id: 2,
      nombre: 'Licda. Carmen',
      apellido: 'Báez Rosado',
      empresa: 'Distribuidora Farmacéutica Quisqueyana S.A.',
      cargo: 'Directora Financiera',
      telefono: '+1 809-540-3344',
      whatsapp: '+1 849-220-4455',
      correo: 'cbaez@farmaquisqueya.do',
      direccion: 'Av. John F. Kennedy Km 6.5',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      naturaleza_negocio: 'Distribución farmacéutica a clínicas y cadenas',
      responsable_comercial: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      ultimo_contacto: '2026-09-26 15:00:00',
      proximo_seguimiento: '2026-10-02 11:30:00',
      notas: 'Evaluando cotización del plan Empresarial Pro para 5 sucursales.',
      etiquetas: 'Prospecto, POS Digital, Cuentas por Cobrar, Contabilidad',
      fecha_registro: '2026-09-05 11:45:00',
    },
    {
      id: 3,
      nombre: 'Lic. Fausto',
      apellido: 'Henríquez',
      empresa: 'Supermercados & Plazas El Conde S.R.L.',
      cargo: 'Superintendente Comercial',
      telefono: '+1 809-688-9900',
      whatsapp: '+1 829-912-7788',
      correo: 'fhenriquez@plazaelconde.com.do',
      direccion: 'Calle El Conde esq. Duarte #102',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      naturaleza_negocio: 'Supermercados de conveniencia y tiendas retail',
      responsable_comercial: 'Felix Manuel Robles',
      usuario_id: 2,
      ultimo_contacto: '2026-09-27 11:20:00',
      proximo_seguimiento: '2026-10-03 15:00:00',
      notas: 'Propuesta enviada por US$135 mensual con 8 terminales POS Digital.',
      etiquetas: 'Prospecto, POS Digital, Ventas, Caja',
      fecha_registro: '2026-09-10 14:30:00',
    },
    {
      id: 4,
      nombre: 'Ing. Alejandro',
      apellido: 'Cabrera Ortiz',
      empresa: 'Ferretería Industrial del Cibao S.R.L.',
      cargo: 'Gerente de Operaciones e Inventario',
      telefono: '+1 809-582-7711',
      whatsapp: '+1 829-334-1122',
      correo: 'acabrera@ferreteriacibao.do',
      direccion: 'Av. Bartolomé Colón #88',
      ciudad: 'Santiago de los Caballeros',
      provincia: 'Santiago',
      telefono_adicional: '+1 809-582-7712',
      naturaleza_negocio: 'Venta mayorista de acero, cemento y ferretería pesada',
      responsable_comercial: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      ultimo_contacto: '2026-09-22 09:00:00',
      proximo_seguimiento: '2026-09-28 10:00:00', // Overdue (>7 days without contact!)
      notas: 'Requiere integración entre compras de importación y DGII.',
      etiquetas: 'Prospecto, Inventario, Compras, Facturación Electrónica',
      fecha_registro: '2026-09-12 10:00:00',
    },
    {
      id: 5,
      nombre: 'Chef Marcos',
      apellido: 'Díaz Valenzuela',
      empresa: 'Restaurante & Lounge Mar Adentro S.R.L.',
      cargo: 'Socio Operativo',
      telefono: '+1 809-955-4000',
      whatsapp: '+1 849-881-2020',
      correo: 'mdiaz@maradentro.com.do',
      direccion: 'Av. Winston Churchill, Blue Mall',
      ciudad: 'Santo Domingo',
      provincia: 'Distrito Nacional',
      naturaleza_negocio: 'Restaurante gourmet y eventos corporativos',
      responsable_comercial: 'Ana Julia Alcántara',
      usuario_id: 4,
      ultimo_contacto: '2026-09-18 16:30:00',
      proximo_seguimiento: '2026-09-25 11:00:00', // Overdue
      notas: 'Contactado inicialmente por campaña de Instagram/Meta Ads.',
      etiquetas: 'Lead, POS Digital, Caja, Facturación Electrónica',
      fecha_registro: '2026-09-18 16:40:00',
    },
  ],
  prospectos: [
    {
      id: 1,
      nombre: 'Auto Repuestos & Talleres Central',
      empresa: 'Auto Repuestos & Talleres Central S.R.L.',
      contacto_principal: 'Ing. Carlos Méndez Peña',
      telefono: '+1 809-565-1122',
      whatsapp: '+1 829-340-9988',
      correo: 'cmendez@autocentral.com.do',
      canal_captacion: 'Referido',
      producto_principal: 'Facturación Electrónica',
      plan_seleccionado: 'EMPRESARIAL',
      costo_base: 90,
      modulos_adicionales: ['Inventario', 'Cuentas por Cobrar'],
      costo_adicional: 16,
      costo_mensual: 106,
      valor_estimado: 1272, // US$106 * 12 months
      cantidad_usuarios: 5,
      responsable_comercial: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      etapa: 'Ganado',
      fecha_primer_contacto: '2026-09-01',
      ultima_actividad: '2026-09-28 10:30:00',
      proximo_seguimiento: '2026-10-05 10:00:00',
      dias_sin_seguimiento: 2,
      observaciones: 'Implementación exitosa en 3 sucursales. Facturando con e-CF oficial DGII.',
      etiquetas: 'Facturación Electrónica, Inventario, ITHOT System',
      fecha_registro: '2026-09-01 10:00:00',
    },
    {
      id: 2,
      nombre: 'Distribuidora Farmacéutica Quisqueyana',
      empresa: 'Distribuidora Farmacéutica Quisqueyana S.A.',
      contacto_principal: 'Licda. Carmen Báez Rosado',
      telefono: '+1 809-540-3344',
      whatsapp: '+1 849-220-4455',
      correo: 'cbaez@farmaquisqueya.do',
      canal_captacion: 'Google Ads',
      producto_principal: 'POS Digital',
      plan_seleccionado: 'EMPRESARIAL PRO',
      costo_base: 135,
      modulos_adicionales: ['Cuentas por Cobrar', 'Contabilidad'],
      costo_adicional: 16,
      costo_mensual: 151,
      valor_estimado: 1812,
      cantidad_usuarios: 8,
      responsable_comercial: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      etapa: 'Interesado',
      fecha_primer_contacto: '2026-09-05',
      ultima_actividad: '2026-09-26 15:00:00',
      proximo_seguimiento: '2026-10-02 11:30:00',
      dias_sin_seguimiento: 4,
      observaciones: 'Demostración realizada con éxito. Revisando presupuesto de TI.',
      etiquetas: 'POS Digital, Cuentas por Cobrar, Contabilidad',
      fecha_registro: '2026-09-05 11:30:00',
    },
    {
      id: 3,
      nombre: 'Supermercados & Plazas El Conde',
      empresa: 'Supermercados & Plazas El Conde S.R.L.',
      contacto_principal: 'Lic. Fausto Henríquez',
      telefono: '+1 809-688-9900',
      whatsapp: '+1 829-912-7788',
      correo: 'fhenriquez@plazaelconde.com.do',
      canal_captacion: 'Feria Comercial',
      producto_principal: 'POS Digital',
      plan_seleccionado: 'EMPRESARIAL PRO',
      costo_base: 135,
      modulos_adicionales: ['Caja', 'Ventas'],
      costo_adicional: 16,
      costo_mensual: 151,
      valor_estimado: 1812,
      cantidad_usuarios: 6,
      responsable_comercial: 'Felix Manuel Robles',
      usuario_id: 2,
      etapa: 'Propuesta Enviada',
      fecha_primer_contacto: '2026-09-10',
      ultima_actividad: '2026-09-27 11:20:00',
      proximo_seguimiento: '2026-10-03 15:00:00',
      dias_sin_seguimiento: 3,
      observaciones: 'Cotización formal enviada por correo. A la espera de firma de contrato.',
      etiquetas: 'POS Digital, Caja, Ventas',
      fecha_registro: '2026-09-10 14:15:00',
    },
    {
      id: 4,
      nombre: 'Ferretería Industrial del Cibao',
      empresa: 'Ferretería Industrial del Cibao S.R.L.',
      contacto_principal: 'Ing. Alejandro Cabrera Ortiz',
      telefono: '+1 809-582-7711',
      whatsapp: '+1 829-334-1122',
      correo: 'acabrera@ferreteriacibao.do',
      canal_captacion: 'Referido',
      producto_principal: 'ITHOT System',
      plan_seleccionado: 'EMPRESARIAL',
      costo_base: 90,
      modulos_adicionales: ['Inventario', 'Compras'],
      costo_adicional: 16,
      costo_mensual: 106,
      valor_estimado: 1272,
      cantidad_usuarios: 4,
      responsable_comercial: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      etapa: 'Interesado',
      fecha_primer_contacto: '2026-09-12',
      ultima_actividad: '2026-09-21 09:00:00', // 9 days without activity -> Alert 7 days!
      proximo_seguimiento: '2026-09-24 10:00:00',
      dias_sin_seguimiento: 9,
      observaciones: 'Interesado en módulo de compras y control de stock crítico.',
      etiquetas: 'ITHOT System, Inventario, Compras',
      fecha_registro: '2026-09-12 09:40:00',
    },
    {
      id: 5,
      nombre: 'Restaurante & Lounge Mar Adentro',
      empresa: 'Restaurante & Lounge Mar Adentro S.R.L.',
      contacto_principal: 'Chef Marcos Díaz Valenzuela',
      telefono: '+1 809-955-4000',
      whatsapp: '+1 849-881-2020',
      correo: 'mdiaz@maradentro.com.do',
      canal_captacion: 'Meta Ads',
      producto_principal: 'POS Digital',
      plan_seleccionado: 'PYME',
      costo_base: 45,
      modulos_adicionales: ['Facturación Electrónica'],
      costo_adicional: 8,
      costo_mensual: 53,
      valor_estimado: 636,
      cantidad_usuarios: 2,
      responsable_comercial: 'Ana Julia Alcántara',
      usuario_id: 4,
      etapa: 'Contacto',
      fecha_primer_contacto: '2026-09-18',
      ultima_actividad: '2026-09-18 16:20:00', // 12 days without activity -> Alert 7/15 days!
      proximo_seguimiento: '2026-09-22 11:00:00',
      dias_sin_seguimiento: 12,
      observaciones: 'Lead captado por Instagram. Pendiente concertar llamada de diagnóstico.',
      etiquetas: 'POS Digital, Facturación Electrónica',
      fecha_registro: '2026-09-18 16:20:00',
    },
    {
      id: 6,
      nombre: 'Constructora & Diseños Santo Domingo S.R.L.',
      empresa: 'Constructora & Diseños Santo Domingo S.R.L.',
      contacto_principal: 'Arq. Luis Rafael Morales',
      telefono: '+1 809-567-3300',
      whatsapp: '+1 829-550-1177',
      correo: 'lmorales@constructorasd.com.do',
      canal_captacion: 'LinkedIn',
      producto_principal: 'CRMComercial',
      plan_seleccionado: 'PYME',
      costo_base: 45,
      modulos_adicionales: ['Reportes Gerenciales'],
      costo_adicional: 8,
      costo_mensual: 53,
      valor_estimado: 636,
      cantidad_usuarios: 3,
      responsable_comercial: 'Felix Manuel Robles',
      usuario_id: 2,
      etapa: 'Perdido',
      fecha_primer_contacto: '2026-09-02',
      ultima_actividad: '2026-09-15 14:00:00',
      proximo_seguimiento: '',
      dias_sin_seguimiento: 15,
      observaciones: 'Optaron por posponer la digitalización para el próximo trimestre fiscal.',
      motivo_perdida: 'Postergación presupuestaria interna',
      etiquetas: 'CRMComercial, Reportes Gerenciales',
      fecha_registro: '2026-09-02 09:10:00',
    },
  ],
  seguimientos: [
    {
      id: 1,
      prospecto_id: 1,
      empresa: 'Auto Repuestos & Talleres Central S.R.L.',
      usuario: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      canal: 'Reunión',
      fecha: '2026-09-28',
      hora: '10:30',
      resultado: 'Exitoso',
      observaciones: 'Capacitación presencial del equipo de facturación en el uso de e-CF.',
      proxima_accion: 'Seguimiento post-implementación a los 30 días',
      fecha_proximo_seguimiento: '2026-10-05 10:00',
    },
    {
      id: 2,
      prospecto_id: 2,
      empresa: 'Distribuidora Farmacéutica Quisqueyana S.A.',
      usuario: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      canal: 'Llamada',
      fecha: '2026-09-26',
      hora: '15:00',
      resultado: 'Interesado',
      observaciones: 'Conversación con Licda. Báez. Solicita descuento por pronto pago anual.',
      proxima_accion: 'Enviar propuesta con descuento del 10% anual',
      fecha_proximo_seguimiento: '2026-10-02 11:30',
    },
    {
      id: 3,
      prospecto_id: 3,
      empresa: 'Supermercados & Plazas El Conde S.R.L.',
      usuario: 'Felix Manuel Robles',
      usuario_id: 2,
      canal: 'Correo',
      fecha: '2026-09-27',
      hora: '11:20',
      resultado: 'Exitoso',
      observaciones: 'Envío de propuesta económica formal y catálogo técnico de terminales táctiles.',
      proxima_accion: 'Llamada de seguimiento a las 72 horas',
      fecha_proximo_seguimiento: '2026-10-03 15:00',
    },
  ],
  tareas: [
    {
      id: 1,
      titulo: 'Enviar cotización formal con descuento por volumen',
      descripcion: 'Preparar propuesta técnica comercial para Distribuidora Farmacéutica Quisqueyana.',
      asignado_a: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      fecha_limite: '2026-10-02',
      prioridad: 'Alta',
      estado: 'En Progreso',
      relacionado_tipo: 'prospecto',
      relacionado_id: 2,
      relacionado_nombre: 'Distribuidora Farmacéutica Quisqueyana',
    },
    {
      id: 2,
      titulo: 'Llamar a Superintendente Fausto Henríquez',
      descripcion: 'Confirmar recepción del pliego de propuesta para Plazas El Conde.',
      asignado_a: 'Felix Manuel Robles',
      usuario_id: 2,
      fecha_limite: '2026-10-03',
      prioridad: 'Alta',
      estado: 'Pendiente',
      relacionado_tipo: 'prospecto',
      relacionado_id: 3,
      relacionado_nombre: 'Supermercados & Plazas El Conde',
    },
    {
      id: 3,
      titulo: 'Contactar a Ferretería Cibao por alerta de inactividad',
      descripcion: 'Lleva más de 7 días sin contacto. Reactivar conversación con Ing. Cabrera.',
      asignado_a: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      fecha_limite: '2026-10-01',
      prioridad: 'Alta',
      estado: 'Pendiente',
      relacionado_tipo: 'prospecto',
      relacionado_id: 4,
      relacionado_nombre: 'Ferretería Industrial del Cibao',
    },
    {
      id: 4,
      titulo: 'Revisión mensual de objetivos comerciales',
      descripcion: 'Evaluar avance de metas de prospectos y ventas del equipo de IB SYSTEM.',
      asignado_a: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      fecha_limite: '2026-10-05',
      prioridad: 'Media',
      estado: 'Pendiente',
    },
  ],
  auditoria: [
    {
      id: 1,
      usuario: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      fecha: '2026-09-30',
      hora: '08:15:22',
      accion: 'Inicio de Sesión',
      modulo: 'Seguridad',
      registro_afectado: 'Sesión yenifer.sena',
      detalles: 'Ingreso autenticado al sistema CRMComercial con rol Administrador General.',
      ip: '190.166.45.12',
    },
    {
      id: 2,
      usuario: 'Armando Montes de Oca Hesni',
      usuario_id: 3,
      fecha: '2026-09-30',
      hora: '07:50:11',
      accion: 'Inicio de Sesión',
      modulo: 'Seguridad',
      registro_afectado: 'Sesión armando.montes',
      detalles: 'Ingreso autenticado al sistema CRMComercial.',
      ip: '190.166.45.18',
    },
    {
      id: 3,
      usuario: 'Yenifer Reina Sena Suero',
      usuario_id: 1,
      fecha: '2026-09-28',
      hora: '10:35:00',
      accion: 'Edición',
      modulo: 'Pipeline Comercial',
      registro_afectado: 'Auto Repuestos & Talleres Central',
      detalles: 'Cambió etapa de "Propuesta Enviada" a "Ganado". Valor: US$106 mensual.',
      ip: '190.166.45.12',
    },
  ],
  notificaciones: [
    {
      id: 1,
      titulo: 'Nueva Oportunidad Ganada',
      mensaje: 'Auto Repuestos & Talleres Central ha sido marcada como GANADA por Yenifer Sena (US$106/mes).',
      usuario: 'Yenifer Reina Sena Suero',
      fecha: '2026-09-28',
      hora: '10:35',
      leida: false,
      tipo: 'cambio_etapa',
    },
    {
      id: 2,
      titulo: 'Alerta de Seguimiento Pendiente',
      mensaje: 'Ferretería Industrial del Cibao tiene 9 días sin contacto registrado.',
      usuario: 'Sistema Automático',
      fecha: '2026-09-30',
      hora: '08:00',
      leida: false,
      tipo: 'alerta',
    },
  ],
  etiquetas: [
    // Clientes
    { id: 1, nombre: 'Cliente', categoria: 'Clientes', color: '#10b981' },
    { id: 2, nombre: 'Cliente Activo', categoria: 'Clientes', color: '#059669' },
    { id: 3, nombre: 'Cliente Inactivo', categoria: 'Clientes', color: '#ef4444' },
    // Prospectos
    { id: 4, nombre: 'Prospecto', categoria: 'Prospectos', color: '#3b82f6' },
    { id: 5, nombre: 'Lead', categoria: 'Prospectos', color: '#6366f1' },
    // Productos
    { id: 6, nombre: 'ITHOT System', categoria: 'Productos', color: '#8b5cf6' },
    { id: 7, nombre: 'POS Digital', categoria: 'Productos', color: '#ec4899' },
    { id: 8, nombre: 'Facturación Electrónica', categoria: 'Productos', color: '#06b6d4' },
    { id: 9, nombre: 'CRMComercial', categoria: 'Productos', color: '#f59e0b' },
    // Módulos
    { id: 10, nombre: 'Inventario', categoria: 'Módulos', color: '#84cc16' },
    { id: 11, nombre: 'Compras', categoria: 'Módulos', color: '#14b8a6' },
    { id: 12, nombre: 'Ventas', categoria: 'Módulos', color: '#0284c7' },
    { id: 13, nombre: 'Caja', categoria: 'Módulos', color: '#f97316' },
    { id: 14, nombre: 'Contabilidad', categoria: 'Módulos', color: '#64748b' },
    { id: 15, nombre: 'Cuentas por Cobrar', categoria: 'Módulos', color: '#eab308' },
    { id: 16, nombre: 'Cuentas por Pagar', categoria: 'Módulos', color: '#f43f5e' },
    { id: 17, nombre: 'Reportes Gerenciales', categoria: 'Módulos', color: '#a855f7' },
  ],
  configuracion: {
    empresa_nombre: 'IB SYSTEM S.R.L.',
    rnc: '1-31-89745-2',
    direccion: 'Av. Winston Churchill #1099, Torre Acrópolis, Nivel 14, Santo Domingo, R.D.',
    telefono: '+1 809-567-8900',
    email: 'contacto@ibsystem.com.do',
    moneda: 'USD (Dólares) / DOP (RD$)',
    combos: [
      {
        nombre: 'MICRO EMPRENDEDOR',
        costo_mensual: 25,
        descripcion: 'Ideal para negocios individuales y profesionales independientes.',
        usuarios_incluidos: 1,
      },
      {
        nombre: 'PYME',
        costo_mensual: 45,
        descripcion: 'Para pequeñas empresas con hasta 3 usuarios de facturación y cobro.',
        usuarios_incluidos: 3,
      },
      {
        nombre: 'EMPRESARIAL',
        costo_mensual: 90,
        descripcion: 'Para medianas empresas con operaciones en múltiples puntos de venta.',
        usuarios_incluidos: 5,
      },
      {
        nombre: 'EMPRESARIAL PRO',
        costo_mensual: 135,
        descripcion: 'Control total de inventario multi-sucursal y facturación masiva.',
        usuarios_incluidos: 10,
      },
      {
        nombre: 'EMPRESARIAL ULTRA',
        costo_mensual: 190,
        descripcion: 'Corporaciones con alto volumen de facturas electrónicas DGII y multi-almacén.',
        usuarios_incluidos: 20,
      },
    ],
    modulos_precios: [
      { nombre: 'Facturación Electrónica', costo_mensual: 8 },
      { nombre: 'POS Digital', costo_mensual: 8 },
      { nombre: 'Inventario', costo_mensual: 8 },
      { nombre: 'Compras', costo_mensual: 8 },
      { nombre: 'Ventas', costo_mensual: 8 },
      { nombre: 'Caja', costo_mensual: 8 },
      { nombre: 'Contabilidad', costo_mensual: 8 },
      { nombre: 'Cuentas por Cobrar', costo_mensual: 8 },
      { nombre: 'Cuentas por Pagar', costo_mensual: 8 },
      { nombre: 'Nómina', costo_mensual: 10 },
      { nombre: 'Gestión Humana', costo_mensual: 10 },
      { nombre: 'Reportes Gerenciales', costo_mensual: 8 },
    ],
  },
};

// Ensure directory exists
const serverDir = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

// Memory cache + file sync
let dbCache: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('[DB] Error leyendo base de datos, inicializando con datos por defecto', err);
    }
  }

  // Save initial database
  dbCache = JSON.parse(JSON.stringify(INITIAL_DATABASE));
  saveDatabase(dbCache!);
  return dbCache!;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error guardando base de datos persistente en disco', err);
  }
}

// Audit logger helper
export function addAuditLog(
  usuario: string,
  accion: AuditEntity['accion'],
  modulo: string,
  registro_afectado: string,
  detalles: string,
  ip: string = '127.0.0.1',
  usuario_id?: number
): void {
  const db = getDatabase();
  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const hora = now.toTimeString().slice(0, 8);

  const newLog: AuditEntity = {
    id: Date.now(),
    usuario,
    usuario_id,
    fecha,
    hora,
    accion,
    modulo,
    registro_afectado,
    detalles,
    ip,
  };

  db.auditoria.unshift(newLog);
  // Keep last 1000 logs
  if (db.auditoria.length > 1000) {
    db.auditoria = db.auditoria.slice(0, 1000);
  }

  saveDatabase(db);
}

// Notification logger helper
export function addNotification(
  titulo: string,
  mensaje: string,
  usuario: string,
  tipo: NotificationEntity['tipo'] = 'nuevo_prospecto'
): void {
  const db = getDatabase();
  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const hora = now.toTimeString().slice(0, 5);

  const newNotif: NotificationEntity = {
    id: Date.now(),
    titulo,
    mensaje,
    usuario,
    fecha,
    hora,
    leida: false,
    tipo,
  };

  db.notificaciones.unshift(newNotif);
  if (db.notificaciones.length > 500) {
    db.notificaciones = db.notificaciones.slice(0, 500);
  }

  saveDatabase(db);
}
