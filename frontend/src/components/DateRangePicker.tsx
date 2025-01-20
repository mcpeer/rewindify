import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: { start: Date | null; end: Date | null }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => onChange({ start: date, end: endDate })}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={new Date()}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholderText="Select start date and time"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => onChange({ start: startDate, end: date })}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          maxDate={new Date()}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholderText="Select end date and time"
        />
      </div>
    </div>
  );
}
