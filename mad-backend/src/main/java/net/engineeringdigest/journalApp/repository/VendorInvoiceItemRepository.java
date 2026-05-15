package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.VendorInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorInvoiceItemRepository extends JpaRepository<VendorInvoiceItem, Long> {
}
