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
  importPendingRows: [],
  selectedContactIds: []
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

    // Actualizar selects de usuarios y empresas asociadas
    populateUserSelects();
    populateEmpresasSelects();

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

  ['empresaResponsable', 'contactoResponsable', 'prosResponsable', 'tareaAsignado', 'bulkSelectResponsable', 'filtroContactoResponsable'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'filtroContactoResponsable') {
        el.innerHTML = '<option value="">Todos los ejecutivos</option>' + options;
      } else {
        el.innerHTML = options;
      }
    }
  });

  // Select de prospectos en modal de seguimiento
  const segPros = document.getElementById('segProspectoId');
  if (segPros) {
    segPros.innerHTML = (state.db.prospectos || []).map((p) => `<option value="${p.id}">${p.empresa} (${p.contacto_principal || 'Sin contacto'})</option>`).join('');
  }
}

// Llenar listas desplegables de empresas asociadas (Prioridad #3 y #5)
function populateEmpresasSelects() {
  const empresas = (state.db.empresas || []).slice().sort((a, b) => a.razon_social.localeCompare(b.razon_social));
  
  // Opciones para modal de contacto y modal de oportunidad
  const options = empresas.map((e) => `<option value="${e.id}">${escapeHtml(e.razon_social)}${e.nombre_comercial ? ' (' + escapeHtml(e.nombre_comercial) + ')' : ''}</option>`).join('');

  const contactoEmpSelect = document.getElementById('contactoEmpresaSelect');
  if (contactoEmpSelect) {
    const prevVal = contactoEmpSelect.value;
    contactoEmpSelect.innerHTML = '<option value="">-- Seleccionar Empresa Existente --</option>' + options;
    if (prevVal) contactoEmpSelect.value = prevVal;
  }

  const prosEmpSelect = document.getElementById('prosEmpresaSelect');
  if (prosEmpSelect) {
    const prevVal = prosEmpSelect.value;
    prosEmpSelect.innerHTML = '<option value="">-- Seleccionar Empresa Existente --</option>' + options;
    if (prevVal) prosEmpSelect.value = prevVal;
  }

  const filtroEmp = document.getElementById('filtroContactoEmpresa');
  if (filtroEmp) {
    const prevVal = filtroEmp.value;
    filtroEmp.innerHTML = '<option value="">Todas las empresas</option>' + empresas.map((e) => `<option value="${escapeHtml(e.razon_social)}">${escapeHtml(e.razon_social)}</option>`).join('');
    if (prevVal) filtroEmp.value = prevVal;
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
// MÓDULO 2: EMPRESAS (Prioridad #4: Relación Completa Empresa -> Contactos -> Oportunidades)
// --------------------------------------------------------------------------
function renderEmpresasTable() {
  const tbody = document.getElementById('tableEmpresasBody');
  if (!tbody) return;

  const query = (document.getElementById('filterEmpresas')?.value || '').toLowerCase();
  const empresas = (state.db.empresas || []).filter(
    (e) =>
      e.razon_social.toLowerCase().includes(query) ||
      (e.rnc || '').toLowerCase().includes(query) ||
      (e.industria || '').toLowerCase().includes(query) ||
      (e.ciudad || '').toLowerCase().includes(query)
  );

  tbody.innerHTML = empresas
    .map(
      (e) => `
      <tr>
        <td>
          <a href="javascript:void(0)" onclick="openEmpresaDetalle(${e.id})" style="color:var(--text-main); font-weight:700; text-decoration:none;" title="Ver Ficha Completa">
            ${escapeHtml(e.razon_social)}
          </a>
          ${e.nombre_comercial ? `<div class="text-muted" style="font-size:11px;">${escapeHtml(e.nombre_comercial)}</div>` : ''}
        </td>
        <td><code>${escapeHtml(e.rnc)}</code></td>
        <td>${escapeHtml(e.ciudad || '')}, ${escapeHtml(e.provincia || '')}</td>
        <td>
          <div>${escapeHtml(e.telefono || '-')}</div>
          <div class="text-muted" style="font-size:11px;">${escapeHtml(e.correo || '-')}</div>
        </td>
        <td>${escapeHtml(e.industria || 'General')}</td>
        <td><span class="badge" style="background:#1e3a8a; color:#93c5fd; padding:2px 8px; border-radius:4px; font-size:11px;">${escapeHtml(e.estado_comercial || 'Prospecto')}</span></td>
        <td>${escapeHtml(e.responsable_comercial || 'Yenifer Reina')}</td>
        <td>
          <button class="btn btn-outline-primary btn-sm" onclick="openEmpresaDetalle(${e.id})" title="Ver ficha con contactos y oportunidades">&#128065; Ficha</button>
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
// MÓDULO 3: CONTACTOS COMERCIALES (Prioridad #2, #3, #6, #7, #8)
// --------------------------------------------------------------------------
function renderContactosTable() {
  const tbody = document.getElementById('tableContactosBody');
  if (!tbody) return;

  // Filtros Avanzados (Prioridad #7)
  const query = (document.getElementById('filterContactos')?.value || '').toLowerCase().trim();
  const filtroEmpresa = (document.getElementById('filtroContactoEmpresa')?.value || '').toLowerCase().trim();
  const filtroEstado = (document.getElementById('filtroContactoEstado')?.value || '').trim();
  const filtroProducto = (document.getElementById('filtroContactoProducto')?.value || '').trim();
  const filtroResponsable = (document.getElementById('filtroContactoResponsable')?.value || '').trim();
  const filtroEtiqueta = (document.getElementById('filtroContactoEtiqueta')?.value || '').toLowerCase().trim();

  if (!state.selectedContactos) {
    state.selectedContactos = new Set();
  }

  const contactos = (state.db.contactos || []).filter((c) => {
    // Búsqueda por texto
    if (query) {
      const matchText = (
        (c.nombre || '') + ' ' +
        (c.apellido || '') + ' ' +
        (c.empresa || '') + ' ' +
        (c.cargo || '') + ' ' +
        (c.telefono || '') + ' ' +
        (c.correo || '')
      ).toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // Filtro por Empresa Asociada
    if (filtroEmpresa) {
      const empNombre = (c.empresa || '').toLowerCase();
      if (empNombre !== filtroEmpresa && !empNombre.includes(filtroEmpresa)) return false;
    }

    // Filtro por Estado Comercial
    if (filtroEstado && c.estado_comercial !== filtroEstado) return false;

    // Filtro por Producto
    if (filtroProducto && c.producto_interes !== filtroProducto) return false;

    // Filtro por Responsable Comercial
    if (filtroResponsable && c.responsable_comercial !== filtroResponsable) return false;

    // Filtro por Etiquetas
    if (filtroEtiqueta) {
      const tags = (c.etiquetas || '').toLowerCase();
      const matchTag = tags.includes(filtroEtiqueta) ||
        (c.estado_comercial || '').toLowerCase() === filtroEtiqueta ||
        (c.producto_interes || '').toLowerCase() === filtroEtiqueta ||
        (c.modulo_principal || '').toLowerCase() === filtroEtiqueta;
      if (!matchTag) return false;
    }

    return true;
  });

  // Guardar lista filtrada actual para exportación filtrada
  state.currentFilteredContactos = contactos;

  if (contactos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted);">
          No se encontraron contactos que coincidan con los filtros aplicados.
        </td>
      </tr>
    `;
    updateMassActionsBar();
    return;
  }

  tbody.innerHTML = contactos
    .map((c) => {
      const cleanPhone = (c.whatsapp || c.telefono || '').replace(/[^0-9]/g, '');
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';
      const isSelected = state.selectedContactos.has(c.id);

      // Badge de estado comercial
      let badgeColor = '#3b82f6';
      if (c.estado_comercial === 'Cliente Activo' || c.estado_comercial === 'Cliente') badgeColor = '#10b981';
      else if (c.estado_comercial === 'Cliente Inactivo') badgeColor = '#ef4444';
      else if (c.estado_comercial === 'Lead') badgeColor = '#8b5cf6';
      else if (c.estado_comercial === 'Prospecto') badgeColor = '#f59e0b';

      return `
      <tr class="${isSelected ? 'row-selected' : ''}">
        <td style="text-align: center;">
          <input type="checkbox" class="contacto-row-check" value="${c.id}" ${isSelected ? 'checked' : ''} onchange="toggleContactoSelect(${c.id}, this)">
        </td>
        <td>
          <a href="javascript:void(0)" onclick="openContactoDetalle(${c.id})" style="color:var(--text-main); font-weight:700; text-decoration:none;" title="Ver Ficha de Contacto">
            ${escapeHtml(c.nombre)} ${escapeHtml(c.apellido || '')}
          </a>
          ${c.etiquetas ? `<div style="font-size:10px; color:#94a3b8; margin-top:2px;">&#127991; ${escapeHtml(c.etiquetas)}</div>` : ''}
        </td>
        <td>
          <a href="javascript:void(0)" onclick="openEmpresaDetalle(${c.empresa_id || 0}, '${escapeHtml(c.empresa ? c.empresa.replace(/'/g, "\\'") : '')}')" style="color:#60a5fa; text-decoration:none; font-weight:600;" title="Ver Empresa Asociada">
            &#127970; ${escapeHtml(c.empresa || 'Sin Empresa')}
          </a>
        </td>
        <td>${escapeHtml(c.cargo || 'Decisor')}</td>
        <td>
          <div>${escapeHtml(c.telefono || '-')}</div>
          ${cleanPhone ? `<a href="${waUrl}" target="_blank" style="color:#22c55e; font-size:11px; text-decoration:none; font-weight:600;">&#128172; WhatsApp</a>` : ''}
        </td>
        <td>
          <span class="badge" style="background:${badgeColor}; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">
            ${escapeHtml(c.estado_comercial || 'Prospecto')}
          </span>
        </td>
        <td>
          <div style="font-weight:600; font-size:12px;">${escapeHtml(c.producto_interes || 'Facturación Electrónica')}</div>
          <div class="text-muted" style="font-size:11px;">Módulo: ${escapeHtml(c.modulo_principal || 'Ventas')}</div>
        </td>
        <td>${escapeHtml(c.responsable_comercial || 'Yenifer Reina')}</td>
        <td>
          <button class="btn btn-outline-primary btn-sm" onclick="openContactoDetalle(${c.id})" title="Ver Ficha Completa">&#128065; Ficha</button>
          <button class="btn btn-outline btn-sm" onclick="editContacto(${c.id})">Editar</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteContacto(${c.id})">Eliminar</button>
        </td>
      </tr>
    `;
    })
    .join('');

  updateMassActionsBar();
}

function resetFiltrosContactos() {
  const elQuery = document.getElementById('filterContactos');
  const elEmpresa = document.getElementById('filtroContactoEmpresa');
  const elEstado = document.getElementById('filtroContactoEstado');
  const elProducto = document.getElementById('filtroContactoProducto');
  const elResponsable = document.getElementById('filtroContactoResponsable');
  const elEtiqueta = document.getElementById('filtroContactoEtiqueta');

  if (elQuery) elQuery.value = '';
  if (elEmpresa) elEmpresa.value = '';
  if (elEstado) elEstado.value = '';
  if (elProducto) elProducto.value = '';
  if (elResponsable) elResponsable.value = '';
  if (elEtiqueta) elEtiqueta.value = '';

  renderContactosTable();
}

// Guardar Contacto (Prioridad #2: Restauración de los 19 campos completos y Empresa Asociada)
async function handleSaveContacto(e) {
  e.preventDefault();
  const id = document.getElementById('contactoId').value;
  const selectEmpresa = document.getElementById('contactoEmpresaSelect');
  const empresaId = selectEmpresa ? (selectEmpresa.value ? Number(selectEmpresa.value) : null) : null;
  const empresaNombre = selectEmpresa && selectEmpresa.selectedIndex >= 0 ? selectEmpresa.options[selectEmpresa.selectedIndex].text.replace(/\s*\(.*?\)\s*$/, '').trim() : '';

  const payload = {
    nombre: document.getElementById('contactoNombre').value.trim(),
    apellido: document.getElementById('contactoApellido').value.trim(),
    empresa_id: empresaId,
    empresa: empresaNombre,
    cargo: document.getElementById('contactoCargo').value.trim(),
    telefono: document.getElementById('contactoTelefono').value.trim(),
    whatsapp: document.getElementById('contactoWhatsapp').value.trim(),
    correo: document.getElementById('contactoCorreo').value.trim(),
    naturaleza_negocio: document.getElementById('contactoNaturaleza')?.value || 'Comercial / Servicios',
    estado_comercial: document.getElementById('contactoEstadoComercial')?.value || 'Prospecto',
    producto_interes: document.getElementById('contactoProductoInteres')?.value || 'Facturación Electrónica',
    modulo_principal: document.getElementById('contactoModuloPrincipal')?.value || 'Ventas',
    responsable_comercial: document.getElementById('contactoResponsable').value,
    ciudad: document.getElementById('contactoCiudad')?.value.trim() || 'Santo Domingo',
    provincia: document.getElementById('contactoProvincia')?.value.trim() || 'Distrito Nacional',
    direccion: document.getElementById('contactoDireccion')?.value.trim() || '',
    fecha_proximo_seguimiento: document.getElementById('contactoProximoSeguimiento')?.value || null,
    etiquetas: document.getElementById('contactoEtiquetas')?.value.trim() || '',
    observaciones_comerciales: document.getElementById('contactoObservacionesComerciales')?.value.trim() || '',
    notas: document.getElementById('contactoNotas')?.value.trim() || '',
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
    } else {
      const err = await res.json();
      alert('Error al guardar contacto: ' + (err.error || 'Verifique los datos'));
    }
  } catch (err) {
    alert('Error al comunicarse con el servidor para guardar contacto');
  }
}

function editContacto(id) {
  const c = (state.db.contactos || []).find((item) => item.id === id);
  if (!c) return;

  document.getElementById('contactoId').value = c.id;
  document.getElementById('contactoNombre').value = c.nombre || '';
  document.getElementById('contactoApellido').value = c.apellido || '';

  // Seleccionar empresa asociada
  const empSelect = document.getElementById('contactoEmpresaSelect');
  if (empSelect) {
    if (c.empresa_id) {
      empSelect.value = c.empresa_id;
    } else {
      // Buscar por nombre si no tiene ID
      const matching = Array.from(empSelect.options).find((opt) => opt.text.toLowerCase().includes((c.empresa || '').toLowerCase()));
      if (matching) empSelect.value = matching.value;
    }
  }

  document.getElementById('contactoCargo').value = c.cargo || '';
  document.getElementById('contactoTelefono').value = c.telefono || '';
  document.getElementById('contactoWhatsapp').value = c.whatsapp || '';
  document.getElementById('contactoCorreo').value = c.correo || '';

  if (document.getElementById('contactoNaturaleza')) document.getElementById('contactoNaturaleza').value = c.naturaleza_negocio || 'Comercial / Servicios';
  if (document.getElementById('contactoEstadoComercial')) document.getElementById('contactoEstadoComercial').value = c.estado_comercial || 'Prospecto';
  if (document.getElementById('contactoProductoInteres')) document.getElementById('contactoProductoInteres').value = c.producto_interes || 'Facturación Electrónica';
  if (document.getElementById('contactoModuloPrincipal')) document.getElementById('contactoModuloPrincipal').value = c.modulo_principal || 'Ventas';
  if (document.getElementById('contactoResponsable')) document.getElementById('contactoResponsable').value = c.responsable_comercial || '';

  if (document.getElementById('contactoCiudad')) document.getElementById('contactoCiudad').value = c.ciudad || 'Santo Domingo';
  if (document.getElementById('contactoProvincia')) document.getElementById('contactoProvincia').value = c.provincia || 'Distrito Nacional';
  if (document.getElementById('contactoDireccion')) document.getElementById('contactoDireccion').value = c.direccion || '';
  if (document.getElementById('contactoProximoSeguimiento')) document.getElementById('contactoProximoSeguimiento').value = c.fecha_proximo_seguimiento || '';
  if (document.getElementById('contactoEtiquetas')) document.getElementById('contactoEtiquetas').value = c.etiquetas || '';
  if (document.getElementById('contactoObservacionesComerciales')) document.getElementById('contactoObservacionesComerciales').value = c.observaciones_comerciales || '';
  if (document.getElementById('contactoNotas')) document.getElementById('contactoNotas').value = c.notas || '';

  document.getElementById('modalContactoTitle').textContent = 'Editar Contacto';
  openModal('modalContacto');
}

async function deleteContacto(id) {
  if (!confirm('¿Confirma eliminar este contacto?')) return;
  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch(`/api/contactos/${id}?autor=${encodeURIComponent(autor)}`, { method: 'DELETE' });
    if (state.selectedContactos) state.selectedContactos.delete(id);
    loadAllData();
  } catch (err) {
    alert('Error al eliminar contacto');
  }
}

// --------------------------------------------------------------------------
// ACCIONES MASIVAS EN CONTACTOS (Prioridad #8)
// --------------------------------------------------------------------------
function toggleSelectAllContactos(masterEl) {
  if (!state.selectedContactos) state.selectedContactos = new Set();
  const checkboxes = document.querySelectorAll('.contacto-row-check');

  if (masterEl.checked) {
    checkboxes.forEach((cb) => {
      cb.checked = true;
      state.selectedContactos.add(Number(cb.value));
    });
  } else {
    checkboxes.forEach((cb) => {
      cb.checked = false;
      state.selectedContactos.delete(Number(cb.value));
    });
  }

  updateMassActionsBar();
}

function toggleContactoSelect(id, checkboxEl) {
  if (!state.selectedContactos) state.selectedContactos = new Set();

  if (checkboxEl.checked) {
    state.selectedContactos.add(Number(id));
  } else {
    state.selectedContactos.delete(Number(id));
  }

  updateMassActionsBar();
}

function deseleccionarTodosContactos() {
  if (state.selectedContactos) state.selectedContactos.clear();
  document.querySelectorAll('.contacto-row-check').forEach((cb) => { cb.checked = false; });
  const selectAll = document.getElementById('selectAllContactos');
  if (selectAll) selectAll.checked = false;
  updateMassActionsBar();
}

function updateMassActionsBar() {
  const bar = document.getElementById('massActionsBar');
  const countBadge = document.getElementById('selectedCountBadge');
  const countText = document.getElementById('selectedCountText');
  const selectAll = document.getElementById('selectAllContactos');

  const count = state.selectedContactos ? state.selectedContactos.size : 0;

  if (countBadge) countBadge.textContent = count;
  if (countText) countText.textContent = count === 1 ? 'contacto seleccionado' : 'contactos seleccionados';

  if (bar) {
    if (count > 0) {
      bar.classList.remove('hidden');
    } else {
      bar.classList.add('hidden');
    }
  }

  if (selectAll) {
    const totalCheckboxes = document.querySelectorAll('.contacto-row-check').length;
    selectAll.checked = totalCheckboxes > 0 && count >= totalCheckboxes;
  }
}

function getSelectedContactosList() {
  if (!state.selectedContactos || state.selectedContactos.size === 0) return [];
  return (state.db.contactos || []).filter((c) => state.selectedContactos.has(c.id));
}

// Correo Masivo
function openModalCorreoMasivo() {
  const selected = getSelectedContactosList().filter((c) => c.correo && c.correo.includes('@'));
  if (selected.length === 0) {
    alert('Ninguno de los contactos seleccionados tiene un correo electrónico válido registrado.');
    return;
  }

  const countEl = document.getElementById('bulkEmailCount');
  if (countEl) countEl.textContent = selected.length;

  const chipsEl = document.getElementById('bulkEmailChips');
  if (chipsEl) {
    chipsEl.innerHTML = selected.map((c) => `<span class="badge" style="background:#1e293b; padding:3px 8px; border-radius:4px; font-size:11px;">${escapeHtml(c.nombre)} &lt;${escapeHtml(c.correo)}&gt;</span>`).join(' ');
  }

  openModal('modalCorreoMasivo');
}

async function ejecutarEnvioCorreoMasivo(e) {
  e.preventDefault();
  const selected = getSelectedContactosList().filter((c) => c.correo && c.correo.includes('@'));
  const subject = document.getElementById('bulkEmailSubject')?.value.trim();
  const body = document.getElementById('bulkEmailBody')?.value.trim();

  if (selected.length === 0 || !subject) return;

  const emails = selected.map((c) => c.correo).join(',');
  const mailtoUrl = `mailto:?bcc=${encodeURIComponent(emails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Abrir cliente de correo del sistema operativo
  window.open(mailtoUrl, '_blank');

  // Registrar auditoría en backend
  try {
    const ids = selected.map((c) => c.id);
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    await fetch('/api/contactos/bulk-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, accion: 'enviar_correo', valor: subject, autor })
    });
  } catch (err) {
    console.error(err);
  }

  closeModal('modalCorreoMasivo');
  alert(`Se ha preparado el envío de correo masivo para ${selected.length} destinatarios en tu cliente de correo.`);
  loadAllData();
}

// WhatsApp Masivo
function openModalWhatsappMasivo() {
  const selected = getSelectedContactosList();
  if (selected.length === 0) {
    alert('Por favor selecciona al menos un contacto.');
    return;
  }

  actualizarEnlacesWhatsappMasivo();
  openModal('modalWhatsappMasivo');
}

function actualizarEnlacesWhatsappMasivo() {
  const container = document.getElementById('bulkWhatsappList');
  if (!container) return;

  const selected = getSelectedContactosList();
  const baseMessage = document.getElementById('bulkWhatsappText')?.value.trim() || '¡Hola! Le contactamos de IB SYSTEM.';

  container.innerHTML = selected
    .map((c) => {
      const cleanPhone = (c.whatsapp || c.telefono || '').replace(/[^0-9]/g, '');
      const hasPhone = Boolean(cleanPhone);
      const url = hasPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(baseMessage)}` : '#';

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:12px;">
          <div>
            <strong>${escapeHtml(c.nombre)} ${escapeHtml(c.apellido || '')}</strong>
            <span class="text-muted"> (${escapeHtml(c.empresa || 'Empresa')})</span>
            <div style="color:${hasPhone ? '#22c55e' : '#ef4444'}; font-size:11px;">
              ${hasPhone ? `+${cleanPhone}` : 'Sin teléfono válido'}
            </div>
          </div>
          <div>
            ${hasPhone
              ? `<a href="${url}" target="_blank" class="btn btn-outline-success btn-sm" style="text-decoration:none;">Abrir Chat</a>`
              : `<span class="text-muted" style="font-size:11px;">No disponible</span>`
            }
          </div>
        </div>
      `;
    })
    .join('');
}

// Asignar Responsable Masivo
function openModalAsignarResponsableMasivo() {
  const count = state.selectedContactos ? state.selectedContactos.size : 0;
  if (count === 0) {
    alert('Por favor selecciona al menos un contacto.');
    return;
  }
  openModal('modalAsignarResponsableMasivo');
}

async function ejecutarAsignarResponsableMasivo() {
  const ids = Array.from(state.selectedContactos || []);
  const responsable = document.getElementById('bulkSelectResponsable')?.value;
  if (!responsable || ids.length === 0) return;

  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    const res = await fetch('/api/contactos/bulk-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, accion: 'asignar_responsable', valor: responsable, autor })
    });

    if (res.ok) {
      closeModal('modalAsignarResponsableMasivo');
      deseleccionarTodosContactos();
      loadAllData();
      alert(`Se ha asignado a "${responsable}" como responsable de ${ids.length} contactos.`);
    }
  } catch (err) {
    alert('Error al asignar responsable');
  }
}

// Asignar Etiqueta Masiva
function openModalAsignarEtiquetaMasivo() {
  const count = state.selectedContactos ? state.selectedContactos.size : 0;
  if (count === 0) {
    alert('Por favor selecciona al menos un contacto.');
    return;
  }
  openModal('modalAsignarEtiquetaMasivo');
}

async function ejecutarAsignarEtiquetaMasivo() {
  const ids = Array.from(state.selectedContactos || []);
  const selectEtiqueta = document.getElementById('bulkSelectEtiqueta')?.value;
  const customEtiqueta = document.getElementById('bulkCustomEtiqueta')?.value.trim();
  const etiqueta = customEtiqueta || selectEtiqueta;

  if (!etiqueta || ids.length === 0) return;

  try {
    const autor = state.currentUser ? state.currentUser.nombre : 'Admin';
    const res = await fetch('/api/contactos/bulk-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, accion: 'asignar_etiqueta', valor: etiqueta, autor })
    });

    if (res.ok) {
      closeModal('modalAsignarEtiquetaMasivo');
      deseleccionarTodosContactos();
      loadAllData();
      alert(`Se ha asignado la etiqueta "${etiqueta}" a ${ids.length} contactos.`);
    }
  } catch (err) {
    alert('Error al asignar etiqueta');
  }
}

