Absolutely. Here is a **build-ready v1 plan** you can hand to an AI developer as the project spec.

For the stack, I recommend **Vite + React + TypeScript** for the client, with **Cloudflare Pages** for the static CSR app and **Cloudflare Workers / Pages Functions** for the API layer. That fits your CSR-first requirement well: Vite is designed for fast frontend development and static production builds, React is built for interactive component UIs, and Cloudflare Pages/Workers are meant for globally deployed static sites plus server-side logic at the edge. ([vitejs][1])

For storage, use **SQLite as the canonical relational store** and **JSON/JSONB for flexible payloads and exports**. Cloudflare D1 gives you SQLite semantics at the edge with Worker/HTTP access, R2 is the right place for raw snapshots and dataset bundles, and the Workers Cache API can keep hot query responses close to users. SQLite’s JSONB is smaller and faster than text JSON, while still working with SQLite’s JSON functions. ([Cloudflare Docs][2])

For the API documentation, build around **OpenAPI 3.1** and render it with an interactive doc UI such as **Swagger UI, Scalar, or Redoc**. OpenAPI is the standard machine-readable description for HTTP APIs, and these tools generate interactive, try-it-in-browser documentation from the spec. ([Swagger][3])

For the PWA, make the manifest explicitly support **`fullscreen`** and **`standalone`** display behavior, with `display_override` falling back from `fullscreen` to `standalone` where supported. MDN documents that `fullscreen` uses the entire browser window, while `standalone` makes the app feel like a native application. ([MDN Web Docs][4])

---

# 1) Product goal

Build a **hardware intelligence platform** that:

* ingests benchmark/spec/pricing/power data from multiple sources,
* normalizes and cross-links devices across vendors,
* computes derived metrics such as **INT8 TOPS**, **perf/$**, **perf/W**, and **density/efficiency scores**,
* exposes the data through a queryable API,
* renders interactive charts and comparisons in a mobile-first CSR web app,
* ships as an open-source dataset and API product,
* and can later power an MCP server/tool.

The key product principle is:

> **Keep raw data, normalized data, and derived data separate. Never overwrite history.**

---

# 2) Scope and dataset boundaries

## Included device classes

The dataset should support:

* CPUs
* GPUs
* SBCs
* NPUs / AI accelerators
* ASICs
* SoCs
* full systems / appliances
* cloud inference/training devices where the hardware is defined enough to compare
* optional: storage and memory subsystems as first-class categories

## Included vendors

Core:

* AMD, Intel, NVIDIA, Apple, Microsoft, Huawei, Qualcomm, IBM, AWS, Google/Alphabet, Hailo, Radxa, Coral, Groq

Expandable:

* d-Matrix, Graphcore, Mythic, Rebellions, Cerebras, Taala(s), Positron, Tenstorrent, Extropic, Vaire, OpenAI, Meta, and any others that can be normalized into the schema

## What must be tracked for each device

At minimum:

* canonical name
* aliases
* vendor
* category
* architecture / family
* launch date
* process node where available
* power envelope
* memory configuration
* raw benchmark observations
* vendor-reported AI metrics
* current and historical price
* software/firmware/runtime context for measured results
* source provenance and confidence

---

# 3) Core design principles

## A. Raw first, normalized second, derived third

Store:

1. raw source observation,
2. normalized canonical row,
3. derived metrics.

## B. Every value must be attributable

Every benchmark, spec, and price record should carry:

* source ID
* source URL
* fetch time
* publish time if known
* parser version
* confidence score
* hash of raw content

## C. Composite scores are view-specific, not universal truth

Do not collapse everything into one “winner” score only. Provide multiple views:

* CPU score
* GPU score
* AI inference score
* memory score
* storage score
* price/performance score
* power/performance score
* “general-purpose” composite score

## D. Support uncertainty

Some devices will have incomplete or conflicting data. The model must store:

* confidence
* completeness
* measurement method
* environment details
* source reliability weight

---

# 4) Recommended architecture

## Deployment topology

**Cloudflare Pages**

* static front end
* PWA assets
* docs site
* preview deployments

**Cloudflare Workers / Pages Functions**

* API endpoints
* search/filter endpoints
* query builders
* import/export jobs
* auth if needed later

**D1 / SQLite**

* canonical relational dataset
* indexes
* queryable derived tables
* source registry
* alias map
* normalized device tables

**R2**

* raw HTML/JSON snapshots
* parsed source blobs
* exported dataset bundles
* static chart artifacts
* release archives

**Browser cache**

* cached query results
* offline app shell
* saved views
* favorite comparisons

---

# 5) Canonical data model

Use a small number of stable tables, plus JSON columns where flexibility matters.

## A. `source_registry`

Tracks every source and how trustworthy it is.

Fields:

