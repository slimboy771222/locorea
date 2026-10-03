-- Published runtime content for the lost wallet / cards guide.
-- This migration is deliberately self-contained for existing staging databases.

insert into public.problem_guides (id, slug, category, guide_type, title, summary, status, published_at, last_reviewed_at)
values (
  'd0b3f7f1-6c08-4b55-8e10-000000000001',
  'lost-wallet-cards',
  'lost-something',
  'problem',
  'Lost your wallet or cards in Korea?',
  'Retrace where you last had it, contact the most likely place first, and use Korea''s lost-and-found system if it doesn''t turn up.',
  'published', now(), now()
)
on conflict (slug) do update set
  category = excluded.category,
  guide_type = excluded.guide_type,
  title = excluded.title,
  summary = excluded.summary,
  status = excluded.status,
  published_at = excluded.published_at,
  last_reviewed_at = excluded.last_reviewed_at;

delete from public.problem_guide_actions a using public.problem_guides g where a.guide_id = g.id and g.slug = 'lost-wallet-cards';
delete from public.problem_guide_phrases p using public.problem_guides g where p.guide_id = g.id and g.slug = 'lost-wallet-cards';
delete from public.problem_guide_resources r using public.problem_guides g where r.guide_id = g.id and g.slug = 'lost-wallet-cards';
delete from public.problem_guide_sections s using public.problem_guides g where s.guide_id = g.id and g.slug = 'lost-wallet-cards';

insert into public.problem_guide_sections (id, guide_id, section_type, title, body_markdown, interaction_data, sort_order)
select seed.id, g.id, seed.section_type, seed.title, seed.body_markdown, seed.interaction_data, seed.sort_order
from public.problem_guides g
cross join (
  values
    ('d0b3f7f1-6c08-4b55-8e10-000000000101'::uuid, 'intro', 'Start with the most likely place', $md$Try to remember the last time you used your wallet or cards. Contact the place, station, vehicle, or accommodation first if you can identify it.$md$, null::jsonb, 10),
    ('d0b3f7f1-6c08-4b55-8e10-000000000102'::uuid, 'choice', null, '', $json${"prompt":"Where do you think you lost it?","options":[{"key":"subway","label":"Subway / Train","title":"Start with station staff","body_markdown":"Tell station staff as soon as possible. Share the line, train direction, approximate time, where you were sitting or standing, and what the wallet looks like.","action_keys":["related_subway_guide"]},{"key":"taxi","label":"Taxi","title":"Check your trip details first","body_markdown":"Check the taxi app, receipt, or recent trip history and contact the driver or operator with the pickup and drop-off details. If it is not recovered, search the official lost-and-found service."},{"key":"bus","label":"Bus","title":"Contact the bus operator","body_markdown":"Note the route number, direction, stops, and approximate time. Contact the operator if possible, then search the official lost-and-found service.","action_keys":["search_lost_found"]},{"key":"shop","label":"Café / Restaurant / Shop","title":"Contact the venue first","body_markdown":"Call or return to the venue with the time you visited, where you sat or stood, and a description of the wallet or cards."},{"key":"hotel","label":"Hotel / Accommodation","title":"Ask the front desk","body_markdown":"Ask the front desk to check your room, housekeeping, and shared areas. Explain when you last had the wallet and what it looks like."},{"key":"airport","label":"Airport","title":"Check the right airport contact","body_markdown":"Note the terminal, security, immigration, gate, or aircraft details. Airport lost-and-found and the airline may handle different areas, so contact the most likely one first."},{"key":"unknown","label":"Somewhere else / Not sure","title":"Retrace your route","body_markdown":"Review recent payments, your route, and any transit or places you visited. Contact the most likely place first, then search the official lost-and-found service.","action_keys":["search_lost_found"]}]}$json$::jsonb, 20),
    ('d0b3f7f1-6c08-4b55-8e10-000000000103'::uuid, 'good_to_know', 'Cards were inside?', $md$If your wallet does not turn up, contact your card issuer and follow its current procedures. If you notice a transaction you do not recognize, contact the issuer immediately.$md$, null::jsonb, 30),
    ('d0b3f7f1-6c08-4b55-8e10-000000000104'::uuid, 'step', 'Search Korea''s official lost & found', $md$Search Police Civil Service 24, Korea''s official lost-and-found service. Recently found items may not appear immediately, so check again later if needed.$md$, null::jsonb, 40),
    ('d0b3f7f1-6c08-4b55-8e10-000000000105'::uuid, 'related_guide', 'Was your passport inside?', $md$Use the dedicated passport guide if your passport was in the wallet.$md$, null::jsonb, 50),
    ('d0b3f7f1-6c08-4b55-8e10-000000000106'::uuid, 'step', 'If you see a payment you didn''t make', $md$Report an unfamiliar transaction to your card issuer immediately. If you think the wallet was stolen, contact the police. Ordinary lost-wallet cases do not all require a police report.$md$, null::jsonb, 60),
    ('d0b3f7f1-6c08-4b55-8e10-000000000107'::uuid, 'what_you_need', 'What you''ll need', $md$Keep a note of useful details: wallet color, material, and brand; cards or IDs inside; approximate cash; time and place last seen; receipts; and trip details. Do not share full card numbers.$md$, null::jsonb, 70),
    ('d0b3f7f1-6c08-4b55-8e10-000000000108'::uuid, 'good_to_know', 'Good to know', $md$A recent loss may not appear in a central system immediately. Check again later after staff or operators have had time to turn it in.$md$, null::jsonb, 80),
    ('d0b3f7f1-6c08-4b55-8e10-000000000109'::uuid, 'fallback', 'Still need help?', $md$The 1330 Travel Helpline can help international visitors with general travel information and communication support.$md$, null::jsonb, 90)
) as seed(id, section_type, title, body_markdown, interaction_data, sort_order)
where g.slug = 'lost-wallet-cards';

