/* ============================================
   CONARE HOGAR — Configuración
   ⚠️  RELLENA ESTOS VALORES CON TUS CREDENCIALES
   ============================================ */

const CONFIG = {

  /* ── SUPABASE ──────────────────────────────
     Obtén estos valores en:
     supabase.com → tu proyecto → Settings → API
  ─────────────────────────────────────────── */
  SUPABASE_URL:  'https://sffddcnaniefrhzoxmom.supabase.co/rest/v1/',
  SUPABASE_KEY:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmRkY25hbmllZnJoem94bW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTc3NjAsImV4cCI6MjA5MzY3Mzc2MH0.CYoFADPOI6TCstaidqPiQsEKVNnKnX3Tc8anCSiq9RY',

  /* ── FLOW ──────────────────────────────────
     Obtén estos valores en:
     flow.cl → Panel → Credenciales API
  ─────────────────────────────────────────── */
  FLOW_API_KEY:    'TU_FLOW_API_KEY',
  FLOW_SECRET_KEY: 'TU_FLOW_SECRET_KEY',
  FLOW_URL_BASE:   'https://www.flow.cl/app/web/pay.php',  // producción
  // FLOW_URL_BASE: 'https://sandbox.flow.cl/app/web/pay.php', // sandbox (pruebas)

  /* ── APP ───────────────────────────────────*/
  APP_NAME:    'CONARE HOGAR',
  APP_URL:     'https://conare-hogar-app.vercel.app',   // cambia por tu URL de Vercel
  MONEDA:      'CLP',
  PAIS:        'CL',

  /* ── PLANES ────────────────────────────────
     Precios en pesos chilenos (CLP)
     Puedes cambiarlos aquí en cualquier momento
  ─────────────────────────────────────────── */
  PLANES: {
    basico: {
      nombre:   'Básico',
      precio:    9900,
      retiros:   1,
      badge:    'badge-gray',
      materiales: ['PET', 'Aluminio'],
    },
    estandar: {
      nombre:   'Estándar',
      precio:    13900,
      retiros:   2,
      badge:    'badge-blue',
      materiales: ['PET', 'Aluminio', 'Vidrio', 'Cartón'],
    },
    premium: {
      nombre:   'Premium',
      precio:    22900,
      retiros:   4,
      badge:    'badge-purple',
      materiales: ['PET', 'Aluminio', 'Vidrio', 'Cartón'],
      prioridad: true,
    }
  },

  /* ── CAMIONES (simulados hasta conectar GPS real) ── */
  CAMIONES: [
    { id: 1, nombre: 'Camión #1', ruta: 'Ruta Sur',   color: '#1D9E75' },
    { id: 2, nombre: 'Camión #2', ruta: 'Ruta Norte', color: '#185FA5' },
    { id: 3, nombre: 'Camión #3', ruta: 'Ruta Este',  color: '#BA7517' },
  ],

  /* ── ADMIN ─────────────────────────────────
     Email del administrador (acceso al panel)
  ─────────────────────────────────────────── */
  ADMIN_EMAIL: 'jaime.viteri.gratzl@gmail.com',

};
