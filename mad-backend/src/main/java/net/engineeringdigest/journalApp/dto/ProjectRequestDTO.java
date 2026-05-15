package net.engineeringdigest.journalApp.dto;

import jakarta.validation.constraints.*;
import net.engineeringdigest.journalApp.model.ProjectStatus;
import java.time.LocalDate;

/**
 * 📦 Component 4: Project Request DTO
 * Java 17 Record for immutable, validated project creation requests.
 */
public record ProjectRequestDTO(
    @NotBlank(message = "Project name is required")
    @Size(max = 150, message = "Project name must not exceed 150 characters")
    String name,

    @NotBlank(message = "Client name is required")
    @Size(max = 100, message = "Client name must not exceed 100 characters")
    String clientName,

    @Size(max = 255, message = "Location address too long")
    String location,

    @NotNull(message = "City assignment is required")
    Long cityId,

    Long supervisorId, // Optional: assigned later by admin or at creation

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in the past")
    LocalDate startDate,

    @Min(value = 0, message = "Labour count cannot be negative")
    @Max(value = 500, message = "Labour count exceeds site capacity limits")
    int labourCount,

    @NotNull(message = "Project status is required")
    ProjectStatus status
) {}
