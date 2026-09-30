-- Compact visit information for public place detail pages.
-- Keep recurring closure data nullable when it has not been verified.
alter table public.places
  add column regular_closed_days text;

-- Localized, ordered menu highlights (for example: ["Pandoro", "Flat white"]).
alter table public.place_translations
  add column signature_menu jsonb;
