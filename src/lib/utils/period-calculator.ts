export function calculatePeriodDates(
  periodType: "daily" | "weekly" | "biweekly" | "monthly",
  referenceDateStr?: string
): { periodStart: string; periodEnd: string; isClosedPeriod: boolean } {
  const refDate = referenceDateStr ? new Date(referenceDateStr + "T00:00:00") : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let start = new Date(refDate);
  let end = new Date(refDate);

  if (periodType === "daily") {
    start = new Date(refDate);
    end = new Date(refDate);
  } else if (periodType === "weekly") {
    // Start of week (Monday)
    const day = refDate.getDay();
    const diffToMonday = refDate.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(refDate.setDate(diffToMonday));
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (periodType === "biweekly") {
    // 14 days period starting from 14 days ago up to refDate
    end = new Date(refDate);
    start = new Date(refDate);
    start.setDate(refDate.getDate() - 13);
  } else if (periodType === "monthly") {
    // Full month
    start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
  }

  const periodStart = start.toISOString().split("T")[0];
  const periodEnd = end.toISOString().split("T")[0];

  // A period is closed if its end date is strictly before today
  const endDateTime = new Date(periodEnd + "T00:00:00");
  const isClosedPeriod = endDateTime < today;

  return { periodStart, periodEnd, isClosedPeriod };
}
