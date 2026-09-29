import {
  UsuarioDB,
  EtapaPipelineDB,
  ProspectoDB,
  ContactoDB,
  SeguimientoDB,
  TareaDB,
  ActividadDB,
  HistorialImportacionDB,
  HistorialExportacionDB,
  RegistroAuditoriaDB,
  NotificacionDB,
  SubcuentaDB,
  EtiquetaConfigDB,
  CampoPersonalizadoDB,
} from '../types/schema';

// Usuarios Oficiales del Sistema ITHOT - CRMComercial
export const INITIAL_USUARIOS: UsuarioDB[] = [
  {
    id: 1,
    nombre: 'Yenifer Reina Sena Suero',
    apellido: 'Sena Suero',
    email: 'yenifer.sena@ithot.com.do',
    usuario: 'ysena',
    password_hash: '$2b$12$e8Yk2uR1vN4QhO.WkX3yxe... (bcrypt)',
    password_plain: 'ITHOT2026*',
    rol: 'Administrador General',
    telefono: '+1 809-567-8900',
    activo: true,
    fecha_creacion: '2026-09-01 08:00:00',
    ultimo_acceso: '2026-09-29 08:30:00',
    empresa: 'ITHOT',
    subcuenta: 'ITHOT Sede Principal',
  },
  {
    id: 2,
    nombre: 'Armando Montes de Oca Hesni',
    apellido: 'Montes de Oca Hesni',
    email: 'armando.montes@ithot.com.do',
    usuario: 'amontes',
    password_hash: '$2b$12$K8J91uP1vN4QhO.WkX8yxe... (bcrypt)',
    password_plain: 'Montes2026*',
    rol: 'Supervisor Comercial',
    telefono: '+1 829-876-5432',
    activo: true,
    fecha_creacion: '2026-09-01 08:30:00',
    ultimo_acceso: '2026-09-29 08:15:00',
    empresa: 'ITHOT',
    subcuenta: 'ITHOT Sede Principal',
  },
  {
    id: 3,
    nombre: 'Felix Manuel Robles',
    apellido: 'Robles',
    email: 'felix.robles@ithot.com.do',
    usuario: 'frobles',
    password_hash: '$2b$12$Z1Q23uR1vN4QhO.WkX3yxe... (bcrypt)',
    password_plain: 'Robles2026*',
    rol: 'Ejecutivo Comercial',
    telefono: '+1 849-987-6543',
    activo: true,
    fecha_creacion: '2026-09-02 09:00:00',
    ultimo_acceso: '2026-09-29 07:50:00',
    empresa: 'ITHOT',
    subcuenta: 'ITHOT Sede Principal',
  },
  {
    id: 4,
    nombre: 'Ana Julia Alcántara',
    apellido: 'Alcántara',
    email: 'ana.alcantara@ithot.com.do',
    usuario: 'aalcantara',
    password_hash: '$2b$12$P4N56uR1vN4QhO.WkX3yxe... (bcrypt)',
    password_plain: 'Alcantara2026*',
    rol: 'Analista Comercial',
    telefono: '+1 809-456-7890',
    activo: true,
    fecha_creacion: '2026-09-02 09:30:00',
    ultimo_acceso: '2026-09-28 17:30:00',
    empresa: 'ITHOT',
    subcuenta: 'ITHOT Sede Principal',
  },
];

// Etapas del Pipeline Comercial Kanban
export const INITIAL_ETAPAS_PIPELINE: EtapaPipelineDB[] = [
  {
    id: 1,
    nombre: 'Nuevo Lead',
    orden: 1,
    color: '#0d6efd',
    descripcion: 'Prospecto captado recientemente, pendiente de primer contacto comercial.',
    es_etapa_final: false,
    es_ganado: false,
  },
  {
    id: 2,
    nombre: 'Contactado',
    orden: 2,
    color: '#0dcaf0',
    descripcion: 'Primer acercamiento realizado (vía telefónica o WhatsApp) con respuesta.',
    es_etapa_final: false,
    es_ganado: false,
  },
  {
    id: 3,
    nombre: 'Interesado',
    orden: 3,
    color: '#6610f2',
    descripcion: 'El prospecto demostró interés activo en soluciones ITHOT y cumple con el perfil calificado.',
    es_etapa_final: false,
    es_ganado: false,
  },
  {
    id: 4,
    nombre: 'Reunión Agendada',
    orden: 4,
    color: '#fd7e14',
    descripcion: 'Sesión de demostración técnica de ITHOT System / POS Digital confirmada en calendario.',
    es_etapa_final: false,
    es_ganado: false,
  },
  {
    id: 5,
    nombre: 'Propuesta Enviada',
    orden: 5,
    color: '#ffc107',
    descripcion: 'Cotización formal con módulos de Facturación Electrónica e Inventario entregada al cliente.',
    es_etapa_final: false,
    es_ganado: false,
  },
  {
    id: 6,
    nombre: 'Negociación',
    orden: 6,
    color: '#20c997',
    descripcion: 'Ajuste de términos de licenciamiento ITHOT, plazos de implementación y soporte.',
    es_etapa_final: false,
    es_ganado: false,
  },
  {
    id: 7,
    nombre: 'Ganado',
    orden: 7,
    color: '#198754',
    descripcion: 'Venta cerrada formalmente con contrato y orden de servicio ITHOT aceptada.',
    es_etapa_final: true,
    es_ganado: true,
  },
  {
    id: 8,
    nombre: 'Perdido',
    orden: 8,
    color: '#dc3545',
    descripcion: 'El prospecto declinó la propuesta o postergó la decisión comercial.',
    es_etapa_final: true,
    es_ganado: false,
  },
];

