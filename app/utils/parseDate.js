export const parseDate = (d) => {
    if (!d || typeof d !== "string") return null;
    const [day, month, year] = d.split("/");
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; // -> YYYY-MM-DD
  };
  