/* ============================================
   CONARE HOGAR — Cliente Supabase
   Maneja base de datos, autenticación y storage
   ============================================ */

/* Carga la librería de Supabase desde CDN */
let supabase;
document.addEventListener('DOMContentLoaded', () => {
  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  App.init();
});

/* ── Usuarios ────────────────────────────── */
const DB = {

  async getUsuario(userId) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) console.error('getUsuario:', error);
    return data;
  },

  async crearUsuario(userId, datos) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ id: userId, ...datos }]);
    if (error) console.error('crearUsuario:', error);
    return data;
  },

  async actualizarUsuario(userId, datos) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(datos)
      .eq('id', userId);
    if (error) console.error('actualizarUsuario:', error);
    return data;
  },

  /* ── Retiros ─────────────────────────────── */
  async getRetirosPendientes(userId) {
    const { data, error } = await supabase
      .from('retiros')
      .select('*')
      .eq('usuario_id', userId)
      .eq('estado', 'pendiente')
      .order('fecha_programada', { ascending: true })
      .limit(1);
    if (error) console.error('getRetirosPendientes:', error);
    return data || [];
  },

  async getHistorialRetiros(userId) {
    const { data, error } = await supabase
      .from('retiros')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha_programada', { ascending: false })
      .limit(10);
    if (error) console.error('getHistorialRetiros:', error);
    return data || [];
  },

  async aprobarRetiro(retiroId) {
    const { data, error } = await supabase
      .from('retiros')
      .update({ estado: 'aprobado', aprobado_at: new Date().toISOString() })
      .eq('id', retiroId);
    if (error) console.error('aprobarRetiro:', error);
    return data;
  },

  async rechazarRetiro(retiroId) {
    const { data, error } = await supabase
      .from('retiros')
      .update({ estado: 'rechazado' })
      .eq('id', retiroId);
    if (error) console.error('rechazarRetiro:', error);
    return data;
  },

  async actualizarMateriales(retiroId, materiales, fotoUrls) {
    const { data, error } = await supabase
      .from('retiros')
      .update({ materiales, foto_urls: fotoUrls, fotos_enviadas_at: new Date().toISOString() })
      .eq('id', retiroId);
    if (error) console.error('actualizarMateriales:', error);
    return data;
  },

  /* ── Admin ───────────────────────────────── */
  async getTodosLosClientes() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, retiros(count)')
      .order('created_at', { ascending: false });
    if (error) console.error('getTodosLosClientes:', error);
    return data || [];
  },

  async getRutasSemana() {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - inicio.getDay() + 1);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    const { data, error } = await supabase
      .from('retiros')
      .select('*, usuarios(nombre, apellido, direccion, ciudad)')
      .gte('fecha_programada', inicio.toISOString())
      .lte('fecha_programada', fin.toISOString())
      .eq('estado', 'aprobado')
      .order('fecha_programada');
    if (error) console.error('getRutasSemana:', error);
    return data || [];
  },

  async getSolicitudesConFotos() {
    const { data, error } = await supabase
      .from('retiros')
      .select('*, usuarios(nombre, apellido)')
      .eq('estado', 'aprobado')
      .not('foto_urls', 'is', null)
      .order('fotos_enviadas_at', { ascending: false });
    if (error) console.error('getSolicitudesConFotos:', error);
    return data || [];
  },

  /* ── Storage (fotos) ─────────────────────── */
  async subirFoto(file, userId, retiroId) {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${retiroId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('fotos-retiros')
      .upload(path, file, { contentType: file.type });
    if (error) { console.error('subirFoto:', error); return null; }
    const { data: urlData } = supabase.storage.from('fotos-retiros').getPublicUrl(path);
    return urlData.publicUrl;
  },

};
