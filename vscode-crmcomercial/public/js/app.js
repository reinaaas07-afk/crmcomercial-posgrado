/**
 * CRMComercial - Lógica de Cliente Frontend (Vanilla JS)
 * IB SYSTEM S.R.L. - Proyecto de Posgrado
 */

// Estado Global de la Aplicación
const state = {
  currentUser: null,
  token: null,
  activeView: 'dashboard',
  db: {
    usuarios: [],
    empresas: [],
    contactos: [],
    prospectos: [],
    seguimientos: [],
    tareas: [],
    auditoria: [],
    notificaciones: [],
    metas_comerciales: []
  },
  currentEditingEntity: null,
  importPendingRows: []
};

// --------------------------------------------------------------------------
// INICIALIZACIÓN
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  checkExistingSession();
});

function checkExistingSession() {
  const savedUser = sessionStorage.getItem('crm_user');
  const savedToken = sessionStorage.getItem('crm_token');

  if (savedUser && savedToken) {
    state.currentUser = JSON.parse(savedUser);
    state.token = savedToken;
    showAppLayout();
    loadAllData();
  } else {
    showLoginLayout();
  }
}

function showLoginLayout() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('appContainer').classList.add('hidden');
}

function showAppLayout() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');

  // Actualizar perfil de usuario
  if (state.currentUser) {
    document.getElementById('currentUserName').textContent = state.currentUser.nombre + (state.currentUser.apellido ? ' ' + state.currentUser.apellido : '');
    document.getElementById('currentUserRole').textContent = state.currentUser.rol;
    const initials = (state.currentUser.nombre[0] || 'U') + (state.currentUser.apellido ? state.currentUser.apellido[0] : '');
    document.getElementById('userAvatar').textContent = initials.toUpperCase();

    // Restricción de rol para gestión de usuarios
    const navUsuarios = document.getElementById('navUsuarios');
    if (navUsuarios) {
      if (state.currentUser.rol === 'Administrador General') {
        navUsuarios.classList.remove('hidden');
      } else {
        navUsuarios.classList.add('hidden');
      }
    }
  }
}

// --------------------------------------------------------------------------
// EVENT LISTENERS
// --------------------------------------------------------------------------
function initEventListeners() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Logout Button
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // Forgot Password Button
  const btnForgotPass = document.getElementById('btnForgotPass');
  if (btnForgotPass) {
    btnForgotPass.addEventListener('click', () => openModal('modalRecuperar'));
  }

  // Form Recuperar Contraseña
  const formRecuperar = document.getElementById('formRecuperar');
  if (formRecuperar) {
    formRecuperar.addEventListener('submit', handleRecuperarPassword);
  }

  // Navegación Sidebar
  document.querySelectorAll('.sidebar-nav .nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  // Formularios de Creación / Edición
  const formEmpresa = document.getElementById('formEmpresa');
  if (formEmpresa) formEmpresa.addEventListener('submit', handleSaveEmpresa);

  const formContacto = document.getElementById('formContacto');
  if (formContacto) formContacto.addEventListener('submit', handleSaveContacto);

  const formProspecto = document.getElementById('formProspecto');
  if (formProspecto) formProspecto.addEventListener('submit', handleSaveProspecto);

  const formSeguimiento = document.getElementById('formSeguimiento');
  if (formSeguimiento) formSeguimiento.addEventListener('submit', handleSaveSeguimiento);

  const formTarea = document.getElementById('formTarea');
  if (formTarea) formTarea.addEventListener('submit', handleSaveTarea);

  const formUsuario = document.getElementById('formUsuario');
  if (formUsuario) formUsuario.addEventListener('submit', handleSaveUsuario);

  // Filtros de búsqueda en tablas
  const filterEmpresas = document.getElementById('filterEmpresas');
  if (filterEmpresas) filterEmpresas.addEventListener('input', renderEmpresasTable);

  const filterContactos = document.getElementById('filterContactos');
  if (filterContactos) filterContactos.addEventListener('input', renderContactosTable);

  const filterAuditoria = document.getElementById('filterAuditoria');
  if (filterAuditoria) filterAuditoria.addEventListener('input', renderAuditoriaTable);

  // Búsqueda Global
  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', handleGlobalSearch);
  }

  // Archivo de Importación
  const fileImportInput = document.getElementById('fileImportInput');
  if (fileImportInput) {
    fileImportInput.addEventListener('change', handleFileImportSelected);
  }

  const btnConfirmImport = document.getElementById('btnConfirmImport');
  if (btnConfirmImport) {
    btnConfirmImport.addEventListener('click', handleConfirmImport);
  }
}

// --------------------------------------------------------------------------
// AUTENTICACIÓN & SESIONES
// --------------------------------------------------------------------------
async function handleLogin(e) {
  e.preventDefault();
  const usuario = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const alertEl = document.getElementById('loginAlert');
  alertEl.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      alertEl.textContent = data.error || 'Credenciales inválidas.';
      alertEl.classList.remove('hidden');
      return;
    }

    state.currentUser = data.user;
    state.token = data.token;
    sessionStorage.setItem('crm_user', JSON.stringify(data.user));
    sessionStorage.setItem('crm_token', data.token);

    showAppLayout();
    loadAllData();
  } catch (err) {
    alertEl.textContent = 'Error de conexión con el servidor Node.js.';
    alertEl.classList.remove('hidden');
  }
}

async function handleLogout() {
  if (!confirm('¿Desea cerrar la sesión activa?')) return;

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: state.currentUser ? state.currentUser.id : null,
        usuario: state.currentUser ? state.currentUser.usuario : ''
      })
    });
  } catch (err) {
    console.error('Error cerrando sesión en backend:', err);
  }

  state.currentUser = null;
  state.token = null;
  sessionStorage.removeItem('crm_user');
  sessionStorage.removeItem('crm_token');

  showLoginLayout();
  document.getElementById('loginPass').value = '';
}

