import { format } from "date-fns";
import React from "react";

const DatePickerInput = ({ date, setDate }) => {
  return (
    <div>
      <input
        className="bg-white text-sm border w-full p-2 rounded-md text-opacity-70"
        type="date"
        value={date}
        onChange={(e) => {
          const formattedDate = format(e.target.value, "yyyy-MM-dd");
          setDate(formattedDate);
        }}
      />
    </div>
  );
};

export default DatePickerInput;
