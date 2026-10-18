package org.backend.lab2.exceptions.custom;

public class CoordinatesNotFoundException extends NotFoundException {
    public CoordinatesNotFoundException(Long id) {
        super(String.format("Coordinates id=%s not found", id));
    }
}