async function handleRecuperarPassword(e) {
  e.preventDefault();
  const email = document.getElementById('recuperarEmail').value.trim();
  const resultEl = document.getElementById('recuperarResult');

  try {
    const res = await fetch('/api/auth/recuperar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    resultEl.textContent = data.message || data.error;
    resultEl.className = data.success ? 'alert info' : 'alert error';
    resultEl.classList.remove('hidden');
  } catch (err) {
    resultEl.textContent = 'Error comunicando con el servidor.';
    resultEl.className = 'alert error';
    resultEl.classList.remove('hidden');
  }
}

// --------------------------------------------------------------------------
// CARGA Y SINCRONIZACIÓN DE DATOS (REST API)
// --------------------------------------------------------------------------
async function loadAllData() {
  try {
    const res = await fetch('/api/db/all');
    if (!res.ok) throw new Error('Error al sincronizar base de datos');
    state.db = await res.json();

    // Actualizar selects de usuarios responsables
    populateUserSelects();

    // Renderizar módulos
    renderDashboard();
    renderEmpresasTable();
    renderContactosTable();
    renderPipelineBoard();
    renderSeguimientosTable();
    renderTareasTable();
    renderMetasGrid();
    renderAuditoriaTable();
    renderUsuariosTable();
    checkOverdueFollowUps();
  } catch (err) {
    console.error('Error cargando base de datos:', err);
  }
}

function populateUserSelects() {
  const users = state.db.usuarios || [];
  const options = users.map((u) => `<option value="${u.nombre} ${u.apellido || ''}">${u.nombre} ${u.apellido || ''} (${u.rol})</option>`).join('');

  ['empresaResponsable', 'contactoResponsable', 'prosResponsable', 'tareaAsignado'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = options;
  });

  // Select de prospectos en modal de seguimiento
  const segPros = document.getElementById('segProspectoId');
  if (segPros) {
    segPros.innerHTML = (state.db.prospectos || []).map((p) => `<option value="${p.id}">${p.empresa} (${p.contacto_principal || 'Sin contacto'})</option>`).join('');
  }
}

// --------------------------------------------------------------------------
// NAVEGACIÓN ENTRE VISTAS
// --------------------------------------------------------------------------
function switchView(viewName) {
  state.activeView = viewName;

  document.querySelectorAll('.sidebar-nav .nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  document.querySelectorAll('.module-view').forEach((view) => {
    view.classList.remove('active');
  });

  const target = document.getElementById('view' + viewName.charAt(0).toUpperCase() + viewName.slice(1));
  if (target) target.classList.add('active');
}

