package net.engineeringdigest.journalApp.exception;

import lombok.Getter;

/**
 * ✅ E1: Thrown for domain-specific business rule violations.
 * Examples: insufficient stock, project already finalized, duplicate assignment.
 * Handled by GlobalExceptionHandler → 422 + machine-readable error code.
 */
@Getter
public class BusinessRuleException extends RuntimeException {

    private final String errorCode;

    public BusinessRuleException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    // Convenience factory methods for common cases
    public static BusinessRuleException insufficientStock(String itemName, double requested, double available) {
        return new BusinessRuleException(
            "ERR_INSUFFICIENT_STOCK",
            String.format("Insufficient stock for '%s'. Requested: %.2f, Available: %.2f", itemName, requested, available)
        );
    }

    public static BusinessRuleException alreadyFinalized(Long projectId) {
        return new BusinessRuleException(
            "ERR_ALREADY_FINALIZED",
            "Project " + projectId + " has already been finalized and cannot be modified."
        );
    }

    public static BusinessRuleException unauthorizedProject(String username, Long projectId) {
        return new BusinessRuleException(
            "ERR_UNAUTHORIZED_PROJECT",
            "User '" + username + "' does not have access to project " + projectId
        );
    }
}
