package org.backend.lab2.coordinates;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CoordinatesRepository extends JpaRepository<CoordinatesEntity, Long> {
    boolean existsByXAndY(Float x, Float y);

    @Query("SELECT c FROM CoordinatesEntity c WHERE c.id NOT IN (SELECT p.coordinates.id FROM PersonEntity p)")
    List<CoordinatesEntity> findAvailableCoordinates();
}
