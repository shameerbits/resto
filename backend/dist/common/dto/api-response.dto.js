"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(success, statusCode, message, data, path) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
        this.path = path;
    }
    static success(data, message = 'Success', statusCode = 200, path) {
        return new ApiResponse(true, statusCode, message, data, path);
    }
    static error(statusCode, message, data, path) {
        return new ApiResponse(false, statusCode, message, data, path);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.dto.js.map