export const parseDate = (value) => {
  if (!value) return null;

  // Handle raw YYYY-MM-DD (append T12:00:00 to avoid timezone shift)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + "T12:00:00");
  }

  // Already a Date object or ISO string with time
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
};
