# Locorea Development Guidelines

## 1. Project Overview

Locorea is a search-first Korea travel data and knowledge portal
for international visitors.

The product focuses on helping travelers discover Korea through:

- Places
- Routes
- Food
- Themes
- Practical travel guides
- Events
- Travel essentials
- First-time visitor guidance
- Emergency and help information

Core user flow:

Home
→ Search
→ Search Results
→ Place / Route / Guide Detail

Locorea should feel like:

Modern travel editorial
+
Trusted Korea travel knowledge portal
+
Simple consumer product

The search experience is the most important part of the product.


## 2. Current Technology Stack

Frontend:

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS 4
- lucide-vue-next

Backend / Data:

- Supabase
- PostgreSQL
- PostGIS

Deployment target:

- Vercel

Package manager:

- pnpm

Do not introduce another package manager.

Use:

pnpm install
pnpm add
pnpm dev
pnpm build

Do not use npm or yarn unless explicitly requested.


## 3. Project Structure

Important directories:

app/
  components/
    home/
    layout/
  composables/
  pages/
  types/

supabase/
  migrations/
  seed.sql

Important files:

app/composables/useSupabase.ts
app/composables/useHomeData.ts
app/composables/useSearch.ts

app/types/database.types.ts

nuxt.config.ts


## 4. Data Architecture

PostgreSQL is the single source of truth.

Content can eventually enter the system through:

1. Admin UI
2. SQL imports
3. CSV / JSON import scripts
4. Public-data ingestion pipelines

Do not use Nuxt Content or Markdown files as the primary
content database.

Database changes must use Supabase migrations.

Do not manually change the production database schema.


## 5. Current Core Entities

The current main entities are:

- Region
- City
- Area
- Source
- Place
- Route
- Guide
- Tag

Translation tables are used for multilingual content.

Examples:

place_translations
route_translations
guide_translations
region_translations
city_translations
area_translations
tag_translations


## 6. Multilingual Strategy

English is the initial service language.

The database must remain multilingual from the beginning.

Do not create language-specific fields such as:

name_en
name_ko
name_ja

Use translation tables instead.

Current frontend behavior may select:

language_code === 'en'

until a full i18n layer is introduced.


## 7. Place Modeling

Restaurants are currently modeled as:

places.place_type = 'restaurant'

Do not create a separate restaurant table unless there is a
clear need for restaurant-specific fields.

Future specialized data may use extension tables such as:

restaurant_details

Do not change this architecture without discussion.


## 8. Data Trust and Editorial Reliability

Locorea should behave more like a trusted travel data portal
than a typical travel blog.

Important fields include:

- source_id
- status
- last_verified_at

Only published content should be exposed publicly.

Public queries should normally include:

.eq('status', 'published')

Where relevant, show:

- Source
- Last verified date
- Official link


## 9. Supabase Rules

Use the existing Supabase client:

app/composables/useSupabase.ts

Do not create new Supabase clients in random components.

Respect existing Row Level Security policies.

Never expose:

- service_role key
- database password
- private credentials

Only public/publishable credentials may be exposed through
Nuxt public runtime configuration.

Do not change database migrations during UI-only tasks.


## 10. Vue / Nuxt Coding Rules

Always use:

<script setup lang="ts">

Use:

- Composition API
- TypeScript
- computed
- ref
- useAsyncData
- composables

Avoid:

- Options API
- unnecessary watchers
- unnecessary abstractions
- duplicated data-fetching logic
- excessive use of any

Prefer small reusable components when they improve clarity.

Do not split trivial markup into unnecessary components.


## 11. Nuxt Component Naming

Nuxt auto-imports components using directory prefixes.

This is important.

Examples:

app/components/home/HeroSearch.vue
→ <HomeHeroSearch />

app/components/home/ExploreTypes.vue
→ <HomeExploreTypes />

app/components/home/PopularNow.vue
→ <HomePopularNow />

app/components/home/TravelEssentials.vue
→ <HomeTravelEssentials />

app/components/home/FirstTimeKorea.vue
→ <HomeFirstTimeKorea />

app/components/home/DiscoverThemes.vue
→ <HomeDiscoverThemes />

app/components/home/NeedHelp.vue
→ <HomeNeedHelp />

app/components/layout/AppHeader.vue
→ <LayoutAppHeader />

