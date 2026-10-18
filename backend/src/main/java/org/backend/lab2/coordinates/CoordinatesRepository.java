package org.backend.lab2.coordinates;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CoordinatesRepository extends JpaRepository<CoordinatesEntity, Long> {
    boolean existsByXAndY(Float x, Float y);
}
