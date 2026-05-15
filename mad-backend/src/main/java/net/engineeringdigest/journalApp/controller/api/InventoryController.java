package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.InventoryItem;
import net.engineeringdigest.journalApp.repository.InventoryItemRepository;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class InventoryController {

    @Autowired
    private InventoryItemRepository inventoryRepository;

    @Cacheable("inventory")
    @GetMapping
    public List<InventoryItem> getAllItems() {
        return inventoryRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "inventory", allEntries = true)
    // ✅ M3 FIX: @Valid enables Jakarta Validation on the request body
    public ResponseEntity<InventoryItem> addItem(@Valid @RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryRepository.save(item));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "inventory", allEntries = true)
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @Valid @RequestBody InventoryItem itemDetails) {
        // ✅ E1: Use ResourceNotFoundException
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory Item", id));
        
        item.setName(itemDetails.getName());
        item.setCategory(itemDetails.getCategory());
        item.setUnitOfMeasure(itemDetails.getUnitOfMeasure());
        item.setMinimumStockLevel(itemDetails.getMinimumStockLevel());
        item.setCurrentQuantity(itemDetails.getCurrentQuantity());
        item.setDescription(itemDetails.getDescription());
        if (itemDetails.getProject() != null) item.setProject(itemDetails.getProject());
        if (itemDetails.getVendor() != null) item.setVendor(itemDetails.getVendor());

        return ResponseEntity.ok(inventoryRepository.save(item));
    }

    @GetMapping("/low-stock")
    public List<InventoryItem> getLowStockItems() {
        // Simple logic: current <= minimum
        return inventoryRepository.findAll().stream()
                .filter(item -> item.getCurrentQuantity() <= item.getMinimumStockLevel())
                .toList();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "inventory", allEntries = true)
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        inventoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