// Tabla: contactos (Módulo Independiente de Contactos - Empresas y Personas Dominicanas)
export const INITIAL_CONTACTOS: ContactoDB[] = [
  {
    id: 1,
    nombre: 'Rafael',
    apellido: 'Almonte Gómez',
    empresa: 'Auto Repuestos Central S.R.L.',
    cargo: 'Gerente General y Propietario',
    telefono: '+1 809-582-4411',
    whatsapp: '+1 829-340-2211',
    email: 'ralmonte@autorepuestoscentral.do',
    direccion: 'Av. Bartolomé Colón No. 85, Los Jardines',
    ciudad: 'Santiago de los Caballeros',
    provincia: 'Santiago',
    naturaleza_negocio: 'Comercio Mayorista / Repuestos Automotrices',
    usuario_id: 1, // Ing. Yenifer Sena
    fecha_registro: '2026-09-15 09:30:00',
    ultima_interaccion: '2026-09-28 09:15:00',
    proximo_seguimiento: '2026-09-29 10:30:00',
    estado_comercial: 'Prospecto',
    observaciones: 'Empresa líder de repuestos en Santiago con 3 sucursales. Requiere integración total con Facturación Electrónica DGII y control de inventario de más de 12,000 SKUs.',
    etiquetas: 'Prospecto, ITHOT System, Facturación Electrónica, Inventario, Compras',
    producto_interes: 'ITHOT System',
    modulo_interes: 'Inventario y Compras',
  },
  {
    id: 2,
    nombre: 'Carmen',
    apellido: 'De La Cruz',
    empresa: 'Distribuidora Corripio & Asociados',
    cargo: 'Directora de Operaciones Comerciales',
    telefono: '+1 809-566-1020',
    whatsapp: '+1 809-566-1020',
    email: 'c.delacruz@distcorripio.com.do',
    direccion: 'Av. John F. Kennedy Km 6.5, Edif. Corporativo',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    naturaleza_negocio: 'Distribuidora / Electrodomésticos y Retail',
    usuario_id: 2, // Lic. Valeria Rojas
    fecha_registro: '2026-09-10 11:00:00',
    ultima_interaccion: '2026-09-27 15:45:00',
    proximo_seguimiento: '2026-09-30 11:00:00',
    estado_comercial: 'Cliente Activo',
    observaciones: 'Cliente corporativo utilizando ITHOT System. En proceso de expansión del módulo de Cuentas por Cobrar y Reportería Gerencial.',
    etiquetas: 'Cliente Activo, ITHOT System, CRM Comercial, Cuentas por Cobrar, Reportes Gerenciales',
    producto_interes: 'CRM Comercial',
    modulo_interes: 'Cuentas por Cobrar',
  },
  {
    id: 3,
    nombre: 'Pedro',
    apellido: 'Martínez Santos',
    empresa: 'Supermercados Plaza Lama Express',
    cargo: 'Director Financiero & Tesorería',
    telefono: '+1 809-591-3300',
    whatsapp: '+1 829-771-4455',
    email: 'pmartinez@plazalama.com.do',
    direccion: 'Autopista San Isidro esq. Charles de Gaulle',
    ciudad: 'Santo Domingo Este',
    provincia: 'Santo Domingo',
    naturaleza_negocio: 'Supermercados / Gran Superficie Retail',
    usuario_id: 3, // Mateo Silva
    fecha_registro: '2026-09-18 14:00:00',
    ultima_interaccion: '2026-09-28 08:30:00',
    proximo_seguimiento: '2026-09-29 15:00:00',
    estado_comercial: 'Prospecto',
    observaciones: 'Evaluando implementar POS Digital en 14 cajas de cobro rápido con emisión de comprobantes fiscales electrónicos (e-CF) en tiempo real.',
    etiquetas: 'Prospecto, POS Digital, Facturación Electrónica, Inventario',
    producto_interes: 'POS Digital',
    modulo_interes: 'Facturación Electrónica',
  },
  {
    id: 4,
    nombre: 'Dra. Patricia',
    apellido: 'Peña Gómez',
    empresa: 'Farmacias Carol S.A.',
    cargo: 'Gerente Nacional de Compras',
    telefono: '+1 809-541-2000',
    whatsapp: '+1 849-880-9911',
    email: 'patricia.pena@farmaciascarol.com.do',
    direccion: 'Av. Gustavo Mejía Ricart No. 102, Ens. Naco',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    naturaleza_negocio: 'Cadena de Farmacias y Salud',
    usuario_id: 4, // Camila Herrera
    fecha_registro: '2026-09-12 10:20:00',
    ultima_interaccion: '2026-09-26 12:00:00',
    proximo_seguimiento: '2026-09-29 09:30:00',
    estado_comercial: 'Cliente',
    observaciones: 'Requiere actualización en la sincronización de inventario farmacéutico entre sucursales de Santo Domingo y Santiago.',
    etiquetas: 'Cliente, POS Digital, Inventario, Compras',
    producto_interes: 'POS Digital',
    modulo_interes: 'Inventario',
  },
  {
    id: 5,
    nombre: 'Marcos',
    apellido: 'Tavárez Valdez',
    empresa: 'Restaurante Adrian Tropical Malecón',
    cargo: 'Administrador General',
    telefono: '+1 809-688-6622',
    whatsapp: '+1 829-992-3344',
    email: 'mtavarez@adriantropical.do',
    direccion: 'Av. George Washington No. 1, Malecón',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    naturaleza_negocio: 'Restaurantes & Gastronomía',
    usuario_id: 1, // Ing. Yenifer Sena
    fecha_registro: '2026-09-20 16:30:00',
    ultima_interaccion: '2026-09-28 10:00:00',
    proximo_seguimiento: '2026-09-30 16:00:00',
    estado_comercial: 'Prospecto',
    observaciones: 'Interesados en cambiar software actual por POS Digital ITHOT con comanderas para meseros y facturación electrónica DGII.',
    etiquetas: 'Prospecto, POS Digital, Facturación Electrónica, Contabilidad',
    producto_interes: 'POS Digital',
    modulo_interes: 'Contabilidad',
  },
  {
    id: 6,
    nombre: 'Ing. José Luis',
    apellido: 'Morales Henríquez',
    empresa: 'Ferretería Americana & Hogar',
    cargo: 'Jefe de Almacén Central y Logística',
    telefono: '+1 809-583-1122',
    whatsapp: '+1 809-583-1122',
    email: 'jmorales@ferreteriaamericana.com.do',
    direccion: 'Av. 27 de Febrero esq. Estrella Sadhalá',
    ciudad: 'Santiago de los Caballeros',
    provincia: 'Santiago',
    naturaleza_negocio: 'Ferretería, Construcción y Hogar',
    usuario_id: 3, // Mateo Silva
    fecha_registro: '2026-09-08 09:00:00',
    ultima_interaccion: '2026-09-25 14:10:00',
    proximo_seguimiento: '2026-10-01 10:00:00',
    estado_comercial: 'Cliente Activo',
    observaciones: 'Implementaron ITHOT System ERP en sus bodegas. Operación estable con control estricto de compras y cuentas por pagar.',
    etiquetas: 'Cliente Activo, ITHOT System, Inventario, Compras, Contabilidad',
    producto_interes: 'ITHOT System',
    modulo_interes: 'Inventario',
  },
  {
    id: 7,
    nombre: 'Laura',
    apellido: 'Fernández Díaz',
    empresa: 'Helados Bon Franchise Group',
    cargo: 'Coordinadora de Franquicias Este',
    telefono: '+1 809-556-2488',
    whatsapp: '+1 829-450-8877',
    email: 'lfernandez@heladosbon.com.do',
    direccion: 'Calle Francisco Richiez No. 34',
    ciudad: 'La Romana',
    provincia: 'La Romana',
    naturaleza_negocio: 'Franquicias / Heladerías y Postres',
    usuario_id: 4, // Camila Herrera
    fecha_registro: '2026-09-14 15:40:00',
    ultima_interaccion: '2026-09-24 16:30:00',
    proximo_seguimiento: '2026-10-02 11:30:00',
    estado_comercial: 'Cliente',
    observaciones: 'Franquicias en La Romana y Bayahíbe utilizando POS Digital. Consultando por módulo de control de Cuentas por Cobrar entre franquiciados.',
    etiquetas: 'Cliente, POS Digital, Cuentas por Cobrar',
    producto_interes: 'POS Digital',
    modulo_interes: 'Cuentas por Cobrar',
  },
  {
    id: 8,
    nombre: 'Lic. Manuel Antonio',
    apellido: 'Ortiz Peguero',
    empresa: 'Caribe Tours Express Cargo',
    cargo: 'Director de Logística de Envíos',
    telefono: '+1 809-221-4422',
    whatsapp: '+1 849-332-1199',
    email: 'mortiz@caribetours.com.do',
    direccion: 'Av. Leopoldo Navarro esq. 27 de Febrero',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    naturaleza_negocio: 'Transporte y Envíos de Paquetería',
    usuario_id: 2, // Lic. Valeria Rojas
    fecha_registro: '2026-09-17 11:15:00',
    ultima_interaccion: '2026-09-27 10:20:00',
    proximo_seguimiento: '2026-09-30 09:00:00',
    estado_comercial: 'Prospecto',
    observaciones: 'Estudiando cotización para módulo de CRM Comercial e integración con e-CF Facturación Electrónica en sus terminales a nivel nacional.',
    etiquetas: 'Prospecto, Facturación Electrónica, CRM Comercial, Contabilidad',
    producto_interes: 'Facturación Electrónica',
    modulo_interes: 'Contabilidad',
  },
  {
    id: 9,
    nombre: 'Ing. Ramón Emilio',
    apellido: 'Cáceres Soler',
    empresa: 'Pinturas Tropical & Acabados del Caribe',
    cargo: 'Gerente de Planta y Producción',
    telefono: '+1 809-528-9000',
    whatsapp: '+1 829-663-2211',
    email: 'rcaceres@pinturastropical.do',
    direccion: 'Zona Industrial de Haina, Km 12',
    ciudad: 'San Cristóbal',
    provincia: 'San Cristóbal',
    naturaleza_negocio: 'Industria Química y Fabricación de Pinturas',
    usuario_id: 1, // Ing. Yenifer Sena
    fecha_registro: '2026-09-19 13:00:00',
    ultima_interaccion: '2026-09-28 11:10:00',
    proximo_seguimiento: '2026-10-01 14:00:00',
    estado_comercial: 'Prospecto',
    observaciones: 'Reunión confirmada con Ing. Yenifer Sena para demostración de control de fórmulas de producción y costos en ITHOT System.',
    etiquetas: 'Prospecto, ITHOT System, Inventario, Reportes Gerenciales',
    producto_interes: 'ITHOT System',
    modulo_interes: 'Reportes Gerenciales',
  },
  {
    id: 10,
    nombre: 'Lic. Beatriz',
    apellido: 'Quezada Reynoso',
    empresa: 'Inversiones Turísticas Punta Cana Resort',
    cargo: 'Directora de Contraloría y Finanzas',
    telefono: '+1 809-959-2222',
    whatsapp: '+1 829-959-1100',
    email: 'bquezada@puntacana.com.do',
    direccion: 'Boulevard Primero de Noviembre, Edif. Corporativo',
    ciudad: 'Punta Cana',
    provincia: 'La Altagracia',
    naturaleza_negocio: 'Hotelería, Turismo y Bienes Raíces',
    usuario_id: 1, // Ing. Yenifer Sena
    fecha_registro: '2026-09-05 10:00:00',
    ultima_interaccion: '2026-09-25 17:00:00',
    proximo_seguimiento: '2026-10-05 10:00:00',
    estado_comercial: 'Cliente Activo',
    observaciones: 'Gran cuenta hotelera operando con Facturación Electrónica DGII y contabilidad automatizada ITHOT. Excelente relación comercial.',
    etiquetas: 'Cliente Activo, Facturación Electrónica, Contabilidad, Reportes Gerenciales',
    producto_interes: 'Facturación Electrónica',
    modulo_interes: 'Contabilidad',
  },
  {
    id: 11,
    nombre: 'Darío',
    apellido: 'Báez Mota',
    empresa: 'Almacenes Iberia San Pedro',
    cargo: 'Gerente de Sucursal',
    telefono: '+1 809-529-3311',
    whatsapp: '+1 829-529-3311',
    email: 'dbaez@almacenesiberia.com.do',
    direccion: 'Calle Independencia esq. 27 de Febrero',
    ciudad: 'San Pedro de Macorís',
    provincia: 'San Pedro de Macorís',
    naturaleza_negocio: 'Tienda por Departamentos y Supermercado',
    usuario_id: 3, // Mateo Silva
    fecha_registro: '2026-09-21 12:45:00',
    ultima_interaccion: '2026-09-27 16:30:00',
    proximo_seguimiento: '2026-09-30 15:30:00',
    estado_comercial: 'Cliente Inactivo',
    observaciones: 'Fue cliente de versión previa. Se les envió propuesta de reactivación y actualización a la nube con Facturación Electrónica.',
    etiquetas: 'Cliente Inactivo, Facturación Electrónica, POS Digital',
    producto_interes: 'POS Digital',
    modulo_interes: 'Facturación Electrónica',
  },
  {
    id: 12,
    nombre: 'Elena',
    apellido: 'Guzmán Castillo',
    empresa: 'Laboratorios Clínicos Patria',
    cargo: 'Gerente Administrativa',
    telefono: '+1 809-588-7744',
    whatsapp: '+1 849-588-7744',
    email: 'eguzman@laboratoriospatria.do',
    direccion: 'Calle San Francisco No. 52',
    ciudad: 'San Francisco de Macorís',
    provincia: 'Duarte',
    naturaleza_negocio: 'Salud / Análisis Clínicos y Diagnóstico',
    usuario_id: 4, // Camila Herrera
    fecha_registro: '2026-09-22 10:10:00',
    ultima_interaccion: '2026-09-26 11:40:00',
    proximo_seguimiento: '2026-09-29 16:30:00',
    estado_comercial: 'Prospecto',
    observaciones: 'Solicitó cotización de Facturación Electrónica DGII para 4 sedes de toma de muestras en la provincia Duarte.',
    etiquetas: 'Prospecto, Facturación Electrónica, Cuentas por Cobrar',
    producto_interes: 'Facturación Electrónica',
    modulo_interes: 'Cuentas por Cobrar',
  },
];

