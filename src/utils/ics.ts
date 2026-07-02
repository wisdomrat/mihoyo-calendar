import type { Character } from '../types';

export interface BirthdayIcsOptions {
  year?: number;
  productId?: string;
}

const DEFAULT_PRODUCT_ID = '-//MiHoYo Calendar//Birthday Calendar//EN';
const ICS_DOMAIN = 'mihoyo-calendar';

export function escapeIcsText(value: string | undefined): string {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function isValidMonthDay(month: number, day: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export function birthdayToIcsDate(birthday: string | undefined, year = new Date().getFullYear()): string | null {
  const match = String(birthday || '').match(/^(\d{2})-(\d{2})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (!isValidMonthDay(month, day)) return null;

  return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

export function getCharactersWithValidBirthdays(characters: Character[]): Character[] {
  return characters.filter(character => birthdayToIcsDate(character.birthday) !== null);
}

function eventDescription(character: Character): string {
  return [
    character.nameEn ? `英文名： ${character.nameEn}` : '',
    character.element ? `元素/属性： ${character.element}` : '',
    character.weapon ? `武器/命途/特性： ${character.weapon}` : '',
    character.region ? `地区/阵营： ${character.region}` : '',
  ].filter(Boolean).join('\\n');
}

function buildEvent(character: Character, year: number): string[] | null {
  const startDate = birthdayToIcsDate(character.birthday, year);
  if (!startDate) return null;

  const summary = `${character.name}生日 - ${character.game}`;
  return [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(character.id)}-birthday@${ICS_DOMAIN}`,
    `DTSTAMP:${year}0101T000000Z`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(eventDescription(character))}`,
    'RRULE:FREQ=YEARLY',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ];
}

export function buildBirthdayIcs(characters: Character[], options: BirthdayIcsOptions = {}): string {
  const year = options.year ?? new Date().getFullYear();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${options.productId ?? DEFAULT_PRODUCT_ID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const character of characters) {
    const event = buildEvent(character, year);
    if (event) lines.push(...event);
  }

  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}
