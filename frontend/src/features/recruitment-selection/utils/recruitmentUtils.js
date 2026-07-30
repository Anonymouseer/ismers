import { SLOT_TIMES } from '../data/mockApplications';

export function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function scoreClass(score) {
  return score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
}

export function scoreColor(score) {
  return score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
}

export function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Recruiter assignment lookup by client — placeholder business rule until
// this is driven by real Client/JobOrder records from the backend.
export function assignedRecruiter(job) {
  const map = {
    'ABC Logistics': 'Karla Reyes',
    'Delta Manufacturing': 'Karla Reyes',
    'Northline BPO': 'Dennis Ocampo',
    'Sunrise Hospitality Group': 'Dennis Ocampo',
  };
  return map[job?.client] || 'Karla Reyes';
}

// Finds the next open interview slot for a recruiter, skipping Sundays and
// any date/time that recruiter already has booked across all applications.
export function findNextAvailableSlot(applications, recruiter, fromDate) {
  const booked = new Set(
    applications
      .filter((x) => x.interview && x.interview.recruiter === recruiter)
      .map((x) => `${x.interview.date}|${x.interview.time}`)
  );
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const day = addDays(fromDate, dayOffset);
    if (day.getDay() === 0) continue; // skip Sundays
    const dateLabel = formatDate(day);
    for (const time of SLOT_TIMES) {
      if (!booked.has(`${dateLabel}|${time}`)) return { date: dateLabel, time };
    }
  }
  return null;
}