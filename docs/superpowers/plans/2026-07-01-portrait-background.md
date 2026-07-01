# Portrait Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split character thumbnail avatars from full portrait artwork and add an optional portrait background in the detail card.

**Architecture:** Extend character data with optional `portrait`, keep `avatar` for small calendar thumbnails, and add one persisted display toggle. The fetch script maps ZZZ nanoka art to `portrait` and derives HoneyHunter thumbnails for `avatar`.

**Tech Stack:** Node ESM fetch script, React/TypeScript, CSS, built-in `node:test`.

---

### Task 1: Data Contract Tests
- [ ] Add tests proving ZZZ nanoka records use HoneyHunter `*_icon_100.webp` for `avatar` and nanoka `IconRole*.webp` for `portrait`.
- [ ] Add tests proving merge helpers preserve and upgrade `portrait`.

### Task 2: Fetch/Data Implementation
- [ ] Add `portrait?: string` to `Character`.
- [ ] Export and update source normalizers in `scripts/fetch-characters.js`.
- [ ] Regenerate `src/data/characters.json` and `public/data/characters.json`.

### Task 3: UI Toggle and Modal
- [ ] Add a persisted `portraitBackgroundEnabled` setting.
- [ ] Add a display toggle in `Header`.
- [ ] Use `character.portrait` as modal background only when enabled.
- [ ] Add CSS overlay/readability treatment.

### Task 4: Verify and Publish
- [ ] Run `npm.cmd test`.
- [ ] Run `node scripts\\fetch-characters.js`.
- [ ] Run `npm.cmd run build`.
- [ ] Deploy updated data/assets to GitHub Pages.
