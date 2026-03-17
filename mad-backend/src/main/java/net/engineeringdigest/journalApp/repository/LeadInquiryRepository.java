package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.LeadInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadInquiryRepository extends JpaRepository<LeadInquiry, Long> {

    List<LeadInquiry> findByStatusOrderBySubmittedAtDesc(String status);

    List<LeadInquiry> findAllByOrderBySubmittedAtDesc();

    // Count leads submitted between two timestamps (for "today" widget)
    long countBySubmittedAtBetween(LocalDateTime from, LocalDateTime to);

    // Count leads by status
    long countByStatus(String status);
}

