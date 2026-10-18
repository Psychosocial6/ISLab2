package org.backend.lab2.locations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LocationRepository extends JpaRepository<LocationEntity, Long> {
    boolean existsByXAndYAndZ(Double x, Long y, Double z);

    @Query("SELECT l FROM LocationEntity l WHERE l.id NOT IN (SELECT p.location.id FROM PersonEntity p WHERE p.location IS NOT NULL)")
    List<LocationEntity> findAvailableLocations();
}
