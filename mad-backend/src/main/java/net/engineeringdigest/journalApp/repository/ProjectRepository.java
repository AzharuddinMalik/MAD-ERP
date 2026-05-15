package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.dto.ProjectListDTO;
import net.engineeringdigest.journalApp.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // ✅ @EntityGraph overrides LAZY for this query only, generating a single optimized JOIN
    @EntityGraph(attributePaths = {"city", "supervisor"})
    Page<ProjectListDTO> findAllProjectedBy(Pageable pageable);

    // 🔥 Find projects assigned to a specific username
    List<Project> findBySupervisor_Username(String username);

    java.util.Optional<ProjectListDTO> findProjectedById(Long id);
    Page<ProjectListDTO> findTopByOrderByStartDateDesc(Pageable pageable);
    long countByStatus(net.engineeringdigest.journalApp.model.ProjectStatus status);

    // ✅ M2 FIX: Targeted count query to replace in-memory filtering
    long countBySupervisor_IdAndStatus(Long supervisorId, net.engineeringdigest.journalApp.model.ProjectStatus status);
}
