/* ============================================
   CONARE HOGAR — API: Keep-alive de Supabase
   Se ejecuta automáticamente vía Vercel Cron
   para evitar que el proyecto se pause por
   inactividad (Supabase pausa a los 7 días).
   Archivo: /api/keep-alive.js
   ============================================ */
export default async function handler(req, res) {
  const SUPABASE_URL = 'https://sffddcnaniefrhzoxmom.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmRkY25hbmllZnJoem94bW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTc3NjAsImV4cCI6MjA5MzY3Mzc2MH0.CYoFADPOI6TCstaidqPiQsEKVNnKnX3Tc8anCSiq9RY';

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/conarepesos_config_general?select=id&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    return res.status(200).json({ ok: r.ok, checked_at: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
