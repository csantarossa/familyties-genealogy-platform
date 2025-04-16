import React, { useEffect, useState } from "react";
import { format, parse } from "date-fns";

const DatePickerInput = ({ date, setDate }) => {
  const [internalDate, setInternalDate] = useState("");

  useEffect(() => {
    if (date) {
      let parsed;

      // Try to parse as expected "dd/MM/yyyy" first
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        parsed = parse(date, "dd/MM/yyyy", new Date());
      } else {
        // Fallback: parse other formats using JS Date
        parsed = new Date(date);
      }

      if (!isNaN(parsed)) {
        setInternalDate(format(parsed, "yyyy-MM-dd"));
      } else {
        setInternalDate("");
      }
    } else {
      setInternalDate("");
    }
  }, [date]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInternalDate(value);
    setDate(value || null);
  };
  

  return (
    <div>
      <input
        className="bg-white text-sm border w-full p-2 rounded-md text-opacity-70"
        type="date"
        value={internalDate}
        onChange={handleChange}
      />
    </div>
  );
};

export default DatePickerInput;