* `source_id`
* `name`
* `base_url`
* `source_type` (benchmark, vendor, retailer, news, community)
* `crawl_method`
* `refresh_interval`
* `license_note`
* `reliability_weight`
* `active`

## B. `vendor`

Fields:

* `vendor_id`
* `name`
* `website`
* `country`
* `parent_vendor_id` if needed

## C. `device_family`

A product line such as Raspberry Pi 5, Jetson Orin, Radeon RX 9070, etc.

Fields:

* `family_id`
* `vendor_id`
* `category`
* `sub_category`
* `family_name`
* `architecture`
* `first_seen`
* `status`

## D. `device_variant`

The exact product/board/model.

Fields:

* `device_id`
* `family_id`
* `model_name`
* `sku`
* `launch_date`
* `process_nm`
* `cores`
* `threads`
* `tdp_watts`
* `max_power_watts`
* `memory_type`
* `memory_capacity`
* `memory_bandwidth`
* `form_factor`
* `interface`
* `notes`

## E. `source_document`

One fetched source page/file.

Fields:

* `doc_id`
* `source_id`
* `url`
* `fetched_at`
* `published_at`
* `content_hash`
* `raw_object_key` in R2
* `parser_version`
* `parse_status`

## F. `benchmark_type`

Defines every benchmark class and sub-class.

Examples:

* CPU single-thread
* CPU multi-thread
* GPU raster
* GPU compute
* AI inference INT8
* AI inference FP16
* memory throughput
* storage throughput
* latency
* efficiency under load

Fields:

* `benchmark_type_id`
* `name`
* `category`
* `unit`
* `weight_hint`
* `normalization_method`

## G. `benchmark_result`

Actual measured or reported scores.

Fields:

* `result_id`
* `device_id`
* `benchmark_type_id`
* `source_id`
* `doc_id`
* `raw_score`
* `normalized_score`
* `sample_size`
* `test_conditions_json`
* `software_stack_json`
* `confidence`
* `observed_at`

## H. `spec_snapshot`

Vendor/spec data.

Fields:

* `snapshot_id`
* `device_id`
* `source_id`
* `doc_id`
* `int8_tops`
* `fp16_tflops`
* `fp32_tflops`
* `tdp_watts`
* `idle_watts`
* `boost_watts`
* `memory_bw`
* `bandwidth_unit`
* `other_specs_json`

## I. `price_snapshot`

Fields:

* `price_id`
* `device_id`
* `source_id`
* `price_usd`
* `condition`
* `region`
* `merchant`
* `observed_at`

## J. `derived_metric`

Fields:

* `metric_id`
* `device_id`
* `metric_name`
* `metric_value`
* `formula_version`
* `inputs_json`
* `confidence`
* `computed_at`

## K. `alias_map`

Critical for dedupe and linking.

Fields:

* `alias`
* `entity_type`
* `entity_id`
* `source_id`
* `confidence`

---

# 6) Normalization strategy

## Keep raw values intact

Example:

* raw vendor TOPS
* measured benchmark score
* raw source price
* raw power figure

Do not overwrite these.

## Normalize inside classes first

Normalize within each benchmark family before cross-comparing.

Examples:

* PassMark CPU score → CPU percentile within the dataset
* Geekbench multi-core → normalized CPU performance
* TechPowerUp GPU relative chart → GPU class percentile
* storage benchmarks → storage class percentile

## Then compute category scores

Suggested category scores:

* `cpu_score`
* `gpu_score`
* `ai_score`
* `memory_score`
* `storage_score`
* `efficiency_score`
* `value_score`

## Then compute composite views

Provide multiple composites:

* `general_compute_score`
* `ai_inference_score`
* `desktop_efficiency_score`
* `edge_ai_score`
* `best_bang_for_buck_score`

---

# 7) INT8 TOPS normalization approach

This needs to be treated as a **modeled metric**, not a universal truth.

## Store three separate fields

* `vendor_reported_int8_tops`
* `measured_int8_tops` if a source or benchmark truly measures it
* `effective_int8_tops_modelled`

## Suggested model

`effective_int8_tops_modelled = vendor_reported_int8_tops × calibration_factor × workload_factor × memory_factor × runtime_factor`

Where:

* `calibration_factor` is derived from empirical data,
* `workload_factor` depends on real-world inference patterns,
* `memory_factor` penalizes narrow bandwidth bottlenecks,
* `runtime_factor` reflects software stack maturity.

## Important rule

If the device does not have a real measured INT8 benchmark, mark the estimate as:

* `estimated = true`
* `confidence = lower`
* `method = modelled`

That keeps the dataset honest.

---

# 8) API design

Build the API as read-heavy, filterable, and export-friendly.

## Core endpoints