// Tabla: prospectos (Oportunidades Comerciales Dominicanas Vinculadas con ITHOT)
export const INITIAL_PROSPECTOS: ProspectoDB[] = [
  {
    id: 101,
    nombre: 'Rafael',
    apellido: 'Almonte Gómez',
    empresa: 'Auto Repuestos Central S.R.L.',
    cargo: 'Gerente General y Propietario',
    email: 'ralmonte@autorepuestoscentral.do',
    telefono: '+1 809-582-4411',
    whatsapp: '+1 829-340-2211',
    fuente: 'Referido',
    etapa_id: 1, // Nuevo Lead
    usuario_id: 1, // Ing. Yenifer Sena
    valor_estimado: 245000.0, // RD$
    fecha_registro: '2026-09-28 08:45:00',
    fecha_proximo_seguimiento: '2026-09-29 10:30:00',
    notas: 'Empresa líder de repuestos en Santiago. Requiere cotización formal de ITHOT System + Facturación Electrónica para 3 sucursales.',
    etiquetas: 'Prospecto, ITHOT System, Facturación Electrónica, Inventario, Compras',
    contacto_id: 1,
    naturaleza_negocio: 'Comercio Mayorista / Repuestos Automotrices',
    producto_interes: 'ITHOT System',
    modulo_interes: 'Inventario y Compras',
    direccion: 'Av. Bartolomé Colón No. 85, Los Jardines',
    ciudad: 'Santiago de los Caballeros',
    provincia: 'Santiago',
    ultima_interaccion: '2026-09-28 09:15:00',
  },
  {
    id: 102,
    nombre: 'Carmen',
    apellido: 'De La Cruz',
    empresa: 'Distribuidora Corripio & Asociados',
    cargo: 'Directora de Operaciones Comerciales',
    email: 'c.delacruz@distcorripio.com.do',
    telefono: '+1 809-566-1020',
    whatsapp: '+1 809-566-1020',
    fuente: 'LinkedIn',
    etapa_id: 2, // Contactado
    usuario_id: 2, // Lic. Valeria Rojas
    valor_estimado: 480000.0,
    fecha_registro: '2026-09-27 10:15:00',
    fecha_proximo_seguimiento: '2026-09-30 11:00:00',
    notas: 'Llamada telefónica realizada. Interés en expandir licencias de CRM Comercial y reportería gerencial en tiempo real.',
    etiquetas: 'Cliente Activo, ITHOT System, CRM Comercial, Reportes Gerenciales',
    contacto_id: 2,
    naturaleza_negocio: 'Distribuidora / Electrodomésticos y Retail',
    producto_interes: 'CRM Comercial',
    modulo_interes: 'Cuentas por Cobrar',
    direccion: 'Av. John F. Kennedy Km 6.5',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    ultima_interaccion: '2026-09-27 15:45:00',
  },
  {
    id: 103,
    nombre: 'Pedro',
    apellido: 'Martínez Santos',
    empresa: 'Supermercados Plaza Lama Express',
    cargo: 'Director Financiero & Tesorería',
    email: 'pmartinez@plazalama.com.do',
    telefono: '+1 809-591-3300',
    whatsapp: '+1 829-771-4455',
    fuente: 'Google Ads',
    etapa_id: 3, // Interesado
    usuario_id: 3, // Mateo Silva
    valor_estimado: 385000.0,
    fecha_registro: '2026-09-25 14:20:00',
    fecha_proximo_seguimiento: '2026-09-29 15:00:00',
    notas: 'Interesados en renovar 14 puntos de venta con POS Digital y certificación e-CF ante la DGII.',
    etiquetas: 'Prospecto, POS Digital, Facturación Electrónica, Inventario',
    contacto_id: 3,
    naturaleza_negocio: 'Supermercados / Gran Superficie Retail',
    producto_interes: 'POS Digital',
    modulo_interes: 'Facturación Electrónica',
    direccion: 'Autopista San Isidro esq. Charles de Gaulle',
    ciudad: 'Santo Domingo Este',
    provincia: 'Santo Domingo',
    ultima_interaccion: '2026-09-28 08:30:00',
  },
  {
    id: 104,
    nombre: 'Patricia',
    apellido: 'Peña Gómez',
    empresa: 'Farmacias Carol S.A.',
    cargo: 'Gerente Nacional de Compras',
    email: 'patricia.pena@farmaciascarol.com.do',
    telefono: '+1 809-541-2000',
    whatsapp: '+1 849-880-9911',
    fuente: 'Sitio Web',
    etapa_id: 4, // Reunión Agendada
    usuario_id: 4, // Camila Herrera
    valor_estimado: 590000.0,
    fecha_registro: '2026-09-24 16:00:00',
    fecha_proximo_seguimiento: '2026-09-29 09:30:00',
    notas: 'Demostración confirmada por Google Meet con el comité directivo de Farmacias Carol sobre módulo de Compras e Inventarios.',
    etiquetas: 'Cliente, POS Digital, Inventario, Compras',
    contacto_id: 4,
    naturaleza_negocio: 'Cadena de Farmacias y Salud',
    producto_interes: 'POS Digital',
    modulo_interes: 'Inventario',
    direccion: 'Av. Gustavo Mejía Ricart No. 102',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    ultima_interaccion: '2026-09-26 12:00:00',
  },
  {
    id: 105,
    nombre: 'Marcos',
    apellido: 'Tavárez Valdez',
    empresa: 'Restaurante Adrian Tropical Malecón',
    cargo: 'Administrador General',
    email: 'mtavarez@adriantropical.do',
    telefono: '+1 809-688-6622',
    whatsapp: '+1 829-992-3344',
    fuente: 'WhatsApp Inbound',
    etapa_id: 5, // Propuesta Enviada
    usuario_id: 1, // Ing. Yenifer Sena
    valor_estimado: 320000.0,
    fecha_registro: '2026-09-20 11:30:00',
    fecha_proximo_seguimiento: '2026-09-30 16:00:00',
    notas: 'Cotización formal entregada con desglose de equipos POS Digital, impresoras térmicas y licenciamiento de facturación electrónica.',
    etiquetas: 'Prospecto, POS Digital, Facturación Electrónica, Contabilidad',
    contacto_id: 5,
    naturaleza_negocio: 'Restaurantes & Gastronomía',
    producto_interes: 'POS Digital',
    modulo_interes: 'Contabilidad',
    direccion: 'Av. George Washington No. 1',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    ultima_interaccion: '2026-09-28 10:00:00',
  },
  {
    id: 106,
    nombre: 'José Luis',
    apellido: 'Morales Henríquez',
    empresa: 'Ferretería Americana & Hogar',
    cargo: 'Jefe de Almacén Central y Logística',
    email: 'jmorales@ferreteriaamericana.com.do',
    telefono: '+1 809-583-1122',
    whatsapp: '+1 809-583-1122',
    fuente: 'Evento / Feria',
    etapa_id: 6, // Negociación
    usuario_id: 3, // Mateo Silva
    valor_estimado: 750000.0,
    fecha_registro: '2026-09-18 15:00:00',
    fecha_proximo_seguimiento: '2026-10-01 10:00:00',
    notas: 'Negociando términos de soporte 24/7 y capacitación presencial para el equipo de Santiago y Santo Domingo.',
    etiquetas: 'Cliente Activo, ITHOT System, Inventario, Compras, Contabilidad',
    contacto_id: 6,
    naturaleza_negocio: 'Ferretería, Construcción y Hogar',
    producto_interes: 'ITHOT System',
    modulo_interes: 'Inventario',
    direccion: 'Av. 27 de Febrero esq. Estrella Sadhalá',
    ciudad: 'Santiago de los Caballeros',
    provincia: 'Santiago',
    ultima_interaccion: '2026-09-25 14:10:00',
  },
  {
    id: 107,
    nombre: 'Ramón Emilio',
    apellido: 'Cáceres Soler',
    empresa: 'Pinturas Tropical & Acabados del Caribe',
    cargo: 'Gerente de Planta y Producción',
    email: 'rcaceres@pinturastropical.do',
    telefono: '+1 809-528-9000',
    whatsapp: '+1 829-663-2211',
    fuente: 'Referido',
    etapa_id: 7, // Ganado
    usuario_id: 1, // Ing. Yenifer Sena
    valor_estimado: 920000.0,
    fecha_registro: '2026-09-10 09:00:00',
    fecha_proximo_seguimiento: null,
    notas: 'Contrato firmado para implementación completa de ITHOT System ERP en la planta de San Cristóbal.',
    etiquetas: 'Cliente Activo, ITHOT System, Inventario, Reportes Gerenciales',
    contacto_id: 9,
    naturaleza_negocio: 'Industria Química y Fabricación de Pinturas',
    producto_interes: 'ITHOT System',
    modulo_interes: 'Reportes Gerenciales',
    direccion: 'Zona Industrial de Haina, Km 12',
    ciudad: 'San Cristóbal',
    provincia: 'San Cristóbal',
    ultima_interaccion: '2026-09-28 11:10:00',
  },
  {
    id: 108,
    nombre: 'Manuel Antonio',
    apellido: 'Ortiz Peguero',
    empresa: 'Caribe Tours Express Cargo',
    cargo: 'Director de Logística de Envíos',
    email: 'mortiz@caribetours.com.do',
    telefono: '+1 809-221-4422',
    whatsapp: '+1 849-332-1199',
    fuente: 'Meta Ads',
    etapa_id: 8, // Perdido
    usuario_id: 2, // Lic. Valeria Rojas
    valor_estimado: 210000.0,
    fecha_registro: '2026-09-08 14:00:00',
    fecha_proximo_seguimiento: null,
    notas: 'Aplazaron el proyecto para el Q1 del próximo año debido a auditoría interna.',
    etiquetas: 'Prospecto, Facturación Electrónica, CRM Comercial',
    contacto_id: 8,
    naturaleza_negocio: 'Transporte y Envíos de Paquetería',
    producto_interes: 'Facturación Electrónica',
    modulo_interes: 'Contabilidad',
    direccion: 'Av. Leopoldo Navarro esq. 27 de Febrero',
    ciudad: 'Santo Domingo',
    provincia: 'Distrito Nacional',
    ultima_interaccion: '2026-09-27 10:20:00',
  },
];

