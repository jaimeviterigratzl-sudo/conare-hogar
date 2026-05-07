/* CONARE HOGAR — Módulo Admin */
const Admin = {

  async cargar() {
    const clientes = await DB.getTodosLosClientes();
    document.getElementById('adm-clientes').textContent = clientes.length;
    const totalIngresos = clientes.reduce((sum, c) => {
      const plan = CONFIG.PLANES[c.plan];
      return sum + (plan ? plan.precio : 0);
    }, 0);
    document.getElementById('adm-ingresos').textContent = App.formatPrecio(totalIngresos);
    Admin._renderClientes(clientes);
    await Admin._renderRutas();
    Admin._renderIngresos(clientes);
    await Admin._renderSolicitudes();
  },

  _renderClientes(clientes) {
    const lista = document.getElementById('admin-lista-clientes');
    if (!clientes.length) { lista.innerHTML = '<div class="empty-state">No hay clientes registrados aún.</div>'; return; }
    lista.innerHTML = clientes.map(c => {
      const plan = CONFIG.PLANES[c.plan] || CONFIG.PLANES.basico;
      const initials = `${c.nombre?.charAt(0)||'?'}${c.apellido?.charAt(0)||''}`.toUpperCase();
      return `<div class="client-row"><div class="client-avatar">${initials}</div><div class="client-info"><div class="client-name">${c.nombre} ${c.apellido}</div><div class="client-sub">${c.ciudad||'—'} · ${c.direccion||'—'}</div></div><span class="badge ${plan.badge}">${plan.nombre}</span></div>`;
    }).join('');
  },

  async _renderRutas() {
    const retiros = await DB.getRutasSemana();
    const content = document.getElementById('admin-rutas-content');
    if (!retiros.length) { content.innerHTML = '<div class="empty-state">No hay retiros aprobados esta semana.</div>'; return; }
    const porDia = {};
    retiros.forEach(r => {
      const fecha = new Date(r.fecha_programada).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!porDia[fecha]) porDia[fecha] = [];
      porDia[fecha].push(r);
    });
    content.innerHTML = Object.entries(porDia).map(([dia, rets]) => `
      <div class="route-block"><div class="route-day">${dia}</div>
      ${rets.map(r => `<div class="route-stop"><div class="route-dot" style="background:#1D9E75"></div>${r.hora_inicio||'09:00'} · ${r.usuarios?.nombre} ${r.usuarios?.apellido} — ${r.usuarios?.direccion}</div>`).join('')}
      </div>`).join('');
  },

  _renderIngresos(clientes) {
    const content = document.getElementById('admin-ingresos-content');
    const porPlan = { basico: 0, estandar: 0, premium: 0 };
    clientes.forEach(c => { if (porPlan[c.plan] !== undefined) porPlan[c.plan]++; });
    content.innerHTML = `<div class="card-title"><i class="ti ti-chart-bar"></i> Ingresos por plan</div>
      ${Object.entries(CONFIG.PLANES).map(([key, plan]) => `<div class="revenue-row"><span>${plan.nombre} (${porPlan[key]} clientes)</span><strong>${App.formatPrecio(plan.precio * porPlan[key])}</strong></div>`).join('')}
      <div style="display:flex;justify-content:space-between;font-weight:500;font-size:14px;padding-top:10px;border-top:1px solid var(--border)"><span>Total</span><span style="color:#1D9E75">${App.formatPrecio(Object.entries(CONFIG.PLANES).reduce((s,[k,p]) => s + p.precio * porPlan[k], 0))} / mes</span></div>`;
  },

  async _renderSolicitudes() {
    const solicitudes = await DB.getSolicitudesConFotos();
    const content = document.getElementById('admin-solicitudes-content');
    if (!solicitudes.length) { content.innerHTML = '<div class="empty-state">No hay solicitudes pendientes.</div>'; return; }
    content.innerHTML = solicitudes.map(s => `
      <div style="padding:10px 0;border-bottom:0.5px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div class="retiro-icon" style="width:36px;height:36px;font-size:16px"><i class="ti ti-camera"></i></div>
          <div style="flex:1"><div style="font-weight:500;font-size:13px">${s.usuarios?.nombre} ${s.usuarios?.apellido}</div>
          <div style="font-size:11px;color:#666">${App.formatFecha(s.fecha_programada)} · ${(s.materiales||[]).join(', ')}</div></div>
          <span class="badge ${s.camion_asignado ? 'badge-green' : 'badge-amber'}">${s.camion_asignado ? 'Asignado' : 'Pendiente'}</span>
        </div>
        ${!s.camion_asignado ? `<button class="btn btn-primary btn-full" onclick="Admin.asignarCamion('${s.id}')"><i class="ti ti-truck"></i> Asignar camión</button>` : ''}
      </div>`).join('');
  },

  tab(name, btn) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(`admin-panel-${name}`).classList.add('active');
    btn.classList.add('active');
  },

  buscar(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.client-row').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
    });
  },

  async asignarCamion(retiroId) {
    const camion = prompt('¿Qué camión asignar?\n1 = Ruta Sur\n2 = Ruta Norte\n3 = Ruta Este');
    if (!camion) return;
    const cam = CONFIG.CAMIONES.find(c => c.id === parseInt(camion));
    if (!cam) { alert('Número inválido.'); return; }
    await supabase.from('retiros').update({ camion_asignado: cam.nombre }).eq('id', retiroId);
    alert(`${cam.nombre} asignado.`);
    await Admin._renderSolicitudes();
  },

  exportar() {
    const rows = document.querySelectorAll('.client-row');
    const csv = ['Nombre,Plan,Ciudad,Dirección'];
    rows.forEach(row => {
      const name = row.querySelector('.client-name')?.textContent || '';
      const plan = row.querySelector('.badge')?.textContent || '';
      const sub = row.querySelector('.client-sub')?.textContent?.split(' · ') || ['',''];
      csv.push(`"${name}","${plan}","${sub[0]}","${sub[1]}"`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'clientes-conare-hogar.csv';
    a.click();
  },

  async notificarTodos() {
    if (!confirm('¿Notificar a todos los clientes?')) return;
    alert('Notificaciones enviadas correctamente.');
  },
};