* `GET /v1/devices`
* `GET /v1/devices/:id`
* `GET /v1/vendors`
* `GET /v1/families`
* `GET /v1/benchmarks`
* `GET /v1/metrics`
* `GET /v1/compare?ids=...`
* `GET /v1/search?q=...`
* `GET /v1/sources`
* `GET /v1/charts/:chartType`
* `GET /v1/exports?format=json|jsonb|sqlite|ndjson`
* `GET /v1/lineage/:id`
* `GET /v1/saved-views/:id`

## Query features

Support:

* filtering
* sorting
* pagination
* column selection
* grouping
* tag filtering
* date ranges
* vendor family filters
* confidence thresholds
* measurement-source filters
* power range filters
* price range filters
* architecture filters
* compare sets

## Search behavior

Support both:

* exact canonical ID lookup
* fuzzy alias search
* vendor/model partial search
* typo-tolerant search

---

# 9) Documentation plan

## A. Interactive API docs

Use:

* OpenAPI 3.1 spec
* Swagger UI / Scalar / Redoc-generated interface

Include:

* endpoint descriptions
* request/response examples
* filter parameter examples
* error codes
* auth notes
* rate limits
* pagination rules
* export examples

## B. User documentation

Create a separate docs area with:

* getting started
* how the dataset is structured
* how normalization works
* what INT8 TOPS means in this project
* how to read charts
* how to use filters and saved views
* how provenance/confidence works
* how to cite the dataset
* FAQ
* contribution guide
* source policy
* release notes

## C. Developer documentation

Include:

* architecture overview
* database schema
* ingestion pipeline
* parser/plugin contract
* normalization contract
* API contract
* chart data contract
* local dev setup
* deployment instructions
* test strategy

---

# 10) Frontend plan

The app should be a **CSR-first analytics console**, not a typical content site.

## Main UX modules

### 1. Global search bar

Search by:

* product name
* alias
* vendor
* benchmark
* family
* keyword

### 2. Faceted filter panel

Filters should be persistent and combinable:

* vendor
* category
* subcategory
* architecture
* release year
* process node
* power
* price
* benchmark source
* confidence
* availability status
* board/system form factor

### 3. Comparison workspace

Let users:

* pin devices
* compare 2 to N devices
* lock columns
* hide/show metrics
* reorder metrics
* save compare sets
* share compare URLs

### 4. Device profile pages

Each profile should show:

* summary card
* key specs
* benchmark history
* price history
* power data
* source lineage
* derived scores
* similar devices
* cross-links to families/vendors

### 5. Saved views

Allow users to save:

* filtered datasets
* chart configurations
* compare sets
* custom column layouts
* dashboard presets

Local storage is fine for personal saves; server-backed saved views can come later.

---

# 11) Chart, graph, and infographic plan

These should all use the same normalized data feeds so they stay consistent.

| Visualization        | Purpose                            | Needed data              | Interaction         |
| -------------------- | ---------------------------------- | ------------------------ | ------------------- |
| Sortable leaderboard | Best-in-class ranking              | derived metric + filters | search, pin, export |
| Scatter plot         | Perf vs power or perf vs price     | two metrics + vendor     | hover, zoom, lasso  |
| Bubble chart         | Perf/$ vs perf/W vs TOPS           | three metrics            | compare, highlight  |
| Slopegraph           | Improvement over generations       | release date + score     | vendor toggle       |
| Line chart           | Trend over time                    | metric history           | time range          |
| Heatmap              | Vendor/category dominance          | vendor, year, score      | drill-down          |
| Pareto frontier      | Efficiency frontier                | price, power, score      | filter bands        |
| Box/violin chart     | Distribution of benchmark families | benchmark samples        | source toggle       |
| Treemap              | Market share by class              | category and counts      | hover details       |
| Sankey               | Vendor → family → category         | lineage graph            | zoom/drill          |

## Infographics to generate

* “Best bang for buck under $X”
* “Best perf/W under Y watts”
* “Dominance over time by vendor”
* “Benchmark source comparison”
* “AI accelerator landscape by efficiency tier”
* “SBC ranking by power envelope”

## Rules for charts

* never hide raw source score
* always show the normalization basis
* always expose date and source on hover
* always allow “confidence” overlay
* always allow a raw-vs-normalized toggle

---

# 12) Release and storage strategy

## Internal working format

* SQLite database
* JSON/JSONB snapshots
* R2 raw payload archive

## Public release format

* versioned SQLite bundle
* JSON/JSONB export bundle
* optional NDJSON for streaming
* changelog and schema versioning

## Versioning

Use semantic versioning for:

* schema
* normalization logic
* API
* dataset releases

Example:

* `schema v1.0`
* `normalizer v1.0`
* `dataset 2026.03.28`

---

# 13) Maintenance plan

## Automated jobs

* daily source refresh for fast-changing fields
* weekly vendor/spec review
* monthly alias cleanup
* monthly normalization recalibration
* release snapshots on cadence

## Quality gates

