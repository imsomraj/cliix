-- Seed base themes matching PRD/TRD naming conventions.
-- Assumes a themes table shape: (id text primary key, name text, config_json jsonb, is_base boolean).

INSERT INTO themes (id, name, config_json, is_base)
VALUES
  (
    'prd-light',
    'PRD Light',
    jsonb_build_object(
      'id', 'prd-light',
      'name', 'PRD Light',
      'background', jsonb_build_object('page', '#f8fafc', 'surface', '#ffffff', 'elevated', '#f1f5f9', 'inverse', '#0f172a'),
      'typography', jsonb_build_object('fontFamily', 'Inter, system-ui, sans-serif', 'headingWeight', 700, 'bodyWeight', 400, 'textColor', '#0f172a', 'mutedTextColor', '#475569', 'lineHeight', 1.5),
      'buttons', jsonb_build_object('radius', 10, 'paddingY', 10, 'paddingX', 16, 'primaryBg', '#2563eb', 'primaryText', '#ffffff', 'secondaryBg', '#dbeafe', 'secondaryText', '#1e3a8a'),
      'accents', jsonb_build_object('brand', '#2563eb', 'success', '#16a34a', 'warning', '#d97706', 'danger', '#dc2626', 'info', '#0ea5e9'),
      'spacing', jsonb_build_object('xs', 4, 'sm', 8, 'md', 16, 'lg', 24, 'xl', 32),
      'bordersShadowsCards', jsonb_build_object('borderColor', '#cbd5e1', 'borderWidth', 1, 'cardRadius', 14, 'cardShadow', '0 4px 14px rgba(15, 23, 42, 0.08)', 'focusRing', '0 0 0 3px rgba(37, 99, 235, 0.35)')
    ),
    true
  ),
  (
    'trd-dark',
    'TRD Dark',
    jsonb_build_object(
      'id', 'trd-dark',
      'name', 'TRD Dark',
      'background', jsonb_build_object('page', '#020617', 'surface', '#0f172a', 'elevated', '#1e293b', 'inverse', '#f8fafc'),
      'typography', jsonb_build_object('fontFamily', 'Inter, system-ui, sans-serif', 'headingWeight', 700, 'bodyWeight', 400, 'textColor', '#e2e8f0', 'mutedTextColor', '#94a3b8', 'lineHeight', 1.5),
      'buttons', jsonb_build_object('radius', 10, 'paddingY', 10, 'paddingX', 16, 'primaryBg', '#38bdf8', 'primaryText', '#082f49', 'secondaryBg', '#334155', 'secondaryText', '#f8fafc'),
      'accents', jsonb_build_object('brand', '#38bdf8', 'success', '#4ade80', 'warning', '#fbbf24', 'danger', '#f87171', 'info', '#22d3ee'),
      'spacing', jsonb_build_object('xs', 4, 'sm', 8, 'md', 16, 'lg', 24, 'xl', 32),
      'bordersShadowsCards', jsonb_build_object('borderColor', '#334155', 'borderWidth', 1, 'cardRadius', 14, 'cardShadow', '0 8px 24px rgba(2, 6, 23, 0.65)', 'focusRing', '0 0 0 3px rgba(56, 189, 248, 0.4)')
    ),
    true
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  config_json = EXCLUDED.config_json,
  is_base = EXCLUDED.is_base;
