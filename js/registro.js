/* ============================================
   CONARE HOGAR — Flujo de registro (4 pasos)
   ============================================ */

const Registro = {

  planSeleccionado: 'estandar',

  /* Navega entre los 4 pasos del registro */
  goStep(n) {
    // Valida el paso actual antes de avanzar
    if (n > 1 && !Registro._validarPaso(n - 1)) return;

    // Muestra/oculta contenido de cada paso
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`reg-step-${i}`);
      if (el) el.style.display = i === n ? 'block' : 'none';

      // Actualiza indicador visual
      const dot = document.getElementById(`step-dot-${i}`);
      if (dot) {
        dot.className = 'step-item' + (i < n ? ' done' : i === n ? ' active' : '');
        const num = dot.querySelector('.step-num');
        if (num) num.innerHTML = i < n ? '<i class="ti ti-check"></i>' : i;
      }
    }

    // Si llega al paso 4, actualiza el resumen del plan
    if (n === 4) Registro._actualizarResumen();

    window.scrollTo(0, 0);
  },

  /* Selecciona un plan */
  seleccionarPlan(key) {
    Registro.planSeleccionado = key;
    document.querySelectorAll('.plan-card').forEach(c => {
      c.classList.remove('selected');
      c.style.border = '0.5px solid var(--border)';
    });
    const el = document.getElementById(`plan-${key}`);
    if (el) { el.classList.add('selected'); el.style.border = '2px solid var(--verde)'; }

    // Actualiza botón
    const btn = document.querySelector('#reg-step-2 .btn-primary');
    if (btn) {
      const plan = CONFIG.PLANES[key];
      btn.innerHTML = `Continuar con ${plan.nombre} <i class="ti ti-arrow-right"></i>`;
    }
  },

  /* Actualiza resumen en paso 4 */
  _actualizarResumen() {
    const plan = CONFIG.PLANES[Registro.planSeleccionado];
    if (!plan) return;
    document.getElementById('res-plan-nombre').textContent = plan.nombre;
    document.getElementById('res-plan-precio').textContent = App.formatPrecio(plan.precio);
    document.getElementById('res-plan-retiros').textContent = `${plan.retiros} por mes`;
    const proxCobro = new Date();
    proxCobro.setMonth(proxCobro.getMonth() + 1);
    document.getElementById('res-proximo-cobro').textContent =
      proxCobro.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  /* Validación por paso */
  _validarPaso(paso) {
    if (paso === 1) {
      const nombre   = document.getElementById('reg-nombre')?.value?.trim();
      const apellido = document.getElementById('reg-apellido')?.value?.trim();
      const email    = document.getElementById('reg-email')?.value?.trim();
      const telefono = document.getElementById('reg-telefono')?.value?.trim();
      const password = document.getElementById('reg-password')?.value;

      if (!nombre || !apellido) {
        App.showAlert('reg-error-1', 'Ingresa tu nombre y apellido.');
        return false;
      }
      if (!email || !email.includes('@')) {
        App.showAlert('reg-error-1', 'Ingresa un correo electrónico válido.');
        return false;
      }
      if (!telefono) {
        App.showAlert('reg-error-1', 'Ingresa tu número de teléfono.');
        return false;
      }
      if (!password || password.length < 8) {
        App.showAlert('reg-error-1', 'La contraseña debe tener al menos 8 caracteres.');
        return false;
      }
    }

    if (paso === 3) {
      const calle  = document.getElementById('reg-calle')?.value?.trim();
      const ciudad = document.getElementById('reg-ciudad')?.value?.trim();
      if (!calle || !ciudad) {
        App.showAlert('reg-error-3', 'Ingresa tu calle/número y ciudad.');
        return false;
      }
    }

    return true;
  },

  /* Guarda los datos para usarlos en el pago */
  getDatos() {
    return {
      nombre:     document.getElementById('reg-nombre')?.value?.trim(),
      apellido:   document.getElementById('reg-apellido')?.value?.trim(),
      email:      document.getElementById('reg-email')?.value?.trim(),
      telefono:   document.getElementById('reg-telefono')?.value?.trim(),
      password:   document.getElementById('reg-password')?.value,
      direccion:  document.getElementById('reg-calle')?.value?.trim(),
      depto:      document.getElementById('reg-depto')?.value?.trim(),
      ciudad:     document.getElementById('reg-ciudad')?.value?.trim(),
      region:     document.getElementById('reg-region')?.value,
      referencia: document.getElementById('reg-referencia')?.value?.trim(),
      plan:       Registro.planSeleccionado,
    };
  },
};

/* Ubicación en mapa */
const Ubicacion = {
  lat: null,
  lng: null,

  fijar() {
    // Intenta obtener ubicación real del dispositivo
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          Ubicacion.lat = pos.coords.latitude;
          Ubicacion.lng = pos.coords.longitude;
          Ubicacion._marcarFijada(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => Ubicacion._marcarFijada('Ubicación confirmada manualmente')
      );
    } else {
      Ubicacion._marcarFijada('Ubicación confirmada manualmente');
    }
  },

  _marcarFijada(texto) {
    const el = document.getElementById('map-ubicacion');
    const label = document.getElementById('map-label');
    if (el) el.classList.add('pinned');
    if (label) label.textContent = `✓ ${texto}`;
  }
};
