import { DateRangePicker } from "../ui/date-range-picker";
import dayjs from "dayjs";
import { Button } from "../ui/button";

export default function DateRangeFilter({
  customDateRange,
  setDateFilter,
  setCustomDateRange,
}: any) {
  return (
    <div>
      <h1 className="text-xl font-semibold">Select a Date Range</h1>
      <DateRangePicker value={customDateRange} onSelect={setCustomDateRange} />
      <div className="text-sm text-gray-600">
        {customDateRange?.from && customDateRange?.to ? (
          <span>
            {dayjs(customDateRange.from).format("MMM D, YYYY")} –{" "}
            {dayjs(customDateRange.to).format("MMM D, YYYY")}
          </span>
        ) : (
          <span>No range selected</span>
        )}
        {(customDateRange?.from || customDateRange?.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCustomDateRange(undefined);
              setDateFilter("all");
            }}
          >
            Clear Range
          </Button>
        )}
      </div>
    </div>
  );
}
