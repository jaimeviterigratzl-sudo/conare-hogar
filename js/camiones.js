/* CONARE HOGAR — Módulo Camiones */
const Camiones = {
  timer: null,

  info: {
    1: 'Camión #1 — Ruta Sur · 3 paradas restantes · PET y aluminio',
    2: 'Camión #2 — Ruta Norte · A ~800 m de tu ubicación · ETA: 12 min',
    3: 'Camión #3 — En base · Sale a las 14:30 hrs',
  },

  seleccionar(n) {
    const box = document.getElementById('truck-info-box');
    if (box) box.innerHTML = `<i class="ti ti-truck" style="color:#1D9E75"></i> ${Camiones.info[n] || '—'}`;
  },

  iniciarAnimacion() {
    let t = 0;
    Camiones.timer = setInterval(() => {
      t += 0.025;
      const p1 = document.getElementById('truck-pin-1');
      const p2 = document.getElementById('truck-pin-2');
      if (p1) p1.style.left = (18 + Math.sin(t) * 8) + '%';
      if (p2) p2.style.left = (52 + Math.cos(t * 0.8) * 6) + '%';
    }, 120);
  },

  detenerAnimacion() {
    if (Camiones.timer) clearInterval(Camiones.timer);
  },
};
