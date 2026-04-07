-- Add icon_svg_url column to treatments table to support custom SVG uploads
ALTER TABLE treatments ADD COLUMN icon_svg_url TEXT;

COMMENT ON COLUMN treatments.icon_svg_url IS 'URL to uploaded SVG icon file, used as alternative to icon picker';
