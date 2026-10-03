-- =========================================================
-- Locorea Seed Data v1
-- Development / MVP sample data
--
-- NOTE:
-- 일부 위치/설명은 개발 검증용 데이터입니다.
-- 운영 전 공식 출처를 기준으로 반드시 검증하세요.
-- =========================================================


-- =========================================================
-- 1. SOURCES
-- =========================================================

insert into public.sources (
    name,
    source_type,
    url,
    attribution,
    last_checked_at
)
select
    'Seoul Metropolitan Government',
    'official',
    'https://english.seoul.go.kr',
    'Source: Seoul Metropolitan Government',
    now()
where not exists (
    select 1 from public.sources where name = 'Seoul Metropolitan Government'
);

insert into public.sources (
    name,
    source_type,
    url,
    attribution,
    last_checked_at
)
select
    'Korea Tourism Organization',
    'official',
    'https://english.visitkorea.or.kr',
    'Source: Korea Tourism Organization',
    now()
where not exists (
    select 1 from public.sources where name = 'Korea Tourism Organization'
);

insert into public.sources (
    name,
    source_type,
    url,
    attribution,
    last_checked_at
)
select
    'Locorea Editorial',
    'editorial',
    null,
    'Curated by Locorea',
    now()
where not exists (
    select 1 from public.sources where name = 'Locorea Editorial'
);


-- =========================================================
-- 2. REGION
-- =========================================================

insert into public.regions (
    code,
    slug,
    sort_order,
    is_active
)
values (
    'SEOUL',
    'seoul',
    1,
    true
)
on conflict (slug) do nothing;


insert into public.region_translations (
    region_id,
    language_code,
    name,
    description
)
select
    r.id,
    'en',
    'Seoul',
    'The capital of South Korea and one of the country''s main travel hubs.'
from public.regions r
where r.slug = 'seoul'
on conflict (region_id, language_code) do nothing;


insert into public.region_translations (
    region_id,
    language_code,
    name,
    description
)
select
    r.id,
    'ko',
    '서울',
    '대한민국의 수도이자 대표적인 여행 중심 도시입니다.'
from public.regions r
where r.slug = 'seoul'
on conflict (region_id, language_code) do nothing;


-- =========================================================
-- 3. CITY
-- =========================================================

insert into public.cities (
    region_id,
    code,
    slug,
    sort_order,
    is_active
)
select
    id,
    'SEOUL',
    'seoul',
    1,
    true
from public.regions
where slug = 'seoul'
on conflict (slug) do nothing;


insert into public.city_translations (
    city_id,
    language_code,
    name,
    description
)
select
    c.id,
    'en',
    'Seoul',
    'A city of historic neighborhoods, modern culture, food, shopping and nightlife.'
from public.cities c
where c.slug = 'seoul'
on conflict (city_id, language_code) do nothing;


insert into public.city_translations (
    city_id,
    language_code,
    name,
    description
)
select
    c.id,
    'ko',
    '서울',
    '전통과 현대 문화, 음식, 쇼핑을 함께 경험할 수 있는 도시입니다.'
from public.cities c
where c.slug = 'seoul'
on conflict (city_id, language_code) do nothing;


-- =========================================================
-- 4. AREAS
-- =========================================================

insert into public.areas (
    city_id,
    slug,
    sort_order,
    is_active
)
select
    c.id,
    'seongsu',
    1,
    true
from public.cities c
where c.slug = 'seoul'
on conflict (slug) do nothing;


insert into public.area_translations (
    area_id,
    language_code,
    name,
    description
)
select
    a.id,
    'en',
    'Seongsu',
    'A trendy Seoul neighborhood known for cafes, shopping, pop-ups and Seoul Forest.'
from public.areas a
where a.slug = 'seongsu'
on conflict (area_id, language_code) do nothing;


insert into public.area_translations (
    area_id,
    language_code,
    name,
    description
)
select
    a.id,
    'ko',
    '성수',
    '서울숲과 카페, 쇼핑, 팝업스토어로 유명한 서울의 인기 지역입니다.'
from public.areas a
where a.slug = 'seongsu'
on conflict (area_id, language_code) do nothing;


-- =========================================================
-- 5. TAGS
-- =========================================================

insert into public.tags (slug, tag_group)
values
('seoul', 'location'),
('seongsu', 'location'),

('cafe', 'theme'),
('shopping', 'theme'),
('local', 'theme'),
('nature', 'theme'),
('culture', 'theme'),

('transportation', 'guide'),
('first-trip', 'guide'),
('practical', 'guide'),
('payment', 'guide'),
('mobile', 'guide'),
('maps', 'guide')
on conflict (slug) do nothing;


insert into public.tag_translations (
    tag_id,
    language_code,
    name
)
select id, 'en',
    case slug
        when 'seoul' then 'Seoul'
        when 'seongsu' then 'Seongsu'
        when 'cafe' then 'Cafe'
        when 'shopping' then 'Shopping'
        when 'local' then 'Local'
        when 'nature' then 'Nature'
        when 'culture' then 'Culture'
        when 'transportation' then 'Transportation'
        when 'first-trip' then 'First Trip'
        when 'practical' then 'Practical'
        when 'payment' then 'Payment'
        when 'mobile' then 'Mobile'
        when 'maps' then 'Maps'
    end
from public.tags
on conflict (tag_id, language_code) do nothing;


-- =========================================================
-- 6. PLACES
-- =========================================================


-- ---------------------------------------------------------
-- Seoul Forest
-- ---------------------------------------------------------

insert into public.places (
    area_id,
    source_id,
    slug,
    place_type,
    location,
    foreigner_friendly,
    status,
    last_verified_at,
    published_at
)
select
    a.id,
    s.id,
    'seoul-forest',
    'nature',

    extensions.ST_SetSRID(
        extensions.ST_MakePoint(
            127.0374,
            37.5444
        ),
        4326
    )::extensions.geography,

    true,
    'published',
    now(),
    now()

from public.areas a
cross join public.sources s

where a.slug = 'seongsu'
and s.name = 'Seoul Metropolitan Government';


insert into public.place_translations (
    place_id,
    language_code,
    name,
    summary,
    description,
    address_text,
    local_tip
)
select
    p.id,
    'en',
    'Seoul Forest',

    'A large urban park in the Seongsu area.',

    'Seoul Forest is a popular place to start exploring Seongsu. '
    || 'It combines green space with easy access to nearby cafes, shops and local streets.',

    'Seongsu-dong, Seongdong-gu, Seoul',

    'Combine Seoul Forest with nearby cafes and shopping for an easy half-day route.'

from public.places p
where p.slug = 'seoul-forest';


insert into public.place_translations (
    place_id,
    language_code,
    name,
    summary,
    description,
    address_text,
    local_tip
)
select
    p.id,
    'ko',
    '서울숲',

    '성수 지역을 대표하는 대형 도심 공원입니다.',

    '서울숲은 성수 여행을 시작하기 좋은 장소로 '
    || '주변 카페와 쇼핑 지역을 함께 둘러보기 좋습니다.',

    '서울특별시 성동구 성수동',

    '서울숲을 시작으로 성수 카페와 쇼핑 지역을 연결해 보세요.'

