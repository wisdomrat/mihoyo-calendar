import test from 'node:test';
import assert from 'node:assert/strict';

import {
  birthdayToIcsDate,
  buildBirthdayIcs,
  escapeIcsText,
  getCharactersWithValidBirthdays,
} from '../src/utils/ics.ts';

const amber = {
  id: 'amber',
  name: 'Amber',
  nameEn: 'Amber',
  game: 'genshin',
  birthday: '08-10',
  element: 'Pyro',
  weapon: 'Bow',
  region: 'Mondstadt',
  source: 'test',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

test('escapeIcsText escapes commas, semicolons, backslashes, and newlines', () => {
  assert.equal(escapeIcsText('A,B;C\\D\nE'), 'A\\,B\\;C\\\\D\\nE');
});

test('birthdayToIcsDate returns YYYYMMDD for valid MM-DD birthdays', () => {
  assert.equal(birthdayToIcsDate('08-10', 2026), '20260810');
  assert.equal(birthdayToIcsDate('13-10', 2026), null);
  assert.equal(birthdayToIcsDate('??-??', 2026), null);
});

test('getCharactersWithValidBirthdays skips invalid birthdays', () => {
  const valid = getCharactersWithValidBirthdays([
    amber,
    { ...amber, id: 'bad', birthday: '' },
    { ...amber, id: 'also-bad', birthday: '02-31' },
  ]);

  assert.deepEqual(valid.map(character => character.id), ['amber']);
});

test('buildBirthdayIcs creates yearly all-day birthday events and skips invalid birthdays', () => {
  const ics = buildBirthdayIcs([
    amber,
    { ...amber, id: 'bad', name: 'Bad', birthday: '??-??' },
  ], { year: 2026, productId: '-//Test//Calendar//EN' });

  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /PRODID:-\/\/Test\/\/Calendar\/\/EN\r\n/);
  assert.match(ics, /BEGIN:VEVENT\r\n/);
  assert.match(ics, /UID:amber-birthday@mihoyo-calendar\r\n/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260810\r\n/);
  assert.match(ics, /RRULE:FREQ=YEARLY\r\n/);
  assert.match(ics, /SUMMARY:Amber生日 - genshin\r\n/);
  assert.doesNotMatch(ics, /Bad/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
});
