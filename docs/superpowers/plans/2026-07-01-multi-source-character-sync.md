# Multi-Source Character Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a stable multi-source character data sync with better avatar coverage and safe fallbacks.

**Architecture:** Keep the sync as a Node script, but split it into source adapters, normalizers, merge helpers, and a main orchestration path. External sources fail independently and existing JSON remains the final fallback.

**Tech Stack:** Node 20 ESM, built-in `node:test`, GitHub Actions, Vite/React static JSON output.

---

### Task 1: Add Regression Tests

**Files:**
- Modify: `package.json`
- Create: `test/fetch-characters.test.js`

- [ ] Add `"test": "node --test"` to package scripts.
- [ ] Test BWIKI wikitext parsing for birthday and profile fields.
- [ ] Test image candidate extraction and ordering.
- [ ] Test merge behavior upgrades placeholder avatars while preserving existing/manual records.
- [ ] Run `npm.cmd test` and verify the tests fail because helpers are not exported yet.

### Task 2: Refactor Sync Helpers

**Files:**
- Modify: `scripts/fetch-characters.js`

- [ ] Export pure helpers used by tests: parser, image candidate extractor, image candidate builder, merge helpers, source normalizers.
- [ ] Guard `main()` behind direct script execution so importing the file does not run network sync.
- [ ] Run `npm.cmd test` and verify helper tests pass.

### Task 3: Add Multi-Source Adapters

**Files:**
- Modify: `scripts/fetch-characters.js`

- [ ] Add nanoka adapter for `gi`, `hsr`, and `zzz` static JSON discovered from subdomain HTML.
- [ ] Add BWIKI adapter with bounded page processing and isolated avatar lookup.
- [ ] Add HoneyHunter adapter for list-page avatar/basic metadata supplements.
- [ ] Make each adapter return an empty array plus warnings on failure, never throw through the whole sync.

### Task 4: Fix Automation

**Files:**
- Modify: `.github/workflows/sync-characters.yml`

- [ ] Add `permissions: contents: write`.
- [ ] Keep change detection and commit only when JSON changed.

### Task 5: Verify

**Files:**
- Generated: `src/data/characters.json`
- Generated: `public/data/characters.json`

- [ ] Run `npm.cmd test`.
- [ ] Run `node scripts\fetch-characters.js` with network access.
- [ ] Run `npm.cmd run build`.
- [ ] Inspect summary for total characters, avatar coverage, and source warnings.