insert into public.problem_guide_actions (id, guide_id, section_id, action_key, action_type, label, description, href, variant, sort_order)
select seed.id, g.id, s.id, seed.action_key, seed.action_type, seed.label, seed.description, seed.href, seed.variant, seed.sort_order
from public.problem_guides g
join public.problem_guide_sections s on s.guide_id = g.id
join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000201'::uuid, 20, 'related_subway_guide', 'internal', 'Lost it on the subway?', 'Follow the dedicated subway lost-item guide.', '/help/guides/lost-something-on-the-subway', 'default', 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000202'::uuid, 20, 'search_lost_found', 'external', 'Search police lost & found', 'Search Korea''s official lost-and-found service.', 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201', 'primary', 20),
  ('d0b3f7f1-6c08-4b55-8e10-000000000206'::uuid, 40, 'search_lost_found_section', 'external', 'Search police lost & found', 'Search Korea''s official lost-and-found service.', 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201', 'primary', 25),
  ('d0b3f7f1-6c08-4b55-8e10-000000000203'::uuid, 50, 'related_passport_guide', 'internal', 'Lost passport guide', 'Follow dedicated next steps for a lost passport.', '/help/guides/lost-passport', 'default', 30),
  ('d0b3f7f1-6c08-4b55-8e10-000000000204'::uuid, 60, 'call_police_112', 'phone', 'Call Police 112', 'Use this if you think the wallet was stolen.', 'tel:112', 'danger', 40),
  ('d0b3f7f1-6c08-4b55-8e10-000000000205'::uuid, 90, 'call_1330', 'phone', 'Call 1330 Travel Helpline', 'Multilingual travel support for visitors.', 'tel:1330', 'default', 50)
) as seed(id, section_sort_order, action_key, action_type, label, description, href, variant, sort_order)
on s.sort_order = seed.section_sort_order
where g.slug = 'lost-wallet-cards';

insert into public.problem_guide_phrases (id, guide_id, context, text_en, text_ko, romanization, sort_order)
select seed.id, g.id, seed.context, seed.text_en, seed.text_ko, seed.romanization, seed.sort_order
from public.problem_guides g cross join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000301'::uuid, 'General', 'I lost my wallet.', '지갑을 잃어버렸어요.', 'Jigabeul ireobeoryeosseoyo.', 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000302'::uuid, 'Last location', 'I think I left my wallet here.', '지갑을 여기 두고 간 것 같아요.', 'Jigabeul yeogi dugo gan geot gatayo.', 20),
  ('d0b3f7f1-6c08-4b55-8e10-000000000303'::uuid, 'Lost and found', 'Has a wallet been turned in?', '혹시 분실물로 들어온 지갑이 있나요?', 'Hoksi bunsilmullo deureoon jigabi innayo?', 30),
  ('d0b3f7f1-6c08-4b55-8e10-000000000304'::uuid, 'Taxi', 'I think I left my wallet in the taxi.', '택시에 지갑을 두고 내린 것 같아요.', 'Taeksie jigabeul dugo naerin geot gatayo.', 40),
  ('d0b3f7f1-6c08-4b55-8e10-000000000305'::uuid, 'Police', 'I think my wallet was stolen.', '지갑을 도난당한 것 같아요.', 'Jigabeul donandanghan geot gatayo.', 50)
) as seed(id, context, text_en, text_ko, romanization, sort_order)
where g.slug = 'lost-wallet-cards';

insert into public.problem_guide_resources (id, guide_id, resource_type, platform, title, description, organization, url, language, last_checked_at, is_active, featured, sort_order)
select seed.id, g.id, seed.resource_type, seed.platform, seed.title, seed.description, seed.organization, seed.url, seed.language, now(), true, false, seed.sort_order
from public.problem_guides g cross join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000401'::uuid, 'official', 'website', 'Police Civil Service 24 — Lost & Found', 'Search Korea''s official police lost-and-found service.', 'Korean National Police Agency', 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201', 'ko', 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000402'::uuid, 'official', 'website', '1330 Travel Helpline', 'Multilingual travel information and interpretation assistance for international travelers.', 'Korea Tourism Organization', 'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?vcontsId=140632', 'en', 20)
) as seed(id, resource_type, platform, title, description, organization, url, language, sort_order)
where g.slug = 'lost-wallet-cards';
