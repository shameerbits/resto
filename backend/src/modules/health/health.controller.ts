import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiResponse } from '@common/dto/api-response.dto';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    const status = this.healthService.getStatus();
    return ApiResponse.success(status, 'Service is healthy', 200);
  }
}
