package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, Long> {
    List<BusinessUnit> findByIsActiveTrue();
}
