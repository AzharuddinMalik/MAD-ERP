package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByBusinessUnitId(Long businessUnitId);
    List<Branch> findByIsActiveTrue();
}
