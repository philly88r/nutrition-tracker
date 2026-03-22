// Returns today's date string (YYYY-MM-DD) in US Central Time
export const getCentralDate = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

// Returns a Date object set to noon CT today (safe for date-fns month/day helpers)
export const getCentralDateObject = () =>
  new Date(getCentralDate() + 'T12:00:00');
