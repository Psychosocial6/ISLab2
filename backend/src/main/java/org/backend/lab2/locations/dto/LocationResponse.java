package org.backend.lab2.locations.dto;

public record LocationResponse(
        Long id,
        Double x,
        Long y,
        Double z
) {
}
