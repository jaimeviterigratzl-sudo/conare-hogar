/* ============================================
   CONARE HOGAR — Integración de pagos con Flow
   flow.cl — pasarela de pagos chilena
   ============================================ */

const Pago = {

  async iniciar() {
    const datos = Registro.getDatos();
    const btn = document.getElementById('btn-pagar');
    const plan = CONFIG.PLANES[datos.plan];

    if (!plan) {
      App.showAlert('reg-error-4', 'Error al obtener el plan seleccionado.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Creando cuenta...';

    try {
      /* ── Paso 1: Crear usuario en Supabase Auth ── */
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: datos.email,
        password: datos.password,
      });

      if (authError) throw new Error(authError.message);
      const userId = authData.user.id;

      /* ── Paso 2: Guardar perfil en tabla usuarios ── */
      await DB.crearUsuario(userId, {
        nombre:           datos.nombre,
        apellido:         datos.apellido,
        email:            datos.email,
        telefono:         datos.telefono,
        direccion:        datos.direccion,
        depto:            datos.depto,
        ciudad:           datos.ciudad,
        region:           datos.region,
        referencia:       datos.referencia,
        lat:              Ubicacion.lat,
        lng:              Ubicacion.lng,
        plan:             datos.plan,
        retiros_restantes: plan.retiros,
        total_kg:         0,
        suscripcion_activa: false, // se activa tras pago exitoso
        created_at:       new Date().toISOString(),
      });

      /* ── Paso 3: Redirigir a Flow para el pago ── */
      btn.innerHTML = '<div class="spinner"></div> Redirigiendo a Flow...';

      // En producción real, esto se hace desde un backend (Vercel Function)
      // para no exponer tu Flow Secret Key en el frontend.
      // El backend recibe la orden y devuelve la URL de pago de Flow.
      const respuesta = await fetch('/api/crear-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          plan: datos.plan,
          email: datos.email,
          nombre: `${datos.nombre} ${datos.apellido}`,
          monto: plan.precio,
        }),
      });

      const resultado = await respuesta.json();

      if (resultado.url) {
        // Redirige al portal de pago de Flow
        window.location.href = resultado.url;
      } else {
        throw new Error(resultado.error || 'Error al crear orden de pago');
      }

    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-shield-check"></i> Pagar con Flow y activar cuenta';
      App.showAlert('reg-error-4', `Error: ${err.message}`);
    }
  },

  /* Se llama cuando Flow redirige de vuelta tras pago exitoso */
  async confirmarPago() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Confirma el pago con el backend
    const res = await fetch('/api/confirmar-pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId: session.user.id }),
    });
    const resultado = await res.json();

    if (resultado.ok) {
      await DB.actualizarUsuario(session.user.id, { suscripcion_activa: true });
      App.navigate('home');
      await Dashboard.cargar();
    }
  },

};
