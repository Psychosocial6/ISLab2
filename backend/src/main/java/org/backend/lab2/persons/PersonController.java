package org.backend.lab2.persons;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.backend.lab2.enums.Color;
import org.backend.lab2.enums.Country;
import org.backend.lab2.imports.ImportService;
import org.backend.lab2.imports.ImportStatus;
import org.backend.lab2.persons.dto.PersonRequest;
import org.backend.lab2.persons.dto.PersonResponse;
import org.backend.lab2.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Validated
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/person")
@RestController
public class PersonController {
    private final PersonService personService;
    private final ImportService importService;

    @GetMapping
    public ResponseEntity<Page<PersonResponse>> getPersons(
            @RequestParam(required = false)
            String name,
            Pageable pageable) {
        log.info("getPersons called");
        Page<PersonResponse> persons = personService.getPersons(pageable, name);
        return ResponseEntity.ok(persons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonResponse> getPersonById(
            @NotNull(message = "person id required")
            @Positive(message = "person id must be positive")
            @PathVariable Long id) {
        log.info("getPersonById called, id={}", id);
        PersonResponse person = personService.getPersonById(id);
        return ResponseEntity.ok(person);
    }

    @PostMapping
    public ResponseEntity<PersonResponse> createPerson(
            @Valid
            @RequestBody PersonRequest personRequest) {
        log.info("createPerson called, personRequest={}", personRequest);
        PersonResponse person = personService.createPerson(personRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(person);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonResponse> updatePerson(
            @NotNull(message = "person id required")
            @Positive(message = "person id must be positive")
            @PathVariable Long id,
            @Valid
            @RequestBody PersonRequest personRequest) {
        log.info("updatePerson called, id={}, personRequest={}", id, personRequest);
        PersonResponse person = personService.updatePerson(id, personRequest);
        return ResponseEntity.ok(person);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(
            @NotNull(message = "person id required")
            @Positive(message = "person id must be positive")
            @PathVariable Long id,
            @NotNull(message = "id to transfer required")
            @Positive(message = "transfer id must be positive")
            @RequestParam Long transferToId) {
        log.info("deletePerson called, id={}, transferToId={}", id, transferToId);
        personService.deletePerson(id, transferToId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete-by-height")
    public ResponseEntity<Void> deleteByHeight(
            @RequestParam(name = "height")
            Double height) {
        log.info("deleteByHeight called, height={}", height);
        personService.deleteByHeight(height);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/avg-height")
    public ResponseEntity<Map<String, Double>> getAverageHeight() {
        log.info("getAverageHeight called");
        Map<String, Double> averageHeight = personService.getAverageHeight();
        return ResponseEntity.ok(averageHeight);
    }

    @GetMapping("/count-nationality-less-than")
    public ResponseEntity<Map<String, Long>> countNationalityLessThan(
            @RequestParam(name = "nationality")
            Country nationality) {
        log.info("countNationalityLessThan called, nationality={}", nationality);
        Map<String, Long> count = personService.countNationalityLessThan(nationality);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count-hair-color")
    public ResponseEntity<Map<String, Long>> countHairColor(@RequestParam(name = "hair-color") Color color) {
        log.info("countHairColor called, color={}", color);
        Map<String, Long> count = personService.countHairColor(color);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/hair-color-percentage")
    public ResponseEntity<Map<String, Double>> getHairColorPercentage(@RequestParam(name = "hair-color") Color color) {
        log.info("getHairColorPercentage called, color={}", color);
        Map<String, Double> percentage = personService.getHairColorPercentage(color);
        return ResponseEntity.ok(percentage);
    }

    @PostMapping(path = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<PersonResponse>> importPersons(
            @RequestParam(name = "file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        log.info("importPersons called");
        try {
            String name = file.getOriginalFilename();
            if (name == null || !name.endsWith(".json")) {
                throw new IllegalArgumentException("Incorrect import file format");
            }
            List<PersonResponse> personResponses = personService.importPersons(file);
            importService.logImport(ImportStatus.SUCCESS, user.getId(), (long) personResponses.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(personResponses);
        } catch (Exception e) {
            importService.logImport(ImportStatus.FAILED, user.getId(), null);
            throw e;
        }
    }
}