app/components/layout/AppFooter.vue
→ <LayoutAppFooter />

Do not use unprefixed names for components inside
subdirectories.

For example:

Wrong:

<AppHeader />
<HeroSearch />
<ExploreTypes />

Correct:

<LayoutAppHeader />
<HomeHeroSearch />
<HomeExploreTypes />

If uncertain about the generated auto-import name, check:

grep -R "ComponentName" .nuxt/components.d.ts

Do not modify Nuxt component auto-import configuration
just to remove these prefixes.


## 12. Home Page Architecture

The approved Home v2 structure is:

Header
→ Hero Search
→ Explore by Type
→ Popular Right Now
→ Korea Travel Essentials
→ First Time in Korea
→ Discover Korea by Theme
→ Need Help in Korea
→ Footer

Current intended components:

app/components/layout/AppHeader.vue
app/components/layout/AppFooter.vue

app/components/home/HeroSearch.vue
app/components/home/ExploreTypes.vue
app/components/home/PopularNow.vue
app/components/home/TravelEssentials.vue
app/components/home/FirstTimeKorea.vue
app/components/home/DiscoverThemes.vue
app/components/home/NeedHelp.vue

Home data retrieval should stay centralized in:

app/composables/useHomeData.ts

Do not duplicate Supabase queries inside multiple Home components.


## 13. Search Architecture

Locorea search currently covers:

- Places
- Routes
- Guides

Search route:

/search?q=keyword

Current result types:

- place
- route
- guide

Current first-stage search may use simple text filtering.

Do not introduce AI search prematurely.

Future improvements may use:

- PostgreSQL Full Text Search
- pg_trgm
- ranking
- tags
- intent parsing

Structured search should come before AI-assisted search.


## 14. Detail Pages

Current detail routes include:

/places/[slug]
/routes/[slug]
/guides/[slug]

Detail pages should:

- use existing Supabase composables
- fetch published content only
- select English translation for now
- show source where available
- show last_verified_at where useful
- provide proper 404 behavior
- remain mobile responsive


## 15. URL Strategy

Current MVP routes may use simple slug URLs:

/places/[slug]
/routes/[slug]
/guides/[slug]

Do not redesign URL architecture during unrelated tasks.

Future location-aware routes may be introduced later, such as:

/places/seoul/seongsu/...

Future API examples may include:

/api/v1/places/:id
/api/v1/routes
/api/v1/guides


## 16. Design Principles

Locorea design should be:

- Minimal
- Clean
- Search-first
- Mobile-first
- Responsive
- Trustworthy
- Travel-oriented
- Editorial
- Lightweight

Use:

- strong typography
- white and light neutral backgrounds
- subtle blue brand accents
- restrained shadows
- soft borders
- selective rounded corners
- compact but comfortable spacing

Avoid:

- dashboard-heavy appearance
- excessive gradients
- excessive borders
- oversized whitespace
- too many colors
- overly playful UI
- unnecessarily large cards
- overly dense admin-like layouts

Photography should eventually provide most of the visual richness.


## 17. Responsive Rules

Always consider at least:

- 1440px desktop
- 1024px tablet
- 390px mobile

Do not simply convert every desktop row into a long vertical stack.

Horizontal scrolling is preferred where appropriate for:

- Popular Right Now
- First Time in Korea
- Discover by Theme

Mobile pages should avoid excessive vertical whitespace.

Touch targets must remain usable.


## 18. Home Hero Rules

The main headline is:

Explore Korea
with confidence.

Supporting copy:

Find places, routes, food and practical travel help
for your Korea trip.

Search placeholder:

What do you want to know about Korea?

Example query chips may include:

- Seongsu cafe
- T-money card
- 3 days in Busan
- SIM card
- Seoul subway

Search must navigate to:

/search?q=...


## 19. Explore by Type

Current types:

- Places
- Routes
- Food
- Themes
- Guides
- Events
- Nearby

Use Lucide icons.

Do not invent fake statistics.

Keep cards compact.


## 20. Popular Right Now

Use real published Place and Guide data.

Do not invent popularity metrics.

Do not invent image URLs.

Until real images exist, use tasteful placeholders.

Cards may include:

- visual area
- type badge
- title
- short summary
- subtle metadata


## 21. Korea Travel Essentials

Use existing featured Guide data.

