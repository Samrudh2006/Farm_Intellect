# Dataset References and Citations

## Overview

Farm Intellect uses curated, code-versioned agricultural datasets stored in `src/data/`. These datasets power advisory, analytics, scanner, and planning workflows.

## Dataset inventory

### `cropDiseases.ts`
- Scope: crop diseases, symptoms, treatments, prevention
- Source note in file: **PlantVillage Dataset (54,000+ images, 38 diseases)**
- Used in: chatbot, crop scanner

### `cropRecommendations.ts`
- Scope: crop suitability using N, P, K, temperature, humidity, pH, rainfall
- Source note in file: **Kaggle Crop Recommendation Dataset**
- Used in: crop recommendation engine

### `cropProduction.ts`
- Scope: national/state/district production statistics and MSP-oriented analytics
- Source note in file: **Data.gov.in, Directorate of Economics & Statistics (DES), Ministry of Agriculture**
- Used in: enhanced analytics

### `mandiPrices.ts`
- Scope: commodity prices, mandi trends, MSP comparison
- Source note in file: **AGMARKNET, eNAM portal, APMC market data**
- Used in: analytics, market intelligence

### `kisanCallCenter.ts`
- Scope: bilingual expert Q&A / support knowledge
- Source note in file: **AIKosh/IndiaAI, Kisan Call Centre (1800-180-1551), ICAR farmer helplines**
- Used in: SmartChatbot

### `satelliteData.ts`
- Scope: NDVI, EVI, NDWI/LSWI thresholds and crop stage profiles
- Source note in file: **ISRO/NRSC Bhuvan, ESA Sentinel-2, USGS Landsat-8, MODIS Terra/Aqua**
- Used in: FieldMap and remote sensing guidance

### `soilHealth.ts`
- Scope: Soil Health Card parameters, soil types, fertilizer recommendations
- Source note in file: **ICAR Soil Health Card scheme, IISS Bhopal norms, NBSS&LUP soil maps**
- Used in: crop recommendation engine

### `pestData.ts`
- Scope: pests, identification, lifecycle, IPM strategies
- Source note in file: **NCIPM, ICAR crop protection manuals**
- Used in: crop scanner and advisory context

### `cropCalendar.ts`
- Scope: sowing/harvest windows and advisory schedules
- Source note in file: **ICAR-CRIDA AICRPAM Bulletin**
- Used in: crop calendar page

## Citation guidance

When presenting or publishing the project, cite both:

1. the original public/reference data source
2. the internal curated dataset file used by the app

Example:

> Crop disease recommendations in the scanner are based on curated references from the PlantVillage dataset and internal mappings in `src/data/cropDiseases.ts`.

## Data quality notes

- these are curated application datasets, not live synchronized feeds
- freshness varies by source domain
- some values are reference-grade rather than transaction-grade
- production use should include source refresh metadata and versioning

## Recommended next upgrades

- add `version`, `lastUpdated`, and `sourceUrl` to every dataset export
- automate refresh for weather and mandi-linked datasets
- add regional language labels and pronunciation metadata
- add confidence/freshness/source attribution in UI cards
