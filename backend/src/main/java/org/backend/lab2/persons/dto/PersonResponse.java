package org.backend.lab2.persons.dto;

import org.backend.lab2.coordinates.dto.CoordinatesResponse;
import org.backend.lab2.enums.Color;
import org.backend.lab2.enums.Country;
import org.backend.lab2.locations.dto.LocationResponse;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

public record PersonResponse(
        Long id,
        String name,
        CoordinatesResponse coordinates,
        LocalDateTime creationDate,
        Color eyeColor,
        Color hairColor,
        LocationResponse location,
        Double height,
        ZonedDateTime birthday,
        Double weight,
        Country nationality
) {
}
