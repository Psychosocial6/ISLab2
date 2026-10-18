package org.backend.lab2.persons;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.backend.lab2.coordinates.CoordinatesEntity;
import org.backend.lab2.coordinates.CoordinatesRepository;
import org.backend.lab2.coordinates.dto.CoordinatesRequest;
import org.backend.lab2.enums.Color;
import org.backend.lab2.enums.Country;
import org.backend.lab2.exceptions.custom.CoordinatesNotFoundException;
import org.backend.lab2.exceptions.custom.LocationNotFoundException;
import org.backend.lab2.exceptions.custom.PersonNotFoundException;
import org.backend.lab2.locations.LocationEntity;
import org.backend.lab2.locations.LocationRepository;
import org.backend.lab2.locations.dto.LocationRequest;
import org.backend.lab2.persons.dto.PersonRequest;
import org.backend.lab2.persons.dto.PersonResponse;
import org.backend.lab2.utils.ImportMapper;
import org.backend.lab2.utils.ImportValidator;
import org.backend.lab2.utils.PersonMapper;
import org.backend.lab2.websocket.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class PersonService {
    private static final String destination = "/topic/persons";
    private final PersonRepository personRepository;
    private final CoordinatesRepository coordinatesRepository;
    private final LocationRepository locationRepository;
    private final PersonMapper personMapper;
    private final ImportMapper importMapper;
    private final ImportValidator importValidator;
    private final SimpMessagingTemplate messagingTemplate;

    public Page<PersonResponse> getPersons(Pageable pageable, String name) {
        if (name == null) {
            return personRepository.findAll(pageable).map(personMapper::fromEntity);
        }
        return personRepository.findByNameContainingIgnoreCase(name, pageable).map(personMapper::fromEntity);

    }

    public PersonResponse getPersonById(Long id) {
        return personRepository.findById(id)
                .map(personMapper::fromEntity)
                .orElseThrow(() -> new PersonNotFoundException(id));
    }

    @Transactional
    public PersonResponse createPerson(PersonRequest personRequest) {
        if (personRepository.existsByName(personRequest.name())) {
            throw new IllegalArgumentException(
                    String.format("Person with name %s already exists", personRequest.name())
            );
        }
        PersonEntity personEntity = new PersonEntity(
                personRequest.name(),
                resolveCoordinates(personRequest),
                personRequest.eyeColor(),
                personRequest.hairColor(),
                resolveLocation(personRequest),
                personRequest.height(),
                personRequest.birthday(),
                personRequest.weight(),
                personRequest.nationality()
        );

        PersonResponse response = personMapper.fromEntity(personRepository.save(personEntity));
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                Event<PersonResponse> message = new Event<>(
                        Event.EventType.CREATE,
                        response.id(),
                        response
                );
                messagingTemplate.convertAndSend(destination, message);
            }
        });
        return response;
    }

    @Transactional
    public PersonResponse updatePerson(Long id, PersonRequest personRequest) {
        PersonEntity personEntity = personRepository.findById(id)
                .orElseThrow(() -> new PersonNotFoundException(id));
        if (personRepository.existsByNameAndIdNot(personRequest.name(), id)) {
            throw new IllegalArgumentException(
                    String.format("Person with name %s already exists", personRequest.name())
            );
        }
        personEntity.setName(personRequest.name());
        if (personRequest.coordinatesId() != null) {
            if (personRepository.existsByCoordinatesIdAndIdNot(personRequest.coordinatesId(), id)) {
                throw new IllegalArgumentException("Coordinates already belong to another person");
            }
            personEntity.setCoordinates(coordinatesRepository.findById(personRequest.coordinatesId())
                    .orElseThrow(() -> new CoordinatesNotFoundException(personRequest.coordinatesId())));
        } else if (personRequest.coordinates() != null) {
            CoordinatesEntity curr = personEntity.getCoordinates();
            CoordinatesRequest next = personRequest.coordinates();

            boolean isChanged = !curr.getX().equals(next.x()) || !curr.getY().equals(next.y());
            if (isChanged && coordinatesRepository.existsByXAndY(next.x(), next.y())) {
                throw new IllegalArgumentException("Coordinates already exist");
            }
            curr.setX(next.x());
            curr.setY(next.y());
            personEntity.setCoordinates(coordinatesRepository.save(curr));
        }
        personEntity.setEyeColor(personRequest.eyeColor());
        personEntity.setHairColor(personRequest.hairColor());
        if (personRequest.locationId() != null) {
            if (personRepository.existsByLocationIdAndIdNot(personRequest.locationId(), id)) {
                throw new IllegalArgumentException("Location already belong to another person");
            }
            personEntity.setLocation(locationRepository.findById(personRequest.locationId())
                    .orElseThrow(() -> new LocationNotFoundException(personRequest.locationId())));
        } else if (personRequest.location() != null) {
            LocationEntity location = personEntity.getLocation();
            LocationRequest loc = personRequest.location();

            if (location != null) {
                boolean isChanged = !location.getX().equals(loc.x())
                        || !location.getY().equals(loc.y())
                        || !location.getZ().equals(loc.z());
                if (isChanged && locationRepository.existsByXAndYAndZ(loc.x(), loc.y(), loc.z())) {
                    throw new IllegalArgumentException("Location already exists");
                }
                location.setX(loc.x());
                location.setY(loc.y());
                location.setZ(loc.z());
                personEntity.setLocation(locationRepository.save(location));
            } else {
                if (locationRepository.existsByXAndYAndZ(loc.x(), loc.y(), loc.z())) {
                    throw new IllegalArgumentException("Location already exists");
                }
                LocationEntity newLoc = new LocationEntity(loc.x(), loc.y(), loc.z());
                personEntity.setLocation(locationRepository.save(newLoc));
            }
        } else {
            personEntity.setLocation(null);
        }
        personEntity.setHeight(personRequest.height());
        personEntity.setBirthday(personRequest.birthday());
        personEntity.setWeight(personRequest.weight());
        personEntity.setNationality(personRequest.nationality());

        PersonResponse response = personMapper.fromEntity(personRepository.save(personEntity));
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                Event<PersonResponse> message = new Event<>(
                        Event.EventType.UPDATE,
                        response.id(),
                        response
                );
                messagingTemplate.convertAndSend(destination, message);
            }
        });

        return response;
    }

    @Transactional
    public void deletePerson(Long id, Long transferToId) {
        if (id.equals(transferToId)) {
            throw new IllegalArgumentException("cannot transfer id to deleted person");
        }
        PersonEntity personEntity = personRepository.findById(id)
                .orElseThrow(() -> new PersonNotFoundException(id));
        PersonEntity transferPersonEntity = personRepository.findById(transferToId)
                .orElseThrow(() -> new PersonNotFoundException(transferToId));
        transferPersonEntity.setCoordinates(personEntity.getCoordinates());
        if (personEntity.getLocation() != null) {
            transferPersonEntity.setLocation(personEntity.getLocation());
        }
        PersonResponse updated = personMapper.fromEntity(personRepository.save(transferPersonEntity));
        Long deletedId = personEntity.getId();
        personRepository.delete(personEntity);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                Event<PersonResponse> messageDelete = new Event<>(
                        Event.EventType.DELETE,
                        deletedId,
                        null
                );
                messagingTemplate.convertAndSend(destination, messageDelete);
                Event<PersonResponse> messageUpdate = new Event<>(
                        Event.EventType.UPDATE,
                        updated.id(),
                        updated
                );
                messagingTemplate.convertAndSend(destination, messageUpdate);
            }
        });
    }

    @Transactional
    public void deleteByHeight(Double height) {
        List<PersonEntity> personEntities = personRepository.findByHeight(height);
        List<Long> deletedIds = personEntities.stream()
                .map(PersonEntity::getId)
                .toList();
        personRepository.deleteAll(personEntities);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                for (Long id : deletedIds) {
                    Event<PersonResponse> message = new Event<>(
                            Event.EventType.DELETE,
                            id,
                            null
                    );
                    messagingTemplate.convertAndSend(destination, message);
                }
            }
        });
    }

    public Map<String, Double> getAverageHeight() {
        Double averageHeight = personRepository.findAll()
                .stream()
                .mapToDouble(PersonEntity::getHeight)
                .average()
                .orElse(0.0);
        return Map.of("average_height", averageHeight);
    }

    public Map<String, Long> countNationalityLessThan(Country nationality) {
        Long count = personRepository.findAll()
                .stream()
                .map(PersonEntity::getNationality)
                .filter(n -> n.compareTo(nationality) < 0)
                .count();
        return Map.of("count", count);
    }

    public Map<String, Long> countHairColor(Color color) {
        Long count = personRepository.findAll()
                .stream()
                .map(PersonEntity::getHairColor)
                .filter(c -> c == color)
                .count();
        return Map.of("count", count);
    }

    public Map<String, Double> getHairColorPercentage(Color color) {
        List<PersonEntity> personEntities = personRepository.findAll();
        if (personEntities.isEmpty()) {
            return Map.of("percentage", 0.0D);
        }
        long count = personEntities
                .stream()
                .filter(c -> c.getHairColor() == color)
                .count();
        double percentage = ((double) count / personEntities.size()) * 100.0D;
        return Map.of("percentage", percentage);
    }

    @Transactional
    public List<PersonResponse> importPersons(MultipartFile file) {
        List<PersonRequest> personRequests = importMapper.parseRequest(file);
        List<PersonResponse> personResponses = new ArrayList<>();
        importValidator.validateImport(personRequests);
        for (PersonRequest personRequest : personRequests) {
            PersonEntity personEntity = new PersonEntity(
                    personRequest.name(),
                    resolveCoordinates(personRequest),
                    personRequest.eyeColor(),
                    personRequest.hairColor(),
                    resolveLocation(personRequest),
                    personRequest.height(),
                    personRequest.birthday(),
                    personRequest.weight(),
                    personRequest.nationality()
            );
            personResponses.add(personMapper.fromEntity(personRepository.save(personEntity)));
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                for (PersonResponse personResponse : personResponses) {
                    Event<PersonResponse> message = new Event<>(
                            Event.EventType.CREATE,
                            personResponse.id(),
                            personResponse
                    );
                    messagingTemplate.convertAndSend(destination, message);
                }
            }
        });
        return personResponses;
    }

    private CoordinatesEntity resolveCoordinates(PersonRequest personRequest) {
        if (personRequest.coordinatesId() != null) {
            if (personRepository.existsByCoordinatesId(personRequest.coordinatesId())) {
                throw new IllegalArgumentException("Coordinates already belong to another person");
            }
            return coordinatesRepository.findById(personRequest.coordinatesId())
                    .orElseThrow(() -> new CoordinatesNotFoundException(personRequest.coordinatesId()));
        }
        CoordinatesRequest coords = personRequest.coordinates();
        if (coordinatesRepository.existsByXAndY(coords.x(), coords.y())) {
            throw new IllegalArgumentException("Coordinates already exist");
        }
        CoordinatesEntity coordinates = new CoordinatesEntity(
                personRequest.coordinates().x(),
                personRequest.coordinates().y()
        );
        return coordinatesRepository.save(coordinates);
    }

    private LocationEntity resolveLocation(PersonRequest personRequest) {
        if (personRequest.locationId() != null) {
            if (personRepository.existsByLocationId(personRequest.locationId())) {
                throw new IllegalArgumentException("Location already belong to another person");
            }
            return locationRepository.findById(personRequest.locationId())
                    .orElseThrow(() -> new LocationNotFoundException(personRequest.locationId()));

        }
        if (personRequest.location() != null) {
            LocationRequest location = personRequest.location();
            if (locationRepository.existsByXAndYAndZ(location.x(), location.y(), location.z())) {
                throw new IllegalArgumentException("Location already exist");
            }
            LocationEntity locationEntity = new LocationEntity(
                    location.x(),
                    location.y(),
                    location.z()
            );
            return locationRepository.save(locationEntity);
        }
        return null;
    }
}
