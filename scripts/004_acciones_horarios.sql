-- ============================================
-- SIGTE: Tablas para Acciones y Horarios
-- ============================================

-- Tabla de acciones (técnicas y pedagógicas asociadas a visitas)
CREATE TABLE IF NOT EXISTS sigte_acciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID NOT NULL REFERENCES sigte_visitas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('TECNICA', 'PEDAGOGICA')),
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para acciones
CREATE INDEX IF NOT EXISTS idx_sigte_acciones_visita ON sigte_acciones(visita_id);
CREATE INDEX IF NOT EXISTS idx_sigte_acciones_usuario ON sigte_acciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sigte_acciones_tipo ON sigte_acciones(tipo);
CREATE INDEX IF NOT EXISTS idx_sigte_acciones_fecha ON sigte_acciones(fecha);

-- Tabla de horarios de FEDs en DTE
CREATE TABLE IF NOT EXISTS sigte_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 5), -- 1=Lunes, 5=Viernes
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, dia_semana)
);

-- Índice para horarios
CREATE INDEX IF NOT EXISTS idx_sigte_horarios_usuario ON sigte_horarios(usuario_id);

-- Vista para contar acciones por usuario y mes
CREATE OR REPLACE VIEW vw_sigte_acciones_resumen AS
SELECT 
  a.usuario_id,
  u.nombre,
  u.distrito,
  u.rol,
  DATE_TRUNC('month', a.fecha) as mes,
  COUNT(*) FILTER (WHERE a.tipo = 'TECNICA') as acciones_tecnicas,
  COUNT(*) FILTER (WHERE a.tipo = 'PEDAGOGICA') as acciones_pedagogicas,
  COUNT(*) as total_acciones
FROM sigte_acciones a
JOIN usuarios u ON u.id = a.usuario_id
GROUP BY a.usuario_id, u.nombre, u.distrito, u.rol, DATE_TRUNC('month', a.fecha);

-- Vista para perfil de FED con métricas
CREATE OR REPLACE VIEW vw_sigte_fed_perfil AS
SELECT 
  u.id as usuario_id,
  u.nombre,
  u.email,
  u.distrito,
  u.rol,
  u.genero,
  COALESCE(v.visitas_realizadas, 0) as visitas_realizadas,
  COALESCE(a.acciones_tecnicas, 0) as acciones_tecnicas,
  COALESCE(a.acciones_pedagogicas, 0) as acciones_pedagogicas,
  COALESCE(a.total_acciones, 0) as total_acciones
FROM usuarios u
LEFT JOIN (
  SELECT 
    vp.usuario_id,
    COUNT(DISTINCT v.id) as visitas_realizadas
  FROM sigte_visita_participantes vp
  JOIN sigte_visitas v ON v.id = vp.visita_id
  WHERE v.estado = 'CERRADA_CON_ACTA'
  GROUP BY vp.usuario_id
) v ON v.usuario_id = u.id
LEFT JOIN (
  SELECT 
    usuario_id,
    COUNT(*) FILTER (WHERE tipo = 'TECNICA') as acciones_tecnicas,
    COUNT(*) FILTER (WHERE tipo = 'PEDAGOGICA') as acciones_pedagogicas,
    COUNT(*) as total_acciones
  FROM sigte_acciones
  GROUP BY usuario_id
) a ON a.usuario_id = u.id
WHERE u.rol IN ('FED', 'CED');
