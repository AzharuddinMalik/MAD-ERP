package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByCategory(String category);
}