from public.places p
where p.slug = 'seoul-forest';



-- ---------------------------------------------------------
-- Cafe Onion Seongsu
-- Development sample business
-- ---------------------------------------------------------

insert into public.places (
    area_id,
    source_id,
    slug,
    place_type,
    location,
    foreigner_friendly,
    status,
    last_verified_at,
    published_at
)
select
    a.id,
    s.id,
    'cafe-onion-seongsu',
    'cafe',

    extensions.ST_SetSRID(
        extensions.ST_MakePoint(
            127.05811897155,
            37.544786024828
        ),
        4326
    )::extensions.geography,

    true,
    'published',
    now(),
    now()

from public.areas a
cross join public.sources s

where a.slug = 'seongsu'
and s.name = 'Locorea Editorial';


insert into public.place_translations (
    place_id,
    language_code,
    name,
    summary,
    description,
    address_text,
    local_tip
)
select
    p.id,
    'en',

    'Cafe Onion Seongsu',

    'An industrial-style cafe stop in Seongsu.',

    'A popular-style cafe experience that fits naturally into a Seongsu walking route.',

    '8, Achasan-ro 9-gil, Seongdong-gu, Seoul',

    'Weekends in Seongsu can be busy, so allow extra time when planning cafe stops.'

from public.places p
where p.slug = 'cafe-onion-seongsu';



-- ---------------------------------------------------------
-- Seongsu Handmade Shoe Street
-- ---------------------------------------------------------

insert into public.places (
    area_id,
    source_id,
    slug,
    place_type,
    location,
    foreigner_friendly,
    status,
    last_verified_at,
    published_at
)
select
    a.id,
    s.id,
    'seongsu-handmade-shoe-street',
    'shopping',

    extensions.ST_SetSRID(
        extensions.ST_MakePoint(
            127.0559,
            37.5448
        ),
        4326
    )::extensions.geography,

    true,
    'published',
    now(),
    now()

from public.areas a
cross join public.sources s

where a.slug = 'seongsu'
and s.name = 'Locorea Editorial';


insert into public.place_translations (
    place_id,
    language_code,
    name,
    summary,
    description,
    address_text,
    local_tip
)
select
    p.id,
    'en',

    'Seongsu Handmade Shoe Street',

    'A local shopping area connected to Seongsu''s manufacturing history.',

    'The area offers a different side of Seongsu beyond cafes and pop-up stores.',

    'Seongsu-dong, Seongdong-gu, Seoul',

    'Explore side streets rather than staying only on the main commercial roads.'

from public.places p
where p.slug = 'seongsu-handmade-shoe-street';


-- =========================================================
-- 7. PLACE TAGS
-- =========================================================

insert into public.place_tags (place_id, tag_id)
select p.id, t.id
from public.places p
cross join public.tags t
where p.slug = 'seoul-forest'
and t.slug in ('seoul', 'seongsu', 'nature', 'local');


insert into public.place_tags (place_id, tag_id)
select p.id, t.id
from public.places p
cross join public.tags t
where p.slug = 'cafe-onion-seongsu'
and t.slug in ('seoul', 'seongsu', 'cafe');


insert into public.place_tags (place_id, tag_id)
select p.id, t.id
from public.places p
cross join public.tags t
where p.slug = 'seongsu-handmade-shoe-street'
and t.slug in ('seoul', 'seongsu', 'shopping', 'local');


-- =========================================================
-- 8. ROUTE
-- =========================================================

insert into public.routes (
    area_id,
    source_id,
    slug,
    route_type,
    duration_minutes,
    distance_km,
    difficulty,
    status,
    last_verified_at,
    published_at
)
select
    a.id,
    s.id,

    'perfect-5-hours-in-seongsu',

    'half_day',

    300,
    4.0,
    'easy',

    'published',

    now(),
    now()

from public.areas a
cross join public.sources s

where a.slug = 'seongsu'
and s.name = 'Locorea Editorial';


insert into public.route_translations (
    route_id,
    language_code,
    name,
    summary,
    description
)
select
    r.id,
    'en',

    'Perfect 5 Hours in Seongsu',

    'Seoul Forest, cafe culture and local shopping in one easy half-day route.',

    'A relaxed route for first-time visitors who want to experience '
    || 'the different sides of Seongsu without rushing.'

from public.routes r
where r.slug = 'perfect-5-hours-in-seongsu';


-- Route Stop 1

insert into public.route_places (
    route_id,
    place_id,
    stop_order,
    stay_minutes,
    travel_minutes_to_next,
    note
)
select
    r.id,
    p.id,
    1,
    90,
    15,
    'Start with a relaxed walk through Seoul Forest.'

from public.routes r
cross join public.places p

where r.slug = 'perfect-5-hours-in-seongsu'
and p.slug = 'seoul-forest';


-- Route Stop 2

insert into public.route_places (
    route_id,
    place_id,
    stop_order,
    stay_minutes,
    travel_minutes_to_next,
    note
)
select
    r.id,
    p.id,
    2,
    60,
    10,
    'Take a cafe break before exploring the shopping streets.'

from public.routes r
cross join public.places p

where r.slug = 'perfect-5-hours-in-seongsu'
and p.slug = 'cafe-onion-seongsu';


-- Route Stop 3

insert into public.route_places (
    route_id,
    place_id,
    stop_order,
    stay_minutes,
    travel_minutes_to_next,
    note
)
select
    r.id,
    p.id,
    3,
    90,
    null,
    'Finish the route exploring Seongsu''s local shopping streets.'

from public.routes r
cross join public.places p

where r.slug = 'perfect-5-hours-in-seongsu'
and p.slug = 'seongsu-handmade-shoe-street';


-- Route Tags

insert into public.route_tags (route_id, tag_id)
select r.id, t.id
from public.routes r
cross join public.tags t
where r.slug = 'perfect-5-hours-in-seongsu'
and t.slug in (
    'seoul',
    'seongsu',
    'cafe',
    'shopping',
    'local'
);


-- =========================================================
-- 9. GUIDES
-- =========================================================


-- ---------------------------------------------------------
-- Seoul Subway
-- ---------------------------------------------------------

insert into public.guides (
    source_id,
    slug,
    guide_type,
    status,
    featured,
    last_verified_at,
    published_at
)
select
    id,

    'how-to-use-seoul-subway',

    'transport',

    'published',
    true,

    now(),
    now()

from public.sources
where name = 'Seoul Metropolitan Government';


insert into public.guide_translations (
    guide_id,
    language_code,
    title,
    summary,
    body_markdown
)
select
    g.id,
    'en',

    'How to Use the Seoul Subway',

    'A practical first-time guide to subway lines, directions, transfers and exits.',

$md$

## Before you ride

Check your destination and identify the line number and direction.

## Check the direction

Stations usually show the next major station or terminal direction.

## Transfers

Follow the transfer signs for the line you need.

## Exit numbers matter

Large stations may have many exits. Check the correct exit before leaving the station.

## Locorea Tip

Save both the English and Korean name of your destination before starting your trip.

$md$

