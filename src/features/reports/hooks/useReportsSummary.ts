import { useQuery } from "@tanstack/react-query";

import { reportApi } from "../api/report.api";
import type { ReportFilter } from "../types/report.types";

export const reportKeys = {
  all: ["reports"] as const,
  summary: (filter: ReportFilter) => ["reports", "summary", filter] as const,
};

export function useReportSummary(filter: ReportFilter) {
  return useQuery({
    queryKey: reportKeys.summary(filter),
    queryFn: () => reportApi.getSummary(filter),
  });
}
