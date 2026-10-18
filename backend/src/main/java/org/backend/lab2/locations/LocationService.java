package org.backend.lab2.locations;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.backend.lab2.locations.dto.LocationResponse;
import org.backend.lab2.utils.LocationMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
public class LocationService {
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public List<LocationResponse> getLocations() {
        return locationRepository.findAvailableLocations()
                .stream()
                .map(locationMapper::fromEntity)
                .toList();
    }
}