from public.guides g
where g.slug = 'how-to-use-seoul-subway';



-- ---------------------------------------------------------
-- T-money vs Climate Card
-- ---------------------------------------------------------

insert into public.guides (
    source_id,
    slug,
    guide_type,
    status,
    featured,
    last_verified_at,
    published_at
)
select
    id,

    't-money-vs-climate-card',

    'transport',

    'published',
    true,

    now(),
    now()

from public.sources
where name = 'Seoul Metropolitan Government';


insert into public.guide_translations (
    guide_id,
    language_code,
    title,
    summary,
    body_markdown
)
select
    g.id,
    'en',

    'T-money vs Climate Card',

    'Understand the difference before choosing a transportation card for Seoul.',

$md$

## Which card should I use?

The best choice depends on how long you stay and how often you use public transportation.

## T-money

A flexible transportation card commonly used by travelers.

## Climate Card

A Seoul transportation pass that may be useful for visitors using public transportation frequently.

## Before buying

Pass conditions and purchase methods can change.

Always check the latest official information before purchasing.

$md$

from public.guides g
where g.slug = 't-money-vs-climate-card';



-- ---------------------------------------------------------
-- SIM / eSIM
-- ---------------------------------------------------------

insert into public.guides (
    source_id,
    slug,
    guide_type,
    status,
    featured,
    last_verified_at,
    published_at
)
select
    id,

    'sim-vs-esim-in-korea',

    'sim',

    'published',
    true,

    now(),
    now()

from public.sources
where name = 'Locorea Editorial';


insert into public.guide_translations (
    guide_id,
    language_code,
    title,
    summary,
    body_markdown
)
select
    g.id,
    'en',

    'SIM vs eSIM in Korea',

    'What international visitors should consider when choosing mobile data in Korea.',

$md$

## eSIM

Convenient if your phone supports eSIM and you mainly need mobile data.

## Physical SIM

Useful when you prefer a traditional SIM card or need services that include a local number.

## Korean phone numbers

Some Korean services may request a local phone number.

Check your planned activities before deciding between a data-only option and a local-number plan.

$md$

from public.guides g
where g.slug = 'sim-vs-esim-in-korea';



-- ---------------------------------------------------------
-- Maps
-- ---------------------------------------------------------

insert into public.guides (
    source_id,
    slug,
    guide_type,
    status,
    featured,
    last_verified_at,
    published_at
)
select
    id,

    'using-maps-in-korea',

    'maps',

    'published',
    true,

    now(),
    now()

from public.sources
where name = 'Locorea Editorial';


insert into public.guide_translations (
    guide_id,
    language_code,
    title,
    summary,
    body_markdown
)
select
    g.id,
    'en',

    'Using Maps in Korea',

    'A practical guide to finding places and navigating Korean cities.',

$md$

## Search by place name

Keep both the English name and Korean name of important destinations.

## Navigation

Different map services may provide different levels of local detail.

## Locorea Tip

If an English search does not find the place you want, try searching with its Korean name or address.

$md$

from public.guides g
where g.slug = 'using-maps-in-korea';



-- ---------------------------------------------------------
-- Payment
-- ---------------------------------------------------------

insert into public.guides (
    source_id,
    slug,
    guide_type,
    status,
    featured,
    last_verified_at,
    published_at
)
select
    id,

    'paying-in-korea',

    'payment',

    'published',
    true,

    now(),
    now()

from public.sources
where name = 'Locorea Editorial';


insert into public.guide_translations (
    guide_id,
    language_code,
    title,
    summary,
    body_markdown
)
select
    g.id,
    'en',

    'Paying in Korea',

    'Cards, cash and what to do when a foreign payment method does not work.',

$md$

## Credit cards

Cards are widely used, but individual merchants and online services may have different requirements.

## Cash

Keeping a small amount of cash can still be useful.

## Online payments

Some Korean online services may require additional identity or payment verification.

## If payment fails

Try another payment method and check whether the service accepts foreign-issued cards.

$md$

from public.guides g
where g.slug = 'paying-in-korea';


-- =========================================================
-- 10. GUIDE TAGS
-- =========================================================

insert into public.guide_tags (guide_id, tag_id)
select g.id, t.id
from public.guides g
cross join public.tags t
where g.slug = 'how-to-use-seoul-subway'
and t.slug in (
    'transportation',
    'first-trip',
    'practical'
);


insert into public.guide_tags (guide_id, tag_id)
select g.id, t.id
from public.guides g
cross join public.tags t
where g.slug = 't-money-vs-climate-card'
and t.slug in (
    'transportation',
    'first-trip',
    'payment'
);


insert into public.guide_tags (guide_id, tag_id)
select g.id, t.id
from public.guides g
cross join public.tags t
where g.slug = 'sim-vs-esim-in-korea'
and t.slug in (
    'mobile',
    'first-trip',
    'practical'
);


insert into public.guide_tags (guide_id, tag_id)
select g.id, t.id
from public.guides g
cross join public.tags t
where g.slug = 'using-maps-in-korea'
and t.slug in (
    'maps',
    'first-trip',
    'practical'
);


insert into public.guide_tags (guide_id, tag_id)
select g.id, t.id
from public.guides g
cross join public.tags t
where g.slug = 'paying-in-korea'
and t.slug in (
    'payment',
    'first-trip',
    'practical'
);


-- =========================================================
-- 11. PROBLEM GUIDES
-- =========================================================


-- ---------------------------------------------------------
-- Lost passport
-- ---------------------------------------------------------

insert into public.problem_guides (
    slug,
    category,
    title,
    summary,
    status,
    published_at,
    last_reviewed_at
)
values (
    'lost-passport',
    'lost-something',
    'Lost your passport in Korea?',
    'Losing your passport can be stressful, but there are clear steps you can take in Korea. Follow this guide to check for your passport, report the loss, contact your embassy, and prepare for your next steps.',
    'published',
    now(),
    now()
)
on conflict (slug) do update
set
    category = excluded.category,
    title = excluded.title,
    summary = excluded.summary,
    status = excluded.status,
    published_at = excluded.published_at,
    last_reviewed_at = excluded.last_reviewed_at;


-- Ordered Markdown sections

insert into public.problem_guide_sections (
    guide_id,
    section_type,
    title,
    body_markdown,
    sort_order
)
select
    g.id,
    seed.section_type,
    seed.title,
    seed.body_markdown,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'intro',
            'Don''t panic. Here''s what to do.',
            $md$Before starting the replacement process, quickly check the last places where you used or stored your passport.

Think about your hotel, accommodation, airport, train station, taxi, restaurant, shop, duty-free store, currency exchange, or mobile service counter.

