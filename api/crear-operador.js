/* ============================================
   CONARE HOGAR — API: Crear operador (chofer/peoneta)
   Vercel Serverless Function (Node.js)
   Archivo: /api/crear-operador.js
   ============================================ */
const SUPABASE_URL = 'https://sffddcnaniefrhzoxmom.supabase.co';
const ADMIN_EMAIL = 'jaime.viteri.gratzl@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY no está configurada en Vercel' });

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
  });
  const userData = await userRes.json();
  if (!userRes.ok || userData.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Solo el administrador puede crear operadores' });
  }

  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    return res.status(500).json({ error: createData.msg || createData.error_description || 'Error al crear el usuario' });
  }

  const perfilRes = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      id: createData.id,
      nombre,
      apellido,
      email,
      es_operador: true,
      plan: 'basico',
      retiros_restantes: 0,
      total_kg: 0,
      suscripcion_activa: false,
      created_at: new Date().toISOString(),
    }),
  });
  const perfilData = await perfilRes.json();
  if (!perfilRes.ok) {
    return res.status(500).json({ error: 'El usuario se creó pero falló su perfil: ' + JSON.stringify(perfilData) });
  }

  return res.status(200).json({ ok: true });
}