// Exportar Seleccionados (Prioridad #8 y #10)
function exportSelectedContactos(format = 'csv') {
  const selected = getSelectedContactosList();
  if (selected.length === 0) {
    alert('Por favor selecciona al menos un contacto para exportar.');
    return;
  }

  const filename = `CRMComercial_Contactos_Seleccionados_${new Date().toISOString().split('T')[0]}.${format}`;

  if (format === 'xlsx' && typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.json_to_sheet(selected);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contactos');
    XLSX.writeFile(wb, filename);
  } else {
    // CSV con UTF-8 BOM (\uFEFF)
    const keys = Object.keys(selected[0]);
    const csvContent =
      '\uFEFF' +
      [
        keys.join(','),
        ...selected.map((row) =>
          keys
            .map((k) => {
              let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(',')
        )
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function appendTagToInput(tag) {
  const input = document.getElementById('contactoEtiquetas');
  if (!input) return;

  const current = input.value.trim();
  if (!current) {
    input.value = tag;
  } else {
    const parts = current.split(',').map((p) => p.trim());
    if (!parts.includes(tag)) {
      input.value = current + ', ' + tag;
    }
  }
}

// --------------------------------------------------------------------------
// MÓDULO DE RELACIONES COMPLETAS (Prioridad #4: Empresa <-> Contacto <-> Oportunidad)
// --------------------------------------------------------------------------

// Ficha Detallada de Empresa
function openEmpresaDetalle(empresaId, fallbackNombre = '') {
  let e = (state.db.empresas || []).find((item) => item.id === Number(empresaId));
  if (!e && fallbackNombre) {
    e = (state.db.empresas || []).find((item) => (item.razon_social || '').toLowerCase() === fallbackNombre.toLowerCase());
  }

  if (!e) {
    alert('Empresa no encontrada.');
    return;
  }

  // Encabezado
  document.getElementById('detalleEmpresaTitulo').textContent = e.razon_social;
  document.getElementById('detalleEmpresaBadgeRnc').textContent = 'RNC: ' + (e.rnc || 'No asignado');
  document.getElementById('detalleEmpresaBadgeEstado').textContent = e.estado_comercial || 'Prospecto';

  // Tab 1: Ficha General
  document.getElementById('detEmpRazon').textContent = e.razon_social;
  document.getElementById('detEmpComercial').textContent = e.nombre_comercial || '-';
  document.getElementById('detEmpRnc').textContent = e.rnc;
  document.getElementById('detEmpIndustria').textContent = e.industria || 'General';
  document.getElementById('detEmpUbicacion').textContent = `${e.ciudad || 'Santo Domingo'}, ${e.provincia || 'Distrito Nacional'}`;
  document.getElementById('detEmpDireccion').textContent = e.direccion || 'No especificada';
  document.getElementById('detEmpTelefono').textContent = e.telefono || '-';
  document.getElementById('detEmpCorreo').textContent = e.correo || '-';
  document.getElementById('detEmpWeb').textContent = e.sitio_web || '-';
  document.getElementById('detEmpEmpleados').textContent = e.cantidad_empleados || '25-50';
  document.getElementById('detEmpResponsable').textContent = e.responsable_comercial || 'Yenifer Reina';
  document.getElementById('detEmpRegistro').textContent = e.fecha_creacion || 'Reciente';

  // Tab 2: Contactos Asociados (Prioridad #4)
  const contactosRel = (state.db.contactos || []).filter(
    (c) => c.empresa_id === e.id || (c.empresa && c.empresa.toLowerCase() === e.razon_social.toLowerCase())
  );
  document.getElementById('countEmpresaContactos').textContent = contactosRel.length;

  const tableContactos = document.getElementById('detEmpresaContactosTable');
  if (tableContactos) {
    if (contactosRel.length === 0) {
      tableContactos.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No hay contactos asociados a esta empresa aún.</td></tr>`;
    } else {
      tableContactos.innerHTML = contactosRel
        .map((c) => {
          const cleanPhone = (c.whatsapp || c.telefono || '').replace(/[^0-9]/g, '');
          const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';
          return `
            <tr>
              <td>
                <strong>${escapeHtml(c.nombre)} ${escapeHtml(c.apellido || '')}</strong>
                <div class="text-muted" style="font-size:11px;">${escapeHtml(c.cargo || 'Decisor')}</div>
              </td>
              <td>
                <div>${escapeHtml(c.telefono || '-')}</div>
                ${cleanPhone ? `<a href="${waUrl}" target="_blank" style="color:#22c55e; font-size:11px; text-decoration:none;">WhatsApp</a>` : ''}
              </td>
              <td>${escapeHtml(c.correo || '-')}</td>
              <td><span class="badge" style="background:#1e3a8a; font-size:11px;">${escapeHtml(c.estado_comercial || 'Prospecto')}</span></td>
              <td>
                <button class="btn btn-outline-primary btn-sm" onclick="closeModal('modalDetalleEmpresa'); openContactoDetalle(${c.id})">Ver Ficha</button>
              </td>
            </tr>
          `;
        })
        .join('');
    }
  }

  // Tab 3: Oportunidades Asociadas (Prioridad #4)
  const oportunidadesRel = (state.db.prospectos || []).filter(
    (p) => p.empresa_id === e.id || (p.empresa && p.empresa.toLowerCase() === e.razon_social.toLowerCase())
  );
  document.getElementById('countEmpresaOportunidades').textContent = oportunidadesRel.length;

  const tableOportunidades = document.getElementById('detEmpresaOportunidadesTable');
  if (tableOportunidades) {
    if (oportunidadesRel.length === 0) {
      tableOportunidades.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">No hay oportunidades comerciales registradas para esta empresa.</td></tr>`;
    } else {
      tableOportunidades.innerHTML = oportunidadesRel
        .map((p) => `
          <tr>
            <td><strong>${escapeHtml(p.empresa)}</strong></td>
            <td><span class="badge" style="background:${p.etapa === 'Ganado' ? '#10b981' : p.etapa === 'Perdido' ? '#ef4444' : '#3b82f6'}; font-size:11px;">${escapeHtml(p.etapa)}</span></td>
            <td>Plan ${escapeHtml(p.plan_seleccionado || 'PYME')}</td>
            <td style="color:#34d399; font-weight:700;">US$ ${Number(p.costo_mensual || 0).toFixed(2)}/mes</td>
            <td style="color:#60a5fa; font-weight:700;">US$ ${Number(p.valor_estimado || 0).toFixed(2)}</td>
            <td>${escapeHtml(p.contacto_principal || '-')}</td>
          </tr>
        `)
        .join('');
    }
  }

  // Tab 4: Seguimientos de la Empresa
  const seguimientosRel = (state.db.seguimientos || []).filter(
    (s) => (s.empresa && s.empresa.toLowerCase().includes(e.razon_social.toLowerCase()))
  );
  document.getElementById('countEmpresaSeguimientos').textContent = seguimientosRel.length;
  const listSeg = document.getElementById('detEmpresaSeguimientosList');
  if (listSeg) {
    if (seguimientosRel.length === 0) {
      listSeg.innerHTML = `<p style="color:var(--text-muted); font-size:12px; padding:12px;">No hay seguimientos registrados para esta empresa.</p>`;
    } else {
      listSeg.innerHTML = seguimientosRel.map((s) => `
        <div style="padding:10px; border-bottom:1px solid var(--border-color); font-size:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>${escapeHtml(s.canal)} - ${escapeHtml(s.resultado)}</strong>
            <span class="text-muted">${escapeHtml(s.fecha)}</span>
          </div>
          <p style="margin:0; color:var(--text-muted);">${escapeHtml(s.observaciones)}</p>
          ${s.proxima_accion ? `<div style="font-size:11px; color:#60a5fa; margin-top:4px;">Próxima acción: ${escapeHtml(s.proxima_accion)}</div>` : ''}
        </div>
      `).join('');
    }
  }

  // Tab 5: Auditoría y Trazabilidad
  const auditRel = (state.db.auditoria || []).filter(
    (a) => (a.registro_afectado && a.registro_afectado.toLowerCase().includes(e.razon_social.toLowerCase()))
  );
  const listAudit = document.getElementById('detEmpresaAuditoriaList');
  if (listAudit) {
    if (auditRel.length === 0) {
      listAudit.innerHTML = `<p style="color:var(--text-muted); font-size:12px; padding:12px;">No hay registros de auditoría directa para esta entidad.</p>`;
    } else {
      listAudit.innerHTML = auditRel.map((a) => `
        <div style="padding:8px 0; border-bottom:1px solid var(--border-color); font-size:11px;">
          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <strong>${escapeHtml(a.usuario)} - ${escapeHtml(a.accion)}</strong>
            <span>${escapeHtml(a.fecha)} ${escapeHtml(a.hora)}</span>
          </div>
          <div>${escapeHtml(a.detalles || a.registro_afectado)}</div>
        </div>
      `).join('');
    }
  }

  // Botón Editar
  const btnEdit = document.getElementById('btnEditarDesdeDetalleEmpresa');
  if (btnEdit) {
    btnEdit.onclick = () => {
      closeModal('modalDetalleEmpresa');
      editEmpresa(e.id);
    };
  }

  switchDetalleEmpresaTab('tabEmpresaInfo');
  openModal('modalDetalleEmpresa');
}

function switchDetalleEmpresaTab(tabId) {
  document.querySelectorAll('#modalDetalleEmpresa .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
  });

  document.querySelectorAll('#modalDetalleEmpresa .tab-content').forEach((tc) => {
    tc.classList.toggle('active', tc.id === tabId);
  });
}

// Ficha Detallada de Contacto (Prioridad #4: Relación Contacto -> Empresa -> Oportunidades -> Historial)
function openContactoDetalle(contactoId) {
  const c = (state.db.contactos || []).find((item) => item.id === Number(contactoId));
  if (!c) {
    alert('Contacto no encontrado.');
    return;
  }

  // Encabezado
  document.getElementById('detalleContactoTitulo').textContent = `${c.nombre} ${c.apellido || ''}`;

  // Botón enlace a Empresa
  const empLink = document.getElementById('detalleContactoEmpresaLink');
  if (empLink) {
    empLink.textContent = `🏢 Ver Empresa: ${c.empresa || 'Asociada'}`;
    empLink.onclick = () => {
      closeModal('modalDetalleContacto');
      openEmpresaDetalle(c.empresa_id || 0, c.empresa);
    };
  }

  document.getElementById('detContNombre').textContent = `${c.nombre} ${c.apellido || ''}`;
  document.getElementById('detContCargo').textContent = c.cargo || 'Decisor Comercial';
  document.getElementById('detContEmpresa').textContent = c.empresa || 'Sin empresa';
  document.getElementById('detContEstado').textContent = c.estado_comercial || 'Prospecto';
  document.getElementById('detContTelefono').textContent = c.telefono || '-';
  document.getElementById('detContWhatsapp').textContent = c.whatsapp || '-';
  document.getElementById('detContCorreo').textContent = c.correo || '-';
  document.getElementById('detContResponsable').textContent = c.responsable_comercial || 'Yenifer Reina';
  document.getElementById('detContProducto').textContent = c.producto_interes || 'Facturación Electrónica';
  document.getElementById('detContModulo').textContent = c.modulo_principal || 'Ventas';
  document.getElementById('detContUbicacion').textContent = `${c.ciudad || 'Santo Domingo'}, ${c.provincia || 'Distrito Nacional'}${c.direccion ? ' - ' + c.direccion : ''}`;
  document.getElementById('detContProximoSeg').textContent = c.fecha_proximo_seguimiento || 'No programado';
  document.getElementById('detContObservaciones').textContent = c.observaciones_comerciales || 'Sin observaciones comerciales.';
  document.getElementById('detContNotas').textContent = c.notas || 'Sin notas internas.';

  // Etiquetas
  const tagsContainer = document.getElementById('detContEtiquetas');
  if (tagsContainer) {
    if (c.etiquetas) {
      tagsContainer.innerHTML = c.etiquetas.split(',').map((t) => `<span class="badge" style="background:#1e3a8a; padding:2px 8px; border-radius:4px; font-size:11px;">${escapeHtml(t.trim())}</span>`).join(' ');
    } else {
      tagsContainer.innerHTML = `<span class="text-muted" style="font-size:11px;">Sin etiquetas</span>`;
    }
  }

  // Oportunidades Relacionadas con este contacto o su empresa
  const opRel = (state.db.prospectos || []).filter(
    (p) => (p.contacto_principal && p.contacto_principal.toLowerCase().includes(c.nombre.toLowerCase())) ||
           (c.empresa && p.empresa && p.empresa.toLowerCase() === c.empresa.toLowerCase())
  );
  const listOp = document.getElementById('detContOportunidadesList');
  if (listOp) {
    if (opRel.length === 0) {
      listOp.innerHTML = `<p style="color:var(--text-muted); font-size:12px;">No hay oportunidades registradas para este contacto.</p>`;
    } else {
      listOp.innerHTML = opRel.map((p) => `
        <div style="padding:8px 0; border-bottom:1px solid var(--border-color); font-size:12px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${escapeHtml(p.empresa)}</strong>
            <span class="badge" style="margin-left:6px; font-size:10px; background:#1e3a8a;">${escapeHtml(p.etapa)}</span>
            <div class="text-muted" style="font-size:11px;">Plan ${escapeHtml(p.plan_seleccionado || 'PYME')}</div>
          </div>
          <div style="text-align:right;">
            <strong style="color:#34d399;">US$ ${Number(p.costo_mensual || 0).toFixed(2)}/mes</strong>
            <div style="font-size:11px; color:#60a5fa;">Total Anual: US$ ${Number(p.valor_estimado || 0).toFixed(2)}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // Seguimientos relacionados
  const segRel = (state.db.seguimientos || []).filter(
    (s) => (c.empresa && s.empresa && s.empresa.toLowerCase().includes(c.empresa.toLowerCase()))
  );
  const listSeg = document.getElementById('detContSeguimientosList');
  if (listSeg) {
    if (segRel.length === 0) {
      listSeg.innerHTML = `<p style="color:var(--text-muted); font-size:12px;">No hay seguimientos registrados para este contacto.</p>`;
    } else {
      listSeg.innerHTML = segRel.map((s) => `
        <div style="padding:8px 0; border-bottom:1px solid var(--border-color); font-size:11px;">
          <div style="display:flex; justify-content:space-between;">
            <strong>${escapeHtml(s.canal)} - ${escapeHtml(s.resultado)}</strong>
            <span class="text-muted">${escapeHtml(s.fecha)}</span>
          </div>
          <p style="margin:2px 0 0 0; color:var(--text-muted);">${escapeHtml(s.observaciones)}</p>
        </div>
      `).join('');
    }
  }

  // Botón Editar
  const btnEdit = document.getElementById('btnEditarDesdeDetalleContacto');
  if (btnEdit) {
    btnEdit.onclick = () => {
      closeModal('modalDetalleContacto');
      editContacto(c.id);
    };
  }

  openModal('modalDetalleContacto');
}

// --------------------------------------------------------------------------
// MÓDULO 4: PIPELINE COMERCIAL, CATÁLOGO DE PLANES & CÁLCULO DE COSTOS
// --------------------------------------------------------------------------

// Manejador del cambio de Empresa en Modal de Oportunidad (Prioridad #5: Selección y Auto-completado)
function handleProsEmpresaChange() {
  const empSelect = document.getElementById('prosEmpresaSelect');
  const contactoSelect = document.getElementById('prosContactoSelect');
  if (!empSelect || !contactoSelect) return;

  const empresaId = Number(empSelect.value);
  const empresa = (state.db.empresas || []).find((e) => e.id === empresaId);

  if (!empresa) {
    contactoSelect.innerHTML = '<option value="">-- Primero selecciona una empresa --</option>';
    return;
  }

  // Pre-completar teléfono, correo y responsable de la empresa
  if (document.getElementById('prosTelefono')) document.getElementById('prosTelefono').value = empresa.telefono || '';
  if (document.getElementById('prosCorreo')) document.getElementById('prosCorreo').value = empresa.correo || '';
  if (document.getElementById('prosResponsable') && empresa.responsable_comercial) {
    document.getElementById('prosResponsable').value = empresa.responsable_comercial;
  }

  // Cargar contactos asociados a esta empresa
  const contactos = (state.db.contactos || []).filter(
    (c) => c.empresa_id === empresa.id || (c.empresa && c.empresa.toLowerCase() === empresa.razon_social.toLowerCase())
  );

  if (contactos.length === 0) {
    contactoSelect.innerHTML = '<option value="">-- Sin contactos específicos (Se usará contacto de empresa) --</option>';
  } else {
    contactoSelect.innerHTML = '<option value="">-- Seleccionar Contacto Principal --</option>' +
      contactos.map((c) => `<option value="${c.id}">${escapeHtml(c.nombre)} ${escapeHtml(c.apellido || '')} (${escapeHtml(c.cargo || 'Contacto')})</option>`).join('');

    // Auto-seleccionar el primer contacto principal
    contactoSelect.selectedIndex = 1;
    handleProsContactoChange();
  }
}

// Manejador del cambio de Contacto Principal en Modal de Oportunidad (Prioridad #5)
function handleProsContactoChange() {
  const contactoSelect = document.getElementById('prosContactoSelect');
  if (!contactoSelect || !contactoSelect.value) return;

  const contactoId = Number(contactoSelect.value);
  const contacto = (state.db.contactos || []).find((c) => c.id === contactoId);

  if (!contacto) return;

  // Auto-completar datos del contacto sin tener que escribirlos manualmente
  if (contacto.telefono && document.getElementById('prosTelefono')) {
    document.getElementById('prosTelefono').value = contacto.telefono;
  }
  if (contacto.whatsapp && document.getElementById('prosWhatsapp')) {
    document.getElementById('prosWhatsapp').value = contacto.whatsapp;
  }
  if (contacto.correo && document.getElementById('prosCorreo')) {
    document.getElementById('prosCorreo').value = contacto.correo;
  }
  if (contacto.responsable_comercial && document.getElementById('prosResponsable')) {
    document.getElementById('prosResponsable').value = contacto.responsable_comercial;
  }
}

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

  const empSelect = document.getElementById('prosEmpresaSelect');
  const contactoSelect = document.getElementById('prosContactoSelect');

  const empresaId = empSelect && empSelect.value ? Number(empSelect.value) : null;
  const empresaNombre = empSelect && empSelect.selectedIndex >= 0 ? empSelect.options[empSelect.selectedIndex].text.replace(/\s*\(.*?\)\s*$/, '').trim() : '';

  let contactoNombre = '';
  if (contactoSelect && contactoSelect.selectedIndex >= 0 && contactoSelect.value) {
    contactoNombre = contactoSelect.options[contactoSelect.selectedIndex].text.replace(/\s*\(.*?\)\s*$/, '').trim();
  }

  const payload = {
    empresa_id: empresaId,
    empresa: empresaNombre,
    contacto_principal: contactoNombre || 'Contacto General',
    telefono: document.getElementById('prosTelefono')?.value.trim() || '',
    whatsapp: document.getElementById('prosWhatsapp')?.value.trim() || '',
    correo: document.getElementById('prosCorreo')?.value.trim() || '',
    etapa: document.getElementById('prosEtapa')?.value || 'Contacto',
    responsable_comercial: document.getElementById('prosResponsable')?.value || 'Yenifer Reina',
    plan_seleccionado: document.getElementById('prosPlan')?.value || 'PYME',
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
// MÓDULO 11: EXPORTACIÓN (Prioridad #10: Respetar Filtros y Codificación UTF-8)
// --------------------------------------------------------------------------
function exportData(moduleName, format = 'csv') {
  let data = [];
  const today = new Date().toISOString().split('T')[0];
  let filename = `CRMComercial_${moduleName}_${today}.${format}`;

  if (moduleName === 'empresas') {
    const query = (document.getElementById('filterEmpresas')?.value || '').toLowerCase().trim();
    if (query) {
      data = (state.db.empresas || []).filter(
        (e) =>
          e.razon_social.toLowerCase().includes(query) ||
          (e.rnc || '').toLowerCase().includes(query) ||
          (e.industria || '').toLowerCase().includes(query)
      );
    } else {
      data = state.db.empresas || [];
    }
  } else if (moduleName === 'contactos') {
    // Respetar filtros aplicados (Prioridad #10)
    data = state.currentFilteredContactos && state.currentFilteredContactos.length > 0
      ? state.currentFilteredContactos
      : (state.db.contactos || []);
  } else if (moduleName === 'prospectos') {
    data = state.db.prospectos || [];
  } else if (moduleName === 'auditoria') {
    const query = (document.getElementById('filterAuditoria')?.value || '').toLowerCase().trim();
    if (query) {
      data = (state.db.auditoria || []).filter(
        (a) =>
          a.usuario.toLowerCase().includes(query) ||
          a.accion.toLowerCase().includes(query) ||
          a.modulo.toLowerCase().includes(query) ||
          (a.registro_afectado || '').toLowerCase().includes(query)
      );
    } else {
      data = state.db.auditoria || [];
    }
  }

  if (data.length === 0) {
    alert('No hay registros disponibles para exportar con los filtros actuales.');
    return;
  }

  if (format === 'xlsx' && typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, moduleName.toUpperCase());
    XLSX.writeFile(wb, filename);
  } else {
    // Generar CSV con marca BOM UTF-8 (\uFEFF) para visualización correcta de tildes y caracteres especiales en Excel (Prioridad #11)
    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(','),
      ...data.map((row) =>
        keys
          .map((k) => {
            let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
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
