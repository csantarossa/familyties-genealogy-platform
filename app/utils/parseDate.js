export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  if (dateStr instanceof Date && !isNaN(dateStr)) return dateStr;

  // Parse 'YYYY-MM-DD' to UTC date object
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  // Fallback (assumes ISO string or timestamp)
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? null : parsed;
};
