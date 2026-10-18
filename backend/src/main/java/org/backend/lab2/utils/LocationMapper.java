package org.backend.lab2.utils;

import org.backend.lab2.locations.LocationEntity;
import org.backend.lab2.locations.dto.LocationResponse;
import org.springframework.stereotype.Component;

@Component
public class LocationMapper {

    public LocationResponse fromEntity(LocationEntity locationEntity) {
        if (locationEntity == null) {
            return null;
        }

        return new LocationResponse(
                locationEntity.getId(),
                locationEntity.getX(),
                locationEntity.getY(),
                locationEntity.getZ()
        );
    }
}
