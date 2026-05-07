/* ============================================
   CONARE HOGAR — Módulos funcionales
   Retiro, Fotos, Camiones, Admin, MiPlan, Perfil
   ============================================ */

/* ── RETIRO ─────────────────────────────── */
const Retiro = {

  async aprobar() {
    const r = App.state.retiroPendiente;
    if (!r) return;
    await DB.aprobarRetiro(r.id);
    document.getElementById('card-retiro-pendiente').style.display = 'none';
    document.getElementById('toast-retiro').style.display = 'none';

    // Muestra card para subir fotos
    const cardFotos = document.getElementById('card-fotos');
    cardFotos.style.display = 'block';
    document.getElementById('fotos-fecha-sub').textContent =
      `${App.formatFecha(r.fecha_programada)} · ${r.hora_inicio || '08:00'} – ${r.hora_fin || '10:00'} hrs`;
  },

  async rechazar() {
    const r = App.state.retiroPendiente;
    if (!r) return;
    await DB.rechazarRetiro(r.id);
    const card = document.getElementById('card-retiro-pendiente');
    card.innerHTML = `
      <div style="text-align:center;padding:20px;color:#666;font-size:13px">
        <i class="ti ti-calendar-x" style="font-size:36px;color:#BA7517;display:block;margin:0 auto 10px"></i>
        <strong>Entendido</strong><br>
        Hemos notificado al equipo. Te asignaremos un nuevo horario pronto.
      </div>`;
  },

};

