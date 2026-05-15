package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.MaterialRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRequisitionRepository extends JpaRepository<MaterialRequisition, Long> {
    List<MaterialRequisition> findByRequesterId(Long requesterId);
    List<MaterialRequisition> findByStatus(String status);
    List<MaterialRequisition> findByVendorId(Long vendorId);
}