// Tabla: seguimientos
export const INITIAL_SEGUIMIENTOS: SeguimientoDB[] = [
  {
    id: 1,
    prospecto_id: 101, // Auto Repuestos Central
    usuario_id: 1, // Ing. Yenifer Sena
    canal: 'WhatsApp',
    resultado: 'Interesado',
    fecha_hora: '2026-09-28 09:15:00',
    observaciones: 'Se envió catálogo técnico de ITHOT System y brochure de Facturación Electrónica DGII al Ing. Rafael Almonte.',
    proxima_accion: 'Llamada telefónica para coordinar reunión presencial en Santiago',
    fecha_proxima_accion: '2026-09-29 10:30:00',
    creado_en: '2026-09-28 09:18:00',
  },
  {
    id: 2,
    prospecto_id: 105, // Adrian Tropical
    usuario_id: 1, // Ing. Yenifer Sena
    canal: 'Reunión Presencial',
    resultado: 'Exitoso / Contactado',
    fecha_hora: '2026-09-28 10:00:00',
    observaciones: 'Reunión en la sucursal del Malecón con el Administrador Marcos Tavárez. Quedaron conformes con la demo de POS Digital y rapidez de cobro.',
    proxima_accion: 'Envío de propuesta económica final con opción de financiamiento',
    fecha_proxima_accion: '2026-09-30 16:00:00',
    creado_en: '2026-09-28 11:20:00',
  },
  {
    id: 3,
    prospecto_id: 103, // Plaza Lama
    usuario_id: 3, // Mateo Silva
    canal: 'Llamada',
    resultado: 'Interesado',
    fecha_hora: '2026-09-28 08:30:00',
    observaciones: 'Llamada con el Lic. Pedro Martínez para validar capacidad de timbrado concurrente con e-CF de la DGII.',
    proxima_accion: 'Envío de ficha técnica de integración API ITHOT',
    fecha_proxima_accion: '2026-09-29 15:00:00',
    creado_en: '2026-09-28 08:45:00',
  },
  {
    id: 4,
    prospecto_id: 102, // Distribuidora Corripio
    usuario_id: 2, // Lic. Valeria Rojas
    canal: 'Correo Electrónico',
    resultado: 'Exitoso / Contactado',
    fecha_hora: '2026-09-27 15:45:00',
    observaciones: 'Envío de actualización de cotización para 10 licencias adicionales de CRM Comercial y reportería gerencial.',
    proxima_accion: 'Confirmación de recepción con la Lic. Carmen De La Cruz',
    fecha_proxima_accion: '2026-09-30 11:00:00',
    creado_en: '2026-09-27 15:50:00',
  },
  {
    id: 5,
    prospecto_id: 104, // Farmacias Carol
    usuario_id: 4, // Camila Herrera
    canal: 'Videoconferencia',
    resultado: 'Exitoso / Contactado',
    fecha_hora: '2026-09-26 12:00:00',
    observaciones: 'Sesión por Google Meet explicando el módulo de Compras e Inventarios multicentro.',
    proxima_accion: 'Preparar sesión con el comité directivo de Farmacias Carol',
    fecha_proxima_accion: '2026-09-29 09:30:00',
    creado_en: '2026-09-26 13:10:00',
  },
];

