import { api } from "../../../shared/api/axios";

import type {
  ApiResponse,
  ReportFilter,
  ReportSummary,
} from "../types/report.types";

export const reportApi = {
  async getSummary(filter: ReportFilter): Promise<ReportSummary> {
    const response = await api.get<ApiResponse<ReportSummary>>(
      "/reports/summary",
      {
        params: filter,
      },
    );

    return response.data.data;
  },
};
