export declare class ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    timestamp: string;
    path?: string;
    constructor(success: boolean, statusCode: number, message: string, data?: T, path?: string);
    static success<T>(data: T, message?: string, statusCode?: number, path?: string): ApiResponse<T>;
    static error<T>(statusCode: number, message: string, data?: T, path?: string): ApiResponse<T>;
}
//# sourceMappingURL=api-response.dto.d.ts.map