If you still can''t find it, follow the steps below.$md$,
            10
        ),
        (
            'do_first',
            'Check where you last used your passport',
            $md$Try to remember when you last physically handled your passport.

If you stayed at a hotel, check with the front desk first. Also contact any place where you recently showed your passport.

It helps to know:

- the approximate time
- the place where you last used it
- your full name
- nationality
- passport number, if available
- a description of your passport or passport holder$md$,
            20
        ),
        (
            'step',
            'Search Korea''s official lost-property service',
            $md$Found belongings may be registered with Korea''s official police lost-and-found service on Police Civil Service 24.

Search for your passport before assuming it is permanently lost.

If nothing appears immediately, check again later because found items may take time to move from the place where they were found into the police lost-property system.$md$,
            30
        ),
        (
            'step',
            'Report the loss',
            $md$If you still cannot find your passport, contact or visit a nearby police station or police box.

Explain when and where you think the passport was lost.

Ask whether a loss report or receipt can be issued. Your embassy or consulate may ask for documentation related to the loss.$md$,
            40
        ),
        (
            'step',
            'Contact your embassy or consulate',
            $md$Your passport is issued by your own country, so your embassy or consulate determines how it can be replaced.

Depending on your nationality and circumstances, you may receive:

- a replacement passport
- an emergency passport
- an emergency travel document

Requirements and processing times differ by country. Always check your embassy''s current instructions.$md$,
            50
        ),
        (
            'what_you_need',
            'Before you contact your embassy',
            $md$Requirements vary by country, but it may be helpful to prepare:

- another form of photo identification
- a photo or copy of your lost passport, if available
- your passport number, if known
- passport photos
- police loss documentation, if requested
- your flight or travel itinerary
- a payment method for replacement-document fees

Treat this as a preparation checklist, not a universal list of mandatory documents.$md$,
            60
        ),
        (
            'step',
            'Check whether you need immigration assistance',
            $md$A replacement passport or emergency travel document may affect immigration or departure procedures.

If you are unsure whether you need to update passport information or complete another procedure before leaving Korea, contact the Korea Immigration Contact Center at 1345.

Do not state that every traveler must visit an immigration office. Requirements depend on the traveler''s circumstances.$md$,
            70
        ),
        (
            'step',
            'Check your flight and onward travel',
            $md$After receiving a replacement passport or emergency travel document, check whether your airline needs updated passport information.

If Korea is not your final destination, also confirm whether your emergency passport or travel document is accepted by the next country you plan to visit.

Check:

- passport number
- expiration date
- airline booking information
- visa or travel authorization requirements
- entry requirements for your next destination$md$,
            80
        ),
        (
            'good_to_know',
            'Your passport may still turn up',
            $md$A passport that is not found immediately may still be turned in later.

Found items can move from a station, store, hotel, or other facility into the police lost-property system.

If your first search is unsuccessful, try checking again later.$md$,
            90
        ),
        (
            'fallback',
            'Still need help?',
            $md$If you are unsure what to do next or need help communicating, Korea''s travel and immigration support services may be able to help.

Use the quick actions and official resources below.$md$,
            100
        )
) as seed(section_type, title, body_markdown, sort_order)
where g.slug = 'lost-passport'
and not exists (
    select 1
    from public.problem_guide_sections section
    where section.guide_id = g.id
    and section.sort_order = seed.sort_order
);


-- Quick actions

insert into public.problem_guide_actions (
    guide_id,
    section_id,
    action_key,
    action_type,
    label,
    description,
    href,
    variant,
    sort_order
)
select
    g.id,
    section.id,
    seed.action_key,
    seed.action_type,
    seed.label,
    seed.description,
    seed.href,
    seed.variant,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'search_lost112',
            'external',
            'Search police lost & found',
            'Search Korea''s official police lost-and-found service.',
            'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
            'primary',
            10,
            30
        ),
        (
            'find_police',
            'internal',
            'Find nearby police',
            'Find a nearby police station or police box.',
            null,
            'default',
            20,
            40
        ),
        (
            'find_embassy',
            'external',
            'Find my embassy',
            'Find foreign embassies and consulates in Korea using the Ministry of Foreign Affairs directory.',
            'https://www.mofa.go.kr/eng/wpge/m_4908/contents.do',
            'default',
            30,
            50
        ),
        (
            'call_1345',
            'phone',
            'Call Immigration 1345',
            'Immigration and stay-related information.',
            'tel:1345',
            'default',
            40,
            70
        ),
        (
            'call_1330',
            'phone',
            'Call 1330 Travel Helpline',
            'Travel assistance and interpretation.',
            'tel:1330',
            'default',
            50,
            100
        )
) as seed(action_key, action_type, label, description, href, variant, sort_order, section_sort_order)
join public.problem_guide_sections section
    on section.guide_id = g.id
    and section.sort_order = seed.section_sort_order
where g.slug = 'lost-passport'
and not exists (
    select 1
    from public.problem_guide_actions action
    where action.guide_id = g.id
    and action.sort_order = seed.sort_order
);


-- Useful Korean phrases

insert into public.problem_guide_phrases (
    guide_id,
    context,
    text_en,
    text_ko,
    romanization,
    sort_order
)
select
    g.id,
    seed.context,
    seed.text_en,
    seed.text_ko,
    seed.romanization,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        ('General', 'I lost my passport.', '여권을 잃어버렸어요.', 'Yeogwoneul ireobeoryeosseoyo.', 10),
        ('Police', 'I want to report my passport lost.', '여권 분실 신고를 하고 싶어요.', 'Yeogwon bunsil singoreul hago sipeoyo.', 20),
        ('Lost and found', 'Could you check if my passport has been turned in?', '제 여권이 접수되었는지 확인해 주세요.', 'Je yeogwoni jeopsudoeeonneunji hwaginhae juseyo.', 30),
        ('Police', 'Could I get a loss report?', '분실 확인서를 받을 수 있을까요?', 'Bunsil hwaginseoreul badeul su isseulkkayo?', 40),
        ('Directions', 'Where is the nearest police station?', '가까운 경찰서가 어디예요?', 'Gakkaun gyeongchalseoga eodiyeyo?', 50)
) as seed(context, text_en, text_ko, romanization, sort_order)
where g.slug = 'lost-passport'
and not exists (
    select 1
    from public.problem_guide_phrases phrase
    where phrase.guide_id = g.id
    and phrase.sort_order = seed.sort_order
);


-- Official resources

insert into public.problem_guide_resources (
    guide_id,
    resource_type,
    platform,
    title,
    description,
    organization,
    url,
    language,
    last_checked_at,
    is_active,
    featured,
    sort_order
)
select
    g.id,
    seed.resource_type,
    seed.platform,
    seed.title,
    seed.description,
    seed.organization,
    seed.url,
    seed.language,
    now(),
    true,
    false,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'official',
            'website',
            'Police Civil Service 24 — Lost & Found',
            'Search Korea''s official police lost-and-found service.',
            'Korean National Police Agency',
            'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
            'ko',
            10
        ),
        (
            'official',
            'website',
            'Foreign Missions in Korea',
            'Find foreign embassies and consulates in Korea.',
            'Ministry of Foreign Affairs, Republic of Korea',
            'https://www.mofa.go.kr/eng/wpge/m_4908/contents.do',
            'en',
            20
        ),
        (
            'official',
            'website',
            'Immigration Contact Center 1345',
            'Immigration and stay-related information for foreign visitors and residents.',
            'Korea Immigration Service',
            'https://www.immigration.go.kr/immigration_eng/1862/subview.do',
            'en',
            30
        ),
        (
            'official',
            'website',
            '1330 Travel Helpline',
            'Travel assistance and interpretation.',
            'Korea Tourism Organization',
            'https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=454&vcontsId=140632',
            'en',
            40
        ),
        (
            'official',
            'youtube',
            'Official guide video',
            'Official public-service video related to this guide.',
            'Official public institution',
            'https://www.youtube.com/watch?v=8sjdUdS5eoA',
            'ko',
            50
        )
) as seed(resource_type, platform, title, description, organization, url, language, sort_order)
where g.slug = 'lost-passport'
and not exists (
    select 1
    from public.problem_guide_resources resource
    where resource.guide_id = g.id
    and resource.sort_order = seed.sort_order
);