// Tabla: tareas
export const INITIAL_TAREAS: TareaDB[] = [
  {
    id: 1,
    prospecto_id: 101,
    usuario_id: 1, // Ing. Yenifer Sena
    titulo: 'Llamada de confirmación demo ITHOT en Santiago',
    descripcion: 'Llamar al Ing. Rafael Almonte de Auto Repuestos Central para coordinar visita presencial a la sucursal de Los Jardines.',
    prioridad: 'Alta',
    estado: 'Pendiente',
    fecha_limite: '2026-09-29',
    hora_limite: '10:30',
    fecha_creacion: '2026-09-28 09:30:00',
  },
  {
    id: 2,
    prospecto_id: 105,
    usuario_id: 1, // Ing. Yenifer Sena
    titulo: 'Enviar propuesta formal POS Digital a Adrian Tropical',
    descripcion: 'Preparar documento PDF con desglose de terminales POS Digital, comanderas y servicio de Facturación Electrónica DGII.',
    prioridad: 'Alta',
    estado: 'Pendiente',
    fecha_limite: '2026-09-30',
    hora_limite: '16:00',
    fecha_creacion: '2026-09-28 11:30:00',
  },
  {
    id: 3,
    prospecto_id: 103,
    usuario_id: 3, // Mateo Silva
    titulo: 'Enviar especificaciones técnicas e-CF a Plaza Lama',
    descripcion: 'Enviar al Lic. Pedro Martínez documentación técnica de seguridad de certificados digitales DGII.',
    prioridad: 'Media',
    estado: 'Pendiente',
    fecha_limite: '2026-09-29',
    hora_limite: '15:00',
    fecha_creacion: '2026-09-28 09:00:00',
  },
  {
    id: 4,
    prospecto_id: 104,
    usuario_id: 4, // Camila Herrera
    titulo: 'Sesión técnica online con Farmacias Carol',
    descripcion: 'Presentación en vivo del módulo de compras automáticas con la Dra. Patricia Peña.',
    prioridad: 'Alta',
    estado: 'Pendiente',
    fecha_limite: '2026-09-29',
    hora_limite: '09:30',
    fecha_creacion: '2026-09-26 14:00:00',
  },
];

