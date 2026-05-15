package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.VendorInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VendorInvoiceRepository extends JpaRepository<VendorInvoice, Long> {
    List<VendorInvoice> findByVendorId(Long vendorId);
}
