declare const _default: () => {
    app: {
        name: string;
        port: number;
        url: string;
        env: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    database: {
        type: "mysql";
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        synchronize: boolean;
        logging: boolean;
        connectionLimit: number;
        poolSize: number;
        maxQueryExecutionTime: number;
    };
    redis: {
        host: string;
        port: number;
        db: number;
        password: string;
    };
    logging: {
        level: string;
        format: string;
    };
    features: {
        websocket: boolean;
        scheduler: boolean;
        sync: boolean;
    };
};
export default _default;