// Tabla: actividades programadas
export const INITIAL_ACTIVIDADES: ActividadDB[] = [
  {
    id: 1,
    prospecto_id: 101,
    usuario_id: 1,
    tipo: 'Reunión Presencial',
    titulo: 'Demostración de ITHOT System en Santiago',
    descripcion: 'Presentación de software de inventarios y facturación electrónica a Auto Repuestos Central.',
    fecha_programada: '2026-09-29 10:30:00',
    completada: false,
    fecha_completada: null,
  },
  {
    id: 2,
    prospecto_id: 104,
    usuario_id: 4,
    tipo: 'Videoconferencia',
    titulo: 'Presentación con Directiva Farmacias Carol',
    descripcion: 'Reunión virtual sobre integración de POS Digital en farmacias.',
    fecha_programada: '2026-09-29 09:30:00',
    completada: false,
    fecha_completada: null,
  },
];

// Tabla: historial_importaciones
export const INITIAL_HISTORIAL_IMPORTACIONES: HistorialImportacionDB[] = [
  {
    id: 1,
    fecha: '2026-09-28',
    hora: '07:30',
    usuario: 'Ing. Yenifer Sena',
    archivo: 'cartera_clientes_empresas_rd.xlsx',
    tipo: 'Contactos',
    registros_procesados: 12,
    registros_correctos: 12,
    registros_con_error: 0,
    estado: 'Exitoso',
  },
  {
    id: 2,
    fecha: '2026-09-27',
    hora: '14:20',
    usuario: 'Lic. Valeria Rojas',
    archivo: 'oportunidades_ithot_pos.csv',
    tipo: 'Prospectos',
    registros_procesados: 8,
    registros_correctos: 8,
    registros_con_error: 0,
    estado: 'Exitoso',
  },
];

// Tabla: historial_exportaciones
export const INITIAL_HISTORIAL_EXPORTACIONES: HistorialExportacionDB[] = [
  {
    id: 1,
    fecha: '2026-09-28',
    hora: '08:00',
    usuario: 'Yenifer Reina Sena Suero',
    archivo_generado: 'informe_ejecutivo_ithot_crm.pdf',
    tipo: 'Reportes',
    formato: 'PDF (.pdf)',
    cantidad_registros: 8,
  },
];

// Subcuentas / Sucursales corporativas de ITHOT
export const INITIAL_SUBCUENTAS: SubcuentaDB[] = [
  {
    id: 1,
    nombre: 'ITHOT Sede Principal',
    empresa_matriz: 'ITHOT',
    codigo: 'ITH-SDQ-01',
    responsable: 'Yenifer Reina Sena Suero',
    direccion: 'Av. Winston Churchill #1099, Torre Acrópolis, Nivel 14',
    ciudad: 'Santo Domingo',
    telefono: '+1 809-567-8900',
    usuarios_count: 4,
    fecha_creacion: '2026-01-15 09:00:00',
    activa: true,
  },
  {
    id: 2,
    nombre: 'ITHOT Sucursal Cibao',
    empresa_matriz: 'ITHOT',
    codigo: 'ITH-STI-02',
    responsable: 'Armando Montes de Oca Hesni',
    direccion: 'Av. Juan Pablo Duarte esq. Estrella Sadhalá',
    ciudad: 'Santiago de los Caballeros',
    telefono: '+1 809-582-4411',
    usuarios_count: 2,
    fecha_creacion: '2026-03-20 10:30:00',
    activa: true,
  },
  {
    id: 3,
    nombre: 'ITHOT Sucursal Este (Turística)',
    empresa_matriz: 'ITHOT',
    codigo: 'ITH-PC-03',
    responsable: 'Felix Manuel Robles',
    direccion: 'Boulevard Primero de Noviembre, Punta Cana Village',
    ciudad: 'Punta Cana',
    telefono: '+1 809-959-2222',
    usuarios_count: 1,
    fecha_creacion: '2026-06-10 11:00:00',
    activa: true,
  },
];