// --------------------------------------------------------------------------
// MÓDULO 1: DASHBOARD
// --------------------------------------------------------------------------
function renderDashboard() {
  const prospectos = state.db.prospectos || [];
  const total = prospectos.length;
  const ganados = prospectos.filter((p) => p.etapa === 'Ganado').length;
  const tasa = total > 0 ? ((ganados / total) * 100).toFixed(1) + '%' : '0%';
  const valorTotal = prospectos.reduce((acc, p) => acc + (Number(p.valor_estimado) || 0), 0);

  document.getElementById('kpiTotalProspectos').textContent = total;
  document.getElementById('kpiGanados').textContent = ganados;
  document.getElementById('kpiTasaConversion').textContent = tasa;
  document.getElementById('kpiValorPipeline').textContent = 'US$ ' + valorTotal.toLocaleString();

  // Desglose por etapas
  const stages = ['Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido'];
  const breakdownEl = document.getElementById('pipelineBreakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML = stages
      .map((st) => {
        const count = prospectos.filter((p) => p.etapa === st).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
              <span>${st}</span>
              <strong>${count} (${pct}%)</strong>
            </div>
            <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${st === 'Ganado' ? '#10b981' : st === 'Perdido' ? '#ef4444' : '#3b82f6'};"></div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Actividad Reciente
  const audit = (state.db.auditoria || []).slice(0, 6);
  const feedEl = document.getElementById('recentActivityList');
  if (feedEl) {
    feedEl.innerHTML = audit
      .map(
        (a) => `
        <div style="padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size:12px;">
          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <strong>${a.usuario}</strong>
            <span>${a.hora}</span>
          </div>
          <div>${a.detalles || a.registro_afectado}</div>
        </div>
      `
      )
      .join('');
  }
}

// --------------------------------------------------------------------------
// MÓDULO 2: EMPRESAS
// --------------------------------------------------------------------------
function renderEmpresasTable() {
  const tbody = document.getElementById('tableEmpresasBody');
  if (!tbody) return;

  const query = (document.getElementById('filterEmpresas')?.value || '').toLowerCase();
  const empresas = (state.db.empresas || []).filter(
    (e) =>
      e.razon_social.toLowerCase().includes(query) ||
      (e.rnc || '').toLowerCase().includes(query) ||
      (e.industria || '').toLowerCase().includes(query)
  );

  tbody.innerHTML = empresas
    .map(
      (e) => `
      <tr>
        <td>
          <strong>${e.razon_social}</strong>
          ${e.nombre_comercial ? `<div class="text-muted" style="font-size:11px;">${e.nombre_comercial}</div>` : ''}
        </td>
        <td><code>${e.rnc}</code></td>
        <td>${e.ciudad}, ${e.provincia}</td>
        <td>
          <div>${e.telefono || '-'}</div>
          <div class="text-muted" style="font-size:11px;">${e.correo || '-'}</div>
        </td>
        <td>${e.industria || 'General'}</td>
        <td><span class="badge" style="background:#1e3a8a; color:#93c5fd; padding:2px 8px; border-radius:4px; font-size:11px;">${e.estado_comercial || 'Prospecto'}</span></td>
        <td>${e.responsable_comercial || 'Yenifer Reina'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editEmpresa(${e.id})">Editar</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteEmpresa(${e.id})">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function handleSaveEmpresa(e) {
  e.preventDefault();
  const id = document.getElementById('empresaId').value;
  const payload = {
    razon_social: document.getElementById('empresaRazon').value.trim(),
    nombre_comercial: document.getElementById('empresaComercial').value.trim(),
    rnc: document.getElementById('empresaRnc').value.trim(),
    industria: document.getElementById('empresaIndustria').value.trim(),
    ciudad: document.getElementById('empresaCiudad').value.trim(),
    provincia: document.getElementById('empresaProvincia').value.trim(),
    telefono: document.getElementById('empresaTelefono').value.trim(),
    correo: document.getElementById('empresaCorreo').value.trim(),
    sitio_web: document.getElementById('empresaWeb').value.trim(),
    cantidad_empleados: document.getElementById('empresaEmpleados').value,
    estado_comercial: document.getElementById('empresaEstado').value,
    responsable_comercial: document.getElementById('empresaResponsable').value,
    autor: state.currentUser ? state.currentUser.nombre : 'Yenifer Reina Sena Suero'
  };

  try {
    const url = id ? `/api/empresas/${id}` : '/api/empresas';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('modalEmpresa');
      loadAllData();
    }
  } catch (err) {
    alert('Error al guardar empresa');
  }
}

function editEmpresa(id) {
  const e = (state.db.empresas || []).find((item) => item.id === id);
  if (!e) return;

  document.getElementById('empresaId').value = e.id;
  document.getElementById('empresaRazon').value = e.razon_social;
  document.getElementById('empresaComercial').value = e.nombre_comercial || '';
  document.getElementById('empresaRnc').value = e.rnc;
  document.getElementById('empresaIndustria').value = e.industria || '';
  document.getElementById('empresaCiudad').value = e.ciudad || '';
  document.getElementById('empresaProvincia').value = e.provincia || '';
  document.getElementById('empresaTelefono').value = e.telefono || '';
  document.getElementById('empresaCorreo').value = e.correo || '';
  document.getElementById('empresaWeb').value = e.sitio_web || '';
  document.getElementById('empresaEmpleados').value = e.cantidad_empleados || '25-50';
  document.getElementById('empresaEstado').value = e.estado_comercial || 'Prospecto';
  document.getElementById('empresaResponsable').value = e.responsable_comercial || '';

  document.getElementById('modalEmpresaTitle').textContent = 'Editar Empresa';
  openModal('modalEmpresa');
}

async function deleteEmpresa(id) {
  if (!confirm('¿Confirma eliminar esta empresa?')) return;
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch(`/api/empresas/${id}?autor=${encodeURIComponent(autor)}`, { method: 'DELETE' });
    loadAllData();
  } catch (err) {
    alert('Error al eliminar');
  }
}

// --------------------------------------------------------------------------
// MÓDULO 3: CONTACTOS
// --------------------------------------------------------------------------
function renderContactosTable() {
  const tbody = document.getElementById('tableContactosBody');
  if (!tbody) return;

  const query = (document.getElementById('filterContactos')?.value || '').toLowerCase();
  const contactos = (state.db.contactos || []).filter(
    (c) =>
      c.nombre.toLowerCase().includes(query) ||
      (c.apellido || '').toLowerCase().includes(query) ||
      c.empresa.toLowerCase().includes(query) ||
      (c.cargo || '').toLowerCase().includes(query)
  );

  tbody.innerHTML = contactos
    .map((c) => {
      const cleanPhone = (c.whatsapp || c.telefono || '').replace(/[^0-9]/g, '');
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

      return `
      <tr>
        <td><strong>${c.nombre} ${c.apellido || ''}</strong></td>
        <td>${c.empresa}</td>
        <td>${c.cargo || 'Decisor'}</td>
        <td>
          <div>${c.telefono || '-'}</div>
          ${cleanPhone ? `<a href="${waUrl}" target="_blank" style="color:#22c55e; font-size:11px; text-decoration:none;">WhatsApp Directo</a>` : ''}
        </td>
        <td>${c.responsable_comercial || 'Yenifer Reina'}</td>
        <td style="font-size:12px; font-family:var(--font-mono);">${c.ultimo_contacto ? c.ultimo_contacto.split(' ')[0] : 'Nunca'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editContacto(${c.id})">Editar</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteContacto(${c.id})">Eliminar</button>
        </td>
      </tr>
    `;
    })
    .join('');
}

async function handleSaveContacto(e) {
  e.preventDefault();
  const id = document.getElementById('contactoId').value;
  const payload = {
    nombre: document.getElementById('contactoNombre').value.trim(),
    apellido: document.getElementById('contactoApellido').value.trim(),
    empresa: document.getElementById('contactoEmpresa').value.trim(),
    cargo: document.getElementById('contactoCargo').value.trim(),
    telefono: document.getElementById('contactoTelefono').value.trim(),
    whatsapp: document.getElementById('contactoWhatsapp').value.trim(),
    correo: document.getElementById('contactoCorreo').value.trim(),
    responsable_comercial: document.getElementById('contactoResponsable').value,
    notas: document.getElementById('contactoNotas').value.trim(),
    autor: state.currentUser ? state.currentUser.nombre : 'Admin'
  };

  try {
    const url = id ? `/api/contactos/${id}` : '/api/contactos';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('modalContacto');
      loadAllData();
    }
  } catch (err) {
    alert('Error al guardar contacto');
  }
}

function editContacto(id) {
  const c = (state.db.contactos || []).find((item) => item.id === id);
  if (!c) return;

  document.getElementById('contactoId').value = c.id;
  document.getElementById('contactoNombre').value = c.nombre;
  document.getElementById('contactoApellido').value = c.apellido || '';
  document.getElementById('contactoEmpresa').value = c.empresa;
  document.getElementById('contactoCargo').value = c.cargo || '';
  document.getElementById('contactoTelefono').value = c.telefono || '';
  document.getElementById('contactoWhatsapp').value = c.whatsapp || '';
  document.getElementById('contactoCorreo').value = c.correo || '';
  document.getElementById('contactoResponsable').value = c.responsable_comercial || '';
  document.getElementById('contactoNotas').value = c.notas || '';

  document.getElementById('modalContactoTitle').textContent = 'Editar Contacto';
  openModal('modalContacto');
}

async function deleteContacto(id) {
  if (!confirm('¿Confirma eliminar este contacto?')) return;
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch(`/api/contactos/${id}?autor=${encodeURIComponent(autor)}`, { method: 'DELETE' });
    loadAllData();
  } catch (err) {
    alert('Error al eliminar');
  }
}

// --------------------------------------------------------------------------
// MÓDULO 4: PIPELINE COMERCIAL, CATÁLOGO DE PLANES & CÁLCULO DE COSTOS
// --------------------------------------------------------------------------

// Catálogo Oficial de Planes IB SYSTEM (Valores Reales en USD - No montos ficticios)
const CATALOGO_PLANES = {
  'Básico': {
    nombre: 'Plan Básico',
    ecf: 'Hasta 100 e-CF/mes',
    limiteVentas: 'Hasta US$ 10,000 / mes',
    costo: 25.00,
    idealPara: 'Microempresas, profesionales independientes y consultores'
  },
  'PYME': {
    nombre: 'Plan PYME',
    ecf: 'Hasta 500 e-CF/mes',
    limiteVentas: 'Hasta US$ 50,000 / mes',
    costo: 45.00,
    idealPara: 'Pequeñas y medianas empresas comerciales con emisión recurrente'
  },
  'Empresarial': {
    nombre: 'Plan Empresarial',
    ecf: 'Hasta 2,500 e-CF/mes',
    limiteVentas: 'Hasta US$ 250,000 / mes',
    costo: 80.00,
    idealPara: 'Empresas medianas con sucursales, almacenes y múltiples puntos de venta'
  },
  'Corporativo': {
    nombre: 'Plan Corporativo',
    ecf: 'Ilimitados (+10,000 e-CF)',
    limiteVentas: 'Sin límite de ventas',
    costo: 120.00,
    idealPara: 'Grandes corporaciones, distribuidoras mayoristas y cadenas retail'
  }
};

// Costo mensual por usuario de cada módulo adicional
const MODULOS_COSTOS = {
  'Inventario': 8.00,
  'Compras': 6.00,
  'Ventas': 8.00,
  'Caja': 5.00,
  'Contabilidad': 12.00,
  'Cuentas por Cobrar': 7.00,
  'Cuentas por Pagar': 7.00,
  'Reportes Gerenciales': 10.00
};

function updatePlanDetails() {
  const planKey = document.getElementById('prosPlan')?.value || 'PYME';
  const planInfo = CATALOGO_PLANES[planKey] || CATALOGO_PLANES['PYME'];

  const ecfEl = document.getElementById('planDetailEcf');
  const limiteEl = document.getElementById('planDetailLimite');
  const costoEl = document.getElementById('planDetailCosto');
  const idealEl = document.getElementById('planDetailIdeal');

  if (ecfEl) ecfEl.textContent = planInfo.ecf;
  if (limiteEl) limiteEl.textContent = planInfo.limiteVentas;
  if (costoEl) costoEl.textContent = `US$ ${planInfo.costo.toFixed(2)} / mes`;
  if (idealEl) idealEl.textContent = planInfo.idealPara;
}

function calculatePricing() {
  const planKey = document.getElementById('prosPlan')?.value || 'PYME';
  const planInfo = CATALOGO_PLANES[planKey] || CATALOGO_PLANES['PYME'];
  const baseCost = planInfo.costo;

  const usuariosInput = document.getElementById('prosUsuarios');
  const cantidadUsuarios = Math.max(1, parseInt(usuariosInput?.value, 10) || 1);

  // Suma de módulos por usuario
  const checkboxes = document.querySelectorAll('.module-check:checked');
  let sumaModulosPorUsuario = 0;
  checkboxes.forEach((cb) => {
    const cost = parseFloat(cb.dataset.cost) || MODULOS_COSTOS[cb.value] || 8.00;
    sumaModulosPorUsuario += cost;
  });

  const totalModulos = sumaModulosPorUsuario * cantidadUsuarios;
  const totalMensual = baseCost + totalModulos;
  const totalAnual = totalMensual * 12;

  if (document.getElementById('calcBase')) document.getElementById('calcBase').textContent = `US$ ${baseCost.toFixed(2)}`;
  if (document.getElementById('calcModulos')) document.getElementById('calcModulos').textContent = `US$ ${totalModulos.toFixed(2)}`;
  if (document.getElementById('calcPorUsuario')) document.getElementById('calcPorUsuario').textContent = `US$ ${sumaModulosPorUsuario.toFixed(2)}`;
  if (document.getElementById('calcMensual')) document.getElementById('calcMensual').textContent = `US$ ${totalMensual.toFixed(2)}`;
  if (document.getElementById('calcAnual')) document.getElementById('calcAnual').textContent = `US$ ${totalAnual.toFixed(2)}`;

  return {
    costoBase: baseCost,
    sumaModulosPorUsuario,
    totalModulos,
    cantidadUsuarios,
    totalMensual,
    totalAnual
  };
}

function renderPipelineBoard() {
  const prospectos = state.db.prospectos || [];
  const stages = ['Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido'];

  stages.forEach((stage) => {
    const countEl = document.getElementById(`count-${stage.split(' ')[0]}`);
    const containerEl = document.getElementById(`cards-${stage.split(' ')[0]}`);
    if (!containerEl) return;

    const items = prospectos.filter((p) => p.etapa === stage);
    if (countEl) countEl.textContent = items.length;

    containerEl.innerHTML = items
      .map(
        (p) => `
        <div class="kanban-card">
          <div class="card-company">${p.empresa}</div>
          <div class="card-contact">${p.contacto_principal || 'Sin contacto'} &bull; ${p.telefono || ''}</div>
          <div class="card-pricing">
            <span>Plan ${p.plan_seleccionado}</span>
            <strong class="text-success">US$ ${p.costo_mensual}/mes</strong>
          </div>
          <div class="card-footer">
            <span>${p.responsable_comercial ? p.responsable_comercial.split(' ')[0] : 'Ejecutivo'}</span>
            <button class="btn btn-outline btn-sm" onclick="openHistorial(${p.id}, '${p.empresa}')">Historial</button>
          </div>
          <div class="stage-btn-group">
            ${stages
              .filter((st) => st !== p.etapa)
              .map(
                (st) => `<button class="btn btn-outline btn-sm" style="font-size:10px; padding:2px 4px;" onclick="moveProspectStage(${p.id}, '${st}')">&rarr; ${st.split(' ')[0]}</button>`
              )
              .join('')}
          </div>
        </div>
      `
      )
      .join('');
  });
}

async function moveProspectStage(id, newStage) {
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Ejecutivo';
    await fetch(`/api/prospectos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa: newStage, autor })
    });
    loadAllData();
  } catch (err) {
    alert('Error al mover etapa');
  }
}

