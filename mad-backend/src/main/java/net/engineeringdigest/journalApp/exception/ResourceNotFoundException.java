package net.engineeringdigest.journalApp.exception;

import lombok.Getter;

/**
 * ✅ E1: Thrown when a requested entity (Project, User, Vendor, etc.) is not found.
 * Automatically handled by GlobalExceptionHandler → 404 + machine-readable error code.
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {

    private final String errorCode;

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with ID: " + id);
        this.errorCode = "ERR_" + resource.toUpperCase().replace(" ", "_") + "_NOT_FOUND";
    }

    public ResourceNotFoundException(String resource, String identifier) {
        super(resource + " not found: " + identifier);
        this.errorCode = "ERR_" + resource.toUpperCase().replace(" ", "_") + "_NOT_FOUND";
    }
}
