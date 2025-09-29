import { APIRequestContext } from '@playwright/test';
import { CropMonitoringRoutes } from './routes';

export class CropMonitoringService {
  constructor(private readonly context: APIRequestContext) {
    // Service object constructor - context is used in methods
  }

  /** POST /ticket/crop-monitoring */
  async createTicket(payload: unknown) {
    return this.context.post(CropMonitoringRoutes.createTicket, { data: payload });
  }

  /** PUT /user/crop-monitoring-participations */
  async updateParticipationStatus(input: {
    document: string;
    harvestCodesParticipations: string[];
    currentStatus: string;
  }) {
    return this.context.put(CropMonitoringRoutes.updateParticipation, { data: input });
  }

  /** GET /user?document=xxx */
  async getUserByDocument(document: string) {
    return this.context.get(`/user?document=${document}&pageSize=1&pageNumber=1`);
  }
}
