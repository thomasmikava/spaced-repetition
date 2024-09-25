export function formatTime(seconds: number) {
  // Ensure the number is an integer
  const isNegative = seconds < 0;
  seconds = Math.floor(seconds);

  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  let formattedTime = '';
  if (days > 0) {
    formattedTime += `${days}d`;
  }
  if (hours > 0) {
    formattedTime += `${hours}h`;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m`;
  }
  if (seconds > 0 || formattedTime === '') {
    formattedTime += `${seconds}s`;
  }

  return isNegative ? '-' + formattedTime : formattedTime;
}

export function roundTime(seconds: number): number {
  if (seconds < 60) {
    return seconds;
  }
  if (seconds < 60 * 60) {
    // < 1h, round to minutes
    return Math.round(seconds / 60) * 60;
  }
  // round to hours
  return Math.round(seconds / 3600) * 3600;
}