-- ---------------------------------------------------------
-- Lost something on the subway
-- ---------------------------------------------------------

insert into public.problem_guides (
    slug,
    category,
    guide_type,
    title,
    summary,
    status,
    published_at,
    last_reviewed_at
)
values (
    'lost-something-on-the-subway',
    'lost-something',
    'problem',
    'Lost something on the subway',
    'Lost something on a subway in Korea? Start with station staff if you noticed quickly, then use Korea''s official lost-and-found system if the item isn''t found right away.',
    'published',
    now(),
    now()
)
on conflict (slug) do update
set
    category = excluded.category,
    guide_type = excluded.guide_type,
    title = excluded.title,
    summary = excluded.summary,
    status = excluded.status,
    published_at = excluded.published_at,
    last_reviewed_at = excluded.last_reviewed_at;


insert into public.problem_guide_sections (
    guide_id,
    section_type,
    title,
    body_markdown,
    sort_order
)
select
    g.id,
    seed.section_type,
    seed.title,
    seed.body_markdown,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'intro',
            'Left something on the subway?',
            $md$Left your phone, bag, shopping bag, wallet, or another item on the subway?

If you noticed quickly, station staff may be able to identify the train and contact another station before the train gets too far away.$md$,
            10
        ),
        (
            'do_first',
            'Tell station staff immediately',
            $md$Go to the nearest station office or speak to a station employee.

Tell them as much as you remember:

- subway line
- direction of travel
- station where you boarded
- station where you got off
- approximate time
- train car or door number, if known
- description of the item
- where in the train you think you left it

You do not need every detail. The line, direction, station, and approximate time may already be useful.$md$,
            20
        ),
        (
            'step',
            'If you just got off the train',
            $md$Contact station staff immediately.

The train may still be operating on the line, and staff may be able to contact another station or relevant operations staff. Recovery cannot be guaranteed, but acting quickly gives staff the best information to work with.$md$,
            30
        ),
        (
            'step',
            'If some time has passed',
            $md$Check Korea''s official police lost-and-found service on Police Civil Service 24.

Found items from public transportation and other locations can be searched there.

Items may not appear immediately: a transport operator may hold an item before it appears in the police lost-and-found system.

If your item is not listed yet, search again later.$md$,
            40
        ),
        (
            'what_you_need',
            'What you''ll need',
            $md$**Subway information**

- line
- direction
- boarding station
- station where you got off
- approximate time
- train car or door number, if known

**Item information**

- item type
- color
- brand, if relevant
- distinguishing features
- where it was left
- a photo of the item, if available$md$,
            50
        ),
        (
            'related_guide',
            'Passport inside your lost item?',
            $md$If the lost item contained your passport, follow the dedicated passport guide rather than relying only on subway lost-and-found steps.$md$,
            60
        ),
        (
            'good_to_know',
            'You do not need to identify the operator first',
            $md$The Seoul metropolitan subway network is operated by multiple organizations.

If you have just lost an item, start with the nearest station staff. Give them train details, then check the police lost-and-found service later if necessary.$md$,
            70
        ),
        (
            'fallback',
            'If that doesn''t work',
            $md$If the item does not appear immediately, check the police lost-and-found service again later.

Use Seoul''s official lost-and-found information to identify the appropriate subway operator or contact if necessary. Ask 1330 for interpretation or travel assistance if communicating with an operator is difficult.$md$,
            80
        )
) as seed(section_type, title, body_markdown, sort_order)
where g.slug = 'lost-something-on-the-subway'
and not exists (
    select 1
    from public.problem_guide_sections section
    where section.guide_id = g.id
    and section.sort_order = seed.sort_order
);


insert into public.problem_guide_actions (
    guide_id,
    section_id,
    action_key,
    action_type,
    label,
    description,
    href,
    variant,
    sort_order
)
select
    g.id,
    section.id,
    seed.action_key,
    seed.action_type,
    seed.label,
    seed.description,
    seed.href,
    seed.variant,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'search_lost112',
            'external',
            'Search police lost & found',
            'Search Korea''s official police lost-and-found service.',
            'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
            'primary',
            10,
            40
        ),
        (
            'call_1330',
            'phone',
            'Call 1330 Travel Helpline',
            'Travel help and interpretation assistance.',
            'tel:1330',
            'default',
            20,
            80
        ),
        (
            'seoul_lost_and_found',
            'external',
            'View Seoul lost-and-found information',
            'Official Seoul traveler information, including subway contacts.',
            'https://english.visitseoul.net/essential-Info-article/Lost-and-Found/ENN012395',
            'default',
            30,
            80
        ),
        (
            'related_guide',
            'internal',
            'Read the Lost passport guide',
            'Follow dedicated next steps if your passport was inside the lost item.',
            '/help/guides/lost-passport',
            'default',
            40,
            60
        )
) as seed(action_key, action_type, label, description, href, variant, sort_order, section_sort_order)
join public.problem_guide_sections section
    on section.guide_id = g.id
    and section.sort_order = seed.section_sort_order
where g.slug = 'lost-something-on-the-subway'
and not exists (
    select 1
    from public.problem_guide_actions action
    where action.guide_id = g.id
    and action.sort_order = seed.sort_order
);


insert into public.problem_guide_phrases (
    guide_id,
    context,
    text_en,
    text_ko,
    romanization,
    sort_order
)
select
    g.id,
    seed.context,
    seed.text_en,
    seed.text_ko,
    seed.romanization,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        ('General', 'I lost something on the subway.', '지하철에서 물건을 잃어버렸어요.', 'Jihacheoreseo mulgeoneul ireobeoryeosseoyo.', 10),
        ('Station staff', 'I just got off this train.', '방금 이 열차에서 내렸어요.', 'Banggeum i yeolchaeseo naeryeosseoyo.', 20),
        ('Item description', 'I think I left a black bag on the train.', '검은색 가방을 두고 내린 것 같아요.', 'Geomeunsaek gabangeul dugo naerin geot gatayo.', 30),
        ('Lost and found', 'I''d like to contact the lost and found center.', '분실물 센터에 연락하고 싶어요.', 'Bunsilmul senteoe yeollakhago sipeoyo.', 40)
) as seed(context, text_en, text_ko, romanization, sort_order)
where g.slug = 'lost-something-on-the-subway'
and not exists (
    select 1
    from public.problem_guide_phrases phrase
    where phrase.guide_id = g.id
    and phrase.sort_order = seed.sort_order
);