/* ── FOTOS ──────────────────────────────── */
const Fotos = {
  materiales: [],
  fotoFiles: [],

  toggleMaterial(btn) {
    const mat = btn.dataset.material;
    btn.classList.toggle('active');
    if (Fotos.materiales.includes(mat)) {
      Fotos.materiales = Fotos.materiales.filter(m => m !== mat);
    } else {
      Fotos.materiales.push(mat);
    }
  },

  agregar(input) {
    const grid = document.getElementById('photo-grid');
    Array.from(input.files).forEach(file => {
      Fotos.fotoFiles.push(file);
      const reader = new FileReader();
      reader.onload = e => {
        const idx = Fotos.fotoFiles.length - 1;
        const div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = `
          <img src="${e.target.result}" alt="Material reciclable">
          <button class="photo-del" onclick="Fotos.eliminar(${idx}, this.parentNode)" aria-label="Eliminar foto">
            <i class="ti ti-x"></i>
          </button>`;
        grid.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  },

  eliminar(idx, el) {
    Fotos.fotoFiles[idx] = null;
    el.remove();
  },

  async enviar() {
    const r = App.state.retiroPendiente;
    if (!r) return;
    if (!Fotos.materiales.length) {
      alert('Selecciona al menos un material.');
      return;
    }

    const btn = document.querySelector('#card-fotos .btn-primary');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Subiendo fotos...';

    // Sube fotos a Supabase Storage
    const urls = [];
    for (const file of Fotos.fotoFiles.filter(Boolean)) {
      const url = await DB.subirFoto(file, App.state.usuario.id, r.id);
      if (url) urls.push(url);
    }

    await DB.actualizarMateriales(r.id, Fotos.materiales, urls);

    document.getElementById('card-fotos').innerHTML = `
      <div style="text-align:center;padding:24px">
        <i class="ti ti-circle-check" style="font-size:44px;color:#1D9E75;display:block;margin:0 auto 12px"></i>
        <div style="font-weight:500;font-size:17px;margin-bottom:6px">¡Todo listo!</div>
        <div style="font-size:13px;color:#666;line-height:1.6">
          El camión llegará el <strong>${App.formatFecha(r.fecha_programada)}</strong><br>
          entre ${r.hora_inicio || '08:00'} y ${r.hora_fin || '10:00'} hrs.<br>
          Recibirás una notificación 30 minutos antes.
        </div>
      </div>`;
  },

};

/* ── CAMIONES EN TIEMPO REAL ─────────────── */
const Camiones = {
  timer: null,

  info: {
    1: 'Camión #1 — Ruta Sur · 3 paradas restantes · PET y aluminio',
    2: 'Camión #2 — Ruta Norte · A ~800 m de tu ubicación · ETA: 12 min',
    3: 'Camión #3 — En base · Sale a las 14:30 hrs',
  },

  seleccionar(n) {
    const box = document.getElementById('truck-info-box');
    if (box) box.innerHTML = `<i class="ti ti-truck" style="color:#1D9E75"></i> ${Camiones.info[n] || '—'}`;
  },

  iniciarAnimacion() {
    let t = 0;
    Camiones.timer = setInterval(() => {
      t += 0.025;
      const p1 = document.getElementById('truck-pin-1');
      const p2 = document.getElementById('truck-pin-2');
      if (p1) p1.style.left = (18 + Math.sin(t) * 8) + '%';
      if (p2) p2.style.left = (52 + Math.cos(t * 0.8) * 6) + '%';
    }, 120);
  },

  detenerAnimacion() {
    if (Camiones.timer) clearInterval(Camiones.timer);
  },
};

/* ── MI PLAN ─────────────────────────────── */
const MiPlan = {

  async cargar() {
    const u = App.state.usuario;
    if (!u) return;
    const plan = CONFIG.PLANES[u.plan] || CONFIG.PLANES.basico;

    document.getElementById('mi-plan-nombre').textContent = plan.nombre;
    document.getElementById('mi-plan-precio').textContent = App.formatPrecio(plan.precio);
    document.getElementById('mi-plan-retiros').textContent = `${plan.retiros} por mes`;

    const desde = u.suscripcion_desde
      ? new Date(u.suscripcion_desde).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';
    document.getElementById('mi-plan-desde').textContent = desde;

    const proxCobro = new Date(u.proximo_cobro || Date.now() + 30 * 86400000);
    document.getElementById('mi-plan-cobro').textContent =
      proxCobro.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

    // Marca plan activo
    document.querySelectorAll('[id^="cp-"]').forEach(c => {
      c.style.border = '0.5px solid var(--border)';
      c.classList.remove('sel');
    });
    const activo = document.getElementById(`cp-${u.plan}`);
    if (activo) { activo.style.border = '2px solid var(--verde)'; activo.classList.add('sel'); }
  },

  async cambiar(key, el) {
    document.querySelectorAll('[id^="cp-"]').forEach(c => {
      c.style.border = '0.5px solid var(--border)';
      c.classList.remove('sel');
    });
    el.style.border = '2px solid var(--verde)';
    el.classList.add('sel');

    const plan = CONFIG.PLANES[key];
    if (!plan) return;

    if (confirm(`¿Cambiar al plan ${plan.nombre} (${App.formatPrecio(plan.precio)}/mes)?`)) {
      await DB.actualizarUsuario(App.state.usuario.id, {
        plan: key,
        retiros_restantes: plan.retiros,
      });
      App.state.usuario.plan = key;
      document.getElementById('mi-plan-nombre').textContent = plan.nombre;
      document.getElementById('mi-plan-precio').textContent = App.formatPrecio(plan.precio);
      document.getElementById('mi-plan-retiros').textContent = `${plan.retiros} por mes`;
      alert(`Plan actualizado a ${plan.nombre}. El nuevo monto se cobrará en tu próximo ciclo.`);
    }
  },

  async cancelar() {
    if (confirm('¿Seguro que deseas cancelar tu suscripción? Seguirá activa hasta fin del período pagado.')) {
      await DB.actualizarUsuario(App.state.usuario.id, { cancelacion_solicitada: true });
      alert('Suscripción marcada para cancelación. Recibirás un correo de confirmación.');
    }
  },
};

/* ── PERFIL ──────────────────────────────── */
const Perfil = {

  cargar() {
    const u = App.state.usuario;
    if (!u) return;
    const initials = `${u.nombre?.charAt(0) || ''}${u.apellido?.charAt(0) || ''}`.toUpperCase();
    document.getElementById('perfil-avatar').textContent = initials;
    document.getElementById('perfil-nombre').textContent = `${u.nombre} ${u.apellido}`;
    document.getElementById('perfil-email').textContent = u.email;
    const dir = [u.direccion, u.depto, u.ciudad].filter(Boolean).join(', ');
    document.getElementById('perfil-direccion').value = dir;
    document.getElementById('perfil-telefono').value = u.telefono || '';
  },

  async guardar() {
    const direccion = document.getElementById('perfil-direccion').value.trim();
    const telefono  = document.getElementById('perfil-telefono').value.trim();
    await DB.actualizarUsuario(App.state.usuario.id, { direccion, telefono });
    alert('Cambios guardados correctamente.');
  },
};

/* ── ADMIN ───────────────────────────────── */
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
    if (!clientes.length) {
      lista.innerHTML = '<div class="empty-state">No hay clientes registrados aún.</div>';
      return;
    }
    lista.innerHTML = clientes.map(c => {
      const plan = CONFIG.PLANES[c.plan] || CONFIG.PLANES.basico;
      const initials = `${c.nombre?.charAt(0) || '?'}${c.apellido?.charAt(0) || ''}`.toUpperCase();
      return `
        <div class="client-row">
          <div class="client-avatar">${initials}</div>
          <div class="client-info">
            <div class="client-name">${c.nombre} ${c.apellido}</div>
            <div class="client-sub">${c.ciudad || '—'} · ${c.direccion || '—'}</div>
          </div>
          <span class="badge ${plan.badge}">${plan.nombre}</span>
        </div>`;
    }).join('');
  },

  async _renderRutas() {
    const retiros = await DB.getRutasSemana();
    const content = document.getElementById('admin-rutas-content');

    if (!retiros.length) {
      content.innerHTML = '<div class="empty-state">No hay retiros aprobados esta semana.</div>';
      return;
    }

    // Agrupa por día
    const porDia = {};
    retiros.forEach(r => {
      const fecha = new Date(r.fecha_programada).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!porDia[fecha]) porDia[fecha] = [];
      porDia[fecha].push(r);
    });

    content.innerHTML = Object.entries(porDia).map(([dia, rets]) => `
      <div class="route-block">
        <div class="route-day">${dia}</div>
        ${rets.map(r => `
          <div class="route-stop">
            <div class="route-dot" style="background:#1D9E75"></div>
            ${r.hora_inicio || '09:00'} · ${r.usuarios?.nombre} ${r.usuarios?.apellido} — ${r.usuarios?.direccion}
          </div>`).join('')}
      </div>`).join('');
  },

  _renderIngresos(clientes) {
    const content = document.getElementById('admin-ingresos-content');
    const porPlan = { basico: 0, estandar: 0, premium: 0 };
    clientes.forEach(c => { if (porPlan[c.plan] !== undefined) porPlan[c.plan]++; });

    content.innerHTML = `
      <div class="card-title"><i class="ti ti-chart-bar"></i> Ingresos por plan</div>
      ${Object.entries(CONFIG.PLANES).map(([key, plan]) => `
        <div class="revenue-row">
          <span>${plan.nombre} (${porPlan[key]} clientes)</span>
          <strong>${App.formatPrecio(plan.precio * porPlan[key])}</strong>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;font-weight:500;font-size:14px;padding-top:10px;border-top:1px solid var(--border)">
        <span>Total</span>
        <span style="color:var(--verde)">
          ${App.formatPrecio(Object.entries(CONFIG.PLANES).reduce((s, [k, p]) => s + p.precio * porPlan[k], 0))} / mes
        </span>
      </div>`;
  },

  async _renderSolicitudes() {
    const solicitudes = await DB.getSolicitudesConFotos();
    const content = document.getElementById('admin-solicitudes-content');

    if (!solicitudes.length) {
      content.innerHTML = '<div class="empty-state">No hay solicitudes con fotos pendientes.</div>';
      return;
    }

    content.innerHTML = solicitudes.map(s => `
      <div style="padding:10px 0;border-bottom:0.5px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div class="retiro-icon" style="width:36px;height:36px;font-size:16px"><i class="ti ti-camera"></i></div>
          <div style="flex:1">
            <div style="font-weight:500;font-size:13px">${s.usuarios?.nombre} ${s.usuarios?.apellido}</div>
            <div style="font-size:11px;color:#666">${App.formatFecha(s.fecha_programada)} · ${(s.materiales||[]).join(', ')}</div>
          </div>
          <span class="badge ${s.camion_asignado ? 'badge-green' : 'badge-amber'}">
            ${s.camion_asignado ? 'Asignado' : 'Pendiente'}
          </span>
        </div>
        ${!s.camion_asignado ? `
          <button class="btn btn-primary btn-full" style="font-size:13px" onclick="Admin.asignarCamion('${s.id}')">
            <i class="ti ti-truck"></i> Asignar camión
          </button>` : ''}
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
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? 'flex' : 'none';
    });
  },

  async asignarCamion(retiroId) {
    const camion = prompt('¿Qué camión asignar?\n1 = Ruta Sur\n2 = Ruta Norte\n3 = Ruta Este\nIngresa el número:');
    if (!camion) return;
    const cam = CONFIG.CAMIONES.find(c => c.id === parseInt(camion));
    if (!cam) { alert('Número de camión inválido.'); return; }
    const { error } = await supabase.from('retiros').update({ camion_asignado: cam.nombre }).eq('id', retiroId);
    if (!error) { alert(`${cam.nombre} asignado correctamente.`); await Admin._renderSolicitudes(); }
  },

  exportar() {
    const rows = document.querySelectorAll('.client-row');
    const csv = ['Nombre,Plan,Ciudad,Dirección'];
    rows.forEach(row => {
      const name = row.querySelector('.client-name')?.textContent || '';
      const plan = row.querySelector('.badge')?.textContent || '';
      const sub  = row.querySelector('.client-sub')?.textContent?.split(' · ') || ['', ''];
      csv.push(`"${name}","${plan}","${sub[0]}","${sub[1]}"`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clientes-conare-hogar.csv'; a.click();
  },

  async notificarTodos() {
    if (!confirm('¿Notificar a todos los clientes sobre sus retiros programados?')) return;
    alert('Notificaciones enviadas correctamente. (En producción: usa Supabase Edge Functions + push notifications)');
  },
};
