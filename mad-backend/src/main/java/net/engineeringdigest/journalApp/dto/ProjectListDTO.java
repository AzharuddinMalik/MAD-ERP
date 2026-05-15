package net.engineeringdigest.journalApp.dto;

import net.engineeringdigest.journalApp.model.ProjectStatus;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDate;

/**
 * 📦 Component 2/4: Project List Projection
 * Returns only necessary fields for the project list view.
 */
public interface ProjectListDTO {
    Long getId();
    
    // Maps entity 'name' to frontend expectation 'projectName'
    @Value("#{target.name}") 
    String getProjectName();
    
    String getClientName();
    String getLocation();
    Integer getLabourCount();
    LocalDate getStartDate();
    ProjectStatus getStatus();
    
    // Nested projection for city.name
    CityProjection getCity();

    // Nested projection for supervisor.name (if frontend needs it)
    SupervisorProjection getSupervisor();

    interface CityProjection {
        Long getId();
        String getName();
    }

    interface SupervisorProjection {
        Long getId();
        String getFullName();
    }
}
