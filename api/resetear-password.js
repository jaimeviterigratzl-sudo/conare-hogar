/* ============================================
   CONARE HOGAR — API: Restablecer contraseña
   Vercel Serverless Function (Node.js)
   Archivo: /api/resetear-password.js
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
    return res.status(403).json({ error: 'Solo el administrador puede restablecer contraseñas' });
  }

  const { userId, password } = req.body;
  if (!userId || !password) return res.status(400).json({ error: 'Faltan campos requeridos' });
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    return res.status(500).json({ error: updateData.msg || 'Error al restablecer la contraseña' });
  }

  return res.status(200).json({ ok: true });
}
