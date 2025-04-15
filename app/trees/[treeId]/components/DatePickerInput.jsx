import { formatForBackend } from "@/app/utils/parseDate";

const formatDateForInput = (date) => {
  if (!date || isNaN(date)) return "";
  return formatForBackend(date);
};

const DatePickerInput = ({ date, setDate }) => {
  return (
    <>
      <style jsx>{`
        input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>

      <input
        type="date"
        className="bg-white text-black text-sm border border-gray-300 w-full p-2 rounded-md opacity-90"
        value={formatDateForInput(date)}
        onChange={(e) => {
          const [year, month, day] = e.target.value.split("-").map(Number);
          const newDate = new Date(year, month - 1, day);
          setDate(newDate);
        }}
        onKeyDown={(e) => e.preventDefault()} // prevent typing manually
      />
    </>
  );
};

export default DatePickerInput;
