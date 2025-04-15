// app/components/DatePickerInput.jsx
const formatDateForInput = (date) => {
  if (!date || isNaN(date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DatePickerInput = ({ date, setDate }) => {
  return (
    <input
      type="date"
      className="bg-white text-sm border w-full p-2 rounded-md text-opacity-70"
      value={formatDateForInput(date)}
      onChange={(e) => {
        const [year, month, day] = e.target.value.split("-").map(Number);
        const newDate = new Date(year, month - 1, day); // local time
        setDate(newDate);
      }}
    />
  );
};

export default DatePickerInput;
