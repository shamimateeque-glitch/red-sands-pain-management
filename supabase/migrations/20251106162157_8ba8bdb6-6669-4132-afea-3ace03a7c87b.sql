-- Add background color field for treatment icons
ALTER TABLE treatments 
ADD COLUMN icon_background VARCHAR(50) DEFAULT 'white';

-- Add comment explaining the field
COMMENT ON COLUMN treatments.icon_background IS 'Background color for treatment icon display: white, transparent, or custom hex color';
