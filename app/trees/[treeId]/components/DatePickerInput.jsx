import React from "react";

const DatePickerInput = ({ date, setDate }) => {
  return (
    <div>
      <input
        className="bg-white text-sm border p-2 rounded-md text-opacity-70"
        type="date"
        onChange={(e) => setDate(e.target.value)}
      />
    </div>
  );
};

export default DatePickerInput;
