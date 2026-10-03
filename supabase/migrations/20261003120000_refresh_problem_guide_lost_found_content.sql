-- =========================================================
-- Refresh published Problem Guide lost-and-found content
-- =========================================================

-- Fill only missing pronunciation data for the published guides that need it.
update public.problem_guide_phrases phrase
set romanization = seed.romanization
from public.problem_guides guide
join (
    values
        ('lost-something-on-the-subway', 10, 'Jihacheoreseo mulgeoneul ireobeoryeosseoyo.'),
        ('lost-something-on-the-subway', 20, 'Banggeum i yeolchaeseo naeryeosseoyo.'),
        ('lost-something-on-the-subway', 30, 'Geomeunsaek gabangeul dugo naerin geot gatayo.'),
        ('lost-something-on-the-subway', 40, 'Bunsilmul senteoe yeollakhago sipeoyo.'),
        ('lost-phone', 10, 'Hyudaephoneul ireobeoryeosseoyo.'),
        ('lost-phone', 20, 'Hyudaephoneul yeogi dugo gan geot gatayo.'),
        ('lost-phone', 30, 'Hoksi bunsilmullo deureoon hyudaeponi innayo?'),
        ('lost-phone', 40, 'Hyudaephoneul donandanghan geot gatayo.')
) as seed(slug, sort_order, romanization)
    on seed.slug = guide.slug
where phrase.guide_id = guide.id
and phrase.sort_order = seed.sort_order
and nullif(btrim(phrase.romanization), '') is null;


-- Keep the user-facing service name and URL current while preserving action keys.
update public.problem_guide_actions action
set
    label = 'Search police lost & found',
    description = 'Search Korea''s official police lost-and-found service.',
    href = 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201'
from public.problem_guides guide
where action.guide_id = guide.id
and (guide.slug, action.action_key) in (
    ('lost-passport', 'search_lost112'),
    ('lost-something-on-the-subway', 'search_lost112'),
    ('lost-phone', 'search_lost112_phone')
);


update public.problem_guide_resources resource
set
    title = 'Police Civil Service 24 — Lost & Found',
    description = case guide.slug
        when 'lost-something-on-the-subway' then 'Search for found items in Korea''s official police lost-and-found service.'
        else 'Search Korea''s official police lost-and-found service.'
    end,
    organization = 'Korean National Police Agency',
    url = 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
    language = 'ko'
from public.problem_guides guide
where resource.guide_id = guide.id
and (guide.slug, resource.sort_order) in (
    ('lost-passport', 10),
    ('lost-something-on-the-subway', 10),
    ('lost-phone', 30)
);


update public.problem_guide_sections section
set body_markdown = seed.body_markdown
from public.problem_guides guide
join (
    values
        (
            'lost-passport',
            30,
            $md$Found belongings may be registered with Korea''s official police lost-and-found service on Police Civil Service 24.

Search for your passport before assuming it is permanently lost.

If nothing appears immediately, check again later because found items may take time to move from the place where they were found into the police lost-and-found system.$md$
        ),
        (
            'lost-something-on-the-subway',
            40,
            $md$Check Korea''s official police lost-and-found service on Police Civil Service 24.

Found items from public transportation and other locations can be searched there.

Items may not appear immediately: a transport operator may hold an item before it appears in the police lost-and-found system.

If your item is not listed yet, search again later.$md$
        ),
        (
            'lost-something-on-the-subway',
            70,
            $md$The Seoul metropolitan subway network is operated by multiple organizations.

If you have just lost an item, start with the nearest station staff. Give them train details, then check the police lost-and-found service later if necessary.$md$
        ),
        (
            'lost-something-on-the-subway',
            80,
            $md$If the item does not appear immediately, check the police lost-and-found service again later.

Use Seoul''s official lost-and-found information to identify the appropriate subway operator or contact if necessary. Ask 1330 for interpretation or travel assistance if communicating with an operator is difficult.$md$
        ),
        (
            'lost-phone',
            50,
            $md$Police Civil Service 24 has an official search for found property, including mobile phones.

Search using the details you know, such as the phone type, model, color, date, and location. If available, a serial number or IMEI can help narrow the search.

A found phone may not appear immediately, so check again later if your first search is unsuccessful.$md$
        )
) as seed(slug, sort_order, body_markdown)
    on seed.slug = guide.slug
where section.guide_id = guide.id
and section.sort_order = seed.sort_order;