insert into public.problem_guide_resources (
    guide_id,
    resource_type,
    platform,
    title,
    description,
    organization,
    url,
    language,
    last_checked_at,
    is_active,
    featured,
    sort_order
)
select
    g.id,
    seed.resource_type,
    seed.platform,
    seed.title,
    seed.description,
    seed.organization,
    seed.url,
    seed.language,
    now(),
    true,
    false,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'official',
            'website',
            'Police Civil Service 24 — Lost & Found',
            'Search for found items in Korea''s official police lost-and-found service.',
            'Korean National Police Agency',
            'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
            'ko',
            10
        ),
        (
            'official',
            'website',
            'Lost and Found — Visit Seoul',
            'Official traveler information covering lost property in Seoul, including subway contacts.',
            'Seoul Tourism Organization / Official Seoul Travel Guide',
            'https://english.visitseoul.net/essential-Info-article/Lost-and-Found/ENN012395',
            'en',
            20
        ),
        (
            'official',
            'website',
            '1330 Travel Helpline',
            'Multilingual travel information and interpretation assistance for international travelers.',
            'Korea Tourism Organization',
            'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?vcontsId=140632',
            'en',
            30
        )
) as seed(resource_type, platform, title, description, organization, url, language, sort_order)
where g.slug = 'lost-something-on-the-subway'
and not exists (
    select 1
    from public.problem_guide_resources resource
    where resource.guide_id = g.id
    and resource.sort_order = seed.sort_order
);


-- ---------------------------------------------------------
-- Lost phone
-- ---------------------------------------------------------

insert into public.problem_guides (
    slug,
    category,
    guide_type,
    title,
    summary,
    status,
    published_at,
    last_reviewed_at
)
values (
    'lost-phone',
    'lost-something',
    'problem',
    'Lost your phone in Korea?',
    'Lost your phone while traveling in Korea? Locate and secure it first, then check the last place you used it, Korea''s lost-and-found services, and your mobile provider if you can''t recover it quickly.',
    'published',
    now(),
    now()
)
on conflict (slug) do update
set
    category = excluded.category,
    guide_type = excluded.guide_type,
    title = excluded.title,
    summary = excluded.summary,
    status = excluded.status,
    published_at = excluded.published_at,
    last_reviewed_at = excluded.last_reviewed_at;


insert into public.problem_guide_sections (
    guide_id,
    section_type,
    title,
    body_markdown,
    sort_order
)
select
    g.id,
    seed.section_type,
    seed.title,
    seed.body_markdown,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'intro',
            'Use another device now',
            $md$Use another phone, tablet, or computer as soon as you can.

First try to locate and secure the device. Then check the last place you used it and Korea''s lost-and-found services.

If theft seems possible, prioritize your safety.$md$,
            10
        ),
        (
            'do_first',
            'Locate and secure your phone',
            $md$If you use an iPhone, open Apple''s Find My. If you use Android, open Google''s Find Hub.

If the phone may still be nearby, play a sound first.

If you cannot recover it immediately, mark the device as lost or secure it remotely.

If the location service is unavailable, do not wait too long before contacting the last place where you used the phone.$md$,
            20
        ),
        (
            'step',
            'Check the last place you used it',
            $md$Think about where you last physically used or handled your phone.

Check your hotel, cafe, restaurant, shop, taxi, airport, train station, or other recent stops.

If you left it on the subway, use the dedicated subway lost-item guide because station staff may be able to help while the train is still operating.

When contacting a place, tell them the approximate time, phone model, color, case, and any distinguishing details.$md$,
            30
        ),
        (
            'step',
            'If you think it was stolen',
            $md$If the phone''s location is moving unexpectedly or appears to be at a private or unsafe location, do not confront anyone yourself.

Contact the police if you believe the phone was stolen or if retrieving it could put you at risk.$md$,
            40
        ),
        (
            'step',
            'Search for a found phone',
            $md$Police Civil Service 24 has an official search for found property, including mobile phones.

Search using the details you know, such as the phone type, model, color, date, and location. If available, a serial number or IMEI can help narrow the search.

A found phone may not appear immediately, so check again later if your first search is unsuccessful.$md$,
            50
        ),
        (
            'what_you_need',
            'What you''ll need',
            $md$Prepare as much of this information as you can:

- phone brand and model
- color and case
- your phone number
- approximate time and place you last had it
- serial number or IMEI, if available
- any distinctive marks or accessories
- a contact method you can still access, such as email or another phone number

You do not need every detail to ask for help.$md$,
            60
        ),
        (
            'step',
            'Protect your SIM and mobile service',
            $md$If you cannot recover the phone quickly, or you are concerned someone may use your mobile service, contact the provider for the SIM or eSIM currently active on the phone.

If you are roaming, contact your home carrier.

If you are using a travel SIM or eSIM, contact the company that issued it.

If you are using a Korean SIM, contact the Korean mobile provider.

Ask about suspending the line, blocking unauthorized use, and replacement options.

Do not hardcode one Korean carrier because international travelers may be using roaming, a travel eSIM, or a Korean SIM.$md$,
            70
        ),
        (
            'good_to_know',
            'Be careful with "we found your phone" messages',
            $md$Be cautious if you receive a message saying your phone has been found.

Do not share your device passcode, account password, verification code, or other security information.

For iPhone users, Apple states that it does not contact users to say that a lost iPhone or iPad has been found.

Open Apple or Google services directly instead of signing in through links in unexpected messages.$md$,
            80
        ),
        (
            'good_to_know',
            'Erase only as a last resort',
            $md$Remote erase can help protect your data, but use it only after you have tried other recovery options.

On Android, erasing the device means its location will no longer be available through Find Hub.

On iPhone, Apple advises trying other recovery methods first. If you erase the device, do not remove it from Find My, because doing so removes Activation Lock.$md$,
            90
        ),
        (
            'fallback',
            'Still need help?',
            $md$If you need travel assistance or help communicating in Korean, contact the 1330 Travel Helpline.

1330 also provides real-time chat, which can be useful if you no longer have access to your own phone.$md$,
            100
        )
) as seed(section_type, title, body_markdown, sort_order)
where g.slug = 'lost-phone'
and not exists (
    select 1
    from public.problem_guide_sections section
    where section.guide_id = g.id
    and section.sort_order = seed.sort_order
);


insert into public.problem_guide_actions (
    guide_id,
    section_id,
    action_key,
    action_type,
    label,
    description,
    href,
    variant,
    sort_order
)
select
    g.id,
    section.id,
    seed.action_key,
    seed.action_type,
    seed.label,
    seed.description,
    seed.href,
    seed.variant,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'find_iphone',
            'external',
            'Find my iPhone',
            'Open Apple''s Find My on the web.',
            'https://www.icloud.com/find',
            'primary',
            10,
            20
        ),
        (
            'find_android',
            'external',
            'Find my Android',
            'Open Google''s Find Hub.',
            'https://android.com/find',
            'primary',
            20,
            20
        ),
        (
            'related_guide',
            'internal',
            'Lost it on the subway?',
            'Follow the dedicated subway lost-item steps.',
            '/help/guides/lost-something-on-the-subway',
            'default',
            30,
            30
        ),
        (
            'call_112',
            'phone',
            'Call Police 112',
            'Use 112 for theft or an immediate safety concern.',
            'tel:112',
            'danger',
            40,
            40
        ),
        (
            'search_lost112_phone',
            'external',
            'Search police lost & found',
            'Search Korea''s official police lost-and-found service.',
            'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
            'primary',
            50,
            50
        ),
        (
            'call_1330',
            'phone',
            'Call 1330 Travel Helpline',
            'Travel help and interpretation assistance.',
            'tel:1330',
            'default',
            60,
            100
        )
) as seed(action_key, action_type, label, description, href, variant, sort_order, section_sort_order)
join public.problem_guide_sections section
    on section.guide_id = g.id
    and section.sort_order = seed.section_sort_order
