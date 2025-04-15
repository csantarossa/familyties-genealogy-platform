export const parseDate = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + "T12:00:00"); // ⬅️ crucial
  }
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
};
