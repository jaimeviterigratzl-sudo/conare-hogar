/* ============================================
   CONARE HOGAR — API: Enviar ticket por correo
   Vercel Serverless Function (Node.js)
   Archivo: /api/enviar-ticket.js
   ============================================ */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { email, nombre, fecha, materiales, puntos } = req.body;
  if (!email) return res.status(400).json({ error: 'Falta el correo del cliente' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'CONARE HOGAR <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY no está configurada en Vercel' });
  }

  const filas = (materiales || [])
    .map(m => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${m.nombre}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${m.kg} kg</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
      <h2 style="color:#1D9E75;margin-bottom:4px">CONARE HOGAR</h2>
      <p>Hola ${nombre || ''},</p>
      <p>Aquí tu comprobante de retiro del <strong>${fecha}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0">${filas}</table>
      <p style="margin-top:16px">CONAREPESOS acreditados:
        <strong style="color:#1D9E75;font-size:20px">${puntos}</strong>
      </p>
      <p>¡Gracias por reciclar con nosotros! ♻️</p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Tu ticket de retiro CONARE HOGAR — ${fecha}`,
        html,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data.message || 'Error al enviar el correo' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