where g.slug = 'lost-phone'
and not exists (
    select 1
    from public.problem_guide_actions action
    where action.guide_id = g.id
    and action.sort_order = seed.sort_order
);


insert into public.problem_guide_phrases (
    guide_id,
    context,
    text_en,
    text_ko,
    romanization,
    sort_order
)
select
    g.id,
    seed.context,
    seed.text_en,
    seed.text_ko,
    seed.romanization,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        ('General', 'I lost my phone.', '휴대폰을 잃어버렸어요.', 'Hyudaephoneul ireobeoryeosseoyo.', 10),
        ('Last location', 'I think I left my phone here.', '휴대폰을 여기 두고 간 것 같아요.', 'Hyudaephoneul yeogi dugo gan geot gatayo.', 20),
        ('Lost and found', 'Has a phone been turned in as lost property?', '혹시 분실물로 들어온 휴대폰이 있나요?', 'Hoksi bunsilmullo deureoon hyudaeponi innayo?', 30),
        ('Police', 'I think my phone was stolen.', '휴대폰을 도난당한 것 같아요.', 'Hyudaephoneul donandanghan geot gatayo.', 40)
) as seed(context, text_en, text_ko, romanization, sort_order)
where g.slug = 'lost-phone'
and not exists (
    select 1
    from public.problem_guide_phrases phrase
    where phrase.guide_id = g.id
    and phrase.sort_order = seed.sort_order
);


insert into public.problem_guide_resources (
    guide_id,
    resource_type,
    platform,
    title,
    description,
    organization,
    url,
    language,
    last_checked_at,
    is_active,
    featured,
    sort_order
)
select
    g.id,
    seed.resource_type,
    seed.platform,
    seed.title,
    seed.description,
    seed.organization,
    seed.url,
    seed.language,
    now(),
    true,
    false,
    seed.sort_order
from public.problem_guides g
cross join (
    values
        (
            'official',
            'website',
            'If your iPhone or iPad is lost or stolen',
            'Official Apple guidance for locating, securing, or erasing a lost device.',
            'Apple Support',
            'https://support.apple.com/en-us/101593',
            'en',
            10
        ),
        (
            'official',
            'website',
            'Find, secure, or erase a lost Android device',
            'Official Google guidance for using Find Hub to locate and secure a lost Android device.',
            'Google',
            'https://support.google.com/android/answer/6160491',
            'en',
            20
        ),
        (
            'official',
            'website',
            'Police Civil Service 24 — Lost & Found',
            'Search Korea''s official police lost-and-found service.',
            'Korean National Police Agency',
            'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201',
            'ko',
            30
        ),
        (
            'official',
            'website',
            'Handphone Lost Call Center',
            'Korean-language lost-phone support information.',
            'Korea Association for ICT Promotion',
            'https://www.handphone.or.kr/lostinfo.php',
            'ko',
            40
        ),
        (
            'official',
            'website',
            '1330 Travel Helpline',
            'Multilingual travel information and interpretation assistance for international travelers.',
            'Korea Tourism Organization',
            'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?vcontsId=140632',
            'en',
            50
        )
) as seed(resource_type, platform, title, description, organization, url, language, sort_order)
where g.slug = 'lost-phone'
and not exists (
    select 1
    from public.problem_guide_resources resource
    where resource.guide_id = g.id
    and resource.sort_order = seed.sort_order
);


-- ---------------------------------------------------------
-- Lost wallet / cards (kept in sync with the staging migration)
-- ---------------------------------------------------------
insert into public.problem_guides (id, slug, category, guide_type, title, summary, status, published_at, last_reviewed_at)
values ('d0b3f7f1-6c08-4b55-8e10-000000000001', 'lost-wallet-cards', 'lost-something', 'problem', 'Lost your wallet or cards in Korea?', 'Retrace where you last had it, contact the most likely place first, and use Korea''s lost-and-found system if it doesn''t turn up.', 'published', now(), now())
on conflict (slug) do update set category = excluded.category, guide_type = excluded.guide_type, title = excluded.title, summary = excluded.summary, status = excluded.status, published_at = excluded.published_at, last_reviewed_at = excluded.last_reviewed_at;

delete from public.problem_guide_actions a using public.problem_guides g where a.guide_id = g.id and g.slug = 'lost-wallet-cards';
delete from public.problem_guide_phrases p using public.problem_guides g where p.guide_id = g.id and g.slug = 'lost-wallet-cards';
delete from public.problem_guide_resources r using public.problem_guides g where r.guide_id = g.id and g.slug = 'lost-wallet-cards';
delete from public.problem_guide_sections s using public.problem_guides g where s.guide_id = g.id and g.slug = 'lost-wallet-cards';

