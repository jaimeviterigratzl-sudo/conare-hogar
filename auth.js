/* ============================================
   CONARE HOGAR — Autenticación
   Login, logout, recuperación de contraseña
   ============================================ */

const Auth = {

  async login() {
    const email    = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value;
    const btn      = document.getElementById('login-btn');

    if (!email || !password) {
      App.showAlert('login-error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Entrando...';

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-login"></i> Entrar';
      const msg = error.message.includes('Invalid') ? 'Correo o contraseña incorrectos.' : error.message;
      App.showAlert('login-error', msg);
      return;
    }

    // La navegación ocurre automáticamente via onAuthStateChange en App.init()
  },

  async logout() {
    await supabase.auth.signOut();
    App.state.usuario = null;
    App.state.planActual = null;
    App.navigate('welcome');
    document.getElementById('topbar-right').innerHTML = '';
  },

  async recuperar() {
    const email = prompt('Ingresa tu correo electrónico:');
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${CONFIG.APP_URL}/reset-password.html`,
    });
    if (error) alert('Error: ' + error.message);
    else alert('Te enviamos un correo para restablecer tu contraseña.');
  },

};
