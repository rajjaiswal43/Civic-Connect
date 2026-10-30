/**
 * Deadline Calculation & Formatting Utilities
 * Computes live, authoritative countdowns from actual ISO/Date deadlines.
 */

export interface DeadlineCountdown {
  label: string;
  isOverdue: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  badgeColor: string;
  badgeBg: string;
}

export function parseDeadline(deadlineStr?: string, deadlineTimestamp?: number): Date | null {
  if (deadlineTimestamp) {
    return new Date(deadlineTimestamp);
  }
  if (!deadlineStr) return null;

  // Handle standard date parsing
  const d = new Date(deadlineStr);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Handle custom format e.g. "18 Aug 2026, 06:00 PM"
  try {
    const parts = deadlineStr.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})(?:,\s+(\d{1,2}):(\d{2})\s*(AM|PM))?/i);
    if (parts) {
      const day = parseInt(parts[1], 10);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIdx = monthNames.indexOf(parts[2].toLowerCase().slice(0, 3));
      const year = parseInt(parts[3], 10);
      let hours = parts[4] ? parseInt(parts[4], 10) : 18;
      const minutes = parts[5] ? parseInt(parts[5], 10) : 0;
      const meridiem = parts[6] ? parts[6].toUpperCase() : 'PM';

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      if (monthIdx !== -1) {
        return new Date(year, monthIdx, day, hours, minutes);
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom deadline:', deadlineStr);
  }

  return null;
}

export function getDeadlineCountdown(
  deadlineStr?: string,
  deadlineTimestamp?: number,
  now: Date = new Date()
): DeadlineCountdown {
  const target = parseDeadline(deadlineStr, deadlineTimestamp);

  if (!target) {
    return {
      label: 'No Deadline Set',
      isOverdue: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      badgeColor: '#64748b',
      badgeBg: '#f1f5f9'
    };
  }

  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    const overdueHours = Math.abs(diffHours);
    const label = overdueDays >= 1 
      ? `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}` 
      : `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`;

    return {
      label,
      isOverdue: true,
      daysRemaining: -overdueDays,
      hoursRemaining: -overdueHours,
      badgeColor: '#b91c1c',
      badgeBg: '#fee2e2'
    };
  }

  if (diffHours < 24) {
    if (diffHours <= 1) {
      return {
        label: 'Due within an hour',
        isOverdue: false,
        daysRemaining: 0,
        hoursRemaining: diffHours,
        badgeColor: '#c2410c',
        badgeBg: '#ffedd5'
      };
    }
    return {
      label: 'Due today',
      isOverdue: false,
      daysRemaining: 0,
      hoursRemaining: diffHours,
      badgeColor: '#d97706',
      badgeBg: '#fef3c7'
    };
  }

  if (diffDays === 1) {
    return {
      label: '1 day remaining',
      isOverdue: false,
      daysRemaining: 1,
      hoursRemaining: diffHours,
      badgeColor: '#d97706',
      badgeBg: '#fef3c7'
    };
  }

  return {
    label: `${diffDays} days remaining`,
    isOverdue: false,
    daysRemaining: diffDays,
    hoursRemaining: diffHours,
    badgeColor: '#15803d',
    badgeBg: '#dcfce7'
  };
}

export function formatDeadlineDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

