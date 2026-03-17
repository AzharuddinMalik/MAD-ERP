package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.BillOfQuantity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillOfQuantityRepository extends JpaRepository<BillOfQuantity, Long> {
    // Find all BOQ items for a specific project
    List<BillOfQuantity> findByProjectId(Long projectId);
}