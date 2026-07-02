# Character Search And ICS Reminder Design

## Context

The site is a static React app deployed to GitHub Pages. Character data is bundled in `src/data/characters.json` and loaded through `useCharacters`. User edits and preferences are stored in browser `localStorage`. There is no backend, account system, database, or secret storage.

The next feature scope is intentionally limited to:

1. Character search with rich candidates.
2. ICS export/subscription as the reminder MVP.

Email push, Web Push, cookies, accounts, favorites, cross-device storage, and server-side subscription management are not part of this implementation scope.

## Goals

- Let users quickly find a character by typing known fields.
- Show enough candidate information for users to confirm the intended character before opening it.
- Let users generate calendar reminder data using the standard iCalendar format.
- Keep the implementation compatible with GitHub Pages and the current static deployment model.
- Avoid cookies and backend storage for this phase.

## Non-Goals

- No account login or user identity system.
- No cross-device storage or synchronization.
- No email reminder delivery.
- No Web Push reminder delivery.
- No server-side per-user ICS feed in this phase.
- No fuzzy pinyin search unless added in a later phase.

## Cross-Device Storage Decision

Cross-device storage requires a stable user identity and a backend store. Cookies alone are not sufficient because they only identify one browser on one device and can be cleared. They also do not solve server-side reminder scheduling.

Practical options:

- Local-only storage: `localStorage`; easiest, works on GitHub Pages, does not sync across devices.
- Portable export/import: export favorites or reminder selections as a file or encoded URL; no backend, but manual.
- Backend identity: magic-link email login, OAuth, or passkey plus a database; required for automatic cross-device sync.
- Email subscription identity: verified email address plus server-side subscription records; sufficient for email reminders but still needs backend storage and unsubscribe handling.

Final decision: do not implement cross-device storage for this project phase. Do not add cookies, account login, or backend identity as part of the search and ICS reminder work. For reminder portability, rely on the user's calendar app: once an ICS file is imported into iCloud, Google Calendar, Outlook, or another calendar provider, that provider handles cross-device sync.

## Character Search Design

Add a search surface near the top of the app, preferably inside or directly below the compact header controls. It should not reintroduce the crowded header problem fixed by the filter sidebar work.

Search behavior:

- Search against `allCharacters`, not only currently filtered calendar characters.
- Match normalized text from:
  - `name`
  - `nameEn`
  - game display name and game id
  - birthday in `MM-DD` form
  - element / attribute
  - weapon / path / specialty
  - region / faction
- Trim and lowercase input for matching.
- Start showing candidates after one non-space character.
- Limit visible candidates to a small list, such as 8 results.
- Prefer exact prefix/name matches ahead of secondary-field matches.

Candidate display:

- Avatar thumbnail or fallback initial.
- Chinese name and English name.
- Game badge.
- Birthday.
- Compact metadata row: element, weapon/path/specialty, region/faction when present.
- Optional visual marker for why it matched can be deferred.

Selection behavior:

- Clicking or pressing Enter on a highlighted candidate opens the existing `CharacterModal`.
- After selection, calendar should navigate to that character's birthday month so the user can see calendar context.
- Search input can retain the query or clear it; recommended: clear after selection to return the app to browsing state.

Keyboard/accessibility:

- Arrow up/down moves active candidate.
- Enter opens active candidate.
- Escape closes suggestions.
- Use combobox/listbox semantics where practical.

Suggested components/utilities:

- `CharacterSearch` component for UI and keyboard behavior.
- `src/utils/characterSearch.ts` for pure search/ranking functions.
- Tests for matching, ranking, result limit, and metadata inclusion.

## ICS Reminder MVP Design

Use iCalendar generation in the browser. No backend is required for the MVP.

Supported outputs:

- Download an `.ics` file containing annual birthday events.
- Optionally generate separate outputs for:
  - all characters
  - currently selected games/filters
  - a selected character from the detail modal

Recommended first version:

- Add an export action named `导出日历` or `生日提醒`.
- Generate a single `.ics` file for all current characters with valid birthdays.
- Each event repeats yearly with `RRULE:FREQ=YEARLY`.
- Event title: `{角色名}生日 - {游戏名}`.
- Event description: include English name and metadata fields.
- Use all-day events by default.

Reminder alarms:

- Include `VALARM` entries only if we choose a fixed default. Recommended default:
  - one reminder one day before at 09:00 is not directly expressible as a timezone-aware all-day alarm without more choices.
  - simpler MVP: all-day recurring event without embedded alarm, letting the user's calendar app manage notifications.

Subscription vs export:

- Static downloadable `.ics` is easy and reliable.
- A static all-character subscription feed can be published as `public/data/birthdays.ics`, but it is the same for everyone.
- A personalized subscription URL requires a backend because GitHub Pages cannot generate per-user feeds.

Recommendation: implement downloadable ICS first. Add a static all-character feed only if users specifically want calendar subscription instead of download/import.

Suggested utilities:

- `src/utils/ics.ts` with pure functions:
  - `escapeIcsText(value)`
  - `birthdayToIcsDate(birthday, year)`
  - `buildBirthdayIcs(characters, options)`
- `downloadTextFile(filename, content, mimeType)` helper or local component logic.

## Data Flow

Search:

`useCharacters().allCharacters` -> `searchCharacters(query, allCharacters)` -> `CharacterSearch` candidates -> select candidate -> `App` sets selected character and calendar date.

ICS:

`useCharacters().allCharacters` or filtered character set -> `buildBirthdayIcs` -> Blob download.

Both features should avoid mutating character data.

## Error Handling

Search:

- Empty query shows no suggestions.
- No matches shows a small empty state in the suggestion panel.
- Missing avatar uses existing fallback initial behavior.

ICS:

- Skip records without valid `MM-DD` birthdays.
- If no valid birthdays are available, show a non-blocking message instead of downloading an empty file.
- Escape commas, semicolons, backslashes, and newlines according to ICS text rules.

## Testing

Automated tests:

- Search matches Chinese name, English name, birthday, game, and metadata fields.
- Search ranks exact/prefix name matches above metadata-only matches.
- Search limits candidates.
- ICS generation creates valid `VCALENDAR`, `VEVENT`, `UID`, `DTSTART`, `SUMMARY`, and yearly `RRULE` lines.
- ICS escaping handles commas, semicolons, backslashes, and newlines.
- Invalid/missing birthdays are skipped.

Browser verification:

- Desktop search does not crowd the header or conflict with the filter sidebar.
- Mobile search suggestions fit the viewport and do not overlap the bottom sheet.
- Candidate click opens the existing detail modal.
- ICS download produces a file with expected events.

## Deferred Work

- Local favorites stored in `localStorage`.
- Favorite-only search or reminder export.
- Export/import of favorites.
- Email reminders through a serverless scheduler and email provider.
- Web Push reminders through service worker plus backend subscription storage.
- Cross-device storage is intentionally not planned. Revisit only if the project later adopts backend identity and database architecture.
