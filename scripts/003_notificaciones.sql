-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS sigte_notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'REUNION', 'VISITA', etc
  titulo TEXT NOT NULL,
  mensaje TEXT,
  reunion_id UUID REFERENCES sigte_reuniones(id) ON DELETE CASCADE,
  alcance TEXT NOT NULL, -- 'ALL' o 'USERS'
  creado_por UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de destinatarios específicos (cuando alcance = 'USERS')
CREATE TABLE IF NOT EXISTS sigte_notificacion_destinatarios (
  notificacion_id UUID REFERENCES sigte_notificaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  PRIMARY KEY (notificacion_id, usuario_id)
);

-- Crear tabla de lecturas de notificaciones
CREATE TABLE IF NOT EXISTS sigte_notificacion_lecturas (
  notificacion_id UUID REFERENCES sigte_notificaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  leido_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (notificacion_id, usuario_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON sigte_notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_creado_por ON sigte_notificaciones(creado_por);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON sigte_notificaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacion_destinatarios_usuario ON sigte_notificacion_destinatarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_lecturas_usuario ON sigte_notificacion_lecturas(usuario_id);

-- Comentarios para documentación
COMMENT ON TABLE sigte_notificaciones IS 'Notificaciones del sistema SIGTE';
COMMENT ON COLUMN sigte_notificaciones.alcance IS 'ALL: todos los usuarios excepto ADMIN, USERS: usuarios específicos en destinatarios';
COMMENT ON TABLE sigte_notificacion_destinatarios IS 'Usuarios específicos que deben recibir la notificación cuando alcance=USERS';
COMMENT ON TABLE sigte_notificacion_lecturas IS 'Registro de lecturas de notificaciones por usuario';
