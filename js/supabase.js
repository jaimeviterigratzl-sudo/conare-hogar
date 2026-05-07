/* CONARE HOGAR — Cliente Supabase */
let supabase;

window.addEventListener('load', () => {
  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  App.init();
});

const DB = {

  async getUsuario(userId) {
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single();
    return data;
  },

  async crearUsuario(userId, datos) {
    const { data } = await supabase.from('usuarios').insert([{ id: userId, ...datos }]);
    return data;
  },

  async actualizarUsuario(userId, datos) {
    const { data } = await supabase.from('usuarios').update(datos).eq('id', userId);
    return data;
  },

  async getRetirosPendientes(userId) {
    const { data } = await supabase.from('retiros').select('*').eq('usuario_id', userId).eq('estado', 'pendiente').order('fecha_programada', { ascending: true }).limit(1);
    return data || [];
  },

  async getHistorialRetiros(userId) {
    const { data } = await supabase.from('retiros').select('*').eq('usuario_id', userId).order('fecha_programada', { ascending: false }).limit(10);
    return data || [];
  },

  async aprobarRetiro(retiroId) {
    const { data } = await supabase.from('retiros').update({ estado: 'aprobado', aprobado_at: new Date().toISOString() }).eq('id', retiroId);
    return data;
  },

  async rechazarRetiro(retiroId) {
    const { data } = await supabase.from('retiros').update({ estado: 'rechazado' }).eq('id', retiroId);
    return data;
  },

  async actualizarMateriales(retiroId, materiales, fotoUrls) {
    const { data } = await supabase.from('retiros').update({ materiales, foto_urls: fotoUrls, fotos_enviadas_at: new Date().toISOString() }).eq('id', retiroId);
    return data;
  },

  async getTodosLosClientes() {
    const { data } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async getRutasSemana() {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - inicio.getDay() + 1);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    const { data } = await supabase.from('retiros').select('*, usuarios(nombre, apellido, direccion, ciudad)').gte('fecha_programada', inicio.toISOString()).lte('fecha_programada', fin.toISOString()).eq('estado', 'aprobado').order('fecha_programada');
    return data || [];
  },

  async getSolicitudesConFotos() {
    const { data } = await supabase.from('retiros').select('*, usuarios(nombre, apellido)').eq('estado', 'aprobado').not('foto_urls', 'is', null).order('fotos_enviadas_at', { ascending: false });
    return data || [];
  },

  async subirFoto(file, userId, retiroId) {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${retiroId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('fotos-retiros').upload(path, file, { contentType: file.type });
    if (error) return null;
    const { data: urlData } = supabase.storage.from('fotos-retiros').getPublicUrl(path);
    return urlData.publicUrl;
  },
};
