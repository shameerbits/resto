export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data?: T,
    path?: string,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }

  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    path?: string,
  ): ApiResponse<T> {
    return new ApiResponse(true, statusCode, message, data, path);
  }

  static error<T>(
    statusCode: number,
    message: string,
    data?: T,
    path?: string,
  ): ApiResponse<T> {
    return new ApiResponse(false, statusCode, message, data, path);
  }
}
