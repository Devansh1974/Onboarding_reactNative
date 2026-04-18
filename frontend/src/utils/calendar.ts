/**
 * Calendar utility - generates Google Calendar event URLs and .ics deep links
 * Works on web + native without any native modules.
 */

// Parse "3:00 PM" -> { hours: 15, minutes: 0 }
const parseTime12h = (time12: string): { hours: number; minutes: number } => {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { hours: 12, minutes: 0 };
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = /PM/i.test(match[3]);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return { hours, minutes };
};

// Combine "2025-06-10" + "3:00 PM" -> Date object in local time
export const buildSessionDate = (dateStr: string, time12: string): Date => {
  const { hours, minutes } = parseTime12h(time12);
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, hours, minutes, 0, 0);
};

// Convert Date to YYYYMMDDTHHMMSSZ (UTC) for Google Calendar
const toGoogleDate = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
};

export interface CalendarEventParams {
  title: string;
  details: string;
  location?: string;
  startDate: Date;
  durationMinutes: number;
}

/**
 * Build a Google Calendar "create event" deep link.
 * Works in browsers, iOS Safari, and Android Chrome (opens Google Calendar app if installed).
 */
export const buildGoogleCalendarUrl = ({
  title,
  details,
  location,
  startDate,
  durationMinutes,
}: CalendarEventParams): string => {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGoogleDate(startDate)}/${toGoogleDate(endDate)}`,
    details,
    ...(location ? { location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