Current examples include:

- How to Use the Seoul Subway
- T-money vs Climate Card
- SIM vs eSIM in Korea
- Using Maps in Korea
- Paying in Korea

These cards should feel like practical utility content,
not the same visual style as destination cards.


## 22. First Time in Korea

Current journey:

1. Arrive at Incheon Airport
2. Get Internet
3. Get a Transport Card
4. Airport → Seoul
5. Check in to Your Hotel
6. Get Around

This section may use static configuration data for now.

Existing guide links should be reused where available.

Do not create fake guide pages just to satisfy this section.


## 23. Discover Korea by Theme

Current theme examples:

- K-pop
- Cafes
- Shopping
- Nature
- History
- Family
- Festivals

Until real images exist, use restrained visual placeholders.

Search links may point to:

/search?q=...


## 24. Need Help in Korea

Examples:

- Emergency
- Medical
- Lost & Found
- Travel Help
- Travel Etiquette

The UI should feel trustworthy and practical.

Do not make the section visually alarming.


## 25. Image Strategy

Do not hardcode random external image URLs.

Do not introduce a new image service without discussion.

Future direction:

Supabase Storage
+
media metadata
+
cover image association

Until that system is implemented:

Use neutral visual placeholders.


## 26. Admin Strategy

Admin will eventually live in the same Nuxt project.

Planned structure:

/admin
/admin/places
/admin/routes
/admin/guides

Do not create a separate admin application unless explicitly requested.

Supabase Auth will eventually protect admin pages.


## 27. Monetization Architecture

Future monetization may include:

- display ads
- affiliate links
- sponsored listings
- lead generation
- local business premium profiles
- API subscriptions
- data licensing
- embeddable widgets
- B2B / B2G services

Do not implement monetization tables during unrelated MVP tasks.

Organic recommendations and sponsored content must remain separate.

Sponsored content must be clearly labeled.


## 28. Accessibility

Maintain:

- semantic heading order
- keyboard-accessible links and buttons
- reasonable contrast
- visible focus behavior
- readable text sizes
- usable touch targets

Do not sacrifice accessibility for visual styling.


## 29. Performance

Prefer:

- simple Vue components
- server-side rendering
- efficient Supabase queries
- limited dependencies
- lightweight UI

Avoid:

- large client-side libraries
- unnecessary animation packages
- duplicated API calls
- loading entire datasets unnecessarily


## 30. Development Workflow

Before editing:

1. Read this AGENTS.md.
2. Inspect relevant existing files.
3. Understand current architecture.
4. Do not assume component auto-import names.
5. Do not change unrelated files.

During implementation:

1. Preserve working behavior.
2. Make focused changes.
3. Avoid unnecessary dependencies.
4. Keep DB access centralized where possible.
5. Preserve responsive behavior.

After implementation:

Run:

pnpm nuxt typecheck

Then:

pnpm build

If relevant, verify:

/
 /search?q=Seongsu
 /places/seoul-forest
 /routes/perfect-5-hours-in-seongsu
 /guides/t-money-vs-climate-card

For Home changes also verify around:

- 1440px
- 1024px
- 390px


## 31. Git Rules

Do not commit generated or local-only files unless appropriate.

Do not commit:

.env
.nuxt
.output
node_modules

Use focused commits.

Examples:

feat: add Locorea search
feat: add place detail page
fix: use Nuxt component directory prefixes
refactor: simplify Home components
docs: update Codex development rules


## 32. Important Current Constraints

This is a solo-developed project.

Prefer:

- simple architecture
- low operational overhead
- low cost
- maintainable code
- incremental development

Avoid premature enterprise complexity.

Do not introduce:

- microservices
- Kubernetes
- separate backend services
- complex queues
- unnecessary infrastructure

unless explicitly required later.


## 33. Current Development Priority

Current priority order:

1. Complete polished Home v2
2. Add image/media system
3. Improve Place / Route / Guide detail UI
4. Improve structured search
5. Add content management/admin
6. Expand real travel data
7. Add multilingual frontend
8. Add monetization infrastructure later

Do not jump ahead without a clear reason.


## 34. Task Completion Report

After completing a Codex task, report:

- files modified
- files created
- significant implementation decisions
- assumptions made
- typecheck result
- build result
- any remaining issues

Do not silently make major architectural changes.