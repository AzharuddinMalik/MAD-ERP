package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findByName(String name);
}