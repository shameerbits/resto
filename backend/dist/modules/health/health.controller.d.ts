import { HealthService } from './health.service';
import { ApiResponse } from '@common/dto/api-response.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): ApiResponse<{
        status: string;
        timestamp: string;
    }>;
}
