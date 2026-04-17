"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        name: process.env.APP_NAME || 'Resto ERP',
        port: parseInt(process.env.APP_PORT || '3000', 10),
        url: process.env.APP_URL || 'http://localhost:3000',
        env: process.env.NODE_ENV || 'development',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRATION || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    database: {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'resto_mvp',
        synchronize: process.env.DB_SYNC === 'true',
        logging: process.env.DB_LOGGING === 'true',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
        poolSize: 10,
        maxQueryExecutionTime: 1000,
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        db: parseInt(process.env.REDIS_DB || '0', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        format: process.env.LOG_FORMAT || 'json',
    },
    features: {
        websocket: process.env.ENABLE_WEBSOCKET === 'true',
        scheduler: process.env.ENABLE_SCHEDULER === 'true',
        sync: process.env.ENABLE_SYNC === 'true',
    },
});
//# sourceMappingURL=configuration.js.map