* parse success rate
* duplicate detection
* source drift detection
* schema validation
* benchmark outlier detection
* confidence threshold alerts

## Human review queue

Flag:

* ambiguous aliases
* conflicting benchmark numbers
* weird power claims
* missing date fields
* suspicious price spikes
* source changes

---

# 14) Legal and provenance guardrails

This project should maintain a **source rights matrix** before public redistribution.

For every source, record:

* crawl permission status
* redistribution status
* attribution requirement
* rate limits / robots notes
* storage policy
* public export policy

Do not assume every scraped field can be republished unchanged. Keep the raw ingest private if necessary, and publish only what is safe to redistribute.

---

# 15) Phased implementation plan

## Phase 0 — Foundations

**Goal:** lock the ontology and rules.

**Deliverables**

* source registry
* vendor taxonomy
* device taxonomy
* benchmark taxonomy
* source rights matrix
* normalization rules v1
* schema v1
* confidence model v1

**Dependencies**

* none

---

## Phase 1 — Raw ingestion and archival

**Goal:** capture source material safely and reproducibly.

**Deliverables**

* fetcher framework
* parser plugins
* raw snapshot storage to R2
* `source_document` table
* canonical hash generation
* dedupe logic
* parse logs

**Dependencies**

* phase 0 schema and source registry

---

## Phase 2 — Canonical model and linking

**Goal:** transform raw observations into canonical records.

**Deliverables**

* alias resolution
* device matching
* family linking
* normalized benchmark tables
* price history tables
* spec snapshot tables
* provenance links on every row

**Dependencies**

* phase 1 data capture

---

## Phase 3 — Derived metrics and scoring

**Goal:** generate the comparison metrics.

**Deliverables**

* benchmark normalization
* composite scoring
* perf/$ and perf/W
* effective INT8 TOPS model
* confidence-weighted metrics
* recalculation jobs

**Dependencies**

* phase 2 canonical records

---

## Phase 4 — API and interactive docs

**Goal:** expose the data cleanly.

**Deliverables**

* REST API
* OpenAPI spec
* interactive docs
* examples
* export endpoints
* error handling
* pagination/filter contracts

**Dependencies**

* phase 3 metric outputs

---

## Phase 5 — CSR web app

**Goal:** make the dataset usable.

**Deliverables**

* app shell
* search
* filters
* compare views
* device pages
* saved views
* responsive mobile UI
* PWA installability

**Dependencies**

* phase 4 API
* phase 2/3 data

---

## Phase 6 — Visualization engine

**Goal:** make the analysis compelling.

**Deliverables**

* chart component library
* dashboard pages
* trend visuals
* comparison visuals
* infographics
* exportable chart images/data

**Dependencies**

* phase 3 derived metrics
* phase 5 app shell

---

## Phase 7 — Maintenance, releases, and ecosystem

**Goal:** keep it alive and useful.

**Deliverables**

* scheduled refresh jobs
* release pipeline
* changelog generator
* data QA dashboards
* MCP server/tool
* SDK snippets
* contributor workflow

**Dependencies**

* all prior phases

---

# 16) Suggested build order for the AI

Tell the coding agent to build in this sequence:

1. Define the schema and source registry.
2. Build raw snapshot ingestion into R2.
3. Build normalization and alias resolution.
4. Build derived metrics, especially perf/W and cost/perf.
5. Generate OpenAPI spec and API routes.
6. Build the CSR app shell and search/filter UI.
7. Add comparison pages and saved views.
8. Add charts and dashboard pages.
9. Add PWA manifest, offline caching, and install flow.
10. Add docs site and contributor docs.
11. Add release tooling, tests, and CI.
12. Add MCP server/tool after the API is stable.

---

# 17) What success looks like

A successful v1 should let a user:

* search any device by name or alias,
* filter a large multi-vendor dataset instantly,
* compare hardware across categories,
* see raw vs normalized vs derived values,
* inspect source lineage,
* export data in JSON/SQLite,
* browse the data on mobile like an app,
* and trust the numbers because confidence and provenance are visible.

---

# 18) Best next implementation artifact

The next thing to generate is a **repo-ready specification** with:

* exact folder structure
* SQL schema files
* JSON schema files
* OpenAPI spec skeleton
* route definitions
* parser/plugin interface
* normalization formula file
* chart component inventory
* release checklist

That turns this plan into something an AI coding agent can execute with minimal ambiguity.

[1]: https://vite.dev/?utm_source=chatgpt.com "Vite | Next Generation Frontend Tooling"
[2]: https://developers.cloudflare.com/d1/?utm_source=chatgpt.com "Overview · Cloudflare D1 docs"
[3]: https://swagger.io/specification/?utm_source=chatgpt.com "OpenAPI Specification - Version 3.1.0"
[4]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display?utm_source=chatgpt.com "display - Web app manifest | MDN"
