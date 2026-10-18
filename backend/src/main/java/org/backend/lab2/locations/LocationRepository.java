package org.backend.lab2.locations;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<LocationEntity, Long> {
    boolean existsByXAndYAndZ(Double x, Long y, Double z);
}
