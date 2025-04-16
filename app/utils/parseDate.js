import { format } from "date-fns";

// Converts Date → "YYYY-MM-DD" (for backend)
export const formatForBackend = (date) => {
  if (!date || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Converts Date → "DD MMM YYYY" (for readable display)
export const formatDisplayDate = (value, isDod = false) => {
  if (!value) return isDod ? "Alive" : "Unknown";
  const date = new Date(value);
  return isNaN(date) ? (isDod ? "Alive" : "Unknown") : format(date, "dd MMM yyyy");
};


// Converts string → Date object (supports "YYYY-MM-DD" or ISO string)
export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  if (dateStr instanceof Date && !isNaN(dateStr)) return dateStr;

  // If it's in "YYYY-MM-DD" format
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // Local date (no timezone issues)
  }

  // Fallback for full ISO or other formats
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? null : parsed;
};
