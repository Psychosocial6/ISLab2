package org.backend.lab2.utils;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.backend.lab2.coordinates.CoordinatesRepository;
import org.backend.lab2.coordinates.dto.CoordinatesRequest;
import org.backend.lab2.locations.LocationRepository;
import org.backend.lab2.locations.dto.LocationRequest;
import org.backend.lab2.persons.dto.PersonRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Component
public class ImportValidator {
    private final Validator validator;
    private final LocationRepository locationRepository;
    private final CoordinatesRepository coordinatesRepository;

    public void validateImport(List<PersonRequest> persons) {
        Set<CoordinatesRequest> coordinates = new HashSet<>();
        Set<LocationRequest> location = new HashSet<>();
        List<String> errors = new ArrayList<>();
        for (PersonRequest personRequest : persons) {
            Set<ConstraintViolation<PersonRequest>> violations = validator.validate(personRequest);
            if (!violations.isEmpty()) {
                for (ConstraintViolation<PersonRequest> violation : violations) {
                    errors.add(
                            String.format(
                                    "Constraint violation: [%s : %s]",
                                    violation.getPropertyPath(),
                                    violation.getMessage()
                            )
                    );
                }
            }
            if (personRequest.coordinatesId() != null) {
                errors.add("Coordinates id forbidden, use field values");
            }
            if (personRequest.locationId() != null) {
                errors.add("Location id forbidden, use field values");
            }
            if (personRequest.coordinates() != null) {
                CoordinatesRequest coords = personRequest.coordinates();
                if (!coordinates.add(personRequest.coordinates())) {
                    errors.add(String.format("Coordinates (%s; %s) already exist in import file",
                            coords.x(), coords.y()));
                }
                if (coordinatesRepository.existsByXAndY(coords.x(), coords.y())) {
                    errors.add(String.format("Coordinates (%s; %s) already exist",
                            coords.x(), coords.y()));
                }
            }
            if (personRequest.location() != null) {
                LocationRequest loc = personRequest.location();
                if (!location.add(loc)) {
                    errors.add(String.format("Location (%s; %s; %s) already exists in import file",
                            loc.x(), loc.y(), loc.z()));
                }
                if (locationRepository.existsByXAndYAndZ(loc.x(), loc.y(), loc.z())) {
                    errors.add(String.format("Location (%s; %s; %s) already exists",
                            loc.x(), loc.y(), loc.z()));
                }
            }
        }
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Invalid import file: " + String.join("\n", errors));
        }
    }
}
