package net.engineeringdigest.journalApp.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.model.*;
import net.engineeringdigest.journalApp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 🌱 Idempotent Dashboard Seeder.
 * Injects deterministic mock data only if NO projects exist.
 * Active only in 'dev' profile.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DashboardSeedRunner implements CommandLineRunner {

    private final ProjectRepository projectRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final SiteUpdateRepository siteUpdateRepository;
    private final InventoryItemRepository inventoryRepository;
    private final VendorRepository vendorRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Projects & Core Data
        if (projectRepository.count() == 0) {
            log.info("🌱 Seeding deterministic Dashboard data for 'dev' profile...");
            seedCoreData();
        } else {
            log.info("🌱 Core data seeding skipped: Projects already exist.");
        }

        // 2. Inventory Data
        if (inventoryRepository.count() == 0) {
            log.info("🌱 Seeding sample Inventory items...");
            seedInventoryData();
        } else {
            log.info("🌱 Inventory data seeding skipped: Items already exist.");
        }
    }

    private void seedCoreData() {
        // 1. Fetch existing Admin User
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            log.warn("⚠️ Admin user 'admin' not found. Seeding skipped.");
            return;
        }

        // 2. Create Cities
        City delhi = new City();
        delhi.setName("Delhi");
        delhi.setState("Delhi");
        delhi = cityRepository.save(delhi);

        City mumbai = new City();
        mumbai.setName("Mumbai");
        mumbai.setState("Maharashtra");
        mumbai = cityRepository.save(mumbai);

        // 3. Create Projects
        Project p1 = new Project();
        p1.setName("Luxury Villa Site");
        p1.setClientName("John Doe");
        p1.setCity(delhi);
        p1.setSupervisor(admin);
        p1.setStatus(ProjectStatus.RUNNING);
        p1.setStartDate(LocalDate.now().minusMonths(1));
        p1.setLabourCount(12);
        projectRepository.save(p1);

        Project p2 = new Project();
        p2.setName("Commercial Complex");
        p2.setClientName("Acme Corp");
        p2.setCity(mumbai);
        p2.setSupervisor(admin);
        p2.setStatus(ProjectStatus.DELAYED);
        p2.setStartDate(LocalDate.now().minusMonths(2));
        p2.setLabourCount(3);
        projectRepository.save(p2);

        // 4. Create Site Updates
        SiteUpdate u1 = new SiteUpdate();
        u1.setProject(p1);
        u1.setContent("Foundation work completed. Ready for pillar casting.");
        u1.setUpdateTime(LocalDateTime.now().minusHours(2));
        siteUpdateRepository.save(u1);
        
        log.info("✅ Core data seeded successfully.");
    }

    private void seedInventoryData() {
        Vendor v1 = new Vendor();
        v1.setName("Global Building Supplies");
        v1.setContactPerson("Mike Ross");
        v1.setPhone("9876543210");
        v1 = vendorRepository.save(v1);

        // Use any existing project for seeding
        Project p1 = projectRepository.findAll().stream().findFirst().orElse(null);

        InventoryItem i1 = new InventoryItem();
        i1.setName("UltraTech Cement");
        i1.setCategory("MASONRY");
        i1.setUnitOfMeasure("BAGS");
        i1.setCurrentQuantity(150);
        i1.setMinimumStockLevel(50);
        i1.setProject(p1);
        i1.setVendor(v1);
        inventoryRepository.save(i1);

        InventoryItem i2 = new InventoryItem();
        i2.setName("POP (Gypsum)");
        i2.setCategory("FINISHING");
        i2.setUnitOfMeasure("BAGS");
        i2.setCurrentQuantity(15);
        i2.setMinimumStockLevel(20);
        i2.setProject(p1);
        i2.setVendor(v1);
        inventoryRepository.save(i2);
        
        log.info("✅ Inventory data seeded successfully.");
    }
}