async function handleSaveProspecto(e) {
  e.preventDefault();
  const id = document.getElementById('prospectoId').value;
  const modulosSelected = Array.from(document.querySelectorAll('.module-check:checked')).map((c) => c.value);
  const pricing = calculatePricing();

  const payload = {
    empresa: document.getElementById('prosEmpresa').value.trim(),
    contacto_principal: document.getElementById('prosContacto').value.trim(),
    telefono: document.getElementById('prosTelefono').value.trim(),
    correo: document.getElementById('prosCorreo').value.trim(),
    etapa: document.getElementById('prosEtapa').value,
    responsable_comercial: document.getElementById('prosResponsable').value,
    plan_seleccionado: document.getElementById('prosPlan').value,
    canal_captacion: document.getElementById('prosCanal')?.value || 'Venta Directa',
    modulos_adicionales: modulosSelected,
    cantidad_usuarios: pricing.cantidadUsuarios,
    costo_base: pricing.costoBase,
    costo_adicional: pricing.totalModulos,
    costo_mensual: pricing.totalMensual,
    valor_estimado: pricing.totalAnual,
    autor: state.currentUser ? state.currentUser.nombre : 'Admin'
  };

  try {
    const url = id ? `/api/prospectos/${id}` : '/api/prospectos';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('modalProspecto');
      loadAllData();
    }
  } catch (err) {
    alert('Error al guardar oportunidad');
  }
}

