package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.Labour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabourRepository extends JpaRepository<Labour, Long> {
    // Find all active workers for a specific project
    List<Labour> findByProjectIdAndIsActiveTrue(Long projectId);

    // Optional: Find by Type (e.g. "Get all Masons")
    List<Labour> findByProjectIdAndType(Long projectId, String type);

    long countByProject(net.engineeringdigest.journalApp.model.Project project);
}