// Catálogo de Etiquetas Configurables de ITHOT
export const INITIAL_ETIQUETAS_CONFIG: EtiquetaConfigDB[] = [
  { id: 1, nombre: 'Cliente', color: '#10b981', categoria: 'Estado', activa: true },
  { id: 2, nombre: 'Prospecto', color: '#3b82f6', categoria: 'Estado', activa: true },
  { id: 3, nombre: 'Cliente Activo', color: '#059669', categoria: 'Estado', activa: true },
  { id: 4, nombre: 'Cliente Inactivo', color: '#ef4444', categoria: 'Estado', activa: true },
  { id: 5, nombre: 'ITHOT System', color: '#6366f1', categoria: 'Producto', activa: true },
  { id: 6, nombre: 'POS Digital', color: '#8b5cf6', categoria: 'Producto', activa: true },
  { id: 7, nombre: 'Facturación Electrónica', color: '#06b6d4', categoria: 'Fiscal DGII', activa: true },
  { id: 8, nombre: 'CRM Comercial', color: '#ec4899', categoria: 'Producto', activa: true },
  { id: 9, nombre: 'Inventario', color: '#f59e0b', categoria: 'Módulo', activa: true },
  { id: 10, nombre: 'Compras', color: '#84cc16', categoria: 'Módulo', activa: true },
  { id: 11, nombre: 'Ventas', color: '#14b8a6', categoria: 'Módulo', activa: true },
  { id: 12, nombre: 'Caja', color: '#f97316', categoria: 'Módulo', activa: true },
  { id: 13, nombre: 'Contabilidad', color: '#64748b', categoria: 'Módulo', activa: true },
  { id: 14, nombre: 'Cuentas por Cobrar', color: '#eab308', categoria: 'Módulo', activa: true },
  { id: 15, nombre: 'Cuentas por Pagar', color: '#f43f5e', categoria: 'Módulo', activa: true },
  { id: 16, nombre: 'Reportes Gerenciales', color: '#a855f7', categoria: 'Módulo', activa: true },
];

// Campos Personalizados Configurables
export const INITIAL_CAMPOS_PERSONALIZADOS: CampoPersonalizadoDB[] = [
  {
    id: 1,
    modulo: 'Ambos',
    nombre_campo: 'rnc_cedula',
    etiqueta: 'RNC / Cédula DGII',
    tipo: 'Texto',
    requerido: false,
    activo: true,
  },
  {
    id: 2,
    modulo: 'Prospectos',
    nombre_campo: 'probabilidad_cierre',
    etiqueta: 'Probabilidad de Cierre (%)',
    tipo: 'Número',
    requerido: false,
    activo: true,
  },
  {
    id: 3,
    modulo: 'Contactos',
    nombre_campo: 'sector_economico',
    etiqueta: 'Sector Económico',
    tipo: 'Selección',
    opciones: ['Comercio Retail', 'Construcción y Ferretería', 'Farmacéutico', 'Hotelero / Gastronómico', 'Servicios Profesionales', 'Industrial'],
    requerido: false,
    activo: true,
  },
];

// Registros Iniciales de Auditoría del Sistema
export const INITIAL_REGISTROS_AUDITORIA: RegistroAuditoriaDB[] = [
  {
    id: 1,
    usuario: 'Yenifer Reina Sena Suero',
    usuario_id: 1,
    fecha: '2026-09-29',
    hora: '08:35:12',
    accion: 'Creación',
    modulo: 'Prospectos',
    registro_afectado: 'Ferretería & Maderas del Ozama',
    detalles: 'Registró nueva oportunidad comercial para ITHOT System y Facturación Electrónica por RD$ 480,000.',
    ip_simulada: '190.167.34.12',
  },
  {
    id: 2,
    usuario: 'Felix Manuel Robles',
    usuario_id: 3,
    fecha: '2026-09-29',
    hora: '08:12:44',
    accion: 'Actualización',
    modulo: 'Contactos',
    registro_afectado: 'Fausto Henríquez (Supermercados El Conde)',
    detalles: 'Actualizó teléfono directo y agregó nota sobre evaluación de 12 terminales POS Digital.',
    ip_simulada: '190.167.34.15',
  },
  {
    id: 3,
    usuario: 'Armando Montes de Oca Hesni',
    usuario_id: 2,
    fecha: '2026-09-29',
    hora: '07:45:00',
    accion: 'Cambio de Etapa',
    modulo: 'Pipeline',
    registro_afectado: 'Repuestos & Talleres Cibao',
    detalles: 'Movió la oportunidad de la etapa "Propuesta Enviada" a "Negociación".',
    ip_simulada: '190.167.34.18',
  },
  {
    id: 4,
    usuario: 'Ana Julia Alcántara',
    usuario_id: 4,
    fecha: '2026-09-28',
    hora: '17:20:10',
    accion: 'Importación',
    modulo: 'Importaciones',
    registro_afectado: 'lote_empresas_industriales_rd.xlsx',
    detalles: 'Importó exitosamente 15 empresas dominicanas con deduplicación y sincronización de contactos.',
    ip_simulada: '190.167.34.22',
  },
  {
    id: 5,
    usuario: 'Yenifer Reina Sena Suero',
    usuario_id: 1,
    fecha: '2026-09-28',
    hora: '16:00:25',
    accion: 'Creación',
    modulo: 'Usuarios y Roles',
    registro_afectado: 'Ana Julia Alcántara (Analista Comercial)',
    detalles: 'Creó y activó usuario para Ana Julia Alcántara bajo la subcuenta ITHOT Sede Principal.',
    ip_simulada: '190.167.34.12',
  },
];

// Notificaciones del Sistema en Tiempo Real
export const INITIAL_NOTIFICACIONES: NotificacionDB[] = [
  {
    id: 1,
    titulo: 'Nuevo prospecto creado',
    mensaje: 'Yenifer Reina Sena Suero creó la oportunidad "Ferretería & Maderas del Ozama" (RD$ 480,000).',
    tipo: 'nuevo_prospecto',
    usuario_origen: 'Yenifer Reina Sena Suero',
    fecha: '2026-09-29',
    hora: '08:35',
    leida: false,
    modulo_destino: 'prospectos',
  },
  {
    id: 2,
    titulo: 'Oportunidad movida de etapa',
    mensaje: 'Armando Montes de Oca movió "Repuestos & Talleres Cibao" a la etapa Negociación.',
    tipo: 'oportunidad_movida',
    usuario_origen: 'Armando Montes de Oca Hesni',
    fecha: '2026-09-29',
    hora: '07:45',
    leida: false,
    modulo_destino: 'pipeline',
  },
  {
    id: 3,
    titulo: 'Contacto actualizado',
    mensaje: 'Felix Manuel Robles actualizó los datos comerciales de Fausto Henríquez.',
    tipo: 'prospecto_actualizado',
    usuario_origen: 'Felix Manuel Robles',
    fecha: '2026-09-29',
    hora: '08:12',
    leida: false,
    modulo_destino: 'contactos',
  },
  {
    id: 4,
    titulo: 'Nueva importación realizada',
    mensaje: 'Ana Julia Alcántara importó 15 empresas desde archivo Excel con actualización de registros.',
    tipo: 'nueva_importacion',
    usuario_origen: 'Ana Julia Alcántara',
    fecha: '2026-09-28',
    hora: '17:20',
    leida: true,
    modulo_destino: 'importaciones',
  },
];

const STORAGE_PREFIX = 'crm_v4_ithot_';

