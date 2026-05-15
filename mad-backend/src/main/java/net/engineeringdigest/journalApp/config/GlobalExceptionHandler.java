package net.engineeringdigest.journalApp.config;
    
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiErrorResponse;
import net.engineeringdigest.journalApp.exception.BusinessRuleException;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.stream.Collectors;

/**
 * 📦 Component 4: Global Exception Handler
 * ✅ E1 UPDATE: Now returns standardized ApiErrorResponse for all error types.
 * Implements zero-leakage policy for internal stack traces.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ─── E1 NEW: Custom Exception Handlers ───────────────────────

    /**
     * 🚩 404 Not Found: ResourceNotFoundException (custom)
     * Replaces RuntimeException("not found") across all controllers.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource Not Found: {} [{}]", ex.getMessage(), ex.getErrorCode());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(404, ex.getErrorCode(), ex.getMessage()));
    }

    /**
     * 🚩 422 Unprocessable Entity: BusinessRuleException (custom)
     * For domain-specific errors like insufficient stock, already finalized, etc.
     */
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessRule(BusinessRuleException ex) {
        log.warn("Business Rule Violation: {} [{}]", ex.getMessage(), ex.getErrorCode());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ApiErrorResponse(422, ex.getErrorCode(), ex.getMessage()));
    }

    // ─── Existing Handlers (Updated to ApiErrorResponse) ─────────

    /**
     * 🚩 400 Bad Request: Validation Errors (MethodArgumentNotValidException)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(" | "));
        
        log.warn("API Validation Failed: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse(400, "ERR_VALIDATION_FAILED", errors));
    }

    /**
     * 🚩 404 Not Found: EntityNotFoundException (JPA)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(404, "ERR_ENTITY_NOT_FOUND", ex.getMessage()));
    }

    /**
     * 🚩 409 Conflict: DataIntegrityViolationException (Sanitized)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleIntegrity(DataIntegrityViolationException ex) {
        log.error("Database Constraint Violation: ", ex);
        // 🔒 Security Hardening: Never leak raw SQL or DB structure
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorResponse(409, "ERR_DATA_CONFLICT",
                        "The operation violates data integrity constraints. Please verify related records."));
    }

    /**
     * 🚩 403 Forbidden: AccessDeniedException
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiErrorResponse(403, "ERR_ACCESS_DENIED",
                        "Insufficient privileges for this operation."));
    }

    /**
     * 🚩 404/400 Mapping Conflict: NoResourceFoundException
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResource(NoResourceFoundException ex) {
        log.error("API Mapping Not Found: {} - Likely shadowed by static handler or missing @RestController", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(404, "ERR_ROUTE_NOT_FOUND",
                        "The requested endpoint does not exist or is misconfigured."));
    }

    /**
     * 🚩 500 DB Schema Conflict: BadSqlGrammarException
     */
    @ExceptionHandler(BadSqlGrammarException.class)
    public ResponseEntity<ApiErrorResponse> handleSqlGrammar(BadSqlGrammarException ex) {
        log.error("Database Schema Conflict (Bad SQL): {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(500, "ERR_DB_SCHEMA",
                        "The application was unable to perform the operation due to a schema mismatch."));
    }

    /**
     * 🚩 500 Internal Server Error: Catch-all
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        log.error("Internal Server Error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(500, "ERR_INTERNAL",
                        "An unexpected error occurred. Please contact support."));
    }
}
