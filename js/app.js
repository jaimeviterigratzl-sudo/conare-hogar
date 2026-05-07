/* ============================================
   CONARE HOGAR — Controlador principal
   Navegación, estado global, inicialización
   ============================================ */

const App = {

  /* Estado global */
  state: {
    usuario: null,
    retiroPendiente: null,
    planActual: null,
    esAdmin: false,
  },

  /* Inicializa la app tras cargar Supabase */
  async init() {
    // Muestra pantalla de bienvenida inmediatamente
    App.navigate('welcome');
    
    // Intenta conectar Supabase si está disponible
    try {
      if (window.supabase && CONFIG.SUPABASE_URL !== 'https://TU_PROYECTO.supabase.co') {
        supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await App.cargarUsuario(session.user.id);
        }
      }
    } catch(e) {
      console.log('Supabase no disponible:', e);
    }
  },

    // Verifica si ya hay sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await App.cargarUsuario(session.user.id);
    } else {
      App.navigate('welcome');
    }
  },

  /* Carga datos del usuario y navega al dashboard */
  async cargarUsuario(userId) {
    const usuario = await DB.getUsuario(userId);
    if (!usuario) {
      // Usuario autenticado pero sin perfil → va a completar registro
      App.navigate('registro');
      return;
    }
    App.state.usuario = usuario;
    App.state.planActual = CONFIG.PLANES[usuario.plan] || CONFIG.PLANES.basico;
    App.state.esAdmin = usuario.email === CONFIG.ADMIN_EMAIL;

    App.renderTopbar();

    if (App.state.esAdmin) {
      App.navigate('admin');
    } else {
      App.navigate('home');
      await Dashboard.cargar();
    }
  },

  /* Navegación entre pantallas */
  navigate(screen) {
    // Oculta todas las pantallas
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Muestra la pantalla destino
    const target = document.getElementById(`scr-${screen}`);
    if (target) target.classList.add('active');

    // Bottom nav solo para usuarios logueados (excepto admin)
    const nav = document.getElementById('bottom-nav');
    const clientScreens = ['home', 'camiones', 'plan', 'perfil'];
    if (App.state.usuario && clientScreens.includes(screen)) {
      nav.style.display = 'flex';
      // Marca el botón activo
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`nav-${screen}`);
      if (activeBtn) activeBtn.classList.add('active');
    } else {
      nav.style.display = 'none';
    }

    // Scroll al tope
    window.scrollTo(0, 0);
  },

  /* Renderiza el topbar según el estado */
  renderTopbar() {
    const right = document.getElementById('topbar-right');
    if (!App.state.usuario) { right.innerHTML = ''; return; }

    const u = App.state.usuario;
    const initials = `${u.nombre?.charAt(0) || ''}${u.apellido?.charAt(0) || ''}`.toUpperCase();

    if (App.state.esAdmin) {
      right.innerHTML = `
        <button class="topbar-admin-btn" onclick="App.navigate('home')">
          <i class="ti ti-arrow-left"></i> Ver como cliente
        </button>
        <div class="topbar-avatar">OP</div>`;
    } else {
      right.innerHTML = `
        <button class="topbar-admin-btn" onclick="App.navigate('admin')" id="btn-admin" style="display:none">
          <i class="ti ti-settings"></i> Admin
        </button>
        <div class="topbar-avatar">${initials}</div>`;
    }
  },

  /* Formatea precio CLP */
  formatPrecio(num) {
    return '$' + num.toLocaleString('es-CL');
  },

  /* Formatea fecha en español */
  formatFecha(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  },

  /* Muestra un mensaje de alerta */
  showAlert(elementId, mensaje, tipo = 'error') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = `alert alert-${tipo}`;
    el.textContent = mensaje;
    el.style.display = 'flex';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  },

  /* Muestra toast de notificación */
  showToast(mensaje, sub = '') {
    const toast = document.getElementById('toast-retiro');
    if (!toast) return;
    if (sub) document.getElementById('toast-retiro-txt').textContent = sub;
    toast.style.display = 'flex';
  },

};

/* ── Dashboard ───────────────────────────── */
const Dashboard = {
  async cargar() {
    if (!App.state.usuario) return;
    const u = App.state.usuario;
    const plan = CONFIG.PLANES[u.plan] || CONFIG.PLANES.basico;

    // Datos básicos
    document.getElementById('dash-nombre').textContent = u.nombre || '—';
    document.getElementById('dash-plan').textContent = plan.nombre;
    document.getElementById('dash-retiros-rest').textContent = plan.retiros;
    document.getElementById('dash-retiros-rest2').textContent = u.retiros_restantes ?? plan.retiros;
    document.getElementById('dash-kg').textContent = u.total_kg || 0;

    const badge = document.getElementById('dash-badge');
    badge.textContent = plan.nombre;
    badge.className = `badge ${plan.badge}`;

    // Retiro pendiente
    const retiros = await DB.getRetirosPendientes(u.id);
    if (retiros.length > 0) {
      const r = retiros[0];
      App.state.retiroPendiente = r;
      document.getElementById('ret-fecha').textContent = App.formatFecha(r.fecha_programada);
      document.getElementById('ret-horario').textContent = `${r.hora_inicio || '08:00'} – ${r.hora_fin || '10:00'} hrs · ${r.camion || 'Camión asignado'}`;
      document.getElementById('ret-materiales').textContent = r.materiales_autorizados?.join(', ') || plan.materiales.join(', ');
      document.getElementById('card-retiro-pendiente').style.display = 'block';
      App.showToast('Nuevo retiro programado', App.formatFecha(r.fecha_programada));
    }

    // Historial
    await Dashboard.cargarHistorial();
  },

  async cargarHistorial() {
    const retiros = await DB.getHistorialRetiros(App.state.usuario.id);
    const lista = document.getElementById('historial-lista');
    if (!retiros.length) {
      lista.innerHTML = '<div class="empty-state">Aún no tienes retiros realizados.</div>';
      return;
    }
    lista.innerHTML = retiros.map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--border)">
        <div class="retiro-icon" style="width:36px;height:36px;font-size:16px">
          <i class="ti ti-circle-check"></i>
        </div>
        <div style="flex:1">
          <div style="font-weight:500;font-size:13px">${App.formatFecha(r.fecha_programada)}</div>
          <div style="font-size:11px;color:#666">${(r.materiales || []).join(' · ')} ${r.kg_total ? `· ${r.kg_total} kg` : ''}</div>
        </div>
        <span class="badge ${r.estado === 'completado' ? 'badge-green' : 'badge-gray'}">
          ${r.estado === 'completado' ? 'Completado' : r.estado}
        </span>
      </div>`).join('');
  }
};
document.addEventListener('DOMContentLoaded', () => App.init());