export function loadRelationalData(): {
  usuarios: UsuarioDB[];
  etapas: EtapaPipelineDB[];
  prospectos: ProspectoDB[];
  contactos: ContactoDB[];
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
} {
  try {
    const rawUsuarios = localStorage.getItem(STORAGE_PREFIX + 'usuarios');
    const rawEtapas = localStorage.getItem(STORAGE_PREFIX + 'etapas');
    const rawProspectos = localStorage.getItem(STORAGE_PREFIX + 'prospectos');
    const rawContactos = localStorage.getItem(STORAGE_PREFIX + 'contactos');
    const rawSeguimientos = localStorage.getItem(STORAGE_PREFIX + 'seguimientos');
    const rawTareas = localStorage.getItem(STORAGE_PREFIX + 'tareas');
    const rawActividades = localStorage.getItem(STORAGE_PREFIX + 'actividades');
    const rawImportaciones = localStorage.getItem(STORAGE_PREFIX + 'importaciones');
    const rawExportaciones = localStorage.getItem(STORAGE_PREFIX + 'exportaciones');
    const rawSubcuentas = localStorage.getItem(STORAGE_PREFIX + 'subcuentas');
    const rawEtiquetasConfig = localStorage.getItem(STORAGE_PREFIX + 'etiquetas_config');
    const rawCamposPersonalizados = localStorage.getItem(STORAGE_PREFIX + 'campos_personalizados');
    const rawAuditoria = localStorage.getItem(STORAGE_PREFIX + 'auditoria');
    const rawNotificaciones = localStorage.getItem(STORAGE_PREFIX + 'notificaciones');

    let loadedUsuarios: UsuarioDB[] = rawUsuarios ? JSON.parse(rawUsuarios) : INITIAL_USUARIOS;

    // Asegurar que los 4 usuarios corporativos requeridos siempre estén presentes
    const hasYenifer = loadedUsuarios.some((u) => u.nombre.includes('Yenifer'));
    const hasFelix = loadedUsuarios.some((u) => u.nombre.includes('Felix') || u.nombre.includes('Félix'));
    const hasArmando = loadedUsuarios.some((u) => u.nombre.includes('Armando'));
    const hasAna = loadedUsuarios.some((u) => u.nombre.includes('Ana Julia'));

    if (!hasYenifer || !hasFelix || !hasArmando || !hasAna) {
      loadedUsuarios = INITIAL_USUARIOS;
    }

    return {
      usuarios: loadedUsuarios,
      etapas: rawEtapas ? JSON.parse(rawEtapas) : INITIAL_ETAPAS_PIPELINE,
      prospectos: rawProspectos ? JSON.parse(rawProspectos) : INITIAL_PROSPECTOS,
      contactos: rawContactos ? JSON.parse(rawContactos) : INITIAL_CONTACTOS,
      seguimientos: rawSeguimientos ? JSON.parse(rawSeguimientos) : INITIAL_SEGUIMIENTOS,
      tareas: rawTareas ? JSON.parse(rawTareas) : INITIAL_TAREAS,
      actividades: rawActividades ? JSON.parse(rawActividades) : INITIAL_ACTIVIDADES,
      historialImportaciones: rawImportaciones ? JSON.parse(rawImportaciones) : INITIAL_HISTORIAL_IMPORTACIONES,
      historialExportaciones: rawExportaciones ? JSON.parse(rawExportaciones) : INITIAL_HISTORIAL_EXPORTACIONES,
      subcuentas: rawSubcuentas ? JSON.parse(rawSubcuentas) : INITIAL_SUBCUENTAS,
      etiquetasConfig: rawEtiquetasConfig ? JSON.parse(rawEtiquetasConfig) : INITIAL_ETIQUETAS_CONFIG,
      camposPersonalizados: rawCamposPersonalizados ? JSON.parse(rawCamposPersonalizados) : INITIAL_CAMPOS_PERSONALIZADOS,
      registrosAuditoria: rawAuditoria ? JSON.parse(rawAuditoria) : INITIAL_REGISTROS_AUDITORIA,
      notificaciones: rawNotificaciones ? JSON.parse(rawNotificaciones) : INITIAL_NOTIFICACIONES,
    };
  } catch (e) {
    console.error('Error cargando datos relacionales', e);
    return {
      usuarios: INITIAL_USUARIOS,
      etapas: INITIAL_ETAPAS_PIPELINE,
      prospectos: INITIAL_PROSPECTOS,
      contactos: INITIAL_CONTACTOS,
      seguimientos: INITIAL_SEGUIMIENTOS,
      tareas: INITIAL_TAREAS,
      actividades: INITIAL_ACTIVIDADES,
      historialImportaciones: INITIAL_HISTORIAL_IMPORTACIONES,
      historialExportaciones: INITIAL_HISTORIAL_EXPORTACIONES,
      subcuentas: INITIAL_SUBCUENTAS,
      etiquetasConfig: INITIAL_ETIQUETAS_CONFIG,
      camposPersonalizados: INITIAL_CAMPOS_PERSONALIZADOS,
      registrosAuditoria: INITIAL_REGISTROS_AUDITORIA,
      notificaciones: INITIAL_NOTIFICACIONES,
    };
  }
}

export function saveRelationalData(data: {
  usuarios: UsuarioDB[];
  etapas: EtapaPipelineDB[];
  prospectos: ProspectoDB[];
  contactos: ContactoDB[];
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
}) {
  try {
    localStorage.setItem(STORAGE_PREFIX + 'usuarios', JSON.stringify(data.usuarios));
    localStorage.setItem(STORAGE_PREFIX + 'etapas', JSON.stringify(data.etapas));
    localStorage.setItem(STORAGE_PREFIX + 'prospectos', JSON.stringify(data.prospectos));
    localStorage.setItem(STORAGE_PREFIX + 'contactos', JSON.stringify(data.contactos));
    localStorage.setItem(STORAGE_PREFIX + 'seguimientos', JSON.stringify(data.seguimientos));
    localStorage.setItem(STORAGE_PREFIX + 'tareas', JSON.stringify(data.tareas));
    localStorage.setItem(STORAGE_PREFIX + 'actividades', JSON.stringify(data.actividades));
    localStorage.setItem(STORAGE_PREFIX + 'importaciones', JSON.stringify(data.historialImportaciones));
    localStorage.setItem(STORAGE_PREFIX + 'exportaciones', JSON.stringify(data.historialExportaciones));
    localStorage.setItem(STORAGE_PREFIX + 'subcuentas', JSON.stringify(data.subcuentas));
    localStorage.setItem(STORAGE_PREFIX + 'etiquetas_config', JSON.stringify(data.etiquetasConfig));
    localStorage.setItem(STORAGE_PREFIX + 'campos_personalizados', JSON.stringify(data.camposPersonalizados));
    localStorage.setItem(STORAGE_PREFIX + 'auditoria', JSON.stringify(data.registrosAuditoria));
    localStorage.setItem(STORAGE_PREFIX + 'notificaciones', JSON.stringify(data.notificaciones));
  } catch (e) {
    console.error('Error persistiendo datos relacionales', e);
  }
}