// --------------------------------------------------------------------------
// MÓDULO 5: SEGUIMIENTO & ALERTA DE 7 DÍAS
// --------------------------------------------------------------------------
function checkOverdueFollowUps() {
  const prospectos = state.db.prospectos || [];
  const today = new Date('2026-09-30');
  const overdueList = [];

  prospectos.forEach((p) => {
    if (p.etapa === 'Ganado' || p.etapa === 'Perdido') return;
    const actStr = p.ultima_actividad || p.fecha_primer_contacto || '2026-09-20';
    const actDate = new Date(actStr.split(' ')[0]);
    const diffMs = Math.abs(today - actDate);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      overdueList.push({ ...p, diffDays });
    }
  });

  const banner = document.getElementById('alertInactivityBanner');
  const chips = document.getElementById('overdueList');
  const badge = document.getElementById('badgeOverdue');

  if (overdueList.length > 0) {
    if (badge) badge.classList.remove('hidden');
    if (banner && chips) {
      banner.classList.remove('hidden');
      chips.innerHTML = overdueList.map((p) => `<span class="chip">${p.empresa} (${p.diffDays} días sin contacto)</span>`).join('');
    }
  } else {
    if (badge) badge.classList.add('hidden');
    if (banner) banner.classList.add('hidden');
  }
}

function renderSeguimientosTable() {
  const tbody = document.getElementById('tableSeguimientosBody');
  if (!tbody) return;

  const seguimientos = state.db.seguimientos || [];
  tbody.innerHTML = seguimientos
    .map(
      (s) => `
      <tr>
        <td style="font-family:var(--font-mono); font-size:12px;">${s.fecha} ${s.hora}</td>
        <td><strong>${s.empresa}</strong></td>
        <td><span class="badge" style="background:#1f2937; padding:2px 6px; border-radius:4px;">${s.canal}</span></td>
        <td><strong>${s.resultado}</strong></td>
        <td>${s.usuario}</td>
        <td>${s.proxima_accion || '-'} ${s.fecha_proximo_seguimiento ? `<div class="text-muted" style="font-size:11px;">Para: ${s.fecha_proximo_seguimiento}</div>` : ''}</td>
        <td>${s.observaciones}</td>
      </tr>
    `
    )
    .join('');
}

async function handleSaveSeguimiento(e) {
  e.preventDefault();
  const prosId = document.getElementById('segProspectoId').value;
  const p = (state.db.prospectos || []).find((item) => item.id === Number(prosId));

  const payload = {
    prospecto_id: prosId,
    empresa: p ? p.empresa : 'Prospecto',
    canal: document.getElementById('segCanal').value,
    resultado: document.getElementById('segResultado').value,
    observaciones: document.getElementById('segObservaciones').value.trim(),
    proxima_accion: document.getElementById('segProximaAccion').value.trim(),
    fecha_proximo_seguimiento: document.getElementById('segFechaProximo').value,
    usuario: state.currentUser ? state.currentUser.nombre : 'Ejecutivo Comercial'
  };

  try {
    const res = await fetch('/api/seguimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('modalSeguimiento');
      loadAllData();
    }
  } catch (err) {
    alert('Error al registrar seguimiento');
  }
}

// --------------------------------------------------------------------------
// MÓDULO 6: HISTORIAL Y COMENTARIOS
// --------------------------------------------------------------------------
function openHistorial(entityId, entityName) {
  state.currentEditingEntity = { id: entityId, name: entityName };
  document.getElementById('modalHistorialTitle').textContent = `Historial & Comentarios: ${entityName}`;
  renderHistorialContent();
  openModal('modalHistorial');
}

