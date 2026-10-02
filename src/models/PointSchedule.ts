export const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
function minute(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim()))
    throw new Error('Usá horarios con formato HH:MM, por ejemplo 09:00-18:00.');
  const [h, m] = value.trim().split(':').map(Number);
  return h * 60 + m;
}
export function parseSchedules(days: string[]) {
  return days.flatMap((text, day) =>
    text.trim()
      ? text.split(',').map((interval) => {
          const parts = interval.trim().split('-');
          if (parts.length !== 2)
            throw new Error(`Revisá los horarios del ${weekdays[day].toLowerCase()}.`);
          const opensMinute = minute(parts[0]);
          let closesMinute = minute(parts[1]);
          if (closesMinute <= opensMinute) closesMinute += 1440;
          return { weekday: day + 1, opensMinute, closesMinute };
        })
      : []
  );
}
export function scheduleText(
  schedules: { weekday: number; opensMinute: number; closesMinute: number }[]
) {
  const time = (m: number) =>
    `${Math.floor((m % 1440) / 60)
      .toString()
      .padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
  return weekdays.map((_, i) =>
    schedules
      .filter((s) => s.weekday === i + 1)
      .sort((a, b) => a.opensMinute - b.opensMinute)
      .map((s) => `${time(s.opensMinute)}-${time(s.closesMinute)}`)
      .join(', ')
  );
}
