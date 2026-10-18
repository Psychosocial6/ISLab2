package org.backend.lab2.persons.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.backend.lab2.coordinates.dto.CoordinatesRequest;
import org.backend.lab2.enums.Color;
import org.backend.lab2.enums.Country;
import org.backend.lab2.locations.dto.LocationRequest;

import java.time.ZonedDateTime;

public record PersonRequest(
        @NotBlank(message = "name required")
        String name,
        @Valid
        CoordinatesRequest coordinates,
        @Positive(message = "coordinates id must be positive")
        Long coordinatesId,
        @NotNull(message = "eye color required")
        Color eyeColor,
        Color hairColor,
        @Valid
        LocationRequest location,
        @Positive(message = "location id must be positive")
        Long locationId,
        @NotNull(message = "height required")
        @Positive(message = "height must be positive")
        Double height,
        ZonedDateTime birthday,
        @NotNull(message = "weight required")
        @Positive(message = "weight must be positive")
        Double weight,
        @NotNull(message = "nationality required")
        Country nationality
) {
    @AssertTrue
    public boolean isCoordinatesValid() {
        return (coordinatesId != null) ^ (coordinates != null);
    }

    @AssertTrue
    public boolean isLocationValid() {
        return !(location != null && locationId != null);
    }
}
