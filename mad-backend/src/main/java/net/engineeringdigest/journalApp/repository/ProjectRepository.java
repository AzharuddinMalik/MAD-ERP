package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // 🔥 NEW: Find projects assigned to a specific username
    List<Project> findBySupervisor_Username(String username);
}

