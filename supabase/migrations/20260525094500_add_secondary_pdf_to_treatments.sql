-- Allow a treatment to have a second downloadable PDF (e.g. PRP has both
-- a patient information leaflet and an infographic). Both buttons are
-- rendered when their URL is set; the matching label fields let admins
-- override the default "Download PDF" label per button.

ALTER TABLE treatments ADD COLUMN IF NOT EXISTS pdf_url_2 TEXT;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS pdf_label TEXT;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS pdf_label_2 TEXT;

COMMENT ON COLUMN treatments.pdf_url_2 IS 'Optional second PDF URL for treatments that have more than one downloadable document.';
COMMENT ON COLUMN treatments.pdf_label IS 'Optional custom label for the primary PDF download button. Defaults to "Download PDF".';
COMMENT ON COLUMN treatments.pdf_label_2 IS 'Optional custom label for the secondary PDF download button.';
