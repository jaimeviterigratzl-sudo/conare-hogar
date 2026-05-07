/* CONARE HOGAR — Módulo Fotos */
const Fotos = {
  materiales: [],
  fotoFiles: [],

  toggleMaterial(btn) {
    const mat = btn.dataset.material;
    btn.classList.toggle('active');
    if (Fotos.materiales.includes(mat)) {
      Fotos.materiales = Fotos.materiales.filter(m => m !== mat);
    } else {
      Fotos.materiales.push(mat);
    }
  },

  agregar(input) {
    const grid = document.getElementById('photo-grid');
    Array.from(input.files).forEach(file => {
      Fotos.fotoFiles.push(file);
      const reader = new FileReader();
      reader.onload = e => {
        const idx = Fotos.fotoFiles.length - 1;
        const div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = `<img src="${e.target.result}" alt="Material"><button class="photo-del" onclick="Fotos.eliminar(${idx}, this.parentNode)"><i class="ti ti-x"></i></button>`;
        grid.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  },

  eliminar(idx, el) {
    Fotos.fotoFiles[idx] = null;
    el.remove();
  },

  async enviar() {
    const r = App.state.retiroPendiente;
    if (!r) return;
    if (!Fotos.materiales.length) { alert('Selecciona al menos un material.'); return; }
    const btn = document.querySelector('#card-fotos .btn-primary');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Subiendo...';
    const urls = [];
    for (const file of Fotos.fotoFiles.filter(Boolean)) {
      const url = await DB.subirFoto(file, App.state.usuario.id, r.id);
      if (url) urls.push(url);
    }
    await DB.actualizarMateriales(r.id, Fotos.materiales, urls);
    document.getElementById('card-fotos').innerHTML = `<div style="text-align:center;padding:24px"><i class="ti ti-circle-check" style="font-size:44px;color:#1D9E75;display:block;margin:0 auto 12px"></i><div style="font-weight:500;font-size:17px;margin-bottom:6px">¡Todo listo!</div><div style="font-size:13px;color:#666">El camión llegará el <strong>${App.formatFecha(r.fecha_programada)}</strong><br>Recibirás una notificación 30 minutos antes.</div></div>`;
  },
};
