import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@common/logger/logger.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private logger;
    constructor(logger: LoggerService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
