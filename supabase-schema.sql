-- ============================================
-- CONARE HOGAR — Esquema de base de datos
-- Pega esto en Supabase → SQL Editor → Run
-- ============================================

-- TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre               TEXT NOT NULL,
  apellido             TEXT NOT NULL,
  email                TEXT NOT NULL UNIQUE,
  telefono             TEXT,
  direccion            TEXT,
  depto                TEXT,
  ciudad               TEXT,
  region               TEXT,
  referencia           TEXT,
  lat                  DOUBLE PRECISION,
  lng                  DOUBLE PRECISION,
  plan                 TEXT NOT NULL DEFAULT 'basico' CHECK (plan IN ('basico','estandar','premium')),
  retiros_restantes    INTEGER NOT NULL DEFAULT 1,
  total_kg             NUMERIC(8,2) NOT NULL DEFAULT 0,
  suscripcion_activa   BOOLEAN NOT NULL DEFAULT false,
  suscripcion_desde    TIMESTAMPTZ,
  proximo_cobro        TIMESTAMPTZ,
  cancelacion_solicitada BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLA: retiros
CREATE TABLE IF NOT EXISTS retiros (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id           UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_programada     TIMESTAMPTZ NOT NULL,
  hora_inicio          TEXT DEFAULT '08:00',
  hora_fin             TEXT DEFAULT '10:00',
  camion               TEXT,
  camion_asignado      TEXT,
  materiales_autorizados TEXT[],
  materiales           TEXT[],
  foto_urls            TEXT[],
  kg_total             NUMERIC(6,2),
  estado               TEXT NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente','aprobado','rechazado','en_ruta','completado','cancelado')),
  aprobado_at          TIMESTAMPTZ,
  fotos_enviadas_at    TIMESTAMPTZ,
  completado_at        TIMESTAMPTZ,
  notas                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLA: pagos (registro de cobros Flow)
CREATE TABLE IF NOT EXISTS pagos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id           UUID NOT NULL REFERENCES usuarios(id),
  flow_order           TEXT UNIQUE,
  flow_token           TEXT,
  monto                INTEGER NOT NULL,
  plan                 TEXT NOT NULL,
  estado               TEXT NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente','pagado','rechazado','reembolsado')),
  pagado_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ÍNDICES para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_retiros_usuario   ON retiros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_retiros_estado    ON retiros(estado);
CREATE INDEX IF NOT EXISTS idx_retiros_fecha     ON retiros(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario     ON pagos(usuario_id);

-- ROW LEVEL SECURITY (cada usuario solo ve sus datos)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE retiros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos    ENABLE ROW LEVEL SECURITY;

-- Políticas usuarios
CREATE POLICY "usuarios: ver propio" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios: editar propio" ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios: insertar propio" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas retiros
CREATE POLICY "retiros: ver propios" ON retiros FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "retiros: editar propios" ON retiros FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "retiros: insertar propios" ON retiros FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas pagos
CREATE POLICY "pagos: ver propios" ON pagos FOR SELECT USING (auth.uid() = usuario_id);

-- STORAGE: bucket para fotos de retiros
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-retiros', 'fotos-retiros', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "fotos: subir propias" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fotos-retiros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "fotos: ver todas" ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos-retiros');
