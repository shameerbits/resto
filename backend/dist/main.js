"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_service_1 = require("./common/logger/logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const loggerService = app.get(logger_service_1.LoggerService);
    const port = configService.get('APP_PORT', 3000);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    app.enableCors({
        origin: configService.get('APP_URL', 'http://localhost:3000'),
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        prefix: 'v',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(loggerService));
    await app.listen(port, '0.0.0.0', () => {
        loggerService.log(`🚀 Server started on http://localhost:${port} [${nodeEnv}]`, 'Bootstrap');
    });
}
bootstrap().catch((err) => {
    console.error('Bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map