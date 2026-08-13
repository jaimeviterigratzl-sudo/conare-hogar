/* ============================================
   CONARE HOGAR — API: Geocodificar dirección
   Convierte una dirección de texto en lat/lng
   usando OpenStreetMap Nominatim (gratis)
   Archivo: /api/geocodificar.js
   ============================================ */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { direccion } = req.body;
  if (!direccion) return res.status(400).json({ error: 'Falta la dirección' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion)}&format=json&limit=1&countrycodes=cl`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'ConareHogar/1.0 (contacto: jaime.viteri.gratzl@gmail.com)' },
    });
    const data = await r.json();
    if (!data || !data.length) {
      return res.status(404).json({ error: 'Dirección no encontrada. Intenta ser más específico (agrega la comuna).' });
    }
    return res.status(200).json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