insert into public.problem_guide_sections (id, guide_id, section_type, title, body_markdown, interaction_data, sort_order)
select seed.id, g.id, seed.section_type, seed.title, seed.body_markdown, seed.interaction_data, seed.sort_order
from public.problem_guides g cross join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000101'::uuid, 'intro', 'Start with the most likely place', $md$Try to remember the last time you used your wallet or cards. Contact the place, station, vehicle, or accommodation first if you can identify it.$md$, null::jsonb, 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000102'::uuid, 'choice', null, '', $json${"prompt":"Where do you think you lost it?","options":[{"key":"subway","label":"Subway / Train","title":"Start with station staff","body_markdown":"Tell station staff as soon as possible. Share the line, train direction, approximate time, where you were sitting or standing, and what the wallet looks like.","action_keys":["related_subway_guide"]},{"key":"taxi","label":"Taxi","title":"Check your trip details first","body_markdown":"Check the taxi app, receipt, or recent trip history and contact the driver or operator with the pickup and drop-off details. If it is not recovered, search the official lost-and-found service."},{"key":"bus","label":"Bus","title":"Contact the bus operator","body_markdown":"Note the route number, direction, stops, and approximate time. Contact the operator if possible, then search the official lost-and-found service.","action_keys":["search_lost_found"]},{"key":"shop","label":"Café / Restaurant / Shop","title":"Contact the venue first","body_markdown":"Call or return to the venue with the time you visited, where you sat or stood, and a description of the wallet or cards."},{"key":"hotel","label":"Hotel / Accommodation","title":"Ask the front desk","body_markdown":"Ask the front desk to check your room, housekeeping, and shared areas. Explain when you last had the wallet and what it looks like."},{"key":"airport","label":"Airport","title":"Check the right airport contact","body_markdown":"Note the terminal, security, immigration, gate, or aircraft details. Airport lost-and-found and the airline may handle different areas, so contact the most likely one first."},{"key":"unknown","label":"Somewhere else / Not sure","title":"Retrace your route","body_markdown":"Review recent payments, your route, and any transit or places you visited. Contact the most likely place first, then search the official lost-and-found service.","action_keys":["search_lost_found"]}]}$json$::jsonb, 20),
  ('d0b3f7f1-6c08-4b55-8e10-000000000103'::uuid, 'good_to_know', 'Cards were inside?', $md$If your wallet does not turn up, contact your card issuer and follow its current procedures. If you notice a transaction you do not recognize, contact the issuer immediately.$md$, null::jsonb, 30),
  ('d0b3f7f1-6c08-4b55-8e10-000000000104'::uuid, 'step', 'Search Korea''s official lost & found', $md$Search Police Civil Service 24, Korea''s official lost-and-found service. Recently found items may not appear immediately, so check again later if needed.$md$, null::jsonb, 40),
  ('d0b3f7f1-6c08-4b55-8e10-000000000105'::uuid, 'related_guide', 'Was your passport inside?', $md$Use the dedicated passport guide if your passport was in the wallet.$md$, null::jsonb, 50),
  ('d0b3f7f1-6c08-4b55-8e10-000000000106'::uuid, 'step', 'If you see a payment you didn''t make', $md$Report an unfamiliar transaction to your card issuer immediately. If you think the wallet was stolen, contact the police. Ordinary lost-wallet cases do not all require a police report.$md$, null::jsonb, 60),
  ('d0b3f7f1-6c08-4b55-8e10-000000000107'::uuid, 'what_you_need', 'What you''ll need', $md$Keep a note of useful details: wallet color, material, and brand; cards or IDs inside; approximate cash; time and place last seen; receipts; and trip details. Do not share full card numbers.$md$, null::jsonb, 70),
  ('d0b3f7f1-6c08-4b55-8e10-000000000108'::uuid, 'good_to_know', 'Good to know', $md$A recent loss may not appear in a central system immediately. Check again later after staff or operators have had time to turn it in.$md$, null::jsonb, 80),
  ('d0b3f7f1-6c08-4b55-8e10-000000000109'::uuid, 'fallback', 'Still need help?', $md$The 1330 Travel Helpline can help international visitors with general travel information and communication support.$md$, null::jsonb, 90)
) as seed(id, section_type, title, body_markdown, interaction_data, sort_order) where g.slug = 'lost-wallet-cards';

insert into public.problem_guide_actions (id, guide_id, section_id, action_key, action_type, label, description, href, variant, sort_order)
select seed.id, g.id, s.id, seed.action_key, seed.action_type, seed.label, seed.description, seed.href, seed.variant, seed.sort_order
from public.problem_guides g join public.problem_guide_sections s on s.guide_id = g.id join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000201'::uuid, 20, 'related_subway_guide', 'internal', 'Lost it on the subway?', 'Follow the dedicated subway lost-item guide.', '/help/guides/lost-something-on-the-subway', 'default', 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000202'::uuid, 20, 'search_lost_found', 'external', 'Search police lost & found', 'Search Korea''s official lost-and-found service.', 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201', 'primary', 20),
  ('d0b3f7f1-6c08-4b55-8e10-000000000206'::uuid, 40, 'search_lost_found_section', 'external', 'Search police lost & found', 'Search Korea''s official lost-and-found service.', 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201', 'primary', 25),
  ('d0b3f7f1-6c08-4b55-8e10-000000000203'::uuid, 50, 'related_passport_guide', 'internal', 'Lost passport guide', 'Follow dedicated next steps for a lost passport.', '/help/guides/lost-passport', 'default', 30),
  ('d0b3f7f1-6c08-4b55-8e10-000000000204'::uuid, 60, 'call_police_112', 'phone', 'Call Police 112', 'Use this if you think the wallet was stolen.', 'tel:112', 'danger', 40),
  ('d0b3f7f1-6c08-4b55-8e10-000000000205'::uuid, 90, 'call_1330', 'phone', 'Call 1330 Travel Helpline', 'Multilingual travel support for visitors.', 'tel:1330', 'default', 50)
) as seed(id, section_sort_order, action_key, action_type, label, description, href, variant, sort_order) on s.sort_order = seed.section_sort_order where g.slug = 'lost-wallet-cards';

insert into public.problem_guide_phrases (id, guide_id, context, text_en, text_ko, romanization, sort_order)
select seed.id, g.id, seed.context, seed.text_en, seed.text_ko, seed.romanization, seed.sort_order from public.problem_guides g cross join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000301'::uuid, 'General', 'I lost my wallet.', '지갑을 잃어버렸어요.', 'Jigabeul ireobeoryeosseoyo.', 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000302'::uuid, 'Last location', 'I think I left my wallet here.', '지갑을 여기 두고 간 것 같아요.', 'Jigabeul yeogi dugo gan geot gatayo.', 20),
  ('d0b3f7f1-6c08-4b55-8e10-000000000303'::uuid, 'Lost and found', 'Has a wallet been turned in?', '혹시 분실물로 들어온 지갑이 있나요?', 'Hoksi bunsilmullo deureoon jigabi innayo?', 30),
  ('d0b3f7f1-6c08-4b55-8e10-000000000304'::uuid, 'Taxi', 'I think I left my wallet in the taxi.', '택시에 지갑을 두고 내린 것 같아요.', 'Taeksie jigabeul dugo naerin geot gatayo.', 40),
  ('d0b3f7f1-6c08-4b55-8e10-000000000305'::uuid, 'Police', 'I think my wallet was stolen.', '지갑을 도난당한 것 같아요.', 'Jigabeul donandanghan geot gatayo.', 50)
) as seed(id, context, text_en, text_ko, romanization, sort_order) where g.slug = 'lost-wallet-cards';

insert into public.problem_guide_resources (id, guide_id, resource_type, platform, title, description, organization, url, language, last_checked_at, is_active, featured, sort_order)
select seed.id, g.id, seed.resource_type, seed.platform, seed.title, seed.description, seed.organization, seed.url, seed.language, now(), true, false, seed.sort_order from public.problem_guides g cross join (values
  ('d0b3f7f1-6c08-4b55-8e10-000000000401'::uuid, 'official', 'website', 'Police Civil Service 24 — Lost & Found', 'Search Korea''s official police lost-and-found service.', 'Korean National Police Agency', 'https://minwon24.police.go.kr/cvlcpt/cvlcptGdInfo.do?cvlcptId=MW-201', 'ko', 10),
  ('d0b3f7f1-6c08-4b55-8e10-000000000402'::uuid, 'official', 'website', '1330 Travel Helpline', 'Multilingual travel information and interpretation assistance for international travelers.', 'Korea Tourism Organization', 'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?vcontsId=140632', 'en', 20)
) as seed(id, resource_type, platform, title, description, organization, url, language, sort_order) where g.slug = 'lost-wallet-cards';
