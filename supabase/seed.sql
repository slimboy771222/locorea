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
            127.0568,
            37.5446
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

    'Seongsu-dong, Seongdong-gu, Seoul',

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