function switchHistorialTab(tabId) {
  document.querySelectorAll('#modalHistorial .tabs-nav .tab-btn').forEach((btn) => btn.classList.remove('active'));
  document.querySelectorAll('#modalHistorial .tab-content').forEach((tc) => tc.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function renderHistorialContent() {
  if (!state.currentEditingEntity) return;
  const name = state.currentEditingEntity.name.toLowerCase();

  // Auditoría relacionada
  const logs = (state.db.auditoria || []).filter((a) => (a.registro_afectado || '').toLowerCase().includes(name));
  const auditContainer = document.getElementById('changesAuditList');
  if (auditContainer) {
    auditContainer.innerHTML =
      logs.length > 0
        ? logs
            .map(
              (l) => `
            <div style="padding:10px; border-bottom:1px solid var(--border-color); font-size:12px;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
                <strong>${l.usuario} &bull; ${l.accion}</strong>
                <span>${l.fecha} ${l.hora}</span>
              </div>
              <div>${l.detalles}</div>
            </div>
          `
            )
            .join('')
        : '<p class="text-muted">No se registran cambios previos para este registro.</p>';
  }
}

function addComment() {
  const text = document.getElementById('newCommentText').value.trim();
  if (!text) return;

  const fileInput = document.getElementById('commentFileInput');
  const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : null;

  const list = document.getElementById('commentsList');
  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
  const author = state.currentUser ? state.currentUser.nombre : 'Usuario';

  const commentHtml = `
    <div style="background:#0b0f19; border:1px solid var(--border-color); border-radius:6px; padding:12px; margin-top:10px;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
        <strong>${author}</strong>
        <span>${timeStr}</span>
      </div>
      <div style="font-size:13px;">${text}</div>
      ${fileName ? `<div style="margin-top:6px; font-size:11px; color:#60a5fa;">Archivo adjunto: &#128206; ${fileName}</div>` : ''}
    </div>
  `;

  list.insertAdjacentHTML('afterbegin', commentHtml);
  document.getElementById('newCommentText').value = '';
  fileInput.value = '';
}

// --------------------------------------------------------------------------
// MÓDULO 7: TAREAS
// --------------------------------------------------------------------------
function renderTareasTable() {
  const tbody = document.getElementById('tableTareasBody');
  if (!tbody) return;

  const tareas = state.db.tareas || [];
  tbody.innerHTML = tareas
    .map(
      (t) => `
      <tr>
        <td><span class="badge" style="background:${t.estado === 'Completada' ? '#065f46' : '#1e3a8a'}; padding:2px 8px; border-radius:4px; font-size:11px;">${t.estado}</span></td>
        <td><strong>${t.titulo}</strong>${t.descripcion ? `<div class="text-muted" style="font-size:11px;">${t.descripcion}</div>` : ''}</td>
        <td>${t.asignado_a}</td>
        <td style="font-family:var(--font-mono); font-size:12px;">${t.fecha_limite}</td>
        <td><span style="color:${t.prioridad === 'Alta' ? '#ef4444' : t.prioridad === 'Media' ? '#f59e0b' : '#10b981'}; font-weight:600;">${t.prioridad}</span></td>
        <td>${t.relacionado_nombre || '-'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleTareaEstado(${t.id}, '${t.estado === 'Completada' ? 'Pendiente' : 'Completada'}')">${t.estado === 'Completada' ? 'Reabrir' : 'Completar'}</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteTarea(${t.id})">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function handleSaveTarea(e) {
  e.preventDefault();
  const payload = {
    titulo: document.getElementById('tareaTitulo').value.trim(),
    descripcion: document.getElementById('tareaDescripcion').value.trim(),
    asignado_a: document.getElementById('tareaAsignado').value,
    fecha_limite: document.getElementById('tareaFechaLimite').value,
    prioridad: document.getElementById('tareaPrioridad').value,
    estado: document.getElementById('tareaEstado').value,
    autor: state.currentUser ? state.currentUser.nombre : 'Admin'
  };

  try {
    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('modalTarea');
      loadAllData();
    }
  } catch (err) {
    alert('Error al guardar tarea');
  }
}

async function toggleTareaEstado(id, nuevoEstado) {
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch(`/api/tareas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado, autor })
    });
    loadAllData();
  } catch (err) {
    alert('Error al actualizar tarea');
  }
}

async function deleteTarea(id) {
  if (!confirm('¿Confirma eliminar esta tarea?')) return;
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch(`/api/tareas/${id}?autor=${encodeURIComponent(autor)}`, { method: 'DELETE' });
    loadAllData();
  } catch (err) {
    alert('Error al eliminar');
  }
}

// --------------------------------------------------------------------------
// MÓDULO 8: METAS COMERCIALES
// --------------------------------------------------------------------------
function renderMetasGrid() {
  const container = document.getElementById('metasGrid');
  if (!container) return;

  const metas = state.db.metas_comerciales || [];
  container.innerHTML = metas
    .map((m) => {
      const pctMensual = Math.min(100, Math.round(((m.ventas_actuales || 0) / (m.meta_mensual || 1)) * 100));
      return `
      <div class="meta-card">
        <h3>${m.usuario_nombre}</h3>
        <p class="text-muted" style="font-size:12px; margin-bottom:12px;">Progreso de Ventas Mensuales</p>
        
        <div style="display:flex; justify-content:space-between; font-size:13px;">
          <span>Actual: <strong>US$ ${(m.ventas_actuales || 0).toLocaleString()}</strong></span>
          <span>Meta: <strong>US$ ${(m.meta_mensual || 0).toLocaleString()}</strong></span>
        </div>
        
        <div class="meta-progress-bar">
          <div class="meta-fill" style="width: ${pctMensual}%;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:6px;">
          <span>Cumplimiento: <strong>${pctMensual}%</strong></span>
          <span>Cierres: <strong>${m.prospectos_ganados || 0} ganados</strong></span>
        </div>

        <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-color); font-size:11px; color:var(--text-muted);">
          <div>Meta Trimestral: US$ ${(m.meta_trimestral || 0).toLocaleString()}</div>
          <div>Meta Anual: US$ ${(m.meta_anual || 0).toLocaleString()}</div>
        </div>
      </div>
    `;
    })
    .join('');
}

// --------------------------------------------------------------------------
// MÓDULO 9: AUDITORÍA COMPLETA
// --------------------------------------------------------------------------
function renderAuditoriaTable() {
  const tbody = document.getElementById('tableAuditoriaBody');
  if (!tbody) return;

  const query = (document.getElementById('filterAuditoria')?.value || '').toLowerCase();
  const logs = (state.db.auditoria || []).filter(
    (a) =>
      a.usuario.toLowerCase().includes(query) ||
      a.accion.toLowerCase().includes(query) ||
      a.modulo.toLowerCase().includes(query) ||
      (a.registro_afectado || '').toLowerCase().includes(query)
  );

  tbody.innerHTML = logs
    .map(
      (l) => `
      <tr>
        <td>${l.fecha} ${l.hora}</td>
        <td><strong>${l.usuario}</strong></td>
        <td><span class="badge" style="background:#1e293b; padding:2px 6px; border-radius:4px;">${l.accion}</span></td>
        <td>${l.modulo}</td>
        <td>${l.registro_afectado || '-'}</td>
        <td><code>${l.ip || '127.0.0.1'}</code></td>
        <td>${l.detalles || ''}</td>
      </tr>
    `
    )
    .join('');
}

function exportAuditExcel() {
  exportData('auditoria');
}

// --------------------------------------------------------------------------
// MÓDULO 10: IMPORTACIÓN INTELIGENTE (EXCEL, CSV, MAPEO 12 COLUMNAS IB SYSTEM)
// --------------------------------------------------------------------------

// Definición oficial de las 12 columnas de IB SYSTEM
const MAPEO_OFICIAL_IB = [
  { id: 'mapColEmpresa', target: 'Empresa', keys: ['empresa', 'compañia', 'compania', 'razon_social', 'razon social', 'cliente'] },
  { id: 'mapColContacto', target: 'Contacto Principal', keys: ['contacto', 'contacto principal', 'nombre', 'decisor', 'persona'] },
  { id: 'mapColTelefono', target: 'Teléfono', keys: ['telefono', 'teléfono', 'celular', 'whatsapp', 'movil', 'tel'] },
  { id: 'mapColCorreo', target: 'Correo', keys: ['correo', 'correo electronico', 'email', 'e-mail', 'mail'] },
  { id: 'mapColNaturaleza', target: 'Naturaleza del Negocio', keys: ['naturaleza de las operaciones', 'naturaleza', 'actividad', 'rubro', 'giro', 'industria'] },
  { id: 'mapColCertificadoFE', target: 'Certificado FE', keys: ['¿certificado fe?', 'certificado fe', 'certificado', 'token', 'dgii'] },
  { id: 'mapColPOSDigital', target: 'POS Digital', keys: ['pos digital', 'pos', 'punto de venta', 'caja digital'] },
  { id: 'mapColOtroSistema', target: 'Sistema Actual', keys: ['otro sistema', 'sistema actual', 'software actual', 'sistema anterior'] },
  { id: 'mapColModulos', target: 'Productos de Interés', keys: ['módulos de interés', 'modulos de interes', 'modulos', 'productos'] },
  { id: 'mapColFechaContacto', target: 'Fecha Primer Contacto', keys: ['fecha de contacto', 'fecha primer contacto', 'fecha contacto', 'fecha'] },
  { id: 'mapColPresentacionFE', target: 'Presentación FE', keys: ['presentación fe', 'presentacion fe', 'presentacion', 'demo'] },
  { id: 'mapColEstado', target: 'Estado Comercial', keys: ['estado', 'estado comercial', 'etapa', 'fase', 'estatus'] }
];

function handleFileImportSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fileName = file.name;
  const isExcel = /\.(xlsx|xls)$/i.test(fileName);
  const isCsv = /\.csv$/i.test(fileName);

  const badgeEl = document.getElementById('fileLoadedBadge');
  if (badgeEl) {
    badgeEl.textContent = `Archivo cargado: ${fileName} (${(file.size / 1024).toFixed(1)} KB)`;
    badgeEl.classList.remove('hidden');
  }

  // Activar indicadores de paso
  document.getElementById('step1Indicator')?.classList.add('active');
  document.getElementById('step2Indicator')?.classList.add('active');

  if (isExcel) {
    readExcelFile(file);
  } else if (isCsv) {
    readCsvFile(file);
  } else {
    alert('Formato de archivo no soportado. Por favor seleccione un archivo .xlsx, .xls o .csv');
  }
}

function readExcelFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      if (typeof XLSX === 'undefined') {
        alert('Cargando librería de procesamiento Excel. Por favor reintente en 2 segundos.');
        return;
      }
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (jsonData.length < 2) {
        alert('La hoja de cálculo está vacía o no contiene filas de datos.');
        return;
      }

      const headers = jsonData[0].map((h) => String(h || '').trim()).filter((h) => h.length > 0);
      const rows = [];

      for (let i = 1; i < jsonData.length; i++) {
        const rowArr = jsonData[i];
        if (!rowArr || rowArr.length === 0 || rowArr.every((cell) => !cell)) continue;
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = rowArr[idx] !== undefined && rowArr[idx] !== null ? String(rowArr[idx]).trim() : '';
        });
        rows.push(rowObj);
      }

      processImportData(headers, rows);
    } catch (err) {
      alert('Error al leer el archivo Excel: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function readCsvFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert('El archivo CSV no contiene suficientes registros.');
        return;
      }

      // Detectar delimitador (coma o punto y coma)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

      const parseLine = (line) => {
        const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
        const matches = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
          matches.push((val || '').trim());
        }
        return matches;
      };

      const headers = parseLine(lines[0]);
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.every((v) => !v)) continue;
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }

      processImportData(headers, rows);
    } catch (err) {
      alert('Error al procesar CSV: ' + err.message);
    }
  };
  reader.readAsText(file, 'utf-8');
}

function processImportData(headers, rows) {
  state.importRawRows = rows;
  state.importFileHeaders = headers;

  // Llenar selects de mapeo
  populateMappingDropdowns(headers);

  // Auto-detectar correspondencia
  autoDetectColumnMapping();

  // Mostrar secciones
  document.getElementById('mappingSection')?.classList.remove('hidden');
  document.getElementById('importPreviewArea')?.classList.remove('hidden');

  // Calcular vista previa mapeada
  recalculateMappedPreview();
}

function populateMappingDropdowns(headers) {
  MAPEO_OFICIAL_IB.forEach((item) => {
    const select = document.getElementById(item.id);
    if (!select) return;

    select.innerHTML = '<option value="">(Sin asignar / Vacío)</option>' +
      headers.map((h) => `<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join('');
  });
}

function autoDetectColumnMapping() {
  const headers = state.importFileHeaders || [];

  MAPEO_OFICIAL_IB.forEach((item) => {
    const select = document.getElementById(item.id);
    if (!select) return;

    // Buscar coincidencia exacta o por palabras clave
    let matchedHeader = headers.find((h) => {
      const cleanH = h.toLowerCase().trim();
      return item.keys.some((k) => cleanH === k || cleanH.includes(k) || k.includes(cleanH));
    });

    if (matchedHeader) {
      select.value = matchedHeader;
    }
  });

  recalculateMappedPreview();
}

function getMappedValue(row, selectId, defaultValue = '') {
  const select = document.getElementById(selectId);
  const colName = select ? select.value : '';
  if (!colName || !row[colName]) return defaultValue;
  return String(row[colName]).trim();
}

function recalculateMappedPreview() {
  const rawRows = state.importRawRows || [];
  if (rawRows.length === 0) return;

  const currentProspectos = state.db.prospectos || [];
  const currentEmpresas = state.db.empresas || [];

  let countNew = 0;
  let countUpdate = 0;
  const mappedRows = [];

  rawRows.forEach((row, idx) => {
    const empresa = getMappedValue(row, 'mapColEmpresa');
    const contacto = getMappedValue(row, 'mapColContacto');
    const telefono = getMappedValue(row, 'mapColTelefono');
    const correo = getMappedValue(row, 'mapColCorreo').toLowerCase();
    const naturaleza = getMappedValue(row, 'mapColNaturaleza', 'Comercial / Servicios');
    const certificadoFE = getMappedValue(row, 'mapColCertificadoFE', 'No');
    const posDigital = getMappedValue(row, 'mapColPOSDigital', 'No');
    const otroSistema = getMappedValue(row, 'mapColOtroSistema', 'Ninguno');
    const modulos = getMappedValue(row, 'mapColModulos', 'Inventario, Ventas');
    const fechaContacto = getMappedValue(row, 'mapColFechaContacto', new Date().toISOString().split('T')[0]);
    const presentacionFE = getMappedValue(row, 'mapColPresentacionFE', 'Pendiente');
    const estado = getMappedValue(row, 'mapColEstado', 'Contacto');

    if (!empresa && !contacto && !correo) return;

    // Verificar si ya existe por RNC, correo o razón social
    const existeEnCRM = currentProspectos.some(
      (p) => (correo && p.correo && p.correo.toLowerCase() === correo) ||
             (empresa && p.empresa && p.empresa.toLowerCase() === empresa.toLowerCase())
    );

    const accion = existeEnCRM ? 'Actualizar' : 'Crear';
    if (existeEnCRM) countUpdate++;
    else countNew++;

    mappedRows.push({
      idOriginal: idx + 1,
      accion,
      empresa: empresa || 'Empresa Dominicana',
      contacto_principal: contacto || 'Contacto Comercial',
      telefono: telefono || '+1 809-000-0000',
      correo: correo || 'contacto@empresa.com.do',
      naturaleza,
      certificado_fe: certificadoFE,
      pos_digital: posDigital,
      otro_sistema: otroSistema,
      modulos_interes: modulos,
      fecha_primer_contacto: fechaContacto,
      presentacion_fe: presentacionFE,
      etapa: ['Contacto', 'Interesado', 'Propuesta Enviada', 'Ganado', 'Perdido'].includes(estado) ? estado : 'Contacto'
    });
  });

  state.importPendingRows = mappedRows;

  // Actualizar estadísticas
  if (document.getElementById('importRowCount')) document.getElementById('importRowCount').textContent = mappedRows.length;
  if (document.getElementById('importTotalRead')) document.getElementById('importTotalRead').textContent = rawRows.length;
  if (document.getElementById('importTotalNew')) document.getElementById('importTotalNew').textContent = countNew;
  if (document.getElementById('importTotalUpdate')) document.getElementById('importTotalUpdate').textContent = countUpdate;

  // Renderizar tabla de previsualización
  const tbody = document.getElementById('importPreviewBody');
  if (tbody) {
    tbody.innerHTML = mappedRows
      .slice(0, 15)
      .map(
        (r) => `
        <tr>
          <td>
            <span class="badge" style="background:${r.accion === 'Crear' ? '#059669' : '#d97706'}; color:#fff; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:700;">
              ${r.accion === 'Crear' ? '&#10010; NUEVO' : '&#8635; ACTUALIZAR'}
            </span>
          </td>
          <td><strong>${escapeHtml(r.empresa)}</strong></td>
          <td>${escapeHtml(r.contacto_principal)}</td>
          <td style="font-family:var(--font-mono); font-size:12px;">${escapeHtml(r.telefono)}</td>
          <td>${escapeHtml(r.correo)}</td>
          <td><span class="text-muted" style="font-size:12px;">${escapeHtml(r.naturaleza)}</span></td>
          <td style="text-align:center;">${r.certificado_fe.toLowerCase().includes('s') || r.certificado_fe.toLowerCase().includes('y') ? '&#9989; Sí' : '&#10060; No'}</td>
          <td style="text-align:center;">${r.pos_digital.toLowerCase().includes('s') || r.pos_digital.toLowerCase().includes('y') ? '&#9989; Sí' : '&#10060; No'}</td>
          <td style="font-size:12px;">${escapeHtml(r.modulos_interes)}</td>
          <td><span class="badge" style="background:#1e3a8a; font-size:11px;">${escapeHtml(r.etapa)}</span></td>
        </tr>
      `
      )
      .join('');
  }

  // Activar paso 3 y 4
  document.getElementById('step3Indicator')?.classList.add('active');
  document.getElementById('step4Indicator')?.classList.add('active');
}

function cancelImport() {
  state.importRawRows = [];
  state.importPendingRows = [];
  state.importFileHeaders = [];
  document.getElementById('mappingSection')?.classList.add('hidden');
  document.getElementById('importPreviewArea')?.classList.add('hidden');
  document.getElementById('fileLoadedBadge')?.classList.add('hidden');
  const fileInput = document.getElementById('fileImportInput');
  if (fileInput) fileInput.value = '';

  document.querySelectorAll('.step-item').forEach((item, idx) => {
    if (idx === 0) item.classList.add('active');
    else item.classList.remove('active');
  });
}

async function handleConfirmImport() {
  if (!state.importPendingRows || state.importPendingRows.length === 0) {
    alert('No hay registros validados para importar.');
    return;
  }

  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Yenifer Reina Sena Suero';
    const res = await fetch('/api/importar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filas: state.importPendingRows, autor })
    });

    const result = await res.json();
    if (!res.ok) {
      alert('Error en importación: ' + (result.error || 'Fallo desconocido'));
      return;
    }

    alert(
      `¡Importación completada con éxito!\n\n` +
      `- Total Procesados: ${result.total || state.importPendingRows.length}\n` +
      `- Nuevos Creados: ${result.creados}\n` +
      `- Existentes Actualizados: ${result.actualizados}\n\n` +
      `Se han creado y sincronizado automáticamente las Empresas, Contactos y Prospectos en la base de datos.`
    );

    cancelImport();
    await loadAllData();
    switchView('pipeline');
  } catch (err) {
    alert('Error al procesar la importación masiva: ' + err.message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --------------------------------------------------------------------------
// MÓDULO 11: EXPORTACIÓN
// --------------------------------------------------------------------------
function exportData(moduleName) {
  let data = [];
  let filename = `CRMComercial_${moduleName}_${new Date().toISOString().split('T')[0]}.csv`;

  if (moduleName === 'empresas') data = state.db.empresas || [];
  else if (moduleName === 'contactos') data = state.db.contactos || [];
  else if (moduleName === 'prospectos') data = state.db.prospectos || [];
  else if (moduleName === 'auditoria') data = state.db.auditoria || [];

  if (data.length === 0) {
    alert('No hay registros para exportar.');
    return;
  }

  // Generar CSV
  const keys = Object.keys(data[0]);
  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [
      keys.join(','),
      ...data.map((row) =>
        keys
          .map((k) => {
            let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ].join('\r\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --------------------------------------------------------------------------
// MÓDULO 12: USUARIOS (ADMINISTRACIÓN)
// --------------------------------------------------------------------------
function renderUsuariosTable() {
  const tbody = document.getElementById('tableUsuariosBody');
  if (!tbody) return;

  const usuarios = state.db.usuarios || [];
  tbody.innerHTML = usuarios
    .map(
      (u) => `
      <tr>
        <td><strong>${u.nombre} ${u.apellido || ''}</strong></td>
        <td><code>${u.usuario}</code></td>
        <td>${u.email}</td>
        <td><span class="badge" style="background:#1e3a8a; padding:2px 8px; border-radius:4px; font-size:11px;">${u.rol}</span></td>
        <td><span style="color:${u.activo ? '#10b981' : '#ef4444'}; font-weight:600;">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td style="font-family:var(--font-mono); font-size:12px;">${u.ultimo_acceso || 'Sin accesos'}</td>
        <td>
          ${u.rol !== 'Administrador General' ? `<button class="btn btn-outline-danger btn-sm" onclick="deleteUsuario(${u.id})">Eliminar</button>` : '<span class="text-muted" style="font-size:11px;">Principal</span>'}
        </td>
      </tr>
    `
    )
    .join('');
}

async function handleSaveUsuario(e) {
  e.preventDefault();
  const payload = {
    nombre: document.getElementById('userNombre').value.trim(),
    usuario: document.getElementById('userUsuario').value.trim(),
    email: document.getElementById('userEmail').value.trim(),
    rol: document.getElementById('userRol').value,
    password_hash: document.getElementById('userPassword').value,
    autor: state.currentUser ? state.currentUser.nombre : 'Admin'
  };

  try {
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('modalUsuario');
      loadAllData();
    }
  } catch (err) {
    alert('Error al crear usuario');
  }
}

async function deleteUsuario(id) {
  if (!confirm('¿Confirma eliminar este usuario del CRM?')) return;
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch(`/api/usuarios/${id}?autor=${encodeURIComponent(autor)}`, { method: 'DELETE' });
    loadAllData();
  } catch (err) {
    alert('Error al eliminar');
  }
}

// --------------------------------------------------------------------------
// BÚSQUEDA GLOBAL
// --------------------------------------------------------------------------
function handleGlobalSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (query.length < 2) return;

  // Filtrar si estamos en empresas o contactos
  if (state.activeView === 'empresas') {
    const filter = document.getElementById('filterEmpresas');
    if (filter) {
      filter.value = query;
      renderEmpresasTable();
    }
  } else if (state.activeView === 'contactos') {
    const filter = document.getElementById('filterContactos');
    if (filter) {
      filter.value = query;
      renderContactosTable();
    }
  }
}

// --------------------------------------------------------------------------
// HELPERS DE MODALES
// --------------------------------------------------------------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}
