package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.SiteUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteUpdateRepository extends JpaRepository<SiteUpdate, Integer> {
    // Fetch top 10 recent updates, ordered by time descending
    List<SiteUpdate> findTop10ByOrderByUpdateTimeDesc();
}