# Multi-Source Character Sync Design

## Goal
Make character sync stable and improve avatar coverage by using multiple external sources with graceful fallback.

## Source Priority
1. nanoka static JSON for Genshin, Star Rail, and ZZZ structured data and avatars.
2. BWIKI for birthdays and Honkai Impact 3rd coverage, with avatar probing isolated from list parsing.
3. HoneyHunter HTML lists for supplemental names, avatars, rarity, elements, and paths when other sources miss data.
4. Existing repository JSON as the final fallback so failed syncs never delete or downgrade data.

## Data Flow
Each source runs independently and returns normalized `Character` records plus warnings. The merge layer deduplicates by `game + normalized name/nameEn`, upgrades placeholder avatars, fills missing birthdays and metadata, and preserves existing manual records unless a fetched value is clearly better.

## Failure Handling
Network/API failures are source-scoped. A failed source logs a warning and the sync continues. If all sources fail, the script writes the existing data back unchanged and exits successfully so scheduled jobs do not churn or clear data.

## Automation
GitHub Actions needs `contents: write` permission and should only commit when JSON files actually changed.