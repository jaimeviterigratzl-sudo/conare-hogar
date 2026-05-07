/* ============================================
   CONARE HOGAR — API: Crear pago con Flow
   Vercel Serverless Function (Node.js)
   Archivo: /api/crear-pago.js
   ============================================ */

const crypto = require('crypto');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { userId, plan, email, nombre, monto } = req.body;
  if (!userId || !plan || !email || !monto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const API_KEY    = process.env.FLOW_API_KEY;
  const SECRET_KEY = process.env.FLOW_SECRET_KEY;
  const FLOW_URL   = process.env.FLOW_URL_BASE || 'https://www.flow.cl/app/web/pay.php';
  const APP_URL    = process.env.APP_URL || 'https://conare-hogar.vercel.app';

  const commerceOrder = `RY-${userId.slice(0, 8)}-${Date.now()}`;

  const params = {
    apiKey:          API_KEY,
    commerceOrder,
    subject:         `CONARE HOGAR — Plan ${plan}`,
    currency:        'CLP',
    amount:          monto,
    email,
    paymentMethod:   9,  // 9 = todos los medios disponibles en Flow
    urlConfirmation: `${APP_URL}/api/confirmar-pago`,
    urlReturn:       `${APP_URL}/?pago=ok&token=`,
  };

  /* Firma HMAC-SHA256 requerida por Flow */
  const sorted = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('');
  params.s = crypto.createHmac('sha256', SECRET_KEY).update(sorted).digest('hex');

  /* Crea la orden en Flow */
  const formBody = new URLSearchParams(params).toString();
  const flowRes = await fetch('https://www.flow.cl/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  });
  const flowData = await flowRes.json();

  if (flowData.url && flowData.token) {
    return res.status(200).json({ url: `${flowData.url}?token=${flowData.token}` });
  } else {
    return res.status(500).json({ error: flowData.message || 'Error en Flow' });
  }
}
