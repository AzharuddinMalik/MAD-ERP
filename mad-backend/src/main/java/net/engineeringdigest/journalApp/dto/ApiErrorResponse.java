package net.engineeringdigest.journalApp.dto;

import java.time.LocalDateTime;

/**
 * ✅ E1: Standardized API error response DTO.
 * All error responses across the application now use this structure
 * for machine-readable error codes and consistent client handling.
 */
public record ApiErrorResponse(
    int status,
    String errorCode,
    String message,
    LocalDateTime timestamp
) {
    public ApiErrorResponse(int status, String errorCode, String message) {
        this(status, errorCode, message, LocalDateTime.now());
    }
}
