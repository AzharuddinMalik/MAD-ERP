package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.ProjectInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectInvoiceRepository extends JpaRepository<ProjectInvoice, Long> {
    Optional<ProjectInvoice> findByProjectId(Long projectId);
}
