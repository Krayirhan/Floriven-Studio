export type ServiceErrorCode = "NETWORK" | "TIMEOUT" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "UNKNOWN";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  readonly status: number | undefined;

  constructor(code: ServiceErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
  }
}

export function mapServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ServiceError("TIMEOUT", "İstek zaman aşımına uğradı.");
  }
  if (error instanceof TypeError) {
    return new ServiceError("NETWORK", "Sunucuya bağlanılamadı.");
  }
  return new ServiceError("UNKNOWN", "Beklenmeyen bir servis hatası oluştu.");
}
